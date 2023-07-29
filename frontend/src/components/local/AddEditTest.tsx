import React, { useCallback, useEffect, useState } from "react";

import { Edit, X, ClipboardCopy, ClipboardPaste } from "lucide-react";

import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import { Card, CardContent } from "../ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "../ui/tabs";

import { Label } from "@radix-ui/react-label";
import { Input } from "../ui/input";
import * as DialogPrimitive from "@radix-ui/react-dialog";
import { useAppDispatch } from "src/redux/base/hooks";
import { useForm } from "react-hook-form";
import { Button } from "../ui/button";
import { ApiModel, DbModel } from "src/redux/models/project";
import { addTest, updateTest } from "src/redux/reducers/project";
import { Textarea } from "../ui/textarea";
import { useParams } from "react-router-dom";
import { clearTester } from "src/redux/reducers/tester";
import { toast } from "react-toastify";

interface AddEditTestComponentProps {
  type: "ADD" | "EDIT";
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
        className="p-2 my-auto ml-2"
        size="xs"
        variant={props.type === "ADD" ? "default" : "ghost"}
        type="button"
        onClick={() => setDialogState(true)}
      >
        {props.type === "ADD" ? "ADD" : <Edit></Edit>}
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
  collectionId: number;
  testId?: number;
  test?: ApiModel | DbModel;
  setDialogState: React.Dispatch<React.SetStateAction<boolean>>;
  dialogState: boolean;
}

function ApiTestComponent(props: TestComponentProps) {
  const { setValue, register, formState, getValues } = useForm();
  const dispatch = useAppDispatch();
  const params = useParams();
  const projectId = parseInt(params.projectId ?? "-1");

  useEffect(() => {
    if (props.type === "EDIT" || props.test) {
      const apiData = props.test as ApiModel;
      setValue("name", apiData.name);
      setValue("methodType", apiData.methodType);
      setValue("endpoint", apiData.endpoint);
      setValue("header", apiData.header);
      setValue("body", apiData.body);
      setValue("assertStatus", apiData.assertion.status);
      setValue("assertBody", apiData.assertion.body);
    }
  }, [props.test, props.type, setValue]);

  const onAddClick = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = getValues();
      const isValid = formState.isValid;

      if (isValid) {
        const newTest: ApiModel = {
          name: formData.name,
          endpoint: formData.endpoint,
          methodType: formData.methodType,
          body: formData.body,
          assertion: {
            status: formData.assertStatus,
            body: formData.assertBody,
          },
          header: formData.header,
        };
        dispatch(clearTester());

        dispatch(
          addTest({
            projectId,
            collectionId: props.collectionId,
            data: newTest,
          })
        );
        props.setDialogState(false);
      }
    },
    [dispatch, formState.isValid, getValues, projectId, props]
  );

  const onUpdateClicked = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = getValues();
      const isValid = formState.isValid;

      if (isValid) {
        const updatedTest: ApiModel = {
          name: formData.name,
          endpoint: formData.endpoint,
          methodType: formData.methodType,
          body: formData.body,
          assertion: {
            status: formData.assertStatus,
            body: formData.assertBody,
          },
          header: formData.header,
        };
        dispatch(clearTester());

        dispatch(
          updateTest({
            projectId,
            collectionId: props.collectionId,
            testId: props.testId ?? -1,
            data: updatedTest,
          })
        );
        props.setDialogState(false);
      }
    },
    [dispatch, formState.isValid, getValues, projectId, props]
  );

  return (
    <form
      className="grid gap-4 py-4"
      onSubmit={(e) =>
        props.type === "ADD" ? onAddClick(e) : onUpdateClicked(e)
      }
    >
      <div className="space-y-4">
        <Label htmlFor="tname">Name</Label>
        <Input
          {...register("name", { required: true })}
          id="tname"
          type="text"
        />
      </div>

      <Label htmlFor="endpoint">Endpoint</Label>
      <div className="flex">
        <select
          {...register("methodType", { required: true })}
          className="h-10 w-[108px] items-center justify-between mr-2 rounded-md border border-input bg-transparent px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
        >
          <option value="GET">GET</option>
          <option value="POST">POST</option>
          <option value="DELETE">DELETE</option>
          <option value="PUT">PUT</option>
        </select>
        <Input
          {...register("endpoint", { required: true })}
          id="endpoint"
          type="text"
          className="col-span-3"
        />
      </div>

      <div className="flex gap-4">
        <div className="space-y-4 grow">
          <Label htmlFor="header">Header</Label>
          <Textarea
            {...register("header", { required: false })}
            id="header"
            className="col-span-3 h-36"
          />
        </div>

        <div className="space-y-4 grow">
          <Label htmlFor="body">Body</Label>
          <Textarea
            {...register("body", { required: false })}
            id="body"
            className="col-span-3 h-36"
          />
        </div>
      </div>

      <div className="space-y-4">
        <Label htmlFor="status">Status</Label>
        <Input
          {...register("assertStatus", { required: true })}
          id="status"
          type="number"
        />
      </div>

      <div className="space-y-4">
        <Label htmlFor="assertBody">Assert body</Label>
        <Textarea
          {...register("assertBody", { required: false })}
          id="assertBody"
          className="col-span-3 h-36"
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={!formState.isValid} className="">
          Submit
        </Button>
      </DialogFooter>
    </form>
  );
}

function DbTestComponent(props: TestComponentProps) {
  const { setValue, register, formState, getValues } = useForm();
  const dispatch = useAppDispatch();
  const params = useParams();
  const projectId = parseInt(params.projectId ?? "-1");

  useEffect(() => {
    if (props.type === "EDIT" || props.test) {
      const dbData = props.test as DbModel;
      setValue("name", dbData.name);
      setValue("query", dbData.query);
    }
  }, [props.test, props.type, setValue]);

  const onAddClick = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = getValues();
      const isValid = formState.isValid;

      if (isValid) {
        const newTest: DbModel = {
          name: formData.name,
          query: formData.query,
        };
        dispatch(clearTester());

        dispatch(
          addTest({
            projectId,
            collectionId: props.collectionId,
            data: newTest,
          })
        );
        props.setDialogState(false);
      }
    },
    [dispatch, formState.isValid, getValues, projectId, props]
  );

  const onUpdateClicked = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = getValues();
      const isValid = formState.isValid;

      if (isValid) {
        const updatedTest: DbModel = {
          name: formData.name,
          query: formData.query,
        };
        dispatch(clearTester());

        dispatch(
          updateTest({
            projectId,
            collectionId: props.collectionId,
            testId: props.testId ?? -1,
            data: updatedTest,
          })
        );
        props.setDialogState(false);
      }
    },
    [dispatch, formState.isValid, getValues, projectId, props]
  );

  return (
    <form
      className="grid gap-4 py-4"
      onSubmit={(e) =>
        props.type === "ADD" ? onAddClick(e) : onUpdateClicked(e)
      }
    >
      <div className="space-y-4">
        <Label htmlFor="dname">Name</Label>
        <Input
          {...register("name", { required: true })}
          id="dname"
          type="text"
        />
      </div>

      <div className="space-y-4">
        <Label htmlFor="query">Query</Label>
        <Textarea
          {...register("query", { required: true })}
          id="query"
          className="col-span-3 h-[532px]"
        />
      </div>

      <DialogFooter>
        <Button type="submit" disabled={!formState.isValid}>
          Submit
        </Button>
      </DialogFooter>
    </form>
  );
}
