"use client";

import { useCallback, useRef, useSyncExternalStore } from "react";

export function useLocalStorageState<T>(key: string, initial: T) {
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
    const raw = localStorage.getItem(key) ?? undefined;
    if (raw === cached.current.raw) return cached.current.value;
    const val = raw != null ? (JSON.parse(raw) as T) : initialRef.current;
    cached.current = { raw, value: val };
    return val;
  }, [key]);

  const getServerSnapshot = useCallback(() => initialRef.current, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const set = useCallback(
    (fn: T | ((prev: T) => T)) => {
      const cur = (() => {
        const r = localStorage.getItem(key);
        return r != null ? (JSON.parse(r) as T) : initialRef.current;
      })();
      const next = typeof fn === "function" ? (fn as (p: T) => T)(cur) : fn;
      const raw = JSON.stringify(next);
      localStorage.setItem(key, raw);
      cached.current = { raw, value: next };
      window.dispatchEvent(new Event("ls-write"));
    },
    [key],
  );

  return [value, set] as const;
}
