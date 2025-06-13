import { Router } from "express";
import userclientdataMiddleware from "../middlewares/userclientdata.middleware";
import DBService from "../services/db";
import SocketService from "../services/socket";

const router = Router();

router.post("/userclientdata", userclientdataMiddleware, async (req, res) => {
  // @ts-ignore
  const clientData = res.locals.clientData;

  const clientDataServiceResult = await DBService.sendClientData(clientData);
  if (clientDataServiceResult.error) {
    res.status(500).json({
      ...clientDataServiceResult,
    });
  }
  res.status(200).json({
    ...clientDataServiceResult,
  });
});
export default router;

router.get("/liveusercount", (req, res) => {
  const liveUserCount = SocketService.liveUserCount;
  res.status(200).json({
    message: "Live user count retrieved successfully",
    error: false,
    data: { liveUserCount },
  });
});
