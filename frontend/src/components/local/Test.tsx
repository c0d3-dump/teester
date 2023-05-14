import { ApiModel, CollectionModel, DbModel } from "src/redux/models/project";
import { Card, CardHeader, CardTitle } from "../ui/card";
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
import { Button } from "../ui/button";
import { Trash2 } from "lucide-react";
import AddEditTestComponent from "./AddEditTest";

interface TestsProps {
  tests: (ApiModel | DbModel)[];
  collectionId: number;
}

export default function TestComponent(props: TestsProps) {
  return (
    <>
      {props.tests.map((test, idx) => (
        <Card className="my-auto flex justify-between mb-4" key={idx}>
          <CardHeader
            onClick={() => {}}
            className="cursor-pointer w-full rounded-lg"
          >
            <CardTitle>{test.name}</CardTitle>
          </CardHeader>
          <div className="flex align-middle">
            <AddEditTestComponent
              type="EDIT"
              collectionId={props.collectionId}
              test={test}
              testId={idx}
            ></AddEditTestComponent>
            <AlertDialog>
              <AlertDialogTrigger asChild>
                <Button size="xs" variant="ghost" className="p-2 my-auto mx-2">
                  <Trash2 color="#ff0000"></Trash2>
                </Button>
              </AlertDialogTrigger>
              <AlertDialogContent>
                <AlertDialogHeader>
                  <AlertDialogTitle>
                    Do you really want to delete Project?
                  </AlertDialogTitle>
                  <AlertDialogDescription>
                    This action cannot be undone. This will permanently delete
                    your project.
                  </AlertDialogDescription>
                </AlertDialogHeader>
                <AlertDialogFooter>
                  <AlertDialogCancel>Cancel</AlertDialogCancel>
                  <AlertDialogAction onClick={() => {}}>
                    Continue
                  </AlertDialogAction>
                </AlertDialogFooter>
              </AlertDialogContent>
            </AlertDialog>
          </div>
        </Card>
      ))}
    </>
  );
}
