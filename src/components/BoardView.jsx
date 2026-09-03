"use client";

import { useEffect, useState } from "react";
import { DragDropProvider } from "@dnd-kit/react";
import Box from "@/components/Box";
import TaskModal from "@/components/TaskModal";

// Matches the API's spacing, so a card dropped at the end of a column lands
// clear of its neighbours.
const ORDER_STEP = 1000;

const findTask = (stages, taskId) => {
  if (!taskId) return null;

  for (const stage of Object.values(stages)) {
    const task = stage.items.find((item) => item.id === taskId);
    if (task) return { task, stage };
  }

  return null;
};

const columnOf = (stages, taskId) =>
  Object.keys(stages).find((key) =>
    stages[key].items.some((item) => item.id === taskId)
  );

// Swaps a task for a newer copy of itself, wherever it currently sits.
const withTask = (stages, taskId, next) => {
  const key = columnOf(stages, taskId);
  if (!key) return stages;

  return {
    ...stages,
    [key]: {
      ...stages[key],
      items: stages[key].items.map((item) =>
        item.id === taskId ? next : item
      ),
    },
  };
};

const withoutTask = (stages, taskId) => {
  const key = columnOf(stages, taskId);
  if (!key) return stages;

  return {
    ...stages,
    [key]: {
      ...stages[key],
      items: stages[key].items.filter((item) => item.id !== taskId),
    },
  };
};

// Drops a task back into the column its own `column` field names, at the
// position its `order` earns — used both for moves and for undoing a failed one.
const withPlacedTask = (stages, task) => {
  const stage = stages[task.column];
  if (!stage) return stages;

  return {
    ...stages,
    [task.column]: {
      ...stage,
      items: [...stage.items, task].sort((a, b) => a.order - b.order),
    },
  };
};

const request = async (url, { method, body } = {}) => {
  const response = await fetch(url, {
    method,
    headers: body ? { "Content-Type": "application/json" } : undefined,
    body: body ? JSON.stringify(body) : undefined,
  });

  const payload = await response.json().catch(() => null);

  if (!response.ok) {
    throw new Error(payload?.error ?? `request failed (${response.status})`);
  }

  return payload;
};

const BoardView = ({ initialStages, initialAssignees, title }) => {
  const [stages, setStages] = useState(initialStages);
  // A reseed mints new user ids, so the assignee list is state too.
  const [assignees, setAssignees] = useState(initialAssignees);
  const [selectedId, setSelectedId] = useState(null);
  const [error, setError] = useState(null);
  const [confirmingReset, setConfirmingReset] = useState(false);
  const [isResetting, setIsResetting] = useState(false);

  useEffect(() => {
    if (!error) return;

    const timer = setTimeout(() => setError(null), 5000);
    return () => clearTimeout(timer);
  }, [error]);

  const selected = findTask(stages, selectedId);

  // Every mutation below is optimistic: the board updates now, the request
  // follows, and a failure puts the old value back with a message.
  const handleUpdateTask = async (taskId, patch) => {
    const previous = findTask(stages, taskId)?.task;
    if (!previous) return;

    setStages((curr) =>
      withTask(curr, taskId, {
        ...previous,
        ...patch,
        updatedAt: new Date().toISOString(),
      })
    );

    try {
      const saved = await request(`/api/tasks/${taskId}`, {
        method: "PATCH",
        body: patch,
      });

      // The server owns `updatedAt` and any trimming the schema did.
      setStages((curr) => withTask(curr, taskId, saved));
    } catch (requestError) {
      setStages((curr) => withTask(curr, taskId, previous));
      setError(`Could not save the task: ${requestError.message}`);
    }
  };

  const handleDeleteTask = async (taskId) => {
    const previous = findTask(stages, taskId)?.task;
    if (!previous) return;

    setSelectedId(null);
    setStages((curr) => withoutTask(curr, taskId));

    try {
      await request(`/api/tasks/${taskId}`, { method: "DELETE" });
    } catch (requestError) {
      setStages((curr) => withPlacedTask(curr, previous));
      setError(`Could not delete the task: ${requestError.message}`);
    }
  };

  const handleDragEnd = async (e) => {
    if (e.canceled) return;

    const { source, target } = e.operation;
    if (!source || !target) return;

    const to = target.id;
    const previous = findTask(stages, source.id)?.task;

    // Only column-to-column moves are wired up; dropping on a card is a no-op.
    if (!previous || !stages[to] || previous.column === to) return;

    const order = (stages[to].items.at(-1)?.order ?? 0) + ORDER_STEP;
    const moved = { ...previous, column: to, order };

    setStages((curr) => withPlacedTask(withoutTask(curr, previous.id), moved));

    try {
      const saved = await request(`/api/tasks/${previous.id}`, {
        method: "PATCH",
        body: { column: to, order },
      });

      setStages((curr) => withTask(curr, previous.id, saved));
    } catch (requestError) {
      setStages((curr) =>
        withPlacedTask(withoutTask(curr, previous.id), previous)
      );
      setError(`Could not move the task: ${requestError.message}`);
    }
  };

  // There is no "add task" UI, so this is how you get an edited board back to
  // its starting state: it runs the same seed `npm run seed` does, server-side,
  // and swaps the rebuilt board into state.
  const handleReset = async () => {
    setConfirmingReset(false);
    setIsResetting(true);

    try {
      const { board } = await request("/api/seed", { method: "POST" });

      setSelectedId(null);
      setStages(board.stages);
      setAssignees(board.assignees);
    } catch (requestError) {
      setError(`Could not reset the board: ${requestError.message}`);
    } finally {
      setIsResetting(false);
    }
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <main className="flex flex-col items-start justify-center pt-10 gap-10">
        <div className="relative flex items-center justify-center w-full px-10">
          <h1>{title}</h1>

          <button
            type="button"
            onClick={() =>
              confirmingReset ? handleReset() : setConfirmingReset(true)
            }
            onBlur={() => setConfirmingReset(false)}
            disabled={isResetting}
            title="Wipes every task and rebuilds the board from the seed data"
            className="absolute right-10 rounded-md border border-gray-200 px-3 py-1.5 text-[13px] font-medium text-red-600 transition-colors hover:bg-red-50 disabled:cursor-not-allowed disabled:text-gray-400 disabled:hover:bg-transparent"
          >
            {isResetting
              ? "Resetting…"
              : confirmingReset
                ? "Click again to reset"
                : "Reset board"}
          </button>
        </div>
        <div className="flex items-start justify-center w-full h-full">
          {Object.entries(stages).map(([stageId, stageItem]) => (
            <Box
              key={stageId}
              id={stageId}
              title={stageItem.title}
              emoji={stageItem.emoji}
              boxItems={stageItem.items}
              onSelectItem={setSelectedId}
            />
          ))}
        </div>
      </main>

      {error && (
        <div
          role="alert"
          className="fixed bottom-6 left-1/2 z-50 -translate-x-1/2 rounded-md bg-red-600 px-4 py-2 text-sm text-white shadow-lg"
        >
          {error}
        </div>
      )}

      {selected && (
        <TaskModal
          key={selected.task.id}
          task={selected.task}
          stage={selected.stage}
          assignees={assignees}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          onClose={() => setSelectedId(null)}
        />
      )}
    </DragDropProvider>
  );
};

export default BoardView;
