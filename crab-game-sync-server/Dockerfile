FROM node:22-alpine3.20

RUN apk add --no-cache tini

# Build the server
WORKDIR /app/server

COPY server/package.json server/package-lock.json /app/server/
RUN npm i

COPY server/index.js /app/server/

# Build the client
WORKDIR /app/client

COPY client/package-lock.json client/package.json client/tailwind.config.js /app/client/
RUN npm i

COPY client/src /app/client/src
COPY client/public /app/client/public
RUN npm run build

# This is where we'd make a multi-stage build and remove the unused client files
# but I'm too lazy for that.

WORKDIR /app

EXPOSE 3000

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "server/index.js"]
