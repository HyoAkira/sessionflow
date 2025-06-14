import PageModel, { TPage } from "../schemas/page.schema";
import Session, { TSession } from "../schemas/sessions.schema";

export default class DBService {
  static async sendPageData(data: TPage) {
    // sessionID zaten client tarafinda oturum bitince sifirlanacak.
    // client ve page bagi boyle kalmasi daha iyi
    try {
      const page = await PageModel.findOneAndUpdate(
        { sessionID: data.sessionID, pageID: data.pageID },
        data,
        {
          upsert: true,
        }
      );
      return {
        message: "Page data saved successfully",
        error: false,
      };
    } catch (error) {
      console.error("Error saving page data:", error);
      return {
        message: "Failed to save page data",
        error: true,
      };
    }
  }
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

  static async getSessionById(sessionID: string) {
    try {
      const session = await Session.findOne({ sessionID });
      if (!session) {
        return {
          message: "Session not found",
          data: null,
          error: true,
        };
      }
      return {
        message: "Session retrieved successfully",
        data: session,
        error: false,
      };
    } catch (error) {
      console.error("Error retrieving session:", error);
      return {
        message: "Failed to retrieve session",
        data: null,
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
