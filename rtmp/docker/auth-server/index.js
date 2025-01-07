const fs = require('fs')
const express = require('express')
const bodyParser = require('body-parser')

const app = express()
app.use(bodyParser.json())
app.use(bodyParser.urlencoded({extended: true}))

const PORT = process.env.PORT ?? 3000
const STREAM_KEYS_FILE = process.env.STREAM_KEYS ?? './stream-keys'

app.post('/auth', (req, res) => {
  const streamKeys = new Set(
    fs
      .readFileSync(STREAM_KEYS_FILE, 'utf8')
      .trimEnd()
      .split('\n')
  )
  const streamKey = req.body.name
  if (streamKeys.has(streamKey)) {
    console.log(`Authenticated ${streamKey}`)
    return res.status(200).send("ok")
  } else {
    console.warn(`Unauthorized stream attempt for ${streamKey}`)
    return res.status(403).send("Unauthorized")
  }
})

app.listen(PORT, () => {
  console.log(`RTMP auth server listening on http://localhost:${PORT}`)
})
