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
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "../ui/dialog";
import { Button } from "../ui/button";
import { AlertTriangle, Database, Globe2, Info, Trash2 } from "lucide-react";
import AddEditTestComponent from "./AddEditTest";
import { useAppDispatch, useAppSelector } from "src/redux/base/hooks";
import { refreshCollection, removeTest } from "src/redux/reducers/project";
import { selectTester } from "src/redux/reducers/tester";
import { useCallback, useEffect, useRef, useState } from "react";
import { clearTester } from "src/redux/reducers/tester";
import { useParams } from "react-router-dom";
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { Textarea } from "../ui/textarea";

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

  const onDeleteClicked = useCallback(
    (testId: number) => {
      dispatch(clearTester());

      dispatch(
        removeTest({
          projectId,
          collectionId: props.collectionId,
          testId,
        })
      );
    },
    [dispatch, projectId, props.collectionId]
  );

  const isPresent = useCallback(
    (testId: number) =>
      testers.findIndex(
        (t) => t.collectionId === props.collectionId && t.testId === testId
      ) > -1,
    [props.collectionId, testers]
  );

  const isAsserted = useCallback(
    (testId: number) =>
      testers.findIndex(
        (t) =>
          t.collectionId === props.collectionId &&
          t.testId === testId &&
          t.assert
      ) > -1,
    [props.collectionId, testers]
  );

  const dragItem = useRef<number | null>(null);
  const dragOverItem = useRef<number | null>(null);

  const onDragStart = useCallback((index: number) => {
    dragItem.current = index;
  }, []);

  const onDragEnter = useCallback((index: number) => {
    dragOverItem.current = index;
  }, []);

  const onDragOver = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    setDimState(dragOverItem.current ?? -1);
  }, []);

  const handleSort = useCallback(() => {
    const list = [...testListState];

    const item = list.splice(dragItem.current ?? 0, 1)[0];
    list.splice(dragOverItem.current ?? 0, 0, item);

    return list;
  }, [testListState]);

  const onDragEnd = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
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
    },
    [dispatch, handleSort, projectId, props.collectionId]
  );

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
            {(test as ApiModel).methodType && isPresent(idx) && (
              <DiffResultComponent
                collectionId={props.collectionId}
                test={test as ApiModel}
                testId={idx}
              ></DiffResultComponent>
            )}
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

interface DiffResultComponentProps {
  collectionId: number;
  test: ApiModel;
  testId: number;
}

export function DiffResultComponent(props: DiffResultComponentProps) {
  const testers = useAppSelector(selectTester);

  const tester = useCallback(
    () =>
      testers.find(
        (t) =>
          t.collectionId === props.collectionId && t.testId === props.testId
      ),
    [props.collectionId, props.testId, testers]
  );

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="ghost" className="p-2 my-auto" size="xs">
          {tester()?.assert ? (
            <Info color="rgb(34 197 94)"></Info>
          ) : (
            <AlertTriangle color="rgb(239 68 68)"></AlertTriangle>
          )}
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[896px] max-h-[90%] block overflow-y-scroll">
        <DialogHeader>
          <DialogTitle>Diff</DialogTitle>
        </DialogHeader>
        <div className="mt-4 mb-4">
          <div className="flex gap-4 mb-4">
            <div className="space-y-4 grow">
              <Label htmlFor="expected" className="flex justify-center">
                Expected
              </Label>
              <Input
                type="text"
                disabled
                value={props.test.assertion.status}
              ></Input>
            </div>

            <div className="space-y-4 grow">
              <Label htmlFor="response" className="flex justify-center">
                Response
              </Label>
              <Input type="text" disabled value={tester()?.status}></Input>
            </div>
          </div>

          <div className="flex gap-4">
            <div className="space-y-4 grow">
              <Textarea
                id="expected"
                className="col-span-3 h-[464px]"
                readOnly
                defaultValue={props.test.assertion.body}
              />
            </div>

            <div className="space-y-4 grow">
              <Textarea
                id="response"
                className="col-span-3 h-[464px]"
                readOnly
                defaultValue={JSON.stringify(tester()?.body, null, 2)}
              />
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
