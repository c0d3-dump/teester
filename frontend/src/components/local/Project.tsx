import React, { useCallback, useEffect, useState } from "react";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { ProjectModel } from "src/redux/models/project";
import { Button } from "../ui/button";
import { Edit, Plus, Trash2, X } from "lucide-react";
import { useForm } from "react-hook-form";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
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
import { Label } from "../ui/label";
import { Input } from "../ui/input";
import { useAppDispatch, useAppSelector } from "src/redux/base/hooks";
import {
  addProject,
  removeProject,
  selectProject,
  updateProject,
} from "src/redux/reducers/project";
import { useNavigate } from "react-router-dom";
import { Textarea } from "../ui/textarea";

export default function Project() {
  const dispatch = useAppDispatch();
  const projects = useAppSelector(selectProject);
  const navigate = useNavigate();

  const onCardClick = useCallback(
    (idx: number) => {
      navigate(`/${idx}`);
    },
    [navigate]
  );

  const onDeleteClicked = useCallback(
    (idx: number) => {
      dispatch(removeProject(idx));
    },
    [dispatch]
  );

  interface CardComponentProps {
    idx: number;
    name: string;
  }

  const CardComponent = (props: CardComponentProps) => (
    <Card className="my-auto flex justify-between mb-4">
      <CardHeader
        onClick={() => onCardClick(props.idx)}
        className="cursor-pointer hover:bg-[#050b1a] w-full rounded-lg"
      >
        <CardTitle>{props.name}</CardTitle>
      </CardHeader>
      <div className="flex align-middle">
        <AddEditProjectComponent
          type="EDIT"
          idx={props.idx}
          data={projects[props.idx]}
        ></AddEditProjectComponent>

        <AlertDialog>
          <AlertDialogTrigger asChild>
            <Button size="xs" variant="ghost" className="p-2 my-auto mx-2">
              <Trash2 color="rgb(239 68 68)"></Trash2>
            </Button>
          </AlertDialogTrigger>
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Do you really want to delete Project?
              </AlertDialogTitle>
              <AlertDialogDescription>
                This action cannot be undone. This will permanently delete your
                project.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel>Cancel</AlertDialogCancel>
              <AlertDialogAction onClick={() => onDeleteClicked(props.idx)}>
                Continue
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </div>
    </Card>
  );

  return (
    <>
      <div className="my-8">
        {projects.map((proj, idx) => {
          return (
            <CardComponent name={proj.name} idx={idx} key={idx}></CardComponent>
          );
        })}
      </div>

      <AddEditProjectComponent type="ADD"></AddEditProjectComponent>
    </>
  );
}

interface AddEditProjectComponentProps {
  type: "ADD" | "EDIT";
  idx?: number;
  data?: ProjectModel;
}

function AddEditProjectComponent(props: AddEditProjectComponentProps) {
  const [dialogState, setDialogState] = useState(false);
  const { setValue, register, formState, getValues, reset } = useForm();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (props.type === "ADD" && !dialogState) {
      reset();
    }
  }, [dialogState, props.type, reset]);

  useEffect(() => {
    if (props.type === "EDIT") {
      setValue("name", props.data?.name);
      setValue("host", props.data?.config.host);
      setValue("dbType", props.data?.config.dbType);
      setValue("dbUrl", props.data?.config.dbUrl);
      setValue("header", props.data?.config.header);
    }
  }, [props.data, props.type, setValue]);

  const onAddClick = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = getValues();
      const isValid = formState.isValid;

      if (isValid) {
        const newProject: ProjectModel = {
          name: formData.name,
          config: {
            host: formData.host,
            dbType: formData.dbType,
            dbUrl: formData.dbUrl,
            header: formData.header,
          },
          collections: [],
          fakers: [],
        };
        dispatch(addProject(newProject));

        setDialogState(false);
      }
    },
    [dispatch, formState.isValid, getValues]
  );

  const onUpdateClicked = useCallback(
    (e: React.FormEvent<HTMLFormElement>, idx: number | undefined) => {
      e.preventDefault();

      const formData = getValues();
      const isValid = formState.isValid;

      if (isValid) {
        const updatedProject: ProjectModel = {
          name: formData.name,
          config: {
            host: formData.host,
            dbType: formData.dbType,
            dbUrl: formData.dbUrl,
            header: formData.header,
          },
          collections: props.data?.collections ?? [],
          fakers: props.data?.fakers ?? [],
        };

        dispatch(
          updateProject({
            idx: idx ?? -1,
            data: updatedProject,
          })
        );

        setDialogState(false);
      }
    },
    [
      dispatch,
      formState.isValid,
      getValues,
      props.data?.collections,
      props.data?.fakers,
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
            {props.type === "ADD" ? "Add" : "Edit"} Project
          </DialogTitle>
        </DialogHeader>

        <form
          className="grid gap-4 py-4"
          onSubmit={(e) =>
            props.type === "ADD" ? onAddClick(e) : onUpdateClicked(e, props.idx)
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
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="host" className="text-right">
              Host
            </Label>
            <Input
              {...register("host", { required: true })}
              id="host"
              type="text"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dbType" className="text-right">
              DB Type
            </Label>
            <select
              {...register("dbType", { required: true })}
              className="h-10 w-[278px] items-center justify-between rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <option value="SQLITE">SQLITE</option>
              <option value="MYSQL">MYSQL</option>
            </select>
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="dbUrl" className="text-right">
              DB Url
            </Label>
            <Input
              {...register("dbUrl", { required: true })}
              id="dbUrl"
              type="text"
              className="col-span-3"
            />
          </div>
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="header" className="text-right">
              Header
            </Label>
            <Textarea
              {...register("header", { required: false })}
              id="header"
              className="col-span-3 h-36"
            />
          </div>

          <DialogFooter>
            <Button
              type="submit"
              disabled={!formState.isValid || !formState.isDirty}
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
