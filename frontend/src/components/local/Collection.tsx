import React, { useCallback, useEffect, useState } from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import {
  Dialog,
  DialogContent,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "../ui/dialog";
import Select from "react-select";
import { Button } from "../ui/button";
import { Edit, Play, Plus, X } from "lucide-react";

import { Label } from "@radix-ui/react-label";
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
import AddEditTestComponent from "./AddEditTest";
import TestComponent from "./Test";
import {
  isDeepEqual,
  runApi,
  runQuery,
  extractVariables,
  replaceTokens,
} from "src/utils";
import { addTester, clearTester } from "src/redux/reducers/tester";
import { useParams } from "react-router-dom";
import { setCollectionName } from "src/redux/reducers/app";

export default function Collection() {
  const projects = useAppSelector(selectProject);
  const dispatch = useAppDispatch();
  const params = useParams();
  const projectId = parseInt(params.projectId ?? "-1");

  const onDeleteClicked = (idx: number) => {
    dispatch(clearTester());
    dispatch(removeCollection({ projectId, collectionId: idx }));
  };

  useEffect(() => {
    dispatch(setCollectionName(projects[projectId].name));
  }, [dispatch, projectId, projects]);

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

            const header = replaceTokens(apiModel.header, variables);
            apiModel.header = header ? JSON.parse(header) : {};

            apiModel.header = {
              ...configHeader,
              ...apiModel.header,
            };
          } catch (error) {
            apiModel.header = {};
          }

          try {
            const body = replaceTokens(apiModel.body, variables);
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

  return (
    <>
      <div className="my-8">
        <Accordion type="single" collapsible className="w-full">
          {projects[projectId].collections.map((col, idx) => {
            return (
              <AccordionItem value={col.name} className="mb-4" key={idx}>
                <AccordionTrigger onDelete={() => onDeleteClicked(idx)}>
                  {col.name}
                </AccordionTrigger>
                <AccordionContent>
                  <TestComponent
                    tests={col.tests}
                    collectionId={idx}
                    key={idx}
                  ></TestComponent>
                </AccordionContent>
              </AccordionItem>
            );
          })}
        </Accordion>
      </div>

      <AddEditCollectionComponent
        type="RUN"
        collectionList={projects[projectId].collections}
        runTests={runTests}
      ></AddEditCollectionComponent>
      <AddEditCollectionComponent
        type="EDIT"
        collectionList={projects[projectId].collections}
      ></AddEditCollectionComponent>
      <AddEditCollectionComponent type="ADD"></AddEditCollectionComponent>
    </>
  );
}

interface AddEditCollectionComponentProps {
  type: "ADD" | "EDIT" | "RUN";
  collectionList?: CollectionModel[];
  runTests?: (collectionId: number) => Promise<void>;
}

function AddEditCollectionComponent(props: AddEditCollectionComponentProps) {
  const [dialogState, setDialogState] = useState(false);
  const { setValue, register, formState, getValues, reset } = useForm();
  const dispatch = useAppDispatch();
  const [selectedCollection, setSelectedCollection] = useState("");
  const params = useParams();
  const projectId = parseInt(params.projectId ?? "-1");

  useEffect(() => {
    if (!dialogState) {
      reset();
      setSelectedCollection("");
    }
  }, [dialogState, reset]);

  useEffect(() => {
    if (props.type !== "ADD" && selectedCollection) {
      const collectionList = props.collectionList ?? [];
      setValue("name", collectionList[parseInt(selectedCollection)].name);
    }
  }, [props.collectionList, props.type, setValue, selectedCollection]);

  const onAddClick = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = getValues();
      const isValid = formState.isValid;

      if (isValid) {
        const newCollection: CollectionModel = {
          name: formData.name,
          tests: [],
        };
        dispatch(clearTester());

        dispatch(addCollection({ data: newCollection, projectId }));

        setDialogState(false);
      }
    },
    [dispatch, formState.isValid, getValues, projectId]
  );

  const onUpdateClicked = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();

      const formData = getValues();
      const isValid = formState.isValid;

      if (isValid) {
        const collectionList = props.collectionList ?? [];
        const updatedCollection: CollectionModel = {
          name: formData.name,
          tests: collectionList[parseInt(selectedCollection)].tests ?? [],
        };
        dispatch(clearTester());

        dispatch(
          updateCollection({
            data: updatedCollection,
            projectId,
            collectionId: parseInt(selectedCollection),
          })
        );

        setDialogState(false);
      }
    },
    [
      dispatch,
      formState.isValid,
      getValues,
      projectId,
      props.collectionList,
      selectedCollection,
    ]
  );

  const onRunClicked = useCallback(
    (e: React.FormEvent<HTMLFormElement>) => {
      e.preventDefault();
      props.runTests?.(parseInt(selectedCollection));
      setDialogState(false);
    },
    [props, selectedCollection]
  );

  const buttonClass = useCallback(() => {
    switch (props.type) {
      case "ADD":
        return "fixed right-[24px] bottom-[24px] z-100 p-4";
      case "EDIT":
        return "fixed right-[24px] bottom-[96px] z-100 p-4";
      case "RUN":
        return "fixed right-[24px] bottom-[169px] z-100 p-4";
      default:
        return "";
    }
  }, [props.type]);

  const RenderIcon = useCallback(() => {
    switch (props.type) {
      case "ADD":
        return <Plus color="lightblue" size={24}></Plus>;
      case "EDIT":
        return <Edit color="lightgrey" size={24}></Edit>;
      case "RUN":
        return <Play color="lightgreen"></Play>;
      default:
        return <></>;
    }
  }, [props.type]);

  return (
    <Dialog open={dialogState}>
      <Button
        className={buttonClass()}
        size="xs"
        variant="secondary"
        onClick={() => setDialogState(true)}
      >
        <RenderIcon />
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

        {props.type !== "ADD" ? (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="collection" className="text-right">
              Collection
            </Label>
            <Select
              className="col-span-3"
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
              value={{
                value: selectedCollection,
                label: selectedCollection
                  ? props.collectionList?.[parseInt(selectedCollection)].name
                  : "",
              }}
              onChange={(event) => setSelectedCollection(event?.value ?? "")}
              options={props.collectionList?.map((col, idx) => ({
                value: idx.toString(),
                label: col.name,
              }))}
              isSearchable={true}
            ></Select>
          </div>
        ) : null}

        <form
          className="grid gap-4 py-4"
          onSubmit={(e) =>
            props.type === "ADD"
              ? onAddClick(e)
              : props.type === "EDIT"
              ? onUpdateClicked(e)
              : onRunClicked(e)
          }
        >
          {props.type !== "RUN" ? (
            <div className="grid grid-cols-4 items-center gap-4">
              <Label htmlFor="name" className="text-right">
                Name
              </Label>
              <Input
                {...register("name", { required: true })}
                id="name"
                type="text"
                className="col-span-3"
                placeholder="Collection Name"
                disabled={props.type === "EDIT" && !selectedCollection}
              />
            </div>
          ) : null}

          {props.type === "EDIT" && selectedCollection ? (
            <AddEditTestComponent
              type="ADD"
              collectionId={parseInt(selectedCollection)}
            ></AddEditTestComponent>
          ) : null}

          <DialogFooter>
            <Button
              type="submit"
              disabled={
                (!formState.isValid && !formState.isDirty) ||
                (props.type === "RUN" && !selectedCollection)
              }
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
