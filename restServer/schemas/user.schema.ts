import { InferSchemaType, model, Schema } from "mongoose";

const userSchema = new Schema(
  {
    userID: {
      type: String,
      required: true,
      default: () => crypto.randomUUID(),
    },
    email: { type: String, required: true, unique: true },
    password: { type: String, required: true },
    firstName: { type: String, required: true },
    lastName: { type: String, required: true },
  },
  {
    timestamps: true,
  }
);

const User = model("User", userSchema);
export default User;
export type TUser = InferSchemaType<typeof userSchema>;
