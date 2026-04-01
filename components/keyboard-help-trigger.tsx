"use client";

type KeyboardHelpTriggerProps = {
  onClick: () => void;
};

export function KeyboardHelpTrigger({ onClick }: KeyboardHelpTriggerProps) {
  return (
    <button
      type="button"
      className="keyboard-help-trigger"
      onClick={onClick}
      aria-label="Keyboard shortcuts"
      title="Keyboard shortcuts (?)"
    >
      ?
    </button>
  );
}
