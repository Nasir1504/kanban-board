"use client";
import { useRef } from "react";
import { useDraggable } from "@dnd-kit/react";

const Card = ({ item, onSelect }) => {
  const { ref, isDragging } = useDraggable({ id: item.id });

  const pointerDownAt = useRef(null);

  const handlePointerDown = (e) => {
    // console.log(e)
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

  return (
    <div
      ref={ref}
      onPointerDown={handlePointerDown}
      onClick={handleClick}
      className={`px-4 py-2 ${isDragging ? "bg-[#ffffff] shadow-[1px_2px_8px_rgba(0,0,0,0.2)]" : "bg-[#ffffffd1] shadow-[1px_2px_4px_rgba(0,0,0,0.05)]"}
             text-black rounded-md cursor-grab  `}
    >
      {item.title}
    </div>
  );
};

export default Card;
