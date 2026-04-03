import { useEffect } from "react";

type KeyboardShortcutsConfig = {
  navigateNext: (() => void) | null;
  navigatePrev: (() => void) | null;
  toggleTheme: () => void;
  toggleKeyboardHelp: () => void;
  closeOverlays: () => void;
  openSearch: (() => void) | null;
  goHome: (() => void) | null;
  toggleCompletion: (() => void) | null;
  scrollToNotes: (() => void) | null;
  scrollToExercises: (() => void) | null;
};

export function useKeyboardShortcuts({
  navigateNext,
  navigatePrev,
  toggleTheme,
  toggleKeyboardHelp,
  closeOverlays,
  openSearch,
  goHome,
  toggleCompletion,
  scrollToNotes,
  scrollToExercises,
}: KeyboardShortcutsConfig) {
  useEffect(() => {
    function handleKeyboard(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (
        openSearch &&
        ((e.key === "/" && !e.ctrlKey && !e.metaKey) ||
          (e.key.toLowerCase() === "k" && (e.ctrlKey || e.metaKey)))
      ) {
        e.preventDefault();
        openSearch();
      } else if (e.key === "j" && navigateNext) {
        navigateNext();
      } else if (e.key === "k" && navigatePrev) {
        navigatePrev();
      } else if (e.key === "m" && !e.ctrlKey && !e.metaKey && toggleCompletion) {
        toggleCompletion();
      } else if (e.key === "n" && !e.ctrlKey && !e.metaKey && scrollToNotes) {
        scrollToNotes();
      } else if (e.key === "e" && !e.ctrlKey && !e.metaKey && scrollToExercises) {
        scrollToExercises();
      } else if (e.key === "h" && !e.ctrlKey && !e.metaKey && goHome) {
        goHome();
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
  }, [navigateNext, navigatePrev, toggleTheme, toggleKeyboardHelp, closeOverlays, openSearch, goHome, toggleCompletion, scrollToNotes, scrollToExercises]);
}
