import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/* ---- mock useLocalStorageState ---- */
const mockUseLocalStorageState = vi.fn();
vi.mock("./hooks/use-local-storage-state", () => ({
  useLocalStorageState: (...args: unknown[]) =>
    mockUseLocalStorageState(...args),
}));

/* ---- mock useAnalyticsDashboards ---- */
const mockUseAnalyticsDashboards = vi.fn();
vi.mock("./hooks/use-analytics-dashboards", () => ({
  useAnalyticsDashboards: (...args: unknown[]) =>
    mockUseAnalyticsDashboards(...args),
}));

/* ---- mock data/curriculum ---- */
vi.mock("@/data/curriculum", () => ({
  curriculum: { phases: [] },
}));

/* ---- mock progression-engine ---- */
vi.mock("@/lib/progression-engine", () => ({
  calculateCompetencyLevels: () => ({}),
}));

import { ProgressAnalytics } from "./progress-analytics";

afterEach(cleanup);

function setupDefaults(
  overrides?: Partial<ReturnType<typeof mockUseAnalyticsDashboards>>,
) {
  mockUseLocalStorageState.mockImplementation(
    (_key: string, defaultValue: unknown) => [defaultValue, vi.fn()],
  );

  mockUseAnalyticsDashboards.mockReturnValue({
    outcomesDashboardSummary: {
      overallScore: 0,
      status: "critical",
      snapshots: [],
      prioritizedActions: [],
    },
    phaseStatuses: [],
    phaseTransferAnalytics: [],
    independentReadiness: null,
    ...overrides,
  });
}

describe("ProgressAnalytics", () => {
  it("renders Outcomes Dashboard heading", () => {
    setupDefaults();
    render(<ProgressAnalytics />);

    expect(screen.getByText("Outcomes Dashboard")).toBeInTheDocument();
  });

  it("renders phase progress cards", () => {
    setupDefaults({
      phaseStatuses: [
        {
          phaseId: "phase-1",
          title: "Foundations",
          statusLabel: "in-progress",
          totalLessons: 10,
          completedLessons: 4,
        },
        {
          phaseId: "phase-2",
          title: "Building",
          statusLabel: "not-started",
          totalLessons: 8,
          completedLessons: 0,
        },
      ],
    });

    render(<ProgressAnalytics />);

    expect(screen.getByText("Phase Progress")).toBeInTheDocument();
    expect(screen.getByText("Foundations")).toBeInTheDocument();
    expect(screen.getByText("Building")).toBeInTheDocument();
    expect(screen.getByText("4 / 10 lessons")).toBeInTheDocument();
    expect(screen.getByText("0 / 8 lessons")).toBeInTheDocument();
  });

  it("renders with empty/default localStorage state", () => {
    setupDefaults();
    render(<ProgressAnalytics />);

    // Overall score should show 0% with no snapshots
    expect(screen.getByText("0%")).toBeInTheDocument();
    expect(screen.getByText("Outcomes Dashboard")).toBeInTheDocument();
    expect(screen.getByText("Phase Progress")).toBeInTheDocument();
    expect(screen.getByText("Transfer Analytics")).toBeInTheDocument();
  });

  it("renders independent readiness when data is available", () => {
    setupDefaults({
      independentReadiness: {
        readinessPercent: 42,
        documentationArtifacts: 3,
        completedCapstoneLessons: 1,
        totalCapstoneLessons: 4,
        unmetChecks: ["Complete Phase 3 capstone"],
      },
    });

    render(<ProgressAnalytics />);

    expect(screen.getByText("Independent Readiness")).toBeInTheDocument();
    expect(screen.getByText("42%")).toBeInTheDocument();
    expect(screen.getByText("3 documentation artifacts")).toBeInTheDocument();
    expect(screen.getByText("Complete Phase 3 capstone")).toBeInTheDocument();
  });
});
