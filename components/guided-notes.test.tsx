import type { Lesson } from "@/data/curriculum";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { GuidedNotes } from "./guided-notes";

afterEach(cleanup);

const lesson = {
  id: "lesson-1",
  title: "Intro",
  summary: "Summary",
  objective: "Objective",
  duration: "15 min",
  difficulty: "Easy",
  explanation: ["Concept A", "Concept B", "Concept C"],
  demonstration: [],
  exerciseSteps: [],
  validationChecks: [],
  retention: [],
  tools: [],
  notesPrompt: "Write notes",
  exercises: [],
} as unknown as Lesson;

describe("GuidedNotes", () => {
  it("renders a card for each concept in the explanation", () => {
    render(
      <GuidedNotes
        lesson={lesson}
        conceptNotes={{}}
        understood={{}}
        onNoteChange={vi.fn()}
        onUnderstoodChange={vi.fn()}
      />,
    );

    expect(screen.getByText("Concept A")).toBeInTheDocument();
    expect(screen.getByText("Concept B")).toBeInTheDocument();
    expect(screen.getByText("Concept C")).toBeInTheDocument();
  });

  it("shows correct progress text", () => {
    render(
      <GuidedNotes
        lesson={lesson}
        conceptNotes={{}}
        understood={{ 0: true, 2: true }}
        onNoteChange={vi.fn()}
        onUnderstoodChange={vi.fn()}
      />,
    );

    expect(screen.getByText("2 of 3 concepts understood")).toBeInTheDocument();
  });

  it("displays existing concept notes in textareas", () => {
    render(
      <GuidedNotes
        lesson={lesson}
        conceptNotes={{ 0: "My note for A", 1: "My note for B" }}
        understood={{}}
        onNoteChange={vi.fn()}
        onUnderstoodChange={vi.fn()}
      />,
    );

    const textareas = screen.getAllByRole("textbox");
    expect(textareas[0]).toHaveValue("My note for A");
    expect(textareas[1]).toHaveValue("My note for B");
    expect(textareas[2]).toHaveValue("");
  });

  it("calls onNoteChange when typing in a concept textarea", async () => {
    const onNoteChange = vi.fn();

    render(
      <GuidedNotes
        lesson={lesson}
        conceptNotes={{}}
        understood={{}}
        onNoteChange={onNoteChange}
        onUnderstoodChange={vi.fn()}
      />,
    );

    const textareas = screen.getAllByRole("textbox");
    await userEvent.type(textareas[0], "X");

    expect(onNoteChange).toHaveBeenCalledWith(0, "X");
  });

  it("calls onUnderstoodChange when toggling a checkbox", async () => {
    const onUnderstoodChange = vi.fn();

    render(
      <GuidedNotes
        lesson={lesson}
        conceptNotes={{}}
        understood={{}}
        onNoteChange={vi.fn()}
        onUnderstoodChange={onUnderstoodChange}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    await userEvent.click(checkboxes[1]);

    expect(onUnderstoodChange).toHaveBeenCalledWith(1, true);
  });

  it("checks boxes for understood concepts", () => {
    render(
      <GuidedNotes
        lesson={lesson}
        conceptNotes={{}}
        understood={{ 0: true, 1: false, 2: true }}
        onNoteChange={vi.fn()}
        onUnderstoodChange={vi.fn()}
      />,
    );

    const checkboxes = screen.getAllByRole("checkbox");
    expect(checkboxes[0]).toBeChecked();
    expect(checkboxes[1]).not.toBeChecked();
    expect(checkboxes[2]).toBeChecked();
  });

  it("applies understood class to completed concept cards", () => {
    const { container } = render(
      <GuidedNotes
        lesson={lesson}
        conceptNotes={{}}
        understood={{ 1: true }}
        onNoteChange={vi.fn()}
        onUnderstoodChange={vi.fn()}
      />,
    );

    const cards = container.querySelectorAll(".gn-card");
    expect(cards[0]).not.toHaveClass("gn-card--understood");
    expect(cards[1]).toHaveClass("gn-card--understood");
    expect(cards[2]).not.toHaveClass("gn-card--understood");
  });
});
