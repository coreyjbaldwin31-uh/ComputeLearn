import { describe, expect, it } from "vitest";
import {
    MASTERY_LEVEL_ORDER,
    buildCompetencyRecord,
    getMasteryRank,
    getWeakCompetencyTracks,
    isMasteryPassing,
    toSortedCompetencyRecords,
} from "./competency-engine";

describe("MASTERY_LEVEL_ORDER", () => {
  it("orders levels from lowest to highest", () => {
    expect(MASTERY_LEVEL_ORDER[0]).toBe("Unstarted");
    expect(MASTERY_LEVEL_ORDER[MASTERY_LEVEL_ORDER.length - 1]).toBe(
      "Independent",
    );
  });
});

describe("getMasteryRank", () => {
  it("returns a higher rank for higher mastery levels", () => {
    expect(getMasteryRank("Unstarted")).toBeLessThan(getMasteryRank("Aware"));
    expect(getMasteryRank("Aware")).toBeLessThan(getMasteryRank("Assisted"));
    expect(getMasteryRank("Assisted")).toBeLessThan(getMasteryRank("Functional"));
    expect(getMasteryRank("Functional")).toBeLessThan(
      getMasteryRank("Independent"),
    );
  });

  it("returns -1 for an unrecognised level", () => {
    expect(getMasteryRank("Expert")).toBe(-1);
    expect(getMasteryRank("")).toBe(-1);
  });

  it("accepts lowercase mastery levels from progression-engine", () => {
    expect(getMasteryRank("unstarted")).toBe(getMasteryRank("Unstarted"));
    expect(getMasteryRank("functional")).toBe(getMasteryRank("Functional"));
  });
});

describe("isMasteryPassing", () => {
  it("returns false for levels below Functional", () => {
    expect(isMasteryPassing("Unstarted")).toBe(false);
    expect(isMasteryPassing("Aware")).toBe(false);
    expect(isMasteryPassing("Assisted")).toBe(false);
  });

  it("returns true for Functional and above", () => {
    expect(isMasteryPassing("Functional")).toBe(true);
    expect(isMasteryPassing("Independent")).toBe(true);
  });
});

describe("getWeakCompetencyTracks", () => {
  const levels: Record<string, string> = {
    VersionControl: "Functional",
    Debugging: "Assisted",
    ApiIntegration: "Aware",
    ProgrammingLogic: "Independent",
  };

  it("returns tracks below the Functional threshold", () => {
    const weak = getWeakCompetencyTracks(levels, "Functional");
    expect(weak).toContain("Debugging");
    expect(weak).toContain("ApiIntegration");
    expect(weak).not.toContain("VersionControl");
    expect(weak).not.toContain("ProgrammingLogic");
  });

  it("supports lowercase level values", () => {
    const lowercaseLevels: Record<string, string> = {
      VersionControl: "functional",
      Debugging: "assisted",
    };

    expect(getWeakCompetencyTracks(lowercaseLevels, "Functional")).toEqual([
      "Debugging",
    ]);
  });

  it("returns an empty array when all tracks meet the threshold", () => {
    const allPassing: Record<string, string> = {
      VersionControl: "Functional",
      Debugging: "Independent",
    };
    expect(getWeakCompetencyTracks(allPassing, "Functional")).toHaveLength(0);
  });

  it("returns all tracks when threshold is Independent", () => {
    const weak = getWeakCompetencyTracks(levels, "Independent");
    expect(weak).toContain("VersionControl");
    expect(weak).toContain("Debugging");
    expect(weak).toContain("ApiIntegration");
    expect(weak).not.toContain("ProgrammingLogic");
  });
});

describe("buildCompetencyRecord", () => {
  it("returns a record with all provided fields", () => {
    const record = buildCompetencyRecord(
      "Debugging",
      "Debugging",
      "Functional",
      "2024-01-01T00:00:00.000Z",
    );
    expect(record.track).toBe("Debugging");
    expect(record.displayName).toBe("Debugging");
    expect(record.level).toBe("Functional");
    expect(record.earnedAt).toBe("2024-01-01T00:00:00.000Z");
  });
});

describe("toSortedCompetencyRecords", () => {
  it("sorts records highest level first", () => {
    const levels: Record<string, string> = {
      Debugging: "Assisted",
      VersionControl: "Functional",
      ProgrammingLogic: "Independent",
    };
    const records = toSortedCompetencyRecords(
      levels,
      (track) => track,
      "2024-01-01T00:00:00.000Z",
    );
    expect(records[0].level).toBe("Independent");
    expect(records[records.length - 1].level).toBe("Assisted");
  });

  it("applies the formatName function to displayName", () => {
    const levels: Record<string, string> = { VersionControl: "Functional" };
    const records = toSortedCompetencyRecords(
      levels,
      (track) => `${track} skill`,
      "2024-01-01T00:00:00.000Z",
    );
    expect(records[0].displayName).toBe("VersionControl skill");
  });

  it("returns one record per track", () => {
    const levels: Record<string, string> = {
      A: "Aware",
      B: "Functional",
      C: "Independent",
    };
    expect(
      toSortedCompetencyRecords(levels, (t) => t, "2024-01-01T00:00:00.000Z"),
    ).toHaveLength(3);
  });
});
