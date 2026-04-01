"use client";

import { useState, type ReactNode } from "react";

type CollapsiblePanelProps = {
  title: string;
  defaultOpen?: boolean;
  children: ReactNode;
};

export function CollapsiblePanel({
  title,
  defaultOpen = false,
  children,
}: CollapsiblePanelProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <section className="panel">
      <div
        className="collapsible-header"
        role="button"
        tabIndex={0}
        aria-expanded={open}
        onClick={() => setOpen((prev) => !prev)}
        onKeyDown={(e) => {
          if (e.key === "Enter" || e.key === " ") {
            e.preventDefault();
            setOpen((prev) => !prev);
          }
        }}
      >
        <h3>{title}</h3>
        <span className="collapsible-chevron" aria-hidden="true">
          ▸
        </span>
      </div>
      <div className="collapsible-body" data-open={open}>
        <div className="collapsible-inner">{children}</div>
      </div>
    </section>
  );
}
