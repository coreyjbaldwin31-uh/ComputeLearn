import type { Curriculum, Phase } from "@/data/curriculum";
import type { buildCompetencyDashboardSummary } from "@/lib/competency-dashboard-engine";
import type { buildIndependentLabSummary } from "@/lib/independent-lab-engine";
import type { buildIndependentReadinessSummary } from "@/lib/independent-readiness-engine";
import type { buildMilestonePassRateSummary } from "@/lib/milestone-pass-rate-engine";
import type { buildOutcomesDashboardSummary } from "@/lib/outcomes-dashboard-engine";
import type { buildPhaseStatusRecords } from "@/lib/phase-status-engine";
import type { buildPhaseTransferAnalytics } from "@/lib/transfer-analytics-engine";
import { CollapsiblePanel } from "./collapsible-panel";

type SidebarPanelsProps = {
  curriculum: Curriculum;
  selectedPhase: Phase;
  percentComplete: number;
  progress: Record<string, true>;
  completedWithinPhase: number;
  totalWithinPhase: number;
  phaseStatuses: ReturnType<typeof buildPhaseStatusRecords>;
  competencyDashboard: ReturnType<typeof buildCompetencyDashboardSummary>;
  phaseTransferAnalytics: ReturnType<typeof buildPhaseTransferAnalytics>;
  milestonePassRateSummary: ReturnType<typeof buildMilestonePassRateSummary>;
  outcomesDashboardSummary: ReturnType<typeof buildOutcomesDashboardSummary>;
  independentReadiness: ReturnType<
    typeof buildIndependentReadinessSummary
  > | null;
  independentLabSummary: ReturnType<typeof buildIndependentLabSummary>;
  selectPhase: (phaseId: string) => void;
};

