import connectDB from "@/lib/db";
import { seedDatabase } from "@/lib/seed";
import { loadBoardView } from "@/lib/board";
import { handleError } from "@/lib/api";

// POST /api/seed — drops every user, board and task and rebuilds them from
// Data/data.js, the same thing `npm run seed` does. Destructive by design: it is
// what the board's "Reset board" button calls to throw away edits.
// The rebuilt board comes back in the response so the client can swap it
// straight into state — a reseed mints new ids, including for the assignees.
export async function POST() {
  try {
    await connectDB();

    const counts = await seedDatabase();
    const board = await loadBoardView();

    return Response.json({ ...counts, board });
  } catch (error) {
    return handleError(error);
  }
}
