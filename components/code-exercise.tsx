"use client";

import { useEffect, useRef, useState } from "react";

type CodeExerciseProps = {
  title: string;
  description: string;
  starterCode: string;
  language: string;
  expectedOutput?: string;
  validateFn?: (code: string) => { passed: boolean; message: string };
  hint?: string;
  /** Called after every validation attempt with the code and result */
  onAttempt?: (code: string, passed: boolean) => void;
};

function defaultValidate(
  code: string,
  expectedOutput?: string,
): { passed: boolean; message: string } {
  if (!code.trim()) {
    return { passed: false, message: "Write some code first." };
  }
  if (expectedOutput && code.includes(expectedOutput)) {
    return { passed: true, message: "Output matches expected result." };
  }
  if (!expectedOutput && code.trim().length > 10) {
    return { passed: true, message: "Code submitted for review." };
  }
  return {
    passed: false,
    message: "Keep working — check the expected output or hint.",
  };
}

export function CodeExercise({
  title,
  description,
  starterCode,
  language,
  expectedOutput,
  validateFn,
  hint,
  onAttempt,
}: CodeExerciseProps) {
  const [code, setCode] = useState(starterCode);
  const [result, setResult] = useState<{
    passed: boolean;
    message: string;
  } | null>(null);
  const [showHint, setShowHint] = useState(false);
  const [copyLabel, setCopyLabel] = useState("Copy");
  const copyTimerRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    return () => {
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
    };
  }, []);

  function handleCopy() {
    navigator.clipboard.writeText(code).then(() => {
      setCopyLabel("Copied!");
      if (copyTimerRef.current) clearTimeout(copyTimerRef.current);
      copyTimerRef.current = setTimeout(() => setCopyLabel("Copy"), 1500);
    });
  }

  function handleRun() {
    const validation = validateFn
      ? validateFn(code)
      : defaultValidate(code, expectedOutput);
    setResult(validation);
    onAttempt?.(code, validation.passed);
  }

  function handleReset() {
    setCode(starterCode);
    setResult(null);
    setShowHint(false);
  }

  const lineCount = code.split("\n").length;

  return (
    <article className="code-exercise">
      <div className="code-exercise-header">
        <div>
          <h4>{title}</h4>
          <p>{description}</p>
        </div>
        <span className="code-lang-badge">{language}</span>
      </div>

      <div className="code-editor-wrapper">
        <div className="code-line-numbers" aria-hidden="true">
          {Array.from({ length: Math.max(lineCount, 8) }, (_, i) => (
            <span key={i}>{i + 1}</span>
          ))}
        </div>
        <textarea
          className="code-textarea"
          value={code}
          onChange={(e) => {
            setCode(e.target.value);
            setResult(null);
          }}
          spellCheck={false}
          autoComplete="off"
          aria-label={`Code editor: ${title}`}
          rows={Math.max(lineCount + 2, 8)}
        />
      </div>

      {expectedOutput ? (
        <div className="code-expected">
          <span className="code-expected-label">Expected:</span>
          <code>{expectedOutput}</code>
        </div>
      ) : null}

      <div className="code-exercise-toolbar">
        <button type="button" className="validate-button" onClick={handleRun}>
          Run check
        </button>
        <button type="button" className="ghost-button" onClick={handleReset}>
          Reset code
        </button>
        <button
          type="button"
          className={`copy-button ${copyLabel === "Copied!" ? "copied" : ""}`}
          onClick={handleCopy}
          aria-label="Copy code"
        >
          {copyLabel}
        </button>
        {hint ? (
          <button
            type="button"
            className="ghost-button"
            onClick={() => setShowHint((v) => !v)}
          >
            {showHint ? "Hide hint" : "Show hint"}
          </button>
        ) : null}
      </div>

      {result ? (
        <div className={`feedback ${result.passed ? "success" : "warning"}`}>
          {result.passed ? "✓ " : "✗ "}
          {result.message}
        </div>
      ) : null}

      {showHint && hint ? <div className="code-hint">{hint}</div> : null}
    </article>
  );
}
