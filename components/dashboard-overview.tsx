'use client';

import Link from 'next/link';
import { curriculum } from '@/data/curriculum';
import { useLocalStorageState } from '@/components/hooks/use-local-storage-state';

export function DashboardOverview() {
  const [progress] = useLocalStorageState<Record<string, true>>(
    'computelearn-progress',
    {},
  );

  const phases = curriculum.phases;

  // Count totals per phase and overall
  const phaseStats = phases.map((phase) => {
    let total = 0;
    let completed = 0;
    for (const course of phase.courses) {
      for (const lesson of course.lessons) {
        total++;
        if (progress[lesson.id]) completed++;
      }
    }
    return { phase, total, completed };
  });

  const totalLessons = phaseStats.reduce((s, p) => s + p.total, 0);
  const completedLessons = phaseStats.reduce((s, p) => s + p.completed, 0);
  const percentComplete = totalLessons
    ? Math.round((completedLessons / totalLessons) * 100)
    : 0;
  const phasesCompleted = phaseStats.filter(
    (p) => p.total > 0 && p.completed === p.total,
  ).length;

  // Find next uncompleted lesson
  let nextLesson: { id: string; title: string } | null = null;
  let nextPhaseTitle = '';
  let nextCourseTitle = '';
  for (const phase of phases) {
    for (const course of phase.courses) {
      for (const lesson of course.lessons) {
        if (!progress[lesson.id]) {
          nextLesson = lesson;
          nextPhaseTitle = phase.title;
          nextCourseTitle = course.title;
          break;
        }
      }
      if (nextLesson) break;
    }
    if (nextLesson) break;
  }

  return (
    <div className="do-overview">
      {/* Progress summary cards */}
      <div className="do-stats-grid">
        <div className="do-stat-card do-stat-card--primary">
          <span className="do-stat-value">{percentComplete}%</span>
          <span className="do-stat-label">Overall Progress</span>
          <div
            className="do-progress-bar"
            role="progressbar"
            aria-valuenow={percentComplete}
            aria-valuemin={0}
            aria-valuemax={100}
            aria-label="Overall progress"
          >
            <div
              className="do-progress-fill"
              style={{ width: `${percentComplete}%` }}
            />
          </div>
        </div>
        <div className="do-stat-card">
          <span className="do-stat-value">{completedLessons}</span>
          <span className="do-stat-label">Lessons Completed</span>
        </div>
        <div className="do-stat-card">
          <span className="do-stat-value">{totalLessons}</span>
          <span className="do-stat-label">Total Lessons</span>
        </div>
        <div className="do-stat-card">
          <span className="do-stat-value">{phasesCompleted}</span>
          <span className="do-stat-label">Phases Completed</span>
        </div>
      </div>

      {/* Phase progress breakdown */}
      <section className="do-phases" aria-label="Phase progress">
        <h2>Your Learning Path</h2>
        {phaseStats.map(({ phase, total, completed }) => {
          const pct = total ? Math.round((completed / total) * 100) : 0;
          return (
            <div key={phase.id} className="do-phase-row">
              <div className="do-phase-info">
                <h3>{phase.title}</h3>
                <span className="do-phase-detail">
                  {completed} / {total} lessons
                </span>
              </div>
              <div
                className="do-phase-bar"
                role="progressbar"
                aria-valuenow={pct}
                aria-valuemin={0}
                aria-valuemax={100}
                aria-label={`${phase.title} progress`}
              >
                <div
                  className="do-phase-fill"
                  style={{ width: `${pct}%` }}
                />
              </div>
              <span className="do-phase-pct">{pct}%</span>
            </div>
          );
        })}
      </section>

      {/* Continue learning CTA */}
      {nextLesson && (
        <section className="do-continue" aria-label="Continue learning">
          <h2>Continue Learning</h2>
          <Link
            href={`/lessons/${nextLesson.id}`}
            className="do-continue-card"
          >
            <span className="do-continue-title">{nextLesson.title}</span>
            <span className="do-continue-meta">
              {nextPhaseTitle} &middot; {nextCourseTitle}
            </span>
            <span className="do-continue-action">Continue &rarr;</span>
          </Link>
        </section>
      )}
    </div>
  );
}
