import React, { useCallback, useEffect, useState } from "react";

import { Plus, Save, Trash2, X } from "lucide-react";

import { Dialog, DialogContent, DialogHeader, DialogTitle } from "../ui/dialog";

import * as DialogPrimitive from "@radix-ui/react-dialog";
import { Button } from "../ui/button";
import {
  FakerContainerModel,
  FakerModel,
  FakerType,
} from "src/redux/models/project";
import { Card, CardHeader, CardTitle } from "../ui/card";
import { Input } from "../ui/input";
import Select from "react-select";
import { ScrollArea } from "../ui/scroll-area";
import { useAppDispatch } from "src/redux/base/hooks";
import { updateFillFaker } from "src/redux/reducers/project";

interface FillFakerComponentProps {
  projectId: number;
  fakerId: number;
  faker: FakerContainerModel;
}

type NumberBooleanMap = {
  [key: number]: boolean;
};

export default function FillFakerComponent(props: FillFakerComponentProps) {
  const [dialogState, setDialogState] = useState(false);
  const [fakerList, setFakerList] = useState<FakerModel[]>([]);
  const [dirtyList, setDirtyList] = useState<NumberBooleanMap>({});
  const dispatch = useAppDispatch();

  useEffect(() => {
    setFakerList(props.faker.data);
  }, [props.faker.data]);

  const updateFakerData = useCallback(
    (fakerData: FakerModel[]) => {
      dispatch(
        updateFillFaker({
          projectId: props.projectId,
          fakerId: props.fakerId,
          data: fakerData,
        })
      );
      setDirtyList({});
    },
    [dispatch, props.fakerId, props.projectId]
  );

  const onDeleteClicked = useCallback(
    (idx: number) => {
      const updatedFakerList = [...fakerList.filter((_, id) => id !== idx)];
      setFakerList(updatedFakerList);
      updateFakerData(updatedFakerList);
    },
    [fakerList, updateFakerData]
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

      setDirtyList({
        ...dirtyList,
        [fakerId]: true,
      });
    },
    [dirtyList, fakerList]
  );

  const fakerTypeOptions = useCallback(() => {
    return FakerType.map((fk) => ({
      value: fk.name,
      label: fk.name,
    }));
  }, []);

  return (
    <Dialog open={dialogState}>
      <CardHeader
        onClick={() => setDialogState(true)}
        className="cursor-pointer hover:bg-[#050b1a] w-full rounded-lg"
      >
        <CardTitle>{props.faker.name}</CardTitle>
      </CardHeader>

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

        <ScrollArea className="h-[90%]">
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
                  placeholder="Column Name"
                ></Input>

                <Select
                  className="w-full"
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
                  value={{ value: faker.type, label: faker.type }}
                  onChange={(event) =>
                    onFakerDataChange(idx, { type: event?.value })
                  }
                  options={fakerTypeOptions()}
                  isSearchable={true}
                ></Select>

                <Input
                  value={faker.constraints}
                  type="text"
                  onChange={(event) =>
                    onFakerDataChange(idx, { constraints: event.target.value })
                  }
                  placeholder="Attributes"
                ></Input>
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
        </ScrollArea>

        <Button
          disabled={Object.keys(dirtyList).length < 1}
          size="xs"
          variant="secondary"
          className="absolute right-[24px] bottom-[96px] z-100 p-4"
          onClick={() => updateFakerData(fakerList)}
        >
          <Save color="lightgreen"></Save>
        </Button>

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
