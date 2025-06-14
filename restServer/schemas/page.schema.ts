import { model, Schema, InferSchemaType } from "mongoose";

const recordSchema = new Schema(
  {
    content: String,
    category: String,
    visibleDuration: Number,
  },
  {
    id: false,
    timestamps: false,
  }
);

const pageSchema = new Schema(
  {
    pageID: { type: String, required: true },
    sessionID: { type: String, required: true },
    title: { type: String, required: true },
    url: { type: String, required: true },
    date: { type: Number, required: true },
    contents: { type: [String], required: true },
    records: { type: [recordSchema], default: [], required: true },
    categories: { type: [String], required: true },
    pageDuration: { type: Number, required: true },
  },
  { timestamps: true }
);

const PageModel = model("Page", pageSchema);
export default PageModel;
export type TPage = InferSchemaType<typeof pageSchema>;
