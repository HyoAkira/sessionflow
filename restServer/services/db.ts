import Session, { TSession } from "../schemas/schema.sessions";

export default class DBService {
  static async sendClientData(data: TSession) {
    try {
      const session = await Session.findOneAndUpdate(
        {
          sessionID: data.sessionID,
        },
        data,
        { upsert: true }
      );

      return {
        message: "Client data saved successfully",
        error: false,
      };
    } catch (error) {
      console.error("Error saving client data:", error);
      return {
        message: "Failed to save client data",
        error: true,
      };
    }
  }

  static async getAllSessions() {
    try {
      const sessions = await Session.find({});
      return {
        message: "Sessions retrieved successfully",
        data: sessions,
        error: false,
      };
    } catch (error) {
      console.error("Error retrieving sessions:", error);
      return {
        message: "Failed to retrieve sessions",
        data: [],
        error: true,
      };
    }
  }
}
