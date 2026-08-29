import mongoose from "mongoose";
import { PRIORITIES, TAGS } from "../Data/data.js";

const taskSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: true,
      trim: true,
    },
    description: {
      type: String,
      default: null,
    },
    dueDate: {
      type: Date,
      default: null,
    },
    priority: {
      type: String,
      enum: PRIORITIES,
      default: "Medium",
    },
    tags: {
      type: [
        {
          type: String,
          enum: TAGS,
        },
      ],
      default: [],
    },

    boardId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Board",
      required: true,
    },
    // matches a `key` in that board's `columns`
    column: {
      type: String,
      required: true,
    },

    order: {
      type: Number,
      required: true,
    },

    assigneeId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      default: null,
    },
  },
  { timestamps: true }
);

// the board view's one query: every task of a board, grouped by column, in order
taskSchema.index({ boardId: 1, column: 1, order: 1 });

export default mongoose.models.Task || mongoose.model("Task", taskSchema);
