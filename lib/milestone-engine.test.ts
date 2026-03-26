import { describe, expect, it } from "vitest";
import { evaluatePhaseMilestoneStatus } from "./milestone-engine";

describe("evaluatePhaseMilestoneStatus", () => {
  const baseExitStatus = {
    gates: [],
    competencyGatesPassed: true,
    transferGatePassed: true,
    allPassed: true,
    nextPhase: {
      id: "phase-2",
      title: "Phase 2",
      strapline: "",
      purpose: "",
      level: "",
      duration: "",
      environment: "",
      tools: [],
      guardrails: [],
      milestones: [],
      projects: [],
      courses: [],
    },
  };

  it("returns null when no phase exit status is available", () => {
    expect(evaluatePhaseMilestoneStatus(null, 0)).toBeNull();
  });

  it("passes all gates when competency, transfer, and reinforcement are clear", () => {
    const result = evaluatePhaseMilestoneStatus(baseExitStatus, 0);

    expect(result?.allPassed).toBe(true);
    expect(result?.reinforcementGatePassed).toBe(true);
    expect(result?.blockedReasons).toEqual([]);
    expect(result?.nextPhaseTitle).toBe("Phase 2");
  });

  it("blocks advancement when reinforcement items are pending", () => {
    const result = evaluatePhaseMilestoneStatus(baseExitStatus, 2);

    expect(result?.allPassed).toBe(false);
    expect(result?.reinforcementGatePassed).toBe(false);
    expect(result?.blockedReasons[0]).toContain("2 reinforcement items");
  });

  it("surfaces multiple blocker reasons", () => {
    const result = evaluatePhaseMilestoneStatus(
      {
        ...baseExitStatus,
        competencyGatesPassed: false,
        transferGatePassed: false,
      },
      1,
    );

    expect(result?.blockedReasons).toHaveLength(3);
    expect(result?.gates.find((gate) => gate.id === "competency")?.passed).toBe(false);
    expect(result?.gates.find((gate) => gate.id === "transfer")?.passed).toBe(false);
    expect(result?.gates.find((gate) => gate.id === "reinforcement")?.passed).toBe(false);
  });
});