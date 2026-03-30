/**
 * Lab engine — workspace template model with reset/replay, validation,
 * layered hints, and artifact capture.
 *
 * All functions are pure and stateless. Runtime state is owned by the caller.
 */

import type { ScaffoldingLevel } from "@/data/curriculum";

// ---------------------------------------------------------------------------
// Validation rule types — each models a different kind of lab check
// ---------------------------------------------------------------------------

export type FilePresenceRule = {
  kind: "file-presence";
  /** Path relative to the workspace root */
  path: string;
  shouldExist: boolean;
};

export type DirectoryStructureRule = {
  kind: "directory-structure";
  /** Paths that must (or must not) exist */
  paths: string[];
  shouldExist: boolean;
};

export type ContentMatchRule = {
  kind: "content-match";
  /** Path whose content is inspected */
  path: string;
  /** String or regex pattern that must appear in the file */
  pattern: string;
  /** If true, the pattern is a regex; otherwise literal substring */
  isRegex?: boolean;
};

export type CommandOutputRule = {
  kind: "command-output";
  /** The command that was run */
  command: string;
  /** Expected substring or regex in stdout */
  expectedOutput: string;
  isRegex?: boolean;
};

export type CodeBehaviorRule = {
  kind: "code-behavior";
  /** Patterns that must appear in submitted code */
  requiredPatterns: string[];
  /** Patterns that must NOT appear (anti-patterns) */
  forbiddenPatterns?: string[];
};

export type TestPassRule = {
  kind: "test-pass";
  /** The test command to evaluate */
  command: string;
  /** Minimum number of passing tests required */
  minPassing: number;
  /** Maximum number of failing tests allowed (0 = none) */
  maxFailing: number;
};

export type LabValidationRule =
  | FilePresenceRule
  | DirectoryStructureRule
  | ContentMatchRule
  | CommandOutputRule
  | CodeBehaviorRule
  | TestPassRule;

// ---------------------------------------------------------------------------
// Lab template — the authored definition of a lab
// ---------------------------------------------------------------------------

export type LabFileEntry = {
  path: string;
  content: string;
};

export type LabHintLayer = {
  level: number;
  text: string;
};

export type LabTemplate = {
  id: string;
  title: string;
  description: string;
  difficulty: 1 | 2 | 3 | 4;
  scaffoldingLevel: ScaffoldingLevel;
  /** Files present in the workspace at the start */
  initialFiles: LabFileEntry[];
  /** Ordered validation rules — all must pass to complete the lab */
  rules: LabValidationRule[];
  /** Layered hints keyed by rule index */
  hints: Record<number, LabHintLayer[]>;
  /** Maximum number of resets allowed (0 = unlimited) */
  maxResets: number;
};

// ---------------------------------------------------------------------------
// Lab instance — runtime state of an active lab
// ---------------------------------------------------------------------------

export type LabStatus = "not-started" | "active" | "completed" | "abandoned";

export type LabInstance = {
  templateId: string;
  status: LabStatus;
  /** Current workspace files (mutable by learner actions) */
  files: LabFileEntry[];
  /** Recorded command outputs keyed by command string */
  commandOutputs: Record<string, string>;
  /** Submitted code keyed by rule index */
  codeSubmissions: Record<number, string>;
  attemptCount: number;
  resetCount: number;
  startedAt: string | null;
  completedAt: string | null;
};

// ---------------------------------------------------------------------------
// Validation result
// ---------------------------------------------------------------------------

export type LabRuleResult = {
  ruleIndex: number;
  rule: LabValidationRule;
  passed: boolean;
  message: string;
  probableSkillGap?: string;
};

export type LabValidationResult = {
  passed: boolean;
  results: LabRuleResult[];
  failedResults: LabRuleResult[];
};

// ---------------------------------------------------------------------------
// Factory: create a fresh lab instance from a template
// ---------------------------------------------------------------------------

