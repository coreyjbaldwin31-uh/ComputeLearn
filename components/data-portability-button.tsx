"use client";

import { useCallback, useState } from "react";
import { DataPortabilityDialog } from "./data-portability-dialog";

export function DataPortabilityButton() {
  const [open, setOpen] = useState(false);

  const handleOpen = useCallback(() => setOpen(true), []);
  const handleClose = useCallback(() => setOpen(false), []);

  return (
    <>
      <button
        type="button"
        className="ghost-button"
        onClick={handleOpen}
        aria-label="Export or import learning data"
      >
        Export / Import Data
      </button>
      <DataPortabilityDialog isOpen={open} onClose={handleClose} />
    </>
  );
}
