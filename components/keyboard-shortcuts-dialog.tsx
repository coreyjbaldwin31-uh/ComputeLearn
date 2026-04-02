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
        <p className="shortcut-description">
          Navigate lessons, toggle settings, and access tools without leaving
          the keyboard.
        </p>
        <ul className="shortcut-list">
          <li className="shortcut-item">
            <span className="shortcut-action">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="6 9 12 15 18 9" />
              </svg>
              Next lesson
            </span>
            <span className="shortcut-keys">
              <kbd className="kbd-hint">j</kbd>
            </span>
          </li>
          <li className="shortcut-item">
            <span className="shortcut-action">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <polyline points="18 15 12 9 6 15" />
              </svg>
              Previous lesson
            </span>
            <span className="shortcut-keys">
              <kbd className="kbd-hint">k</kbd>
            </span>
          </li>
          <li className="shortcut-item">
            <span className="shortcut-action">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <rect x="2" y="4" width="20" height="16" rx="2" />
                <line x1="8" y1="16" x2="16" y2="16" />
              </svg>
              Show shortcuts
            </span>
            <span className="shortcut-keys">
              <kbd className="kbd-hint">?</kbd>
            </span>
          </li>
          <li className="shortcut-item">
            <span className="shortcut-action">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <line x1="18" y1="6" x2="6" y2="18" />
                <line x1="6" y1="6" x2="18" y2="18" />
              </svg>
              Close overlay
            </span>
            <span className="shortcut-keys">
              <kbd className="kbd-hint">Esc</kbd>
            </span>
          </li>
          <li className="shortcut-item">
            <span className="shortcut-action">
              <svg
                width="14"
                height="14"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                aria-hidden="true"
              >
                <path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z" />
              </svg>
              Toggle dark mode
            </span>
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
