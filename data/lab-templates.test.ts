import {
  phase1LabTemplates,
  phase1LabsByLesson,
  phase2LabTemplates,
  phase2LabsByLesson,
  phase3LabTemplates,
  phase3LabsByLesson,
  phase4LabTemplates,
  phase4LabsByLesson,
} from "@/data/lab-templates";
import { createLabInstance } from "@/lib/lab-engine";
import { describe, expect, it } from "vitest";

const PHASE1_LESSON_IDS = [
  "lesson-filesystem",
  "lesson-keyboard-shortcuts",
  "lesson-system-inspection",
  "lesson-file-operations",
  "lesson-search-files",
  "lesson-terminal-automation",
  "lesson-piping-filtering",
  "lesson-powershell-scripting",
  "lesson-obsidian-vault",
] as const;

const VALID_RULE_KINDS = [
  "file-presence",
  "directory-structure",
  "content-match",
  "command-output",
  "code-behavior",
  "test-pass",
] as const;

describe("Phase 1 lab templates — structural integrity", () => {
  it("has exactly 10 lab templates", () => {
    expect(phase1LabTemplates).toHaveLength(10);
  });

  it("all IDs are unique", () => {
    const ids = phase1LabTemplates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs start with "lab-"', () => {
    for (const t of phase1LabTemplates) {
      expect(t.id).toMatch(/^lab-/);
    }
  });

  it("all have non-empty title and description", () => {
    for (const t of phase1LabTemplates) {
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
    }
  });
});

describe("Phase 1 lab templates — lesson mapping", () => {
  it("every Phase 1 lesson has at least one lab", () => {
    for (const lessonId of PHASE1_LESSON_IDS) {
      const labs = phase1LabTemplates.filter((t) => t.lessonId === lessonId);
      expect(labs.length, `${lessonId} should have at least 1 lab`).toBeGreaterThanOrEqual(1);
    }
  });

  it("lesson-powershell-scripting has exactly 2 labs", () => {
    const ps = phase1LabTemplates.filter(
      (t) => t.lessonId === "lesson-powershell-scripting",
    );
    expect(ps).toHaveLength(2);
  });

  it("phase1LabsByLesson has exactly 9 keys", () => {
    expect(Object.keys(phase1LabsByLesson)).toHaveLength(9);
  });

  it('every lessonId in templates starts with "lesson-"', () => {
    for (const t of phase1LabTemplates) {
      expect(t.lessonId).toMatch(/^lesson-/);
    }
  });
});

describe("Phase 1 lab templates — difficulty and scaffolding alignment", () => {
  it('difficulty 1 labs have scaffoldingLevel "step-by-step"', () => {
    for (const t of phase1LabTemplates.filter((t) => t.difficulty === 1)) {
      expect(t.scaffoldingLevel, `${t.id} scaffolding`).toBe("step-by-step");
    }
  });

  it('difficulty 2 labs have scaffoldingLevel "goal-driven"', () => {
    for (const t of phase1LabTemplates.filter((t) => t.difficulty === 2)) {
      expect(t.scaffoldingLevel, `${t.id} scaffolding`).toBe("goal-driven");
    }
  });

  it("difficulty 1 labs have maxResets 3", () => {
    for (const t of phase1LabTemplates.filter((t) => t.difficulty === 1)) {
      expect(t.maxResets, `${t.id} maxResets`).toBe(3);
    }
  });

  it("difficulty 2+ labs have maxResets 0", () => {
    for (const t of phase1LabTemplates.filter((t) => t.difficulty >= 2)) {
      expect(t.maxResets, `${t.id} maxResets`).toBe(0);
    }
  });
});