export function SidebarPanels({
  curriculum,
  selectedPhase,
  percentComplete,
  progress,
  completedWithinPhase,
  totalWithinPhase,
  phaseStatuses,
  competencyDashboard,
  phaseTransferAnalytics,
  milestonePassRateSummary,
  outcomesDashboardSummary,
  independentReadiness,
  independentLabSummary,
  selectPhase,
}: SidebarPanelsProps) {
  return (
    <aside className="sidebar">
      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>Phases</h3>
            <p>
              Progressive learning path from operational fluency to real
              engineering work.
            </p>
          </div>
          <span className="tag">{curriculum.phases.length} total</span>
        </div>

        <div className="progress-with-label">
          <progress
            className="progress-meter"
            aria-label="Overall completion"
            max={100}
            value={percentComplete}
          />
          <span className="progress-label">{percentComplete}%</span>
        </div>

        <ul className="phase-list">
          {curriculum.phases.map((phase) => {
            const status = phaseStatuses.find(
              (record) => record.phaseId === phase.id,
            );
            const phaseLessonCount = phase.courses.flatMap(
              (course) => course.lessons,
            ).length;
            const phaseCompletedCount = phase.courses
              .flatMap((course) => course.lessons)
              .filter((lesson) => progress[lesson.id]).length;

            return (
              <li key={phase.id}>
                <button
                  type="button"
                  className={`phase-button ${phase.id === selectedPhase.id ? "active" : ""}`}
                  onClick={() => selectPhase(phase.id)}
                  aria-current={
                    phase.id === selectedPhase.id ? "true" : undefined
                  }
                >
                  <span className="phase-kicker">{phase.level}</span>
                  <span className="phase-title">{phase.title}</span>
                  <div className="phase-metrics">
                    <span>{phase.duration}</span>
                    <span>
                      {phaseCompletedCount}/{phaseLessonCount} lessons
                    </span>
                    {status ? (
                      <span
                        className={`status-pill ${
                          status.statusLabel === "ready"
                            ? "complete"
                            : "pending"
                        }`}
                      >
                        {status.statusLabel === "not-started"
                          ? "Not started"
                          : status.statusLabel === "in-progress"
                            ? "In progress"
                            : status.statusLabel === "review-needed"
                              ? "Review needed"
                              : "Ready"}
                      </span>
                    ) : null}
                  </div>
                </button>
              </li>
            );
          })}
        </ul>
      </section>

      <section className="panel">
        <div className="panel-header">
          <div>
            <h3>{selectedPhase.title}</h3>
            <p>{selectedPhase.strapline}</p>
          </div>
          <span className="tag">
            {completedWithinPhase}/{totalWithinPhase}
          </span>
        </div>
        <p>{selectedPhase.purpose}</p>
        <ul className="tool-list">
          {selectedPhase.tools.map((tool, i) => (
            <li key={i}>{tool}</li>
          ))}
        </ul>
      </section>

      <CollapsiblePanel title="Mastery overview">
        <div className="phase-metrics">
          <span>{competencyDashboard.passingCount} strong tracks</span>
          <span>{competencyDashboard.weakCount} weak tracks</span>
        </div>
        {competencyDashboard.records.length > 0 ? (
          <ul className="review-queue-list">
            {competencyDashboard.records.slice(0, 5).map((record) => (
              <li key={record.track}>
                <div className="review-queue-item static-item">
                  <span className="review-course">{record.level}</span>
                  <span className="review-lesson">{record.displayName}</span>
                  <span className="microcopy">
                    {record.count} evidence point
                    {record.count === 1 ? "" : "s"}
                    {record.isWeak ? " · reinforcement suggested" : ""}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="microcopy">
            Complete lessons to build competency signals.
          </p>
        )}
      </CollapsiblePanel>

      <CollapsiblePanel title="Transfer analytics">
        <ul className="review-queue-list">
          {phaseTransferAnalytics.map((record) => (
            <li key={record.phaseId}>
              <div className="review-queue-item static-item">
                <span className="review-course">{record.passRate}% passed</span>
                <span className="review-lesson">{record.phaseTitle}</span>
                <span className="microcopy">
                  {record.passedTransferLessons}/{record.totalTransferLessons}{" "}
                  transfer lessons cleared
                </span>
              </div>
            </li>
          ))}
        </ul>
      </CollapsiblePanel>

      <CollapsiblePanel title="Milestone pass rate">
        <div className="phase-metrics">
          <span>{milestonePassRateSummary.passRate}% phases cleared</span>
          <span>
            {milestonePassRateSummary.passedPhases}/
            {milestonePassRateSummary.totalPhases} phases ready
          </span>
          <span>{milestonePassRateSummary.blockedPhases} blocked</span>
        </div>
        <div className="phase-metrics">
          <span>
            {milestonePassRateSummary.statusCounts.notStarted} not started
          </span>
          <span>
            {milestonePassRateSummary.statusCounts.inProgress} in progress
          </span>
          <span>
            {milestonePassRateSummary.statusCounts.reviewNeeded} review needed
          </span>
        </div>
        {milestonePassRateSummary.blockedPhaseTitles.length > 0 ? (
          <ul className="review-queue-list">
            {milestonePassRateSummary.blockedPhaseTitles.map((title) => (
              <li key={title}>
                <div className="review-queue-item static-item">
                  <span className="review-course">Blocked</span>
                  <span className="review-lesson">{title}</span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="microcopy">
            All phases currently satisfy milestone gates.
          </p>
        )}
      </CollapsiblePanel>

      <CollapsiblePanel title="Outcomes dashboard">
        <div className="panel-header">
          <p>PRD metric rollup and recommended next actions.</p>
          <span
            className={`status-pill ${
              outcomesDashboardSummary.status === "strong"
                ? "complete"
                : "pending"
            }`}
          >
            {outcomesDashboardSummary.overallScore}%
          </span>
        </div>
        <ul className="review-queue-list">
          {outcomesDashboardSummary.snapshots.map((snapshot) => (
            <li key={snapshot.id}>
              <div className="review-queue-item static-item">
                <span
                  className={`review-course ${
                    snapshot.status === "strong" ? "" : "warning-text"
                  }`}
                >
                  {snapshot.value}%
                </span>
                <span className="review-lesson">{snapshot.label}</span>
              </div>
            </li>
          ))}
        </ul>
        <h4>Priority actions</h4>
        <ul className="retention-list">
          {outcomesDashboardSummary.prioritizedActions.map((action) => (
            <li key={action}>{action}</li>
          ))}
        </ul>
      </CollapsiblePanel>

      {independentReadiness ? (
        <CollapsiblePanel title="Independent readiness">
          <div className="panel-header">
            <p>{independentReadiness.phaseTitle}</p>
            <span
              className={`status-pill ${
                independentReadiness.statusLabel === "portfolio-ready"
                  ? "complete"
                  : "pending"
              }`}
            >
              {independentReadiness.statusLabel === "not-started"
                ? "Not started"
                : independentReadiness.statusLabel === "building"
                  ? "Building"
                  : independentReadiness.statusLabel === "capstone-ready"
                    ? "Capstone ready"
                    : "Portfolio ready"}
            </span>
          </div>
          <div className="phase-metrics">
            <span>{independentReadiness.readinessPercent}% ready</span>
            <span>
              {independentReadiness.completedLessons}/
              {independentReadiness.totalLessons} lessons complete
            </span>
          </div>
          <p className="microcopy">
            {independentReadiness.documentationArtifacts} documentation
            artifacts across {independentReadiness.documentedLessons} lessons.
          </p>
          <ul className="review-queue-list">
            {independentReadiness.checks.map((check) => (
              <li key={check.id}>
                <div className="review-queue-item static-item">
                  <span
                    className={`review-course ${check.passed ? "" : "warning-text"}`}
                  >
                    {check.passed ? "Ready" : "Blocked"}
                  </span>
                  <span className="review-lesson">{check.label}</span>
                  <span className="microcopy">{check.detail}</span>
                </div>
              </li>
            ))}
          </ul>
        </CollapsiblePanel>
      ) : null}

      <CollapsiblePanel title="Independent lab completion">
        <div className="phase-metrics">
          <span>{independentLabSummary.completionRate}% completed</span>
          <span>
            {independentLabSummary.completedLabs}/
            {independentLabSummary.totalLabs} ticket labs
          </span>
        </div>
        <div className="phase-metrics">
          <span>{independentLabSummary.validatedLabs} fully validated</span>
          <span>{independentLabSummary.firstPassLabs} first-pass labs</span>
        </div>
        {independentLabSummary.phaseBreakdown.some(
          (phase) => phase.totalLabs > 0,
        ) ? (
          <ul className="review-queue-list">
            {independentLabSummary.phaseBreakdown
              .filter((phase) => phase.totalLabs > 0)
              .map((phase) => (
                <li key={phase.phaseId}>
                  <div className="review-queue-item static-item">
                    <span className="review-course">
                      {phase.completionRate}% complete
                    </span>
                    <span className="review-lesson">{phase.phaseTitle}</span>
                    <span className="microcopy">
                      {phase.completedLabs}/{phase.totalLabs} complete ·{" "}
                      {phase.validatedLabs} validated · {phase.firstPassLabs}{" "}
                      first pass
                    </span>
                  </div>
                </li>
              ))}
          </ul>
        ) : (
          <p className="microcopy">
            Ticket-style labs appear in late phases and will populate here as
            you progress.
          </p>
        )}
      </CollapsiblePanel>
    </aside>
  );
}
