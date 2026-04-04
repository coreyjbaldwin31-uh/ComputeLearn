import type { Lesson } from "@/data/curriculum";
import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LessonReviewPanel } from "./lesson-review-panel";

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

afterEach(cleanup);

const basePreviousLesson = {
  duration: "10 min",
  difficulty: "Easy",
  objective: "Obj",
  explanation: [],
  demonstration: [],
  exerciseSteps: [],
  validationChecks: [],
  retention: [],
  tools: [],
  notesPrompt: "",
  exercises: [],
} as unknown as Lesson;

const lessonA: Lesson = {
  ...basePreviousLesson,
  id: "l-a",
  title: "Lesson A",
  summary: "Summary A",
  competencies: [{ track: "cli", targetLevel: "Functional" }],
};

const lessonB: Lesson = {
  ...basePreviousLesson,
  id: "l-b",
  title: "Lesson B",
  summary: "Summary B",
  competencies: [{ track: "networking", targetLevel: "Functional" }],
};

describe("LessonReviewPanel", () => {
  it("returns null when all previous lessons are complete and no weak overlap", () => {
    const { container } = render(
      <LessonReviewPanel
        previousLessons={[lessonA, lessonB]}
        progress={{ "l-a": true, "l-b": true }}
        weakTracks={[]}
      />,
    );

    expect(container.innerHTML).toBe("");
  });

  it("shows 'Before you start' heading when there are incomplete prerequisites", () => {
    render(
      <LessonReviewPanel
        previousLessons={[lessonA, lessonB]}
        progress={{ "l-a": true }}
        weakTracks={[]}
      />,
    );

    expect(
      screen.getByText("Before you start — review previous lessons"),
    ).toBeInTheDocument();
    expect(
      screen.getByText(/These earlier lessons build up to this one/),
    ).toBeInTheDocument();
  });

  it("shows 'Strengthen your foundation' when all are complete but weak overlap exists", () => {
    render(
      <LessonReviewPanel
        previousLessons={[lessonA]}
        progress={{ "l-a": true }}
        weakTracks={["cli"]}
      />,
    );

    expect(screen.getByText("Strengthen your foundation")).toBeInTheDocument();
    expect(
      screen.getByText(
        /Some competencies in this lesson overlap with areas where you could use more practice/,
      ),
    ).toBeInTheDocument();
  });

  it("renders lesson cards with correct titles and summaries", () => {
    render(
      <LessonReviewPanel
        previousLessons={[lessonA, lessonB]}
        progress={{}}
        weakTracks={[]}
      />,
    );

    expect(screen.getByText("Lesson A")).toBeInTheDocument();
    expect(screen.getByText("Summary A")).toBeInTheDocument();
    expect(screen.getByText("Lesson B")).toBeInTheDocument();
    expect(screen.getByText("Summary B")).toBeInTheDocument();
  });

  it("applies rp-card--incomplete class for incomplete lessons", () => {
    const { container } = render(
      <LessonReviewPanel
        previousLessons={[lessonA, lessonB]}
        progress={{ "l-a": true }}
        weakTracks={[]}
      />,
    );

    const links = container.querySelectorAll("a");
    expect(links[0]).not.toHaveClass("rp-card--incomplete");
    expect(links[1]).toHaveClass("rp-card--incomplete");
  });

  it("applies rp-card--weak class and shows badge for weak-track lessons", () => {
    render(
      <LessonReviewPanel
        previousLessons={[lessonA, lessonB]}
        progress={{}}
        weakTracks={["cli"]}
      />,
    );

    const badges = screen.getAllByText("Overlapping skill area");
    expect(badges).toHaveLength(1);

    const { container } = render(
      <LessonReviewPanel
        previousLessons={[lessonA]}
        progress={{}}
        weakTracks={["cli"]}
      />,
    );

    const card = container.querySelector("a");
    expect(card).toHaveClass("rp-card--weak");
  });

  it("links each card to the correct lesson URL", () => {
    const { container } = render(
      <LessonReviewPanel
        previousLessons={[lessonA, lessonB]}
        progress={{}}
        weakTracks={[]}
      />,
    );

    const links = container.querySelectorAll("a");
    expect(links[0]).toHaveAttribute("href", "/lessons/l-a");
    expect(links[1]).toHaveAttribute("href", "/lessons/l-b");
  });
});
