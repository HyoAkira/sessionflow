import express from "express";
import router from "./router";
import cors from "cors";
import { connect, model, Schema } from "mongoose";
import config from "./config.json";
const PORT = process.env.PORT || config.server.port || 3000;
import { Server } from "socket.io";
import { createServer } from "node:http";
import SocketService from "./services/socket";
import jwt from "jsonwebtoken";
import securityModel from "./schemas/security.schema";
import errorHandlerMiddleware from "./middlewares/errorHandler.middleware";
import morgan from "morgan";
const app = express();
const server = createServer(app);
const io = new Server(server, {
  cors: config.socket.cors,
});

// io.use((socket, next) => {
//   const token = socket.handshake.auth.token;

//   if (!token) {
//     return next(new Error("Authentication error"));
//   }

//   try {
//     const decoded = jwt.verify(
//       token,
//       process.env.JWT_SECRET || config.secret || "secret"
//     );
//     //@ts-ignore
//     socket.user = decoded;
//     next();
//   } catch (err) {
//     return next(new Error("Invalid token"));
//   }
// });

const ss = SocketService.getInstance();
ss.setIO(io).eventListener();
//@ts-ignore
app.use(morgan("tiny"));
app.use(cors(config.server.cors));
app.use(express.json());
// app.use(async (req, res, next) => {
//   let ip = req.headers["x-forwarded-for"] || req.ip || req.socket.remoteAddress;
//   //@ts-ignore
//   if (ip && ip.startsWith("::ffff:")) {
//     //@ts-ignore
//     ip = ip.replace("::ffff:", "");
//   }
//   const token = req.headers.authorization?.split(" ")[1];
//   const security = await securityModel.findOne({ ip });
//   console.log("Security check for IP:", ip, "Token:", token);
//   if (!security) {
//     next({
//       code: 404,
//       message: "Security record not found for this IP",
//       error: true,
//     });
//     return;
//   }
//   if (security.token !== token) {
//     next({
//       code: 401,
//       message: "Unauthorized access",
//       error: true,
//     });
//     return;
//   }

//   next();
// });
app.use("/api", router);
app.use(errorHandlerMiddleware);
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
