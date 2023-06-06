import React, { useCallback, useEffect, useState } from "react";

import { Edit, Plus, Trash2, X } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import { FakerContainerModel, FakerModel } from "src/redux/models/project";
import { Card, CardHeader } from "../ui/card";
import { Input } from "../ui/input";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "../ui/select";

interface FillFakerComponentProps {
  projectId: number;
  faker: FakerContainerModel;
}

export default function FillFakerComponent(props: FillFakerComponentProps) {
  const [dialogState, setDialogState] = useState(false);
  const [fakerList, setFakerList] = useState<FakerModel[]>([]);

  const onDeleteClicked = useCallback(
    (idx: number) => {
      setFakerList([...fakerList.filter((_, id) => id !== idx)]);
    },
    [fakerList]
  );

  const onAddClick = useCallback(() => {
    setFakerList([
      ...fakerList,
      {
        fieldName: "",
        constraints: "",
        type: "",
      },
    ]);
  }, [fakerList]);

  const onFakerDataChange = useCallback(
    (fakerId: number, data: any) => {
      setFakerList([
        ...fakerList.map((fak, idx) =>
          idx === fakerId ? { ...fak, ...data } : fak
        ),
      ]);
    },
    [fakerList]
  );

  return (
    <Dialog open={dialogState}>
      <Button
        className="p-2 my-auto mx-2"
        size="xs"
        variant="ghost"
        type="button"
        onClick={() => setDialogState(true)}
      >
        <Edit color="rgb(255,255,255)"></Edit>
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
          <DialogTitle>Fill Faker</DialogTitle>
        </DialogHeader>

        {fakerList?.map((faker, idx) => (
          <Card
            className={`my-auto flex justify-between mb-4 rounded-none`}
            key={idx}
          >
            <CardHeader className="flex gap-2 w-full">
              <Input
                value={faker.fieldName}
                type="text"
                onChange={(event) =>
                  onFakerDataChange(idx, { fieldName: event.target.value })
                }
              ></Input>

              <Select
                value={faker.type}
                onValueChange={(event) =>
                  onFakerDataChange(idx, { type: event })
                }
              >
                <SelectTrigger>
                  <SelectValue placeholder="Select" />
                </SelectTrigger>
                <SelectContent>
                  <SelectGroup>
                    <SelectLabel>Fruits</SelectLabel>
                    <SelectItem value="apple">Apple</SelectItem>
                    <SelectItem value="banana">Banana</SelectItem>
                    <SelectItem value="blueberry">Blueberry</SelectItem>
                    <SelectItem value="grapes">Grapes</SelectItem>
                    <SelectItem value="pineapple">Pineapple</SelectItem>
                  </SelectGroup>
                </SelectContent>
              </Select>
            </CardHeader>

            <div className="flex align-middle">
              <Button
                size="xs"
                variant="secondary"
                className="p-2 my-auto mx-2"
                onClick={() => onDeleteClicked(idx)}
              >
                <Trash2></Trash2>
              </Button>
            </div>
          </Card>
        ))}

        <Button
          className="absolute right-[24px] bottom-[24px] z-100 p-4"
          size="xs"
          variant="secondary"
          onClick={() => onAddClick()}
        >
          <Plus color="#ffffff"></Plus>
        </Button>
      </DialogContent>
    </Dialog>
  );
}
