import React, { useCallback, useEffect, useState } from "react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Button } from "../ui/button";
import {
  AlertTriangle,
  CheckCircle2,
  Edit,
  Play,
  Plus,
  Trash2,
  X,
} from "lucide-react";

import { Input } from "../ui/input";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useAppDispatch, useAppSelector } from "src/redux/base/hooks";
import { useForm } from "react-hook-form";
import {
  addCollection,
  removeCollection,
  selectProject,
  updateCollection,
} from "src/redux/reducers/project";
import { ApiModel, CollectionModel, DbModel } from "src/redux/models/project";
import {
  isDeepEqual,
  runApi,
  runQuery,
  extractVariables,
  replaceTokens,
  extractFakerVariables,
} from "src/utils";
import {
  addTester,
  clearTester,
  selectTester,
} from "src/redux/reducers/tester";
import { useNavigate, useParams } from "react-router-dom";
import { setCollectionName } from "src/redux/reducers/app";
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
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";

export default function Collection() {
  const projects = useAppSelector(selectProject);
  const dispatch = useAppDispatch();
  const testers = useAppSelector(selectTester);
  const params = useParams();
  const projectId = parseInt(params.projectId ?? "-1");
  const navigate = useNavigate();

  const onDeleteClicked = (idx: number) => {
    dispatch(clearTester());
    dispatch(removeCollection({ projectId, collectionId: idx }));
  };

  useEffect(() => {
    dispatch(setCollectionName(projects[projectId].name));
  }, [dispatch, projectId, projects]);

  const checkSuccess = (collectionId: number) => {
    const tempTesters = testers.filter(
      (tester) => tester.collectionId === collectionId
    );

    if (tempTesters.length <= 0) return null;
    return tempTesters.filter((tester) => !tester.assert).length <= 0;
  };

  const runTests = useCallback(
    async (collectionId: number) => {
      dispatch(clearTester());

      const config = projects[projectId].config;
      const testList = projects[projectId].collections[collectionId].tests;
      let variables = {};

      for (let testId = 0; testId < testList.length; testId++) {
        const test = testList[testId];

        if ((test as ApiModel).methodType) {
          const apiModel: any = { ...test };

          try {
            const configHeader = JSON.parse(
              config.header ? config.header : "{}"
            );

            const vars = extractFakerVariables(apiModel.header);

            const header = replaceTokens(apiModel.header, {
              ...variables,
              ...vars,
            });
            apiModel.header = header ? JSON.parse(header) : {};

            apiModel.header = {
              ...configHeader,
              ...apiModel.header,
            };
          } catch (error) {
            apiModel.header = {};
          }

          try {
            const vars = extractFakerVariables(apiModel.body);

            const body = replaceTokens(apiModel.body, {
              ...variables,
              ...vars,
            });
            apiModel.body = JSON.parse(body);
          } catch (error) {
            apiModel.body = {};
          }

          const res = await runApi(
            config.host,
            apiModel,
            config.withCredentials
          );

          let assertValue = false;
          if (
            res.status === parseInt(apiModel.assertion.status.toString()) &&
            (apiModel.assertion.body.length < 1 ||
              isDeepEqual(JSON.parse(apiModel.assertion.body), res.data))
          ) {
            variables = {
              ...variables,
              ...extractVariables(
                res.data,
                apiModel.assertion.body.length < 1
                  ? {}
                  : JSON.parse(apiModel.assertion.body)
              ),
            };

            assertValue = true;
          }

          let parsedBodyData;
          try {
            parsedBodyData = JSON.parse(res.data);
          } catch (error) {
            parsedBodyData = res.data;
          }

          dispatch(
            addTester({
              collectionId,
              testId: testId,
              assert: assertValue,
              status: res.status,
              body: parsedBodyData,
            })
          );
        } else {
          let assertValue = false;
          try {
            const dbModel = test as DbModel;
            await runQuery(config, dbModel.query);
            assertValue = true;
          } catch (error) {}

          dispatch(
            addTester({
              collectionId,
              testId: testId,
              assert: assertValue,
            })
          );
        }
      }
    },
    [dispatch, projectId, projects]
  );

  const goToTest = (collectionId: number) => {
    navigate(`/${projectId}/${collectionId}`);
  };

  return (
    <>
      <div className="my-8">
        {projects[projectId].collections.map((col, idx) => {
          return (
            <Card className="my-auto flex justify-between mb-4" key={idx}>
              <CardHeader
                onClick={() => goToTest(idx)}
                className="cursor-pointer hover:bg-[#050b1a] w-full rounded-lg"
              >
                <CardTitle>{col.name}</CardTitle>
              </CardHeader>

              <Button
                type="button"
                variant="ghost"
                className="p-2 my-auto pointer-events-none"
                size="xs"
              >
                {checkSuccess(idx) === null ? (
                  <></>
                ) : checkSuccess(idx) ? (
                  <CheckCircle2 color="rgb(34 197 94)"></CheckCircle2>
                ) : (
                  <AlertTriangle color="rgb(239 68 68)"></AlertTriangle>
                )}
              </Button>

              <div className="flex align-middle">
                {col.tests.length > 0 ? (
                  <Button
                    className="p-2 my-auto mx-2"
                    size="xs"
                    variant="ghost"
                    onClick={() => runTests(idx)}
                  >
                    <Play color="lightgreen"></Play>
                  </Button>
                ) : (
                  <></>
                )}

                <AddEditCollectionComponent
                  type="EDIT"
                  projectId={projectId}
                  collection={col}
                  collectionId={idx}
                ></AddEditCollectionComponent>

                <AlertDialog>
                  <AlertDialogTrigger asChild>
                    <Button
                      size="xs"
                      variant="ghost"
                      className="p-2 my-auto mx-2"
                    >
                      <Trash2 color="rgb(239 68 68)"></Trash2>
                    </Button>
                  </AlertDialogTrigger>
                  <AlertDialogContent>
                    <AlertDialogHeader>
                      <AlertDialogTitle>
                        Do you really want to delete Collection?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your Collection.
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
          );
        })}
      </div>

      <AddEditCollectionComponent
        type="ADD"
        projectId={projectId}
      ></AddEditCollectionComponent>
    </>
  );
}

