"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

type LocalStorageWriteErrorDetail = {
  key: string;
  message: string;
  raw: string | null;
};

type LocalStorageWriteDetail = {
  key: string;
};

const volatileFallback = new Map<string, unknown>();

export type LearnerProfile = {
  displayName: string;
  goal: string;
  weeklyHours: number;
  createdAt: string | null;
};

export const learnerProfileStorageKey = "computelearn-learner-profile";

const emptyProfile: LearnerProfile = {
  displayName: "",
  goal: "",
  weeklyHours: 4,
  createdAt: null,
};

function useLocalStorageValue<T>(key: string, initial: T) {
  const initialRef = useRef(initial);
  const cached = useRef({
    raw: undefined as string | undefined,
    value: initial,
  });

  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener("storage", cb);
    window.addEventListener("ls-write", cb);
    return () => {
      window.removeEventListener("storage", cb);
      window.removeEventListener("ls-write", cb);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    if (volatileFallback.has(key)) {
      return volatileFallback.get(key) as T;
    }

    const raw = localStorage.getItem(key) ?? undefined;
    if (raw === cached.current.raw) return cached.current.value;
    let val: T;
    try {
      val = raw != null ? (JSON.parse(raw) as T) : initialRef.current;
    } catch {
      val = initialRef.current;
    }
    cached.current = { raw, value: val };
    return val;
  }, [key]);

  const getServerSnapshot = useCallback(() => initialRef.current, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const set = useCallback(
    (fn: T | ((prev: T) => T)) => {
      let attemptedRaw: string | null = null;
      let nextValue: T | null = null;
      try {
        const cur = (() => {
          if (volatileFallback.has(key)) {
            return volatileFallback.get(key) as T;
          }

          const r = localStorage.getItem(key);
          try {
            return r != null ? (JSON.parse(r) as T) : initialRef.current;
          } catch {
            return initialRef.current;
          }
        })();
        const next = typeof fn === "function" ? (fn as (p: T) => T)(cur) : fn;
        nextValue = next;
        const raw = JSON.stringify(next);
        attemptedRaw = raw;
        localStorage.setItem(key, raw);
        volatileFallback.delete(key);
        cached.current = { raw, value: next };
        const successDetail: LocalStorageWriteDetail = { key };
        window.dispatchEvent(
          new CustomEvent("ls-write", { detail: successDetail }),
        );
      } catch (error) {
        if (nextValue !== null) {
          volatileFallback.set(key, nextValue);
          cached.current = { raw: undefined, value: nextValue };
          const successDetail: LocalStorageWriteDetail = { key };
          window.dispatchEvent(
            new CustomEvent("ls-write", { detail: successDetail }),
          );
        }

        const message =
          error instanceof Error ? error.message : "Storage write failed";
        const detail: LocalStorageWriteErrorDetail = {
          key,
          message,
          raw: attemptedRaw,
        };
        window.dispatchEvent(new CustomEvent("ls-write-error", { detail }));
      }
    },
    [key],
  );

  return [value, set] as const;
}

export function useLearnerProfile() {
  const [profile, setProfile] = useLocalStorageValue<LearnerProfile>(
    learnerProfileStorageKey,
    emptyProfile,
  );

  function update(patch: Partial<Omit<LearnerProfile, "createdAt">>) {
    setProfile((current) => ({
      ...current,
      ...patch,
      createdAt: current.createdAt ?? new Date().toISOString(),
    }));
  }

  return { profile, update } as const;
}
