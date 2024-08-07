import React, { useCallback, useEffect, useState } from "react";
import { X, ClipboardCopy, ClipboardPaste, Plus, Expand } from "lucide-react";
import { AlertTriangle, Info } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
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
import { Card, CardContent, CardHeader, CardTitle } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";
import { Input } from "../ui/input";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useAppDispatch, useAppSelector } from "src/redux/base/hooks";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { ApiModel, DbModel, ProjectModel } from "src/redux/models/project";
import { addTest, updateTest } from "src/redux/reducers/project";
import { Textarea } from "../ui/textarea";
import {
  addTester,
  clearTester,
  selectTester,
} from "src/redux/reducers/tester";
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
import { removeTest } from "src/redux/reducers/project";
import { Database, Globe2, GripVertical, Play, Trash2 } from "lucide-react";
import {
  extractFakerVariables,
  replaceTokens,
  runApi,
  isDeepEqual,
  extractVariables,
  runQuery,
} from "src/utils";
import { useParams } from "react-router-dom";

interface AddEditTestComponentProps {
  type: "ADD" | "EDIT";
  projectId: number;
  collectionId: number;
  testId?: number;
  test?: ApiModel | DbModel;
  dimState?: number;
  project: ProjectModel;
  onDragStart?(index: number): void;
  onDragEnd?(e: React.DragEvent<HTMLDivElement>): void;
  onDragEnter?(index: number): void;
  onDragOver?(e: React.DragEvent<HTMLDivElement>): void;
}

