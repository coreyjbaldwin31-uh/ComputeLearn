import Link from "next/link";
import { curriculum } from "@/data/curriculum";

export default function CoursesPage() {
  return (
    <div className="academy-page">
      <header className="academy-page-header">
        <p className="academy-kicker">Courses</p>
        <h1>Course catalog</h1>
        <p className="academy-desc">
          All courses organized by phase. Each course contains a sequence of
          lessons, exercises, and validation checkpoints.
        </p>
      </header>

      {curriculum.phases.map((phase) => (
        <section key={phase.id} className="academy-phase-group">
          <div className="academy-phase-group-head">
            <h2>{phase.title}</h2>
            <span>{phase.level}</span>
          </div>
          <ul className="academy-item-list">
            {phase.courses.map((course) => (
              <li key={course.id}>
                <Link
                  href={`/courses/${course.id}`}
                  className="academy-item-row"
                >
                  <div>
                    <p className="academy-item-title">{course.title}</p>
                    <p className="academy-item-sub">{course.focus}</p>
                  </div>
                  <span className="academy-item-meta">
                    {course.lessons.length} lessons
                  </span>
                </Link>
              </li>
            ))}
          </ul>
        </section>
      ))}
    </div>
  );
}
