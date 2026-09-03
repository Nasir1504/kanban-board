import connectDB from "@/lib/db";
import Board from "@/model/Board";
import Task from "@/model/Task";
import User from "@/model/User";
import { serializeTask } from "@/lib/api";

// Shapes the DB rows into the { columnKey: { id, title, emoji, items } } map the
// board renders from. Shared by the page's first paint and the reset route,
// which hands the same payload back so the client can swap it in without a reload.
export const loadBoardView = async () => {
  await connectDB();

  const board = await Board.findOne().sort({ createdAt: 1 }).lean();
  if (!board) return null;

  const [tasks, users] = await Promise.all([
    Task.find({ boardId: board._id }).sort({ column: 1, order: 1 }).lean(),
    User.find().sort({ name: 1 }).lean(),
  ]);

  const columns = [...board.columns].sort((a, b) => a.order - b.order);

  return {
    id: String(board._id),
    name: board.name,
    stages: Object.fromEntries(
      columns.map((column) => [
        column.key,
        {
          id: column.key,
          title: column.title,
          emoji: column.emoji,
          // `tasks` is already sorted by order, and filter keeps that order.
          items: tasks
            .filter((task) => task.column === column.key)
            .map(serializeTask),
        },
      ])
    ),
    assignees: users.map((user) => ({
      id: String(user._id),
      name: user.name,
      initials: user.initials,
      avatar: user.avatar,
    })),
  };
};
