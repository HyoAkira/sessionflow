import { model, Schema, HydratedDocument, InferSchemaType } from "mongoose";

const sessionSchema = new Schema(
  {
    siteID: { type: String, required: true },
    sessionID: { type: String, required: true },
    // clicks: [],
    clicks: { type: Number, default: 0 },
    // scrolls: [],
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
export type TSession = InferSchemaType<typeof sessionSchema>;
