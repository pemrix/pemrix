"use client";

import { Accordion, Accordions } from "fumadocs-ui/components/accordion";
import { createContext, type ReactNode, useContext } from "react";

const AccordionGroupContext = createContext(false);

export function AccordionGroup({ children }: { children?: ReactNode }) {
  return (
    <AccordionGroupContext.Provider value={true}>
      <Accordions type="single">{children}</Accordions>
    </AccordionGroupContext.Provider>
  );
}

export function MintlifyAccordion({ children, title }: { children?: ReactNode; title?: ReactNode }) {
  const insideGroup = useContext(AccordionGroupContext);
  const item = <Accordion title={title ?? ''}>{children}</Accordion>;
  if (insideGroup) return item;
  return <Accordions type="single">{item}</Accordions>;
}
