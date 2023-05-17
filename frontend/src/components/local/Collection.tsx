import React, { useEffect, useState } from "react";
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
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "../ui/select";
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
import { isDeepEqual, runApi, runQuery } from "src/utils";
import { addTester, clearTester } from "src/redux/reducers/tester";
import { useParams } from "react-router-dom";

export default function Collection() {
  const projects = useAppSelector(selectProject);
  const dispatch = useAppDispatch();
  const params = useParams();
  const projectId = parseInt(params.projectId ?? "-1");

  const onDeleteClicked = (idx: number) => {
    dispatch(removeCollection({ projectId, collectionId: idx }));
  };

  const runTests = async () => {
    dispatch(clearTester());

    const config = projects[projectId].config;
    for (let idx = 0; idx < projects[projectId].collections.length; idx++) {
      const col = projects[projectId].collections[idx];

      for (let jdx = 0; jdx < col.tests.length; jdx++) {
        const test = col.tests[jdx];

        if ((test as ApiModel).methodType) {
          const apiModel = test as ApiModel;

          const model = {
            ...apiModel,
            body: apiModel.body ? JSON.parse(apiModel.body) : {},
          };

          const res = await runApi(config.host, model);

          let assertValue = false;
          if (
            res.status === parseInt(apiModel.assertion.status.toString()) &&
            (apiModel.assertion.body.length < 1 ||
              isDeepEqual(res.data, JSON.parse(apiModel.assertion.body)))
          ) {
            assertValue = true;
          }

          dispatch(
            addTester({
              collectionId: idx,
              testId: jdx,
              assert: assertValue,
            })
          );
        } else {
          let assertValue = false;
          try {
            const dbModel = test as DbModel;
            await runQuery(config.dbType, config.dbUrl, dbModel);
            assertValue = true;
          } catch (error) {
            console.log("Something went wrong with db");
          }

          dispatch(
            addTester({
              collectionId: idx,
              testId: jdx,
              assert: assertValue,
            })
          );
        }
      }

      if ("caches" in window) {
        caches.keys().then((data) => {
          data.forEach(async (c) => {
            await caches.delete(c);
          });
        });
      }
      localStorage.clear();
      sessionStorage.clear();
    }
  };

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

      <Button
        className="fixed right-[24px] bottom-[169px] z-100 p-4"
        size="xs"
        variant="secondary"
        onClick={() => runTests()}
      >
        <Play color="lightgreen"></Play>
      </Button>
      <AddEditCollectionComponent
        type="EDIT"
        collectionList={projects[projectId].collections}
      ></AddEditCollectionComponent>
      <AddEditCollectionComponent type="ADD"></AddEditCollectionComponent>
    </>
  );
}

interface AddEditCardComponentProps {
  type: "ADD" | "EDIT";
  collectionList?: CollectionModel[];
}

function AddEditCollectionComponent(props: AddEditCardComponentProps) {
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
    if (props.type === "EDIT" && selectedCollection) {
      const collectionList = props.collectionList ?? [];
      setValue("name", collectionList[parseInt(selectedCollection)].name);
    }
  }, [props.collectionList, props.type, setValue, selectedCollection]);

  const onAddClick = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = getValues();
    const isValid = formState.isValid;

    if (isValid) {
      const newCollection: CollectionModel = {
        name: formData.name,
        tests: [],
      };
      dispatch(addCollection({ data: newCollection, projectId }));

      setDialogState(false);
    }
  };

  const onUpdateClicked = (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();

    const formData = getValues();
    const isValid = formState.isValid;

    if (isValid) {
      const collectionList = props.collectionList ?? [];
      const updatedCollection: CollectionModel = {
        name: formData.name,
        tests: collectionList[parseInt(selectedCollection)].tests ?? [],
      };
      dispatch(
        updateCollection({
          data: updatedCollection,
          projectId,
          collectionId: parseInt(selectedCollection),
        })
      );

      setDialogState(false);
    }
  };

  return (
    <Dialog open={dialogState}>
      <Button
        className={
          props.type === "ADD"
            ? "fixed right-[24px] bottom-[24px] z-100 p-4"
            : "fixed right-[24px] bottom-[96px] z-100 p-4"
        }
        size="xs"
        variant="secondary"
        onClick={() => setDialogState(true)}
      >
        {props.type === "ADD" ? (
          <Plus color="lightblue" size={24}></Plus>
        ) : (
          <Edit color="lightgrey" size={24}></Edit>
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
            {props.type === "ADD" ? "Add" : "Edit"} Collection
          </DialogTitle>
        </DialogHeader>

        {props.type === "EDIT" ? (
          <div className="grid grid-cols-4 items-center gap-4">
            <Label htmlFor="collection" className="text-right">
              Collection
            </Label>
            <Select onValueChange={(val) => setSelectedCollection(val)}>
              <SelectTrigger className="w-[278px]" id="collection">
                <SelectValue placeholder="Select a collection" />
              </SelectTrigger>
              <SelectContent>
                <SelectGroup>
                  {props.collectionList?.map((col, idx) => {
                    return (
                      <SelectItem value={idx.toString()} key={idx}>
                        {col.name}
                      </SelectItem>
                    );
                  })}
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
        ) : null}

        <form
          className="grid gap-4 py-4"
          onSubmit={(e) =>
            props.type === "ADD" ? onAddClick(e) : onUpdateClicked(e)
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
              disabled={props.type === "EDIT" && !selectedCollection}
            />
          </div>

          {props.type === "EDIT" && selectedCollection ? (
            <AddEditTestComponent
              type="ADD"
              collectionId={parseInt(selectedCollection)}
            ></AddEditTestComponent>
          ) : null}

          <DialogFooter>
            <Button
              type="submit"
              disabled={!formState.isValid && !formState.isDirty}
            >
              Submit
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
