"use client";

import { useLocalStorageState } from "@/components/hooks/use-local-storage-state";
import { curriculum } from "@/data/curriculum";
import type { ArtifactRecord, AttemptRecord } from "@/lib/artifact-engine";
import { buildIndependentLabSummary } from "@/lib/independent-lab-engine";
import { buildIndependentReadinessSummary } from "@/lib/independent-readiness-engine";
import { calculateCompetencyLevels } from "@/lib/progression-engine";
import { useMemo } from "react";

const STATUS_COLORS: Record<string, string> = {
  "not-started": "var(--ac-muted)",
  building: "var(--ac-accent)",
  "capstone-ready": "#d97706",
  "portfolio-ready": "#16a34a",
};

const STATUS_LABELS: Record<string, string> = {
  "not-started": "Not Started",
  building: "Building",
  "capstone-ready": "Capstone Ready",
  "portfolio-ready": "Portfolio Ready",
};

function ReadinessRing({
  percent,
  color,
}: {
  percent: number;
  color: string;
}) {
  const radius = 54;
  const circumference = 2 * Math.PI * radius;
  const offset = circumference - (percent / 100) * circumference;

  return (
    <svg
      className="rw-ring-svg"
      viewBox="0 0 120 120"
      aria-hidden="true"
      role="img"
    >
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke="var(--ac-border)"
        strokeWidth="8"
      />
      <circle
        cx="60"
        cy="60"
        r={radius}
        fill="none"
        stroke={color}
        strokeWidth="8"
        strokeLinecap="round"
        strokeDasharray={circumference}
        strokeDashoffset={offset}
        transform="rotate(-90 60 60)"
      />
    </svg>
  );
}

export function ReadinessWizard() {
  const [progress] = useLocalStorageState<Record<string, true>>(
    "computelearn-progress",
    {},
  );
  const [transferProgress] = useLocalStorageState<Record<string, true>>(
    "computelearn-transfer",
    {},
  );
  const [attempts] = useLocalStorageState<AttemptRecord[]>(
    "computelearn-attempts",
    [],
  );
  const [artifacts] = useLocalStorageState<ArtifactRecord[]>(
    "computelearn-artifacts",
    [],
  );

  const competencyLevels = useMemo(
    () => calculateCompetencyLevels(curriculum, progress),
    [progress],
  );

  const readiness = useMemo(
    () =>
      buildIndependentReadinessSummary(
        curriculum,
        progress,
        transferProgress,
        competencyLevels,
        artifacts,
      ),
    [progress, transferProgress, competencyLevels, artifacts],
  );

  const labSummary = useMemo(
    () =>
      buildIndependentLabSummary(
        curriculum,
        progress,
        transferProgress,
        attempts,
      ),
    [progress, transferProgress, attempts],
  );

  if (!readiness) {
    return (
      <div className="rw-empty" role="status">
        <p>
          Complete Phases 1–3 to unlock independent readiness tracking.
        </p>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[readiness.statusLabel] ?? "var(--ac-muted)";

  return (
    <div className="rw-container">
      {/* Status Hero */}
      <section className="rw-status-hero" aria-label="Readiness overview">
        <div className="rw-ring-wrap">
          <ReadinessRing percent={readiness.readinessPercent} color={statusColor} />
          <span className="rw-ring-text" aria-live="polite">
            {readiness.readinessPercent}%
          </span>
        </div>
        <span
          className="rw-status-label"
          style={{ backgroundColor: statusColor }}
        >
          {STATUS_LABELS[readiness.statusLabel] ?? readiness.statusLabel}
        </span>
        <p className="rw-hero-detail">
          {readiness.completedLessons}/{readiness.totalLessons} lessons complete
          in {readiness.phaseTitle}
        </p>
      </section>

      {/* Readiness Checks */}
      <section aria-label="Readiness checks">
        <h2 className="rw-section-heading">Readiness Checks</h2>
        <ul className="rw-checks" role="list">
          {readiness.checks.map((check) => (
            <li
              key={check.id}
              className={`rw-check-item${check.passed ? " rw-check-item--passed" : ""}`}
            >
              <span className="rw-check-icon" aria-hidden="true">
                {check.passed ? "✅" : "⬜"}
              </span>
              <div className="rw-check-text">
                <span className="rw-check-label">{check.label}</span>
                <span className="rw-check-detail">{check.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Lab Performance */}
      <section aria-label="Lab performance">
        <h2 className="rw-section-heading">Lab Performance</h2>
        <div className="rw-lab-stats">
          <div className="rw-stat-card">
            <span className="rw-stat-value">{labSummary.totalLabs}</span>
            <span className="rw-stat-label">Total Labs</span>
          </div>
          <div className="rw-stat-card">
            <span className="rw-stat-value">{labSummary.completedLabs}</span>
            <span className="rw-stat-label">Completed</span>
          </div>
          <div className="rw-stat-card">
            <span className="rw-stat-value">{labSummary.validatedLabs}</span>
            <span className="rw-stat-label">Validated</span>
          </div>
          <div className="rw-stat-card">
            <span className="rw-stat-value">{labSummary.firstPassLabs}</span>
            <span className="rw-stat-label">First Pass</span>
          </div>
          <div className="rw-stat-card">
            <span className="rw-stat-value">{labSummary.completionRate}%</span>
            <span className="rw-stat-label">Completion Rate</span>
          </div>
        </div>
      </section>

      {/* Phase Breakdown */}
      {labSummary.phaseBreakdown.some((p) => p.totalLabs > 0) && (
        <section aria-label="Phase breakdown">
          <h2 className="rw-section-heading">Phase Breakdown</h2>
          <div className="rw-phase-grid">
            {labSummary.phaseBreakdown
              .filter((p) => p.totalLabs > 0)
              .map((phase) => (
                <div key={phase.phaseId} className="rw-phase-card">
                  <h3 className="rw-phase-title">{phase.phaseTitle}</h3>
                  <div className="rw-phase-bar-track">
                    <div
                      className="rw-phase-bar-fill"
                      style={{
                        width: `${phase.completionRate}%`,
                      }}
                    />
                  </div>
                  <div className="rw-phase-stats">
                    <span>
                      {phase.completedLabs}/{phase.totalLabs} complete
                    </span>
                    <span>{phase.validatedLabs} validated</span>
                    <span>{phase.firstPassLabs} first-pass</span>
                  </div>
                </div>
              ))}
          </div>
        </section>
      )}

      {/* Unmet Requirements */}
      {readiness.unmetChecks.length > 0 && (
        <section aria-label="Next steps">
          <h2 className="rw-section-heading">Next Steps</h2>
          <ul className="rw-next-steps" role="list">
            {readiness.unmetChecks.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
