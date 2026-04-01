"use client";

import { useCallback, useEffect } from "react";
import { useLocalStorageState } from "./use-local-storage-state";

const themeStorageKey = "computelearn-theme";

export function useTheme() {
  const [theme, setTheme] = useLocalStorageState<"light" | "dark">(
    themeStorageKey,
    "light",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  return { theme, toggle };
}
