import React, { useCallback, useEffect, useState } from "react";

import { Edit, X, ClipboardCopy, ClipboardPaste, Plus } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useAppDispatch } from "src/redux/base/hooks";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { ApiModel, DbModel } from "src/redux/models/project";
import { addTest, updateTest } from "src/redux/reducers/project";
import { Textarea } from "../ui/textarea";
import { clearTester } from "src/redux/reducers/tester";
import { toast } from "react-toastify";
import { Form, FormControl, FormField, FormItem, FormLabel } from "../ui/form";
import * as z from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
import { Label } from "../ui/label";

interface AddEditTestComponentProps {
  type: "ADD" | "EDIT";
  projectId: number;
  collectionId: number;
  testId?: number;
  test?: ApiModel | DbModel;
}

export default function AddEditTestComponent(props: AddEditTestComponentProps) {
  const [dialogState, setDialogState] = useState(false);
  const [testData, setTestData] = useState<ApiModel | DbModel | undefined>();

  useEffect(() => {
    setTestData(props.test);
  }, [props.test]);

  const defaultValue = testData
    ? (testData as ApiModel).methodType
      ? "Api"
      : "Database"
    : "Api";

  const copyToClipboard = useCallback(async () => {
    try {
      await navigator.clipboard.writeText(JSON.stringify(testData));
      toast.success("Data copied to clipboard");
    } catch (error) {
      toast.error("Something went wrong!");
    }
  }, [testData]);

  const pasteToClipboard = useCallback(async () => {
    try {
      const data = await navigator.clipboard.readText();
      const parsedData = JSON.parse(data);
      setTestData(parsedData);
    } catch (error) {
      toast.error("Something went wrong!");
      setTestData(undefined);
    }
  }, []);

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
        type="button"
        onClick={() => setDialogState(true)}
      >
        {props.type === "ADD" ? (
          <Plus color="#ffffff"></Plus>
        ) : (
          <Edit color="lightgrey"></Edit>
        )}
      </Button>

      <DialogContent className="sm:max-w-[896px] max-h-[90%] block overflow-y-scroll">
        <DialogPrimitive.Close
          onClick={() => setDialogState(false)}
          className="absolute right-4 top-4 rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
        >
          <X className="h-4 w-4" />
          <span className="sr-only">Close</span>
        </DialogPrimitive.Close>

        <DialogHeader>
          <DialogTitle>
            {props.type === "ADD" ? "Add" : "Edit"} Test
          </DialogTitle>
        </DialogHeader>

        <div className="absolute left-8 top-4">
          <Button
            className=""
            size="xs"
            variant="default"
            onClick={copyToClipboard}
          >
            <ClipboardCopy className="h-4 w-4"></ClipboardCopy>
          </Button>

          <Button
            className="ml-2"
            size="xs"
            variant="default"
            onClick={pasteToClipboard}
          >
            <ClipboardPaste className="h-4 w-4"></ClipboardPaste>
          </Button>
        </div>

        <Tabs defaultValue={defaultValue} className="sm:max-w-[846px] mt-4">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger
              value="Api"
              disabled={props.type === "EDIT" && defaultValue === "Database"}
            >
              Api
            </TabsTrigger>
            <TabsTrigger
              value="Database"
              disabled={props.type === "EDIT" && defaultValue === "Api"}
            >
              Database
            </TabsTrigger>
          </TabsList>
          <TabsContent value="Api" className="h-[716px]">
            <Card className="h-full border-none">
              <CardContent className="space-y-2">
                <ApiTestComponent
                  type={props.type}
                  projectId={props.projectId}
                  collectionId={props.collectionId}
                  dialogState={dialogState}
                  setDialogState={setDialogState}
                  test={testData}
                  testId={props.testId}
                ></ApiTestComponent>
              </CardContent>
            </Card>
          </TabsContent>
          <TabsContent value="Database" className="h-[716px]">
            <Card className="h-full border-none">
              <CardContent className="space-y-2">
                <DbTestComponent
                  type={props.type}
                  projectId={props.projectId}
                  collectionId={props.collectionId}
                  dialogState={dialogState}
                  setDialogState={setDialogState}
                  test={testData}
                  testId={props.testId}
                ></DbTestComponent>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </DialogContent>
    </Dialog>
  );
}

