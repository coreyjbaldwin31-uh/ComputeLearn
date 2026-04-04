import type { Lesson } from "@/data/curriculum";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

/* ---- mock heavy dependencies ---- */

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

const mockUseLocalStorageState = vi.fn();
vi.mock("./hooks/use-local-storage-state", () => ({
  useLocalStorageState: (...args: unknown[]) =>
    mockUseLocalStorageState(...args),
}));

vi.mock("./hooks/use-exercise-validation", () => ({
  useExerciseValidation: () => ({
    validateExercise: vi.fn(),
    validateTransferTask: vi.fn(),
    advanceHint: vi.fn(),
    toggleInspection: vi.fn(),
    currentHintLevels: {},
    isInspectionOpen: () => false,
    selectedLessonTransferPassed: false,
  }),
}));

vi.mock("./hooks/use-artifact-manager", () => ({
  useArtifactManager: () => ({
    addArtifact: vi.fn(),
    saveNoteArtifact: vi.fn(),
    saveReflectionArtifact: vi.fn(),
    exportArtifacts: vi.fn(),
  }),
}));

vi.mock("./hooks/use-lab-lifecycle", () => ({
  useLabLifecycle: () => ({
    currentLabTemplate: null,
    currentLabInstance: null,
    labTerminalFilesystem: {},
    labFileContents: {},
    labCompletionSummary: null,
    startLab: vi.fn(),
    validateLab: vi.fn(),
    resetCurrentLab: vi.fn(),
    requestLabHint: vi.fn(),
    updateLabFile: vi.fn(),
    updateCodeSubmission: vi.fn(),
    updateTestOutput: vi.fn(),
    handleTerminalCommand: vi.fn(),
  }),
}));

vi.mock("@/data/curriculum", () => ({
  curriculum: { phases: [] },
}));

vi.mock("@/lib/reflection-engine", () => ({
  buildReflectionPrompts: () => [],
}));

vi.mock("@/lib/competency-engine", () => ({
  getWeakCompetencyTracks: () => [],
}));

vi.mock("@/lib/reinforcement-engine", () => ({
  getWeakTrackHits: () => [],
}));

vi.mock("@/lib/progression-engine", () => ({
  calculateCompetencyLevels: () => ({}),
  flattenLessonEntries: () => [],
  getMasteryLevel: () => "Novice",
  isDueForReview: () => false,
}));

vi.mock("@/lib/learning-catalog", () => ({
  getLessonRecords: () => [],
}));

/* stub child components to simplify rendering */
vi.mock("./lesson-validation", () => ({
  LessonValidation: () => <div data-testid="lesson-validation" />,
}));
vi.mock("./lesson-transfer", () => ({
  LessonTransfer: () => <div data-testid="lesson-transfer" />,
}));
vi.mock("./lesson-code-exercises", () => ({
  LessonCodeExercises: () => <div data-testid="code-exercises" />,
}));
vi.mock("./lesson-terminal", () => ({
  LessonTerminal: () => <div data-testid="lesson-terminal" />,
}));
vi.mock("./lab-panel", () => ({
  LabPanel: () => <div data-testid="lab-panel" />,
}));
vi.mock("./guided-notes", () => ({
  GuidedNotes: () => <div data-testid="guided-notes" />,
}));
vi.mock("./lesson-review-panel", () => ({
  LessonReviewPanel: () => <div data-testid="lesson-review-panel" />,
}));

import { LessonFlow } from "./lesson-flow";

afterEach(cleanup);

/* ---- fixture ---- */
const baseLesson: Lesson = {
  id: "test-lesson",
  title: "Test Lesson",
  summary: "A test summary",
  objective: "Objective",
  duration: "20 min",
  difficulty: "Easy" as const,
  explanation: ["Concept 1", "Concept 2"],
  demonstration: ["Demo step"],
  exerciseSteps: ["Do this", "Then that"],
  validationChecks: ["Check A"],
  retention: ["Remember this"],
  tools: [],
  notesPrompt: "Write notes here",
  exercises: [],
} as unknown as Lesson;

function setupMockStorage() {
  const stores = new Map<string, [unknown, unknown]>();
  mockUseLocalStorageState.mockImplementation(
    (key: string, defaultValue: unknown) => {
      if (!stores.has(key)) {
        stores.set(key, [defaultValue, vi.fn()]);
      }
      return stores.get(key)!;
    },
  );
  return stores;
}

