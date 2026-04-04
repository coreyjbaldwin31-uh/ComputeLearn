import Link from "next/link";
import { curriculum } from "@/data/curriculum";

export default function ModulesPage() {
  return (
    <div className="academy-page">
      <header className="academy-page-header">
        <p className="academy-kicker">Modules</p>
        <h1>Module directory</h1>
        <p className="academy-desc">
          Modules represent the instructional blocks inside each phase. Open any
          module to continue into its lessons.
        </p>
      </header>

      <div className="academy-module-grid">
        {curriculum.phases.flatMap((phase) =>
          phase.courses.map((course) => (
            <div key={course.id} className="academy-module-card">
              <p className="academy-module-card-phase">{phase.title}</p>
              <h2>{course.title}</h2>
              <p>{course.outcome}</p>
              <div className="academy-module-card-footer">
                <span>{course.lessons.length} lessons</span>
                <Link href={`/modules/${course.id}`}>Open module</Link>
              </div>
            </div>
          )),
        )}
      </div>
    </div>
  );
}
