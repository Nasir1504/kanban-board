import mongoose from "mongoose";
import { PRIORITIES, TAGS } from "../Data/data.js";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

const toDateOnlyString = (value) => {
  if (value == null || value === "") return null;

  if (value instanceof Date) {
    if (Number.isNaN(value.getTime())) return null;
    return value.toISOString().slice(0, 10);
  }

  if (typeof value === "string") {
    const datePart = value.split("T")[0];
    return DATE_ONLY.test(datePart) ? datePart : value;
  }

  return value;
};

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
      type: String,
      default: null,
      set: toDateOnlyString,
      validate: {
        validator: (value) => value == null || DATE_ONLY.test(value),
        message: "dueDate must be YYYY-MM-DD or null",
      },
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

const serializeDueDate = (_doc, ret) => {
  ret.dueDate = toDateOnlyString(ret.dueDate);
  return ret;
};

taskSchema.set("toJSON", { transform: serializeDueDate });
taskSchema.set("toObject", { transform: serializeDueDate });

// the board view's one query: every task of a board, grouped by column, in order
taskSchema.index({ boardId: 1, column: 1, order: 1 });

export default mongoose.models.Task || mongoose.model("Task", taskSchema);
