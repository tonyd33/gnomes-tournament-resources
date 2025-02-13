FROM node:22-alpine3.20

WORKDIR /app

RUN apk add --no-cache tini

COPY nest-cli.json tsconfig.json tsconfig.build.json ./

COPY package.json package-lock.json ./
RUN npm i

COPY src src/
RUN npm run build

ENV PORT=6570
EXPOSE 6570/tcp

HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --start-period=30s \
  --start-interval=1s \
  CMD nc -z localhost $PORT

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "/app/dist/main.js"]