interface AddEditCollectionComponentProps {
  type: "ADD" | "EDIT";
  projectId: number;
  collection?: CollectionModel;
  collectionId?: number;
}

function AddEditCollectionComponent(props: AddEditCollectionComponentProps) {
  const [dialogState, setDialogState] = useState(false);
  const dispatch = useAppDispatch();

  const formSchema = z.object({
    name: z.string({ required_error: "Name is required" }).min(1).max(25),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (props.type === "ADD" && !dialogState) {
      form.reset();
    }
  }, [dialogState, form, props.type]);

  useEffect(() => {
    if (props.type === "EDIT") {
      form.setValue("name", props.collection?.name ?? "");
    }
  }, [form, props.collection?.name, props.type]);

  const onAddClicked = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = form.getValues();
      const isValid = form.formState.isValid;

      if (isValid) {
        const newCollection: CollectionModel = {
          name: formData.name,
          tests: [],
        };
        dispatch(clearTester());

        dispatch(
          addCollection({ data: newCollection, projectId: props.projectId })
        );

        setDialogState(false);
      }
    },
    [dispatch, form, props.projectId]
  );

  const onUpdateClicked = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = form.getValues();
      const isValid = form.formState.isValid;

      if (isValid) {
        const updatedCollection: CollectionModel = {
          name: formData.name,
          tests: props.collection?.tests ?? [],
        };
        dispatch(clearTester());

        dispatch(
          updateCollection({
            data: updatedCollection,
            projectId: props.projectId,
            collectionId: props.collectionId ?? -1,
          })
        );

        setDialogState(false);
      }
    },
    [
      dispatch,
      form,
      props.collection?.tests,
      props.collectionId,
      props.projectId,
    ]
  );

  return (
    <Dialog open={dialogState}>
      <Button
        className={
          props.type === "ADD"
            ? "fixed right-[24px] bottom-[24px] z-100 p-4"
            : "p-2 my-auto ml-2"
        }
        size="xs"
        variant={props.type === "ADD" ? "secondary" : "ghost"}
        onClick={() => setDialogState(true)}
      >
        {props.type === "ADD" ? (
          <Plus color="lightblue" size={24}></Plus>
        ) : (
          <Edit color="lightgrey" size={24}></Edit>
        )}
      </Button>

      <DialogContent className="sm:max-w-[425px]">
        <DialogPrimitive.Close
          onClick={() => setDialogState(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>

        <DialogHeader>
          <DialogTitle>{props.type} Collection</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="grid gap-4 py-4"
            onSubmit={(e) =>
              props.type === "ADD" ? onAddClicked(e) : onUpdateClicked(e)
            }
          >
            <FormField
              control={form.control}
              name="name"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Name</FormLabel>
                  <FormControl>
                    <Input
                      className="col-span-3"
                      placeholder="Enter Collection Name"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <DialogFooter>
              <Button type="submit" disabled={!form.formState.isValid}>
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
