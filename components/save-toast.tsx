"use client";

import styles from "./save-toast.module.css";

type SaveToastProps = {
  message: string | null;
  variant?: "success" | "error";
  actionLabel?: string;
  onAction?: () => void;
};

export function SaveToast({
  message,
  variant = "success",
  actionLabel,
  onAction,
}: SaveToastProps) {
  if (!message) return null;

  const isError = variant === "error";

  if (isError) {
    return (
      <div
        className={`${styles.toast} ${styles.error}`}
        role="alert"
        aria-live="assertive"
        aria-atomic="true"
      >
        <svg
          className={styles.icon}
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
          <path d="M18 6 6 18" />
          <path d="m6 6 12 12" />
        </svg>
        <span>{message}</span>
        {actionLabel && onAction ? (
          <button type="button" className={styles.action} onClick={onAction}>
            {actionLabel}
          </button>
        ) : null}
      </div>
    );
  }

  return (
    <div
      className={styles.toast}
      role="status"
      aria-live="polite"
      aria-atomic="true"
    >
      <svg
        className={styles.icon}
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
