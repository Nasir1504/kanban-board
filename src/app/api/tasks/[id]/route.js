import mongoose from "mongoose";
import connectDB from "@/lib/db";
import Board from "@/model/Board";
import Task from "@/model/Task";
import {
  handleError,
  jsonError,
  parseBody,
  readJson,
  serializeTask,
} from "@/lib/api";
import { taskPatchSchema } from "@/lib/validation";

const NOT_FOUND = "task not found";

// GET /api/tasks/:id
export async function GET(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return jsonError(NOT_FOUND, 404);

    await connectDB();

    const task = await Task.findById(id).lean();
    if (!task) return jsonError(NOT_FOUND, 404);

    return Response.json(serializeTask(task));
  } catch (error) {
    return handleError(error);
  }
}

// PATCH /api/tasks/:id — partial update. This is the one the modal's edits and
// the drag-and-drop move ({ column, order }) both go through: send only the
// fields that changed, untouched fields stay as they are.
export async function PATCH(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return jsonError(NOT_FOUND, 404);

    const body = await readJson(request);
    if (!body.ok) return body.response;

    const parsed = parseBody(taskPatchSchema, body.data);
    if (!parsed.ok) return parsed.response;

    await connectDB();

    const task = await Task.findById(id);
    if (!task) return jsonError(NOT_FOUND, 404);

    const patch = parsed.data;

    // A move is only valid into a column the task's own board declares.
    if (patch.column && patch.column !== task.column) {
      const board = await Board.findById(task.boardId)
        .select("columns.key")
        .lean();

      if (!board?.columns.some((col) => col.key === patch.column)) {
        return jsonError(`column "${patch.column}" is not on this board`, 400);
      }
    }

    // set + save (rather than findByIdAndUpdate) runs the schema's setters and
    // validators and bumps `updatedAt`, which the modal displays.
    task.set(patch);
    await task.save();

    return Response.json(serializeTask(task.toJSON()));
  } catch (error) {
    return handleError(error);
  }
}

// DELETE /api/tasks/:id
export async function DELETE(request, { params }) {
  try {
    const { id } = await params;
    if (!mongoose.isValidObjectId(id)) return jsonError(NOT_FOUND, 404);

    await connectDB();

    const task = await Task.findByIdAndDelete(id).lean();
    if (!task) return jsonError(NOT_FOUND, 404);

    return Response.json({ id: String(task._id), deleted: true });
  } catch (error) {
    return handleError(error);
  }
}
