/**
 * Integration tests — verify the contract between lab templates
 * (data layer) and the lab engine (logic layer) that the UI depends on.
 *
 * These tests protect the integration surface wired by training-platform.tsx:
 *   phase1/phase2LabsByLesson → createLabInstance → validateLabInstance →
 *   recordLabAttempt → getLabHint → resetLabInstance → buildLabCompletionSummary
 */

import {
    phase1LabsByLesson,
    phase1LabTemplates,
    phase2LabsByLesson,
    phase2LabTemplates,
} from "@/data/lab-templates";
import {
    type LabTemplate,
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

// ---------------------------------------------------------------------------
// T3: End-to-end lab smoke tests
// ---------------------------------------------------------------------------

describe("T3 — End-to-end lab smoke tests", () => {
  // -------------------------------------------------------------------------
  // Test 1: File editing → content-match validation round-trip
  // -------------------------------------------------------------------------
  it("content-match rules flip from fail to pass after editing the file (lab-keyboard-shortcuts)", () => {
    const template = phase1LabsByLesson["lesson-keyboard-shortcuts"][0];
    expect(template.id).toBe("lab-keyboard-shortcuts");

    // 1. Create instance
    const instance = createLabInstance(template);

    // 2. Validate pristine — should fail (content-match rule 0 not met)
    const pristineResult = validateLabInstance(template, instance);
    expect(pristineResult.passed).toBe(false);

    // Rule 0: content-match for Ctrl|Alt|Shift — fails on pristine
    const rule0Pristine = pristineResult.results[0];
    expect(rule0Pristine.passed).toBe(false);
    expect(rule0Pristine.rule.kind).toBe("content-match");

    // Rules 1 and 2 already pass on pristine (table rows exist, file exists)
    expect(pristineResult.results[1].passed).toBe(true);
    expect(pristineResult.results[2].passed).toBe(true);

    // 3. Edit shortcut-log.md to satisfy the content-match rules
    const logFile = instance.files.find(
      (f) => f.path === "workspace/shortcut-log.md",
    )!;
    logFile.content +=
      "| Open file | Ctrl+O |\n| Save file | Ctrl+S |\n| Find | Ctrl+F |\n";

    // 4. Validate again — all rules should now pass
    const afterEditResult = validateLabInstance(template, instance);
    expect(afterEditResult.passed).toBe(true);

    // 5. Assert rule 0 specifically flipped from fail to pass
    const rule0After = afterEditResult.results[0];
    expect(rule0After.passed).toBe(true);
    expect(rule0After.rule.kind).toBe("content-match");
  });

  // -------------------------------------------------------------------------
  // Test 2: Multi-attempt progression (fail → modify → fail → modify → pass)
  // -------------------------------------------------------------------------
  it("progressive improvement across three attempts (lab-file-ops-safe-delete)", () => {
    const template = phase1LabsByLesson["lesson-file-operations"][0];
    expect(template.id).toBe("lab-file-ops-safe-delete");

    // 1. Create instance
    let instance = createLabInstance(template);

    // --- Attempt 1: pristine → all file-manipulation rules fail ---
    const r1 = validateLabInstance(template, instance);
    expect(r1.passed).toBe(false);
    // Rules: 0=dir-structure(backup), 1=file-presence(backup/draft), 2=file-presence(!draft), 3=file-presence(keep-this)
    // Pristine: backup dir missing (fail), backup/draft missing (fail), draft still exists (fail), keep-this exists (pass)
    expect(r1.results[0].passed).toBe(false); // backup dir missing
    expect(r1.results[1].passed).toBe(false); // backup/draft-report.txt missing
    expect(r1.results[2].passed).toBe(false); // sandbox/draft-report.txt should NOT exist
    expect(r1.results[3].passed).toBe(true);  // keep-this.md exists
    const failedCountR1 = r1.failedResults.length;
    expect(failedCountR1).toBe(3);

    instance = recordLabAttempt(instance, r1);
    expect(instance.attemptCount).toBe(1);
    expect(instance.status).toBe("active");

    // --- Attempt 2: partial fix — copy draft to backup (but original still exists) ---
    const draftContent = instance.files.find(
      (f) => f.path === "sandbox/draft-report.txt",
    )!.content;
    instance.files.push({
      path: "sandbox/backup/draft-report.txt",
      content: draftContent,
    });

    const r2 = validateLabInstance(template, instance);
    expect(r2.passed).toBe(false);
    // Now backup dir exists (pass), backup/draft exists (pass), but original draft still there (fail)
    expect(r2.results[0].passed).toBe(true);  // backup dir exists
    expect(r2.results[1].passed).toBe(true);  // backup/draft-report.txt exists
    expect(r2.results[2].passed).toBe(false); // sandbox/draft-report.txt still there
    expect(r2.results[3].passed).toBe(true);  // keep-this.md untouched
    const failedCountR2 = r2.failedResults.length;
    expect(failedCountR2).toBe(1);
    // Progressive improvement: fewer failures than attempt 1
    expect(failedCountR2).toBeLessThan(failedCountR1);

    instance = recordLabAttempt(instance, r2);
    expect(instance.attemptCount).toBe(2);
    expect(instance.status).toBe("active");

    // --- Attempt 3: remove original draft → all rules pass ---
    instance.files = instance.files.filter(
      (f) => f.path !== "sandbox/draft-report.txt",
    );

    const r3 = validateLabInstance(template, instance);
    expect(r3.passed).toBe(true);
    expect(r3.failedResults).toHaveLength(0);

    instance = recordLabAttempt(instance, r3);
    expect(instance.attemptCount).toBe(3);
    expect(instance.status).toBe("completed");
    expect(instance.completedAt).not.toBeNull();
  });

  // -------------------------------------------------------------------------
  // Test 3: Full lifecycle (create → edit → fail → hint → reset → edit → pass → completion)
  // -------------------------------------------------------------------------
  it("full lifecycle with hint and reset (lab-filesystem-nav)", () => {
    const template = phase1LabsByLesson["lesson-filesystem"][0];
    expect(template.id).toBe("lab-filesystem-nav");

    // 1. Create instance
    let instance = createLabInstance(template);
    expect(instance.status).toBe("active");

    // 2. Make a wrong edit: delete the required settings.json file
    instance.files = instance.files.filter(
      (f) => f.path !== "project/.config/settings.json",
    );

    // 3. Validate → fails (no command output + file deleted)
    const failResult = validateLabInstance(template, instance);
    expect(failResult.passed).toBe(false);

    // Rule 0 (command-output) fails — no output recorded
    const cmdRule = failResult.results.find(
      (r) => r.rule.kind === "command-output",
    );
    expect(cmdRule!.passed).toBe(false);

    // Rule 2 (file-presence) fails — settings.json deleted
    const fileRule = failResult.results.find(
      (r) => r.rule.kind === "file-presence",
    );
    expect(fileRule!.passed).toBe(false);

    instance = recordLabAttempt(instance, failResult);
    expect(instance.attemptCount).toBe(1);
    expect(instance.status).toBe("active");

    // 4. Request hint for the file-presence rule (index 2)
    const hint = getLabHint(template, 2, 0);
    expect(hint).not.toBeNull();
    expect(hint!.length).toBeGreaterThan(0);
    expect(hint).toContain("dot");

    // 5. Reset the instance → files restored, commandOutputs cleared
    instance = resetLabInstance(instance, template);
    expect(instance.resetCount).toBe(1);
    expect(instance.files).toHaveLength(template.initialFiles.length);
    expect(instance.commandOutputs).toEqual({});
    // Verify settings.json is restored
    const settingsFile = instance.files.find(
      (f) => f.path === "project/.config/settings.json",
    );
    expect(settingsFile).toBeDefined();

    // 6. Supply correct command output
    instance.commandOutputs["Get-Location"] =
      "\nPath\n----\nC:\\Users\\learner\\project\n";

    // 7. Validate → all rules pass
    const passResult = validateLabInstance(template, instance);
    expect(passResult.passed).toBe(true);
    expect(passResult.failedResults).toHaveLength(0);

    instance = recordLabAttempt(instance, passResult);
    expect(instance.status).toBe("completed");
    expect(instance.completedAt).not.toBeNull();

    // 8. Build completion summary → assert it has correct data
    const summary = buildLabCompletionSummary(template, instance);
    expect(summary).toContain(template.title);
    expect(summary).toContain("Attempts: 2");
    expect(summary).toContain("completed");
    expect(summary).toContain("Resets: 1");
  });

  // -------------------------------------------------------------------------
  // Test 4: File editing does not affect other files
  // -------------------------------------------------------------------------
  it("editing one file does not mutate other files (lab-keyboard-shortcuts)", () => {
    const template = phase1LabsByLesson["lesson-keyboard-shortcuts"][0];
    const instance = createLabInstance(template);

    // Snapshot the original content of all files
    const originals = new Map(
      instance.files.map((f) => [f.path, f.content]),
    );

    // Edit only shortcut-log.md
    const targetPath = "workspace/shortcut-log.md";
    const targetFile = instance.files.find((f) => f.path === targetPath)!;
    targetFile.content += "| Toggle sidebar | Ctrl+B |\n";

    // Assert the edited file actually changed
    expect(targetFile.content).not.toBe(originals.get(targetPath));

    // Assert every other file remains identical
    for (const file of instance.files) {
      if (file.path !== targetPath) {
        expect(file.content, `${file.path} should be unchanged`).toBe(
          originals.get(file.path),
        );
      }
    }
  });
});

// ---------------------------------------------------------------------------
// Code-behavior validation round-trip
// ---------------------------------------------------------------------------

describe("Code-behavior validation — engine round-trip", () => {
  it("code-behavior rule fails when no submission, passes when patterns match", () => {
    // Build a minimal template with a code-behavior rule
    const template = {
      id: "lab-code-behavior-test",
      title: "Code Behavior Test",
      description: "Verify code-behavior rule round-trip",
      difficulty: 2 as const,
      scaffoldingLevel: "goal-driven" as const,
      initialFiles: [{ path: "main.ts", content: "// starter" }],
      rules: [
        {
          kind: "code-behavior" as const,
          requiredPatterns: ["function greet", "return"],
          forbiddenPatterns: ["eval("],
        },
      ],
      hints: { 0: [{ level: 0, text: "Write a function called greet that returns a string." }] },
      maxResets: 3,
    };

    // 1. Create instance — codeSubmissions starts empty
    const instance = createLabInstance(template);
    expect(instance.codeSubmissions).toEqual({});

    // 2. Validate with no submission — rule fails
    const r1 = validateLabInstance(template, instance);
    expect(r1.passed).toBe(false);
    expect(r1.results[0].passed).toBe(false);
    expect(r1.results[0].message).toContain("missing required patterns");

    // 3. Submit code missing one required pattern — still fails
    instance.codeSubmissions[0] = "function greet(name: string) { console.log(name); }";
    const r2 = validateLabInstance(template, instance);
    expect(r2.passed).toBe(false);
    expect(r2.results[0].passed).toBe(false);

    // 4. Submit code with a forbidden pattern — still fails
    instance.codeSubmissions[0] = "function greet() { return eval('hi'); }";
    const r3 = validateLabInstance(template, instance);
    expect(r3.passed).toBe(false);
    expect(r3.results[0].passed).toBe(false);
    expect(r3.results[0].message).toContain("discouraged pattern");

    // 5. Submit correct code — passes
    instance.codeSubmissions[0] = "function greet(name: string) { return `Hello, ${name}!`; }";
    const r4 = validateLabInstance(template, instance);
    expect(r4.passed).toBe(true);
    expect(r4.results[0].passed).toBe(true);

    // 6. Record attempt → completed
    const completed = recordLabAttempt(instance, r4);
    expect(completed.status).toBe("completed");
  });

  it("reset clears codeSubmissions", () => {
    const template = {
      id: "lab-code-behavior-reset",
      title: "Code Behavior Reset Test",
      description: "Verify reset clears code submissions",
      difficulty: 1 as const,
      scaffoldingLevel: "step-by-step" as const,
      initialFiles: [],
      rules: [
        {
          kind: "code-behavior" as const,
          requiredPatterns: ["let x"],
        },
      ],
      hints: {},
      maxResets: 0,
    };

    const instance = createLabInstance(template);
    instance.codeSubmissions[0] = "let x = 42;";
    expect(instance.codeSubmissions[0]).toBe("let x = 42;");

    const reset = resetLabInstance(instance, template);
    expect(reset.codeSubmissions).toEqual({});
  });
});

// ---------------------------------------------------------------------------
// Phase 2 lab template integration
// ---------------------------------------------------------------------------

describe("Phase 2 lab template integration", () => {
  it("every Phase 2 template can create a lab instance", () => {
    for (const template of phase2LabTemplates) {
      const instance = createLabInstance(template);
      expect(instance.status).toBe("active");
      expect(instance.templateId).toBe(template.id);
      expect(instance.files).toHaveLength(template.initialFiles.length);
    }
  });

  it("phase2LabsByLesson covers all 15 Phase 2 lessons", () => {
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
    for (const lessonId of PHASE2_LESSON_IDS) {
      expect(
        phase2LabsByLesson[lessonId],
        `${lessonId} should have labs`,
      ).toBeDefined();
      expect(phase2LabsByLesson[lessonId].length).toBeGreaterThanOrEqual(1);
    }
  });

  it("validation fails on a fresh Phase 2 instance (no work done yet)", () => {
    const template = phase2LabTemplates[0];
    const instance = createLabInstance(template);
    const result = validateLabInstance(template, instance);
    expect(result.passed).toBe(false);
    expect(result.failedResults.length).toBeGreaterThan(0);
  });

  it("hints are available for every rule in every Phase 2 template", () => {
    for (const template of phase2LabTemplates) {
      for (let i = 0; i < template.rules.length; i++) {
        const hint = getLabHint(template, i, 0);
        expect(hint, `${template.id} rule ${i} missing hint`).not.toBeNull();
      }
    }
  });
});

// ---------------------------------------------------------------------------
// test-pass validation — engine round-trip
// ---------------------------------------------------------------------------

describe("test-pass validation — engine round-trip", () => {
  it("passes when command output contains enough passing tests", () => {
    const template: LabTemplate = {
      id: "test-pass-roundtrip",
      title: "Test pass round-trip",
      description: "Verify test-pass rule evaluation",
      difficulty: 2,
      scaffoldingLevel: "goal-driven",
      initialFiles: [{ path: "src/index.ts", content: "export {};\n" }],
      rules: [
        {
          kind: "test-pass",
          command: "npm test",
          minPassing: 3,
          maxFailing: 1,
        },
      ],
      hints: { 0: [{ level: 0, text: "Run tests" }, { level: 1, text: "npm test" }] },
      maxResets: 0,
    };

    const instance = createLabInstance(template);
    // Simulate pasting test output
    instance.commandOutputs["npm test"] = "  3 passing\n  0 failing\n";

    const result = validateLabInstance(template, instance);
    expect(result.passed).toBe(true);
    expect(result.results[0].passed).toBe(true);
    expect(result.results[0].message).toContain("3 passing");
  });

  it("fails when too many tests are failing", () => {
    const template: LabTemplate = {
      id: "test-pass-fail-roundtrip",
      title: "Test pass fail scenario",
      description: "Verify test-pass failure detection",
      difficulty: 2,
      scaffoldingLevel: "goal-driven",
      initialFiles: [{ path: "src/index.ts", content: "export {};\n" }],
      rules: [
        {
          kind: "test-pass",
          command: "npm test",
          minPassing: 3,
          maxFailing: 0,
        },
      ],
      hints: { 0: [{ level: 0, text: "Fix tests" }, { level: 1, text: "npm test" }] },
      maxResets: 0,
    };

    const instance = createLabInstance(template);
    instance.commandOutputs["npm test"] = "  2 passing\n  2 failing\n";

    const result = validateLabInstance(template, instance);
    expect(result.passed).toBe(false);
    expect(result.results[0].passed).toBe(false);
  });

  it("reset clears commandOutputs used by test-pass rules", () => {
    const template: LabTemplate = {
      id: "test-pass-reset",
      title: "Test pass reset",
      description: "Verify reset clears test output",
      difficulty: 2,
      scaffoldingLevel: "goal-driven",
      initialFiles: [{ path: "src/index.ts", content: "export {};\n" }],
      rules: [
        {
          kind: "test-pass",
          command: "npm test",
          minPassing: 1,
          maxFailing: 0,
        },
      ],
      hints: { 0: [{ level: 0, text: "Run tests" }, { level: 1, text: "npm test" }] },
      maxResets: 0,
    };

    const instance = createLabInstance(template);
    instance.commandOutputs["npm test"] = "  5 passing\n  0 failing\n";
    expect(instance.commandOutputs["npm test"]).toBe("  5 passing\n  0 failing\n");

    const reset = resetLabInstance(instance, template);
    expect(reset.commandOutputs).toEqual({});
  });
});
