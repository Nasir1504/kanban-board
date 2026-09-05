// Relative imports, not "@/": this module is also loaded by `npm run seed`,
// which runs under plain node with no bundler to resolve the alias.
import { workflow, assignees } from "../Data/data.js";
import User from "../model/User.js";
import Board from "../model/Board.js";
import Task from "../model/Task.js";

// Wipes the three collections and rebuilds them from Data/data.js.
// The caller owns the connection: the CLI script opens its own, the reset route
// reuses the pooled one from lib/db.js.
export const seedDatabase = async () => {
  await Promise.all([
    User.deleteMany({}),
    Board.deleteMany({}),
    Task.deleteMany({}),
  ]);

  // users — keep a map from "u1" to the real _id
  const users = await User.insertMany(assignees.map(({ id, ...a }) => a));
  const userId = {};
  assignees.forEach((a, i) => {
    userId[a.id] = users[i]._id;
  });

  // board — columns come from the values of `workflow`
  const board = await Board.create({
    name: "Task Dashboard",
    columns: Object.values(workflow).map((col, i) => ({
      key: col.id,
      title: col.title,
      emoji: col.emoji,
      order: i,
    })),
  });

  // tasks — flatten every column's items
  const tasks = Object.values(workflow).flatMap((col) =>
    col.items.map(({ id, assigneeId, dueDate, ...t }, i) => ({
      ...t,
      dueDate: dueDate ?? null,
      boardId: board._id,
      column: col.id,
      order: (i + 1) * 1000,
      assigneeId: assigneeId ? userId[assigneeId] : null,
    }))
  );

  // timestamps:false keeps the createdAt/updatedAt that come from the seed data
  await Task.insertMany(tasks, { timestamps: false });

  return { users: users.length, tasks: tasks.length };
};
