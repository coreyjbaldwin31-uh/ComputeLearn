import type { Course, Lesson, Phase } from "@/data/curriculum";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LessonHeader } from "./lesson-header";

afterEach(cleanup);

function makePhase(): Phase {
  return {
    id: "phase-1",
    title: "Foundations",
    level: "Aware",
    duration: "2 weeks",
    strapline: "Start here",
    milestones: [],
    competencies: [],
    exitStandards: { competencyGates: [] },
    courses: [],
  } as unknown as Phase;
}

function makeCourse(): Course {
  return {
    id: "course-1",
    title: "Intro",
    duration: "1 week",
    lessons: [],
  } as unknown as Course;
}

function makeLesson(): Lesson {
  return {
    id: "lesson-1",
    title: "Git Basics",
    summary: "Learn git basics",
    objective: "Commit and branch confidently",
    duration: "20 min",
    difficulty: "Easy",
    notes: [],
    exercises: [],
    validationMode: "manual",
    transferTask: null,
    labs: [],
  } as unknown as Lesson;
}

describe("LessonHeader", () => {
  it("renders reset dialog with accessible title and description", () => {
    render(
      <LessonHeader
        selectedPhase={makePhase()}
        selectedCourse={makeCourse()}
        selectedLesson={makeLesson()}
        progress={{}}
        showCompletedOnly={false}
        showResetConfirm
        lessonGateFeedback={null}
        onSelectCourse={vi.fn()}
        onToggleCompletedOnly={vi.fn()}
        onResetLab={vi.fn()}
        onCancelReset={vi.fn()}
        onConfirmReset={vi.fn()}
        showTerminal={false}
      />,
    );

    const dialog = screen.getByRole("dialog", {
      name: "Reset all exercise data?",
    });
    expect(dialog).toBeInTheDocument();
    expect(dialog).toHaveAttribute("aria-describedby");
    expect(
      screen.getByText(
        /This will clear your answers, hints, feedback, and transfer progress for this lesson/i,
      ),
    ).toBeInTheDocument();
  });

  it("closes reset dialog when Escape is pressed", async () => {
    const onCancelReset = vi.fn();

    render(
      <LessonHeader
        selectedPhase={makePhase()}
        selectedCourse={makeCourse()}
        selectedLesson={makeLesson()}
        progress={{}}
        showCompletedOnly={false}
        showResetConfirm
        lessonGateFeedback={null}
        onSelectCourse={vi.fn()}
        onToggleCompletedOnly={vi.fn()}
        onResetLab={vi.fn()}
        onCancelReset={onCancelReset}
        onConfirmReset={vi.fn()}
        showTerminal={false}
      />,
    );

    await userEvent.keyboard("{Escape}");

    expect(onCancelReset).toHaveBeenCalledTimes(1);
  });
});
