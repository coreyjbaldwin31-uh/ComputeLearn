import Link from "next/link";
import { curriculum } from "@/data/curriculum";
import { getAssignments } from "@/lib/learning-catalog";

export default function AssignmentsPage() {
  const assignments = getAssignments(curriculum);

  return (
    <div className="academy-page">
      <header className="academy-page-header">
        <p className="academy-kicker">Assignments</p>
        <h1>Transfer assignments</h1>
        <p className="academy-desc">
          Applied tasks that validate independent reasoning beyond guided lesson
          exercises.
        </p>
      </header>

      <div className="academy-assignment-grid">
        {assignments.map((assignment) => (
          <div key={assignment.id} className="academy-assignment-item">
            <p className="academy-assignment-tag">
              {assignment.phaseTitle} · {assignment.courseTitle}
            </p>
            <h2>{assignment.title}</h2>
            <p>{assignment.prompt}</p>
            <Link
              href={`/lessons/${assignment.lessonId}`}
              className="academy-link"
            >
              Open source lesson
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
