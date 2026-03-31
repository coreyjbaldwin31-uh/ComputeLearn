import { describe, expect, it } from "vitest";
import { curriculum } from "./curriculum";
import {
    phase1LabTemplates,
    phase2LabTemplates,
    phase3LabTemplates,
    phase4LabTemplates,
} from "./lab-templates";

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function allLessons() {
  return curriculum.phases.flatMap((p) => p.courses.flatMap((c) => c.lessons));
}

function allCourses() {
  return curriculum.phases.flatMap((p) => p.courses);
}

const allLabTemplates = [
  ...phase1LabTemplates,
  ...phase2LabTemplates,
  ...phase3LabTemplates,
  ...phase4LabTemplates,
];

// ---------------------------------------------------------------------------
// Duplicate-ID checks
// ---------------------------------------------------------------------------

describe("Curriculum schema: no duplicate IDs", () => {
  it("phase IDs are unique", () => {
    const ids = curriculum.phases.map((p) => p.id);
    expect(ids).toEqual([...new Set(ids)]);
  });

  it("course IDs are unique", () => {
    const ids = allCourses().map((c) => c.id);
    expect(ids).toEqual([...new Set(ids)]);
  });

  it("lesson IDs are unique", () => {
    const ids = allLessons().map((l) => l.id);
    expect(ids).toEqual([...new Set(ids)]);
  });

  it("exercise IDs are unique within each lesson", () => {
    for (const lesson of allLessons()) {
      const ids = lesson.exercises.map((e) => e.id);
      expect(ids, `duplicate exercise ID in ${lesson.id}`).toEqual([
        ...new Set(ids),
      ]);
    }
  });

  it("code exercise IDs are unique within each lesson", () => {
    for (const lesson of allLessons()) {
      const ids = (lesson.codeExercises ?? []).map((e) => e.id);
      expect(ids, `duplicate code-exercise ID in ${lesson.id}`).toEqual([
        ...new Set(ids),
      ]);
    }
  });

  it("lab template IDs are unique", () => {
    const ids = allLabTemplates.map((t) => t.id);
    expect(ids).toEqual([...new Set(ids)]);
  });
});

// ---------------------------------------------------------------------------
// Structural completeness
// ---------------------------------------------------------------------------

describe("Curriculum schema: structural completeness", () => {
  it("every phase has at least one course", () => {
    for (const phase of curriculum.phases) {
      expect(phase.courses.length, `${phase.id} has no courses`).toBeGreaterThan(0);
    }
  });

  it("every course has at least one lesson", () => {
    for (const course of allCourses()) {
      expect(course.lessons.length, `${course.id} has no lessons`).toBeGreaterThan(0);
    }
  });

  it("every lesson has at least one exercise", () => {
    for (const lesson of allLessons()) {
      expect(
        lesson.exercises.length,
        `${lesson.id} has no exercises`,
      ).toBeGreaterThan(0);
    }
  });

  it("every phase has competencyFocus", () => {
    for (const phase of curriculum.phases) {
      expect(
        phase.competencyFocus?.length,
        `${phase.id} missing competencyFocus`,
      ).toBeGreaterThan(0);
    }
  });

  it("every phase has an exitStandard with gates", () => {
    for (const phase of curriculum.phases) {
      expect(phase.exitStandard, `${phase.id} missing exitStandard`).toBeDefined();
      expect(
        phase.exitStandard!.gates.length,
        `${phase.id} exitStandard has no gates`,
      ).toBeGreaterThan(0);
    }
  });
});

// ---------------------------------------------------------------------------
// Cross-reference integrity
// ---------------------------------------------------------------------------

describe("Curriculum schema: cross-reference integrity", () => {
  const lessonIds = new Set(allLessons().map((l) => l.id));

  it("every lab template references a valid lesson", () => {
    for (const lab of allLabTemplates) {
      expect(
        lessonIds.has(lab.lessonId),
        `lab ${lab.id} references unknown lesson "${lab.lessonId}"`,
      ).toBe(true);
    }
  });

  it("every lesson has at least one lab template", () => {
    const coveredLessons = new Set(allLabTemplates.map((t) => t.lessonId));
    for (const lesson of allLessons()) {
      expect(
        coveredLessons.has(lesson.id),
        `${lesson.id} has no lab template`,
      ).toBe(true);
    }
  });

  it("exitStandard representativeLabs are non-empty", () => {
    for (const phase of curriculum.phases) {
      if (!phase.exitStandard) continue;
      expect(
        phase.exitStandard.representativeLabs.length,
        `${phase.id} exitStandard has no representativeLabs`,
      ).toBeGreaterThan(0);
      for (const entry of phase.exitStandard.representativeLabs) {
        expect(
          entry.trim().length,
          `${phase.id} has empty representativeLab entry`,
        ).toBeGreaterThan(0);
      }
    }
  });

  it("exitStandard gate competencies match phase competencyFocus", () => {
    for (const phase of curriculum.phases) {
      if (!phase.exitStandard || !phase.competencyFocus) continue;
      const focus = new Set(phase.competencyFocus);
      for (const gate of phase.exitStandard.gates) {
        expect(
          focus.has(gate.competency),
          `${phase.id} gate competency "${gate.competency}" not in competencyFocus`,
        ).toBe(true);
      }
    }
  });
});
