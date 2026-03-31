import { describe, expect, it } from "vitest";
import type { LabInstance, LabTemplate } from "./lab-engine";
import {
    buildLabCompletionSummary,
    createLabInstance,
    getDifficultyLabel,
    getLabHint,
    getMaxHintLevel,
    recordLabAttempt,
    resetLabInstance,
    validateLabInstance,
} from "./lab-engine";

// ---------------------------------------------------------------------------
// Fixtures
// ---------------------------------------------------------------------------

const baseTemplate: LabTemplate = {
  id: "lab-fs-nav",
  title: "Filesystem Navigation Lab",
  description: "Navigate to directories and create files.",
  difficulty: 1,
  scaffoldingLevel: "step-by-step",
  initialFiles: [
    { path: "projects/readme.txt", content: "Welcome to the lab." },
    { path: "projects/src/index.ts", content: 'console.log("hello");' },
  ],
  rules: [
    { kind: "file-presence", path: "projects/output.txt", shouldExist: true },
    {
      kind: "content-match",
      path: "projects/output.txt",
      pattern: "done",
    },
  ],
  hints: {
    0: [
      { level: 0, text: "Think about what file the task is asking you to create." },
      { level: 1, text: "Create a file called output.txt inside the projects folder." },
    ],
    1: [
      { level: 0, text: "The file needs specific content." },
      { level: 1, text: 'Write "done" inside output.txt.' },
    ],
  },
  maxResets: 3,
};

function instanceWithFile(
  base: LabInstance,
  path: string,
  content: string,
): LabInstance {
  return {
    ...base,
    files: [...base.files, { path, content }],
  };
}

// ---------------------------------------------------------------------------
// createLabInstance
// ---------------------------------------------------------------------------

describe("createLabInstance", () => {
  it("creates an active instance with initial files copied", () => {
    const instance = createLabInstance(baseTemplate);
    expect(instance.templateId).toBe("lab-fs-nav");
    expect(instance.status).toBe("active");
    expect(instance.files).toHaveLength(2);
    expect(instance.attemptCount).toBe(0);
    expect(instance.resetCount).toBe(0);
    expect(instance.startedAt).toBeTruthy();
    expect(instance.completedAt).toBeNull();
  });

  it("deep-copies initial files so mutations do not affect the template", () => {
    const instance = createLabInstance(baseTemplate);
    instance.files[0].content = "mutated";
    expect(baseTemplate.initialFiles[0].content).toBe("Welcome to the lab.");
  });
});

// ---------------------------------------------------------------------------
// resetLabInstance
// ---------------------------------------------------------------------------

describe("resetLabInstance", () => {
  it("restores files to initial state and increments reset count", () => {
    const instance = createLabInstance(baseTemplate);
    const modified = instanceWithFile(instance, "extra.txt", "x");
    const reset = resetLabInstance(modified, baseTemplate);

    expect(reset.files).toHaveLength(2);
    expect(reset.resetCount).toBe(1);
    expect(reset.status).toBe("active");
  });

  it("clears command outputs and code submissions on reset", () => {
    const instance = createLabInstance(baseTemplate);
    instance.commandOutputs["ls"] = "output";
    instance.codeSubmissions[0] = "const x = 1;";
    const reset = resetLabInstance(instance, baseTemplate);

    expect(reset.commandOutputs).toEqual({});
    expect(reset.codeSubmissions).toEqual({});
  });

  it("does not reset if max resets exceeded", () => {
    let instance = createLabInstance(baseTemplate);
    instance = resetLabInstance(instance, baseTemplate); // 1
    instance = resetLabInstance(instance, baseTemplate); // 2
    instance = resetLabInstance(instance, baseTemplate); // 3
    const blocked = resetLabInstance(instance, baseTemplate); // 4 — blocked
    expect(blocked.resetCount).toBe(3);
  });
});

// ---------------------------------------------------------------------------
// validateLabInstance — file-presence
// ---------------------------------------------------------------------------