export function createLabInstance(template: LabTemplate): LabInstance {
  return {
    templateId: template.id,
    status: "active",
    files: template.initialFiles.map((f) => ({ ...f })),
    commandOutputs: {},
    codeSubmissions: {},
    attemptCount: 0,
    resetCount: 0,
    startedAt: new Date().toISOString(),
    completedAt: null,
  };
}

// ---------------------------------------------------------------------------
// Reset: restore workspace to initial state, increment reset counter
// ---------------------------------------------------------------------------

export function resetLabInstance(
  instance: LabInstance,
  template: LabTemplate,
): LabInstance {
  if (template.maxResets > 0 && instance.resetCount >= template.maxResets) {
    return instance;
  }
  return {
    ...instance,
    files: template.initialFiles.map((f) => ({ ...f })),
    commandOutputs: {},
    codeSubmissions: {},
    status: "active",
    resetCount: instance.resetCount + 1,
    completedAt: null,
  };
}

// ---------------------------------------------------------------------------
// Validation: run all template rules against the current instance state
// ---------------------------------------------------------------------------

function evaluateRule(
  rule: LabValidationRule,
  instance: LabInstance,
  ruleIndex: number,
): LabRuleResult {
  switch (rule.kind) {
    case "file-presence": {
      const exists = instance.files.some((f) => f.path === rule.path);
      const passed = rule.shouldExist ? exists : !exists;
      return {
        ruleIndex,
        rule,
        passed,
        message: passed
          ? `File "${rule.path}" ${rule.shouldExist ? "exists" : "absent"} as expected.`
          : `File "${rule.path}" should ${rule.shouldExist ? "exist" : "not exist"}.`,
        probableSkillGap: passed ? undefined : "File Manipulation",
      };
    }

    case "directory-structure": {
      const allMatch = rule.paths.every((p) => {
        const exists = instance.files.some(
          (f) => f.path === p || f.path.startsWith(`${p}/`),
        );
        return rule.shouldExist ? exists : !exists;
      });
      return {
        ruleIndex,
        rule,
        passed: allMatch,
        message: allMatch
          ? "Directory structure matches expectations."
          : `Expected paths ${rule.shouldExist ? "missing" : "should not exist"}: ${rule.paths.join(", ")}.`,
        probableSkillGap: allMatch ? undefined : "System Navigation",
      };
    }

    case "content-match": {
      const file = instance.files.find((f) => f.path === rule.path);
      if (!file) {
        return {
          ruleIndex,
          rule,
          passed: false,
          message: `File "${rule.path}" not found — cannot check content.`,
          probableSkillGap: "File Manipulation",
        };
      }
      const matches = rule.isRegex
        ? new RegExp(rule.pattern).test(file.content)
        : file.content.includes(rule.pattern);
      return {
        ruleIndex,
        rule,
        passed: matches,
        message: matches
          ? `Content in "${rule.path}" matches expected pattern.`
          : `Content in "${rule.path}" does not match expected pattern.`,
        probableSkillGap: matches ? undefined : "Code Reading",
      };
    }

    case "command-output": {
      const output = instance.commandOutputs[rule.command] ?? "";
      const matches = rule.isRegex
        ? new RegExp(rule.expectedOutput).test(output)
        : output.includes(rule.expectedOutput);
      return {
        ruleIndex,
        rule,
        passed: matches,
        message: matches
          ? `Command "${rule.command}" produced expected output.`
          : `Command "${rule.command}" output does not contain expected result.`,
        probableSkillGap: matches ? undefined : "Terminal Operation",
      };
    }

    case "code-behavior": {
      const code = instance.codeSubmissions[ruleIndex] ?? "";
      const hasRequired = rule.requiredPatterns.every((p) => code.includes(p));
      const hasForbidden = (rule.forbiddenPatterns ?? []).some((p) =>
        code.includes(p),
      );
      const passed = hasRequired && !hasForbidden;
      return {
        ruleIndex,
        rule,
        passed,
        message: passed
          ? "Code meets structural expectations."
          : hasForbidden
            ? "Code contains a discouraged pattern."
            : "Code is missing required patterns.",
        probableSkillGap: passed ? undefined : "Programming Logic",
      };
    }

    case "test-pass": {
      const output = instance.commandOutputs[rule.command] ?? "";
      const passingMatch = output.match(/(\d+)\s+passing/);
      const failingMatch = output.match(/(\d+)\s+failing/);
      const passing = passingMatch ? parseInt(passingMatch[1], 10) : 0;
      const failing = failingMatch ? parseInt(failingMatch[1], 10) : 0;
      const meetsMin = passing >= rule.minPassing;
      const withinMax = failing <= rule.maxFailing;
      const passed = meetsMin && withinMax;
      return {
        ruleIndex,
        rule,
        passed,
        message: passed
          ? `Tests pass: ${passing} passing, ${failing} failing.`
          : !meetsMin
            ? `Need at least ${rule.minPassing} passing tests, found ${passing}.`
            : `Too many failing tests: ${failing} (max ${rule.maxFailing}).`,
        probableSkillGap: passed ? undefined : "Testing",
      };
    }
  }
}

