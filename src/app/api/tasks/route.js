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
import { taskCreateSchema } from "@/lib/validation";

// Seed spacing: leaving gaps means a reorder can usually pick a number between
// two neighbours instead of rewriting the whole column.
const ORDER_STEP = 1000;

// GET /api/tasks?boardId=...&column=...
// Both filters are optional; the sort matches the { boardId, column, order }
// index so the board view can render straight from this response.
export async function GET(request) {
  try {
    await connectDB();

    const { searchParams } = request.nextUrl;
    const boardId = searchParams.get("boardId");
    const column = searchParams.get("column");

    if (boardId && !mongoose.isValidObjectId(boardId)) {
      return jsonError("boardId must be a valid id", 400);
    }

    const filter = {};
    if (boardId) filter.boardId = boardId;
    if (column) filter.column = column;

    const tasks = await Task.find(filter).sort({ column: 1, order: 1 }).lean();

    return Response.json(tasks.map(serializeTask));
  } catch (error) {
    return handleError(error);
  }
}

// POST /api/tasks — creates a task and appends it to the end of its column.
export async function POST(request) {
  try {
    await connectDB();

    const body = await readJson(request);
    if (!body.ok) return body.response;

    const parsed = parseBody(taskCreateSchema, body.data);
    if (!parsed.ok) return parsed.response;

    const { order, ...fields } = parsed.data;

    const board = await Board.findById(fields.boardId)
      .select("columns.key")
      .lean();
    if (!board) return jsonError("board not found", 404);

    if (!board.columns.some((col) => col.key === fields.column)) {
      return jsonError(`column "${fields.column}" is not on this board`, 400);
    }

    const task = await Task.create({
      ...fields,
      order: order ?? (await nextOrder(fields.boardId, fields.column)),
    });

    return Response.json(serializeTask(task.toJSON()), { status: 201 });
  } catch (error) {
    return handleError(error);
  }
}

const nextOrder = async (boardId, column) => {
  const last = await Task.findOne({ boardId, column })
    .sort({ order: -1 })
    .select("order")
    .lean();

  return (last?.order ?? 0) + ORDER_STEP;
};
