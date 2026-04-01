"use client";

type SaveToastProps = {
  message: string | null;
  duration?: number;
};

export function SaveToast({ message }: SaveToastProps) {
  if (!message) return null;

  return (
    <div
      className="save-toast"
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      {message}
    </div>
  );
}
