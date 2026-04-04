import type { Course, Lesson, Phase } from "@/data/curriculum";
import type { LessonEntry, ReviewRecord } from "@/lib/progression-engine";
import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { RailPanels } from "./rail-panels";

afterEach(cleanup);

function makeLesson(id: string, title: string): Lesson {
  return {
    id,
    title,
    summary: "Summary",
    objective: "Objective",
    duration: "15 min",
    difficulty: "Easy",
    notes: [],
    exercises: [],
    validationMode: "manual",
    transferTask: null,
    labs: [],
  } as unknown as Lesson;
}

function makeEntry(lesson: Lesson): LessonEntry {
  return {
    phase: {
      id: "phase-1",
      title: "Phase 1",
      level: "Aware",
      duration: "2 weeks",
      strapline: "Start",
      milestones: [],
      competencies: [],
      exitStandards: { competencyGates: [] },
      courses: [],
    } as unknown as LessonEntry["phase"],
    course: {
      id: "course-1",
      title: "Course 1",
      duration: "1 week",
      lessons: [],
    } as unknown as LessonEntry["course"],
    lesson,
  };
}

describe("RailPanels", () => {
  it("provides contextual labels for lesson and review navigation controls", async () => {
    const selectedLesson = makeLesson("lesson-1", "Intro lesson");
    const pendingLesson = makeLesson("lesson-2", "Pending lesson");
    const selectedCourse = {
      id: "course-1",
      title: "Course 1",
      duration: "1 week",
      lessons: [selectedLesson, pendingLesson],
    } as unknown as Course;

    const selectedPhase = {
      id: "phase-1",
      title: "Phase 1",
      level: "Aware",
      duration: "2 weeks",
      strapline: "Start",
      purpose: "Purpose",
      tools: ["PowerShell"],
      guardrails: ["Use safe commands"],
      environment: "Sandbox",
      milestones: ["Milestone"],
      projects: ["Project"],
      competencyFocus: [],
      courses: [selectedCourse],
    } as unknown as Phase;

    const reinforcementEntry = makeEntry(pendingLesson);
    const reviewEntry = makeEntry(selectedLesson);

    const setSelectedLessonId = vi.fn();
    const navigateToEntry = vi.fn();

    render(
      <RailPanels
        learnerProfile={{
          displayName: "Learner",
          weeklyHours: 5,
          goal: "Ship",
          createdAt: null,
        }}
        updateLearnerProfile={vi.fn()}
        storageStatus={{
          mode: "stable",
          lastSuccessfulSaveLabel: "just now",
          isSaveStale: false,
          profileDirty: false,
          profileFailureCount: 0,
          profileFailureReason: null,
        }}
        onOpenRecovery={vi.fn()}
        onResetAll={vi.fn()}
        selectedPhase={selectedPhase}
        selectedCourse={selectedCourse}
        selectedLesson={selectedLesson}
        progress={{}}
        reviews={{} as Record<string, ReviewRecord>}
        visibleLessons={[selectedLesson, pendingLesson]}
        setSelectedLessonId={setSelectedLessonId}
        exportArtifacts={vi.fn()}
        recentAttempts={[]}
        lessonArtifactSummary={{
          total: 0,
          counts: { note: 0, reflection: 0, transfer: 0, completion: 0 },
          recent: [],
        }}
        artifactCompletionSummary={{
          completionRate: 0,
          lessonsWithEvidence: 0,
          completedLessons: 0,
          lessonsMissingEvidence: 0,
          evidenceCoverageByPhase: [],
        }}
        attemptAnalytics={{
          attemptCount: 0,
          failedAttempts: 0,
          passedAttempts: 0,
          exercisesTracked: 0,
          firstPassExercises: 0,
          errorReductionRate: 0,
          recoveredExercises: 0,
          unresolvedExercises: 0,
          breakdown: [],
        }}
        lessonAttemptAnalytics={{
          attemptCount: 0,
          failedAttempts: 0,
          passedAttempts: 0,
          exercisesTracked: 0,
          firstPassExercises: 0,
          errorReductionRate: 0,
          recoveredExercises: 0,
          unresolvedExercises: 0,
          breakdown: [],
        }}
        transferEvidenceWithinPhase={0}
        transferLessonsCount={0}
        competencyLevels={{}}
        weakCompetencyTracks={[]}
        reinforcementQueue={[
          {
            entry: reinforcementEntry,
            weakTracks: ["cli-basics"],
            dueSinceDays: 2,
            reviewCount: 1,
            score: 1,
          },
        ]}
        phaseReinforcementQueue={[]}
        reviewQueue={[reviewEntry]}
        navigateToEntry={navigateToEntry}
        selectPhase={vi.fn()}
        phaseExitStatus={null}
        phaseMilestoneStatus={null}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "Open lesson: Pending lesson (pending)",
      }),
    );
    expect(setSelectedLessonId).toHaveBeenCalledWith("lesson-2");

    await userEvent.click(
      screen.getByRole("button", {
        name: "Open reinforcement lesson: Pending lesson in Course 1",
      }),
    );

    await userEvent.click(
      screen.getByRole("button", {
        name: "Open review lesson: Intro lesson in Course 1",
      }),
    );

    expect(navigateToEntry).toHaveBeenCalledTimes(2);
  });

  it("tracks lesson filter state with aria-pressed", async () => {
    const selectedLesson = makeLesson("lesson-1", "Intro lesson");
    const pendingLesson = makeLesson("lesson-2", "Pending lesson");
    const selectedCourse = {
      id: "course-1",
      title: "Course 1",
      duration: "1 week",
      lessons: [selectedLesson, pendingLesson],
    } as unknown as Course;

    const selectedPhase = {
      id: "phase-1",
      title: "Phase 1",
      level: "Aware",
      duration: "2 weeks",
      strapline: "Start",
      purpose: "Purpose",
      tools: ["PowerShell"],
      guardrails: ["Use safe commands"],
      environment: "Sandbox",
      milestones: ["Milestone"],
      projects: ["Project"],
      competencyFocus: [],
      courses: [selectedCourse],
    } as unknown as Phase;

    render(
      <RailPanels
        learnerProfile={{
          displayName: "Learner",
          weeklyHours: 5,
          goal: "Ship",
          createdAt: null,
        }}
        updateLearnerProfile={vi.fn()}
        storageStatus={{
          mode: "stable",
          lastSuccessfulSaveLabel: "just now",
          isSaveStale: false,
          profileDirty: false,
          profileFailureCount: 0,
          profileFailureReason: null,
        }}
        onOpenRecovery={vi.fn()}
        onResetAll={vi.fn()}
        selectedPhase={selectedPhase}
        selectedCourse={selectedCourse}
        selectedLesson={selectedLesson}
        progress={{}}
        reviews={{} as Record<string, ReviewRecord>}
        visibleLessons={[selectedLesson, pendingLesson]}
        setSelectedLessonId={vi.fn()}
        exportArtifacts={vi.fn()}
        recentAttempts={[]}
        lessonArtifactSummary={{
          total: 0,
          counts: { note: 0, reflection: 0, transfer: 0, completion: 0 },
          recent: [],
        }}
        artifactCompletionSummary={{
          completionRate: 0,
          lessonsWithEvidence: 0,
          completedLessons: 0,
          lessonsMissingEvidence: 0,
          evidenceCoverageByPhase: [],
        }}
        attemptAnalytics={{
          attemptCount: 0,
          failedAttempts: 0,
          passedAttempts: 0,
          exercisesTracked: 0,
          firstPassExercises: 0,
          errorReductionRate: 0,
          recoveredExercises: 0,
          unresolvedExercises: 0,
          breakdown: [],
        }}
        lessonAttemptAnalytics={{
          attemptCount: 0,
          failedAttempts: 0,
          passedAttempts: 0,
          exercisesTracked: 0,
          firstPassExercises: 0,
          errorReductionRate: 0,
          recoveredExercises: 0,
          unresolvedExercises: 0,
          breakdown: [],
        }}
        transferEvidenceWithinPhase={0}
        transferLessonsCount={0}
        competencyLevels={{}}
        weakCompetencyTracks={[]}
        reinforcementQueue={[]}
        phaseReinforcementQueue={[]}
        reviewQueue={[]}
        navigateToEntry={vi.fn()}
        selectPhase={vi.fn()}
        phaseExitStatus={null}
        phaseMilestoneStatus={null}
      />,
    );

    const allButton = screen.getByRole("button", { name: "All" });
    const pendingButton = screen.getByRole("button", { name: "Pending" });
    const completeButton = screen.getByRole("button", { name: "Complete" });

    expect(allButton).toHaveAttribute("aria-pressed", "true");
    expect(pendingButton).toHaveAttribute("aria-pressed", "false");

    await userEvent.click(pendingButton);

    expect(allButton).toHaveAttribute("aria-pressed", "false");
    expect(pendingButton).toHaveAttribute("aria-pressed", "true");
    expect(completeButton).toHaveAttribute("aria-pressed", "false");
  });

  it("renders lesson discovery hierarchy controls", () => {
    const selectedLesson = makeLesson("lesson-1", "Intro lesson");
    const pendingLesson = makeLesson("lesson-2", "Pending lesson");
    const selectedCourse = {
      id: "course-1",
      title: "Course 1",
      duration: "1 week",
      lessons: [selectedLesson, pendingLesson],
    } as unknown as Course;

    const selectedPhase = {
      id: "phase-1",
      title: "Phase 1",
      level: "Aware",
      duration: "2 weeks",
      strapline: "Start",
      purpose: "Purpose",
      tools: ["PowerShell"],
      guardrails: ["Use safe commands"],
      environment: "Sandbox",
      milestones: ["Milestone"],
      projects: ["Project"],
      competencyFocus: [],
      courses: [selectedCourse],
    } as unknown as Phase;

    render(
      <RailPanels
        learnerProfile={{
          displayName: "Learner",
          weeklyHours: 5,
          goal: "Ship",
          createdAt: null,
        }}
        updateLearnerProfile={vi.fn()}
        storageStatus={{
          mode: "stable",
          lastSuccessfulSaveLabel: "just now",
          isSaveStale: false,
          profileDirty: false,
          profileFailureCount: 0,
          profileFailureReason: null,
        }}
        onOpenRecovery={vi.fn()}
        onResetAll={vi.fn()}
        selectedPhase={selectedPhase}
        selectedCourse={selectedCourse}
        selectedLesson={selectedLesson}
        progress={{}}
        reviews={{} as Record<string, ReviewRecord>}
        visibleLessons={[selectedLesson, pendingLesson]}
        setSelectedLessonId={vi.fn()}
        exportArtifacts={vi.fn()}
        recentAttempts={[]}
        lessonArtifactSummary={{
          total: 0,
          counts: { note: 0, reflection: 0, transfer: 0, completion: 0 },
          recent: [],
        }}
        artifactCompletionSummary={{
          completionRate: 0,
          lessonsWithEvidence: 0,
          completedLessons: 0,
          lessonsMissingEvidence: 0,
          evidenceCoverageByPhase: [],
        }}
        attemptAnalytics={{
          attemptCount: 0,
          failedAttempts: 0,
          passedAttempts: 0,
          exercisesTracked: 0,
          firstPassExercises: 0,
          errorReductionRate: 0,
          recoveredExercises: 0,
          unresolvedExercises: 0,
          breakdown: [],
        }}
        lessonAttemptAnalytics={{
          attemptCount: 0,
          failedAttempts: 0,
          passedAttempts: 0,
          exercisesTracked: 0,
          firstPassExercises: 0,
          errorReductionRate: 0,
          recoveredExercises: 0,
          unresolvedExercises: 0,
          breakdown: [],
        }}
        transferEvidenceWithinPhase={0}
        transferLessonsCount={0}
        competencyLevels={{}}
        weakCompetencyTracks={[]}
        reinforcementQueue={[]}
        phaseReinforcementQueue={[]}
        reviewQueue={[]}
        navigateToEntry={vi.fn()}
        selectPhase={vi.fn()}
        phaseExitStatus={null}
        phaseMilestoneStatus={null}
      />,
    );

    expect(screen.getByRole("heading", { name: "Lessons in this course" }));
    expect(screen.getByRole("searchbox", { name: "Search lessons" }));
    expect(
      screen.getByRole("group", { name: "Lesson status filter" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "All" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Pending" })).toBeInTheDocument();
    expect(
      screen.getByRole("button", { name: "Complete" }),
    ).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Due" })).toBeInTheDocument();
  });
});
