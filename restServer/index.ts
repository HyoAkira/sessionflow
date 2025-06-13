import express from "express";
import router from "./router";
import cors from "cors";
import { connect, model, Schema } from "mongoose";
import DBService from "./services/db";
const PORT = process.env.PORT || 3000;

const app = express();
app.use(
  cors({
    origin: "*",
  })
);
app.use(express.json());
app.use("/api", router);

async function connectionDB() {
  try {
    await connect("mongodb://admin:admin123@localhost:27017/", {
      dbName: "tas2",
    });
    console.info("Connected to MongoDB");
    app.listen(PORT, () => {
      console.info(`Server is running on port ${PORT}`);
    });

    DBService.createSession();
  } catch (error) {
    console.error("Error connecting to MongoDB:", error);
  }
}
connectionDB();
