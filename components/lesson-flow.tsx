"use client";

import type { Exercise, Lesson } from "@/data/curriculum";
import { curriculum } from "@/data/curriculum";
import type { ArtifactRecord, AttemptRecord } from "@/lib/artifact-engine";
import { getWeakCompetencyTracks } from "@/lib/competency-engine";
import type { LabInstance } from "@/lib/lab-engine";
import { getLessonRecords } from "@/lib/learning-catalog";
import type { ReviewRecord } from "@/lib/progression-engine";
import {
  calculateCompetencyLevels,
  flattenLessonEntries,
  getMasteryLevel,
  isDueForReview,
} from "@/lib/progression-engine";
import { buildReflectionPrompts } from "@/lib/reflection-engine";
import { getWeakTrackHits } from "@/lib/reinforcement-engine";
import { evaluateLessonEvidenceGate } from "@/lib/validation-engine";
import Link from "next/link";
import { useCallback, useMemo, useState } from "react";
import { GuidedNotes } from "./guided-notes";
import { useArtifactManager } from "./hooks/use-artifact-manager";
import { useExerciseValidation } from "./hooks/use-exercise-validation";
import { useLabLifecycle } from "./hooks/use-lab-lifecycle";
import { useLocalStorageState } from "./hooks/use-local-storage-state";
import { LabPanel } from "./lab-panel";
import { LessonCodeExercises } from "./lesson-code-exercises";
import { LessonReviewPanel } from "./lesson-review-panel";
import { LessonTerminal } from "./lesson-terminal";
import { LessonTransfer } from "./lesson-transfer";
import { LessonValidation } from "./lesson-validation";
import { RichText } from "./rich-text";

/* ---- Flow steps ---- */
type FlowStep = "learn" | "practice" | "apply" | "reflect";

const FLOW_STEPS: { id: FlowStep; label: string; description: string }[] = [
  {
    id: "learn",
    label: "Learn",
    description: "Understand the concept and take guided notes",
  },
  {
    id: "practice",
    label: "Practice",
    description: "Exercises that reinforce what you just learned",
  },
  {
    id: "apply",
    label: "Apply",
    description: "Hands-on lab in the terminal",
  },
  {
    id: "reflect",
    label: "Reflect & Download",
    description: "Review, reflect, and save your work",
  },
];

type NotesState = Record<string, string>;
type ReflectionState = Record<string, string>;
type TransferState = Record<string, true>;
type GuidedNotesState = Record<
  string,
  { conceptNotes: Record<number, string>; understood: Record<number, boolean> }
>;

