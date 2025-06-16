import express from "express";
import router from "./router";
import cors from "cors";
import { connect, model, Schema } from "mongoose";
import config from "./config.json";
const PORT = process.env.PORT || config.server.port || 3000;
import { Server } from "socket.io";
import { createServer } from "node:http";
import SocketService from "./services/socket";
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: config.socket.cors,
});
const ss = SocketService.getInstance();
ss.setIO(io).eventListener();
app.use(cors(config.server.cors));
app.use(express.json());
app.use("/api", router);

async function connectionDB() {
  try {
    await connect(config.database.url, {
      dbName: config.database.dbName,
    });
    console.info("Connected to MongoDB");
    server.listen(PORT, () => {
      console.info(`Server is running on port ${PORT}`);
    });
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connectionDB();