export function validateLabInstance(
  template: LabTemplate,
  instance: LabInstance,
): LabValidationResult {
  const results = template.rules.map((rule, index) =>
    evaluateRule(rule, instance, index),
  );
  const failedResults = results.filter((r) => !r.passed);
  return {
    passed: failedResults.length === 0,
    results,
    failedResults,
  };
}

// ---------------------------------------------------------------------------
// Record attempt: bump counter and optionally mark completed
// ---------------------------------------------------------------------------

export function recordLabAttempt(
  instance: LabInstance,
  validationResult: LabValidationResult,
): LabInstance {
  return {
    ...instance,
    attemptCount: instance.attemptCount + 1,
    status: validationResult.passed ? "completed" : instance.status,
    completedAt: validationResult.passed
      ? new Date().toISOString()
      : instance.completedAt,
  };
}

// ---------------------------------------------------------------------------
// Hint access: get layered hint for a specific failing rule
// ---------------------------------------------------------------------------

export function getLabHint(
  template: LabTemplate,
  ruleIndex: number,
  requestedLevel: number,
): string | null {
  const layers = template.hints[ruleIndex];
  if (!layers || layers.length === 0) return null;
  const capped = Math.min(requestedLevel, layers.length - 1);
  const layer = layers.find((l) => l.level === capped);
  return layer?.text ?? null;
}

export function getMaxHintLevel(
  template: LabTemplate,
  ruleIndex: number,
): number {
  const layers = template.hints[ruleIndex];
  if (!layers || layers.length === 0) return 0;
  return Math.max(...layers.map((l) => l.level));
}

// ---------------------------------------------------------------------------
// Difficulty helpers
// ---------------------------------------------------------------------------

const difficultyLabels: Record<LabTemplate["difficulty"], string> = {
  1: "Step-by-step execution",
  2: "Goal-driven with hints",
  3: "Problem statement with partial scaffolding",
  4: "Ticket-style with minimal guidance",
};

export function getDifficultyLabel(difficulty: LabTemplate["difficulty"]): string {
  return difficultyLabels[difficulty];
}

// ---------------------------------------------------------------------------
// Artifact helpers
// ---------------------------------------------------------------------------

export function buildLabCompletionSummary(
  template: LabTemplate,
  instance: LabInstance,
): string {
  const lines: string[] = [
    `Lab: ${template.title}`,
    `Difficulty: ${getDifficultyLabel(template.difficulty)}`,
    `Attempts: ${instance.attemptCount}`,
    `Resets: ${instance.resetCount}`,
    `Status: ${instance.status}`,
  ];

  if (instance.completedAt) {
    lines.push(`Completed: ${instance.completedAt}`);
  }

  const fileList = instance.files.map((f) => f.path).join(", ");
  if (fileList) {
    lines.push(`Workspace files: ${fileList}`);
  }

  return lines.join("\n");
}
