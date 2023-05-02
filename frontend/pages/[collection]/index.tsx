import TestComponent from "@/components/TestComponent";
import { Accordion, Card, Container, createStyles, rem } from "@mantine/core";
import { useListState } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useRef } from "react";

const useStyles = createStyles((theme) => ({
  root: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    borderRadius: theme.radius.sm,
  },

  item: {
    backgroundColor:
      theme.colorScheme === "dark"
        ? theme.colors.dark[6]
        : theme.colors.gray[0],
    border: `${rem(1)} solid transparent`,
    position: "relative",
    zIndex: 0,
    transition: "transform 150ms ease",

    "&[data-active]": {
      transform: "scale(1.03)",
      backgroundColor:
        theme.colorScheme === "dark" ? theme.colors.dark[7] : theme.white,
      boxShadow: theme.shadows.md,
      borderColor:
        theme.colorScheme === "dark"
          ? theme.colors.dark[4]
          : theme.colors.gray[2],
      borderRadius: theme.radius.md,
      zIndex: 1,
    },
  },

  chevron: {
    "&[data-rotate]": {
      transform: "rotate(-90deg)",
    },
  },
}));

const groups = ["col-1", "col-2", "col-3"];
const tests = [
  {
    id: "x1",
    type: "GET",
    url: "profile",
  },
  {
    id: "x2",
    type: "POST",
    url: "login",
  },
  {
    id: "x3",
    type: "GET",
    url: "profile",
  },
];

export default function Collection() {
  const router = useRouter();
  const { classes } = useStyles();

  const { collection } = router.query;

  return (
    <Container>
      <Accordion
        mx="auto"
        variant="filled"
        defaultValue="customization"
        classNames={classes}
        className={classes.root}
      >
        {groups.map((item, idx) => {
          return Item(item, idx);
        })}
      </Accordion>
    </Container>
  );
}

function Item(item: any, idx: number) {
  return (
    <Accordion.Item key={idx} value={item}>
      <Accordion.Control>{item}</Accordion.Control>
      <Accordion.Panel>
        <Draggables></Draggables>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

export function Draggables() {
  const [listState, handleList] = useListState(tests);

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
      {listState.map((item, idx) => {
        return TestComponent(item, idx, onDragStart, onDragEnter, onDragEnd);
      })}
    </Container>
  );
}
