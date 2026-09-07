import mongoose from "mongoose";
import { z } from "zod";
import { PRIORITIES, TAGS } from "@/Data/data";

const DATE_ONLY = /^\d{4}-\d{2}-\d{2}$/;

export const objectId = z
  .string()
  .refine((value) => mongoose.isValidObjectId(value), "must be a valid id");

// The editable shape of a task, mirroring the Task model — deliberately with no
// `.default()`s on it, because PATCH builds on this: a default here would turn
// an absent key into a write and let an empty body blank out real fields.
const taskFields = {
  title: z.string().trim().min(1, "title is required"),
  description: z.string().trim().nullable(),
  dueDate: z.string().regex(DATE_ONLY, "dueDate must be YYYY-MM-DD").nullable(),
  priority: z.enum(PRIORITIES),
  tags: z.array(z.enum(TAGS)),
  column: z.string().trim().min(1, "column is required"),
  order: z.number(),
  assigneeId: objectId.nullable(),
};

// Create fills the optional fields in; `boardId` and `column` place the task,
// and `order` is optional because the route appends to the end of the column.
export const taskCreateSchema = z.object({
  ...taskFields,
  description: taskFields.description.default(null),
  dueDate: taskFields.dueDate.default(null),
  priority: taskFields.priority.default("Medium"),
  tags: taskFields.tags.default([]),
  assigneeId: taskFields.assigneeId.default(null),
  order: taskFields.order.optional(),
  boardId: objectId,
});

// PATCH: every field optional, unknown keys dropped by zod, `boardId` off the
// table (a task does not change boards). Absent keys stay absent, so the update
// only ever touches what the client actually sent.
export const taskPatchSchema = z
  .object(taskFields)
  .partial()
  .refine((patch) => Object.keys(patch).length > 0, "patch body is empty");

// "title: title is required" — flat enough to show in a toast.
export const formatIssues = (error) =>
  error.issues
    .map((issue) =>
      issue.path.length
        ? `${issue.path.join(".")}: ${issue.message}`
        : issue.message
    )
    .join(", ");
