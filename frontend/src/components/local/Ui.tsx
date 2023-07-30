import React, { useCallback, useEffect, useState } from "react";

import { Play, Plus, Trash2, X, Edit, Save } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardHeader, CardTitle } from "../ui/card";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import {
  UiContainerModel,
  UiEvent,
  UiTestModel,
} from "src/redux/models/project";
import {
  AlertDialog,
  AlertDialogTrigger,
  AlertDialogContent,
  AlertDialogTitle,
  AlertDialogDescription,
  AlertDialogCancel,
  AlertDialogAction,
} from "../ui/alert-dialog";
import { AlertDialogHeader, AlertDialogFooter } from "../ui/alert-dialog";
import { Input } from "../ui/input";
import { useAppDispatch, useAppSelector } from "src/redux/base/hooks";
import { useForm } from "react-hook-form";
import {
  addUi,
  removeUi,
  selectProject,
  updateUi,
  updateUiTests,
} from "src/redux/reducers/project";
import { useParams } from "react-router-dom";
import { setCollectionName } from "src/redux/reducers/app";
import { ScrollArea } from "@radix-ui/react-scroll-area";
import Select from "react-select";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { Switch } from "../ui/switch";
import { runUiTest } from "src/utils";

export default function Ui() {
  const projects = useAppSelector(selectProject);
  const dispatch = useAppDispatch();
  const params = useParams();
  const projectId = parseInt(params.projectId ?? "-1");

  useEffect(() => {
    dispatch(setCollectionName(projects[projectId].name));
  }, [dispatch, projectId, projects]);

  const onDeleteClicked = useCallback(
    (idx: number) => {
      dispatch(removeUi({ projectId: projectId, uiId: idx }));
    },
    [dispatch, projectId]
  );

  const runUiTests = useCallback(
    async (uiId: number) => {
      try {
        await runUiTest(projectId, uiId);
      } catch (error) {}
    },
    [projectId]
  );

  return (
    <div className="my-8 w-full">
      {projects[projectId].uis.map((ui, idx) => (
        <Card className="my-auto flex justify-between mb-4" key={idx}>
          <FillUiComponent
            projectId={projectId}
            uiTest={ui}
            uiTestId={idx}
          ></FillUiComponent>

          <div className="flex align-middle">
            <Button
              className="p-2 my-auto mx-2"
              size="xs"
              variant="ghost"
              onClick={() => runUiTests(idx)}
            >
              <Play color="lightgreen"></Play>
            </Button>

            <AddEditUiComponent
              type="EDIT"
              projectId={projectId}
              data={ui}
              idx={idx}
              key={idx}
            ></AddEditUiComponent>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="xs" variant="ghost" className="p-2 my-auto mx-2">
                  <Trash2 color="rgb(239 68 68)"></Trash2>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Do you really want to delete Ui tests?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your Ui tests.
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

      <AddEditUiComponent type="ADD" projectId={projectId}></AddEditUiComponent>
    </div>
  );
}

interface AddEditUiComponentProps {
  type: "ADD" | "EDIT";
  projectId: number;
  idx?: number;
  data?: UiContainerModel;
}

function AddEditUiComponent(props: AddEditUiComponentProps) {
  const [dialogState, setDialogState] = useState(false);
  const dispatch = useAppDispatch();

  const formSchema = z.object({
    name: z.string({ required_error: "Name is required" }).min(1).max(25),
    screenshots: z.boolean().optional().default(false),
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
      form.setValue("name", props.data?.name ?? "");
      form.setValue("screenshots", props.data?.screenshots ?? false);
    }
  }, [form, props.data, props.type]);

  const onAddClick = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = form.getValues();
      const isValid = form.formState.isValid;

      if (isValid) {
        const newUiContainer: UiContainerModel = {
          name: formData.name,
          data: [],
          screenshots: formData.screenshots,
        };
        dispatch(addUi({ projectId: props.projectId, data: newUiContainer }));

        setDialogState(false);
      }
    },
    [dispatch, form, props.projectId]
  );

  const onUpdateClick = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = form.getValues();
      const isValid = form.formState.isValid;

      if (isValid) {
        const newUiContainer: UiContainerModel = {
          name: formData.name,
          data: props.data?.data ?? [],
          screenshots: formData.screenshots,
        };
        dispatch(
          updateUi({
            projectId: props.projectId,
            data: newUiContainer,
            uiId: props.idx ?? -1,
          })
        );

        setDialogState(false);
      }
    },
    [dispatch, form, props.data?.data, props.idx, props.projectId]
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
          <Plus color="#ffffff"></Plus>
        ) : (
          <Edit color="#ffffff"></Edit>
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
          <DialogTitle>{props.type === "ADD" ? "Add" : "Edit"} Ui</DialogTitle>
        </DialogHeader>

        <Form {...form}>
          <form
            className="grid gap-4 py-4"
            onSubmit={(e) =>
              props.type === "ADD" ? onAddClick(e) : onUpdateClick(e)
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
                      placeholder="Enter Ui Name"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="screenshots"
              defaultValue={false}
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Screenshots</FormLabel>
                  <FormControl>
                    <Switch
                      className="col-span-3"
                      checked={field.value}
                      onCheckedChange={field.onChange}
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

interface FillUiComponentProps {
  projectId: number;
  uiTestId: number;
  uiTest: UiContainerModel;
}

type NumberBooleanMap = {
  [key: number]: boolean;
};

function FillUiComponent(props: FillUiComponentProps) {
  const [dialogState, setDialogState] = useState(false);
  const [uiTestList, setUiTestList] = useState<UiTestModel[]>([]);
  const [dirtyList, setDirtyList] = useState<NumberBooleanMap>({});
  const dispatch = useAppDispatch();

  useEffect(() => {
    setUiTestList(props.uiTest.data);
  }, [props.uiTest.data]);

  const updateUiData = useCallback(
    (uiData: UiTestModel[]) => {
      dispatch(
        updateUiTests({
          projectId: props.projectId,
          uiId: props.uiTestId,
          data: uiData,
        })
      );
      setDirtyList({});
    },
    [dispatch, props.projectId, props.uiTestId]
  );

  const onDeleteClicked = useCallback(
    (idx: number) => {
      const updatedUiList = [...uiTestList.filter((_, id) => id !== idx)];
      setUiTestList(updatedUiList);
      updateUiData(updatedUiList);
    },
    [uiTestList, updateUiData]
  );

  const onAddClick = useCallback(() => {
    setUiTestList([
      ...uiTestList,
      {
        selector: "",
        input: "",
        event: "",
      },
    ]);
  }, [uiTestList]);

  const onUiDataChange = useCallback(
    (uiTestId: number, data: any) => {
      setUiTestList([
        ...uiTestList.map((fak, idx) =>
          idx === uiTestId ? { ...fak, ...data } : fak
        ),
      ]);

      setDirtyList({
        ...dirtyList,
        [uiTestId]: true,
      });
    },
    [dirtyList, uiTestList]
  );

  const UiEventOptions = useCallback(() => {
    return UiEvent.map((fk) => ({
      value: fk,
      label: fk,
    }));
  }, []);

  return (
    <Dialog open={dialogState}>
      <CardHeader
        onClick={() => setDialogState(true)}
        className="cursor-pointer hover:bg-[#050b1a] w-full rounded-lg"
      >
        <CardTitle>{props.uiTest.name}</CardTitle>
      </CardHeader>

      <DialogContent className="sm:max-w-[896px] h-[90%] block overflow-y-scroll">
        <DialogPrimitive.Close
          onClick={() => setDialogState(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>

        <DialogHeader>
          <DialogTitle>Ui Tests</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[90%]">
          {uiTestList?.map((uiTest, idx) => (
            <Card
              className={`my-auto flex justify-between mb-4 rounded-none`}
              key={idx}
            >
              <CardHeader className="flex gap-2 w-full">
                <Input
                  value={uiTest.selector}
                  type="text"
                  onChange={(event) =>
                    onUiDataChange(idx, { selector: event.target.value })
                  }
                  placeholder="Selector"
                ></Input>

                <Input
                  value={uiTest.input}
                  type="text"
                  onChange={(event) =>
                    onUiDataChange(idx, { input: event.target.value })
                  }
                  placeholder="Input"
                ></Input>

                <Select
                  className="w-full"
                  theme={(theme) => ({
                    ...theme,
                    borderRadius: 4,
                    colors: {
                      ...theme.colors,
                      primary: "#1d283a",
                      neutral0: "#030711",
                      primary25: "#0d1324",
                      neutral20: "#1d283a",
                      neutral30: "#1d283a",
                      neutral80: "#ffffff",
                    },
                  })}
                  value={{ value: uiTest.event, label: uiTest.event }}
                  onChange={(event) =>
                    onUiDataChange(idx, { event: event?.value })
                  }
                  options={UiEventOptions()}
                  isSearchable={true}
                ></Select>
              </CardHeader>

              <div className="flex align-middle">
                <Button
                  size="xs"
                  variant="secondary"
                  className="p-2 my-auto mx-2"
                  onClick={() => onDeleteClicked(idx)}
                >
                  <Trash2></Trash2>
                </Button>
              </div>
            </Card>
          ))}
        </ScrollArea>

        <Button
          disabled={Object.keys(dirtyList).length < 1}
          size="xs"
          variant="secondary"
          className="absolute right-[24px] bottom-[96px] z-100 p-4"
          onClick={() => updateUiData(uiTestList)}
        >
          <Save color="lightgreen"></Save>
        </Button>

        <Button
          className="absolute right-[24px] bottom-[24px] z-100 p-4"
          size="xs"
          variant="secondary"
          onClick={() => onAddClick()}
        >
          <Plus color="#ffffff"></Plus>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
