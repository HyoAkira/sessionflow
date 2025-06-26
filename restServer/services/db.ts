import FormModel, { TFormModel } from "../schemas/form.schema";
import PageModel, { TPage } from "../schemas/page.schema";
import Session, { TSession } from "../schemas/sessions.schema";
import Site, { TSite } from "../schemas/site.schema";
import User, { TUser } from "../schemas/user.schema";
import bcryptService from "./bcrypt";

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
        code: 500,
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
        code: 500,
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
        code: 500,
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
          code: 404,
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
        code: 500,
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
        code: 500,
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
        code: 500,
      };
    }
  }

  static async userCreate(data: TUser) {
    try {
      data.password = await bcryptService.hashPassword(data.password);

      if (data.userID) {
        await User.findOneAndUpdate({ userID: data.userID }, data);
      } else {
        await User.create(data);
      }

      return {
        message: "User created successfully",

        error: false,
      };
    } catch (error) {
      console.error("Error creating user:", error);
      if (error.code === 11000) {
        return {
          message: "User already exists",
          data: null,
          error: true,
          statusCode: 409, // Conflict
        };
      }
      return {
        message: "Failed to create user",
        data: null,
        error: true,
      };
    }
  }

  static async userGetById(data: Partial<TUser>) {
    try {
      const user = await User.findOne({ userID: data.userID });
      if (user) {
        return {
          message: "User retrieved successfully",
          data: {
            userID: user.userID,
            firstName: user.firstName,
            lastName: user.lastName,
            email: user.email,
            password: undefined,
            __v: undefined,
            _id: undefined,
          },
          error: false,
        };
      } else {
        return {
          message: "User not found",
          data: null,
          error: true,
          statusCode: 404,
        };
      }
    } catch (error) {
      console.error("Error retrieving user:", error);
      return {
        message: "Failed to retrieve user",
        data: null,
        error: true,
      };
    }
  }

  static async userGet(data: Partial<TUser>) {
    try {
      const user = await User.findOne({
        email: data.email,
      });
      if (user) {
        const passwordMatch = await bcryptService.comparePassword(
          data.password!,
          user.password
        );

        if (passwordMatch) {
          return {
            message: "Users retrieved successfully",
            // data: user,
            data: {
              userID: user.userID,
            },
            error: false,
          };
        } else {
          return {
            message: "Invalid email or password",
            data: null,
            error: true,
            statusCode: 401,
          };
        }
      } else {
        return {
          message: "User not found",
          data: null,
          error: true,
          statusCode: 404,
        };
      }
    } catch (error) {
      console.error("Error retrieving user:", error);
      return {
        message: "Failed to retrieve user",
        error: true,
      };
    }
  }

  static async userDelete(data: TUser) {
    try {
      const user = await User.findOne({
        email: data.email,
      });
      if (!user) {
        return {
          message: "User not found",
          data: null,
          error: true,
          statusCode: 404,
        };
      } else {
        const passwordMatch = await bcryptService.comparePassword(
          data.password,
          user.password
        );
        if (!passwordMatch) {
          return {
            message: "Invalid email or password",
            data: null,
            error: true,
            statusCode: 401,
          };
        } else {
          // await user.deleteOne();
          return {
            message: "User deleted successfully",
            data: null,
            error: false,
          };
        }
      }
    } catch (error) {
      console.error("Error deleting user:", error);
      return {
        message: "Failed to delete user",
        data: null,
        error: true,
      };
    }
  }

  static async getAllSites(data: Partial<TSite>) {
    try {
      const sites = await Site.find(
        { userID: data.userID },
        { __v: 0, _id: 0 }
      );
      return {
        message: "Sites retrieved successfully",
        data: sites,
        error: false,
      };
    } catch (error) {
      console.error("Error retrieving sites:", error);
      return {
        message: "Failed to retrieve sites",
        data: null,
        error: true,
      };
    }
  }

  static async siteCreate(data: Partial<TSite>) {
    try {
      const site = await Site.findOne({ siteID: data.siteID });

      if (site && site.userID !== data.userID) {
        return {
          message: "Site already exists for another user",
          data: null,
          error: true,
          statusCode: 409, // Conflict
        };
      }

      if (site && site.userID === data.userID) {
        await Site.findOneAndUpdate({ siteID: data.siteID }, { ...data });
        return {
          message: "Site updated successfully",
          data: null,
          error: false,
        };
      }

      // Eğer site yoksa yeni site oluştur
      await Site.create(data);
      return {
        message: "Site created successfully",
        data: null,
        error: false,
      };
    } catch (error) {
      console.error("Error creating site:", error);
      if (error.code === 11000) {
        return {
          message: "Site url already exists",
          data: null,
          error: true,
          statusCode: 409, // Conflict
        };
      }
      return {
        message: "Failed to create site",
        data: null,
        error: true,
      };
    }
  }

  static async siteGet(data: TSite) {
    try {
      const site = await Site.findOne({
        siteID: data.siteID,
      });
      if (site && site.userID === data.userID) {
        return {
          message: "Site retrieved successfully",
          data: site,
          error: false,
        };
      } else {
        return {
          message: "Site not found",
          data: null,
          error: true,
          statusCode: 404,
        };
      }
    } catch (error) {
      console.error("Error retrieving site:", error);
      return {
        message: "Failed to retrieve site",
        data: null,
        error: true,
      };
    }
  }
  static async siteDelete(data: TSite) {
    try {
      const site = await Site.findOne({
        siteID: data.siteID,
      });
      if (!site) {
        return {
          message: "Site not found",
          data: null,
          error: true,
          statusCode: 404,
        };
      } else if (site.userID !== data.userID) {
        return {
          message: "You do not have permission to delete this site",
          data: null,
          error: true,
          statusCode: 403,
        };
      } else {
        await site.deleteOne();
        return {
          message: "Site deleted successfully",
          data: null,
          error: false,
        };
      }
    } catch (error) {
      console.error("Error deleting site:", error);
      return {
        message: "Failed to delete site",
        data: null,
        error: true,
      };
    }
  }
}
