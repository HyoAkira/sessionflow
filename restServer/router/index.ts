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

router.get("/visitreports", async (req, res) => {
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

export default router;