describe("LessonFlow", () => {
  it("renders the 4-step stepper", () => {
    setupMockStorage();
    render(<LessonFlow lesson={baseLesson} />);

    expect(screen.getByText("Learn")).toBeInTheDocument();
    expect(screen.getByText("Practice")).toBeInTheDocument();
    expect(screen.getByText("Apply")).toBeInTheDocument();
    expect(screen.getByText("Reflect & Download")).toBeInTheDocument();
  });

  it("starts on the Learn step", () => {
    setupMockStorage();
    render(<LessonFlow lesson={baseLesson} />);

    const learnBtn = screen.getByText("Learn").closest("button");
    expect(learnBtn).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Understand the Concept")).toBeInTheDocument();
  });

  it("disables continue button when not all concepts are understood", () => {
    setupMockStorage();
    render(<LessonFlow lesson={baseLesson} />);

    const continueBtn = screen.getByRole("button", {
      name: /Mark all concepts understood first/,
    });
    expect(continueBtn).toBeDisabled();
  });

  it("enables continue button when all concepts are understood", () => {
    const stores = setupMockStorage();
    stores.set("computelearn-guided-notes", [
      {
        "test-lesson": {
          conceptNotes: {},
          understood: { 0: true, 1: true },
        },
      },
      vi.fn(),
    ]);

    render(<LessonFlow lesson={baseLesson} />);

    const continueBtn = screen.getByRole("button", {
      name: "Continue to Practice →",
    });
    expect(continueBtn).not.toBeDisabled();
  });

  it("navigates to Practice step when clicking the stepper button", async () => {
    const stores = setupMockStorage();
    stores.set("computelearn-guided-notes", [
      {
        "test-lesson": {
          conceptNotes: {},
          understood: { 0: true, 1: true },
        },
      },
      vi.fn(),
    ]);

    render(<LessonFlow lesson={baseLesson} />);

    const practiceBtn = screen.getByText("Practice").closest("button")!;
    await userEvent.click(practiceBtn);

    expect(practiceBtn).toHaveAttribute("aria-current", "step");
    expect(screen.getByText("Practice & Reinforce")).toBeInTheDocument();
  });

  it("renders demonstration cards on Learn step", () => {
    setupMockStorage();
    render(<LessonFlow lesson={baseLesson} />);

    expect(screen.getByText("Guided Demonstration")).toBeInTheDocument();
    expect(screen.getByText("Demo step")).toBeInTheDocument();
  });

  it("shows exercise steps on Practice step", async () => {
    setupMockStorage();
    render(<LessonFlow lesson={baseLesson} />);

    await userEvent.click(screen.getByText("Practice").closest("button")!);

    expect(screen.getByText("What You Will Do")).toBeInTheDocument();
    expect(screen.getByText("Do this")).toBeInTheDocument();
    expect(screen.getByText("Then that")).toBeInTheDocument();
  });

  it("shows retention cues on Practice step", async () => {
    setupMockStorage();
    render(<LessonFlow lesson={baseLesson} />);

    await userEvent.click(screen.getByText("Practice").closest("button")!);

    expect(screen.getByText("Remember this")).toBeInTheDocument();
  });

  it("shows validation criteria on Apply step", async () => {
    setupMockStorage();
    render(<LessonFlow lesson={baseLesson} />);

    await userEvent.click(screen.getByText("Apply").closest("button")!);

    expect(screen.getByText("Validation Criteria")).toBeInTheDocument();
    expect(screen.getByText("Check A")).toBeInTheDocument();
  });

  it("shows download buttons on Reflect step", async () => {
    setupMockStorage();
    render(<LessonFlow lesson={baseLesson} />);

    await userEvent.click(
      screen.getByText("Reflect & Download").closest("button")!,
    );

    expect(screen.getByText("Download Notes (Markdown)")).toBeInTheDocument();
    expect(screen.getByText("Download Lab Artifacts")).toBeInTheDocument();
    expect(screen.getByText("Save note as artifact")).toBeInTheDocument();
  });

  it("navigates back with the Back button", async () => {
    setupMockStorage();
    render(<LessonFlow lesson={baseLesson} />);

    // go to Practice
    await userEvent.click(screen.getByText("Practice").closest("button")!);
    expect(screen.getByText("Practice & Reinforce")).toBeInTheDocument();

    // go back
    await userEvent.click(
      screen.getByRole("button", { name: "← Back to Learn" }),
    );
    expect(screen.getByText("Understand the Concept")).toBeInTheDocument();
  });
});
