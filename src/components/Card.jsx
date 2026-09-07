"use client";

import { useRef } from "react";
import { useDraggable } from "@dnd-kit/react";
import { formatShortDay, isOverdue, toDateOnlyISO } from "@/lib/dates";
import { priorityStyle, tagStyle } from "@/lib/taskStyles";

const Avatar = ({ assignee }) => {
  if (!assignee) {
    return (
      <span
        title="Unassigned"
        className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-100 text-[11px] font-medium text-gray-400 ring-1 ring-gray-200"
      >
        ?
      </span>
    );
  }

  // A plain <img>: avatars are 28px and come from whatever host the user row
  // names, which the image optimizer would need allow-listing for.
  return assignee.avatar ? (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={assignee.avatar}
      alt={assignee.name}
      title={assignee.name}
      className="h-7 w-7 shrink-0 rounded-full object-cover ring-1 ring-black/5"
    />
  ) : (
    <span
      title={assignee.name}
      className="flex h-7 w-7 shrink-0 items-center justify-center rounded-full bg-gray-900 text-[11px] font-medium text-white"
    >
      {assignee.initials}
    </span>
  );
};

const Card = ({ item, stageId, assignee, onSelect }) => {
  const { ref, isDragging } = useDraggable({ id: item.id });

  const pointerDownAt = useRef(null);

  const handlePointerDown = (e) => {
    pointerDownAt.current = { x: e.clientX, y: e.clientY };
  };

  const handleClick = (e) => {
    const start = pointerDownAt.current;
    pointerDownAt.current = null;

    if (isDragging) return;
    if (start && Math.hypot(e.clientX - start.x, e.clientY - start.y) > 5)
      return;

    onSelect(item.id);
  };

  const dueDateISO = toDateOnlyISO(item.dueDate);
  const late = isOverdue(dueDateISO, stageId);

  return (
    <article
      ref={ref}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className={`cursor-grab select-none rounded-xl bg-white p-4 ring-1 ring-black/5 transition-shadow active:cursor-grabbing ${
        isDragging
          ? "shadow-[0_12px_24px_rgba(0,0,0,0.15)]"
          : "shadow-[0_1px_2px_rgba(0,0,0,0.06)] hover:shadow-[0_4px_12px_rgba(0,0,0,0.08)]"
      }`}
    >
      <h3 className="text-[15px] font-medium leading-snug text-gray-900">
        {item.title}
      </h3>

      {item.tags.length > 0 && (
        <div className="mt-2.5 flex flex-wrap gap-1.5">
          {item.tags.map((tag) => (
            <span
              key={tag}
              className={`rounded-md px-2 py-0.5 text-[11px] font-medium ${tagStyle(tag)}`}
            >
              {tag}
            </span>
          ))}
        </div>
      )}

      <div className="mt-3.5 flex items-center justify-between gap-2">
        <span
          className={`rounded-full border px-2.5 py-0.5 text-[11px] font-medium ${priorityStyle(item.priority)}`}
        >
          {item.priority}
        </span>

        <div className="flex items-center gap-2">
          {dueDateISO && (
            <span
              title={late ? "Overdue" : "Due date"}
              className={`text-[12px] font-medium ${late ? "text-red-600" : "text-gray-400"}`}
            >
              {formatShortDay(dueDateISO)}
            </span>
          )}

          <Avatar assignee={assignee} />
        </div>
      </div>
    </article>
  );
};

export default Card;
