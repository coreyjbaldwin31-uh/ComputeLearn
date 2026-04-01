import { useEffect } from "react";

type KeyboardShortcutsConfig = {
  navigateNext: (() => void) | null;
  navigatePrev: (() => void) | null;
  toggleTheme: () => void;
  toggleKeyboardHelp: () => void;
  closeOverlays: () => void;
};

export function useKeyboardShortcuts({
  navigateNext,
  navigatePrev,
  toggleTheme,
  toggleKeyboardHelp,
  closeOverlays,
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    function handleKeyboard(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "j" && navigateNext) {
        navigateNext();
      } else if (e.key === "k" && navigatePrev) {
        navigatePrev();
      } else if (e.key === "?" && !e.ctrlKey && !e.metaKey) {
        toggleKeyboardHelp();
      } else if (e.key === "d" && (e.ctrlKey || e.metaKey) && e.shiftKey) {
        e.preventDefault();
        toggleTheme();
      } else if (e.key === "Escape") {
        closeOverlays();
      }
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  }, [navigateNext, navigatePrev, toggleTheme, toggleKeyboardHelp, closeOverlays]);
}
