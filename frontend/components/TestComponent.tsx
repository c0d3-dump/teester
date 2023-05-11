import { TestModal } from "@/utils/modal";
import {
  createStyles,
  Text,
  rem,
  Card,
  Group,
  Grid,
  Modal,
  Button,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure } from "@mantine/hooks";
import { useState } from "react";

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

interface TestComponentInterface {
  item: TestModal;
  id: number;
  onDragStart: Function;
  onDragEnter: Function;
  onDragEnd: Function;
}

export default function TestComponent(props: TestComponentInterface) {
  const { classes } = useStyles();
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {},
  });

  const onSubmit = (data: any) => {
    close();
  };

  return (
    <>
      <Modal
        opened={opened}
        fullScreen
        onClose={close}
        title="Edit"
        padding="lg"
        centered
      >
        <form onSubmit={form.onSubmit((values: any) => onSubmit(values))}>
          <Button type="submit" mt={24}>
            Submit
          </Button>
        </form>
      </Modal>

      <Card
        className={classes.item}
        draggable
        onDragStart={() => props.onDragStart(props.id)}
        onDragEnter={() => props.onDragEnter(props.id)}
        onDragEnd={() => props.onDragEnd()}
        onDragOver={(e) => e.preventDefault()}
        onClick={open}
      >
        <Grid columns={12}>
          {props.item.dbName === undefined ? (
            <>
              <Grid.Col span={1}>
                <Text>{props.item.requestType}</Text>
              </Grid.Col>
              <Grid.Col span="auto">
                <Text>{props.item.url}</Text>
              </Grid.Col>
            </>
          ) : (
            <Grid.Col span="auto">
              <Text>{props.item.dbName}</Text>
            </Grid.Col>
          )}
          <Grid.Col span={2} offset={3}>
            <Text>Running...</Text>
          </Grid.Col>
        </Grid>
      </Card>
    </>
  );
}
