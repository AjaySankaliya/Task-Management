import mongoose from "mongoose";

const userSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true
    },

    email: {
      type: String,
      required: true,
      unique: true
    },

    password: {
      type: String,
      required: false
    },
    googleId: {
      type: String,
      required: false,
      unique: true,
      sparse: true
    },
    authProvider: {
      type: String,
      enum: ["local", "google"],
      default: "local"
    }
  },
  {
    timestamps: true
  }
);

export const User = mongoose.model("User", userSchema);