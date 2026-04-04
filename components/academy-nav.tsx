"use client";

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
      </ul>
    </nav>
  );
}
