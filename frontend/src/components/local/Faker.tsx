import React, { useCallback, useEffect, useState } from "react";

import { Edit, Play, Plus, Trash2, X } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card } from "../ui/card";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { ConfigModel, FakerContainerModel } from "src/redux/models/project";
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
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useAppDispatch, useAppSelector } from "src/redux/base/hooks";
import { useForm } from "react-hook-form";
import {
  addFaker,
  removeFaker,
  selectProject,
  updateFaker,
} from "src/redux/reducers/project";
import FillFakerComponent from "./FillFaker";
import { generateSql, runQuery } from "src/utils";
import { toast } from "react-toastify";
import { useParams } from "react-router-dom";
import { setCollectionName } from "src/redux/reducers/app";

export default function Faker() {
  const projects = useAppSelector(selectProject);
  const dispatch = useAppDispatch();
  const params = useParams();
  const projectId = parseInt(params.projectId ?? "-1");

  useEffect(() => {
    dispatch(setCollectionName(projects[projectId].name));
  }, [dispatch, projectId, projects]);

  const onDeleteClicked = useCallback(
    (idx: number) => {
      dispatch(removeFaker({ projectId: projectId, fakerId: idx }));
    },
    [dispatch, projectId]
  );

  return (
    <div className="my-8 w-full">
      {projects[projectId].fakers.map((faker, idx) => (
        <Card className="my-auto flex justify-between mb-4" key={idx}>
          <FillFakerComponent
            projectId={projectId}
            faker={faker}
            fakerId={idx}
          ></FillFakerComponent>

          <div className="flex align-middle">
            <RunFakerComponent
              projectId={projectId}
              config={projects[projectId].config}
              faker={faker}
            ></RunFakerComponent>

            <AddEditFakerComponent
              type="EDIT"
              projectId={projectId}
              idx={idx}
              data={faker}
              key={idx}
            ></AddEditFakerComponent>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="xs" variant="ghost" className="p-2 my-auto mx-2">
                  <Trash2 color="rgb(239 68 68)"></Trash2>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Do you really want to delete Faker collection?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your Faker collection.
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

      <AddEditFakerComponent
        type="ADD"
        projectId={projectId}
      ></AddEditFakerComponent>
    </div>
  );
}

interface AddEditFakerComponentProps {
  type: "ADD" | "EDIT";
  projectId: number;
  idx?: number;
  data?: FakerContainerModel;
}

function AddEditFakerComponent(props: AddEditFakerComponentProps) {
  const [dialogState, setDialogState] = useState(false);
  const { register, formState, getValues, reset, setValue } = useForm();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (props.type === "ADD" && !dialogState) {
      reset();
    }
  }, [dialogState, props.type, reset]);

  useEffect(() => {
    if (props.type === "EDIT") {
      setValue("name", props.data?.name ?? "");
    }
  }, [props.data, props.type, setValue]);

  const onAddClick = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = getValues();
      const isValid = formState.isValid;

      if (isValid) {
        const newFakerContainer: FakerContainerModel = {
          name: formData.name,
          data: [],
        };
        dispatch(
          addFaker({
            projectId: props.projectId,
            data: newFakerContainer,
          })
        );

        setDialogState(false);
      }
    },
    [dispatch, formState.isValid, getValues, props.projectId]
  );

  const onUpdateClick = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = getValues();
      const isValid = formState.isValid;

      if (isValid) {
        const newFakerContainer: FakerContainerModel = {
          name: formData.name,
          data: props.data?.data ?? [],
        };
        dispatch(
          updateFaker({
            projectId: props.projectId,
            data: newFakerContainer,
            fakerId: props.idx ?? -1,
          })
        );

        setDialogState(false);
      }
    },
    [
      dispatch,
      formState.isValid,
      getValues,
      props.data?.data,
      props.idx,
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
          <DialogTitle>
            {props.type === "ADD" ? "Add" : "Edit"} Faker
          </DialogTitle>
        </DialogHeader>

        <form
          className="grid gap-4 py-4"
          onSubmit={(e) =>
            props.type === "ADD" ? onAddClick(e) : onUpdateClick(e)
          }
        >
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="name" className="text-right">
              Name
            </Label>
            <Input
              {...register("name", { required: true })}
              id="name"
              type="text"
              className="col-span-3"
              placeholder="Table Name"
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!formState.isValid}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}

interface RunFakerComponentProps {
  projectId: number;
  config: ConfigModel;
  faker: FakerContainerModel;
}

function RunFakerComponent(props: RunFakerComponentProps) {
  const [dialogState, setDialogState] = useState(false);
  const { register, formState, reset, getValues } = useForm();

  useEffect(() => {
    if (!dialogState) {
      reset();
    }
  }, [dialogState, reset]);

  const runFaker = useCallback(
    async (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      try {
        const formData = getValues();
        const isValid = formState.isValid;

        if (isValid) {
          for (let index = 0; index < formData.count; index++) {
            const faker = props.faker;
            const sqlString = await generateSql(
              props.config,
              faker.name,
              faker.data
            );
            await runQuery(props.config, sqlString);
          }

          toast.success("Fake data genarated successfully");
        }
      } catch (err) {}

      setDialogState(false);
    },
    [formState.isValid, getValues, props.config, props.faker]
  );

  return (
    <Dialog open={dialogState}>
      <Button
        className="p-2 my-auto mx-2"
        size="xs"
        variant="ghost"
        onClick={() => setDialogState(true)}
      >
        <Play color="lightgreen"></Play>
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
          <DialogTitle>Run Faker</DialogTitle>
        </DialogHeader>

        <form className="grid gap-4 py-4" onSubmit={(e) => runFaker(e)}>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="count" className="text-right">
              Count
            </Label>
            <Input
              {...register("count", { required: true })}
              defaultValue={1}
              id="count"
              type="number"
              className="col-span-3"
              min={1}
            />
          </div>

          <DialogFooter>
            <Button type="submit" disabled={!formState.isValid}>
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
