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
      <svg
        className="save-toast-icon"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="2.5"
        strokeLinecap="round"
        strokeLinejoin="round"
        aria-hidden="true"
      >
        <path d="M20 6 9 17l-5-5" />
      </svg>
      <span>{message}</span>
    </div>
  );
}
