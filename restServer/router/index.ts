import { Router } from "express";

const router = Router();

router.post("/userclientdata", (req, res) => {
  const { clientData } = req.body;
  if (!clientData) {
    res.status(400).json({ message: "Client data is required", error: true });
  } else {
    console.log("Received client data:", clientData);
    res.status(200).json({
      message: "Client data received successfully",
      error: false,
    });
  }
});

export default router;
