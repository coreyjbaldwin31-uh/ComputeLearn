/**
 * T1 integration tests — verify the contract between Phase 1 lab templates
 * (data layer) and the lab engine (logic layer) that the UI depends on.
 *
 * These tests protect the integration surface wired by training-platform.tsx:
 *   phase1LabsByLesson → createLabInstance → validateLabInstance →
 *   recordLabAttempt → getLabHint → resetLabInstance → buildLabCompletionSummary
 */

import {
    phase1LabsByLesson,
    phase1LabTemplates,
} from "@/data/lab-templates";
import {
    buildLabCompletionSummary,
    createLabInstance,
    getLabHint,
    recordLabAttempt,
    resetLabInstance,
    validateLabInstance,
} from "@/lib/lab-engine";
import { describe, expect, it } from "vitest";

// ---------------------------------------------------------------------------
// Lesson-to-lab mapping — the lookup used by training-platform
// ---------------------------------------------------------------------------

describe("T1 integration — lesson-to-lab mapping", () => {
  it("returns an array of templates for a lab-enabled lesson", () => {
    const templates = phase1LabsByLesson["lesson-filesystem"];
    expect(templates).toBeDefined();
    expect(templates.length).toBeGreaterThanOrEqual(1);
    expect(templates[0].id).toMatch(/^lab-/);
  });

  it("returns undefined for a non-lab lesson", () => {
    // lesson-code-reading is Phase 2 — no lab templates authored
    expect(phase1LabsByLesson["lesson-code-reading"]).toBeUndefined();
  });

  it("returns undefined for a completely unknown lesson ID", () => {
    expect(phase1LabsByLesson["lesson-does-not-exist"]).toBeUndefined();
  });

  it("first template in each lesson group matches the lessonId key", () => {
    for (const [lessonId, templates] of Object.entries(phase1LabsByLesson)) {
      expect(templates[0].lessonId, `${lessonId} mismatch`).toBe(lessonId);
    }
  });
});

// ---------------------------------------------------------------------------
// Instance creation from real Phase 1 templates
// ---------------------------------------------------------------------------

describe("T1 integration — instance creation from real templates", () => {
  it("creates an active instance whose file count matches the template", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);

    expect(instance.status).toBe("active");
    expect(instance.templateId).toBe(template.id);
    expect(instance.files).toHaveLength(template.initialFiles.length);
    expect(instance.attemptCount).toBe(0);
    expect(instance.resetCount).toBe(0);
    expect(instance.startedAt).toBeTruthy();
    expect(instance.completedAt).toBeNull();
  });

  it("deep-copies files so edits do not mutate the template", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);
    const originalContent = template.initialFiles[0].content;

    instance.files[0].content = "learner edit";
    expect(template.initialFiles[0].content).toBe(originalContent);
  });
});

// ---------------------------------------------------------------------------
// Validation on pristine instance — should always fail because learner
// has not yet done any work
// ---------------------------------------------------------------------------

describe("T1 integration — pristine validation fails", () => {
  it("validation fails on unmodified instance for every Phase 1 lab", () => {
    for (const template of phase1LabTemplates) {
      const instance = createLabInstance(template);
      const result = validateLabInstance(template, instance);

      expect(result.passed, `${template.id} should not pass pristine`).toBe(
        false,
      );
      expect(result.failedResults.length).toBeGreaterThan(0);
    }
  });

  it("each failed result includes a message", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);
    const result = validateLabInstance(template, instance);

    for (const r of result.failedResults) {
      expect(r.message.length, `rule ${r.ruleIndex} message`).toBeGreaterThan(
        0,
      );
    }
  });
});

// ---------------------------------------------------------------------------
// Record attempt — stays active after failed validation
// ---------------------------------------------------------------------------

describe("T1 integration — record attempt on failure", () => {
  it("increments attempt count and keeps status active", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);
    const result = validateLabInstance(template, instance);
    const updated = recordLabAttempt(instance, result);

    expect(updated.attemptCount).toBe(1);
    expect(updated.status).toBe("active");
    expect(updated.completedAt).toBeNull();
  });

  it("second attempt increments count to 2", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    let instance = createLabInstance(template);
    const r1 = validateLabInstance(template, instance);
    instance = recordLabAttempt(instance, r1);
    const r2 = validateLabInstance(template, instance);
    instance = recordLabAttempt(instance, r2);

    expect(instance.attemptCount).toBe(2);
    expect(instance.status).toBe("active");
  });
});

