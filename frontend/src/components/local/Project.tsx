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

  // TODO: navigate different collection to relevent url
  const onCardClick = useCallback(
    (idx: number, type: string) => {
      switch (type) {
        case "API":
          navigate(`/${idx}`);
          break;
        case "FAKER":
          navigate(`/faker/${idx}`);
          break;
        case "UI":
          navigate(`/ui/${idx}`);
          break;
        default:
          break;
      }
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
    type: string;
  }

  const CardComponent = (props: CardComponentProps) => (
    <Card className="my-auto flex justify-between mb-4">
      <CardHeader
        onClick={() => onCardClick(props.idx, props.type)}
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
            <CardComponent
              type={proj.config.type}
              name={proj.name}
              idx={idx}
              key={idx}
            ></CardComponent>
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
    name: z.string({ required_error: "Name is required" }).min(1).max(25),
    type: z.string({ required_error: "Type is required" }),
    host: z.string().max(100).optional(),
    dbType: z.string().max(25).optional(),
    dbUrl: z.string().max(100).optional(),
    header: z.string().max(200).default("{}").optional(),
    withCredentials: z.boolean().default(false).optional(),
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
      form.setValue("type", props.data?.config.type ?? "");
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
            type: formData.type,
            host: formData.host ?? "",
            dbType: formData.dbType ?? "",
            dbUrl: formData.dbUrl ?? "",
            header: formData.header ?? "{}",
            withCredentials: formData.withCredentials ?? false,
          },
          collections: [],
          fakers: [],
          uis: [],
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
            type: formData.type,
            host: formData.host ?? "",
            dbType: formData.dbType ?? "",
            dbUrl: formData.dbUrl ?? "",
            header: formData.header ?? "{}",
            withCredentials: formData.withCredentials ?? false,
          },
          collections: props.data?.collections ?? [],
          fakers: props.data?.fakers ?? [],
          uis: props.data?.uis ?? [],
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
      form,
      props.data?.collections,
      props.data?.fakers,
      props.data?.uis,
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
              name="type"
              render={({ field }) => (
                <FormItem className="grid grid-cols-4 items-center gap-4">
                  <FormLabel className="text-right">Type</FormLabel>
                  <FormControl>
                    <Select
                      onValueChange={field.onChange}
                      defaultValue={field.value}
                    >
                      <SelectTrigger className="col-span-3">
                        <SelectValue placeholder="select type" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectGroup>
                          <SelectItem value="API">API</SelectItem>
                          <SelectItem value="UI">UI</SelectItem>
                          <SelectItem value="FAKER">FAKER</SelectItem>
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </FormControl>
                </FormItem>
              )}
            />

            {form.watch("type") && form.watch("type") !== "FAKER" ? (
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
            ) : (
              <></>
            )}

            {form.watch("type") && form.watch("type") !== "UI" ? (
              <>
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
              </>
            ) : (
              <></>
            )}

            {form.watch("type") && form.watch("type") === "API" ? (
              <>
                <FormField
                  control={form.control}
                  name="header"
                  defaultValue="{}"
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
                  defaultValue={false}
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
              </>
            ) : (
              <></>
            )}

            <DialogFooter className="mt-4">
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
