FROM node:22.8.0-alpine3.19

RUN apk add --no-cache tini curl

WORKDIR /app

COPY ./package.json ./package-lock.json ./
RUN npm install

COPY ./next.config.ts \
     ./tailwind.config.ts \
     ./tsconfig.json \
     ./postcss.config.mjs \
     ./
COPY ./lib ./lib
COPY ./public ./public
COPY ./components ./components
COPY ./constants ./constants
COPY ./hooks ./hooks
COPY ./app ./app

RUN npm run build

ENV PORT=6829
EXPOSE 6829/tcp

ENTRYPOINT ["/sbin/tini", "--"]
CMD ["npm", "run", "start"]

