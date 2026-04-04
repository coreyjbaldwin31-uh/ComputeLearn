import type { Lesson } from "@/data/curriculum";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ActionBar } from "./action-bar";

afterEach(cleanup);

const lesson = {
  id: "lesson-1",
  title: "Lesson",
  summary: "Summary",
  objective: "Objective",
  duration: "25 min",
  difficulty: "Beginner",
  notes: [],
  exercises: [
    { id: "ex-1", prompt: "Prompt", kind: "open-text", expected: "" },
  ],
  validationMode: "manual",
  transferTask: null,
  labs: [],
} as unknown as Lesson;

describe("ActionBar", () => {
  it("exposes completion state via aria-pressed", () => {
    const { rerender } = render(
      <ActionBar
        lesson={lesson}
        isComplete={false}
        lessonProgress={{ current: 0, total: 1 }}
        onToggleCompletion={vi.fn()}
        onScrollToNotes={vi.fn()}
        onScrollToExercises={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Mark lesson as complete" }),
    ).toHaveAttribute("aria-pressed", "false");

    rerender(
      <ActionBar
        lesson={lesson}
        isComplete
        lessonProgress={{ current: 1, total: 1 }}
        onToggleCompletion={vi.fn()}
        onScrollToNotes={vi.fn()}
        onScrollToExercises={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", { name: "Mark lesson as incomplete" }),
    ).toHaveAttribute("aria-pressed", "true");
  });

  it("invokes section jump handlers from action controls", async () => {
    const onScrollToNotes = vi.fn();
    const onScrollToExercises = vi.fn();

    render(
      <ActionBar
        lesson={lesson}
        isComplete={false}
        lessonProgress={{ current: 0, total: 1 }}
        onToggleCompletion={vi.fn()}
        onScrollToNotes={onScrollToNotes}
        onScrollToExercises={onScrollToExercises}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Jump to exercises section" }),
    );
    await userEvent.click(
      screen.getByRole("button", { name: "Jump to notes section" }),
    );

    expect(onScrollToExercises).toHaveBeenCalledTimes(1);
    expect(onScrollToNotes).toHaveBeenCalledTimes(1);
  });
});
