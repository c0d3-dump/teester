import TestComponent from "@/components/TestComponent";
import { CollectionModal, TestModal } from "@/utils/modal";
import {
  Accordion,
  Button,
  Container,
  Group,
  Modal,
  createStyles,
  rem,
  Select,
  TextInput,
} from "@mantine/core";
import { useForm } from "@mantine/form";
import { useDisclosure, useListState } from "@mantine/hooks";
import { useRouter } from "next/router";
import { useEffect, useRef, useState } from "react";

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

const collections: CollectionModal[] = [
  {
    name: "collection 1",
    tests: [
      {
        requestType: "GET",
        url: "/profile",
        assertionCode: 500,
        dbName: undefined,
      },
      {
        requestType: "POST",
        url: "/login",
        assertionCode: 200,
        dbName: undefined,
      },
      {
        requestType: undefined,
        url: undefined,
        assertionCode: undefined,
        dbName: "test-db",
      },
    ],
  },
];

export default function Collection() {
  // const router = useRouter();
  const [listCollection, setCollection] = useState(collections);
  const { classes } = useStyles();

  // const { collection } = router.query;

  const onCollection = (name: string) => {
    const newCollection: CollectionModal = { name, tests: [] };
    setCollection([...listCollection, newCollection]);
  };

  const onTest = (data: any) => {
    const newTest: TestModal = {
      url: data.url,
      assertionCode: data.assertionCode,
      requestType: data.method,
      dbName: undefined,
    };

    const idx = listCollection.findIndex((c) => c.name === data.collectionName);
    const col = [...listCollection];
    col[idx].tests.push(newTest);
    setCollection(col);
  };

  const onDatabase = (data: any) => {
    const newTest: TestModal = {
      dbName: data.dbName,
      requestType: undefined,
      url: undefined,
      assertionCode: undefined,
    };

    console.log(data);

    const idx = listCollection.findIndex((c) => c.name === data.collectionName);
    const col = [...listCollection];
    col[idx].tests.push(newTest);
    setCollection(col);
  };

  return (
    <Container>
      <Group position="center" my={12}>
        <AddModal
          collections={listCollection}
          onCollection={onCollection}
          onTest={onTest}
          onDatabase={onDatabase}
        ></AddModal>
        <Button>Run</Button>
      </Group>
      <Accordion
        mx="auto"
        variant="filled"
        defaultValue={listCollection[0].name}
        classNames={classes}
        className={classes.root}
      >
        {listCollection.map((item, idx) => {
          return Item(item, idx);
        })}
      </Accordion>
    </Container>
  );
}

function Item(item: CollectionModal, idx: number) {
  return (
    <Accordion.Item key={idx} value={item.name}>
      <Accordion.Control>{item.name}</Accordion.Control>
      <Accordion.Panel>
        <Draggables items={item.tests}></Draggables>
      </Accordion.Panel>
    </Accordion.Item>
  );
}

interface DraggableProps {
  items: TestModal[];
}

export function Draggables({ items }: DraggableProps) {
  const [listState, handleList]: [TestModal[], any] = useListState(items);

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

  const onTestClick = (id: any) => {
    alert(id);
  };

  return (
    <Container>
      {listState.map((item, idx) => {
        return (
          <TestComponent
            key={idx}
            id={idx}
            item={item}
            onDragEnd={onDragEnd}
            onDragEnter={onDragEnter}
            onDragStart={onDragStart}
          ></TestComponent>
        );
      })}
    </Container>
  );
}

interface AddModalProps {
  collections: CollectionModal[];
  onCollection: Function;
  onTest: Function;
  onDatabase: Function;
}

export function AddModal({
  collections,
  onCollection,
  onTest,
  onDatabase,
}: AddModalProps) {
  const [opened, { open, close }] = useDisclosure(false);

  const form = useForm({
    initialValues: {
      type: "collection",
      collectionName: "",
      collection: "",
      method: "GET",
      url: "",
      dbLabel: "",
    },
  });

  useEffect(() => {
    if (!opened) {
      form.reset();
    }
  }, [form, opened]);

  const onSubmit = (values: any) => {
    switch (values.type) {
      case "collection":
        onCollection(values.collectionName);
        break;
      case "test":
        onTest({
          collectionName: values.collection,
          method: values.method,
          url: values.url,
        });
        break;
      case "database":
        onDatabase({
          collectionName: values.collection,
          dbName: values.dbLabel,
        });
        break;
      default:
        break;
    }

    close();
  };

  const collectionTypeForm = () => {
    return (
      <TextInput
        label="Collection Name"
        placeholder="enter name"
        my={12}
        {...form.getInputProps("collectionName")}
      ></TextInput>
    );
  };

  const testTypeForm = () => {
    return (
      <>
        <Select
          label="Select collection"
          placeholder="pick one"
          data={collections.map((m) => ({
            value: m.name,
            label: m.name,
          }))}
          dropdownPosition="bottom"
          my={12}
          {...form.getInputProps("collection")}
        ></Select>

        <Select
          label="Select type"
          placeholder="pick one"
          data={[
            { value: "GET", label: "GET" },
            { value: "POST", label: "POST" },
            { value: "DELETE", label: "DELETE" },
            { value: "PUT", label: "PUT" },
          ]}
          dropdownPosition="top"
          my={12}
          {...form.getInputProps("method")}
        ></Select>
        <TextInput
          label="Url"
          placeholder="url"
          my={12}
          {...form.getInputProps("url")}
        ></TextInput>
      </>
    );
  };

  const dbTypeForm = () => {
    return (
      <>
        <Select
          label="Select collection"
          placeholder="pick one"
          data={collections.map((m) => ({
            value: m.name,
            label: m.name,
          }))}
          dropdownPosition="bottom"
          my={12}
          {...form.getInputProps("collection")}
        ></Select>
        <TextInput
          label="Database Label"
          placeholder="enter label"
          my={12}
          {...form.getInputProps("dbLabel")}
        ></TextInput>
      </>
    );
  };

  const renderForm = (type: string) => {
    switch (type) {
      case "collection":
        return collectionTypeForm();
      case "test":
        return testTypeForm();
      case "database":
        return dbTypeForm();
      default:
        break;
    }
  };

  return (
    <>
      <Modal opened={opened} onClose={close} title="Add" padding="md" centered>
        <form onSubmit={form.onSubmit((values: any) => onSubmit(values))}>
          <Select
            label="Select type"
            placeholder="pick one"
            data={[
              { value: "collection", label: "Collection" },
              { value: "test", label: "Test" },
              { value: "database", label: "Database" },
            ]}
            dropdownPosition="bottom"
            my={18}
            {...form.getInputProps("type")}
          ></Select>
          {renderForm(form.values.type)}
          <Button type="submit" mt={24}>
            Submit
          </Button>
        </form>
      </Modal>
      <Button onClick={open}>Add</Button>
    </>
  );
}
