import { formatIssues } from "@/lib/validation";

export const jsonError = (message, status) =>
  Response.json({ error: message }, { status });

// A body that is not JSON at all throws — that is a 400, not a 500.
export const readJson = async (request) => {
  try {
    return { ok: true, data: await request.json() };
  } catch {
    return { ok: false, response: jsonError("invalid JSON body", 400) };
  }
};

// Turns a zod result into either the parsed value or a ready 400.
export const parseBody = (schema, body) => {
  const result = schema.safeParse(body);

  return result.success
    ? { ok: true, data: result.data }
    : { ok: false, response: jsonError(formatIssues(result.error), 400) };
};

// The client works with `id`; Mongo hands back `_id` and ObjectIds.
export const serializeTask = (task) => {
  const { _id, __v, boardId, assigneeId, ...rest } = task;

  return {
    id: String(_id),
    ...rest,
    boardId: boardId ? String(boardId) : null,
    assigneeId: assigneeId ? String(assigneeId) : null,
  };
};

// Mongoose validation/cast failures are the client's fault; anything else is ours.
export const handleError = (error) => {
  if (error?.name === "ValidationError" || error?.name === "CastError") {
    return jsonError(error.message, 400);
  }

  console.error(error);
  return jsonError("internal server error", 500);
};
