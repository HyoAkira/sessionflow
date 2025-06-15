// SocketService.ts
import { Server, Socket } from "socket.io";
import DBService from "./db";

class SocketService {
  private static instance: SocketService;
  private io: Server;
  private liveUserCount = 0;
  public static liveUserCount = 0;
  private constructor() {}

  public static getInstance(): SocketService {
    if (!SocketService.instance) {
      SocketService.instance = new SocketService();
    }
    return SocketService.instance;
  }

  public setIO(io: Server): this {
    this.io = io;

    // Timer burada başlatılır
    setInterval(() => {
      SocketService.liveUserCount = this.liveUserCount;
      this.io.emit("liveUserCount", this.liveUserCount);
    }, 5);

    return this;
  }

  public eventListener(): void {
    if (!this.io) {
      throw new Error("Socket IO instance not set. Use setIO() first.");
    }

    this.io.on("connection", (socket: Socket) => {
      this.liveUserCount++;
      console.info(`New connection: ${socket.id}`);
      this.io.emit("liveUserCount", this.liveUserCount);

      socket.on("disconnect", () => {
        this.liveUserCount--;
        console.info(`Disconnected: ${socket.id}`);
        this.io.emit("liveUserCount", this.liveUserCount);
      });

      socket.on("userData", async (data, callback) => {
        if (!data || typeof data !== "object") {
          return callback({ error: true, message: "Invalid data format" });
        }
        const req = await DBService.sendClientData(data);
        callback({
          error: req.error,
          message: req.message,
        });
      });

      socket.on("pageData", async (data, callback) => {
        if (!data || typeof data !== "object") {
          return callback({ error: true, message: "Invalid data format" });
        }
        const req = await DBService.sendPageData(data);
        callback({
          error: req.error,
          message: req.message,
        });
      });

      socket.on("formData", async (data, cb) => {
        if (!data || typeof data !== "object") {
          return cb({ error: true, message: "Invalid data format" });
        }
        const req = await DBService.sendFormData(data);
        cb({
          error: req.error,
          message: req.message,
        });
      });
      // client fast retrieve -- panel icin rest olsa da olur
      socket.on("getSession", async (sessionID, callback) => {
        if (!sessionID || typeof sessionID !== "string") {
          return callback({ error: true, message: "Invalid session ID" });
        }
        const sessionData = await DBService.getSessionById(sessionID);
        if (sessionData.error) {
          return callback({ error: true, message: sessionData.message });
        }
        callback({
          error: false,
          data: sessionData.data,
        });
      });
    });
  }
}

export default SocketService;
