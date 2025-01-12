const { authorizeRedirect } = require('./auth')
const { logWebhook } = require('./webhook')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const PORT = process.env.PORT ?? 3000
const TRAMPOLINE_PREFIX = process.env.TRAMPOLINE_PREFIX ?? 'rtmp://127.0.0.1:1935/trampoline'

const logCallback = () => (req, res, next) => {
  const event = req.body.call ?? 'unknown event'
  const streamName = req.body.name ?? 'unknown stream'
  const addr = req.body.addr ?? 'unknown address'
  const time = new Date().toString()

  console.log(`[${event}]: name: ${streamName}, addr: ${addr}, time: ${time}`)
  logWebhook({
    title: `${event} on ${streamName}`,
    fields: [
      {name: 'event', value: event},
      {name: 'stream name', value: streamName},
      {name: 'address', value: addr},
      {name: 'time', value: time}
    ]
  })
  next()
}

const ok200 = (req, res) => res.status(200).send('ok')

app.use(logCallback())

app.post('/publish/auth', async (req, res) => {
  const streamKey = req.body.name
  const ok = await authorizeRedirect(streamKey).then(x => !!x)
  if (ok) {
    console.log(`Authenticated ${streamKey}`)
    res.status(200).send("ok")
  } else {
    console.warn(`Unauthorized stream attempt for ${streamKey}`)
    return res.status(403).send("Unauthorized")
  }
})

app.post('/publish/auth-redirect', logCallback(), async (req, res) => {
  const streamKey = req.body.name
  const redirect = await authorizeRedirect(streamKey)
  if (redirect) {
    console.log(`Authenticated ${streamKey}, redirecting to ${redirect}`)
    res
      .status(302)
      .set('Location', `${TRAMPOLINE_PREFIX}/${redirect}`)
      .send("ok")
  } else {
    console.warn(`Unauthorized stream attempt for ${streamKey}`)
    res.status(403).send("Unauthorized")
  }
})

app.post('/connect', ok200)
app.post('/publish', ok200)
app.post('/done', ok200)
app.post('/play', ok200)
app.post('/play-done', ok200)
app.post('/publish-done', ok200)
app.post('/record-done', ok200)

app.listen(PORT, () => {
  console.log(`RTMP auth server listening on http://localhost:${PORT}`)
})
