"use client";

import type { Notification } from "./notification-bell";
import { NotificationBell } from "./notification-bell";

type PlatformNavbarProps = {
  productTitle: string;
  percentComplete: number;
  viewMode: "home" | "lesson";
  breadcrumb: { phase: string; course: string; lesson: string } | null;
  notifications: Notification[];
  theme: string;
  onGoHome: () => void;
  onToggleSearch: () => void;
  onDismissNotification: (id: string) => void;
  onToggleTheme: () => void;
};

export function PlatformNavbar({
  productTitle,
  percentComplete,
  viewMode,
  breadcrumb,
  notifications,
  theme,
  onGoHome,
  onToggleSearch,
  onDismissNotification,
  onToggleTheme,
}: PlatformNavbarProps) {
  return (
    <header className="platform-navbar" role="banner">
      <div className="navbar-inner">
        {/* Left: Brand + Home */}
        <div className="navbar-left">
          <button
            type="button"
            className="navbar-brand"
            onClick={onGoHome}
            aria-label="Home dashboard"
          >
            <svg
              width="22"
              height="22"
              viewBox="0 0 22 22"
              fill="none"
              aria-hidden="true"
              className="navbar-brand-icon"
            >
              <rect
                x="2"
                y="2"
                width="18"
                height="18"
                rx="5"
                fill="var(--accent)"
              />
              <path
                d="M7 14V9l4-2.5L15 9v5"
                stroke="#fff"
                strokeWidth="1.5"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
              <path
                d="M10 14v-3h2v3"
                stroke="#fff"
                strokeWidth="1.3"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            <span className="navbar-brand-text">{productTitle}</span>
          </button>

          {/* Breadcrumb — only in lesson view */}
          {viewMode === "lesson" && breadcrumb && (
            <nav className="navbar-breadcrumb" aria-label="Course location">
              <span className="navbar-crumb">{breadcrumb.phase}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className="navbar-crumb-sep"
              >
                <path
                  d="M4.5 2.5l3 3.5-3 3.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="navbar-crumb">{breadcrumb.course}</span>
              <svg
                width="12"
                height="12"
                viewBox="0 0 12 12"
                fill="none"
                aria-hidden="true"
                className="navbar-crumb-sep"
              >
                <path
                  d="M4.5 2.5l3 3.5-3 3.5"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
              <span className="navbar-crumb navbar-crumb--current">
                {breadcrumb.lesson}
              </span>
            </nav>
          )}
        </div>

        {/* Right: Controls */}
        <div className="navbar-right">
          <button
            type="button"
            className="navbar-icon-btn"
            onClick={onToggleSearch}
            aria-label="Search lessons"
            title="Search (Ctrl+K)"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <circle
                cx="7"
                cy="7"
                r="5"
                stroke="currentColor"
                strokeWidth="1.5"
                fill="none"
              />
              <path
                d="M11 11l3 3"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>

          <NotificationBell
            notifications={notifications}
            onDismiss={onDismissNotification}
          />

          <button
            type="button"
            className="navbar-icon-btn"
            onClick={onToggleTheme}
            aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} mode`}
            title="Toggle theme"
          >
            {theme === "dark" ? (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <circle
                  cx="8"
                  cy="8"
                  r="3.5"
                  stroke="currentColor"
                  strokeWidth="1.5"
                />
                <path
                  d="M8 2v1.5M8 12.5V14M2 8h1.5M12.5 8H14M3.75 3.75l1.06 1.06M11.19 11.19l1.06 1.06M3.75 12.25l1.06-1.06M11.19 4.81l1.06-1.06"
                  stroke="currentColor"
                  strokeWidth="1.2"
                  strokeLinecap="round"
                />
              </svg>
            ) : (
              <svg
                width="16"
                height="16"
                viewBox="0 0 16 16"
                fill="none"
                aria-hidden="true"
              >
                <path
                  d="M13.5 9.2A5.5 5.5 0 016.8 2.5 6 6 0 1013.5 9.2z"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                />
              </svg>
            )}
          </button>
        </div>
      </div>

      {/* Thin progress bar along the bottom */}
      <div
        className="navbar-progress"
        role="progressbar"
        aria-valuenow={percentComplete}
        aria-valuemin={0}
        aria-valuemax={100}
        aria-label="Overall course progress"
      >
        <div
          className="navbar-progress-fill"
          style={{ width: `${percentComplete}%` }}
        />
      </div>
    </header>
  );
}
