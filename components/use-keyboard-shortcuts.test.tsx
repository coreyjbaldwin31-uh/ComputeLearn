import { cleanup, renderHook } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";

afterEach(cleanup);

function fire(key: string, extra?: Partial<KeyboardEvent>) {
  window.dispatchEvent(
    new KeyboardEvent("keydown", { key, bubbles: true, ...extra }),
  );
}

function defaults(overrides = {}) {
  return {
    navigateNext: null,
    navigatePrev: null,
    toggleTheme: vi.fn(),
    toggleKeyboardHelp: vi.fn(),
    closeOverlays: vi.fn(),
    openSearch: null,
    goHome: null,
    toggleCompletion: null,
    scrollToNotes: null,
    scrollToExercises: null,
    ...overrides,
  };
}

describe("useKeyboardShortcuts", () => {
  it("calls navigateNext on j key", () => {
    const navigateNext = vi.fn();
    renderHook(() => useKeyboardShortcuts(defaults({ navigateNext })));
    fire("j");
    expect(navigateNext).toHaveBeenCalledOnce();
  });

  it("calls navigatePrev on k key", () => {
    const navigatePrev = vi.fn();
    renderHook(() => useKeyboardShortcuts(defaults({ navigatePrev })));
    fire("k");
    expect(navigatePrev).toHaveBeenCalledOnce();
  });

  it("does not navigate when callbacks are null", () => {
    renderHook(() => useKeyboardShortcuts(defaults()));
    fire("j");
    fire("k");
  });

  it("toggles keyboard help on ? key", () => {
    const toggleKeyboardHelp = vi.fn();
    renderHook(() => useKeyboardShortcuts(defaults({ toggleKeyboardHelp })));
    fire("?");
    expect(toggleKeyboardHelp).toHaveBeenCalledOnce();
  });

  it("toggles theme on Ctrl+Shift+D", () => {
    const toggleTheme = vi.fn();
    renderHook(() => useKeyboardShortcuts(defaults({ toggleTheme })));
    fire("d", { ctrlKey: true, shiftKey: true });
    expect(toggleTheme).toHaveBeenCalledOnce();
  });

  it("calls closeOverlays on Escape", () => {
    const closeOverlays = vi.fn();
    renderHook(() => useKeyboardShortcuts(defaults({ closeOverlays })));
    fire("Escape");
    expect(closeOverlays).toHaveBeenCalledOnce();
  });

  it("opens search on / key", () => {
    const openSearch = vi.fn();
    renderHook(() => useKeyboardShortcuts(defaults({ openSearch })));
    fire("/");
    expect(openSearch).toHaveBeenCalledOnce();
  });

  it("opens search on Ctrl+K", () => {
    const openSearch = vi.fn();
    renderHook(() => useKeyboardShortcuts(defaults({ openSearch })));
    fire("k", { ctrlKey: true });
    expect(openSearch).toHaveBeenCalledOnce();
  });

  it("opens search on Cmd+K", () => {
    const openSearch = vi.fn();
    renderHook(() => useKeyboardShortcuts(defaults({ openSearch })));
    fire("k", { metaKey: true });
    expect(openSearch).toHaveBeenCalledOnce();
  });

  it("calls goHome on h key", () => {
    const goHome = vi.fn();
    renderHook(() => useKeyboardShortcuts(defaults({ goHome })));
    fire("h");
    expect(goHome).toHaveBeenCalledOnce();
  });

  it("calls toggleCompletion on m key", () => {
    const toggleCompletion = vi.fn();
    renderHook(() => useKeyboardShortcuts(defaults({ toggleCompletion })));
    fire("m");
    expect(toggleCompletion).toHaveBeenCalledOnce();
  });

  it("calls scrollToNotes on n key", () => {
    const scrollToNotes = vi.fn();
    renderHook(() => useKeyboardShortcuts(defaults({ scrollToNotes })));
    fire("n");
    expect(scrollToNotes).toHaveBeenCalledOnce();
  });

  it("calls scrollToExercises on e key", () => {
    const scrollToExercises = vi.fn();
    renderHook(() => useKeyboardShortcuts(defaults({ scrollToExercises })));
    fire("e");
    expect(scrollToExercises).toHaveBeenCalledOnce();
  });

  it("ignores shortcuts when target is INPUT", () => {
    const navigateNext = vi.fn();
    renderHook(() => useKeyboardShortcuts(defaults({ navigateNext })));

    const input = document.createElement("input");
    document.body.appendChild(input);
    input.dispatchEvent(
      new KeyboardEvent("keydown", { key: "j", bubbles: true }),
    );
    expect(navigateNext).not.toHaveBeenCalled();
    document.body.removeChild(input);
  });
});
