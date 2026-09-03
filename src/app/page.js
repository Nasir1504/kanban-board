"use client";

import { useState } from "react";
import Box from "@/components/Box";
import TaskModal from "@/components/TaskModal";
import { DragDropProvider } from "@dnd-kit/react";
import { workflow as INITIAL_WORKFLOW } from "@/Data/data";

const findTask = (workflow, taskId) => {
  if (!taskId) return null;

  for (const stage of Object.values(workflow)) {
    const task = stage.items.find((item) => item.id === taskId);
    if (task) return { task, stage };
  }

  return null;
};

// Matches the shape of the seed data ("2026-08-23T10:40:00") so the modal can
// format an edit the same way it formats a value that came from data.js.
const nowAsStamp = () => {
  const now = new Date();
  const pad = (value) => String(value).padStart(2, "0");

  return `${now.getFullYear()}-${pad(now.getMonth() + 1)}-${pad(now.getDate())}T${pad(now.getHours())}:${pad(now.getMinutes())}:00`;
};

export default function Home() {
  const [stage, setStage] = useState(INITIAL_WORKFLOW);
  const [selectedId, setSelectedId] = useState(null);

  const selected = findTask(stage, selectedId);

  const handleUpdateTask = (taskId, patch) => {
    setStage((curr) => {
      const boxId = Object.keys(curr).find((id) =>
        curr[id].items.some((item) => item.id === taskId)
      );
      if (!boxId) return curr;

      return {
        ...curr,
        [boxId]: {
          ...curr[boxId],
          items: curr[boxId].items.map((item) =>
            item.id === taskId
              ? { ...item, ...patch, updatedAt: nowAsStamp() }
              : item
          ),
        },
      };
    });
  };

  const handleDeleteTask = (taskId) => {
    setStage((curr) => {
      const boxId = Object.keys(curr).find((id) =>
        curr[id].items.some((item) => item.id === taskId)
      );
      if (!boxId) return curr;

      return {
        ...curr,
        [boxId]: {
          ...curr[boxId],
          items: curr[boxId].items.filter((item) => item.id !== taskId),
        },
      };
    });

    setSelectedId(null);
  };

  const handleDragEnd = (e) => {
    if (e.canceled) return;

    const { source, target } = e.operation;
    if (!source || !target) return;

    const to = target.id;

    setStage((curr) => {
      const from = Object.keys(curr).find((boxId) => {
        return curr[boxId].items.some((item) => item.id === source.id);
      });

      if (!curr[to] || !from || from === to) return curr;

      const moved = curr[from].items.find((item) => item.id === source.id);
      if (!moved) return curr;

      return {
        ...curr,
        [from]: {
          ...curr[from],
          items: curr[from].items.filter((item) => item.id !== source.id),
        },
        [to]: {
          ...curr[to],
          items: [...curr[to].items, moved],
        },
      };
    });
  };

  return (
    <DragDropProvider onDragEnd={handleDragEnd}>
      <main className="flex items-start justify-center pt-10 gap-10">
        <div>
          <h1>Task Dashboard</h1>
        </div>
        {Object.entries(stage).map(([stageId, stageItem]) => {
          {
            /* console.log(stageId) */
          }

          return (
            <Box
              key={stageId}
              id={stageId}
              title={stageItem.title}
              emoji={stageItem.emoji}
              boxItems={stageItem.items}
              onSelectItem={setSelectedId}
            />
          );
        })}
      </main>

      {selected && (
        <TaskModal
          key={selected.task.id}
          task={selected.task}
          stage={selected.stage}
          onUpdate={handleUpdateTask}
          onDelete={handleDeleteTask}
          onClose={() => setSelectedId(null)}
        />
      )}
    </DragDropProvider>
  );
}
