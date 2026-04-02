import type { Course, Lesson, Phase } from "@/data/curriculum";
import type { buildArtifactBrowserSummary } from "@/lib/artifact-browser-engine";
import { getArtifactPreview } from "@/lib/artifact-browser-engine";
import type { buildArtifactCompletionSummary } from "@/lib/artifact-completion-engine";
import type { AttemptRecord } from "@/lib/artifact-engine";
import type { buildAttemptAnalyticsSummary } from "@/lib/attempt-analytics-engine";
import type { evaluatePhaseMilestoneStatus } from "@/lib/milestone-engine";
import type {
  evaluatePhaseExitStatus,
  LessonEntry,
  ReviewRecord,
} from "@/lib/progression-engine";
import {
  formatTrackName,
  getMasteryLevel,
  isDueForReview,
} from "@/lib/progression-engine";
import type { ReinforcementRecommendation } from "@/lib/reinforcement-engine";
import { useEffect, useMemo, useState } from "react";
import { CollapsiblePanel } from "./collapsible-panel";
import { useFocusTrap } from "./hooks/use-focus-trap";
import type { LearnerProfile } from "./hooks/use-learner-profile";

type RailPanelsProps = {
  learnerProfile: LearnerProfile;
  updateLearnerProfile: (changes: Partial<LearnerProfile>) => void;
  onResetAll: () => void;
  selectedPhase: Phase;
  selectedCourse: Course;
  selectedLesson: Lesson;
  progress: Record<string, true>;
  reviews: Record<string, ReviewRecord>;
  visibleLessons: Lesson[];
  setSelectedLessonId: (id: string) => void;
  exportArtifacts: (lessonId?: string) => void;
  recentAttempts: AttemptRecord[];
  lessonArtifactSummary: ReturnType<typeof buildArtifactBrowserSummary>;
  artifactCompletionSummary: ReturnType<typeof buildArtifactCompletionSummary>;
  attemptAnalytics: ReturnType<typeof buildAttemptAnalyticsSummary>;
  lessonAttemptAnalytics: ReturnType<typeof buildAttemptAnalyticsSummary>;
  transferEvidenceWithinPhase: number;
  transferLessonsCount: number;
  competencyLevels: Record<string, number>;
  weakCompetencyTracks: string[];
  reinforcementQueue: ReinforcementRecommendation[];
  phaseReinforcementQueue: ReinforcementRecommendation[];
  reviewQueue: LessonEntry[];
  navigateToEntry: (entry: LessonEntry) => void;
  selectPhase: (phaseId: string) => void;
  phaseExitStatus: ReturnType<typeof evaluatePhaseExitStatus> | null;
  phaseMilestoneStatus: ReturnType<typeof evaluatePhaseMilestoneStatus> | null;
};

