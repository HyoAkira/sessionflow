import { Router } from "express";
import userclientdataMiddleware from "../middlewares/userclientdata.middleware";
import DBService from "../services/db";
import SocketService from "../services/socket";

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
export default router;
