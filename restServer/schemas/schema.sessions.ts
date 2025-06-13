import { model, Schema, HydratedDocument } from "mongoose";

const sessionSchema = new Schema(
  {
    sessionID: { type: String, required: true },
    clicks: [],
    scrolls: [],
    focusLossCount: { type: Number, default: 0 },
    sessionStart: { type: Number, default: 0 },
    sessionDuration: { type: Number, default: 0 },
    deviceType: {
      type: String,
      enum: ["mobile", "desktop", "tablet"],
    },
  },
  { timestamps: true }
);

const Session = model("Session", sessionSchema);
export default Session;
export type TSession = HydratedDocument<typeof Session>;
