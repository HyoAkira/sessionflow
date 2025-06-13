// SocketService.ts
import { Server, Socket } from "socket.io";

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
    });
  }
}

export default SocketService;
