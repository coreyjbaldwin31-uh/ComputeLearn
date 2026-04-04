import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { ProgressRoadmap } from "./progress-roadmap";

afterEach(cleanup);

const phases = [
  {
    id: "phase-1",
    title: "Phase 1",
    level: "Aware",
    duration: "2 weeks",
    courses: [
      {
        id: "course-1",
        title: "Course 1",
        lessons: [{ id: "l1", title: "Lesson 1", duration: "15m" }],
      },
    ],
  },
  {
    id: "phase-2",
    title: "Phase 2",
    level: "Builder",
    duration: "3 weeks",
    courses: [
      {
        id: "course-2",
        title: "Course 2",
        lessons: [{ id: "l2", title: "Lesson 2", duration: "20m" }],
      },
    ],
  },
];

describe("ProgressRoadmap", () => {
  it("allows selecting an upcoming phase", async () => {
    const onSelectPhase = vi.fn();

    render(
      <ProgressRoadmap
        phases={phases}
        selectedPhaseId="phase-1"
        progress={{}}
        phaseLessonCounts={[
          { total: 4, completed: 1 },
          { total: 4, completed: 0 },
        ]}
        onSelectPhase={onSelectPhase}
      />,
    );

    const phaseTwoNode = screen.getByTitle("Phase 2 — 0% complete (upcoming)");
    expect(phaseTwoNode).toBeEnabled();

    await userEvent.click(phaseTwoNode);

    expect(onSelectPhase).toHaveBeenCalledWith("phase-2");
  });

  it("shows expand controls for every phase", () => {
    render(
      <ProgressRoadmap
        phases={phases}
        selectedPhaseId="phase-1"
        progress={{}}
        phaseLessonCounts={[
          { total: 4, completed: 0 },
          { total: 4, completed: 0 },
        ]}
        onSelectPhase={vi.fn()}
      />,
    );

    const expandButtons = screen.getAllByRole("button", { name: /expand/i });
    expect(expandButtons).toHaveLength(2);
  });
});