interface TestComponentProps {
  type: "ADD" | "EDIT";
  projectId: number;
  collectionId: number;
  testId?: number;
  test?: ApiModel | DbModel;
  setDialogState: React.Dispatch<React.SetStateAction<boolean>>;
  dialogState: boolean;
}

function ApiTestComponent(props: TestComponentProps) {
  const dispatch = useAppDispatch();

  const formSchema = z.object({
    name: z.string({ required_error: "Name is required" }).min(1).max(25),
    methodType: z
      .string({ required_error: "MethodType is required" })
      .min(1)
      .max(25),
    endpoint: z
      .string({ required_error: "Endpoint is required" })
      .min(1)
      .max(100),
    header: z.string().optional(),
    body: z.string().optional(),
    assertStatus: z
      .string({ required_error: "Assert Status is required" })
      .min(1)
      .max(4),
    assertBody: z.string().optional(),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (props.type === "ADD" && !props.dialogState) {
      form.reset();
    }
  }, [form, props.dialogState, props.type]);

  useEffect(() => {
    if (props.type === "EDIT" || props.test) {
      const apiData = props.test as ApiModel;
      form.setValue("name", apiData.name ?? "");
      form.setValue("methodType", apiData.methodType ?? "");
      form.setValue("endpoint", apiData.endpoint);
      form.setValue("header", apiData.header ?? "");
      form.setValue("body", apiData.body ?? "");
      form.setValue(
        "assertStatus",
        apiData.assertion.status.toString() ?? "-1"
      );
      form.setValue("assertBody", apiData.assertion.body ?? "");
    }
  }, [form, props.test, props.type]);

  const onAddClicked = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = form.getValues();
      const isValid = form.formState.isValid;

      if (isValid) {
        const newTest: ApiModel = {
          name: formData.name,
          endpoint: formData.endpoint ?? "",
          methodType: formData.methodType ?? "",
          body: formData.body ?? "{}",
          assertion: {
            status: parseInt(formData.assertStatus) ?? -1,
            body: formData.assertBody ?? "{}",
          },
          header: formData.header ?? "{}",
        };
        dispatch(clearTester());

        dispatch(
          addTest({
            projectId: props.projectId,
            collectionId: props.collectionId,
            data: newTest,
          })
        );
        props.setDialogState(false);
      }
    },
    [dispatch, form, props]
  );

  const onUpdateClicked = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = form.getValues();
      const isValid = form.formState.isValid;

      if (isValid) {
        const updatedTest: ApiModel = {
          name: formData.name,
          endpoint: formData.endpoint ?? "",
          methodType: formData.methodType ?? "",
          body: formData.body ?? "{}",
          assertion: {
            status: parseInt(formData.assertStatus) ?? -1,
            body: formData.assertBody ?? "{}",
          },
          header: formData.header ?? "{}",
        };
        dispatch(clearTester());

        dispatch(
          updateTest({
            projectId: props.projectId,
            collectionId: props.collectionId,
            testId: props.testId ?? -1,
            data: updatedTest,
          })
        );
        props.setDialogState(false);
      }
    },
    [dispatch, form, props]
  );

  return (
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
            <FormItem className="space-y-4">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input placeholder="Enter Test Name" {...field} />
              </FormControl>
            </FormItem>
          )}
        />

        <Label className="my-1" htmlFor="endpoint">
          Endpoint
        </Label>

        <div className="flex gap-2">
          <FormField
            control={form.control}
            name="methodType"
            defaultValue={(props.test as ApiModel)?.methodType}
            render={({ field }) => (
              <FormItem>
                <FormControl>
                  <Select
                    onValueChange={field.onChange}
                    defaultValue={field.value}
                  >
                    <SelectTrigger className="w-[108px]">
                      <SelectValue placeholder="Type" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectGroup>
                        <SelectItem value="GET">GET</SelectItem>
                        <SelectItem value="POST">POST</SelectItem>
                        <SelectItem value="DELETE">DELETE</SelectItem>
                        <SelectItem value="PUT">PUT</SelectItem>
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="endpoint"
            render={({ field }) => (
              <FormItem className="w-full">
                <FormControl>
                  <Input placeholder="Enter Endpoint" {...field} />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <div className="flex gap-4">
          <FormField
            control={form.control}
            name="header"
            defaultValue="{}"
            render={({ field }) => (
              <FormItem className="space-y-4 grow">
                <FormLabel>Header</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter Header"
                    className="col-span-3 h-36"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />

          <FormField
            control={form.control}
            name="body"
            defaultValue="{}"
            render={({ field }) => (
              <FormItem className="space-y-4 grow">
                <FormLabel>Body</FormLabel>
                <FormControl>
                  <Textarea
                    placeholder="Enter Body"
                    className="col-span-3 h-36"
                    {...field}
                  />
                </FormControl>
              </FormItem>
            )}
          />
        </div>

        <FormField
          control={form.control}
          name="assertStatus"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel>Assert Status</FormLabel>
              <FormControl>
                <Input
                  placeholder="Enter Assert Status"
                  type="number"
                  min={0}
                  max={1000}
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="assertBody"
          defaultValue="{}"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel>Assert Body</FormLabel>
              <FormControl>
                <Textarea
                  placeholder="Enter Assert Body"
                  className="col-span-3 h-36"
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
  );
}

function DbTestComponent(props: TestComponentProps) {
  const dispatch = useAppDispatch();

  const formSchema = z.object({
    name: z.string({ required_error: "Name is required" }).min(1).max(25),
    query: z.string({ required_error: "Query is required" }).min(1).max(1000),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (props.type === "ADD" && !props.dialogState) {
      form.reset();
    }
  }, [form, props.dialogState, props.type]);

  useEffect(() => {
    if (props.type === "EDIT" || props.test) {
      const dbData = props.test as DbModel;
      form.setValue("name", dbData?.name ?? "");
      form.setValue("query", dbData?.query ?? "");
    }
  }, [form, props.test, props.type]);

  const onAddClicked = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = form.getValues();
      const isValid = form.formState.isValid;

      if (isValid) {
        const newTest: DbModel = {
          name: formData.name,
          query: formData.query,
        };
        dispatch(clearTester());

        dispatch(
          addTest({
            projectId: props.projectId,
            collectionId: props.collectionId,
            data: newTest,
          })
        );
        props.setDialogState(false);
      }
    },
    [dispatch, form, props]
  );

  const onUpdateClicked = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = form.getValues();
      const isValid = form.formState.isValid;

      if (isValid) {
        const updatedTest: DbModel = {
          name: formData.name,
          query: formData.query,
        };
        dispatch(clearTester());

        dispatch(
          updateTest({
            projectId: props.projectId,
            collectionId: props.collectionId,
            testId: props.testId ?? -1,
            data: updatedTest,
          })
        );
        props.setDialogState(false);
      }
    },
    [dispatch, form, props]
  );

  return (
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
            <FormItem className="space-y-4">
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input
                  className="col-span-3"
                  placeholder="Enter Test Name"
                  {...field}
                />
              </FormControl>
            </FormItem>
          )}
        />

        <FormField
          control={form.control}
          name="query"
          render={({ field }) => (
            <FormItem className="space-y-4">
              <FormLabel>Query</FormLabel>
              <FormControl>
                <Textarea
                  className="col-span-3 h-[532px]"
                  placeholder="Enter Test Query"
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
  );
}
