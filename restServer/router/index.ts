import { Router } from "express";
import userclientdataMiddleware from "../middlewares/userclientdata.middleware";
import DBService from "../services/db";
import SocketService from "../services/socket";
import { TUser } from "../schemas/user.schema";
import jwt from "jsonwebtoken";
import { exec } from "child_process";
import { resolve } from "path";
import { ml_server } from "../config.json";
const router = Router();
// -- socket yapisina gecti
// router.post("/userclientdata", userclientdataMiddleware, async (req, res) => {
//   // @ts-ignore
//   const clientData = res.locals.clientData;

//   const clientDataServiceResult = await DBService.sendClientData(clientData);
//   if (clientDataServiceResult.error) {
//     res.status(500).json({
//       ...clientDataServiceResult,
//     });
//   }
//   res.status(200).json({
//     ...clientDataServiceResult,
//   });
// });

const siteIDMiddleware = (req, res, next) => {
  const { siteid } = req.query;
  if (!siteid) {
    next({
      message: "Site ID is required",
      error: true,
    });
  } else {
    res.locals.siteid = siteid;
    next();
  }
};

router.get("/liveusers", siteIDMiddleware, (req, res) => {
  const liveUserCount = SocketService.liveUserConn.get(
    res.locals.siteid as string
  );
  res.status(200).json({
    message: "Live user count retrieved successfully",
    error: false,
    data: { liveUserCount },
  });
});

router.get("/sessionreports", siteIDMiddleware, async (req, res, next) => {
  const visitReports = await DBService.getAllSessions(res.locals.siteid);
  if (visitReports.error) {
    next({
      ...visitReports,
    });
  } else {
    res.status(200).json({
      ...visitReports,
    });
  }
});

router.get("/dailysessionsreport", siteIDMiddleware, async (req, res, next) => {
  const dailySessionsReport = await DBService.getSessionsByRange(
    res.locals.siteid,
    "daily"
  );
  if (dailySessionsReport.error) {
    next({
      ...dailySessionsReport,
    });
  } else {
    res.status(200).json({
      ...dailySessionsReport,
    });
  }
});

router.get(
  "/weeklysessionsreport",
  siteIDMiddleware,
  async (req, res, next) => {
    const weeklySessionsReport = await DBService.getSessionsByRange(
      res.locals.siteid,
      "weekly"
    );
    if (weeklySessionsReport.error) {
      next({
        ...weeklySessionsReport,
      });
    } else {
      res.status(200).json({
        ...weeklySessionsReport,
      });
    }
  }
);
router.get(
  "/monthlysessionsreport",
  siteIDMiddleware,
  async (req, res, next) => {
    const monthlySessionsReport = await DBService.getSessionsByRange(
      res.locals.siteid,
      "monthly"
    );
    if (monthlySessionsReport.error) {
      next({
        ...monthlySessionsReport,
      });
    } else {
      res.status(200).json({
        ...monthlySessionsReport,
      });
    }
  }
);
router.get("/rangesessionsreport", siteIDMiddleware, async (req, res, next) => {
  const { start, end } = req.query;
  const startDate = new Date(start as string) || null;
  const endDate = new Date(end as string) || null;
  if (!startDate || !endDate) {
    next({
      message: "Invalid date range provided",
      error: true,
      code: 400,
    });
    return;
  }
  const monthlySessionsReport = await DBService.getSessionsByRange(
    res.locals.siteid,
    "",
    startDate,
    endDate
  );
  if (monthlySessionsReport.error) {
    res.status(500).json({
      ...monthlySessionsReport,
    });
  } else {
    res.status(200).json({
      ...monthlySessionsReport,
    });
  }
});

/**
 * ML SERVER
 */
