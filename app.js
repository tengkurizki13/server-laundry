const router = require("./routes");
const env = require("dotenv").config();
const express = require("express");
const app = express();
const port = process.env.PORT || 3000;
const server = require("http").createServer(app);
const cors = require("cors");
const {Server} = require("socket.io")
const io = new Server(server)
const {connectToWhatsApp,setSocketIOInstance,isConnected,updateQR} =require("./wa_confic")


app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(router);

setSocketIOInstance(io);

io.on("connection", async (socket) => {
  console.log("masuk", isConnected());
  if (isConnected()) {
      updateQR("connected");
  } else{
      updateQR("qr");
  }
});


connectToWhatsApp()

server.listen(port, () => {
  console.log(`Example app listening on port ${port}`);
});


