"use client";

import { useDroppable } from "@dnd-kit/react";
import Card from "./Card";

const Box = ({ id, title, emoji, boxItems, assigneeById, onSelectItem }) => {
  const { ref, isDropTarget } = useDroppable({ id });

  return (
    <section className="flex flex-col rounded-2xl bg-gray-100 p-3">
      <div className="flex items-center gap-2 px-2 pb-1 pt-1.5">
        <span aria-hidden="true" className="text-base leading-none">
          {emoji}
        </span>
        <h2 className="flex-1 truncate text-[15px] font-semibold text-gray-900">
          {title}
        </h2>
        <span
          title={`${boxItems.length} ${boxItems.length === 1 ? "task" : "tasks"}`}
          className="min-w-6 rounded-full bg-white px-2 py-0.5 text-center text-xs font-medium text-gray-500 ring-1 ring-black/5"
        >
          {boxItems.length}
        </span>
      </div>

      <div
        ref={ref}
        className={`mt-3 flex min-h-28 flex-1 flex-col gap-3 rounded-xl p-1 transition-colors ${
          isDropTarget ? "bg-white/70 ring-2 ring-blue-200" : ""
        }`}
      >
        {boxItems.length === 0 ? (
          <p className="flex flex-1 items-center justify-center rounded-lg border border-dashed border-gray-300 py-8 text-[13px] text-gray-400">
            Drop a task here
          </p>
        ) : (
          boxItems.map((item) => (
            <Card
              key={item.id}
              item={item}
              stageId={id}
              assignee={assigneeById[item.assigneeId] ?? null}
              onSelect={onSelectItem}
            />
          ))
        )}
      </div>
    </section>
  );
};

export default Box;
