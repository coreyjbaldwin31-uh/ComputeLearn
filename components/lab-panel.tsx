"use client";

import type {
  LabFileEntry,
  LabInstance,
  LabRuleResult,
  LabTemplate,
  LabValidationResult,
} from "@/lib/lab-engine";
import { getDifficultyLabel } from "@/lib/lab-engine";
import { useState } from "react";

type LabPanelProps = {
  template: LabTemplate;
  instance: LabInstance | null;
  onStart: () => void;
  onValidate: () => LabValidationResult | null;
  onReset: () => void;
  onHint: (ruleIndex: number) => string | null;
  onFileChange: (path: string, content: string) => void;
  onCodeSubmit: (ruleIndex: number, code: string) => void;
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
  completionSummary,
}: LabPanelProps) {
  const [validationResult, setValidationResult] =
    useState<LabValidationResult | null>(null);
  const [hintTexts, setHintTexts] = useState<Record<number, string>>({});
  const [hintLevels, setHintLevels] = useState<Record<number, number>>({});
  const [editingFile, setEditingFile] = useState<string | null>(null);

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
  }

  function handleHint(ruleIndex: number) {
    const nextLevel = (hintLevels[ruleIndex] ?? -1) + 1;
    const text = onHint(ruleIndex);
    if (text !== null) {
      setHintTexts((prev) => ({ ...prev, [ruleIndex]: text }));
      setHintLevels((prev) => ({ ...prev, [ruleIndex]: nextLevel }));
    }
  }

  // Not started — show lab intro and start button
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

  // Completed — show summary
  if (instance.status === "completed" && completionSummary) {
    return (
      <section className="lab-panel">
        <div className="lab-panel-header">
          <h4>Lab: {template.title}</h4>
          <span className="status-pill complete">Completed</span>
        </div>
        <pre className="lab-completion-summary">{completionSummary}</pre>
        <button type="button" className="ghost-button" onClick={handleReset}>
          ↺ Reset and try again
        </button>
      </section>
    );
  }

  // Active — full lab workspace
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

      {/* Code submissions — one editor per code-behavior rule */}
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

      {/* Action bar */}
      <div className="toolbar">
        <button
          type="button"
          className="validate-button"
          onClick={handleValidate}
        >
          Validate
        </button>
        <button type="button" className="ghost-button" onClick={handleReset}>
          ↺ Reset lab
        </button>
      </div>

      {/* Validation results */}
      {validationResult ? (
        <div className="lab-validation-results">
          <h5>
            {validationResult.passed
              ? "✓ All checks passed!"
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
        <button type="button" className="ghost-button" onClick={onEdit}>
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
            ? `${file.content.slice(0, 200)}…`
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
      <span className="lab-rule-status">{result.passed ? "✓" : "✗"}</span>
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
          Rule {ruleIndex + 1} — code submission
        </code>
      </div>
      <textarea
        className="lab-file-editor"
        aria-label={`Code submission for rule ${ruleIndex + 1}`}
        value={value}
        onChange={(e) => onChange(e.target.value)}
        rows={Math.max(6, value.split("\n").length + 1)}
        placeholder="Write your code here…"
      />
    </div>
  );
}
