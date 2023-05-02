import { createStyles, Text, rem, Card } from "@mantine/core";

const useStyles = createStyles((theme) => ({
  item: {
    ...theme.fn.focusStyles(),
    alignItems: "center",
    margin: theme.spacing.md,
    cursor: "grab",
  },

  itemDragging: {
    boxShadow: theme.shadows.sm,
  },
}));

export default function TestComponent(
  item: any,
  id: number,
  onDragStart: Function,
  onDragEnter: Function,
  onDragEnd: Function
) {
  const { classes } = useStyles();

  return (
    <Card
      key={id}
      className={classes.item}
      draggable
      onDragStart={() => onDragStart(id)}
      onDragEnter={() => onDragEnter(id)}
      onDragEnd={() => onDragEnd()}
      onDragOver={(e) => e.preventDefault()}
    >
      <Text>{item.type}</Text>
      <Text>{item.url}</Text>
    </Card>
  );
}
