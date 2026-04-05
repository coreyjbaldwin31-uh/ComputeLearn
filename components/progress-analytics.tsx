"use client";

import { useMemo } from "react";
import { curriculum } from "@/data/curriculum";
import type { ArtifactRecord, AttemptRecord } from "@/lib/artifact-engine";
import { calculateCompetencyLevels } from "@/lib/progression-engine";
import type { ReviewRecord } from "@/lib/progression-engine";
import { useLocalStorageState } from "@/components/hooks/use-local-storage-state";
import { useAnalyticsDashboards } from "@/components/hooks/use-analytics-dashboards";

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
    <section className="pa-root" aria-label="Progress analytics">
      {/* Outcomes Dashboard */}
      <div className="pa-section">
        <h2 className="pa-section-title">Outcomes Dashboard</h2>
        <div className="pa-overall">
          <span className="pa-overall-label">Overall Score</span>
          <span className={`pa-overall-value pa-status--${outcomes.status}`}>
            {outcomes.overallScore}%
          </span>
        </div>
        <div className="pa-metrics-grid">
          {outcomes.snapshots.map((snap) => (
            <div key={snap.id} className="pa-metric-card">
              <span className="pa-metric-label">{snap.label}</span>
              <span className={`pa-metric-value pa-status--${snap.status}`}>
                {snap.value}%
              </span>
            </div>
          ))}
        </div>
        {outcomes.prioritizedActions.length > 0 && (
          <div className="pa-actions">
            <h3 className="pa-actions-title">Priority Actions</h3>
            <ul className="pa-actions-list">
              {outcomes.prioritizedActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </div>
        )}
      </div>

      {/* Phase Progress */}
      <div className="pa-section">
        <h2 className="pa-section-title">Phase Progress</h2>
        <div className="pa-phase-grid">
          {phases.map((phase) => {
            const pct =
              phase.totalLessons === 0
                ? 0
                : Math.round(
                    (phase.completedLessons / phase.totalLessons) * 100,
                  );
            return (
              <div key={phase.phaseId} className="pa-phase-card">
                <div className="pa-phase-header">
                  <span className="pa-phase-name">{phase.title}</span>
                  <span
                    className={`pa-phase-badge pa-phase-badge--${phase.statusLabel}`}
                  >
                    {phase.statusLabel.replace("-", " ")}
                  </span>
                </div>
                <div className="pa-phase-bar-wrap">
                  <div className="pa-phase-bar">
                    <div
                      className="pa-phase-fill"
                      style={{ width: `${pct}%` }}
                    />
                  </div>
                  <span className="pa-phase-pct">{pct}%</span>
                </div>
                <span className="pa-phase-detail">
                  {phase.completedLessons} / {phase.totalLessons} lessons
                </span>
              </div>
            );
          })}
        </div>
      </div>

      {/* Transfer Analytics */}
      <div className="pa-section">
        <h2 className="pa-section-title">Transfer Analytics</h2>
        <div className="pa-metrics-grid">
          {transfers.map((t) => (
            <div key={t.phaseId} className="pa-metric-card">
              <span className="pa-metric-label">{t.phaseTitle}</span>
              <span
                className={`pa-metric-value ${t.passRate >= 80 ? "pa-status--strong" : t.passRate >= 60 ? "pa-status--watch" : "pa-status--critical"}`}
              >
                {t.passRate}%
              </span>
              <span className="pa-metric-sub">
                {t.passedTransferLessons} / {t.totalTransferLessons} tasks
              </span>
            </div>
          ))}
        </div>
      </div>

      {/* Independent Readiness */}
      {readiness && (
        <div className="pa-section">
          <h2 className="pa-section-title">Independent Readiness</h2>
          <div className="pa-readiness">
            <div className="pa-readiness-header">
              <span className="pa-readiness-label">Portfolio readiness</span>
              <span className="pa-readiness-pct">
                {readiness.readinessPercent}%
              </span>
            </div>
            <div className="pa-phase-bar-wrap">
              <div className="pa-phase-bar">
                <div
                  className="pa-phase-fill"
                  style={{ width: `${readiness.readinessPercent}%` }}
                />
              </div>
            </div>
            <div className="pa-readiness-stats">
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
              <ul className="pa-readiness-unmet">
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
