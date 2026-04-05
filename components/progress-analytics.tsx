"use client";

import { useAnalyticsDashboards } from "@/components/hooks/use-analytics-dashboards";
import { useLocalStorageState } from "@/components/hooks/use-local-storage-state";
import { curriculum } from "@/data/curriculum";
import type { ArtifactRecord, AttemptRecord } from "@/lib/artifact-engine";
import type { ReviewRecord } from "@/lib/progression-engine";
import { calculateCompetencyLevels } from "@/lib/progression-engine";
import { useMemo } from "react";
import styles from "./progress-analytics.module.css";

function statusClass(status: "strong" | "watch" | "critical") {
  if (status === "strong") return styles.statusStrong;
  if (status === "watch") return styles.statusWatch;
  return styles.statusCritical;
}

function phaseBadgeClass(statusLabel: string) {
  if (statusLabel === "not-started") return styles.phaseBadgeNotStarted;
  if (statusLabel === "in-progress") return styles.phaseBadgeInProgress;
  if (statusLabel === "review-needed") return styles.phaseBadgeReviewNeeded;
  return styles.phaseBadgeReady;
}

export function ProgressAnalytics() {
  const [progress] = useLocalStorageState<Record<string, true>>(
    "computelearn-progress",
    {},
  );
  const [transferProgress] = useLocalStorageState<Record<string, true>>(
    "computelearn-transfer",
    {},
  );
  const [reviews] = useLocalStorageState<Record<string, ReviewRecord>>(
    "computelearn-reviews",
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

  const analytics = useAnalyticsDashboards({
    curriculum,
    progress,
    transferProgress,
    competencyLevels,
    reviews,
    attempts,
    artifacts,
    selectedLesson: undefined,
  });

  const outcomes = analytics.outcomesDashboardSummary;
  const phases = analytics.phaseStatuses;
  const transfers = analytics.phaseTransferAnalytics;
  const readiness = analytics.independentReadiness;

  return (
    <section className={styles.root} aria-label="Progress analytics">
      {/* Outcomes Dashboard */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Outcomes Dashboard</h2>
        <div className={styles.overall}>
          <span className={styles.overallLabel}>Overall Score</span>
          <span
            className={`${styles.overallValue} ${statusClass(outcomes.status)}`}
          >
            {outcomes.overallScore}%
          </span>
        </div>
        <div className={styles.metricsGrid}>
          {outcomes.snapshots.map((snap) => (
            <div key={snap.id} className={styles.metricCard}>
              <span className={styles.metricLabel}>{snap.label}</span>
              <span
                className={`${styles.metricValue} ${statusClass(snap.status)}`}
              >
                {snap.value}%
              </span>
            </div>
          ))}
        </div>
        {outcomes.prioritizedActions.length > 0 && (
          <div className={styles.actions}>
            <h3 className={styles.actionsTitle}>Priority Actions</h3>
            <ul className={styles.actionsList}>
              {outcomes.prioritizedActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Phase Progress */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Phase Progress</h2>
        <div className={styles.phaseGrid}>
          {phases.map((phase) => {
            const pct =
              phase.totalLessons === 0
                ? 0
                : Math.round(
                    (phase.completedLessons / phase.totalLessons) * 100,
                  );
            return (
              <div key={phase.phaseId} className={styles.phaseCard}>
                <div className={styles.phaseHeader}>
                  <span className={styles.phaseName}>{phase.title}</span>
                  <span
                    className={`${styles.phaseBadge} ${phaseBadgeClass(phase.statusLabel)}`}
                  >
                    {phase.statusLabel.replace("-", " ")}
                  </span>
                </div>
                <div className={styles.phaseBarWrap}>
                  <progress
                    className={styles.phaseProgress}
                    max={100}
                    value={pct}
                    aria-label={`${phase.title} progress`}
                  />
                  <span className={styles.phasePct}>{pct}%</span>
                </div>
                <span className={styles.phaseDetail}>
                  {phase.completedLessons} / {phase.totalLessons} lessons
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transfer Analytics */}
      <div className={styles.section}>
        <h2 className={styles.sectionTitle}>Transfer Analytics</h2>
        <div className={styles.metricsGrid}>
          {transfers.map((t) => (
            <div key={t.phaseId} className={styles.metricCard}>
              <span className={styles.metricLabel}>{t.phaseTitle}</span>
              <span
                className={`${styles.metricValue} ${
                  t.passRate >= 80
                    ? styles.statusStrong
                    : t.passRate >= 60
                      ? styles.statusWatch
                      : styles.statusCritical
                }`}
              >
                {t.passRate}%
              </span>
              <span className={styles.metricSub}>
                {t.passedTransferLessons} / {t.totalTransferLessons} tasks
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Independent Readiness */}
      {readiness && (
        <div className={styles.section}>
          <h2 className={styles.sectionTitle}>Independent Readiness</h2>
          <div className={styles.readiness}>
            <div className={styles.readinessHeader}>
              <span className={styles.readinessLabel}>Portfolio readiness</span>
              <span className={styles.readinessPct}>
                {readiness.readinessPercent}%
              </span>
            </div>
            <div className={styles.phaseBarWrap}>
              <progress
                className={styles.phaseProgress}
                max={100}
                value={readiness.readinessPercent}
                aria-label="Portfolio readiness"
              />
            </div>
            <div className={styles.readinessStats}>
              <span>
                {readiness.documentationArtifacts} documentation artifact
                {readiness.documentationArtifacts !== 1 ? "s" : ""}
              </span>
              <span>
                {readiness.completedCapstoneLessons} /{" "}
                {readiness.totalCapstoneLessons} capstone lessons
              </span>
            </div>
            {readiness.unmetChecks.length > 0 && (
              <ul className={styles.readinessUnmet}>
                {readiness.unmetChecks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
            )}
          </div>
        </div>
      )}
    </section>
  );
}
