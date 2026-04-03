import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import type { LessonEntry } from "@/lib/progression-engine";
import { GlobalSearch } from "./global-search";

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
      exitStandards: {
        competencyGates: [],
      },
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
      summary: "lesson summary",
      objective: "lesson objective",
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

describe("GlobalSearch", () => {
  it("opens the first result when pressing Enter without arrow selection", async () => {
    const onNavigateToEntry = vi.fn();
    const onClose = vi.fn();
    const entries = [makeEntry("l1", "Git Basics"), makeEntry("l2", "HTTP Basics")];

    render(
      <GlobalSearch
        allLessonsFlat={entries}
        progress={{}}
        onNavigateToEntry={onNavigateToEntry}
        onClose={onClose}
      />,
    );

    const input = screen.getByRole("searchbox", { name: /search lessons/i });
    await userEvent.type(input, "git");
    await userEvent.keyboard("{Enter}");

    expect(onNavigateToEntry).toHaveBeenCalledWith(entries[0]);
    expect(onClose).toHaveBeenCalled();
  });

  it("does nothing on Enter when there are no matching results", async () => {
    const onNavigateToEntry = vi.fn();
    const onClose = vi.fn();

    render(
      <GlobalSearch
        allLessonsFlat={[makeEntry("l1", "Git Basics")]}
        progress={{}}
        onNavigateToEntry={onNavigateToEntry}
        onClose={onClose}
      />,
    );

    const input = screen.getByRole("searchbox", { name: /search lessons/i });
    await userEvent.type(input, "nonexistent");
    await userEvent.keyboard("{Enter}");

    expect(onNavigateToEntry).not.toHaveBeenCalled();
    expect(onClose).not.toHaveBeenCalled();
  });
});
