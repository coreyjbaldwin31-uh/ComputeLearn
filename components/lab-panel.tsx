"use client";

import type {
  LabFileEntry,
  LabInstance,
  LabRuleResult,
  LabTemplate,
  LabValidationResult,
} from "@/lib/lab-engine";
import { getDifficultyLabel } from "@/lib/lab-engine";
import { useEffect, useState } from "react";
import { useFocusTrap } from "./hooks/use-focus-trap";

type LabPanelProps = {
  template: LabTemplate;
  instance: LabInstance | null;
  onStart: () => void;
  onValidate: () => LabValidationResult | null;
  onReset: () => void;
  onHint: (ruleIndex: number) => string | null;
  onFileChange: (path: string, content: string) => void;
  onCodeSubmit: (ruleIndex: number, code: string) => void;
  onTestOutput: (command: string, output: string) => void;
  completionSummary: string | null;
};

export function LabPanel({
  template,
  instance,
  onStart,
  onValidate,
  onReset,
  onHint,
  onFileChange,
  onCodeSubmit,
  onTestOutput,
  completionSummary,
}: LabPanelProps) {
  const [validationResult, setValidationResult] =
    useState<LabValidationResult | null>(null);
  const [hintTexts, setHintTexts] = useState<Record<number, string>>({});
  const [hintLevels, setHintLevels] = useState<Record<number, number>>({});
  const [editingFile, setEditingFile] = useState<string | null>(null);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const resetDialogRef = useFocusTrap(showResetConfirm);

  useEffect(() => {
    if (!showResetConfirm) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowResetConfirm(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showResetConfirm]);

  function handleValidate() {
    const result = onValidate();
    setValidationResult(result);
  }

  function handleReset() {
    onReset();
    setValidationResult(null);
    setHintTexts({});
    setHintLevels({});
    setEditingFile(null);
    setShowResetConfirm(false);
  }

  function handleHint(ruleIndex: number) {
    const nextLevel = (hintLevels[ruleIndex] ?? -1) + 1;
    const text = onHint(ruleIndex);
    if (text !== null) {
      setHintTexts((prev) => ({ ...prev, [ruleIndex]: text }));
      setHintLevels((prev) => ({ ...prev, [ruleIndex]: nextLevel }));
    }
  }

  // Not started ΓÇö show lab intro and start button
  if (!instance) {
    return (
      <section className="lab-panel">
        <div className="lab-panel-header">
          <h4>Lab: {template.title}</h4>
          <span className="metric-pill">
            {getDifficultyLabel(template.difficulty)}
          </span>
        </div>
        <p>{template.description}</p>
        <div className="lab-meta">
          <span className="metric-pill">
            {template.rules.length} validation rules
          </span>
          <span className="metric-pill">
            {template.initialFiles.length} workspace files
          </span>
          {template.maxResets > 0 ? (
            <span className="metric-pill">
              {template.maxResets} resets allowed
            </span>
          ) : (
            <span className="metric-pill">Unlimited resets</span>
          )}
        </div>
        <button type="button" className="validate-button" onClick={onStart}>
          Start lab
        </button>
      </section>
    );
  }

  // Completed ΓÇö show celebration
  if (instance.status === "completed" && completionSummary) {
    return (
      <section className="lab-panel">
        <div className="lab-completion-banner">
          <div className="lab-celebration-icon" aria-hidden="true">
            <svg
              width="32"
              height="32"
              viewBox="0 0 24 24"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
            >
              <path d="M22 11.08V12a10 10 0 1 1-5.93-9.14" />
              <polyline points="22 4 12 14.01 9 11.01" />
            </svg>
          </div>
          <div className="lab-completion-text">
            <h4>Lab complete ΓÇö {template.title}</h4>
            <p>All validation checks passed. Great work!</p>
          </div>
        </div>
        <pre className="lab-completion-summary">{completionSummary}</pre>
        <button
          type="button"
          className="ghost-button"
          onClick={() => setShowResetConfirm(true)}
        >
          Γå║ Reset and try again
        </button>
        {showResetConfirm ? (
          <div
            className="confirm-backdrop"
            onClick={() => setShowResetConfirm(false)}
          >
            <div
              ref={resetDialogRef}
              className="confirm-dialog"
              role="dialog"
              aria-modal="true"
              aria-label="Confirm lab reset"
              onClick={(e) => e.stopPropagation()}
            >
              <h4>Reset this lab?</h4>
              <p>
                All your file edits, code submissions, and validation results
                will be lost.
              </p>
              <div className="confirm-actions">
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => setShowResetConfirm(false)}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="confirm-destructive"
                  onClick={handleReset}
                >
                  Reset lab
                </button>
              </div>
            </div>
          </div>
        ) : null}
      </section>
    );
  }

  // Active ΓÇö full lab workspace
  return (
    <section className="lab-panel">
      <div className="lab-panel-header">
        <h4>Lab: {template.title}</h4>
        <span className="status-pill pending">Active</span>
        <span className="metric-pill">Attempts: {instance.attemptCount}</span>
        <span className="metric-pill">Resets: {instance.resetCount}</span>
      </div>
      <p>{template.description}</p>

      {/* Workspace files */}
      <div className="lab-workspace">
        <h5>Workspace files</h5>
        <div className="lab-file-list">
          {instance.files.map((file) => (
            <LabFileCard
              key={file.path}
              file={file}
              isEditing={editingFile === file.path}
              onEdit={() =>
                setEditingFile(editingFile === file.path ? null : file.path)
              }
              onChange={(content) => onFileChange(file.path, content)}
            />
          ))}
        </div>
      </div>

      {/* Code submissions ΓÇö one editor per code-behavior rule */}
      {template.rules.some((r) => r.kind === "code-behavior") ? (
        <div className="lab-workspace">
          <h5>Code submissions</h5>
          <div className="lab-file-list">
            {template.rules.map((rule, idx) =>
              rule.kind === "code-behavior" ? (
                <CodeSubmissionCard
                  key={idx}
                  ruleIndex={idx}
                  value={instance.codeSubmissions[idx] ?? ""}
                  onChange={(code) => onCodeSubmit(idx, code)}
                />
              ) : null,
            )}
          </div>
        </div>
      ) : null}

      {/* Test output ΓÇö one editor per test-pass rule */}
      {template.rules.some((r) => r.kind === "test-pass") ? (
        <div className="lab-workspace">
          <h5>Test output</h5>
          <div className="lab-file-list">
            {template.rules.map((rule, idx) =>
              rule.kind === "test-pass" ? (
                <TestOutputCard
                  key={idx}
                  command={rule.command}
                  value={instance.commandOutputs[rule.command] ?? ""}
                  onChange={(output) => onTestOutput(rule.command, output)}
                />
              ) : null,
            )}
          </div>
        </div>
      ) : null}

      {/* Action bar */}
      <div className="toolbar">
        <button
          type="button"
          className="validate-button"
          onClick={handleValidate}
        >
          Validate
        </button>
        <button
          type="button"
          className="ghost-button"
          onClick={() => setShowResetConfirm(true)}
        >
          Γå║ Reset lab
        </button>
      </div>

      {showResetConfirm ? (
        <div
          className="confirm-backdrop"
          onClick={() => setShowResetConfirm(false)}
        >
          <div
            ref={resetDialogRef}
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm lab reset"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Reset this lab?</h4>
            <p>
              All your file edits, code submissions, and validation results will
              be lost.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => setShowResetConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-destructive"
                onClick={handleReset}
              >
                Reset lab
              </button>
            </div>
          </div>
        </div>
      ) : null}

      {/* Validation results */}
      {validationResult ? (
        <div
          className={`lab-validation-results${validationResult.passed ? " all-passed" : ""}`}
          role="status"
          aria-live="polite"
        >
          <h5>
            {validationResult.passed
              ? "≡ƒÄë All checks passed!"
              : `${validationResult.failedResults.length} of ${validationResult.results.length} checks failed`}
          </h5>
          <ul className="lab-rule-list">
            {validationResult.results.map((r) => (
              <LabRuleResultRow
                key={r.ruleIndex}
                result={r}
                hintText={hintTexts[r.ruleIndex] ?? null}
                onHint={() => handleHint(r.ruleIndex)}
              />
            ))}
          </ul>
        </div>
      ) : null}
    </section>
  );
}

