import { Card, Container } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { useRef, useState } from "react";

const list = [
  {
    id: 1,
    label: "lbl-1",
  },
  {
    id: 2,
    label: "lbl-2",
  },
  {
    id: 3,
    label: "lbl-3",
  },
];

export default function Dnd() {
  const [listState, handleList] = useListState(list);

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const onDragStart = (index: number) => {
    dragItem.current = index;
  };

  const onDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    handleSort();
  };

  const handleSort = () => {
    handleList.reorder({
      from: dragItem.current ?? 0,
      to: dragOverItem.current ?? 0,
    });
  };

  return (
    <Container>
      {listState.map((item, idx) => (
        <Card
          key={idx}
          draggable
          onDragStart={() => onDragStart(idx)}
          onDragEnter={() => onDragEnter(idx)}
          onDragEnd={onDragEnd}
          onDragOver={(e) => e.preventDefault()}
        >
          {item.label}
        </Card>
      ))}
    </Container>
  );
}
