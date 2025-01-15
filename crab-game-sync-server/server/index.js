const fs = require('fs');
const express = require("express");
const {createServer} = require("http");
const {join} = require('path');
const {Server} = require("socket.io");
const cors = require("cors");

const PORT = process.env.PORT ?? 3000;
const LOG_FILE = process.env.LOG_FILE ?? '/var/log/crab-game-sync-server.log';

const app = express();
const httpServer = createServer(app);


app.use(cors());
app.use(express.static(join(__dirname, "..", "client", "build")));
app.get("*", (req, res) => {
  res.sendFile(join(__dirname, "..", "client", "build", "index.html"));
});


const io = new Server(httpServer, {
    allowEIO3: true,
    cors: {origin: "*"},
    pingTimeout: 60000,
});

io.on("connection", (socket) => {
  console.log("got connection");

  socket.on("disconnect", (reason, details) => {
    console.log(`user disconnected because: ${reason}. details: ${details?.message}`);
  });

  socket.on("ping", () => {
    console.log("Received ping");
    socket.emit("pong");
  });

  // Forward the state_update event to the client by broadcasting
  socket.on("state_update", (stateStr) => {
    console.log("Received state update");
    try {
      const state = JSON.parse(stateStr)
      console.log(state);

      io.emit("state_update", state);
      const logStr = `${JSON.stringify({state, timestamp: Date.now()})}\n`
      fs.promises.appendFile(LOG_FILE, logStr);
    } catch (err) {
      console.error("While trying to parse state, caught", err)
    }
  });

  // Forward the chat_msg event to the client by broadcasting
  socket.on("chat_msg", (msgObjStr) => {
    console.log("Received chat message");
    try {
      const msgObj = JSON.parse(msgObjStr)
      console.log(msgObj);
      io.emit("chat_msg", msgObj);
    } catch (err) {
      console.error("While trying to parse state, caught", err)
    }
  })

  // Forward the poll_state event to the crab game server by broadcasting
  socket.on("poll_state", () => {
    io.emit("poll_state");
  })

  // Forward the remote_command event to the crab game server by broadcasting
  socket.on("remote_command", (command) => {
    console.log(`Forwarding remote command ${command}`)
    io.emit("remote_command", command);
  });
});

httpServer.listen(PORT, () => {
  console.log(`listening on port ${PORT}`);
});