// ---------------------------------------------------------------------------
// Sub-components
// ---------------------------------------------------------------------------

function LabFileCard({
  file,
  isEditing,
  onEdit,
  onChange,
}: {
  file: LabFileEntry;
  isEditing: boolean;
  onEdit: () => void;
  onChange: (content: string) => void;
}) {
  return (
    <div className="lab-file-card">
      <div className="lab-file-header">
        <code className="lab-file-path">{file.path}</code>
        <button
          type="button"
          className="ghost-button"
          onClick={onEdit}
          aria-label={`${isEditing ? "Collapse" : "Edit"} ${file.path}`}
        >
          {isEditing ? "Collapse" : "Edit"}
        </button>
      </div>
      {isEditing ? (
        <textarea
          className="lab-file-editor"
          aria-label={`Edit ${file.path}`}
          value={file.content}
          onChange={(e) => onChange(e.target.value)}
          rows={Math.max(4, file.content.split("\n").length + 1)}
        />
      ) : (
        <pre className="lab-file-preview">
          {file.content.length > 200
            ? `${file.content.slice(0, 200)}ΓÇª`
            : file.content}
        </pre>
      )}
    </div>
  );
}

function LabRuleResultRow({
  result,
  hintText,
  onHint,
}: {
  result: LabRuleResult;
  hintText: string | null;
  onHint: () => void;
}) {
  return (
    <li className={`lab-rule-row ${result.passed ? "passed" : "failed"}`}>
      <span className="lab-rule-status">{result.passed ? "Γ£ô" : "Γ£ù"}</span>
      <span className="lab-rule-message">{result.message}</span>
      {!result.passed && result.probableSkillGap ? (
        <span className="lab-rule-gap">
          Skill gap: {result.probableSkillGap}
        </span>
      ) : null}
      {!result.passed ? (
        <button type="button" className="ghost-button" onClick={onHint}>
          {hintText ? "More help" : "Need a hint?"}
        </button>
      ) : null}
      {hintText ? <div className="hint-layer">{hintText}</div> : null}
    </li>
  );
}

function CodeSubmissionCard({
  ruleIndex,
  value,
  onChange,
}: {
  ruleIndex: number;
  value: string;
  onChange: (code: string) => void;
}) {
  return (
    <div className="lab-file-card">
      <div className="lab-file-header">
        <code className="lab-file-path">
          Rule {ruleIndex + 1} ΓÇö code submission
        </code>
      </div>
      <textarea
        className="lab-file-editor"
        aria-label={`Code submission for rule ${ruleIndex + 1}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.max(6, value.split("\n").length + 1)}
        placeholder="Write your code hereΓÇª"
      />
    </div>
  );
}

function TestOutputCard({
  command,
  value,
  onChange,
}: {
  command: string;
  value: string;
  onChange: (output: string) => void;
}) {
  return (
    <div className="lab-file-card">
      <div className="lab-file-header">
        <code className="lab-file-path">{command}</code>
      </div>
      <textarea
        className="lab-file-editor"
        aria-label={`Test output for ${command}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.max(4, value.split("\n").length + 1)}
        placeholder="Paste your test output hereΓÇª"
      />
    </div>
  );
}
