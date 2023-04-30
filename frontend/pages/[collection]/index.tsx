import { Accordion, Container, createStyles, rem } from "@mantine/core";
import { useRouter } from "next/router";

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

const items = ["col-1", "col-2", "col-3"];

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
        {items.map((item, idx) => {
          return Item({ item });
        })}
      </Accordion>
    </Container>
  );
}

function Item(data: any) {
  return (
    <Accordion.Item value={data.item}>
      <Accordion.Control>{data.item}</Accordion.Control>
      <Accordion.Panel>lorem ipsum</Accordion.Panel>
    </Accordion.Item>
  );
}
