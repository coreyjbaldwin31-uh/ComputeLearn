import type { Curriculum } from "@/data/curriculum";
import type { LessonEntry } from "@/lib/progression-engine";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { HomeDashboard } from "./home-dashboard";

afterEach(cleanup);

const curriculum = {
  phases: [
    {
      id: "phase-1",
      title: "Phase 1",
      level: "Aware",
      duration: "2 weeks",
      strapline: "Phase one",
      courses: [],
    },
    {
      id: "phase-2",
      title: "Phase 2",
      level: "Builder",
      duration: "3 weeks",
      strapline: "Phase two",
      courses: [],
    },
  ],
} as unknown as Curriculum;

const lessonEntry = {
  phase: curriculum.phases[0],
  course: {
    id: "course-1",
    title: "Course 1",
    duration: "1 week",
    lessons: [],
  },
  lesson: {
    id: "lesson-1",
    title: "Intro lesson",
    summary: "Summary",
    objective: "Objective",
    duration: "15 min",
    difficulty: "Easy",
    notes: [],
    exercises: [],
    validationMode: "manual",
    transferTask: null,
    labs: [],
  },
} as unknown as LessonEntry;

describe("HomeDashboard", () => {
  it("allows selecting upcoming phases from the course outline", async () => {
    const onSelectPhase = vi.fn();

    render(
      <HomeDashboard
        curriculum={curriculum}
        selectedPhaseId="phase-1"
        percentComplete={10}
        activityStreak={0}
        progress={{}}
        reviews={{}}
        allLessonsFlat={[lessonEntry]}
        nextUnfinishedEntry={lessonEntry}
        reviewQueueCount={0}
        phaseLessonCounts={[
          { total: 4, completed: 1 },
          { total: 4, completed: 0 },
        ]}
        onContinueCourse={vi.fn()}
        onSelectPhase={onSelectPhase}
        onNavigateToEntry={vi.fn()}
      />,
    );

    const phaseTwoCard = screen.getByRole("button", { name: /Phase 2/i });
    await userEvent.click(phaseTwoCard);

    expect(onSelectPhase).toHaveBeenCalledWith("phase-2");
    expect(screen.getByText("Preview available now")).toBeInTheDocument();
    expect(phaseTwoCard).not.toHaveAttribute("aria-current");
    expect(screen.getByRole("button", { name: /Phase 1/i })).toHaveAttribute(
      "aria-current",
      "step",
    );
  });
});
