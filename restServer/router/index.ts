import { Router } from "express";
import userclientdataMiddleware from "../middlewares/userclientdata.middleware";
import DBService from "../services/db";
import SocketService from "../services/socket";
import { TUser } from "../schemas/user.schema";
import jwt from "jsonwebtoken";
import config from "../config.json";
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

router.get("/liveusercount", (req, res) => {
  const liveUserCount = SocketService.liveUserCount;
  res.status(200).json({
    message: "Live user count retrieved successfully",
    error: false,
    data: { liveUserCount },
  });
});

router.get("/sessionreports", async (req, res) => {
  const visitReports = await DBService.getAllSessions();
  if (visitReports.error) {
    res.status(500).json({
      ...visitReports,
    });
  } else {
    res.status(200).json({
      ...visitReports,
    });
  }
});

router.get("/dailysessionsreport", async (req, res) => {
  const dailySessionsReport = await DBService.getSessionsByRange("daily");
  if (dailySessionsReport.error) {
    res.status(500).json({
      ...dailySessionsReport,
    });
  } else {
    res.status(200).json({
      ...dailySessionsReport,
    });
  }
});

router.get("/weeklysessionsreport", async (req, res) => {
  const weeklySessionsReport = await DBService.getSessionsByRange("weekly");
  if (weeklySessionsReport.error) {
    res.status(500).json({
      ...weeklySessionsReport,
    });
  } else {
    res.status(200).json({
      ...weeklySessionsReport,
    });
  }
});
router.get("/monthlysessionsreport", async (req, res) => {
  const monthlySessionsReport = await DBService.getSessionsByRange("monthly");
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
router.get("/rangesessionsreport", async (req, res) => {
  const { start, end } = req.query;
  const startDate = new Date(start as string) || null;
  const endDate = new Date(end as string) || null;
  if (!startDate || !endDate) {
    res.status(400).json({
      message: "Invalid date range provided",
      error: true,
    });
    return;
  }
  const monthlySessionsReport = await DBService.getSessionsByRange(
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

router.post("/usercreate", async (req, res) => {
  const { email, password, firstName, lastName }: TUser = req.body;
  if (!email || !password || !firstName || !lastName) {
    res.status(400).json({
      message: "All fields are required",
      error: true,
    });
  }
  const userCreateResult = await DBService.userCreate(req.body);
  if (userCreateResult.error) {
    res.status(500).json({
      ...userCreateResult,
    });
  } else {
    res.status(201).json({
      ...userCreateResult,
    });
  }
});
router.post("/userlogin", async (req, res) => {
  const { email, password } = req.body;
  if (!email || !password) {
    res.status(400).json({
      message: "Email and password are required",
      error: true,
    });
    return;
  } else {
    const userLoginResult = await DBService.userGet({ email, password });
    if (userLoginResult.error) {
      res.status(500).json({
        ...userLoginResult,
      });
      return;
    } else {
      const token = jwt.sign(
        { userID: userLoginResult.data!.userID },
        process.env.JWT_SECRET || config.secret || "secret",
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

router.get("/auth", async (req, res) => {
  const token = req.headers["authorization"]?.split(" ")[1];
  if (!token) {
    res.status(401).json({ message: "No token provided" });
    return;
  }
  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || config.secret || "secret"
    );
    res.status(200).json({
      message: "Token is valid",
      error: false,
      data: { user: decoded },
    });
  } catch (error) {
    res.status(401).json({ message: "Invalid token" });
  }
});

export default router;

async function guard(req, res, next) {
  const token = req.headers["authorization"]?.split(" ")[1];

  if (!token) {
    next({ message: "No token provided" });
    return;
  }

  try {
    const decoded = jwt.verify(
      token,
      process.env.JWT_SECRET || config.secret || "secret"
    );

    res.locals.user = decoded;
    next();
  } catch (error) {
    console.log("JWT verification error:", error);
    next({ message: "Invalid token" });
  }
}
