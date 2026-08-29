"use client";

import { useDroppable } from "@dnd-kit/react";
import Card from "./Card";

const Box = ({ id, title, emoji, boxItems, onSelectItem }) => {
  const { ref, isDropTarget } = useDroppable({ id });

  // console.log(id + ": " + isDropTarget)
  return (
    <div className="flex flex-col gap-2 border border-dashed border-[#d5d5d550] bg-[#F3F4F6] w-60 min-h-40 h-auto rounded-md">
      <div className="flex items-center gap-2 px-4 pt-3">
        <span aria-hidden="true" className="text-base leading-none">
          {emoji}
        </span>
        <h1 className="flex-1 font-medium text-sm text-black truncate">
          {title}
        </h1>
        <span
          title={`${boxItems.length} ${boxItems.length === 1 ? "task" : "tasks"}`}
          className="min-w-6 px-2 py-0.5 rounded-full bg-[#00000010] text-xs text-center text-[#4b5563]"
        >
          {boxItems.length}
        </span>
      </div>
      <div
        ref={ref}
        className={`w-full flex-1  flex flex-col gap-4 p-5 ${isDropTarget ? "border-white bg-[#ffffff14]" : ""}`}
      >
        {boxItems.length === 0 ? (
          <p className="flex justify-center items-center w-full h-full">
            Drop here
          </p>
        ) : (
          boxItems.map((item) => {
            return <Card key={item.id} item={item} onSelect={onSelectItem} />;
          })
        )}
      </div>
    </div>
  );
};

export default Box;
