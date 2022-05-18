FROM node:14 


# Copy the nginx configuration file. This sets up the behavior of nginx, most
# importantly, it ensure nginx listens on port 8080. Google App Engine expects
# the runtime to respond to HTTP requests at port 8080.
COPY . .

ENV NODE_ENV production



ENV DATABASE_URL="postgresql://doadmin:3TfPHMUJtuYznpzd@db-postgresql-blr1-07596-do-user-9368613-0.b.db.ondigitalocean.com:25060/defaultdb?sslmode=require"

RUN apt-get update && \
    apt-get -y install netcat && \
    rm -rf /var/lib/apt/lists/* && \
    npm install --global prisma && \
    npm install --global turbo

COPY ./packages/prisma/schema.prisma ./packages/prisma/schema.prisma

RUN yarn 

RUN yarn install --frozen-lockfile

RUN npm install -g turbo

RUN npm install -g prisma

RUN yarn build
COPY scripts scripts

EXPOSE 3000
CMD ["./scripts/start.sh"]