"use client";

import { useLocalStorageState } from "@/components/hooks/use-local-storage-state";
import { curriculum } from "@/data/curriculum";
import Link from "next/link";
import styles from "./dashboard-overview.module.css";

export function DashboardOverview() {
  const [progress] = useLocalStorageState<Record<string, true>>(
    "computelearn-progress",
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
  let nextPhaseTitle = "";
  let nextCourseTitle = "";
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
    <div className={styles.overview}>
      {/* Progress summary cards */}
      <div className={styles.statsGrid}>
        <div className={`${styles.statCard} ${styles.statCardPrimary}`}>
          <span className={styles.statValue}>{percentComplete}%</span>
          <span className={styles.statLabel}>Overall Progress</span>
          <progress
            className={styles.progressBar}
            max={100}
            value={percentComplete}
            aria-label="Overall progress"
          />
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{completedLessons}</span>
          <span className={styles.statLabel}>Lessons Completed</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalLessons}</span>
          <span className={styles.statLabel}>Total Lessons</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{phasesCompleted}</span>
          <span className={styles.statLabel}>Phases Completed</span>
        </div>
      </div>

      {/* Phase progress breakdown */}
      <section className={styles.phases} aria-label="Phase progress">
        <h2 className={styles.sectionTitle}>Your Learning Path</h2>
        {phaseStats.map(({ phase, total, completed }) => {
          const pct = total ? Math.round((completed / total) * 100) : 0;
          return (
            <div key={phase.id} className={styles.phaseRow}>
              <div className={styles.phaseInfo}>
                <h3 className={styles.phaseHeading}>{phase.title}</h3>
                <span className={styles.phaseDetail}>
                  {completed} / {total} lessons
                </span>
              </div>
              <progress
                className={styles.phaseBar}
                max={100}
                value={pct}
                aria-label={`${phase.title} progress`}
              />
              <span className={styles.phasePct}>{pct}%</span>
            </div>
          );
        })}
      </section>

      {/* Continue learning CTA */}
      {nextLesson && (
        <section
          className={styles.continueSection}
          aria-label="Continue learning"
        >
          <h2 className={styles.sectionTitle}>Continue Learning</h2>
          <Link
            href={`/lessons/${nextLesson.id}`}
            className={styles.continueCard}
          >
            <span className={styles.continueTitle}>{nextLesson.title}</span>
            <span className={styles.continueMeta}>
              {nextPhaseTitle} &middot; {nextCourseTitle}
            </span>
            <span className={styles.continueAction}>Continue &rarr;</span>
          </Link>
        </section>
      )}
    </div>
  );
}
