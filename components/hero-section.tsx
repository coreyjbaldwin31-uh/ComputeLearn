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
  selectedLessonTitle: string;
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
  selectedLessonTitle,
  onBeginLesson,
}: HeroSectionProps) {
  return (
    <section className="hero">
      <span className="eyebrow">
        Interactive software engineering training
      </span>
      <h1>{productTitle}</h1>
      <p>{productVision}</p>

      {isCurriculumComplete ? (
        <div className="welcome-banner completion-banner">
          <h3>🎓 Curriculum complete!</h3>
          <p>
            You have finished all {allLessonsCount} lessons across{" "}
            {phasesCount} phases. Revisit any lesson to strengthen weak
            competencies, or explore independent labs to sharpen your skills
            further.
          </p>
        </div>
      ) : isNewUser ? (
        <div className="welcome-banner">
          <h3>Welcome — start your first lesson</h3>
          <p>
            Pick a phase from the sidebar, read the lesson, then work through
            the exercises and validation checks below. Your progress saves
            automatically.
          </p>
          <button
            type="button"
            className="welcome-cta"
            onClick={onBeginLesson}
          >
            Begin lesson:{" "}
            {nextUnfinishedEntry?.lesson.title ?? selectedLessonTitle} →
          </button>
        </div>
      ) : (
        <div className="hero-grid">
          <div className="stats stats--four-column">
            <article className="stat-card">
              <span>Progression model</span>
              <div className="stat-value">{phasesCount} phases</div>
              <p>
                Computer mastery, engineering foundations, and modern AI-assisted
                delivery.
              </p>
            </article>
            <article className="stat-card">
              <span>Tracked completion</span>
              <div className="stat-value">{percentComplete}%</div>
              <p>
                Local progress persistence across lessons, notes, and validation
                exercises.
              </p>
            </article>
            <article className="stat-card">
              <span>Core promise</span>
              <div className="stat-value">Learn by doing</div>
              <p>
                Operational confidence first, programming understanding second,
                disciplined engineering execution third.
              </p>
            </article>
            <article className="stat-card">
              <span>Activity streak</span>
              <div className="stat-value streak-value">
                {activityStreak > 0 ? `${activityStreak}d` : "—"}
              </div>
              <p>
                {activityStreak > 1
                  ? `${activityStreak} consecutive days of activity.`
                  : activityStreak === 1
                    ? "Active today. Keep building the habit."
                    : "Complete your first lesson to start a streak."}
              </p>
            </article>
          </div>
          <article className="timeline-card">
            <h4>How the system trains</h4>
            <ul className="retention-list">
              <li>Explain the concept with operational clarity.</li>
              <li>Demonstrate the workflow in a guided environment.</li>
              <li>Require hands-on action and validate the response.</li>
              <li>Retain notes, outputs, and completion state for review.</li>
            </ul>
          </article>
        </div>
      )}
    </section>
  );
}