export function RailPanels({
  learnerProfile,
  updateLearnerProfile,
  onResetAll,
  selectedPhase,
  selectedCourse,
  selectedLesson,
  progress,
  reviews,
  visibleLessons,
  setSelectedLessonId,
  exportArtifacts,
  recentAttempts,
  lessonArtifactSummary,
  artifactCompletionSummary,
  attemptAnalytics,
  lessonAttemptAnalytics,
  transferEvidenceWithinPhase,
  transferLessonsCount,
  competencyLevels,
  weakCompetencyTracks,
  reinforcementQueue,
  phaseReinforcementQueue,
  reviewQueue,
  navigateToEntry,
  selectPhase,
  phaseExitStatus,
  phaseMilestoneStatus,
}: RailPanelsProps) {
  const [showResetAllConfirm, setShowResetAllConfirm] = useState(false);
  const [lessonQuery, setLessonQuery] = useState("");
  const [lessonFilter, setLessonFilter] = useState<
    "all" | "pending" | "complete" | "due"
  >("all");
  const resetAllDialogRef = useFocusTrap(showResetAllConfirm);

  const filteredLessons = useMemo(() => {
    const normalizedQuery = lessonQuery.trim().toLowerCase();

    return visibleLessons.filter((lesson) => {
      const matchesQuery =
        normalizedQuery.length === 0 ||
        lesson.title.toLowerCase().includes(normalizedQuery) ||
        lesson.summary.toLowerCase().includes(normalizedQuery);

      if (!matchesQuery) return false;

      if (lessonFilter === "complete") {
        return Boolean(progress[lesson.id]);
      }

      if (lessonFilter === "pending") {
        return !progress[lesson.id];
      }

      if (lessonFilter === "due") {
        return Boolean(
          reviews[lesson.id] && isDueForReview(reviews[lesson.id]),
        );
      }

      return true;
    });
  }, [lessonFilter, lessonQuery, progress, reviews, visibleLessons]);

  useEffect(() => {
    if (!showResetAllConfirm) return;
    function onKey(e: KeyboardEvent) {
      if (e.key === "Escape") setShowResetAllConfirm(false);
    }
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [showResetAllConfirm]);

  return (
    <aside className="rail">
      <section className="panel">
        <h3>Learner profile</h3>
        <div className="profile-grid">
          <label className="profile-field">
            <span>Name</span>
            <input
              aria-label="Learner name"
              value={learnerProfile.displayName}
              onChange={(event) =>
                updateLearnerProfile({ displayName: event.target.value })
              }
              placeholder="Your name"
            />
          </label>
          <label className="profile-field">
            <span>Weekly hours</span>
            <input
              aria-label="Weekly hours"
              type="number"
              min={1}
              max={40}
              value={learnerProfile.weeklyHours}
              onChange={(event) =>
                updateLearnerProfile({
                  weeklyHours: Math.max(
                    1,
                    Number.parseInt(event.target.value || "1", 10),
                  ),
                })
              }
            />
          </label>
          <label className="profile-field">
            <span>Current goal</span>
            <input
              aria-label="Current goal"
              value={learnerProfile.goal}
              onChange={(event) =>
                updateLearnerProfile({ goal: event.target.value })
              }
              placeholder="Example: Complete Phase 1 this month"
            />
          </label>
        </div>
      </section>

      <CollapsiblePanel title="Evidence and attempts">
        <p className="panel-subtext">
          Attempts and artifacts are saved locally as evidence for mastery
          gates.
        </p>
        <div className="toolbar">
          <button
            type="button"
            className="ghost-button"
            onClick={() => exportArtifacts(selectedLesson.id)}
          >
            📄 Export lesson
          </button>
          <button
            type="button"
            className="validate-button"
            onClick={() => exportArtifacts()}
          >
            📦 Export all
          </button>
        </div>
        <div className="phase-metrics">
          <span>{recentAttempts.length} recent attempts</span>
          <span>{lessonArtifactSummary.total} lesson artifacts</span>
          <span>
            {transferEvidenceWithinPhase}/{transferLessonsCount} transfer gates
            passed
          </span>
        </div>
        <div className="phase-metrics">
          <span>{lessonArtifactSummary.counts.note} notes</span>
          <span>{lessonArtifactSummary.counts.reflection} reflections</span>
          <span>{lessonArtifactSummary.counts.transfer} transfers</span>
        </div>
        <div className="phase-metrics">
          <span>
            {artifactCompletionSummary.completionRate}% artifact coverage
          </span>
          <span>
            {artifactCompletionSummary.lessonsWithEvidence}/
            {artifactCompletionSummary.completedLessons} completed lessons with
            evidence
          </span>
          <span>
            {artifactCompletionSummary.lessonsMissingEvidence} missing evidence
          </span>
        </div>
        <div className="phase-metrics">
          <span>{attemptAnalytics.errorReductionRate}% recovery rate</span>
          <span>{attemptAnalytics.recoveredExercises} recovered checks</span>
          <span>{attemptAnalytics.unresolvedExercises} unresolved checks</span>
        </div>
        <p className="microcopy">
          This lesson: {lessonAttemptAnalytics.failedAttempts} failed attempt
          {lessonAttemptAnalytics.failedAttempts === 1 ? "" : "s"},{" "}
          {lessonAttemptAnalytics.recoveredExercises} recovered exercise
          {lessonAttemptAnalytics.recoveredExercises === 1 ? "" : "s"}.
        </p>
        {attemptAnalytics.breakdown.length > 0 ? (
          <ul className="review-queue-list">
            {attemptAnalytics.breakdown.slice(0, 3).map((entry) => (
              <li key={entry.assessmentType}>
                <div className="review-queue-item static-item">
                  <span className="review-course">{entry.assessmentType}</span>
                  <span className="review-lesson">
                    {entry.failures} failures · {entry.recoveries} recoveries
                  </span>
                  <span className="microcopy">
                    {entry.attempts} total attempts
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
        {recentAttempts.length > 0 ? (
          <ul className="review-queue-list">
            {recentAttempts.map((attempt) => (
              <li key={attempt.id}>
                <div className="review-queue-item static-item">
                  <span className="review-course">
                    {attempt.assessmentType}
                  </span>
                  <span className="review-lesson">
                    {attempt.passed ? "Passed" : "Needs work"} ·{" "}
                    {attempt.exerciseId}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <p className="microcopy">No attempts logged for this lesson yet.</p>
        )}
        {lessonArtifactSummary.recent.length > 0 ? (
          <ul className="review-queue-list">
            {lessonArtifactSummary.recent.map((artifact) => (
              <li key={artifact.id}>
                <div className="review-queue-item static-item">
                  <span className="review-course">{artifact.type}</span>
                  <span className="review-lesson">{artifact.title}</span>
                  <span className="microcopy">
                    {getArtifactPreview(artifact.content)}
                  </span>
                </div>
              </li>
            ))}
          </ul>
        ) : null}
      </CollapsiblePanel>

      <section className="panel">
        <h3>Lessons in this course</h3>
        <progress
          className="course-progress"
          max={selectedCourse.lessons.length}
          value={selectedCourse.lessons.filter((l) => progress[l.id]).length}
          aria-label="Course completion"
        />
        <div className="lesson-discovery-controls">
          <input
            className="lesson-search-input"
            type="search"
            value={lessonQuery}
            onChange={(event) => setLessonQuery(event.target.value)}
            placeholder="Search lessons by title or summary"
            aria-label="Search lessons"
          />
          <div className="lesson-filter-row" aria-label="Lesson status filter">
            <button
              type="button"
              className={`toggle-chip ${lessonFilter === "all" ? "active" : ""}`}
              onClick={() => setLessonFilter("all")}
            >
              All
            </button>
            <button
              type="button"
              className={`toggle-chip ${lessonFilter === "pending" ? "active" : ""}`}
              onClick={() => setLessonFilter("pending")}
            >
              Pending
            </button>
            <button
              type="button"
              className={`toggle-chip ${lessonFilter === "complete" ? "active" : ""}`}
              onClick={() => setLessonFilter("complete")}
            >
              Complete
            </button>
            <button
              type="button"
              className={`toggle-chip ${lessonFilter === "due" ? "active" : ""}`}
              onClick={() => setLessonFilter("due")}
            >
              Due
            </button>
          </div>
          <p className="microcopy">
            Showing {filteredLessons.length} of {visibleLessons.length} lesson
            {visibleLessons.length === 1 ? "" : "s"}.
          </p>
        </div>
        <ul className="lesson-list">
          {filteredLessons.map((lesson) => (
            <li key={lesson.id}>
              <button
                type="button"
                className={`lesson-button ${lesson.id === selectedLesson.id ? "active" : ""}`}
                onClick={() => setSelectedLessonId(lesson.id)}
              >
                <span className="lesson-kicker">{lesson.duration}</span>
                <span className="lesson-title">{lesson.title}</span>
                <div className="lesson-button-status">
                  {reviews[lesson.id] != null &&
                  isDueForReview(reviews[lesson.id]) ? (
                    <span className="due-pill">Due</span>
                  ) : null}
                  <span
                    className={`status-pill ${progress[lesson.id] ? "complete" : "pending"}`}
                  >
                    {progress[lesson.id] ? "Complete" : "Pending"}
                  </span>
                </div>
              </button>
            </li>
          ))}
        </ul>
        {filteredLessons.length === 0 ? (
          <p className="microcopy">
            No lessons match your search and filter. Try clearing one of the
            controls.
          </p>
        ) : null}
      </section>

      {reinforcementQueue.length > 0 ? (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Reinforcement focus</h3>
              <p>Due reviews prioritized by weak competency overlap.</p>
            </div>
            <span className="tag due-count">{reinforcementQueue.length}</span>
          </div>
          <ul className="review-queue-list">
            {reinforcementQueue.map((item) => (
              <li key={item.entry.lesson.id}>
                <button
                  type="button"
                  className="review-queue-item"
                  onClick={() => navigateToEntry(item.entry)}
                >
                  <span className="review-course">
                    {item.entry.course.title}
                  </span>
                  <span className="review-lesson">
                    {item.entry.lesson.title}
                  </span>
                  <span className="microcopy">
                    Focus: {item.weakTracks.map(formatTrackName).join(", ")} ·{" "}
                    {item.dueSinceDays} day
                    {item.dueSinceDays === 1 ? "" : "s"} overdue
                  </span>
                </button>
              </li>
            ))}
          </ul>
        </section>
      ) : null}

      {reviewQueue.length > 0 ? (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Due for review</h3>
              <p>Spaced repetition keeps knowledge fresh.</p>
            </div>
            <span className="tag due-count">{reviewQueue.length}</span>
          </div>
          <ul className="review-queue-list">
            {reviewQueue.slice(0, 5).map(({ phase, course, lesson }) => (
              <li key={lesson.id}>
                <button
                  type="button"
                  className="review-queue-item"
                  onClick={() => navigateToEntry({ phase, course, lesson })}
                >
                  <span className="review-course">{course.title}</span>
                  <span className="review-lesson">{lesson.title}</span>
                </button>
              </li>
            ))}
            {reviewQueue.length > 5 ? (
              <li className="review-more">
                +{reviewQueue.length - 5} more due
              </li>
            ) : null}
          </ul>
        </section>
      ) : null}

      <CollapsiblePanel title="Safe lab design">
        <div className="lab-grid">
          <article className="safety-card">
            <h4>Guardrails</h4>
            <ul className="safety-list">
              {selectedPhase.guardrails.map((item, i) => (
                <li key={i}>{item}</li>
              ))}
            </ul>
          </article>
          <article className="safety-card">
            <h4>Environment</h4>
            <p>{selectedPhase.environment}</p>
            <div className="chip-row">
              <span className="safety-tag">Resettable labs</span>
              <span className="safety-tag">Scoped permissions</span>
              <span className="safety-tag">Replayable actions</span>
            </div>
          </article>
        </div>
      </CollapsiblePanel>

      <CollapsiblePanel title="Practical outcomes">
        <div className="project-grid">
          <article className="project-card">
            <h4>Milestones</h4>
            <ul className="project-list">
              {selectedPhase.milestones.map((milestone, i) => (
                <li key={i}>{milestone}</li>
              ))}
            </ul>
          </article>
          <article className="project-card">
            <h4>Phase projects</h4>
            <ul className="deliverable-list">
              {selectedPhase.projects.map((project, i) => (
                <li key={i}>{project}</li>
              ))}
            </ul>
          </article>
        </div>
      </CollapsiblePanel>

      {selectedPhase.competencyFocus &&
      selectedPhase.competencyFocus.length > 0 ? (
        <section className="panel">
          <div className="panel-header">
            <div>
              <h3>Competency progress</h3>
              <p>Tracked against completed lessons in this phase.</p>
            </div>
          </div>
          <div className="competency-list">
            {selectedPhase.competencyFocus.map((track) => {
              const count = competencyLevels[track] ?? 0;
              const level = getMasteryLevel(count);
              const isWeak = weakCompetencyTracks.includes(track);
              return (
                <div
                  className={`competency-item${isWeak ? " competency-weak" : ""}`}
                  key={track}
                >
                  <div className="competency-row">
                    <span className="competency-track">
                      {formatTrackName(track)}
                    </span>
                    <span className={`mastery-badge mastery-${level}`}>
                      {level}
                    </span>
                    {isWeak ? (
                      <span
                        className="weak-indicator"
                        title="Needs reinforcement"
                      >
                        ↺
                      </span>
                    ) : null}
                  </div>
                  <progress
                    className="mastery-bar"
                    max={15}
                    value={count}
                    aria-label={`${formatTrackName(track)} mastery`}
                  />
                </div>
              );
            })}
          </div>
        </section>
      ) : null}

      {selectedPhase.exitStandard && phaseExitStatus ? (
        <>
          <section className="panel">
            <h3>Phase exit gates</h3>
            <p className="panel-subtext">
              {selectedPhase.exitStandard.summary}
            </p>
            <ul className="gate-list">
              {phaseExitStatus.gates.map((gate) => (
                <li
                  key={`${gate.competency}-${gate.description}`}
                  className={`gate-item ${gate.passed ? "gate-passed" : "gate-pending"}`}
                >
                  <span className="gate-icon" aria-hidden="true">
                    {gate.passed ? "✓" : "○"}
                  </span>
                  <span className="gate-description">
                    {gate.description}
                    <span className="gate-level">{gate.requiredLevel}</span>
                  </span>
                </li>
              ))}
              <li
                className={`gate-item ${phaseExitStatus.transferGatePassed ? "gate-passed" : "gate-pending"}`}
              >
                <span className="gate-icon" aria-hidden="true">
                  {phaseExitStatus.transferGatePassed ? "✓" : "○"}
                </span>
                <span className="gate-description">
                  Pass at least one transfer challenge in this phase
                  <span className="gate-level">
                    {transferEvidenceWithinPhase}/{transferLessonsCount}{" "}
                    complete
                  </span>
                </span>
              </li>
              <li
                className={`gate-item ${phaseMilestoneStatus?.reinforcementGatePassed ? "gate-passed" : "gate-pending"}`}
              >
                <span className="gate-icon" aria-hidden="true">
                  {phaseMilestoneStatus?.reinforcementGatePassed ? "✓" : "○"}
                </span>
                <span className="gate-description">
                  Clear overdue reinforcement work for weak competencies
                  <span className="gate-level">
                    {phaseReinforcementQueue.length === 0
                      ? "No overdue reinforcement"
                      : `${phaseReinforcementQueue.length} still due`}
                  </span>
                </span>
              </li>
            </ul>
          </section>
          {!phaseMilestoneStatus?.allPassed ? (
            <section className="panel">
              <h3>Before you advance</h3>
              <p className="panel-subtext">
                Advancement now depends on competency, transfer, and
                reinforcement readiness together.
              </p>
              <ul className="review-queue-list">
                {phaseMilestoneStatus?.blockedReasons.map((reason) => (
                  <li key={reason}>
                    <div className="review-queue-item static-item">
                      <span className="review-lesson">{reason}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}
          {phaseMilestoneStatus?.allPassed && phaseExitStatus.nextPhase ? (
            <section className="panel phase-advance-panel">
              <div className="phase-advance-content">
                <svg
                  width="20"
                  height="20"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                  className="phase-advance-icon"
                >
                  <path
                    d="M4 2h8v3a4 4 0 0 1-8 0V2z"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    fill="none"
                  />
                  <path
                    d="M8 9v2M6 14h4M8 11a2 2 0 0 0 2-2"
                    stroke="currentColor"
                    strokeWidth="1.2"
                    strokeLinecap="round"
                  />
                  <path
                    d="M3 2h10"
                    stroke="currentColor"
                    strokeWidth="1.3"
                    strokeLinecap="round"
                  />
                </svg>
                <div>
                  <h3>Phase complete!</h3>
                  <p>
                    All milestone gates cleared. You are ready to advance to{" "}
                    <strong>{phaseExitStatus.nextPhase.title}</strong>.
                  </p>
                  <button
                    type="button"
                    className="validate-button phase-advance-button"
                    onClick={() => selectPhase(phaseExitStatus.nextPhase!.id)}
                  >
                    Start {phaseExitStatus.nextPhase.title} →
                  </button>
                </div>
              </div>
            </section>
          ) : null}
        </>
      ) : null}

      <CollapsiblePanel title="Danger zone" defaultOpen={false}>
        <p className="panel-subtext">
          Permanently remove all saved progress, notes, reflections, and
          artifacts from this browser.
        </p>
        <button
          type="button"
          className="confirm-destructive rail-danger-full"
          onClick={() => setShowResetAllConfirm(true)}
        >
          Reset all progress
        </button>
      </CollapsiblePanel>

      {showResetAllConfirm ? (
        <div
          className="confirm-backdrop"
          onClick={() => setShowResetAllConfirm(false)}
        >
          <div
            ref={resetAllDialogRef}
            className="confirm-dialog"
            role="dialog"
            aria-modal="true"
            aria-label="Confirm reset all progress"
            onClick={(e) => e.stopPropagation()}
          >
            <h4>Erase everything?</h4>
            <p>
              This will permanently delete all lesson progress, notes,
              reflections, artifacts, and lab data from this browser. This
              cannot be undone.
            </p>
            <div className="confirm-actions">
              <button
                type="button"
                className="ghost-button"
                onClick={() => setShowResetAllConfirm(false)}
              >
                Cancel
              </button>
              <button
                type="button"
                className="confirm-destructive"
                onClick={() => {
                  onResetAll();
                  setShowResetAllConfirm(false);
                }}
              >
                Erase all data
              </button>
            </div>
          </div>
        </div>
      ) : null}
    </aside>
  );
}