describe("validateLabInstance — file-presence", () => {
  it("fails when required file is missing", () => {
    const instance = createLabInstance(baseTemplate);
    const result = validateLabInstance(baseTemplate, instance);
    expect(result.passed).toBe(false);
    expect(result.failedResults.length).toBeGreaterThanOrEqual(1);
    expect(result.failedResults[0].rule.kind).toBe("file-presence");
  });

  it("passes when required file is present and content matches", () => {
    const instance = instanceWithFile(
      createLabInstance(baseTemplate),
      "projects/output.txt",
      "task done",
    );
    const result = validateLabInstance(baseTemplate, instance);
    expect(result.passed).toBe(true);
    expect(result.failedResults).toHaveLength(0);
  });

  it("checks shouldExist: false", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [{ kind: "file-presence", path: "temp.txt", shouldExist: false }],
      hints: {},
    };
    const instance = createLabInstance(template);
    expect(validateLabInstance(template, instance).passed).toBe(true);

    const withFile = instanceWithFile(instance, "temp.txt", "x");
    expect(validateLabInstance(template, withFile).passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateLabInstance — directory-structure
// ---------------------------------------------------------------------------

describe("validateLabInstance — directory-structure", () => {
  it("passes when all required paths exist", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        {
          kind: "directory-structure",
          paths: ["projects/readme.txt", "projects/src/index.ts"],
          shouldExist: true,
        },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    expect(validateLabInstance(template, instance).passed).toBe(true);
  });

  it("fails when a required path is missing", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        {
          kind: "directory-structure",
          paths: ["projects/missing.txt"],
          shouldExist: true,
        },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    expect(validateLabInstance(template, instance).passed).toBe(false);
  });

  it("supports directory prefix matching", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        {
          kind: "directory-structure",
          paths: ["projects/src"],
          shouldExist: true,
        },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    expect(validateLabInstance(template, instance).passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateLabInstance — content-match
// ---------------------------------------------------------------------------

describe("validateLabInstance — content-match", () => {
  it("matches literal substring", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        { kind: "content-match", path: "projects/readme.txt", pattern: "Welcome" },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    expect(validateLabInstance(template, instance).passed).toBe(true);
  });

  it("matches regex pattern", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        {
          kind: "content-match",
          path: "projects/src/index.ts",
          pattern: "console\\.log\\(",
          isRegex: true,
        },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    expect(validateLabInstance(template, instance).passed).toBe(true);
  });

  it("fails when file does not exist", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        { kind: "content-match", path: "missing.txt", pattern: "x" },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    const result = validateLabInstance(template, instance);
    expect(result.passed).toBe(false);
    expect(result.failedResults[0].probableSkillGap).toBe("File Manipulation");
  });
});

// ---------------------------------------------------------------------------
// validateLabInstance — command-output
// ---------------------------------------------------------------------------

describe("validateLabInstance — command-output", () => {
  it("passes when output contains expected string", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        { kind: "command-output", command: "ls", expectedOutput: "readme.txt" },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    instance.commandOutputs["ls"] = "readme.txt  src/";
    expect(validateLabInstance(template, instance).passed).toBe(true);
  });

  it("fails when output is missing", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        { kind: "command-output", command: "ls", expectedOutput: "readme.txt" },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    expect(validateLabInstance(template, instance).passed).toBe(false);
  });

  it("supports regex matching on output", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        {
          kind: "command-output",
          command: "npm test",
          expectedOutput: "\\d+ passing",
          isRegex: true,
        },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    instance.commandOutputs["npm test"] = "5 passing (120ms)";
    expect(validateLabInstance(template, instance).passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateLabInstance — code-behavior
// ---------------------------------------------------------------------------

describe("validateLabInstance — code-behavior", () => {
  it("passes when required patterns present and no forbidden patterns", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        {
          kind: "code-behavior",
          requiredPatterns: ["function ", "return "],
          forbiddenPatterns: ["eval("],
        },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    instance.codeSubmissions[0] = "function add(a, b) { return a + b; }";
    expect(validateLabInstance(template, instance).passed).toBe(true);
  });

  it("fails when forbidden pattern is present", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        {
          kind: "code-behavior",
          requiredPatterns: ["function "],
          forbiddenPatterns: ["eval("],
        },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    instance.codeSubmissions[0] = "function run() { eval('x'); }";
    const result = validateLabInstance(template, instance);
    expect(result.passed).toBe(false);
    expect(result.failedResults[0].message).toContain("discouraged");
  });

  it("fails when required pattern is missing", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        { kind: "code-behavior", requiredPatterns: ["async "] },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    instance.codeSubmissions[0] = "function sync() {}";
    expect(validateLabInstance(template, instance).passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// validateLabInstance — code-behavior regression guards
// ---------------------------------------------------------------------------

describe("validateLabInstance — code-behavior regression", () => {
  it("multiple code-behavior rules at non-contiguous indices validate independently", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        { kind: "content-match", path: "projects/output.txt", pattern: "done" },
        { kind: "code-behavior", requiredPatterns: ["let x"] },
        { kind: "file-presence", path: "projects/readme.txt", shouldExist: true },
        { kind: "code-behavior", requiredPatterns: ["return"], forbiddenPatterns: ["var "] },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    // Satisfy file rules
    instance.files.push({ path: "projects/output.txt", content: "done" });

    // Submit code only for rule index 1 — rule 3 should still fail
    instance.codeSubmissions[1] = "let x = 1;";
    const r1 = validateLabInstance(template, instance);
    expect(r1.results[0].passed).toBe(true);  // content-match
    expect(r1.results[1].passed).toBe(true);  // code-behavior at idx 1
    expect(r1.results[2].passed).toBe(true);  // file-presence
    expect(r1.results[3].passed).toBe(false); // code-behavior at idx 3 — no submission
    expect(r1.passed).toBe(false);

    // Submit code for rule index 3 — all should pass
    instance.codeSubmissions[3] = "function f() { return 42; }";
    const r2 = validateLabInstance(template, instance);
    expect(r2.results[3].passed).toBe(true);
    expect(r2.passed).toBe(true);
  });

  it("empty requiredPatterns always passes unless forbidden pattern present", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        { kind: "code-behavior", requiredPatterns: [], forbiddenPatterns: ["eval("] },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);

    // No submission — requiredPatterns is empty so [].every() = true
    const r1 = validateLabInstance(template, instance);
    expect(r1.passed).toBe(true);

    // Submission with forbidden pattern — fails
    instance.codeSubmissions[0] = "eval('x')";
    const r2 = validateLabInstance(template, instance);
    expect(r2.passed).toBe(false);
    expect(r2.results[0].message).toContain("discouraged");
  });

  it("code-behavior submissions do not affect file-based rule evaluation", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        { kind: "content-match", path: "projects/readme.txt", pattern: "Welcome" },
        { kind: "code-behavior", requiredPatterns: ["function"] },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);

    // File rule passes from initial files, code-behavior fails
    const r1 = validateLabInstance(template, instance);
    expect(r1.results[0].passed).toBe(true);
    expect(r1.results[1].passed).toBe(false);

    // Adding code submission should not change file rule result
    instance.codeSubmissions[1] = "function hello() {}";
    const r2 = validateLabInstance(template, instance);
    expect(r2.results[0].passed).toBe(true);
    expect(r2.results[1].passed).toBe(true);
    expect(r2.passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// validateLabInstance — test-pass
// ---------------------------------------------------------------------------

describe("validateLabInstance — test-pass", () => {
  it("passes when enough tests pass and none fail", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        { kind: "test-pass", command: "npm test", minPassing: 3, maxFailing: 0 },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    instance.commandOutputs["npm test"] = "3 passing (80ms)";
    expect(validateLabInstance(template, instance).passed).toBe(true);
  });

  it("fails when not enough tests pass", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        { kind: "test-pass", command: "npm test", minPassing: 5, maxFailing: 0 },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    instance.commandOutputs["npm test"] = "2 passing (40ms)";
    const result = validateLabInstance(template, instance);
    expect(result.passed).toBe(false);
    expect(result.failedResults[0].message).toContain("at least 5");
  });

  it("fails when too many tests fail", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        { kind: "test-pass", command: "npm test", minPassing: 1, maxFailing: 0 },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    instance.commandOutputs["npm test"] = "3 passing\n1 failing";
    const result = validateLabInstance(template, instance);
    expect(result.passed).toBe(false);
    expect(result.failedResults[0].message).toContain("Too many failing");
  });

  it("tolerates failures within maxFailing threshold", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        { kind: "test-pass", command: "npm test", minPassing: 2, maxFailing: 1 },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    instance.commandOutputs["npm test"] = "3 passing\n1 failing";
    expect(validateLabInstance(template, instance).passed).toBe(true);
  });

  it("fails when no output is recorded", () => {
    const template: LabTemplate = {
      ...baseTemplate,
      rules: [
        { kind: "test-pass", command: "npm test", minPassing: 1, maxFailing: 0 },
      ],
      hints: {},
    };
    const instance = createLabInstance(template);
    const result = validateLabInstance(template, instance);
    expect(result.passed).toBe(false);
    expect(result.failedResults[0].probableSkillGap).toBe("Testing");
  });
});

// ---------------------------------------------------------------------------
// recordLabAttempt
// ---------------------------------------------------------------------------

describe("recordLabAttempt", () => {
  it("increments attempt count and keeps status active on failure", () => {
    const instance = createLabInstance(baseTemplate);
    const result = validateLabInstance(baseTemplate, instance);
    const updated = recordLabAttempt(instance, result);
    expect(updated.attemptCount).toBe(1);
    expect(updated.status).toBe("active");
    expect(updated.completedAt).toBeNull();
  });

  it("marks completed when validation passes", () => {
    const instance = instanceWithFile(
      createLabInstance(baseTemplate),
      "projects/output.txt",
      "task done",
    );
    const result = validateLabInstance(baseTemplate, instance);
    const updated = recordLabAttempt(instance, result);
    expect(updated.attemptCount).toBe(1);
    expect(updated.status).toBe("completed");
    expect(updated.completedAt).toBeTruthy();
  });
});

// ---------------------------------------------------------------------------
// getLabHint / getMaxHintLevel
// ---------------------------------------------------------------------------

describe("getLabHint", () => {
  it("returns level-0 hint for first request", () => {
    const hint = getLabHint(baseTemplate, 0, 0);
    expect(hint).toBe("Think about what file the task is asking you to create.");
  });

  it("returns level-1 hint on escalation", () => {
    const hint = getLabHint(baseTemplate, 0, 1);
    expect(hint).toBe("Create a file called output.txt inside the projects folder.");
  });

  it("caps at max level", () => {
    const hint = getLabHint(baseTemplate, 0, 99);
    expect(hint).toBe("Create a file called output.txt inside the projects folder.");
  });

  it("returns null for rule with no hints", () => {
    expect(getLabHint(baseTemplate, 5, 0)).toBeNull();
  });
});

describe("getMaxHintLevel", () => {
  it("returns highest level in layers", () => {
    expect(getMaxHintLevel(baseTemplate, 0)).toBe(1);
  });

  it("returns 0 for rule with no hints", () => {
    expect(getMaxHintLevel(baseTemplate, 5)).toBe(0);
  });
});

// ---------------------------------------------------------------------------
// getDifficultyLabel
// ---------------------------------------------------------------------------

describe("getDifficultyLabel", () => {
  it("returns label for each difficulty level", () => {
    expect(getDifficultyLabel(1)).toBe("Step-by-step execution");
    expect(getDifficultyLabel(2)).toBe("Goal-driven with hints");
    expect(getDifficultyLabel(3)).toBe("Problem statement with partial scaffolding");
    expect(getDifficultyLabel(4)).toBe("Ticket-style with minimal guidance");
  });
});

// ---------------------------------------------------------------------------
// buildLabCompletionSummary
// ---------------------------------------------------------------------------

describe("buildLabCompletionSummary", () => {
  it("includes lab metadata in the summary", () => {
    const instance = instanceWithFile(
      createLabInstance(baseTemplate),
      "projects/output.txt",
      "done",
    );
    const result = validateLabInstance(baseTemplate, instance);
    const completed = recordLabAttempt(instance, result);
    const summary = buildLabCompletionSummary(baseTemplate, completed);

    expect(summary).toContain("Filesystem Navigation Lab");
    expect(summary).toContain("Attempts: 1");
    expect(summary).toContain("Resets: 0");
    expect(summary).toContain("Status: completed");
    expect(summary).toContain("Completed:");
    expect(summary).toContain("projects/output.txt");
  });

  it("omits completed line when not yet completed", () => {
    const instance = createLabInstance(baseTemplate);
    const summary = buildLabCompletionSummary(baseTemplate, instance);
    expect(summary).not.toContain("Completed:");
    expect(summary).toContain("Status: active");
  });
});