export default function AddEditTestComponent(props: AddEditTestComponentProps) {
  const [dialogState, setDialogState] = useState(false);
  const [testData, setTestData] = useState<ApiModel | DbModel | undefined>();
  const testers = useAppSelector(selectTester);
  const dispatch = useAppDispatch();
  const params = useParams();
  const projectId = parseInt(params.projectId ?? "-1");
  const collectionId = parseInt(params.collectionId ?? "-1");

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

  const onDeleteClicked = useCallback(
    (testId: number) => {
      dispatch(clearTester());

      dispatch(
        removeTest({
          projectId,
          collectionId,
          testId,
        })
      );
    },
    [dispatch, projectId, collectionId]
  );

  const isPresent = useCallback(
    (testId: number) =>
      testers.findIndex(
        (t) => t.collectionId === collectionId && t.testId === testId
      ) > -1,
    [collectionId, testers]
  );

  const isAsserted = useCallback(
    (testId: number) =>
      testers.findIndex(
        (t) =>
          t.collectionId === collectionId && t.testId === testId && t.assert
      ) > -1,
    [collectionId, testers]
  );

  const runSingleTest = useCallback(
    async (testId: number) => {
      dispatch(clearTester());

      const config = props.project.config;
      const test = props.project.collections[collectionId].tests[testId];

      let variables = {};

      if ((test as ApiModel).methodType) {
        const apiModel: any = { ...test };

        try {
          const configHeader = JSON.parse(config.header ? config.header : "{}");

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

        const res = await runApi(config.host, apiModel, config.withCredentials);

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
        } catch (_error) {}

        dispatch(
          addTester({
            collectionId,
            testId: testId,
            assert: assertValue,
          })
        );
      }
    },
    [dispatch, props.project.config, props.project.collections, collectionId]
  );

  return (
    <Dialog open={dialogState}>
      {props.type === "ADD" ? (
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
          <Plus color="#ffffff"></Plus>
        </Button>
      ) : testData ? (
        <Card
          onDragEnter={() => props.onDragEnter?.(props.testId ?? -1)}
          onDragEnd={props.onDragEnd}
          onDragOver={props.onDragOver}
          className={`my-auto flex justify-between mb-4 ${
            isPresent(props.testId ?? -1)
              ? isAsserted(props.testId ?? -1)
                ? "border-green-500"
                : "border-red-500"
              : ""
          } ${props.dimState === props.testId ? "border-yellow-400" : ""}`}
        >
          <CardHeader
            onClick={() => {
              setDialogState(!dialogState);
            }}
            className="cursor-pointer w-full"
          >
            <CardTitle className="flex gap-2">
              <div
                draggable
                onDragStart={() => props.onDragStart?.(props.testId ?? -1)}
              >
                <GripVertical size={18}></GripVertical>
              </div>
              {(testData as ApiModel).methodType ? (
                <Globe2 size={18}></Globe2>
              ) : (
                <Database size={18}></Database>
              )}
              {testData.name}
            </CardTitle>
          </CardHeader>

          <div className="flex align-middle">
            {(testData as ApiModel).methodType &&
              isPresent(props.testId ?? -1) && (
                <DiffResultComponent
                  collectionId={collectionId}
                  test={testData as ApiModel}
                  testId={props.testId ?? -1}
                ></DiffResultComponent>
              )}
            <Button
              type="button"
              variant="ghost"
              className="p-2 my-auto mx-2"
              size="xs"
              onClick={() => runSingleTest(props.testId ?? -1)}
            >
              <Play color="lightgreen"></Play>
            </Button>

            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="xs" variant="ghost" className="p-2 my-auto mx-2">
                  <Trash2 color="rgb(239 68 68)"></Trash2>
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
                  <AlertDialogAction
                    onClick={() => onDeleteClicked(props.testId ?? -1)}
                  >
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      ) : (
        <></>
      )}

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
    name: z.string({ required_error: "Name is required" }).min(1).max(255),
    methodType: z
      .string({ required_error: "MethodType is required" })
      .min(1)
      .max(25),
    endpoint: z
      .string({ required_error: "Endpoint is required" })
      .min(1)
      .max(255),
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
                <FormLabel>
                  Header
                  <ExpandTextArea
                    title="Header"
                    value={field.value}
                    onChange={(value: string) => {
                      form.setValue(field.name, value);
                    }}
                  ></ExpandTextArea>
                </FormLabel>
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
                <FormLabel>
                  Body
                  <ExpandTextArea
                    title="Body"
                    value={field.value}
                    onChange={(value: string) => {
                      form.setValue(field.name, value);
                    }}
                  ></ExpandTextArea>
                </FormLabel>
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
              <FormLabel>
                Assert Body
                <ExpandTextArea
                  title="Assert Body"
                  value={field.value}
                  onChange={(value: string) => {
                    form.setValue(field.name, value);
                  }}
                ></ExpandTextArea>
              </FormLabel>
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
      <DialogTrigger asChild className="mx-2">
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

interface ExpandAreaComponentProps {
  title: string;
  value?: string;
  onChange: any;
}

function ExpandTextArea(props: ExpandAreaComponentProps) {
  const formSchema = z.object({
    value: z.string({ required_error: "Value is required" }),
  });

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
  });

  useEffect(() => {
    if (props.value) {
      form.setValue("value", props.value);
    }
  }, [form, props.value]);

  return (
    <Dialog>
      <DialogTrigger asChild>
        <Button type="button" variant="link" size="xs" className="ml-1 p-0">
          <Expand className="h-[0.875rem]"></Expand>
        </Button>
      </DialogTrigger>
      <DialogContent className="sm:max-w-[769px] max-h-full overflow-auto">
        <DialogHeader>
          <DialogTitle>{props.title}</DialogTitle>
        </DialogHeader>
        <Form {...form}>
          <form
            className="grid gap-4 py-4"
            onChange={(e) => {
              const value = (e.target as any).value;
              props.onChange(value);
            }}
          >
            <FormField
              control={form.control}
              name="value"
              render={({ field }) => (
                <FormItem className="space-y-4">
                  <FormControl>
                    <Textarea
                      className="col-span-3 h-[532px]"
                      placeholder="Enter value"
                      {...field}
                    />
                  </FormControl>
                </FormItem>
              )}
            />
          </form>
        </Form>
      </DialogContent>
    </Dialog>
  );
}
