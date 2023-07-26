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
import * as z from "zod";
import { Switch } from "../ui/switch";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

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
  const dispatch = useAppDispatch();

  const formSchema = z.object({
    name: z.string({ required_error: "Name is required" }).max(25),
    host: z.string({ required_error: "Host is required" }).max(100),
    dbType: z.string({ required_error: "Database type is required" }),
    dbUrl: z.string({ required_error: "Databse url is required" }).max(100),
    header: z.string().max(200).default("{}"),
    withCredentials: z.boolean().default(false),
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
      form.setValue("host", props.data?.config.host ?? "");
      form.setValue("dbType", props.data?.config.dbType ?? "SQLITE");
      form.setValue("dbUrl", props.data?.config.dbUrl ?? "");
      form.setValue("header", props.data?.config.header ?? "{}");
      form.setValue(
        "withCredentials",
        props.data?.config.withCredentials ?? false
      );
    }
  }, [form, props.data, props.type]);

  const onAddClick = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = form.getValues();
      const isValid = form.formState.isValid;

      if (isValid) {
        const newProject: ProjectModel = {
          name: formData.name,
          config: {
            host: formData.host,
            dbType: formData.dbType,
            dbUrl: formData.dbUrl,
            header: formData.header,
            withCredentials: formData.withCredentials,
          },
          collections: [],
          fakers: [],
        };
        dispatch(addProject(newProject));

        setDialogState(false);
      }
    },
    [dispatch, form]
  );

  const onUpdateClicked = useCallback(
    (e: React.FormEvent<HTMLFormElement>, idx: number | undefined) => {
      e.preventDefault();

      const formData = form.getValues();
      const isValid = form.formState.isValid;

      if (isValid) {
        const updatedProject: ProjectModel = {
          name: formData.name,
          config: {
            host: formData.host,
            dbType: formData.dbType,
            dbUrl: formData.dbUrl,
            header: formData.header,
            withCredentials: formData.withCredentials,
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
    [dispatch, form, props.data?.collections, props.data?.fakers]
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

      <DialogContent className="sm:max-w-[425px] max-h-[95%] overflow-y-scroll">
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

        {/* TODO: add autoform here!!! */}

        <Form {...form}>
          <form
            onSubmit={(e) => {
              props.type === "ADD"
                ? onAddClick(e)
                : onUpdateClicked(e, props.idx);
            }}
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
                      placeholder="name"
                      {...field}
                    ></Input>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="host"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Host</FormLabel>
                  <FormControl>
                    <Input
                      className="col-span-3"
                      placeholder="host"
                      {...field}
                    ></Input>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dbType"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">DbType</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="select database type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="SQLITE">SQLITE</SelectItem>
                          <SelectItem value="MYSQL">MYSQL</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="dbUrl"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">DbUrl</FormLabel>
                  <FormControl>
                    <Input
                      className="col-span-3"
                      placeholder="dburl"
                      {...field}
                    ></Input>
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="header"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Header</FormLabel>
                  <FormControl>
                    <Textarea
                      className="col-span-3"
                      placeholder="header"
                      rows={5}
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />

            <FormField
              control={form.control}
              name="withCredentials"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Credentials</FormLabel>
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

            <DialogFooter className="mt-4">
              <Button
                type="submit"
                disabled={!form.formState.isValid || !form.formState.isDirty}
              >
                Submit
              </Button>
            </DialogFooter>
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
