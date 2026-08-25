"use client"

import { useDroppable } from "@dnd-kit/react";
import Card from "./Card";

const Box = ({ id, title, boxItems }) => {

    const { ref, isDropTarget } = useDroppable({ id })

    // console.log(id + ": " + isDropTarget)
    return (
        <div className="flex flex-col gap-2 border border-[#d5d5d520] w-60 min-h-40 h-auto ">
            <h1 className="text-center">{title}</h1>
            <div
                ref={ref}
                className={`border border-dashed w-full h-full rounded-2xl flex flex-col gap-4 p-5 ${isDropTarget ? "border-white bg-[#ffffff14]" : ""}`}
            >
                {
                    boxItems.length === 0 ?
                        <p className="flex justify-center items-center w-full h-full">Drop here</p>
                        :
                        (
                            boxItems.map(item => {
                                return (
                                    <Card key={item.id} id={item.id} title={item.title} />
                                )
                            })
                        )
                }

            </div>

        </div>
    );
}

export default Box;
