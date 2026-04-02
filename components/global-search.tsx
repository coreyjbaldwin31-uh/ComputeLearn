"use client";

import type { LessonEntry } from "@/lib/progression-engine";
import { useEffect, useRef, useState } from "react";

type GlobalSearchProps = {
  allLessonsFlat: LessonEntry[];
  progress: Record<string, true>;
  onNavigateToEntry: (entry: LessonEntry) => void;
  onClose: () => void;
};

export function GlobalSearch({
  allLessonsFlat,
  progress,
  onNavigateToEntry,
  onClose,
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "complete">("all");
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

  useEffect(() => {
    function handleEsc(e: KeyboardEvent) {
      if (e.key === "Escape") onClose();
    }
    document.addEventListener("keydown", handleEsc);
    return () => document.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  const normalizedQuery = query.trim().toLowerCase();
  const results = allLessonsFlat.filter((entry) => {
    const matchesText =
      normalizedQuery.length === 0 ||
      entry.lesson.title.toLowerCase().includes(normalizedQuery) ||
      entry.lesson.summary.toLowerCase().includes(normalizedQuery) ||
      entry.lesson.objective.toLowerCase().includes(normalizedQuery) ||
      entry.phase.title.toLowerCase().includes(normalizedQuery) ||
      entry.course.title.toLowerCase().includes(normalizedQuery);

    if (!matchesText) return false;

    if (filter === "complete") return Boolean(progress[entry.lesson.id]);
    if (filter === "pending") return !progress[entry.lesson.id];
    return true;
  });

  return (
    <div
      className="global-search-backdrop"
      ref={backdropRef}
      onClick={(e) => {
        if (e.target === backdropRef.current) onClose();
      }}
    >
      <div
        className="global-search-panel"
        role="dialog"
        aria-label="Search lessons"
      >
        <div className="global-search-header">
          <svg
            width="18"
            height="18"
            viewBox="0 0 18 18"
            fill="none"
            aria-hidden="true"
            className="global-search-icon"
          >
            <circle
              cx="8"
              cy="8"
              r="6"
              stroke="currentColor"
              strokeWidth="1.5"
              fill="none"
            />
            <path
              d="M12.5 12.5L16 16"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <input
            ref={inputRef}
            className="global-search-input"
            type="search"
            placeholder="Search lessons, topics, phases…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            aria-label="Search lessons"
          />
          <button
            type="button"
            className="global-search-close"
            onClick={onClose}
            aria-label="Close search"
          >
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="1.5"
                strokeLinecap="round"
              />
            </svg>
          </button>
        </div>

        <div className="global-search-filters">
          {(["all", "pending", "complete"] as const).map((f) => (
            <button
              key={f}
              type="button"
              className={`global-search-filter ${filter === f ? "active" : ""}`}
              onClick={() => setFilter(f)}
            >
              {f === "all"
                ? "All"
                : f === "pending"
                  ? "In progress"
                  : "Completed"}
            </button>
          ))}
          <span className="global-search-count">
            {results.length} result{results.length !== 1 ? "s" : ""}
          </span>
        </div>

        <ul className="global-search-results">
          {results.slice(0, 20).map((entry) => (
            <li key={entry.lesson.id}>
              <button
                type="button"
                className="global-search-result"
                onClick={() => {
                  onNavigateToEntry(entry);
                  onClose();
                }}
              >
                <div className="global-search-result-top">
                  <span className="global-search-result-title">
                    {entry.lesson.title}
                  </span>
                  <span
                    className={`status-pill ${progress[entry.lesson.id] ? "complete" : "pending"}`}
                  >
                    {progress[entry.lesson.id] ? "Done" : "Pending"}
                  </span>
                </div>
                <span className="global-search-result-path">
                  {entry.phase.title} › {entry.course.title}
                </span>
                <span className="global-search-result-meta">
                  {entry.lesson.duration} · {entry.lesson.difficulty}
                </span>
              </button>
            </li>
          ))}
          {results.length === 0 && normalizedQuery.length > 0 && (
            <li className="global-search-empty">
              No lessons match &quot;{query}&quot;
            </li>
          )}
          {results.length > 20 && (
            <li className="global-search-more">
              Showing 20 of {results.length} results — refine your search
            </li>
          )}
        </ul>
      </div>
    </div>
  );
}
