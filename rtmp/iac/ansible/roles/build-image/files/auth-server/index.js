const { authorizeRedirect } = require('./auth')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const PORT = process.env.PORT ?? 3000
const TRAMPOLINE_PREFIX = process.env.TRAMPOLINE_PREFIX ?? 'rtmp://127.0.0.1:1935/trampoline'

const logCallback = () => (req, res) => {
  console.log(`[${req.body.call}]: name: ${req.body.name}, addr: ${req.body.addr}, time: ${new Date()}`)
  res.status(200).send("ok")
}

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

app.post('/publish/auth-redirect', async (req, res) => {
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

app.post('/connect', logCallback())
app.post('/publish', logCallback())
app.post('/done', logCallback())
app.post('/play', logCallback())
app.post('/play-done', logCallback())
app.post('/publish-done', logCallback())
app.post('/record-done', logCallback())

app.listen(PORT, () => {
  console.log(`RTMP auth server listening on http://localhost:${PORT}`)
})
