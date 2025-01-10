const { tap, pipe } = require("./util")
const { createClient } = require("redis")

let client
async function getClient() {
  if (client && client.isOpen) return client
  client = await createClient({
    socket: {
      port: process.env.REDIS_PORT ?? 6379,
      host: process.env.REDIS_HOST ?? "localhost",
    },
  }).connect()
  return client
}

async function authorizeRedirect(streamKey) {
  if (typeof streamKey !== 'string') return null;
  return getClient()
    .then((client) => client.get(streamKey))
    .catch(pipe(tap(console.error), () => null))
}

module.exports = {
  authorizeRedirect,
}
