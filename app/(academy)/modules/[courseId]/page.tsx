import Link from "next/link";
import { notFound } from "next/navigation";
import { AcademyBreadcrumbs } from "@/components/academy-breadcrumbs";
import { curriculum } from "@/data/curriculum";
import { findCourseRecord } from "@/lib/learning-catalog";

type ModulePageProps = {
  params: Promise<{ courseId: string }>;
};

export default async function ModuleDetailPage({ params }: ModulePageProps) {
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
          { href: `/courses/${course.id}`, label: course.title },
          { label: "Module" },
        ]}
      />

      <header className="academy-page-header">
        <p className="academy-kicker">{phase.title}</p>
        <h1>{course.title}</h1>
        <p className="academy-desc">{course.focus}</p>
      </header>

      <section className="academy-outline">
        <h2>Lesson path</h2>
        <ol>
          {course.lessons.map((lesson) => (
            <li key={lesson.id}>
              <Link
                href={`/lessons/${lesson.id}`}
                className="academy-outline-item"
              >
                <span className="academy-outline-title">{lesson.title}</span>
                <span className="academy-outline-meta">{lesson.duration}</span>
              </Link>
            </li>
          ))}
        </ol>
      </section>

      <Link href={`/courses/${course.id}`} className="academy-link">
        Back to course overview
      </Link>
    </div>
  );
}
