import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/* ---- mock useLocalStorageState ---- */
const mockUseLocalStorageState = vi.fn();
vi.mock("./hooks/use-local-storage-state", () => ({
  useLocalStorageState: (...args: unknown[]) =>
    mockUseLocalStorageState(...args),
}));

/* ---- mock curriculum ---- */
vi.mock("@/data/curriculum", () => ({
  curriculum: { phases: [] },
}));

/* ---- mock progression-engine ---- */
vi.mock("@/lib/progression-engine", () => ({
  calculateCompetencyLevels: () => ({}),
}));

/* ---- mock readiness engine ---- */
const mockBuildReadiness = vi.fn();
vi.mock("@/lib/independent-readiness-engine", () => ({
  buildIndependentReadinessSummary: (...args: unknown[]) =>
    mockBuildReadiness(...args),
}));

/* ---- mock lab engine ---- */
const mockBuildLabSummary = vi.fn();
vi.mock("@/lib/independent-lab-engine", () => ({
  buildIndependentLabSummary: (...args: unknown[]) =>
    mockBuildLabSummary(...args),
}));

import { ReadinessWizard } from "./readiness-wizard";

afterEach(cleanup);

function setupDefaults() {
  mockUseLocalStorageState.mockImplementation(
    (_key: string, defaultValue: unknown) => [defaultValue, vi.fn()],
  );
}

describe("ReadinessWizard", () => {
  it("renders empty state when no Phase 4 readiness data exists", () => {
    setupDefaults();
    mockBuildReadiness.mockReturnValue(null);
    mockBuildLabSummary.mockReturnValue({
      totalLabs: 0,
      completedLabs: 0,
      validatedLabs: 0,
      firstPassLabs: 0,
      completionRate: 0,
      phaseBreakdown: [],
    });

    render(<ReadinessWizard />);

    expect(
      screen.getByText(
        /Complete Phases 1–3 to unlock independent readiness tracking/,
      ),
    ).toBeInTheDocument();
  });

  it("renders readiness percentage when data is available", () => {
    setupDefaults();
    mockBuildReadiness.mockReturnValue({
      readinessPercent: 72,
      statusLabel: "building",
      completedLessons: 5,
      totalLessons: 7,
      phaseTitle: "Phase 4: Independent Practice",
      checks: [],
      unmetChecks: [],
    });
    mockBuildLabSummary.mockReturnValue({
      totalLabs: 3,
      completedLabs: 2,
      validatedLabs: 1,
      firstPassLabs: 1,
      completionRate: 67,
      phaseBreakdown: [{ phaseId: "p4", totalLabs: 3, completedLabs: 2 }],
    });

    render(<ReadinessWizard />);

    expect(screen.getByText("72%")).toBeInTheDocument();
    expect(screen.getByText("Building")).toBeInTheDocument();
    expect(screen.getByText(/5\/7 lessons complete/)).toBeInTheDocument();
  });

  it("renders readiness checks list", () => {
    setupDefaults();
    mockBuildReadiness.mockReturnValue({
      readinessPercent: 50,
      statusLabel: "building",
      completedLessons: 3,
      totalLessons: 6,
      phaseTitle: "Phase 4",
      checks: [
        { id: "c1", label: "Core lessons complete", detail: "3 of 6", passed: true },
        { id: "c2", label: "Transfer tasks done", detail: "1 of 4", passed: false },
      ],
      unmetChecks: ["Complete remaining transfer tasks"],
    });
    mockBuildLabSummary.mockReturnValue({
      totalLabs: 2,
      completedLabs: 1,
      validatedLabs: 0,
      firstPassLabs: 0,
      completionRate: 50,
      phaseBreakdown: [{ phaseId: "p4", totalLabs: 2, completedLabs: 1 }],
    });

    render(<ReadinessWizard />);

    expect(screen.getByText("Readiness Checks")).toBeInTheDocument();
    expect(screen.getByText("Core lessons complete")).toBeInTheDocument();
    expect(screen.getByText("Transfer tasks done")).toBeInTheDocument();
  });
});