// ---------------------------------------------------------------------------
// Reset behavior with real templates
// ---------------------------------------------------------------------------

describe("T1 integration — reset restores initial state", () => {
  it("restores file content to template initial values after edit", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);
    instance.files[0].content = "learner modified this file";

    const reset = resetLabInstance(instance, template);

    expect(reset.files[0].content).toBe(template.initialFiles[0].content);
    expect(reset.files).toHaveLength(template.initialFiles.length);
    expect(reset.resetCount).toBe(1);
    expect(reset.status).toBe("active");
  });

  it("respects maxResets for difficulty-1 templates", () => {
    const template = phase1LabTemplates.find((t) => t.difficulty === 1)!;
    expect(template.maxResets).toBe(3);

    let instance = createLabInstance(template);
    instance = resetLabInstance(instance, template); // 1
    instance = resetLabInstance(instance, template); // 2
    instance = resetLabInstance(instance, template); // 3
    const blocked = resetLabInstance(instance, template); // 4 — blocked

    expect(blocked.resetCount).toBe(3);
  });

  it("allows unlimited resets for difficulty-2+ templates", () => {
    const template = phase1LabTemplates.find((t) => t.difficulty >= 2)!;
    expect(template.maxResets).toBe(0);

    let instance = createLabInstance(template);
    for (let i = 0; i < 10; i++) {
      instance = resetLabInstance(instance, template);
    }

    expect(instance.resetCount).toBe(10);
  });
});

// ---------------------------------------------------------------------------
// Hint availability and escalation with real templates
// ---------------------------------------------------------------------------

describe("T1 integration — hint availability and escalation", () => {
  it("every rule in every Phase 1 lab has a non-empty level-0 hint", () => {
    for (const template of phase1LabTemplates) {
      for (let i = 0; i < template.rules.length; i++) {
        const hint = getLabHint(template, i, 0);
        expect(
          hint,
          `${template.id} rule ${i} missing level-0 hint`,
        ).not.toBeNull();
        expect(hint!.length).toBeGreaterThan(0);
      }
    }
  });

  it("hint escalation returns different text at level 1 vs level 0", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const hint0 = getLabHint(template, 0, 0);
    const hint1 = getLabHint(template, 0, 1);

    expect(hint0).not.toBeNull();
    expect(hint1).not.toBeNull();
    expect(hint0).not.toBe(hint1);
  });

  it("hint beyond max level caps at highest available", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const hintMax = getLabHint(template, 0, 1);
    const hintBeyond = getLabHint(template, 0, 99);

    expect(hintBeyond).toBe(hintMax);
  });
});

// ---------------------------------------------------------------------------
// Completion summary — used by UI to render completed lab state
// ---------------------------------------------------------------------------

describe("T1 integration — completion summary", () => {
  it("produces a non-empty summary containing the template title", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);
    const completed = {
      ...instance,
      status: "completed" as const,
      attemptCount: 2,
      completedAt: "2026-01-15T12:00:00.000Z",
    };

    const summary = buildLabCompletionSummary(template, completed);

    expect(summary.length).toBeGreaterThan(0);
    expect(summary).toContain(template.title);
    expect(summary).toContain("Attempts: 2");
    expect(summary).toContain("completed");
    expect(summary).toContain("2026-01-15");
  });

  it("summary is null-safe when completedAt is null", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);

    const summary = buildLabCompletionSummary(template, instance);

    expect(summary).toContain(template.title);
    expect(summary).not.toContain("Completed:");
  });

  it("includes workspace file paths in summary", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);

    const summary = buildLabCompletionSummary(template, instance);

    expect(summary).toContain("Workspace files:");
    for (const f of template.initialFiles) {
      expect(summary).toContain(f.path);
    }
  });
});

