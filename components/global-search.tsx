"use client";

import type { LessonEntry } from "@/lib/progression-engine";
import { useEffect, useRef, useState } from "react";

type GlobalSearchProps = {
  allLessonsFlat: LessonEntry[];
  progress: Record<string, true>;
  onNavigateToEntry: (entry: LessonEntry) => void;
  onClose: () => void;
};

function highlightMatch(text: string, query: string): React.ReactNode {
  if (!query) return text;
  const idx = text.toLowerCase().indexOf(query.toLowerCase());
  if (idx === -1) return text;
  return (
    <>
      {text.slice(0, idx)}
      <mark className="search-highlight">{text.slice(idx, idx + query.length)}</mark>
      {text.slice(idx + query.length)}
    </>
  );
}

export function GlobalSearch({
  allLessonsFlat,
  progress,
  onNavigateToEntry,
  onClose,
}: GlobalSearchProps) {
  const [query, setQuery] = useState("");
  const [filter, setFilter] = useState<"all" | "pending" | "complete">("all");
  const [selectedIndex, setSelectedIndex] = useState(-1);
  const inputRef = useRef<HTMLInputElement>(null);
  const backdropRef = useRef<HTMLDivElement>(null);
  const listRef = useRef<HTMLUListElement>(null);

  useEffect(() => {
    inputRef.current?.focus();
  }, []);

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

  const visibleResults = results.slice(0, 20);

  function handleKeyDown(e: React.KeyboardEvent) {
    if (e.key === "Escape") {
      onClose();
      return;
    }
    if (e.key === "ArrowDown") {
      e.preventDefault();
      setSelectedIndex((prev) =>
        prev < visibleResults.length - 1 ? prev + 1 : prev,
      );
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      setSelectedIndex((prev) => (prev > 0 ? prev - 1 : -1));
    } else if (e.key === "Enter" && selectedIndex >= 0) {
      e.preventDefault();
      const entry = visibleResults[selectedIndex];
      if (entry) {
        onNavigateToEntry(entry);
        onClose();
      }
    }
  }

  // Scroll selected result into view
  useEffect(() => {
    if (selectedIndex >= 0 && listRef.current) {
      const items = listRef.current.querySelectorAll(".global-search-result");
      items[selectedIndex]?.scrollIntoView({ block: "nearest" });
    }
  }, [selectedIndex]);

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
        onKeyDown={handleKeyDown}
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
            onChange={(e) => {
              setQuery(e.target.value);
              setSelectedIndex(-1);
            }}
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
              onClick={() => {
                setFilter(f);
                setSelectedIndex(-1);
              }}
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

        <ul className="global-search-results" ref={listRef}>
          {visibleResults.map((entry, i) => (
            <li key={entry.lesson.id}>
              <button
                type="button"
                className={`global-search-result${i === selectedIndex ? " global-search-result--selected" : ""}`}
                onClick={() => {
                  onNavigateToEntry(entry);
                  onClose();
                }}
                onMouseEnter={() => setSelectedIndex(i)}
              >
                <div className="global-search-result-top">
                  <span className="global-search-result-title">
                    {highlightMatch(entry.lesson.title, normalizedQuery)}
                  </span>
                  <span
                    className={`status-pill ${progress[entry.lesson.id] ? "complete" : "pending"}`}
                  >
                    {progress[entry.lesson.id] ? "Done" : "Pending"}
                  </span>
                </div>
                <span className="global-search-result-path">
                  {highlightMatch(entry.phase.title, normalizedQuery)} ›{" "}
                  {highlightMatch(entry.course.title, normalizedQuery)}
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
