import { curriculum } from "@/data/curriculum";
import Link from "next/link";
import { AcademyNav } from "./academy-nav";
import { SkipLink } from "./skip-link";

export function AcademyShell({ children }: { children: React.ReactNode }) {
  return (
    <div className="academy-app">
      <SkipLink href="#main-content">Skip to main content</SkipLink>
      <aside className="academy-sidebar">
        <Link href="/dashboard" className="academy-sidebar-brand">
          <span className="academy-brand-mark">CL</span>
          <div>
            <p className="academy-brand-name">ComputeLearn</p>
            <p className="academy-brand-label">Engineering Track</p>
          </div>
        </Link>

        <AcademyNav />

        <nav className="academy-sidebar-phases" aria-label="Program phases">
          <p className="academy-nav-label">Program</p>
          <ol className="academy-phase-list">
            {curriculum.phases.map((phase, index) => (
              <li key={phase.id}>
                <Link href="/courses" className="academy-phase-link">
                  <span className="academy-phase-num">{index + 1}</span>
                  <span>
                    <span className="academy-phase-name">{phase.title}</span>
                    <span className="academy-phase-dur">{phase.duration}</span>
                  </span>
                </Link>
              </li>
            ))}
          </ol>
        </nav>
      </aside>

      <div className="academy-content">
        <main id="main-content" className="academy-main">
          {children}
        </main>
      </div>
    </div>
  );
}
