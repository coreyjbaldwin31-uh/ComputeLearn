import Link from "next/link";
import { notFound } from "next/navigation";
import { AcademyBreadcrumbs } from "@/components/academy-breadcrumbs";
import { curriculum } from "@/data/curriculum";
import { findCourseRecord } from "@/lib/learning-catalog";

type CoursePageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function CourseDetailPage({ params }: CoursePageProps) {
  const { courseId } = await params;
  const record = findCourseRecord(curriculum, courseId);

  if (!record) {
    notFound();
  }

  const { phase, course } = record;

  return (
    <div className="academy-page">
      <AcademyBreadcrumbs
        items={[
          { href: "/dashboard", label: "Dashboard" },
          { href: "/courses", label: "Courses" },
          { label: course.title },
        ]}
      />

      <header className="academy-page-header">
        <p className="academy-kicker">{phase.title}</p>
        <h1>{course.title}</h1>
        <p className="academy-desc">{course.outcome}</p>
      </header>

      <section className="academy-outline">
        <h2>Lesson sequence</h2>
        <ol>
          {course.lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link
                href={`/lessons/${lesson.id}`}
                className="academy-outline-item"
              >
                <span className="academy-outline-title">{lesson.title}</span>
                <span className="academy-outline-meta">
                  {lesson.duration} · {lesson.difficulty}
                </span>
              </Link>
            </li>
          ))}
        </ol>
      </section>
    </div>
  );
}
