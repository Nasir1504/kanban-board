"use client"
import { useDraggable } from "@dnd-kit/react";

const Card = ({ id, title }) => {
    const { ref, isDragging } = useDraggable({ id })

    return (
        <div ref={ref}
            className={`px-4 py-2 ${isDragging ? "bg-[#ffffff]" : "bg-[#ffffffd1]"} text-black rounded-md cursor-grab`}
        >
            {title}
        </div>
    );
}

export default Card;
