import Link from "next/link";
import { curriculum } from "@/data/curriculum";
import { getLessonRecords } from "@/lib/learning-catalog";

export default function LessonsPage() {
  const lessonRecords = getLessonRecords(curriculum);

  return (
    <div className="academy-page">
      <header className="academy-page-header">
        <p className="academy-kicker">Lessons</p>
        <h1>Lesson library</h1>
        <p className="academy-desc">
          Enter any lesson directly through a focused learning route with clear
          context and progression.
        </p>
      </header>

      <div className="academy-library-grid">
        {lessonRecords.map((record) => (
          <div key={record.lesson.id} className="academy-library-item">
            <p className="academy-library-tag">
              {record.phase.title} · {record.course.title}
            </p>
            <h2>{record.lesson.title}</h2>
            <p>{record.lesson.summary}</p>
            <Link
              href={`/lessons/${record.lesson.id}`}
              className="academy-link"
            >
              Open lesson
            </Link>
          </div>
        ))}
      </div>
    </div>
  );
}