// ---------------------------------------------------------------------------
// T2: command-output round-trip — terminal output captured → validation
// ---------------------------------------------------------------------------

describe("T2 integration — command-output validation with captured output", () => {
  it("command-output rule passes when matching output is recorded", () => {
    // The filesystem nav lab's first rule: command "Get-Location", expectedOutput "project"
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);

    // Simulate terminal capture: user ran Get-Location and output contains "project"
    instance.commandOutputs["Get-Location"] =
      "\nPath\n----\nC:\\Users\\learner\\project\n";

    const result = validateLabInstance(template, instance);
    const getLocationResult = result.results.find(
      (r) => r.rule.kind === "command-output",
    );

    expect(getLocationResult).toBeDefined();
    expect(getLocationResult!.passed).toBe(true);
    expect(getLocationResult!.message).toContain("Get-Location");
  });

  it("command-output rule fails when output does not contain expected string", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);

    // User ran Get-Location but is in the wrong directory
    instance.commandOutputs["Get-Location"] =
      "\nPath\n----\nC:\\Users\\learner\n";

    const result = validateLabInstance(template, instance);
    const getLocationResult = result.results.find(
      (r) => r.rule.kind === "command-output",
    );

    expect(getLocationResult).toBeDefined();
    expect(getLocationResult!.passed).toBe(false);
    expect(getLocationResult!.probableSkillGap).toBe("Terminal Operation");
  });

  it("command-output rule fails when no output is recorded", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);

    // No terminal commands executed — commandOutputs is empty
    const result = validateLabInstance(template, instance);
    const getLocationResult = result.results.find(
      (r) => r.rule.kind === "command-output",
    );

    expect(getLocationResult).toBeDefined();
    expect(getLocationResult!.passed).toBe(false);
  });

  it("recording output under first-token key also enables rule match", () => {
    // Simulates the training-platform handler storing under both full command
    // and first token. Rule says command: "Get-Location", user types "Get-Location".
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);

    const rawCommand = "Get-Location";
    const output = "\nPath\n----\nC:\\Users\\learner\\project\n";
    const firstToken = rawCommand.split(/\s+/)[0];

    // Store under both keys (mirrors handleTerminalCommand logic)
    instance.commandOutputs[rawCommand] = output;
    instance.commandOutputs[firstToken] = output;

    const result = validateLabInstance(template, instance);
    const getLocationResult = result.results.find(
      (r) => r.rule.kind === "command-output",
    );

    expect(getLocationResult!.passed).toBe(true);
  });
});

// ---------------------------------------------------------------------------
// T2: alias normalisation — canonical command names flow from terminal
// ---------------------------------------------------------------------------

describe("T2 integration — alias normalisation for command-output rules", () => {
  it("output stored under canonical name 'Get-Location' passes the rule even when user typed 'pwd'", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);

    // The terminal now resolves "pwd" → "Get-Location" via CANONICAL_COMMANDS,
    // so handleTerminalCommand stores under "Get-Location".
    instance.commandOutputs["Get-Location"] =
      "\nPath\n----\nC:\\Users\\learner\\project\n";

    const result = validateLabInstance(template, instance);
    const r = result.results.find((x) => x.rule.kind === "command-output");

    expect(r).toBeDefined();
    expect(r!.passed).toBe(true);
  });

  it("storing under alias-only key without canonical key fails the rule", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);

    // Before alias normalisation this was the bug — output stored under "pwd"
    // but the rule expects "Get-Location".
    instance.commandOutputs["pwd"] =
      "\nPath\n----\nC:\\Users\\learner\\project\n";

    const result = validateLabInstance(template, instance);
    const r = result.results.find((x) => x.rule.kind === "command-output");

    expect(r).toBeDefined();
    expect(r!.passed).toBe(false);
  });
});

// ---------------------------------------------------------------------------
// T2: labFileContents key format matches resolvePath normalisation
// ---------------------------------------------------------------------------

