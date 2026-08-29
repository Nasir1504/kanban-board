import mongoose from "mongoose";
import { workflow, assignees } from "../Data/data.js";
import User from "../model/User.js";
import Board from "../model/Board.js";
import Task from "../model/Task.js";

await mongoose.connect(process.env.MONGODB_URI);

// 1. wipe, so you can re-run this any time
await Promise.all([
  User.deleteMany({}),
  Board.deleteMany({}),
  Task.deleteMany({}),
]);

// 2. users — keep a map from "u1" to the real _id
const users = await User.insertMany(assignees.map(({ id, ...a }) => a));
const userId = {};
assignees.forEach((a, i) => {
  userId[a.id] = users[i]._id;
});

// 3. board — columns come from the values of `workflow`
const board = await Board.create({
  name: "My Board",
  columns: Object.values(workflow).map((col, i) => ({
    key: col.id,
    title: col.title,
    emoji: col.emoji,
    order: i,
  })),
});

// 4. tasks — flatten every column's items
const tasks = Object.values(workflow).flatMap((col) =>
  col.items.map(({ id, assigneeId, ...t }, i) => ({
    ...t,
    boardId: board._id,
    column: col.id,
    order: (i + 1) * 1000,
    assigneeId: assigneeId ? userId[assigneeId] : null,
  }))
);
// timestamps:false keeps the createdAt/updatedAt that come from the seed data
await Task.insertMany(tasks, { timestamps: false });

console.log(`seeded ${users.length} users, ${tasks.length} tasks`);
await mongoose.disconnect();
process.exit(0);
