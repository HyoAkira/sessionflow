import FormModel, { TFormModel } from "../schemas/form.schema";
import PageModel, { TPage } from "../schemas/page.schema";
import Session, { TSession } from "../schemas/sessions.schema";

export default class DBService {
  static async sendFormData(data: TFormModel) {
    try {
      await FormModel.findOneAndUpdate(
        { sessionID: data.sessionID, pageID: data.pageID, formID: data.formID },
        { ...data },
        { upsert: true }
      );
      return {
        message: "Form data saved successfully",
        error: false,
      };
    } catch (error) {
      console.error("Error saving form data:", error);
      return {
        message: "Failed to save form data",
        error: true,
      };
    }
  }
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

  static async getSessionsByRange(
    range?: "daily" | "weekly" | "monthly" | "",
    start?: Date,
    end?: Date
  ) {
    try {
      switch (range) {
        case "daily": {
          const today = new Date(Date.now());
          today.setUTCHours(0, 0, 0, 0);
          const dailySessions = await Session.find({
            createdAt: { $gte: today },
          });
          return {
            message: "Daily sessions retrieved successfully",
            data: dailySessions,
            error: false,
          };
        }
        case "weekly": {
          const today = new Date(Date.now());
          const dayOfWeek = today.getUTCDay();
          const diffToMonday = (dayOfWeek + 6) % 7;
          const monday = new Date(today);
          monday.setUTCDate(today.getUTCDate() - diffToMonday);
          monday.setUTCHours(0, 0, 0, 0);
          const sunday = new Date(monday);
          sunday.setUTCDate(monday.getUTCDate() + 6);
          sunday.setUTCHours(23, 59, 59, 999);
          const weeklySessions = await Session.find({
            createdAt: { $gte: monday, $lte: sunday },
          });
          return {
            message: "Weekly sessions retrieved successfully",
            data: weeklySessions,
            error: false,
          };
        }
        case "monthly": {
          const today = new Date(Date.now());
          const year = today.getUTCFullYear();
          const month = today.getUTCMonth();
          const start = new Date(Date.UTC(year, month, 1, 0, 0, 0, 0));
          const end = new Date(Date.UTC(year, month + 1, 0, 23, 59, 59, 999));
          const monthlySessions = await Session.find({
            createdAt: { $gte: start, $lte: end },
          });
          return {
            message: "Monthly sessions retrieved successfully",
            data: monthlySessions,
            error: false,
          };
        }
        default: {
          if (start && end) {
            start.setUTCHours(0, 0, 0, 0);
            end.setUTCHours(23, 59, 59, 999);
            const sessionsInRange = await Session.find({
              createdAt: { $gte: start, $lte: end },
            });
            return {
              message: "Sessions in range retrieved successfully",
              data: sessionsInRange,
              error: false,
            };
          } else {
            return {
              message: "No range specified",
              statusCode: 400,
              error: true,
            };
          }
        }
      }
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
