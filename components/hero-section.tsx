import type { Lesson } from "@/data/curriculum";

type LessonEntry = {
  phase: { id: string };
  course: { id: string };
  lesson: Lesson;
};

type HeroSectionProps = {
  productTitle: string;
  productVision: string;
  phasesCount: number;
  allLessonsCount: number;
  percentComplete: number;
  activityStreak: number;
  isCurriculumComplete: boolean;
  isNewUser: boolean;
  nextUnfinishedEntry: LessonEntry | undefined;
  onBeginLesson: () => void;
};

export function HeroSection({
  productTitle,
  productVision,
  phasesCount,
  allLessonsCount,
  percentComplete,
  activityStreak,
  isCurriculumComplete,
  isNewUser,
  nextUnfinishedEntry,
  onBeginLesson,
}: HeroSectionProps) {
  /* ── Returning user: compact welcome-back bar (Coursera/Khan pattern) ── */
  if (!isNewUser && !isCurriculumComplete) {
    return (
      <section className="hero hero--compact">
        <div className="hero-compact-inner">
          <div className="hero-compact-left">
            <span className="eyebrow eyebrow--small">Welcome back</span>
            <h2 className="hero-compact-title">{productTitle}</h2>
            <p className="hero-compact-vision">{productVision}</p>
          </div>
          <div className="hero-compact-right">
            <div className="hero-compact-stats">
              <div className="hero-compact-stat">
                <span className="hero-compact-stat-value">
                  {percentComplete}%
                </span>
                <span className="hero-compact-stat-label">complete</span>
              </div>
              {activityStreak > 0 && (
                <div className="hero-compact-stat hero-compact-stat--streak">
                  <span className="hero-compact-stat-value">
                    {activityStreak}d
                  </span>
                  <span className="hero-compact-stat-label">streak</span>
                </div>
              )}
              <div className="hero-compact-stat">
                <span className="hero-compact-stat-value">{phasesCount}</span>
                <span className="hero-compact-stat-label">phases</span>
              </div>
            </div>
            {nextUnfinishedEntry && (
              <button
                type="button"
                className="hero-compact-cta"
                onClick={onBeginLesson}
              >
                Continue: {nextUnfinishedEntry.lesson.title}
                <svg
                  width="14"
                  height="14"
                  viewBox="0 0 14 14"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M5 3l4 4-4 4"
                    stroke="currentColor"
                    strokeWidth="1.8"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
              </button>
            )}
          </div>
        </div>
      </section>
    );
  }

  /* ── Completed curriculum: celebration banner ── */
  if (isCurriculumComplete) {
    return (
      <section className="hero hero--compact hero--complete">
        <div className="hero-compact-inner">
          <div className="hero-compact-left">
            <h2 className="hero-compact-title">Curriculum complete!</h2>
            <p className="hero-compact-vision">
              You have finished all {allLessonsCount} lessons across{" "}
              {phasesCount} phases. Revisit any lesson to review or explore
              independent labs.
            </p>
          </div>
          <div className="hero-compact-right">
            <div className="hero-compact-stats">
              <div className="hero-compact-stat">
                <span className="hero-compact-stat-value">100%</span>
                <span className="hero-compact-stat-label">complete</span>
              </div>
              {activityStreak > 0 && (
                <div className="hero-compact-stat hero-compact-stat--streak">
                  <span className="hero-compact-stat-value">
                    {activityStreak}d
                  </span>
                  <span className="hero-compact-stat-label">streak</span>
                </div>
              )}
            </div>
          </div>
        </div>
      </section>
    );
  }

  /* ── New user: full onboarding hero ── */
  return (
    <section className="hero">
      <span className="eyebrow">Interactive software engineering training</span>
      <h1>{productTitle}</h1>
      <p className="hero-vision">{productVision}</p>

      <div className="consumer-cta-row" aria-label="Consumer value highlights">
        <span className="plan-chip">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M7 1v12M1 7h12"
              stroke="currentColor"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          Self-paced curriculum
        </span>
        <span className="plan-chip">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <rect
              x="1.5"
              y="3"
              width="11"
              height="8"
              rx="1.5"
              stroke="currentColor"
              strokeWidth="1.3"
              fill="none"
            />
            <path
              d="M5 7l1.5 1.5L9 6"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Hands-on validation labs
        </span>
        <span className="plan-chip">
          <svg
            width="14"
            height="14"
            viewBox="0 0 14 14"
            fill="none"
            aria-hidden="true"
          >
            <path
              d="M2 10l3-6 3 4 4-7"
              stroke="currentColor"
              strokeWidth="1.3"
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          </svg>
          Exportable learning artifacts
        </span>
      </div>

      <div className="hero-onboarding">
        <div className="hero-onboarding-card">
          <h3>Start your learning journey</h3>
          <p>
            {phasesCount} phases · {allLessonsCount} lessons · Progress saves
            automatically
          </p>
          <button
            type="button"
            className="hero-onboarding-cta"
            onClick={onBeginLesson}
          >
            Begin first lesson
            <svg
              width="16"
              height="16"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M6 3l5 5-5 5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
          </button>
        </div>
        <div className="hero-onboarding-features">
          <div className="hero-feature-item">
            <span className="hero-feature-num">1</span>
            <div>
              <strong>Read &amp; understand</strong>
              <p>Clear explanations with operational focus</p>
            </div>
          </div>
          <div className="hero-feature-item">
            <span className="hero-feature-num">2</span>
            <div>
              <strong>Practice &amp; validate</strong>
              <p>Hands-on exercises with instant feedback</p>
            </div>
          </div>
          <div className="hero-feature-item">
            <span className="hero-feature-num">3</span>
            <div>
              <strong>Retain &amp; transfer</strong>
              <p>Notes, reflections, and portfolio artifacts</p>
            </div>
          </div>
        </div>
      </div>

      <div
        className="trust-strip"
        role="note"
        aria-label="Trust and reliability"
      >
        <span>Live validation feedback</span>
        <span>Offline-first progress persistence</span>
        <span>Production-style transfer tasks</span>
      </div>
    </section>
  );
}