describe("Phase 1 lab templates — validation rules quality", () => {
  it("every lab has at least 3 rules", () => {
    for (const t of phase1LabTemplates) {
      expect(t.rules.length, `${t.id} rules count`).toBeGreaterThanOrEqual(3);
    }
  });

  it("every lab has at most 5 rules", () => {
    for (const t of phase1LabTemplates) {
      expect(t.rules.length, `${t.id} rules count`).toBeLessThanOrEqual(5);
    }
  });

  it("every lab's rules array is non-empty", () => {
    for (const t of phase1LabTemplates) {
      expect(t.rules.length, `${t.id}`).toBeGreaterThan(0);
    }
  });

  it("all rule kinds are valid", () => {
    for (const t of phase1LabTemplates) {
      for (const rule of t.rules) {
        expect(VALID_RULE_KINDS).toContain(rule.kind);
      }
    }
  });
});

describe("Phase 1 lab templates — hint coverage", () => {
  it("every lab has hints for every rule index", () => {
    for (const t of phase1LabTemplates) {
      for (let i = 0; i < t.rules.length; i++) {
        expect(t.hints[i], `${t.id} missing hint for rule index ${i}`).toBeDefined();
      }
    }
  });

  it("every hint array has at least 2 levels (level 0 and level 1)", () => {
    for (const t of phase1LabTemplates) {
      for (const [idx, layers] of Object.entries(t.hints)) {
        expect(
          layers.length,
          `${t.id} hint[${idx}] should have >= 2 levels`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("hint levels start at 0", () => {
    for (const t of phase1LabTemplates) {
      for (const [idx, layers] of Object.entries(t.hints)) {
        expect(layers[0].level, `${t.id} hint[${idx}] first level`).toBe(0);
      }
    }
  });
});

describe("Phase 1 lab templates — initial files", () => {
  it("every lab has at least 2 initial files", () => {
    for (const t of phase1LabTemplates) {
      expect(
        t.initialFiles.length,
        `${t.id} initial files count`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("all initial file paths are non-empty", () => {
    for (const t of phase1LabTemplates) {
      for (const f of t.initialFiles) {
        expect(f.path.length, `${t.id} file path`).toBeGreaterThan(0);
      }
    }
  });

  it("all initial file content is a string", () => {
    for (const t of phase1LabTemplates) {
      for (const f of t.initialFiles) {
        expect(typeof f.content, `${t.id} ${f.path} content type`).toBe("string");
      }
    }
  });

  it("non-placeholder files have non-empty content", () => {
    for (const t of phase1LabTemplates) {
      for (const f of t.initialFiles) {
        if (!f.path.endsWith(".gitkeep")) {
          expect(f.content.length, `${t.id} ${f.path} content`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("Phase 1 lab templates — lab engine integration", () => {
  it("each lab can be used with createLabInstance", () => {
    for (const t of phase1LabTemplates) {
      const instance = createLabInstance(t);
      expect(instance).toBeDefined();
    }
  });

  it('the resulting instance has status "active"', () => {
    for (const t of phase1LabTemplates) {
      const instance = createLabInstance(t);
      expect(instance.status).toBe("active");
    }
  });

  it("the resulting instance has the correct templateId", () => {
    for (const t of phase1LabTemplates) {
      const instance = createLabInstance(t);
      expect(instance.templateId).toBe(t.id);
    }
  });
});

// ===========================================================================
// Phase 2 Tests
// ===========================================================================

const PHASE2_LESSON_IDS = [
  "lesson-code-reading",
  "lesson-debugging",
  "lesson-project-structure",
  "lesson-package-management",
  "lesson-programming-logic",
  "lesson-typescript-types",
  "lesson-json-config",
  "lesson-error-reading",
  "lesson-vscode-debugger",
  "lesson-git-workflow",
  "lesson-branching",
  "lesson-git-merge-conflict",
  "lesson-http-basics",
  "lesson-postman-basics",
  "lesson-api-authentication",
] as const;

describe("Phase 2 lab templates — structural integrity", () => {
  it("has exactly 15 lab templates", () => {
    expect(phase2LabTemplates).toHaveLength(15);
  });

  it("all IDs are unique", () => {
    const ids = phase2LabTemplates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs start with "lab-"', () => {
    for (const t of phase2LabTemplates) {
      expect(t.id).toMatch(/^lab-/);
    }
  });

  it("all have non-empty title and description", () => {
    for (const t of phase2LabTemplates) {
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
    }
  });
});

describe("Phase 2 lab templates — lesson mapping", () => {
  it("every Phase 2 lesson has at least one lab", () => {
    for (const lessonId of PHASE2_LESSON_IDS) {
      const labs = phase2LabTemplates.filter((t) => t.lessonId === lessonId);
      expect(labs.length, `${lessonId} should have at least 1 lab`).toBeGreaterThanOrEqual(1);
    }
  });

  it("phase2LabsByLesson has exactly 15 keys", () => {
    expect(Object.keys(phase2LabsByLesson)).toHaveLength(15);
  });

  it('every lessonId in templates starts with "lesson-"', () => {
    for (const t of phase2LabTemplates) {
      expect(t.lessonId).toMatch(/^lesson-/);
    }
  });
});

describe("Phase 2 lab templates — difficulty and scaffolding alignment", () => {
  it("all labs are difficulty 2 or 3", () => {
    for (const t of phase2LabTemplates) {
      expect([2, 3]).toContain(t.difficulty);
    }
  });

  it('all labs have scaffoldingLevel "goal-driven"', () => {
    for (const t of phase2LabTemplates) {
      expect(t.scaffoldingLevel, `${t.id} scaffolding`).toBe("goal-driven");
    }
  });

  it("all labs have maxResets 0", () => {
    for (const t of phase2LabTemplates) {
      expect(t.maxResets, `${t.id} maxResets`).toBe(0);
    }
  });
});

describe("Phase 2 lab templates — validation rules quality", () => {
  it("every lab has at least 3 rules", () => {
    for (const t of phase2LabTemplates) {
      expect(t.rules.length, `${t.id} rules count`).toBeGreaterThanOrEqual(3);
    }
  });

  it("every lab has at most 5 rules", () => {
    for (const t of phase2LabTemplates) {
      expect(t.rules.length, `${t.id} rules count`).toBeLessThanOrEqual(5);
    }
  });

  it("all rule kinds are valid", () => {
    for (const t of phase2LabTemplates) {
      for (const rule of t.rules) {
        expect(VALID_RULE_KINDS).toContain(rule.kind);
      }
    }
  });
});

describe("Phase 2 lab templates — hint coverage", () => {
  it("every lab has hints for every rule index", () => {
    for (const t of phase2LabTemplates) {
      for (let i = 0; i < t.rules.length; i++) {
        expect(t.hints[i], `${t.id} missing hint for rule index ${i}`).toBeDefined();
      }
    }
  });

  it("every hint array has at least 2 levels (level 0 and level 1)", () => {
    for (const t of phase2LabTemplates) {
      for (const [idx, layers] of Object.entries(t.hints)) {
        expect(
          layers.length,
          `${t.id} hint[${idx}] should have >= 2 levels`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("hint levels start at 0", () => {
    for (const t of phase2LabTemplates) {
      for (const [idx, layers] of Object.entries(t.hints)) {
        expect(layers[0].level, `${t.id} hint[${idx}] first level`).toBe(0);
      }
    }
  });
});

describe("Phase 2 lab templates — initial files", () => {
  it("every lab has at least 2 initial files", () => {
    for (const t of phase2LabTemplates) {
      expect(
        t.initialFiles.length,
        `${t.id} initial files count`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("all initial file paths are non-empty", () => {
    for (const t of phase2LabTemplates) {
      for (const f of t.initialFiles) {
        expect(f.path.length, `${t.id} file path`).toBeGreaterThan(0);
      }
    }
  });

  it("all initial file content is a string", () => {
    for (const t of phase2LabTemplates) {
      for (const f of t.initialFiles) {
        expect(typeof f.content, `${t.id} ${f.path} content type`).toBe("string");
      }
    }
  });

  it("non-placeholder files have non-empty content", () => {
    for (const t of phase2LabTemplates) {
      for (const f of t.initialFiles) {
        if (!f.path.endsWith(".gitkeep")) {
          expect(f.content.length, `${t.id} ${f.path} content`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("Phase 2 lab templates — lab engine integration", () => {
  it("each lab can be used with createLabInstance", () => {
    for (const t of phase2LabTemplates) {
      const instance = createLabInstance(t);
      expect(instance).toBeDefined();
    }
  });

  it('the resulting instance has status "active"', () => {
    for (const t of phase2LabTemplates) {
      const instance = createLabInstance(t);
      expect(instance.status).toBe("active");
    }
  });

  it("the resulting instance has the correct templateId", () => {
    for (const t of phase2LabTemplates) {
      const instance = createLabInstance(t);
      expect(instance.templateId).toBe(t.id);
    }
  });
});

// ===========================================================================
// Phase 3 Tests
// ===========================================================================

const PHASE3_LESSON_IDS = [
  "lesson-docker-basics",
  "lesson-dockerfile",
  "lesson-ai-prompting",
  "lesson-ai-verification",
  "lesson-git-workflow-advanced",
  "lesson-automated-testing",
  "lesson-ci-cd",
  "lesson-refactoring",
  "lesson-technical-documentation",
] as const;

describe("Phase 3 lab templates — structural integrity", () => {
  it("has exactly 9 lab templates", () => {
    expect(phase3LabTemplates).toHaveLength(9);
  });

  it("all IDs are unique", () => {
    const ids = phase3LabTemplates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs start with "lab-"', () => {
    for (const t of phase3LabTemplates) {
      expect(t.id).toMatch(/^lab-/);
    }
  });

  it("all have non-empty title and description", () => {
    for (const t of phase3LabTemplates) {
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
    }
  });
});

describe("Phase 3 lab templates — lesson mapping", () => {
  it("every Phase 3 lesson has at least one lab", () => {
    for (const lessonId of PHASE3_LESSON_IDS) {
      const labs = phase3LabTemplates.filter((t) => t.lessonId === lessonId);
      expect(labs.length, `${lessonId} should have at least 1 lab`).toBeGreaterThanOrEqual(1);
    }
  });

  it("phase3LabsByLesson has exactly 9 keys", () => {
    expect(Object.keys(phase3LabsByLesson)).toHaveLength(9);
  });

  it('every lessonId in templates starts with "lesson-"', () => {
    for (const t of phase3LabTemplates) {
      expect(t.lessonId).toMatch(/^lesson-/);
    }
  });
});

describe("Phase 3 lab templates — difficulty and scaffolding alignment", () => {
  it("all labs are difficulty 3", () => {
    for (const t of phase3LabTemplates) {
      expect(t.difficulty, `${t.id} difficulty`).toBe(3);
    }
  });

  it('all labs have scaffoldingLevel "goal-driven"', () => {
    for (const t of phase3LabTemplates) {
      expect(t.scaffoldingLevel, `${t.id} scaffolding`).toBe("goal-driven");
    }
  });

  it("all labs have maxResets 0", () => {
    for (const t of phase3LabTemplates) {
      expect(t.maxResets, `${t.id} maxResets`).toBe(0);
    }
  });
});

describe("Phase 3 lab templates — validation rules quality", () => {
  it("every lab has at least 3 rules", () => {
    for (const t of phase3LabTemplates) {
      expect(t.rules.length, `${t.id} rules count`).toBeGreaterThanOrEqual(3);
    }
  });

  it("every lab has at most 5 rules", () => {
    for (const t of phase3LabTemplates) {
      expect(t.rules.length, `${t.id} rules count`).toBeLessThanOrEqual(5);
    }
  });

  it("all rule kinds are valid", () => {
    for (const t of phase3LabTemplates) {
      for (const rule of t.rules) {
        expect(VALID_RULE_KINDS).toContain(rule.kind);
      }
    }
  });
});

describe("Phase 3 lab templates — hint coverage", () => {
  it("every lab has hints for every rule index", () => {
    for (const t of phase3LabTemplates) {
      for (let i = 0; i < t.rules.length; i++) {
        expect(t.hints[i], `${t.id} missing hint for rule index ${i}`).toBeDefined();
      }
    }
  });

  it("every hint array has at least 2 levels (level 0 and level 1)", () => {
    for (const t of phase3LabTemplates) {
      for (const [idx, layers] of Object.entries(t.hints)) {
        expect(
          layers.length,
          `${t.id} hint[${idx}] should have >= 2 levels`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("hint levels start at 0", () => {
    for (const t of phase3LabTemplates) {
      for (const [idx, layers] of Object.entries(t.hints)) {
        expect(layers[0].level, `${t.id} hint[${idx}] first level`).toBe(0);
      }
    }
  });
});

describe("Phase 3 lab templates — initial files", () => {
  it("every lab has at least 2 initial files", () => {
    for (const t of phase3LabTemplates) {
      expect(
        t.initialFiles.length,
        `${t.id} initial files count`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("all initial file paths are non-empty", () => {
    for (const t of phase3LabTemplates) {
      for (const f of t.initialFiles) {
        expect(f.path.length, `${t.id} file path`).toBeGreaterThan(0);
      }
    }
  });

  it("all initial file content is a string", () => {
    for (const t of phase3LabTemplates) {
      for (const f of t.initialFiles) {
        expect(typeof f.content, `${t.id} ${f.path} content type`).toBe("string");
      }
    }
  });

  it("non-placeholder files have non-empty content", () => {
    for (const t of phase3LabTemplates) {
      for (const f of t.initialFiles) {
        if (!f.path.endsWith(".gitkeep")) {
          expect(f.content.length, `${t.id} ${f.path} content`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("Phase 3 lab templates — lab engine integration", () => {
  it("each lab can be used with createLabInstance", () => {
    for (const t of phase3LabTemplates) {
      const instance = createLabInstance(t);
      expect(instance).toBeDefined();
    }
  });

  it('the resulting instance has status "active"', () => {
    for (const t of phase3LabTemplates) {
      const instance = createLabInstance(t);
      expect(instance.status).toBe("active");
    }
  });

  it("the resulting instance has the correct templateId", () => {
    for (const t of phase3LabTemplates) {
      const instance = createLabInstance(t);
      expect(instance.templateId).toBe(t.id);
    }
  });
});

// ===========================================================================
// Phase 4 Tests
// ===========================================================================

const PHASE4_LESSON_IDS = [
  "lesson-cli-build",
  "lesson-crud-app",
  "lesson-debugging-case-study",
  "lesson-portfolio-capstone",
] as const;

describe("Phase 4 lab templates — structural integrity", () => {
  it("has exactly 4 lab templates", () => {
    expect(phase4LabTemplates).toHaveLength(4);
  });

  it("all IDs are unique", () => {
    const ids = phase4LabTemplates.map((t) => t.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it('all IDs start with "lab-"', () => {
    for (const t of phase4LabTemplates) {
      expect(t.id).toMatch(/^lab-/);
    }
  });

  it("all have non-empty title and description", () => {
    for (const t of phase4LabTemplates) {
      expect(t.title.length).toBeGreaterThan(0);
      expect(t.description.length).toBeGreaterThan(0);
    }
  });
});

describe("Phase 4 lab templates — lesson mapping", () => {
  it("every Phase 4 lesson has at least one lab", () => {
    for (const lessonId of PHASE4_LESSON_IDS) {
      const labs = phase4LabTemplates.filter((t) => t.lessonId === lessonId);
      expect(labs.length, `${lessonId} should have at least 1 lab`).toBeGreaterThanOrEqual(1);
    }
  });

  it("phase4LabsByLesson has exactly 4 keys", () => {
    expect(Object.keys(phase4LabsByLesson)).toHaveLength(4);
  });

  it('every lessonId in templates starts with "lesson-"', () => {
    for (const t of phase4LabTemplates) {
      expect(t.lessonId).toMatch(/^lesson-/);
    }
  });
});

describe("Phase 4 lab templates — difficulty and scaffolding alignment", () => {
  it("all labs are difficulty 4", () => {
    for (const t of phase4LabTemplates) {
      expect(t.difficulty, `${t.id} difficulty`).toBe(4);
    }
  });

  it('all labs have scaffoldingLevel "ticket-style"', () => {
    for (const t of phase4LabTemplates) {
      expect(t.scaffoldingLevel, `${t.id} scaffolding`).toBe("ticket-style");
    }
  });

  it("all labs have maxResets 0", () => {
    for (const t of phase4LabTemplates) {
      expect(t.maxResets, `${t.id} maxResets`).toBe(0);
    }
  });
});

describe("Phase 4 lab templates — validation rules quality", () => {
  it("every lab has at least 3 rules", () => {
    for (const t of phase4LabTemplates) {
      expect(t.rules.length, `${t.id} rules count`).toBeGreaterThanOrEqual(3);
    }
  });

  it("every lab has at most 5 rules", () => {
    for (const t of phase4LabTemplates) {
      expect(t.rules.length, `${t.id} rules count`).toBeLessThanOrEqual(5);
    }
  });

  it("all rule kinds are valid", () => {
    for (const t of phase4LabTemplates) {
      for (const rule of t.rules) {
        expect(VALID_RULE_KINDS).toContain(rule.kind);
      }
    }
  });
});

describe("Phase 4 lab templates — hint coverage", () => {
  it("every lab has hints for every rule index", () => {
    for (const t of phase4LabTemplates) {
      for (let i = 0; i < t.rules.length; i++) {
        expect(t.hints[i], `${t.id} missing hint for rule index ${i}`).toBeDefined();
      }
    }
  });

  it("every hint array has at least 2 levels (level 0 and level 1)", () => {
    for (const t of phase4LabTemplates) {
      for (const [idx, layers] of Object.entries(t.hints)) {
        expect(
          layers.length,
          `${t.id} hint[${idx}] should have >= 2 levels`,
        ).toBeGreaterThanOrEqual(2);
      }
    }
  });

  it("hint levels start at 0", () => {
    for (const t of phase4LabTemplates) {
      for (const [idx, layers] of Object.entries(t.hints)) {
        expect(layers[0].level, `${t.id} hint[${idx}] first level`).toBe(0);
      }
    }
  });
});

describe("Phase 4 lab templates — initial files", () => {
  it("every lab has at least 2 initial files", () => {
    for (const t of phase4LabTemplates) {
      expect(
        t.initialFiles.length,
        `${t.id} initial files count`,
      ).toBeGreaterThanOrEqual(2);
    }
  });

  it("all initial file paths are non-empty", () => {
    for (const t of phase4LabTemplates) {
      for (const f of t.initialFiles) {
        expect(f.path.length, `${t.id} file path`).toBeGreaterThan(0);
      }
    }
  });

  it("all initial file content is a string", () => {
    for (const t of phase4LabTemplates) {
      for (const f of t.initialFiles) {
        expect(typeof f.content, `${t.id} ${f.path} content type`).toBe("string");
      }
    }
  });

  it("non-placeholder files have non-empty content", () => {
    for (const t of phase4LabTemplates) {
      for (const f of t.initialFiles) {
        if (!f.path.endsWith(".gitkeep")) {
          expect(f.content.length, `${t.id} ${f.path} content`).toBeGreaterThan(0);
        }
      }
    }
  });
});

describe("Phase 4 lab templates — lab engine integration", () => {
  it("each lab can be used with createLabInstance", () => {
    for (const t of phase4LabTemplates) {
      const instance = createLabInstance(t);
      expect(instance).toBeDefined();
    }
  });

  it('the resulting instance has status "active"', () => {
    for (const t of phase4LabTemplates) {
      const instance = createLabInstance(t);
      expect(instance.status).toBe("active");
    }
  });

  it("the resulting instance has the correct templateId", () => {
    for (const t of phase4LabTemplates) {
      const instance = createLabInstance(t);
      expect(instance.templateId).toBe(t.id);
    }
  });
});
