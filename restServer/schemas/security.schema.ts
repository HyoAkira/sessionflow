import { InferSchemaType, model, Schema } from "mongoose";

const securityModel = model(
  "Security",
  new Schema(
    {
      ip: { type: String, required: true },
      token: { type: String, required: true },
    },
    {
      timestamps: true,
    }
  )
);

export default securityModel;
type TSecurity = InferSchemaType<typeof securityModel.schema>;
export { TSecurity };
