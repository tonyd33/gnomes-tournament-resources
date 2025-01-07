FROM node:22-alpine3.20

WORKDIR /app

RUN apk add --no-cache tini

COPY package.json package-lock.json ./
RUN npm i

COPY index.js ./

ENV PORT=6570
EXPOSE 6570/tcp

HEALTHCHECK \
  --interval=30s \
  --timeout=5s \
  --start-period=30s \
  --start-interval=1s \
  CMD nc -z localhost $PORT

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["node", "/app/index.js"]
