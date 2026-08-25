"use client"

import { useState } from "react";
import Box from "@/components/Box";
import { DragDropProvider } from "@dnd-kit/react";
import { stages as INITIAL_STAGE } from "@/Data/data";


export default function Home() {

  const [stages, setStages] = useState(INITIAL_STAGE);

  const handleDragEnd = (e) => {
    if (e.canceled) return;

    const { source, target } = e.operation;
    if (!source || !target) return;

    const to = target.id;

    setStages(curr => {

      const from = Object.keys(curr).find(boxId => {
        return curr[boxId].items.some(item => item.id === source.id)
      })


      if (!curr[to] || !from || from === to) return curr;

      const moved = curr[from].items.find(item => item.id === source.id);


      return {
        ...curr,
        [from]: {
          ...curr[from],
          items: curr[from].items.filter(item => item.id !== source.id)
        },
        [to]: {
          ...curr[to],
          items: [...curr[to].items, moved]

        }
      }
    })

  }

  return (
    <DragDropProvider
      onDragEnd={handleDragEnd}
    >
      <main
        className="flex justify-center pt-10 gap-10"
      >

        {
          Object.entries(stages).map(([stageId, stageItem]) => {
            {/* console.log(stageId) */ }

            return (
              <Box
                key={stageId}
                id={stageId}
                title={stageItem.title}
                boxItems={stageItem.items}
              />
            )
          })
        }
      </main>
    </DragDropProvider>
  );
}
