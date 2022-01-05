import React, { useEffect, useState, useRef } from "react";

import { useLocale } from "@lib/hooks/useLocale";
import showToast from "@lib/notification";
import { trpc } from "@lib/trpc";

import { Alert } from "@components/ui/Alert";
import Badge from "@components/ui/Badge";

export default function SAMLConfiguration({
  teamsView,
  teamId,
}: {
  teamsView: boolean;
  teamId: null | undefined | number;
}) {
  const [isSAMLLoginEnabled, setIsSAMLLoginEnabled] = useState(false);
  const [samlConfig, setSAMLConfig] = useState<string | null>(null);

  const query = trpc.useQuery(["viewer.showSAMLView", { teamsView, teamId }]);

  useEffect(() => {
    const data = query.data;
    setIsSAMLLoginEnabled(data?.isSAMLLoginEnabled ?? false);
    setSAMLConfig(data?.provider ?? null);
  }, [query.data]);

  const mutation = trpc.useMutation("viewer.updateSAMLConfig", {
    onSuccess: (data: { provider: string | undefined }) => {
      showToast(t("saml_config_updated_successfully"), "success");
      setHasErrors(false); // dismiss any open errors
      setSAMLConfig(data?.provider ?? null);
      samlConfigRef.current.value = "";
    },
    onError: (err) => {
      setHasErrors(true);
      setErrorMessage(err.message);
      document?.getElementsByTagName("main")[0]?.scrollTo({ top: 0, behavior: "smooth" });
    },
  });

  const samlConfigRef = useRef<HTMLTextAreaElement>() as React.MutableRefObject<HTMLTextAreaElement>;

  const [hasErrors, setHasErrors] = useState(false);
  const [errorMessage, setErrorMessage] = useState("");

  async function updateSAMLConfigHandler(event: React.FormEvent<HTMLElement>) {
    event.preventDefault();

    const rawMetadata = samlConfigRef.current.value;

    mutation.mutate({
      rawMetadata: rawMetadata,
      teamId,
    });
  }

  const { t } = useLocale();
  return (
    <>
      <hr className="mt-8" />

      {isSAMLLoginEnabled ? (
        <>
          <div className="mt-6">
            <h2 className="font-cal text-lg leading-6 font-medium text-gray-900">
              {t("saml_configuration")}
              <Badge className="text-xs ml-2" variant={samlConfig ? "success" : "gray"}>
                {samlConfig ? t("enabled") : t("disabled")}
              </Badge>
              {samlConfig ? (
                <>
                  <Badge className="text-xs ml-2" variant={"success"}>
                    {samlConfig ? samlConfig : ""}
                  </Badge>
                </>
              ) : null}
            </h2>
          </div>

          <p className="mt-1 text-sm text-gray-500">{!samlConfig ? t("saml_not_configured_yet") : ""}</p>

          <p className="mt-1 text-sm text-gray-500">{t("saml_configuration_description")}</p>

          <form className="mt-3 divide-y divide-gray-200 lg:col-span-9" onSubmit={updateSAMLConfigHandler}>
            {hasErrors && <Alert severity="error" title={errorMessage} />}

            <textarea
              ref={samlConfigRef}
              name="saml_config"
              id="saml_config"
              required={true}
              rows={10}
              className="block w-full border-gray-300 rounded-md shadow-sm dark:bg-black dark:text-white dark:border-gray-900 focus:ring-black focus:border-black sm:text-sm"
              placeholder={t("saml_configuration_placeholder")}
            />

            <div className="flex justify-end py-8">
              <button
                type="submit"
                className="ml-2 bg-neutral-900 border border-transparent rounded-sm shadow-sm py-2 px-4 inline-flex justify-center text-sm font-medium text-white hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black">
                {t("save")}
              </button>
            </div>
            <hr className="mt-4" />
          </form>
        </>
      ) : null}
    </>
  );
}
