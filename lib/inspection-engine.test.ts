import { describe, expect, it } from "vitest";
import { buildExerciseInspection } from "./inspection-engine";

describe("buildExerciseInspection", () => {
  it("reports matched and missing signals for a partial debugging answer", () => {
    const inspection = buildExerciseInspection(
      {
        id: "debug-1",
        title: "Root cause",
        prompt: "Explain the issue.",
        placeholder: "Short answer",
        validationMode: "includes",
        acceptedAnswers: ["symptom", "root cause", "log"],
        successMessage: "ok",
        hint: "inspect the logs",
        assessmentType: "debugging",
      },
      "I found the symptom in the log output.",
    );

    expect(inspection.passed).toBe(true);
    expect(inspection.matchedSignals).toEqual(
      expect.arrayContaining(["symptom", "log"]),
    );
    expect(inspection.missingSignals).toContain("root");
    expect(inspection.extraSignals).toContain("found");
    expect(inspection.signalDiff).toEqual(
      expect.arrayContaining(["+ symptom", "+ log", "- root"]),
    );
    expect(inspection.probableSkillGap).toBe("Debugging accuracy");
    expect(inspection.inspectionPrompts[0]).toContain("symptom");
  });

  it("shows missing signals for an incomplete transfer answer", () => {
    const inspection = buildExerciseInspection(
      {
        id: "transfer-1",
        title: "Ship it",
        prompt: "List deliverables.",
        placeholder: "List",
        validationMode: "includes",
        acceptedAnswers: ["readme", "tests", "usage"],
        successMessage: "ok",
        hint: "Think reproducibility.",
        assessmentType: "transfer",
      },
      "Need a readme for setup.",
    );

    expect(inspection.passed).toBe(true);
    expect(inspection.matchedSignals).toContain("readme");
    expect(inspection.missingSignals).toEqual(
      expect.arrayContaining(["tests", "usage"]),
    );
    expect(inspection.signalDiff).toEqual(
      expect.arrayContaining(["+ readme", "- tests", "- usage"]),
    );
    expect(inspection.inspectionPrompts[0]).toContain("deliverable");
  });
});
