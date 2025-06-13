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
    });
  }
}

export default SocketService;
