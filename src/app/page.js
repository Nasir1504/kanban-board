import { loadBoardView } from "@/lib/board";
import BoardView from "@/components/BoardView";

// The board is read straight from Mongo rather than fetched, so Next has no
// fetch call to key a cache off — force-dynamic keeps this off the static path
// and makes a reload show what the API routes have written.
export const dynamic = "force-dynamic";

export default async function Home() {
  const board = await loadBoardView();

  if (!board) {
    return (
      <main className="flex flex-1 flex-col items-center justify-center gap-2 p-10 text-center">
        <h1 className="text-2xl font-semibold tracking-tight text-gray-900">
          No board yet
        </h1>
        <p className="text-sm text-gray-500">
          Run <code className="font-mono">npm run seed</code> to create one.
        </p>
      </main>
    );
  }

  return (
    <BoardView
      initialStages={board.stages}
      initialAssignees={board.assignees}
      title={board.name}
    />
  );
}
