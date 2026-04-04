import type { Curriculum } from "@/data/curriculum";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { SidebarPanels } from "./sidebar-panels";

afterEach(cleanup);

const curriculum = {
  phases: [
    {
      id: "phase-1",
      title: "Phase 1",
      level: "Aware",
      duration: "2 weeks",
      strapline: "Start",
      purpose: "Purpose",
      tools: ["PowerShell"],
      courses: [
        {
          id: "course-1",
          title: "Course 1",
          duration: "1 week",
          lessons: [{ id: "lesson-1", title: "Lesson 1" }],
        },
      ],
    },
    {
      id: "phase-2",
      title: "Phase 2",
      level: "Builder",
      duration: "3 weeks",
      strapline: "Build",
      purpose: "Purpose",
      tools: ["Git"],
      courses: [
        {
          id: "course-2",
          title: "Course 2",
          duration: "1 week",
          lessons: [{ id: "lesson-2", title: "Lesson 2" }],
        },
      ],
    },
  ],
} as unknown as Curriculum;

describe("SidebarPanels", () => {
  it("marks the selected phase with aria-current and allows switching", async () => {
    const selectPhase = vi.fn();

    render(
      <SidebarPanels
        curriculum={curriculum}
        selectedPhase={curriculum.phases[0] as never}
        percentComplete={25}
        progress={{}}
        completedWithinPhase={0}
        totalWithinPhase={1}
        phaseStatuses={
          [
            { phaseId: "phase-1", statusLabel: "in-progress" },
            { phaseId: "phase-2", statusLabel: "not-started" },
          ] as never
        }
        competencyDashboard={
          { passingCount: 0, weakCount: 0, records: [] } as never
        }
        phaseTransferAnalytics={[] as never}
        milestonePassRateSummary={
          {
            passRate: 0,
            passedPhases: 0,
            totalPhases: 2,
            blockedPhases: 2,
            statusCounts: { notStarted: 2, inProgress: 0, reviewNeeded: 0 },
            blockedPhaseTitles: ["Phase 1", "Phase 2"],
          } as never
        }
        outcomesDashboardSummary={
          {
            status: "needs-work",
            overallScore: 0,
            snapshots: [],
            prioritizedActions: [],
          } as never
        }
        independentReadiness={null}
        independentLabSummary={
          {
            completionRate: 0,
            completedLabs: 0,
            totalLabs: 0,
            validatedLabs: 0,
            firstPassLabs: 0,
            phaseBreakdown: [],
          } as never
        }
        selectPhase={selectPhase}
      />,
    );

    const phaseOne = screen.getByRole("button", { name: /Phase 1/i });
    const phaseTwo = screen.getByRole("button", { name: /Phase 2/i });

    expect(phaseOne).toHaveAttribute("aria-current", "step");
    expect(phaseTwo).not.toHaveAttribute("aria-current");

    await userEvent.click(phaseTwo);
    expect(selectPhase).toHaveBeenCalledWith("phase-2");
  });
});
