import { ApiModel, DbModel } from "src/redux/models/project";
import { Card, CardHeader, CardTitle } from "../ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "../ui/alert-dialog";
import { Button } from "../ui/button";
import { Database, Globe2, Trash2 } from "lucide-react";
import AddEditTestComponent from "./AddEditTest";
import { useAppDispatch, useAppSelector } from "src/redux/base/hooks";
import { removeTest } from "src/redux/reducers/project";
import { selectSelected } from "src/redux/reducers/selected";
import { selectTester } from "src/redux/reducers/tester";

interface TestsProps {
  tests: (ApiModel | DbModel)[];
  collectionId: number;
}

export default function TestComponent(props: TestsProps) {
  const dispatch = useAppDispatch();
  const selectedProject = useAppSelector(selectSelected);
  const testers = useAppSelector(selectTester);

  const onDeleteClicked = (testId: number) => {
    dispatch(
      removeTest({
        projectId: selectedProject,
        collectionId: props.collectionId,
        testId,
      })
    );
  };

  const isPresent = (testId: number) =>
    testers.findIndex(
      (t) => t.collectionId === props.collectionId && t.testId === testId
    ) > -1;

  const isAsserted = (testId: number) =>
    testers.findIndex(
      (t) =>
        t.collectionId === props.collectionId && t.testId === testId && t.assert
    ) > -1;

  return (
    <>
      {props.tests.map((test, idx) => (
        <Card
          className={`my-auto flex justify-between mb-4 ${
            isPresent(idx)
              ? isAsserted(idx)
                ? "border-green-500"
                : "border-red-500"
              : ""
          }`}
          key={idx}
        >
          <CardHeader
            onClick={() => {}}
            className="cursor-pointer w-full rounded-lg"
          >
            <CardTitle className="flex gap-2">
              {(test as ApiModel).methodType ? (
                <Globe2></Globe2>
              ) : (
                <Database></Database>
              )}
              {test.name}
            </CardTitle>
          </CardHeader>
          <div className="flex align-middle">
            <AddEditTestComponent
              type="EDIT"
              collectionId={props.collectionId}
              test={test}
              testId={idx}
            ></AddEditTestComponent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button
                  size="xs"
                  variant="secondary"
                  className="p-2 my-auto mx-2"
                >
                  <Trash2 color="#ffffff"></Trash2>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Do you really want to delete Test?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your Test.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => onDeleteClicked(idx)}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      ))}
    </>
  );
}
