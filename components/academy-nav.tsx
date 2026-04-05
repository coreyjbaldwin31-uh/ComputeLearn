"use client";

import { useSession } from "next-auth/react";
import Link from "next/link";
import { usePathname } from "next/navigation";

const items = [
  { href: "/dashboard", label: "Dashboard" },
  { href: "/courses", label: "Courses" },
  { href: "/lessons", label: "Lessons" },
  { href: "/assignments", label: "Assignments" },
  { href: "/progress", label: "Progress" },
];

export function AcademyNav() {
  const pathname = usePathname();
  const { data: session } = useSession();

  const role = session?.user?.role;
  const showInstructor = role === "INSTRUCTOR" || role === "TA";

  return (
    <nav className="academy-nav-section" aria-label="Primary">
      <p className="academy-nav-label">Navigation</p>
      <ul className="academy-nav-list">
        {items.map((item) => {
          const active =
            pathname === item.href ||
            (item.href !== "/dashboard" && pathname.startsWith(item.href));
          return (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`academy-nav-item${active ? " academy-nav-item--active" : ""}`}
                aria-current={active ? "page" : undefined}
              >
                {item.label}
              </Link>
            </li>
          );
        })}
        {showInstructor && (
          <>
            <li>
              <Link
                href="/instructor"
                className={`academy-nav-item${pathname === "/instructor" ? " academy-nav-item--active" : ""}`}
                aria-current={pathname === "/instructor" ? "page" : undefined}
              >
                Instructor
              </Link>
            </li>
            <li>
              <Link
                href="/instructor/submissions"
                className={`academy-nav-item${pathname.startsWith("/instructor/submissions") ? " academy-nav-item--active" : ""}`}
                aria-current={
                  pathname.startsWith("/instructor/submissions")
                    ? "page"
                    : undefined
                }
              >
                Submissions
              </Link>
            </li>
            <li>
              <Link
                href="/instructor/gradebook"
                className={`academy-nav-item${pathname.startsWith("/instructor/gradebook") ? " academy-nav-item--active" : ""}`}
                aria-current={
                  pathname.startsWith("/instructor/gradebook")
                    ? "page"
                    : undefined
                }
              >
                Gradebook
              </Link>
            </li>
          </>
        )}
      </ul>
    </nav>
  );
}