export function LessonFlow({ lesson }: { lesson: Lesson }) {
  /* ---- localStorage state ---- */
  const [progress, setProgress] = useLocalStorageState<Record<string, true>>(
    "computelearn-progress",
    {},
  );
  const [notes, setNotes] = useLocalStorageState<NotesState>(
    "computelearn-notes",
    {},
  );
  const [reflections, setReflections] = useLocalStorageState<ReflectionState>(
    "computelearn-reflections",
    {},
  );
  const [transferProgress, setTransferProgress] =
    useLocalStorageState<TransferState>("computelearn-transfer", {});
  const [, setAttempts] = useLocalStorageState<AttemptRecord[]>(
    "computelearn-attempts",
    [],
  );
  const [artifacts, setArtifacts] = useLocalStorageState<ArtifactRecord[]>(
    "computelearn-artifacts",
    [],
  );
  const [labInstances, setLabInstances] = useLocalStorageState<
    Record<string, LabInstance>
  >("computelearn-lab-instances", {});
  const [reviews, setReviews] = useLocalStorageState<
    Record<string, ReviewRecord>
  >("computelearn-reviews", {});
  const [guidedNotesState, setGuidedNotesState] =
    useLocalStorageState<GuidedNotesState>("computelearn-guided-notes", {});

  /* ---- local UI state ---- */
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [transferAnswers, setTransferAnswers] = useState<
    Record<string, string>
  >({});
  const [transferFeedback, setTransferFeedback] = useState<
    Record<string, string>
  >({});
  const [currentStep, setCurrentStep] = useState<FlowStep>("learn");

  /* ---- derived data ---- */
  const allLessonsFlat = useMemo(() => flattenLessonEntries(curriculum), []);
  const lessonRecords = useMemo(() => getLessonRecords(curriculum), []);

  const currentLessonIndex = useMemo(
    () => lessonRecords.findIndex((r) => r.lesson.id === lesson.id),
    [lessonRecords, lesson.id],
  );

  const previousLessons = useMemo(
    () =>
      currentLessonIndex > 0
        ? lessonRecords
            .slice(Math.max(0, currentLessonIndex - 3), currentLessonIndex)
            .map((r) => r.lesson)
        : [],
    [lessonRecords, currentLessonIndex],
  );

  const competencyLevels = useMemo(
    () => calculateCompetencyLevels(curriculum, progress),
    [progress],
  );

  const weakCompetencyTracks = useMemo(() => {
    const levelStrings: Record<string, string> = Object.fromEntries(
      Object.entries(competencyLevels).map(([track, count]) => [
        track,
        getMasteryLevel(count),
      ]),
    );
    return getWeakCompetencyTracks(levelStrings, "Functional");
  }, [competencyLevels]);

  const selectedLessonWeakTracks = useMemo(
    () => getWeakTrackHits(lesson, weakCompetencyTracks),
    [lesson, weakCompetencyTracks],
  );

  const reflectionPrompts = useMemo(() => {
    const reviewRecord = reviews[lesson.id];
    return buildReflectionPrompts({
      lesson,
      weakTracks: selectedLessonWeakTracks,
      isDueForReview:
        reviewRecord != null ? isDueForReview(reviewRecord) : false,
      reviewCount: reviewRecord?.reviewCount ?? 0,
    });
  }, [reviews, lesson, selectedLessonWeakTracks]);

  /* ---- hooks ---- */
  const {
    addArtifact,
    saveNoteArtifact,
    saveReflectionArtifact,
    exportArtifacts,
  } = useArtifactManager({
    artifacts,
    setArtifacts,
    notes,
    reflections,
    selectedLesson: lesson,
    reflectionPrompts,
    selectedLessonWeakTracks,
    allLessonsFlat,
  });

  const [, setLessonGateFeedback] = useState<string | null>(null);
  const [gateFeedback, setGateFeedback] = useState<string | null>(null);

  const {
    validateExercise,
    validateTransferTask,
    advanceHint,
    toggleInspection,
    currentHintLevels,
    isInspectionOpen,
    selectedLessonTransferPassed,
  } = useExerciseValidation({
    selectedLesson: lesson,
    answers,
    setFeedback,
    setLessonGateFeedback,
    setAttempts,
    transferAnswers,
    setTransferFeedback,
    transferProgress,
    setTransferProgress,
    addArtifact,
  });

  const {
    currentLabTemplate,
    currentLabInstance,
    labTerminalFilesystem,
    labFileContents,
    labCompletionSummary,
    startLab,
    validateLab,
    resetCurrentLab,
    requestLabHint,
    updateLabFile,
    updateCodeSubmission,
    updateTestOutput,
    handleTerminalCommand,
  } = useLabLifecycle(lesson.id, labInstances, setLabInstances, addArtifact);

  /* ---- derived ---- */
  const inspectionOpenStates = useMemo(() => {
    const entries: Record<string, boolean> = {};
    for (const ex of lesson.exercises) {
      entries[ex.id] = isInspectionOpen(ex.id);
    }
    if (lesson.transferTask) {
      entries[lesson.transferTask.id] = isInspectionOpen(
        lesson.transferTask.id,
      );
    }
    return entries;
  }, [lesson.exercises, lesson.transferTask, isInspectionOpen]);

  const currentStepIndex = FLOW_STEPS.findIndex((s) => s.id === currentStep);

  const lessonGuidedNotes = useMemo(
    () =>
      guidedNotesState[lesson.id] ?? {
        conceptNotes: {},
        understood: {},
      },
    [guidedNotesState, lesson.id],
  );

  /* ---- guided notes tracking ---- */
  const allConceptsUnderstood = lesson.explanation.every(
    (_, i) => lessonGuidedNotes.understood[i],
  );

  /* ---- handlers ---- */
  const handleUpdateAnswer = useCallback(
    (exId: string, answer: string) =>
      setAnswers((prev) => ({ ...prev, [exId]: answer })),
    [],
  );
  const handleValidateExercise = useCallback(
    (exercise: Exercise) => {
      validateExercise(exercise);
    },
    [validateExercise],
  );
  const handleUpdateTransfer = useCallback(
    (lessonId: string, answer: string) =>
      setTransferAnswers((prev) => ({ ...prev, [lessonId]: answer })),
    [],
  );
  const handleValidateTransfer = useCallback(() => {
    validateTransferTask();
  }, [validateTransferTask]);

  const handleSaveNote = useCallback(() => {
    saveNoteArtifact(lesson.id);
  }, [lesson.id, saveNoteArtifact]);

  const handleSaveReflection = useCallback(() => {
    saveReflectionArtifact(lesson.id);
  }, [lesson.id, saveReflectionArtifact]);

  const handleConceptNoteChange = useCallback(
    (index: number, value: string) => {
      setGuidedNotesState((prev) => ({
        ...prev,
        [lesson.id]: {
          conceptNotes: {
            ...(prev[lesson.id]?.conceptNotes ?? {}),
            [index]: value,
          },
          understood: prev[lesson.id]?.understood ?? {},
        },
      }));
    },
    [lesson.id, setGuidedNotesState],
  );

  const handleConceptUnderstood = useCallback(
    (index: number, checked: boolean) => {
      setGuidedNotesState((prev) => ({
        ...prev,
        [lesson.id]: {
          conceptNotes: prev[lesson.id]?.conceptNotes ?? {},
          understood: {
            ...(prev[lesson.id]?.understood ?? {}),
            [index]: checked,
          },
        },
      }));
    },
    [lesson.id, setGuidedNotesState],
  );

  const goToStep = useCallback((step: FlowStep) => {
    setCurrentStep(step);
    window.scrollTo({ top: 0, behavior: "smooth" });
  }, []);

  const goNext = useCallback(() => {
    const idx = FLOW_STEPS.findIndex((s) => s.id === currentStep);
    if (idx < FLOW_STEPS.length - 1) {
      goToStep(FLOW_STEPS[idx + 1].id);
    }
  }, [currentStep, goToStep]);

  const goPrev = useCallback(() => {
    const idx = FLOW_STEPS.findIndex((s) => s.id === currentStep);
    if (idx > 0) {
      goToStep(FLOW_STEPS[idx - 1].id);
    }
  }, [currentStep, goToStep]);

  const handleDownloadNotes = useCallback(() => {
    const conceptNotes = lessonGuidedNotes.conceptNotes;
    const lessonNotes = notes[lesson.id] ?? "";
    const lessonReflection = reflections[lesson.id] ?? "";

    const lines: string[] = [
      `# ${lesson.title}`,
      "",
      `> ${lesson.summary}`,
      "",
      "## Key Concepts",
      "",
    ];

    lesson.explanation.forEach((concept, i) => {
      lines.push(`### ${i + 1}. ${concept}`);
      if (conceptNotes[i]) {
        lines.push("", `**Your notes:** ${conceptNotes[i]}`);
      }
      lines.push("");
    });

    lines.push("## Demonstration Notes", "");
    lesson.demonstration.forEach((demo) => {
      lines.push(`- ${demo}`);
    });
    lines.push("");

    if (lessonNotes) {
      lines.push("## Your Lesson Notes", "", lessonNotes, "");
    }

    lines.push("## Retention Cues", "");
    lesson.retention.forEach((cue) => {
      lines.push(`- ${cue}`);
    });
    lines.push("");

    if (lessonReflection) {
      lines.push("## Your Reflection", "", lessonReflection, "");
    }

    lines.push(
      "---",
      `*Downloaded from ComputeLearn — ${new Date().toLocaleDateString()}*`,
    );

    const blob = new Blob([lines.join("\n")], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${lesson.id}-notes.md`;
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
  }, [lesson, lessonGuidedNotes, notes, reflections]);

  const handleDownloadLabWork = useCallback(() => {
    exportArtifacts(lesson.id);
  }, [lesson.id, exportArtifacts]);

  /* ---- completion gating ---- */
  function handleMarkComplete() {
    if (progress[lesson.id]) {
      // Already complete — uncomplete
      setProgress((current) => {
        const next = { ...current };
        delete next[lesson.id];
        return next;
      });
      setGateFeedback(null);
      return;
    }

    const gate = evaluateLessonEvidenceGate(
      lesson,
      answers,
      Boolean(transferProgress[lesson.id]),
    );

    if (!gate.passed) {
      const actionItems = gate.failedCriteria.map(
        (c) => c.hint ?? c.description,
      );
      setGateFeedback(`To complete this lesson: ${actionItems.join(" • ")}`);
      return;
    }

    setProgress((current) => ({ ...current, [lesson.id]: true as const }));
    setGateFeedback(null);

    if (!reviews[lesson.id]) {
      setReviews((current) => ({
        ...current,
        [lesson.id]: {
          completedAt: new Date().toISOString(),
          lastReviewedAt: null,
          reviewCount: 0,
        },
      }));
    }
  }

  function handleMarkReviewed() {
    setReviews((current) => ({
      ...current,
      [lesson.id]: {
        completedAt:
          current[lesson.id]?.completedAt ?? new Date().toISOString(),
        lastReviewedAt: new Date().toISOString(),
        reviewCount: (current[lesson.id]?.reviewCount ?? 0) + 1,
      },
    }));
  }

  /* ---- render helpers ---- */
  const hasLab = !!currentLabTemplate;

  return (
    <div className="lf">
      {/* Step progress indicator */}
      <nav className="lf-stepper" aria-label="Lesson flow">
        {FLOW_STEPS.map((step, i) => (
          <button
            key={step.id}
            type="button"
            className={`lf-step${currentStep === step.id ? " lf-step--active" : ""}${i < currentStepIndex ? " lf-step--done" : ""}`}
            onClick={() => goToStep(step.id)}
            aria-current={currentStep === step.id ? "step" : undefined}
          >
            <span className="lf-step-number">{i + 1}</span>
            <span className="lf-step-label">{step.label}</span>
          </button>
        ))}
        <div
          className="lf-stepper-track"
          ref={(el) => {
            if (el)
              el.style.setProperty(
                "--progress",
                `${(currentStepIndex / (FLOW_STEPS.length - 1)) * 100}%`,
              );
          }}
        />
      </nav>

      {/* ====== STEP 1: LEARN ====== */}
      {currentStep === "learn" && (
        <div className="lf-section">
          <div className="lf-section-header">
            <h2 className="lf-section-title">
              <span className="lf-step-badge">1</span>
              Understand the Concept
            </h2>
            <p className="lf-section-desc">
              Read through each concept carefully and take notes as you go. Mark
              each concept understood before moving to practice.
            </p>
          </div>

          {/* Prerequisite review if needed */}
          {previousLessons.length > 0 && (
            <LessonReviewPanel
              previousLessons={previousLessons}
              progress={progress}
              weakTracks={weakCompetencyTracks}
            />
          )}

          {/* Concept explanation with guided notes */}
          <GuidedNotes
            lesson={lesson}
            conceptNotes={lessonGuidedNotes.conceptNotes}
            understood={lessonGuidedNotes.understood}
            onNoteChange={handleConceptNoteChange}
            onUnderstoodChange={handleConceptUnderstood}
          />

          {/* Demonstration walkthrough */}
          <div className="lf-demo-section">
            <h3 className="lf-subsection-title">Guided Demonstration</h3>
            <div className="lf-demo-cards">
              {lesson.demonstration.map((demo, i) => (
                <div key={i} className="lf-demo-card">
                  <span className="lf-demo-number">{i + 1}</span>
                  <div className="lf-demo-text">
                    <RichText content={demo} />
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Notes prompt */}
          <div className="lf-notes-inline">
            <h3 className="lf-subsection-title">Capture Your Understanding</h3>
            <p className="lf-notes-prompt">{lesson.notesPrompt}</p>
            <textarea
              className="lf-textarea"
              rows={4}
              value={notes[lesson.id] ?? ""}
              onChange={(e) =>
                setNotes((prev) => ({ ...prev, [lesson.id]: e.target.value }))
              }
              placeholder="Write what you understand so far..."
              aria-label="Lesson notes"
            />
          </div>

          <div className="lf-step-nav">
            <div />
            <button
              type="button"
              className="lf-btn lf-btn--primary"
              onClick={goNext}
              disabled={!allConceptsUnderstood}
            >
              {allConceptsUnderstood
                ? "Continue to Practice →"
                : `Mark all concepts understood first (${Object.values(lessonGuidedNotes.understood).filter(Boolean).length}/${lesson.explanation.length})`}
            </button>
          </div>
        </div>
      )}

      {/* ====== STEP 2: PRACTICE ====== */}
      {currentStep === "practice" && (
        <div className="lf-section">
          <div className="lf-section-header">
            <h2 className="lf-section-title">
              <span className="lf-step-badge">2</span>
              Practice & Reinforce
            </h2>
            <p className="lf-section-desc">
              Work through the exercises below. Each one corresponds to a
              concept you just learned. Use hints if you get stuck.
            </p>
          </div>

          {/* Exercise steps overview */}
          <div className="lf-exercise-steps">
            <h3 className="lf-subsection-title">What You Will Do</h3>
            <ol className="lf-step-list">
              {lesson.exerciseSteps.map((step, i) => (
                <li key={i}>
                  <RichText content={step} />
                </li>
              ))}
            </ol>
          </div>

          {/* Interactive exercises */}
          <div className="lf-exercises">
            <LessonValidation
              lesson={lesson}
              answers={answers}
              feedback={feedback}
              currentHintLevels={currentHintLevels}
              inspectionOpenStates={inspectionOpenStates}
              onUpdateAnswer={handleUpdateAnswer}
              onValidateExercise={handleValidateExercise}
              onAdvanceHint={advanceHint}
              onToggleInspection={toggleInspection}
            />
          </div>

          {/* Code exercises */}
          {lesson.codeExercises && lesson.codeExercises.length > 0 && (
            <div className="lf-code-exercises">
              <h3 className="lf-subsection-title">Code Exercises</h3>
              <LessonCodeExercises
                lesson={lesson}
                onAttempt={(record) =>
                  setAttempts((prev) => [...prev.slice(-499), record])
                }
                onAddArtifact={addArtifact}
              />
            </div>
          )}

          {/* Transfer task */}
          {lesson.transferTask && (
            <div className="lf-transfer-section">
              <h3 className="lf-subsection-title">Transfer Challenge</h3>
              <p className="lf-section-desc">
                Apply what you just practiced to a new scenario without
                step-by-step guidance.
              </p>
              <LessonTransfer
                lesson={lesson}
                transferAnswers={transferAnswers}
                transferFeedback={transferFeedback}
                currentHintLevels={currentHintLevels}
                inspectionOpenStates={inspectionOpenStates}
                selectedLessonTransferPassed={selectedLessonTransferPassed}
                onUpdateTransferAnswer={handleUpdateTransfer}
                onValidateTransferTask={handleValidateTransfer}
                onAdvanceHint={advanceHint}
                onToggleInspection={toggleInspection}
              />
            </div>
          )}

          {/* Review key points before moving on */}
          <div className="lf-review-box">
            <h3 className="lf-subsection-title">Quick Review</h3>
            <ul className="lf-retention-list">
              {lesson.retention.map((cue, i) => (
                <li key={i}>
                  <RichText content={cue} />
                </li>
              ))}
            </ul>
          </div>

          <div className="lf-step-nav">
            <button
              type="button"
              className="lf-btn lf-btn--secondary"
              onClick={goPrev}
            >
              ← Back to Learn
            </button>
            <button
              type="button"
              className="lf-btn lf-btn--primary"
              onClick={goNext}
            >
              {hasLab ? "Continue to Lab →" : "Continue to Reflect →"}
            </button>
          </div>
        </div>
      )}

      {/* ====== STEP 3: APPLY (Lab) ====== */}
      {currentStep === "apply" && (
        <div className="lf-section">
          <div className="lf-section-header">
            <h2 className="lf-section-title">
              <span className="lf-step-badge">3</span>
              Apply in the Terminal
            </h2>
            <p className="lf-section-desc">
              Put your knowledge to work. Use the terminal and complete the lab
              challenge using the concepts you learned and practiced.
            </p>
          </div>

          {/* Terminal */}
          <div className="lf-terminal-container">
            <h3 className="lf-subsection-title">Terminal</h3>
            <LessonTerminal
              showTerminal={true}
              currentLabTemplate={currentLabTemplate}
              currentLabInstance={currentLabInstance}
              labTerminalFilesystem={labTerminalFilesystem}
              labFileContents={labFileContents}
              onCommandExecuted={handleTerminalCommand}
            />
          </div>

          {/* Lab panel */}
          {currentLabTemplate && (
            <div className="lf-lab-container">
              <h3 className="lf-subsection-title">Lab Challenge</h3>
              <LabPanel
                template={currentLabTemplate}
                instance={currentLabInstance}
                onStart={startLab}
                onValidate={validateLab}
                onReset={resetCurrentLab}
                onHint={requestLabHint}
                onFileChange={updateLabFile}
                onCodeSubmit={updateCodeSubmission}
                onTestOutput={updateTestOutput}
                completionSummary={labCompletionSummary}
              />
            </div>
          )}

          {/* Validation checklist */}
          <div className="lf-validation-checklist">
            <h3 className="lf-subsection-title">Validation Criteria</h3>
            <ul className="lf-check-list">
              {lesson.validationChecks.map((check, i) => (
                <li key={i}>{check}</li>
              ))}
            </ul>
          </div>

          <div className="lf-step-nav">
            <button
              type="button"
              className="lf-btn lf-btn--secondary"
              onClick={goPrev}
            >
              ← Back to Practice
            </button>
            <button
              type="button"
              className="lf-btn lf-btn--primary"
              onClick={goNext}
            >
              Continue to Reflect →
            </button>
          </div>
        </div>
      )}

      {/* ====== STEP 4: REFLECT & DOWNLOAD ====== */}
      {currentStep === "reflect" && (
        <div className="lf-section">
          <div className="lf-section-header">
            <h2 className="lf-section-title">
              <span className="lf-step-badge">4</span>
              Reflect & Save Your Work
            </h2>
            <p className="lf-section-desc">
              Think about what you learned, capture your reflections, and
              download your notes for future study.
            </p>
          </div>

          {/* Reflection */}
          <div className="lf-reflect-block">
            <h3 className="lf-subsection-title">Reflection</h3>
            {reflectionPrompts.length > 0 && (
              <ul className="lf-reflection-prompts">
                {reflectionPrompts.map((prompt) => (
                  <li key={prompt}>{prompt}</li>
                ))}
              </ul>
            )}
            {selectedLessonWeakTracks.length > 0 && (
              <p className="lf-weak-tracks">
                Focus areas: {selectedLessonWeakTracks.join(", ")}
              </p>
            )}
            <textarea
              className="lf-textarea"
              rows={5}
              value={reflections[lesson.id] ?? ""}
              onChange={(e) =>
                setReflections((prev) => ({
                  ...prev,
                  [lesson.id]: e.target.value,
                }))
              }
              placeholder="What failed? What fixed it? What signal mattered?"
              aria-label="Lesson reflection"
            />
            <button
              type="button"
              className="lf-action-btn"
              onClick={handleSaveReflection}
            >
              Save reflection
            </button>
          </div>

          {/* Retention cues */}
          <div className="lf-reflect-block">
            <h3 className="lf-subsection-title">Key Takeaways</h3>
            <ul className="lf-retention-list">
              {lesson.retention.map((cue, i) => (
                <li key={i}>{cue}</li>
              ))}
            </ul>
          </div>

          {/* Download section */}
          <div className="lf-download-section">
            <h3 className="lf-subsection-title">Download Your Work</h3>
            <p className="lf-section-desc">
              Save your notes and lab work as files you can study offline.
            </p>
            <div className="lf-download-buttons">
              <button
                type="button"
                className="lf-btn lf-btn--download"
                onClick={handleDownloadNotes}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M8 2v8m0 0L5 7m3 3 3-3M3 12h10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Download Notes (Markdown)
              </button>
              <button
                type="button"
                className="lf-btn lf-btn--download"
                onClick={handleDownloadLabWork}
              >
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <path
                    d="M8 2v8m0 0L5 7m3 3 3-3M3 12h10"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  />
                </svg>
                Download Lab Artifacts
              </button>
              <button
                type="button"
                className="lf-btn lf-btn--download"
                onClick={handleSaveNote}
              >
                Save note as artifact
              </button>
            </div>
          </div>

          {/* ─── Completion ─── */}
          <section
            className="lf-completion-section"
            aria-label="Lesson completion"
          >
            {gateFeedback && (
              <div className="lf-gate-feedback" role="alert">
                <svg
                  width="16"
                  height="16"
                  viewBox="0 0 16 16"
                  fill="none"
                  aria-hidden="true"
                >
                  <circle
                    cx="8"
                    cy="8"
                    r="7"
                    stroke="currentColor"
                    strokeWidth="1.5"
                  />
                  <path
                    d="M8 4.5V9"
                    stroke="currentColor"
                    strokeWidth="1.5"
                    strokeLinecap="round"
                  />
                  <circle cx="8" cy="11.5" r="0.75" fill="currentColor" />
                </svg>
                {gateFeedback}
              </div>
            )}

            <button
              className={`lf-complete-btn ${progress[lesson.id] ? "lf-complete-btn--done" : ""}`}
              onClick={handleMarkComplete}
              aria-pressed={Boolean(progress[lesson.id])}
            >
              {progress[lesson.id] ? (
                <>
                  <svg
                    width="16"
                    height="16"
                    viewBox="0 0 16 16"
                    fill="none"
                    aria-hidden="true"
                  >
                    <path
                      d="M3 8.5L6.5 12L13 4"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                  Lesson Complete
                </>
              ) : (
                "Mark Lesson Complete"
              )}
            </button>

            {progress[lesson.id] && (
              <button className="lf-review-btn" onClick={handleMarkReviewed}>
                Mark Reviewed
              </button>
            )}
          </section>

          {/* Competency tags */}
          {lesson.competencies && lesson.competencies.length > 0 && (
            <div className="lf-competencies">
              <h3 className="lf-subsection-title">Skills Practiced</h3>
              <div className="lf-comp-tags">
                {lesson.competencies.map((c) => (
                  <span key={c.track} className="lf-comp-tag">
                    {c.track}
                    <span className="lf-comp-level">{c.targetLevel}</span>
                  </span>
                ))}
              </div>
            </div>
          )}

          {/* Previous concepts link for struggling learners */}
          {previousLessons.length > 0 && (
            <div className="lf-prev-review">
              <h3 className="lf-subsection-title">
                Need to revisit earlier concepts?
              </h3>
              <div className="lf-prev-links">
                {previousLessons.map((prevLesson) => (
                  <Link
                    key={prevLesson.id}
                    href={`/lessons/${prevLesson.id}`}
                    className="lf-prev-link"
                  >
                    <span className="lf-prev-link-title">
                      {prevLesson.title}
                    </span>
                    <span className="lf-prev-link-summary">
                      {prevLesson.summary}
                    </span>
                  </Link>
                ))}
              </div>
            </div>
          )}

          <div className="lf-step-nav">
            <button
              type="button"
              className="lf-btn lf-btn--secondary"
              onClick={goPrev}
            >
              ← Back to {hasLab ? "Lab" : "Practice"}
            </button>
            <div />
          </div>
        </div>
      )}

      {/* Scaffolding indicator */}
      {lesson.scaffoldingLevel && (
        <div className="lf-scaffolding">
          <span className="lf-scaffolding-label">Guidance level:</span>
          <span
            className={`lf-scaffolding-badge lf-scaffolding-badge--${lesson.scaffoldingLevel}`}
          >
            {lesson.scaffoldingLevel}
          </span>
        </div>
      )}
    </div>
  );
}
