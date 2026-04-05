"use client";

import { useLocalStorageState } from "@/components/hooks/use-local-storage-state";
import { curriculum } from "@/data/curriculum";
import type { ArtifactRecord, AttemptRecord } from "@/lib/artifact-engine";
import { buildIndependentLabSummary } from "@/lib/independent-lab-engine";
import { buildIndependentReadinessSummary } from "@/lib/independent-readiness-engine";
import { calculateCompetencyLevels } from "@/lib/progression-engine";
import { useMemo } from "react";
import styles from "./readiness-wizard.module.css";

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
      className={styles.ringSvg}
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
      <div className={styles.empty} role="status">
        <p>
          Complete Phases 1–3 to unlock independent readiness tracking.
        </p>
      </div>
    );
  }

  const statusColor = STATUS_COLORS[readiness.statusLabel] ?? "var(--ac-muted)";

  return (
    <div className={styles.container}>
      {/* Status Hero */}
      <section className={styles.statusHero} aria-label="Readiness overview">
        <div className={styles.ringWrap}>
          <ReadinessRing percent={readiness.readinessPercent} color={statusColor} />
          <span className={styles.ringText} aria-live="polite">
            {readiness.readinessPercent}%
          </span>
        </div>
        <span
          className={styles.statusLabel}
          style={{ backgroundColor: statusColor }}
        >
          {STATUS_LABELS[readiness.statusLabel] ?? readiness.statusLabel}
        </span>
        <p className={styles.heroDetail}>
          {readiness.completedLessons}/{readiness.totalLessons} lessons complete
          in {readiness.phaseTitle}
        </p>
      </section>

      {/* Readiness Checks */}
      <section aria-label="Readiness checks">
        <h2 className={styles.sectionHeading}>Readiness Checks</h2>
        <ul className={styles.checks} role="list">
          {readiness.checks.map((check) => (
            <li
              key={check.id}
              className={`${styles.checkItem}${check.passed ? ` ${styles.checkItemPassed}` : ""}`}
            >
              <span className={styles.checkIcon} aria-hidden="true">
                {check.passed ? "✅" : "⬜"}
              </span>
              <div className={styles.checkText}>
                <span className={styles.checkLabel}>{check.label}</span>
                <span className={styles.checkDetail}>{check.detail}</span>
              </div>
            </li>
          ))}
        </ul>
      </section>

      {/* Lab Performance */}
      <section aria-label="Lab performance">
        <h2 className={styles.sectionHeading}>Lab Performance</h2>
        <div className={styles.labStats}>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{labSummary.totalLabs}</span>
            <span className={styles.statLabel}>Total Labs</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{labSummary.completedLabs}</span>
            <span className={styles.statLabel}>Completed</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{labSummary.validatedLabs}</span>
            <span className={styles.statLabel}>Validated</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{labSummary.firstPassLabs}</span>
            <span className={styles.statLabel}>First Pass</span>
          </div>
          <div className={styles.statCard}>
            <span className={styles.statValue}>{labSummary.completionRate}%</span>
            <span className={styles.statLabel}>Completion Rate</span>
          </div>
        </div>
      </section>

      {/* Phase Breakdown */}
      {labSummary.phaseBreakdown.some((p) => p.totalLabs > 0) && (
        <section aria-label="Phase breakdown">
          <h2 className={styles.sectionHeading}>Phase Breakdown</h2>
          <div className={styles.phaseGrid}>
            {labSummary.phaseBreakdown
              .filter((p) => p.totalLabs > 0)
              .map((phase) => (
                <div key={phase.phaseId} className={styles.phaseCard}>
                  <h3 className={styles.phaseTitle}>{phase.phaseTitle}</h3>
                  <div className={styles.phaseBarTrack}>
                    <div
                      className={styles.phaseBarFill}
                      style={{
                        width: `${phase.completionRate}%`,
                      }}
                    />
                  </div>
                  <div className={styles.phaseStats}>
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
          <h2 className={styles.sectionHeading}>Next Steps</h2>
          <ul className={styles.nextSteps} role="list">
            {readiness.unmetChecks.map((msg) => (
              <li key={msg}>{msg}</li>
            ))}
          </ul>
        </section>
      )}
    </div>
  );
}
