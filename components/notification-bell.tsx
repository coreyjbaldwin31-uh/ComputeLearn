"use client";

import { useEffect, useRef, useState } from "react";

type Notification = {
  id: string;
  type: "review" | "milestone" | "streak";
  message: string;
};

type NotificationBellProps = {
  notifications: Notification[];
  onDismiss: (id: string) => void;
};

export type { Notification };

export function NotificationBell({
  notifications,
  onDismiss,
}: NotificationBellProps) {
  const [isOpen, setIsOpen] = useState(false);
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    function handleClickOutside(e: MouseEvent) {
      if (panelRef.current && !panelRef.current.contains(e.target as Node)) {
        setIsOpen(false);
      }
    }
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") setIsOpen(false);
    }
    document.addEventListener("mousedown", handleClickOutside);
    document.addEventListener("keydown", handleEsc);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
      document.removeEventListener("keydown", handleEsc);
    };
  }, [isOpen]);

  return (
    <div className="notif-bell-wrap" ref={panelRef}>
      <button
        type="button"
        className="notif-bell-button"
        onClick={() => setIsOpen((v) => !v)}
        aria-label={`Notifications${notifications.length > 0 ? ` (${notifications.length} unread)` : ""}`}
        aria-expanded={isOpen}
      >
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M9 1.5a4.5 4.5 0 00-4.5 4.5c0 5-2 6.5-2 6.5h13s-2-1.5-2-6.5A4.5 4.5 0 009 1.5z"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M7.5 14.5a1.5 1.5 0 003 0"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        {notifications.length > 0 && (
          <span className="notif-bell-badge">{notifications.length}</span>
        )}
      </button>

      {isOpen && (
        <div
          className="notif-bell-panel"
          role="region"
          aria-label="Notifications"
        >
          <h4 className="notif-bell-title">Notifications</h4>
          {notifications.length === 0 ? (
            <p className="notif-bell-empty">All caught up!</p>
          ) : (
            <ul className="notif-bell-list">
              {notifications.map((n) => (
                <li
                  key={n.id}
                  className={`notif-bell-item notif-bell-item--${n.type}`}
                >
                  {n.type === "review" && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <circle
                        cx="7"
                        cy="7"
                        r="6"
                        stroke="var(--gold)"
                        strokeWidth="1.5"
                        fill="none"
                      />
                      <path
                        d="M7 3.5v3.5l2 1.5"
                        stroke="var(--gold)"
                        strokeWidth="1.5"
                        strokeLinecap="round"
                      />
                    </svg>
                  )}
                  {n.type === "milestone" && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 1l1.8 3.6 4 .6-2.9 2.8.7 4L7 10.4 3.4 12l.7-4L1.2 5.2l4-.6L7 1z"
                        fill="var(--accent)"
                      />
                    </svg>
                  )}
                  {n.type === "streak" && (
                    <svg
                      width="14"
                      height="14"
                      viewBox="0 0 14 14"
                      fill="none"
                      aria-hidden="true"
                    >
                      <path
                        d="M7 1c0 3-2.5 4-2.5 6.5a2.5 2.5 0 005 0C9.5 5 7 4 7 1z"
                        fill="var(--gold)"
                      />
                    </svg>
                  )}
                  <span className="notif-bell-msg">{n.message}</span>
                  <button
                    type="button"
                    className="notif-bell-dismiss"
                    onClick={() => onDismiss(n.id)}
                    aria-label="Dismiss"
                  >
                    ×
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
