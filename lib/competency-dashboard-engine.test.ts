import { describe, expect, it } from "vitest";
import { buildCompetencyDashboardSummary } from "./competency-dashboard-engine";

describe("buildCompetencyDashboardSummary", () => {
  it("sorts competencies by count and marks weak ones", () => {
    const summary = buildCompetencyDashboardSummary({
      Debugging: 10,
      ApiIntegration: 2,
      VersionControl: 8,
    });

    expect(summary.records[0].track).toBe("Debugging");
    expect(summary.records.find((record) => record.track === "ApiIntegration")?.isWeak).toBe(true);
    expect(summary.passingCount).toBe(2);
    expect(summary.weakCount).toBe(1);
  });

  it("returns empty summary for no competency data", () => {
    const summary = buildCompetencyDashboardSummary({});
    expect(summary.records).toEqual([]);
    expect(summary.weakCount).toBe(0);
    expect(summary.passingCount).toBe(0);
  });
});
