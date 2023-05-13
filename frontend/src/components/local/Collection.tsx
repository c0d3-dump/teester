import React from "react";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "../ui/accordion";
import { useAppDispatch } from "src/redux/base/hooks";
import { addProject } from "src/redux/reducers/project";

export default function Collection() {
  const dispatch = useAppDispatch();

  dispatch(addProject([]));

  return (
    <>
      <AccordionDemo></AccordionDemo>
    </>
  );
}

export function AccordionDemo() {
  return (
    <Accordion type="single" collapsible className="w-full">
      <AccordionItem value="item-1">
        <AccordionTrigger onAdd={() => {}} onDelete={() => {}}>
          Is it accessible?
        </AccordionTrigger>
        <AccordionContent>
          Yes. It adheres to the WAI-ARIA design pattern.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-2">
        <AccordionTrigger onAdd={() => {}} onDelete={() => {}}>
          Is it styled?
        </AccordionTrigger>
        <AccordionContent>
          Yes. It comes with default styles that matches the other components'
          aesthetic.
        </AccordionContent>
      </AccordionItem>
      <AccordionItem value="item-3">
        <AccordionTrigger onAdd={() => {}} onDelete={() => {}}>
          Is it animated?
        </AccordionTrigger>
        <AccordionContent>
          Yes. It's animated by default, but you can disable it if you prefer.
        </AccordionContent>
      </AccordionItem>
    </Accordion>
  );
}
