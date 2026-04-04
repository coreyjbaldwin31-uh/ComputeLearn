import Link from "next/link";
import { curriculum } from "@/data/curriculum";
import { getAssignments, getLessonRecords } from "@/lib/learning-catalog";
import { LearnerDashboard } from "@/components/learner-dashboard";

export default function DashboardPage() {
  const lessonRecords = getLessonRecords(curriculum);
  const assignments = getAssignments(curriculum);
  const totalCourses = curriculum.phases.reduce(
    (sum, phase) => sum + phase.courses.length,
    0,
  );
  const firstLesson = lessonRecords[0];

  return (
    <div className="academy-page">
      <header className="academy-page-header">
        <p className="academy-kicker">Dashboard</p>
        <h1>Welcome to ComputeLearn</h1>
        <p className="academy-desc">
          Structured progression from computer fundamentals to professional
          engineering workflows. Each phase builds on the previous one.
        </p>
      </header>

      {/* Interactive learner dashboard */}
      <LearnerDashboard />

      <div className="academy-two-col">
        <div className="academy-col-block">
          <h2>Start learning</h2>
          <p>
            Begin with the first phase and work through each course
            sequentially. Every lesson includes guided demos, exercises, and
            validation checks.
          </p>
          {firstLesson && (
            <Link
              href={`/lessons/${firstLesson.lesson.id}`}
              className="academy-link"
            >
              Open first lesson
            </Link>
          )}
        </div>
        <div className="academy-col-block">
          <h2>Transfer assignments</h2>
          <p>
            Independent tasks that validate your ability to apply concepts
            outside guided exercises. Track and review your submissions.
          </p>
          <Link href="/assignments" className="academy-link">
            View assignments
          </Link>
        </div>
      </div>

      <section className="academy-section">
        <h2 className="academy-section-title">Program overview</h2>
        <div className="academy-stats">
          <div className="academy-stat">
            <p className="academy-stat-value">{curriculum.phases.length}</p>
            <p className="academy-stat-label">Phases</p>
          </div>
          <div className="academy-stat">
            <p className="academy-stat-value">{totalCourses}</p>
            <p className="academy-stat-label">Courses</p>
          </div>
          <div className="academy-stat">
            <p className="academy-stat-value">{lessonRecords.length}</p>
            <p className="academy-stat-label">Lessons</p>
          </div>
          <div className="academy-stat">
            <p className="academy-stat-value">{assignments.length}</p>
            <p className="academy-stat-label">Assignments</p>
          </div>
        </div>
      </section>
    </div>
  );
}
