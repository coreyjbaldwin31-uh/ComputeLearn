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
  const panelId = `panel-${title.replace(/\s+/g, "-").toLowerCase()}`;

  return (
    <section className="panel">
      <button
        type="button"
        className="collapsible-header"
        onClick={() => setOpen((prev) => !prev)}
        aria-expanded={open}
        aria-controls={panelId}
      >
        <h3>{title}</h3>
        <span className="collapsible-chevron" aria-hidden="true">
          ▸
        </span>
      </button>
      <div id={panelId} className="collapsible-body" data-open={open}>
        <div className="collapsible-inner">{children}</div>
      </div>
    </section>
  );
}
