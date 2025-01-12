const WEBHOOK_URL = process.env.WEBHOOK_URL ?? ''
const MESSAGE_INTERVAL = !isNaN(+process.env.MESSAGE_INTERVAL) ?
  MESSAGE_INTERVAL :
  10 * 1000

const messageQueue = []

function clearQueue() {
  const queueCopy = [...messageQueue]
  // cursed way to clear the array
  messageQueue.length = 0

  if (queueCopy.length === 0) return

  return fetch(WEBHOOK_URL,{
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({
    "content": null,
    "embeds": queueCopy,
    "attachments": []
    })
  }).catch(console.error)
}

function logWebhook({title, description, fields}) {
  if (!WEBHOOK_URL) return
  messageQueue.push({ title, description, fields, "color": 12500628 })
}

setInterval(clearQueue, MESSAGE_INTERVAL)

module.exports = {
  logWebhook
}
