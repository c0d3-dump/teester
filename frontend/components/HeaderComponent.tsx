import { createStyles, Header, Container, rem } from "@mantine/core";
import { MantineLogo } from "@mantine/ds";

const useStyles = createStyles(() => ({
  inner: {
    display: "flex",
    justifyContent: "space-around",
    alignItems: "center",
    height: rem(56),
  },
}));

export default function HeaderMiddle() {
  const { classes } = useStyles();

  return (
    <Header height={56} mb={120}>
      <Container className={classes.inner}>
        <MantineLogo size={28} />
      </Container>
    </Header>
  );
}
