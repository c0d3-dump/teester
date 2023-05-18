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
import { refreshCollection, removeTest } from "src/redux/reducers/project";
import { selectTester } from "src/redux/reducers/tester";
import { useEffect, useRef, useState } from "react";
import { clearTester } from "src/redux/reducers/tester";
import { useParams } from "react-router-dom";

interface TestsProps {
  tests: (ApiModel | DbModel)[];
  collectionId: number;
}

export default function TestComponent(props: TestsProps) {
  const dispatch = useAppDispatch();
  const testers = useAppSelector(selectTester);
  const [testListState, setTestListState] = useState<(ApiModel | DbModel)[]>(
    []
  );
  const [dimState, setDimState] = useState(-1);
  const params = useParams();
  const projectId = parseInt(params.projectId ?? "-1");

  useEffect(() => {
    setTestListState(props.tests);
  }, [props.tests, testListState.length]);

  const onDeleteClicked = (testId: number) => {
    dispatch(clearTester());

    dispatch(
      removeTest({
        projectId,
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

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const onDragStart = (index: number) => {
    dragItem.current = index;
  };

  const onDragEnter = (index: number) => {
    dragOverItem.current = index;
  };

  const onDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();

    setDimState(dragOverItem.current ?? -1);
  };

  const onDragEnd = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDimState(-1);
    const list = handleSort();

    setTestListState(list);

    dispatch(clearTester());

    dispatch(
      refreshCollection({
        projectId,
        collectionId: props.collectionId,
        data: list,
      })
    );
  };

  const handleSort = () => {
    const list = [...testListState];

    const item = list.splice(dragItem.current ?? 0, 1)[0];
    list.splice(dragOverItem.current ?? 0, 0, item);

    return list;
  };

  return (
    <>
      {props.tests.map((test, idx) => (
        <Card
          draggable
          onDragStart={() => onDragStart(idx)}
          onDragEnter={() => onDragEnter(idx)}
          onDragEnd={onDragEnd}
          onDragOver={onDragOver}
          className={`my-auto flex justify-between mb-4 rounded-none ${
            isPresent(idx)
              ? isAsserted(idx)
                ? "border-green-500"
                : "border-red-500"
              : ""
          } ${dimState === idx ? "border-yellow-400" : ""}`}
          key={idx}
        >
          <CardHeader onClick={() => {}} className="cursor-pointer w-full">
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
