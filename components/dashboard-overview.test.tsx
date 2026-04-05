import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";

/* ---- mock next/link ---- */
vi.mock("next/link", () => ({
  __esModule: true,
  default: ({
    children,
    href,
    className,
  }: {
    children: React.ReactNode;
    href: string;
    className?: string;
  }) => (
    <a href={href} className={className}>
      {children}
    </a>
  ),
}));

/* ---- mock useLocalStorageState ---- */
const mockUseLocalStorageState = vi.fn();
vi.mock("./hooks/use-local-storage-state", () => ({
  useLocalStorageState: (...args: unknown[]) =>
    mockUseLocalStorageState(...args),
}));

/* ---- mock curriculum ---- */
vi.mock("@/data/curriculum", () => ({
  curriculum: {
    phases: [
      {
        id: "p1",
        title: "Phase 1: Fundamentals",
        courses: [
          {
            id: "c1",
            title: "Basics",
            lessons: [
              { id: "l1", title: "Intro to Computing" },
              { id: "l2", title: "Binary Numbers" },
            ],
          },
        ],
      },
      {
        id: "p2",
        title: "Phase 2: Building",
        courses: [
          {
            id: "c2",
            title: "Tools",
            lessons: [{ id: "l3", title: "Version Control" }],
          },
        ],
      },
    ],
  },
}));

import { DashboardOverview } from "./dashboard-overview";

afterEach(cleanup);

describe("DashboardOverview", () => {
  it("renders 0% overall progress for empty state", () => {
    mockUseLocalStorageState.mockImplementation(
      (_key: string, defaultValue: unknown) => [defaultValue, vi.fn()],
    );

    render(<DashboardOverview />);

    const bar = screen.getByRole("progressbar", { name: "Overall progress" });
    expect(bar).toHaveAttribute("aria-valuenow", "0");
    expect(screen.getByText("Overall Progress")).toBeInTheDocument();
  });

  it("renders phase progress section with all phase names", () => {
    mockUseLocalStorageState.mockImplementation(
      (_key: string, defaultValue: unknown) => [defaultValue, vi.fn()],
    );

    render(<DashboardOverview />);

    expect(
      screen.getByText("Phase 1: Fundamentals"),
    ).toBeInTheDocument();
    expect(screen.getByText("Phase 2: Building")).toBeInTheDocument();
    expect(screen.getByText("Your Learning Path")).toBeInTheDocument();
  });

  it("renders Continue Learning link pointing to the first uncompleted lesson", () => {
    mockUseLocalStorageState.mockImplementation(
      (_key: string, defaultValue: unknown) => [defaultValue, vi.fn()],
    );

    render(<DashboardOverview />);

    const link = screen.getByRole("link", { name: /Intro to Computing/i });
    expect(link).toHaveAttribute("href", "/lessons/l1");
    expect(screen.getByText("Continue Learning")).toBeInTheDocument();
  });

  it("computes progress correctly when some lessons are completed", () => {
    mockUseLocalStorageState.mockImplementation(
      () => [
        { l1: true, l2: true } as Record<string, true>,
        vi.fn(),
      ],
    );

    render(<DashboardOverview />);

    // 2 of 3 lessons completed = 67%
    expect(screen.getByText("67%")).toBeInTheDocument();
    expect(screen.getByText("2")).toBeInTheDocument(); // Lessons Completed
  });
});
