import React, { useCallback, useEffect, useState } from "react";

import { Play, Plus, Sparkles, Trash2, X } from "lucide-react";

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
import { useAppDispatch } from "src/redux/base/hooks";
import { useForm } from "react-hook-form";
import { addFaker, removeFaker } from "src/redux/reducers/project";
import FillFakerComponent from "./FillFaker";
import { ScrollArea } from "../ui/scroll-area";
import { generateSql, runQuery } from "src/utils";
import { useToast } from "../ui/use-toast";

interface FakerComponentProps {
  projectId: number;
  config: ConfigModel;
  fakers: FakerContainerModel[];
}

export default function FakerComponent(props: FakerComponentProps) {
  const [dialogState, setDialogState] = useState(false);
  const dispatch = useAppDispatch();
  const { toast } = useToast();

  const onDeleteClicked = useCallback(
    (idx: number) => {
      dispatch(removeFaker({ projectId: props.projectId, fakerId: idx }));
    },
    [dispatch, props.projectId]
  );

  const runFaker = useCallback(
    async (fakerId: number) => {
      try {
        const faker = props.fakers[fakerId];
        const sqlString = await generateSql(
          props.config,
          faker.name,
          faker.data
        );
        await runQuery(props.config, sqlString);
        toast({
          description: "Fake data genarated successfully",
          duration: 1000,
        });
      } catch (err) {}
    },
    [props.config, props.fakers, toast]
  );

  return (
    <Dialog open={dialogState}>
      <Button
        className="fixed right-[24px] bottom-[242px] z-100 p-4"
        size="xs"
        variant="secondary"
        type="button"
        onClick={() => setDialogState(true)}
      >
        <Sparkles color="rgb(237, 245, 123)"></Sparkles>
      </Button>

      <DialogContent className="sm:max-w-[896px] h-[90%] block overflow-y-scroll">
        <DialogPrimitive.Close
          onClick={() => setDialogState(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>

        <DialogHeader>
          <DialogTitle>Faker</DialogTitle>
        </DialogHeader>

        <ScrollArea className="h-[90%]">
          {props.fakers.map((faker, idx) => (
            <Card className="my-auto flex justify-between mb-4" key={idx}>
              <CardHeader className="w-full rounded-lg">
                <CardTitle>{faker.name}</CardTitle>
              </CardHeader>

              <div className="flex align-middle">
                <Button
                  className="p-2 my-auto mx-2"
                  size="xs"
                  variant="ghost"
                  onClick={() => runFaker(idx)}
                >
                  <Play color="lightgreen"></Play>
                </Button>

                <FillFakerComponent
                  projectId={props.projectId}
                  faker={faker}
                  fakerId={idx}
                ></FillFakerComponent>

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
                        Do you really want to delete Faker collection?
                      </AlertDialogTitle>
                      <AlertDialogDescription>
                        This action cannot be undone. This will permanently
                        delete your Faker collection.
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
        </ScrollArea>

        <AddFakerComponent projectId={props.projectId}></AddFakerComponent>
      </DialogContent>
    </Dialog>
  );
}

interface AddFakerComponentProps {
  projectId: number;
}

function AddFakerComponent(props: AddFakerComponentProps) {
  const [dialogState, setDialogState] = useState(false);
  const { register, formState, getValues, reset } = useForm();
  const dispatch = useAppDispatch();

  useEffect(() => {
    if (!dialogState) {
      reset();
    }
  }, [dialogState, reset]);

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
          addFaker({ projectId: props.projectId, data: newFakerContainer })
        );

        setDialogState(false);
      }
    },
    [dispatch, formState.isValid, getValues, props.projectId]
  );

  return (
    <Dialog open={dialogState}>
      <Button
        className="absolute right-[24px] bottom-[24px] z-100 p-4"
        size="xs"
        variant="secondary"
        onClick={() => setDialogState(true)}
      >
        <Plus color="#ffffff"></Plus>
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
          <DialogTitle>Add Faker</DialogTitle>
        </DialogHeader>

        <form className="grid gap-4 py-4" onSubmit={(e) => onAddClick(e)}>
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
