import { InferSchemaType, model, Schema } from "mongoose";

const siteSchema = new Schema(
  {
    userID: { type: String, required: true },
    siteID: {
      type: String,
      required: true,
      unique: true,
      // default: () => crypto.randomUUID(),
    },
    siteName: { type: String, required: true },
    siteURL: { type: String, required: true, unique: true },
  },
  {
    timestamps: true,
  }
);

const Site = model("Site", siteSchema);
export default Site;
export type TSite = InferSchemaType<typeof siteSchema>;
