import mongoose from "mongoose";

const columnSchema = new mongoose.Schema(
  {
    key: {
      type: String,
      required: true,
      trim: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    emoji: {
      type: String,
      default: null,
    },
    order: {
      type: Number,
      required: true,
    },
  },
  { _id: false }
);

const boardSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },
    columns: {
      type: [columnSchema],
      default: [],
    },
  },
  { timestamps: true }
);

export default mongoose.models.Board || mongoose.model("Board", boardSchema);