router.post("/segment2", guard, async (req, res, next) => {
  try {
    const response = await fetch(`${ml_server.serverurl}/segment2`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    next({
      message: "Error proxying to ML server",
      error: true,
      details: error.message,
    });
  }
});

router.post("/segment3", guard, async (req, res, next) => {
  try {
    const response = await fetch(`${ml_server.serverurl}/segment3`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    next({
      message: "Error proxying to ML server",
      error: true,
      details: error.message,
    });
  }
});

router.post("/segment5", guard, async (req, res, next) => {
  try {
    const response = await fetch(`${ml_server.serverurl}/segment5`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    next({
      message: "Error proxying to ML server",
      error: true,
      details: error.message,
    });
  }
});

router.post("/shopping", guard, async (req, res, next) => {
  try {
    const response = await fetch(`${ml_server.serverurl}/shopping`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    next({
      message: "Error proxying to ML server",
      error: true,
      details: error.message,
    });
  }
});

router.post("/depression", guard, async (req, res, next) => {
  try {
    const response = await fetch(`${ml_server.serverurl}/depression`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    next({
      message: "Error proxying to ML server",
      error: true,
      details: error.message,
    });
  }
});

router.post("/modelreload", guard, async (req, res, next) => {
  try {
    const response = await fetch(`${ml_server.serverurl}/modelreload`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(req.body),
    });

    const data = await response.json();
    res.status(response.status).json(data);
  } catch (error) {
    next({
      message: "Error proxying to ML server",
      error: true,
      details: error.message,
    });
  }
});
/**
 * ML SERVER END
 */
router.post("/usercreate", async (req, res, next) => {
  const { email, password, firstName, lastName }: TUser = req.body;
  if (!email || !password || !firstName || !lastName) {
    next({
      message: "All fields are required",
      error: true,
      code: 400,
    });
    return;
  }
  const userCreateResult = await DBService.userCreate(req.body);
  if (userCreateResult.error) {
    next({
      ...userCreateResult,
    });
    return;
  } else {
    res.status(201).json({
      ...userCreateResult,
    });
  }
});

router.post("/userupdate", guard, async (req, res, next) => {
  const { email, password, firstName, lastName }: TUser = req.body;

  const userID = res.locals.user.userID;
  const data = {
    userID,
    email,
    password,
    firstName,
    lastName,
  };

  //@ts-ignore
  const userCreateResult = await DBService.userCreate(data);
  if (userCreateResult.error) {
    next({
      ...userCreateResult,
    });
    return;
  } else {
    res.status(201).json({
      ...userCreateResult,
    });
  }
});
router.post("/userdelete", guard, async (req, res, next) => {
  const userID = res.locals.user.userID;
  const result = await DBService.userDelete(userID);
  if (result.error) {
    next({
      ...result,
    });
    return;
  } else {
    res.status(200).json({
      ...result,
    });
  }
});
router.post("/userlogin", async (req, res, next) => {
  const { email, password } = req.body;
  if (!email || !password) {
    next({
      message: "Email and password are required",
      error: true,
      code: 400,
    });
    return;
  } else {
    const userLoginResult = await DBService.userGet({ email, password });
    if (userLoginResult.error) {
      next({
        ...userLoginResult,
      });
      return;
    } else {
      const token = jwt.sign(
        { userID: userLoginResult.data!.userID },
        process.env.JWT_SECRET || "secret",
        { expiresIn: "7d" }
      );
      res.status(200).json({
        message: "User logged in successfully",
        error: false,
        data: { token },
      });
    }
  }
});

router.get("/auth", async (req, res, next) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    next({
      message: "No token provided",
      code: 401,
      error: true,
    });
    return;
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    );
    res.status(200).json({
      message: "Token is valid",
      error: false,
      data: { user: decoded },
    });
  } catch (error) {
    next({
      message: "Invalid token",
      code: 401,
      error: true,
    });
  }
});

router.get("/getuser", guard, async (req, res, next) => {
  const userID = res.locals.user.userID;
  if (!userID) {
    next({
      message: "User ID not found in token",
      code: 401,
      error: true,
    });
    return;
  }
  const user = await DBService.userGetById({ userID });
  if (user.error) {
    next({
      ...user,
    });
  } else {
    res.status(200).json({
      ...user,
    });
  }
});

router.post("/getwebsitecode", guard, async (req, res, next) => {
  const { websiteURL } = req.body;
  if (!websiteURL) {
    next({
      message: "Website URL is required",
      error: true,
      code: 400,
    });
    return;
  }

  try {
    const userID = res.locals.user.userID;
    const bundlerpath = resolve(
      __dirname,
      "../../trackerCode/bundler/bundler2.js"
    );
    const options = {
      cwd: resolve(__dirname, "../../trackerCode/bundler"),
    };
    const siteID = crypto.randomUUID();
    exec(
      `TRACKER_URL="${websiteURL}" SITE_ID="${siteID}" node ${bundlerpath}`,
      options,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error executing command:", error);
          next({
            message: "Error generating site code",
            error: true,
            code: 500,
            details: error.message,
          });
          return;
        }
        res.status(200).json({
          message: "Site code generated successfully",
          error: false,
          data: { code: stdout.trim(), siteID },
        });
      }
    );
  } catch (error) {
    next({
      message: "Error executing command",
      error: true,
      code: 500,
      details: error.message,
    });
  }
});
router.post("/regeneratewebsitecode", guard, async (req, res, next) => {
  const { siteID } = req.body;
  const userID = res.locals.user.userID;

  if (!siteID) {
    next({
      message: "Site ID is required",
      error: true,
      code: 400,
    });
    return;
  }

  try {
    const siteResult = await DBService.siteGet({ siteID, userID });
    if (siteResult.error || !siteResult.data) {
      next({
        message: "Site not found or access denied",
        error: true,
        code: 404,
      });
      return;
    }

    const site = siteResult.data;
    const bundlerpath = resolve(
      __dirname,
      "../../trackerCode/bundler/bundler2.js"
    );
    const options = {
      cwd: resolve(__dirname, "../../trackerCode/bundler"),
    };

    exec(
      `TRACKER_URL="${site.siteURL}" SITE_ID="${siteID}" node ${bundlerpath}`,
      options,
      (error, stdout, stderr) => {
        if (error) {
          console.error("Error executing command:", error);
          next({
            message: "Error regenerating site code",
            error: true,
            code: 500,
            details: error.message,
          });
          return;
        }
        res.status(200).json({
          message: "Site code regenerated successfully",
          error: false,
          data: { code: stdout.trim(), siteID },
        });
      }
    );
  } catch (error) {
    next({
      message: "Error regenerating site code",
      error: true,
      code: 500,
      details: error.message,
    });
  }
});
router.get("/getsites", guard, async (req, res, next) => {
  const userID = res.locals.user.userID;

  const sites = await DBService.getAllSites({ userID });
  if (sites.error) {
    next({
      ...sites,
    });
  } else {
    res.status(200).json({
      ...sites,
    });
  }
});
router.post("/addsite", guard, async (req, res, next) => {
  const { name, websiteURL, siteID } = req.body;
  const userID = res.locals.user.userID;
  if (!name || !websiteURL || !siteID) {
    next({
      message: "Name and website URL are required",
      error: true,
      code: 400,
    });
    return;
  }

  const addSiteResult = await DBService.siteCreate({
    userID,
    siteName: name,
    siteURL: websiteURL,
    siteID,
  });
  if (!addSiteResult) {
    next({
      message: "Failed to add site",
      error: true,
      code: 500,
    });
    return;
  }
  if (addSiteResult.error) {
    next({
      ...addSiteResult,
    });
  } else {
    res.status(201).json({
      message: "Site added successfully",
      error: false,
    });
  }
});
router.delete("/deletesite", guard, async (req, res, next) => {
  const { siteID } = req.body;
  const userID = res.locals.user.userID;

  if (!siteID) {
    next({
      message: "Site ID is required",
      error: true,
      code: 400,
    });
    return;
  }

  const deleteSiteResult = await DBService.siteDelete({
    siteID,
    userID,
  });

  if (!deleteSiteResult) {
    next({
      message: "Failed to delete site",
      error: true,
      code: 500,
    });
    return;
  }

  if (deleteSiteResult.error) {
    next({
      ...deleteSiteResult,
    });
  } else {
    res.status(200).json({
      message: "Site deleted successfully",
      error: false,
    });
  }
});

export default router;

async function guard(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    next({
      message: "No token provided",
      code: 401,
      error: true,
    });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || "secret"
    );

    res.locals.user = decoded;
    const userID = res.locals.user.userID;
    if (!userID) {
      next({
        message: "User ID not found in token",
        code: 401,
        error: true,
      });
      return;
    }
    next();
  } catch (error) {
    console.log("JWT verification error:", error);
    next({
      message: "Invalid token",
      code: 401,
      error: true,
    });
  }
}
