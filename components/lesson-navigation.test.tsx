import type { LessonEntry } from "@/lib/progression-engine";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LessonNavigation } from "./lesson-navigation";

afterEach(cleanup);

function makeEntry(id: string, title: string): LessonEntry {
  return {
    phase: {
      id: "phase-1",
      title: "Foundations",
      level: "Aware",
      duration: "2 weeks",
      strapline: "Start here",
      milestones: [],
      competencies: [],
      exitStandards: { competencyGates: [] },
      courses: [],
    } as unknown as LessonEntry["phase"],
    course: {
      id: "course-1",
      title: "Intro",
      duration: "1 week",
      lessons: [],
    } as unknown as LessonEntry["course"],
    lesson: {
      id,
      title,
      summary: "summary",
      objective: "objective",
      duration: "15 min",
      difficulty: "Easy",
      notes: [],
      exercises: [],
      validationMode: "manual",
      transferTask: null,
      labs: [],
    } as unknown as LessonEntry["lesson"],
  };
}

describe("LessonNavigation", () => {
  it("adds accessible labels with lesson title and keyboard hints", () => {
    const prev = makeEntry("l1", "Git Basics");
    const next = makeEntry("l2", "HTTP Basics");

    render(
      <LessonNavigation
        prevEntry={prev}
        nextEntry={next}
        onNavigateToEntry={vi.fn()}
      />,
    );

    expect(
      screen.getByRole("button", {
        name: "Previous lesson: Git Basics (k)",
      }),
    ).toBeInTheDocument();

    expect(
      screen.getByRole("button", {
        name: "Next lesson: HTTP Basics (j)",
      }),
    ).toBeInTheDocument();
  });

  it("navigates using previous and next buttons", async () => {
    const prev = makeEntry("l1", "Git Basics");
    const next = makeEntry("l2", "HTTP Basics");
    const onNavigateToEntry = vi.fn();

    render(
      <LessonNavigation
        prevEntry={prev}
        nextEntry={next}
        onNavigateToEntry={onNavigateToEntry}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "Previous lesson: Git Basics (k)",
      }),
    );
    await userEvent.click(
      screen.getByRole("button", {
        name: "Next lesson: HTTP Basics (j)",
      }),
    );

    expect(onNavigateToEntry).toHaveBeenNthCalledWith(1, prev);
    expect(onNavigateToEntry).toHaveBeenNthCalledWith(2, next);
  });
});