describe("T2 integration — labFileContents path key format", () => {
  it("lab file with nested path produces backslash-only Windows key", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    const instance = createLabInstance(template);

    // Mirror the labFileContents memo in training-platform
    const keys: Record<string, string> = {};
    for (const f of instance.files) {
      keys[`C:\\Users\\learner\\${f.path.replace(/\//g, "\\")}`] = f.content;
    }

    for (const key of Object.keys(keys)) {
      expect(key).not.toContain("/");
      expect(key).toMatch(/^C:\\Users\\learner\\/);
    }
  });

  it("key format matches what resolvePath + replace would produce", () => {
    // resolvePath("project/src/index.ts") from cwd "C:\\Users\\learner"
    // → "C:\\Users\\learner\\project/src/index.ts"
    // .replace(/\//g, "\\") → "C:\\Users\\learner\\project\\src\\index.ts"
    const cwd = "C:\\Users\\learner";
    const target = "project/src/index.ts";
    const resolved = `${cwd}\\${target}`.replace(/\//g, "\\");

    expect(resolved).toBe("C:\\Users\\learner\\project\\src\\index.ts");
    expect(resolved).not.toContain("/");
  });
});
// ---------------------------------------------------------------------------
// Smoke test: full manual flow — cd project → pwd → Validate
// Replicates the exact user journey through lab-filesystem-nav
// ---------------------------------------------------------------------------

describe("Smoke — lab-filesystem-nav: cd project, pwd, validate", () => {
  it("Get-Location rule passes after simulating cd project then pwd", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    expect(template.id).toBe("lab-filesystem-nav");

    // Step 1: Start the lab (training-platform calls createLabInstance)
    const instance = createLabInstance(template);
    expect(instance.status).toBe("active");

    // Step 2: User types "cd project" in terminal
    //  - terminal-simulator resolves: CANONICAL_COMMANDS["cd"] → "Set-Location"
    //  - cd succeeds silently (no output/error addEntry for successful cd)
    //  - onCommandExecuted is NOT called for cd because no addEntry("output",…)
    //    fires — cd only calls setCwd(target). This is correct behavior.

    // Step 3: User types "pwd" in terminal
    //  - terminal-simulator resolves: CANONICAL_COMMANDS["pwd"] → "Get-Location"
    //  - activeCommandRef.current = "Get-Location"
    //  - addEntry("output", "\nPath\n----\nC:\\Users\\learner\\project\n")
    //  - onCommandExecuted fires with ("Get-Location", "\nPath\n----\n…project\n")

    // Simulate what handleTerminalCommand does with the canonical command:
    const canonicalCommand = "Get-Location";  // CANONICAL_COMMANDS["pwd"]
    const pwdOutput = "\nPath\n----\nC:\\Users\\learner\\project\n";

    // handleTerminalCommand stores under both full command and first token
    const firstToken = canonicalCommand.split(/\s+/)[0];
    instance.commandOutputs[canonicalCommand] = pwdOutput;
    instance.commandOutputs[firstToken] = pwdOutput;

    // Step 4: User clicks Validate (training-platform calls validateLabInstance)
    const result = validateLabInstance(template, instance);

    // The command-output rule expects command: "Get-Location", expectedOutput: "project"
    const cmdRule = result.results.find((r) => r.rule.kind === "command-output");
    expect(cmdRule).toBeDefined();
    expect(cmdRule!.passed).toBe(true);
    expect(cmdRule!.message).toContain("Get-Location");

    // The other rules (directory-structure, file-presence) also pass on pristine
    // instance because those check initial files which are present from the start
    const dirRule = result.results.find(
      (r) => r.rule.kind === "directory-structure",
    );
    expect(dirRule).toBeDefined();
    expect(dirRule!.passed).toBe(true);

    const fileRule = result.results.find(
      (r) => r.rule.kind === "file-presence",
    );
    expect(fileRule).toBeDefined();
    expect(fileRule!.passed).toBe(true);

    // All 3 rules pass → overall validation passes
    expect(result.passed).toBe(true);
    expect(result.failedResults).toHaveLength(0);

    // Step 5: recordLabAttempt marks it completed
    const completed = recordLabAttempt(instance, result);
    expect(completed.status).toBe("completed");
    expect(completed.completedAt).not.toBeNull();
  });
});
