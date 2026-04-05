"use client";

import { useSession } from "next-auth/react";
import { useEffect, useRef } from "react";
import { fetchProgress, upsertProgress } from "@/lib/api-client";

function safeParseJSON<T>(raw: string | null, fallback: T): T {
  if (raw == null) return fallback;
  try {
    return JSON.parse(raw) as T;
  } catch {
    return fallback;
  }
}

/**
 * Hook that syncs localStorage ↔ API at the app level.
 * - On mount (authenticated): fetches server state → merges into localStorage
 * - Listens for ls-write events → writes changes to API in background
 *
 * Merge strategy: server wins for completion state, client wins for in-progress edits.
 */
export function useProgressSync() {
  const { status } = useSession();
  const hasSynced = useRef(false);

  // Initial sync: API → localStorage
  useEffect(() => {
    if (status !== "authenticated" || hasSynced.current) return;
    hasSynced.current = true;

    (async () => {
      const serverProgress = await fetchProgress();
      if (!serverProgress) return;

      // Merge completion state (server wins)
      const existing = safeParseJSON<Record<string, true>>(
        localStorage.getItem("computelearn-progress"),
        {},
      );
      const merged = { ...existing };
      for (const [lessonId, p] of Object.entries(serverProgress)) {
        if (p.completed) merged[lessonId] = true;
      }
      if (Object.keys(merged).length > Object.keys(existing).length) {
        localStorage.setItem("computelearn-progress", JSON.stringify(merged));
        window.dispatchEvent(
          new CustomEvent("ls-write", {
            detail: { key: "computelearn-progress" },
          }),
        );
      }

      // Merge notes (server fills gaps only)
      const existingNotes = safeParseJSON<Record<string, string>>(
        localStorage.getItem("computelearn-notes"),
        {},
      );
      let notesChanged = false;
      for (const [lessonId, p] of Object.entries(serverProgress)) {
        if (p.notes && !existingNotes[lessonId]) {
          existingNotes[lessonId] = p.notes;
          notesChanged = true;
        }
      }
      if (notesChanged) {
        localStorage.setItem(
          "computelearn-notes",
          JSON.stringify(existingNotes),
        );
        window.dispatchEvent(
          new CustomEvent("ls-write", {
            detail: { key: "computelearn-notes" },
          }),
        );
      }

      // Merge reflections (server fills gaps only)
      const existingReflections = safeParseJSON<Record<string, string>>(
        localStorage.getItem("computelearn-reflections"),
        {},
      );
      let reflectionsChanged = false;
      for (const [lessonId, p] of Object.entries(serverProgress)) {
        if (p.reflection && !existingReflections[lessonId]) {
          existingReflections[lessonId] = p.reflection;
          reflectionsChanged = true;
        }
      }
      if (reflectionsChanged) {
        localStorage.setItem(
          "computelearn-reflections",
          JSON.stringify(existingReflections),
        );
        window.dispatchEvent(
          new CustomEvent("ls-write", {
            detail: { key: "computelearn-reflections" },
          }),
        );
      }
    })();
  }, [status]);

  // Background sync: localStorage writes → API
  useEffect(() => {
    if (status !== "authenticated") return;

    const debouncedSync = (syncKey: string, fn: () => void) => {
      if (timers[syncKey]) clearTimeout(timers[syncKey]);
      timers[syncKey] = setTimeout(fn, 300);
    };

    const timers: Record<string, ReturnType<typeof setTimeout>> = {};

    const handler = (e: Event) => {
      const detail = (e as CustomEvent).detail;
      if (!detail?.key) return;
      const key = detail.key as string;

      if (key === "computelearn-progress") {
        debouncedSync("progress", syncProgressToServer);
      } else if (
        key === "computelearn-notes" ||
        key === "computelearn-reflections"
      ) {
        debouncedSync(key, () => syncNotesReflectionsToServer(key));
      }
    };

    window.addEventListener("ls-write", handler);
    return () => {
      window.removeEventListener("ls-write", handler);
      for (const t of Object.values(timers)) clearTimeout(t);
    };
  }, [status]);
}

// --- Sync helpers (fire-and-forget, errors are silently ignored) ---

function syncProgressToServer() {
  const data = safeParseJSON<Record<string, true>>(
    localStorage.getItem("computelearn-progress"),
    {},
  );
  for (const lessonId of Object.keys(data)) {
    void upsertProgress({ lessonId, completed: true });
  }
}

function syncNotesReflectionsToServer(key: string) {
  const isNotes = key === "computelearn-notes";
  const map = safeParseJSON<Record<string, string>>(
    localStorage.getItem(key),
    {},
  );
  for (const [lessonId, value] of Object.entries(map)) {
    if (!value) continue;
    void upsertProgress(
      isNotes ? { lessonId, notes: value } : { lessonId, reflection: value },
    );
  }
}
