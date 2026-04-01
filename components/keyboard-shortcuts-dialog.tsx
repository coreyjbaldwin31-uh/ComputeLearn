"use client";

import { useEffect, useRef } from "react";
import { useFocusTrap } from "./hooks/use-focus-trap";

type KeyboardShortcutsDialogProps = {
  isOpen: boolean;
  onClose: () => void;
};

export function KeyboardShortcutsDialog({
  isOpen,
  onClose,
}: KeyboardShortcutsDialogProps) {
  const dialogRef = useFocusTrap(isOpen);
  const closeButtonRef = useRef<HTMLButtonElement>(null);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        onClose();
      }
    };

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isOpen, onClose]);

  useEffect(() => {
    if (!isOpen) return;
    closeButtonRef.current?.focus();
  }, [isOpen]);

  if (!isOpen) return null;

  return (
    <div
      className="keyboard-overlay-backdrop"
      onClick={onClose}
      role="presentation"
    >
      <div
        ref={dialogRef}
        className="keyboard-overlay"
        role="dialog"
        aria-modal="true"
        aria-label="Keyboard shortcuts"
        onClick={(e) => e.stopPropagation()}
      >
        <button
          ref={closeButtonRef}
          type="button"
          className="keyboard-overlay-close"
          onClick={onClose}
          aria-label="Close keyboard shortcuts"
        >
          Close
        </button>
        <h3>Keyboard shortcuts</h3>
        <ul className="shortcut-list">
          <li className="shortcut-item">
            <span>Next lesson</span>
            <span className="shortcut-keys">
              <kbd className="kbd-hint">j</kbd>
            </span>
          </li>
          <li className="shortcut-item">
            <span>Previous lesson</span>
            <span className="shortcut-keys">
              <kbd className="kbd-hint">k</kbd>
            </span>
          </li>
          <li className="shortcut-item">
            <span>Show shortcuts</span>
            <span className="shortcut-keys">
              <kbd className="kbd-hint">?</kbd>
            </span>
          </li>
          <li className="shortcut-item">
            <span>Close overlay</span>
            <span className="shortcut-keys">
              <kbd className="kbd-hint">Esc</kbd>
            </span>
          </li>
          <li className="shortcut-item">
            <span>Toggle dark mode</span>
            <span className="shortcut-keys">
              <kbd className="kbd-hint">Ctrl</kbd>+
              <kbd className="kbd-hint">Shift</kbd>+
              <kbd className="kbd-hint">D</kbd>
            </span>
          </li>
        </ul>
      </div>
    </div>
  );
}
