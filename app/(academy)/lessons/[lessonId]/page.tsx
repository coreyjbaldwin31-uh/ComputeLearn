import { notFound } from "next/navigation";
import Link from "next/link";
import { AcademyBreadcrumbs } from "@/components/academy-breadcrumbs";
import { LessonFlow } from "@/components/lesson-flow";
import { curriculum } from "@/data/curriculum";
import { findLessonRecord, getLessonRecords } from "@/lib/learning-catalog";

type LessonPageProps = {
  params: Promise<{ lessonId: string }>;
};

export default async function LessonPage({ params }: LessonPageProps) {
  const { lessonId } = await params;
  const record = findLessonRecord(curriculum, lessonId);

  if (!record) {
    notFound();
  }

  const { lesson, course, phase } = record;
  const lessonRecords = getLessonRecords(curriculum);
  const lessonIndex = lessonRecords.findIndex(
    (item) => item.lesson.id === lesson.id,
  );
  const prevLesson = lessonIndex > 0 ? lessonRecords[lessonIndex - 1] : null;
  const nextLesson =
    lessonIndex >= 0 && lessonIndex < lessonRecords.length - 1
      ? lessonRecords[lessonIndex + 1]
      : null;

  return (
    <div className="academy-page">
      <AcademyBreadcrumbs
        items={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/courses", label: "Courses" },
          { href: `/courses/${course.id}`, label: course.title },
          { label: lesson.title },
        ]}
      />

      <header className="academy-page-header">
        <p className="academy-kicker">
          {phase.title} · {course.title}
        </p>
        <h1>{lesson.title}</h1>
        <p className="academy-desc">{lesson.summary}</p>
        <div className="academy-lesson-meta">
          <span className="academy-lesson-meta-item">{lesson.duration}</span>
          <span className="academy-lesson-meta-item">{lesson.difficulty}</span>
          {lesson.scaffoldingLevel && (
            <span className="academy-lesson-meta-item academy-lesson-meta-scaffolding">
              {lesson.scaffoldingLevel === "step-by-step"
                ? "Guided"
                : lesson.scaffoldingLevel === "goal-driven"
                  ? "Goal-driven"
                  : "Independent"}
            </span>
          )}
        </div>
        {lesson.competencies && lesson.competencies.length > 0 && (
          <div className="academy-competency-badges">
            {lesson.competencies.map((c) => (
              <span key={c.track} className="academy-competency-badge">
                {c.track.replace(/([A-Z])/g, " $1").trim()} → {c.targetLevel}
              </span>
            ))}
          </div>
        )}
      </header>

      {/* Lesson objective */}
      <div className="lf-objective">
        <strong>Objective:</strong> {lesson.objective}
      </div>

      {/* New lesson flow: Learn → Practice → Apply → Reflect */}
      <LessonFlow lesson={lesson} />

      <nav className="academy-lesson-nav" aria-label="Lesson navigation">
        <div className="academy-lesson-nav-block">
          <span className="academy-lesson-nav-label">Previous</span>
          {prevLesson ? (
            <Link
              href={`/lessons/${prevLesson.lesson.id}`}
              className="academy-lesson-nav-link"
            >
              &larr; {prevLesson.lesson.title}
            </Link>
          ) : (
            <span className="academy-lesson-nav-empty">
              Start of learning path
            </span>
          )}
        </div>
        <div className="academy-lesson-nav-block academy-lesson-nav-block--next">
          <span className="academy-lesson-nav-label">Next</span>
          {nextLesson ? (
            <Link
              href={`/lessons/${nextLesson.lesson.id}`}
              className="academy-lesson-nav-link"
            >
              {nextLesson.lesson.title} &rarr;
            </Link>
          ) : (
            <span className="academy-lesson-nav-empty">
              End of learning path
            </span>
          )}
        </div>
      </nav>
    </div>
  );
}
