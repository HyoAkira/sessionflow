import { InferSchemaType, model, Schema } from "mongoose";

const formSchema = new Schema(
  {
    formID: { type: String, required: true, unique: true },
    pageID: { type: String, required: true },
    sessionID: { type: String, required: true },
    message: { type: String, required: false },
    comment: { type: String, required: false },
    min_price: { type: Number, required: false },
    max_price: { type: Number, required: false },
    gender: { type: String, required: false },
  },
  { timestamps: true }
);

const FormModel = model("Form", formSchema);
export default FormModel;
export type TFormModel = InferSchemaType<typeof formSchema>;
