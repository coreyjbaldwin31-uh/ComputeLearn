"use client";

import type { Curriculum, Exercise, Lesson } from "@/data/curriculum";
import {
  evaluateExerciseAnswer,
  evaluateLessonEvidenceGate,
} from "@/lib/validation-engine";
import {
  calculateActivityStreak,
  calculateCompetencyLevels,
  formatTrackName,
  getLevelThreshold,
  getMasteryLevel,
  isDueForReview,
} from "@/lib/progression-engine";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { CodeExercise } from "./code-exercise";
import { TerminalSimulator } from "./terminal-simulator";

type ProgressState = Record<string, true>;
type NotesState = Record<string, string>;
type AnswerState = Record<string, string>;

type ReviewRecord = {
  completedAt: string;
  lastReviewedAt: string | null;
  reviewCount: number;
};
type ReviewState = Record<string, ReviewRecord>;
type TransferState = Record<string, true>;

type LearnerProfile = {
  displayName: string;
  goal: string;
  weeklyHours: number;
  createdAt: string | null;
};

type AttemptRecord = {
  id: string;
  lessonId: string;
  exerciseId: string;
  assessmentType: string;
  answer: string;
  passed: boolean;
  attemptedAt: string;
};

type ArtifactRecord = {
  id: string;
  lessonId: string;
  type: "note" | "completion" | "transfer";
  title: string;
  content: string;
  createdAt: string;
};

type TrainingPlatformProps = {
  curriculum: Curriculum;
};

const progressStorageKey = "computelearn-progress";
const notesStorageKey = "computelearn-notes";
const reviewsStorageKey = "computelearn-reviews";
const learnerProfileStorageKey = "computelearn-learner-profile";
const attemptsStorageKey = "computelearn-attempts";
const artifactsStorageKey = "computelearn-artifacts";
const transferStorageKey = "computelearn-transfer";

const emptyProgress: ProgressState = {};
const emptyNotes: NotesState = {};
const emptyReviews: ReviewState = {};
const emptyTransfer: TransferState = {};
const emptyProfile: LearnerProfile = {
  displayName: "",
  goal: "",
  weeklyHours: 4,
  createdAt: null,
};

function useLocalStorageState<T>(key: string, initial: T) {
  const initialRef = useRef(initial);
  const cached = useRef({
    raw: undefined as string | undefined,
    value: initial,
  });

  const subscribe = useCallback((cb: () => void) => {
    window.addEventListener("storage", cb);
    window.addEventListener("ls-write", cb);
    return () => {
      window.removeEventListener("storage", cb);
      window.removeEventListener("ls-write", cb);
    };
  }, []);

  const getSnapshot = useCallback(() => {
    const raw = localStorage.getItem(key) ?? undefined;
    if (raw === cached.current.raw) return cached.current.value;
    const val = raw != null ? (JSON.parse(raw) as T) : initialRef.current;
    cached.current = { raw, value: val };
    return val;
  }, [key]);

  const getServerSnapshot = useCallback(() => initialRef.current, []);

  const value = useSyncExternalStore(subscribe, getSnapshot, getServerSnapshot);

  const set = useCallback(
    (fn: T | ((prev: T) => T)) => {
      const cur = (() => {
        const r = localStorage.getItem(key);
        return r != null ? (JSON.parse(r) as T) : initialRef.current;
      })();
      const next = typeof fn === "function" ? (fn as (p: T) => T)(cur) : fn;
      const raw = JSON.stringify(next);
      localStorage.setItem(key, raw);
      cached.current = { raw, value: next };
      window.dispatchEvent(new Event("ls-write"));
    },
    [key],
  );

  return [value, set] as const;
}

const themeStorageKey = "computelearn-theme";

function useTheme() {
  const [theme, setTheme] = useLocalStorageState<"light" | "dark">(
    themeStorageKey,
    "light",
  );

  useEffect(() => {
    document.documentElement.setAttribute("data-theme", theme);
  }, [theme]);

  const toggle = useCallback(() => {
    setTheme((prev) => (prev === "dark" ? "light" : "dark"));
  }, [setTheme]);

  return { theme, toggle };
}

export function TrainingPlatform({ curriculum }: TrainingPlatformProps) {
  const [selectedPhaseId, setSelectedPhaseId] = useState(
    curriculum.phases[0]?.id ?? "",
  );
  const [selectedCourseId, setSelectedCourseId] = useState(
    curriculum.phases[0]?.courses[0]?.id ?? "",
  );
  const [selectedLessonId, setSelectedLessonId] = useState(
    curriculum.phases[0]?.courses[0]?.lessons[0]?.id ?? "",
  );
  const [progress, setProgress] = useLocalStorageState<ProgressState>(
    progressStorageKey,
    emptyProgress,
  );
  const [notes, setNotes] = useLocalStorageState<NotesState>(
    notesStorageKey,
    emptyNotes,
  );
  const [answers, setAnswers] = useState<AnswerState>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [hintLevels, setHintLevels] = useState<Record<string, number>>({});
  const [transferAnswers, setTransferAnswers] = useState<Record<string, string>>(
    {},
  );
  const [transferFeedback, setTransferFeedback] = useState<
    Record<string, string>
  >({});
  const [lessonGateFeedback, setLessonGateFeedback] = useState<string | null>(
    null,
  );
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
  const [reviews, setReviews] = useLocalStorageState<ReviewState>(
    reviewsStorageKey,
    emptyReviews,
  );
  const [transferProgress, setTransferProgress] =
    useLocalStorageState<TransferState>(transferStorageKey, emptyTransfer);
  const [learnerProfile, setLearnerProfile] = useLocalStorageState<LearnerProfile>(
    learnerProfileStorageKey,
    emptyProfile,
  );
  const [attempts, setAttempts] = useLocalStorageState<AttemptRecord[]>(
    attemptsStorageKey,
    [],
  );
  const [artifacts, setArtifacts] = useLocalStorageState<ArtifactRecord[]>(
    artifactsStorageKey,
    [],
  );
  const { theme, toggle: toggleTheme } = useTheme();

  const selectedPhase = useMemo(
    () =>
      curriculum.phases.find((phase) => phase.id === selectedPhaseId) ??
      curriculum.phases[0],
    [curriculum.phases, selectedPhaseId],
  );

  const selectedCourse = useMemo(
    () =>
      selectedPhase?.courses.find((course) => course.id === selectedCourseId) ??
      selectedPhase?.courses[0],
    [selectedCourseId, selectedPhase],
  );

  const visibleLessons = useMemo(() => {
    const lessons = selectedCourse?.lessons ?? [];

    if (!showCompletedOnly) {
      return lessons;
    }

    return lessons.filter((lesson) => progress[lesson.id]);
  }, [progress, selectedCourse?.lessons, showCompletedOnly]);

  const selectedLesson: Lesson | undefined = useMemo(() => {
    const lessonFromCourse = selectedCourse?.lessons.find(
      (lesson) => lesson.id === selectedLessonId,
    );

    if (lessonFromCourse) {
      return lessonFromCourse;
    }

    return visibleLessons[0] ?? selectedCourse?.lessons[0];
  }, [selectedCourse?.lessons, selectedLessonId, visibleLessons]);

  const totalLessons = useMemo(
    () =>
      curriculum.phases.flatMap((phase) =>
        phase.courses.flatMap((course) => course.lessons),
      ).length,
    [curriculum.phases],
  );

  const completedLessons = useMemo(
    () => Object.keys(progress).filter((lessonId) => progress[lessonId]).length,
    [progress],
  );

  const percentComplete =
    totalLessons === 0
      ? 0
      : Math.round((completedLessons / totalLessons) * 100);

  const allLessonsFlat = useMemo(
    () =>
      curriculum.phases.flatMap((phase) =>
        phase.courses.flatMap((course) =>
          course.lessons.map((lesson) => ({ phase, course, lesson })),
        ),
      ),
    [curriculum.phases],
  );

  const currentLessonIndex = useMemo(
    () =>
      allLessonsFlat.findIndex(
        (entry) => entry.lesson.id === selectedLesson?.id,
      ),
    [allLessonsFlat, selectedLesson?.id],
  );

  const prevEntry =
    currentLessonIndex > 0 ? allLessonsFlat[currentLessonIndex - 1] : null;
  const nextEntry =
    currentLessonIndex < allLessonsFlat.length - 1
      ? allLessonsFlat[currentLessonIndex + 1]
      : null;

  const showTerminal = selectedPhase?.id === "phase-1";

  const competencyLevels = useMemo(
    () => calculateCompetencyLevels(curriculum, progress),
    [curriculum, progress],
  );

  const reviewQueue = useMemo(() => {
    return allLessonsFlat.filter(({ lesson }) => {
      const record = reviews[lesson.id];
      return record != null && isDueForReview(record);
    });
  }, [allLessonsFlat, reviews]);

  const activityStreak = useMemo(
    () => calculateActivityStreak(reviews),
    [reviews],
  );

  const recentAttempts = useMemo(() => {
    if (!selectedLesson) return [];
    return attempts
      .filter((attempt) => attempt.lessonId === selectedLesson.id)
      .slice(0, 5);
  }, [attempts, selectedLesson]);

  const recentArtifacts = useMemo(() => {
    if (!selectedLesson) return [];
    return artifacts
      .filter((artifact) => artifact.lessonId === selectedLesson.id)
      .slice(0, 4);
  }, [artifacts, selectedLesson]);

  function createId(prefix: string) {
    return `${prefix}-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`;
  }

  function addArtifact(
    type: ArtifactRecord["type"],
    title: string,
    content: string,
    lessonId: string,
  ) {
    if (!content.trim()) return;
    const nextArtifact: ArtifactRecord = {
      id: createId("artifact"),
      lessonId,
      type,
      title,
      content: content.trim(),
      createdAt: new Date().toISOString(),
    };
    setArtifacts((current) => [nextArtifact, ...current].slice(0, 250));
  }

  function updateLearnerProfile(
    patch: Partial<Omit<LearnerProfile, "createdAt">>,
  ) {
    setLearnerProfile((current) => ({
      ...current,
      ...patch,
      createdAt: current.createdAt ?? new Date().toISOString(),
    }));
  }

  function navigateToEntry(entry: {
    phase: typeof selectedPhase;
    course: typeof selectedCourse;
    lesson: Lesson;
  }) {
    setSelectedPhaseId(entry.phase.id);
    setSelectedCourseId(entry.course.id);
    setSelectedLessonId(entry.lesson.id);
  }

  function selectPhase(phaseId: string) {
    const phase = curriculum.phases.find((item) => item.id === phaseId);
    if (!phase) {
      return;
    }
    setSelectedPhaseId(phase.id);
    setSelectedCourseId(phase.courses[0]?.id ?? "");
    setSelectedLessonId(phase.courses[0]?.lessons[0]?.id ?? "");
  }

  function selectCourse(courseId: string) {
    const course = selectedPhase?.courses.find((item) => item.id === courseId);
    if (!course) {
      return;
    }
    setSelectedCourseId(course.id);
    setSelectedLessonId(course.lessons[0]?.id ?? "");
  }

  function setLessonCompletion(lessonId: string, isComplete: boolean) {
    const lesson = allLessonsFlat.find((entry) => entry.lesson.id === lessonId)
      ?.lesson;

    if (isComplete && lesson) {
      const completionGate = evaluateLessonEvidenceGate(
        lesson,
        answers,
        Boolean(transferProgress[lessonId]),
      );

      if (!completionGate.passed) {
        const failedCriteriaSummary = completionGate.failedCriteria
          .map((criterion) => criterion.description)
          .join(", ");
        setLessonGateFeedback(
          `${completionGate.hint ?? "Complete all required evidence before marking this lesson complete."} Remaining: ${failedCriteriaSummary}.`,
        );
        return;
      }
    }

    setProgress((current) => {
      if (isComplete) {
        return { ...current, [lessonId]: true };
      }
      const next = { ...current };
      delete next[lessonId];
      return next;
    });

    setLessonGateFeedback(null);

    if (isComplete && !reviews[lessonId]) {
      setReviews((current) => ({
        ...current,
        [lessonId]: {
          completedAt: new Date().toISOString(),
          lastReviewedAt: null,
          reviewCount: 0,
        },
      }));
    }

    if (isComplete) {
      addArtifact(
        "completion",
        "Lesson completion snapshot",
        `${lesson?.title ?? lessonId}: completed with ${
          lesson?.exercises.length ?? 0
        } validation checks and transfer evidence ${
          transferProgress[lessonId] ? "passed" : "not required"
        }.`,
        lessonId,
      );
    }
  }

  function markReviewed(lessonId: string) {
    setReviews((current) => ({
      ...current,
      [lessonId]: {
        completedAt: current[lessonId]?.completedAt ?? new Date().toISOString(),
        lastReviewedAt: new Date().toISOString(),
        reviewCount: (current[lessonId]?.reviewCount ?? 0) + 1,
      },
    }));
  }

  function resetLab() {
    if (!selectedLesson) return;
    const exerciseIds = new Set(selectedLesson.exercises.map((e) => e.id));
    setAnswers((prev) => {
      const next = { ...prev };
      for (const id of exerciseIds) delete next[id];
      return next;
    });
    setFeedback((prev) => {
      const next = { ...prev };
      for (const id of exerciseIds) delete next[id];
      return next;
    });
    const prefix = `${selectedLesson.id}:`;
    setHintLevels((prev) =>
      Object.fromEntries(
        Object.entries(prev).filter(([k]) => !k.startsWith(prefix)),
      ),
    );
    setTransferAnswers((prev) => {
      const next = { ...prev };
      delete next[selectedLesson.id];
      return next;
    });
    setTransferFeedback((prev) => {
      const next = { ...prev };
      delete next[selectedLesson.id];
      return next;
    });
  }

  function updateNote(lessonId: string, value: string) {
    setNotes((current) => ({ ...current, [lessonId]: value }));
  }

  function updateAnswer(exerciseId: string, value: string) {
    setAnswers((current) => ({ ...current, [exerciseId]: value }));
  }

  function validateExercise(exercise: Exercise) {
    if (!selectedLesson) return;
    const answer = answers[exercise.id] ?? "";
    const validation = evaluateExerciseAnswer(exercise, answer);
    const passed = validation.passed;

    setFeedback((current) => ({
      ...current,
      [exercise.id]: passed
        ? exercise.successMessage
        : validation.hint ?? "Not quite right. Check your answer and try again.",
    }));

    setLessonGateFeedback(null);

    const record: AttemptRecord = {
      id: createId("attempt"),
      lessonId: selectedLesson.id,
      exerciseId: exercise.id,
      assessmentType: exercise.assessmentType ?? "action",
      answer,
      passed,
      attemptedAt: new Date().toISOString(),
    };
    setAttempts((current) => [record, ...current].slice(0, 500));
  }

  function validateTransferTask() {
    if (!selectedLesson?.transferTask) return;
    const answer = transferAnswers[selectedLesson.id] ?? "";
    const validation = evaluateExerciseAnswer(selectedLesson.transferTask, answer);
    const passed = validation.passed;

    setTransferFeedback((current) => ({
      ...current,
      [selectedLesson.id]: passed
        ? selectedLesson.transferTask!.successMessage
        : validation.hint ??
          "Transfer response needs more evidence. Refine your plan and try again.",
    }));

    setLessonGateFeedback(null);

    const record: AttemptRecord = {
      id: createId("attempt"),
      lessonId: selectedLesson.id,
      exerciseId: selectedLesson.transferTask.id,
      assessmentType: "transfer",
      answer,
      passed,
      attemptedAt: new Date().toISOString(),
    };
    setAttempts((current) => [record, ...current].slice(0, 500));

    if (passed) {
      setTransferProgress((current) => ({
        ...current,
        [selectedLesson.id]: true,
      }));
      addArtifact(
        "transfer",
        `Transfer evidence: ${selectedLesson.title}`,
        answer,
        selectedLesson.id,
      );
    }
  }

  function saveNoteArtifact(lessonId: string) {
    const note = notes[lessonId] ?? "";
    addArtifact("note", "Lesson note", note, lessonId);
  }

  function advanceHint(exerciseId: string) {
    const key = `${selectedLesson?.id ?? ""}:${exerciseId}`;
    setHintLevels((prev) => ({
      ...prev,
      [key]: Math.min(2, (prev[key] ?? 0) + 1),
    }));
  }

  useEffect(() => {
    function handleKeyboard(e: KeyboardEvent) {
      const tag = (e.target as HTMLElement)?.tagName;
      if (tag === "INPUT" || tag === "TEXTAREA") return;

      if (e.key === "j" && nextEntry) {
        navigateToEntry(nextEntry);
      } else if (e.key === "k" && prevEntry) {
        navigateToEntry(prevEntry);
      }
    }

    window.addEventListener("keydown", handleKeyboard);
    return () => window.removeEventListener("keydown", handleKeyboard);
  });

  const currentHintLevels = useMemo(() => {
    const prefix = `${selectedLesson?.id ?? ""}:`;
    return Object.fromEntries(
      Object.entries(hintLevels)
        .filter(([k]) => k.startsWith(prefix))
        .map(([k, v]) => [k.slice(prefix.length), v]),
    );
  }, [hintLevels, selectedLesson?.id]);

  if (!selectedPhase || !selectedCourse || !selectedLesson) {
    return null;
  }

  const completedWithinPhase = selectedPhase.courses
    .flatMap((course) => course.lessons)
    .filter((lesson) => progress[lesson.id]).length;
  const totalWithinPhase = selectedPhase.courses.flatMap(
    (course) => course.lessons,
  ).length;
  const transferLessonsWithinPhase = selectedPhase.courses
    .flatMap((course) => course.lessons)
    .filter((lesson) => lesson.transferTask != null);
  const transferEvidenceWithinPhase = transferLessonsWithinPhase.filter(
    (lesson) => transferProgress[lesson.id],
  ).length;
  const selectedLessonTransferPassed = Boolean(transferProgress[selectedLesson.id]);
  const selectedLessonEvidenceGate = evaluateLessonEvidenceGate(
    selectedLesson,
    answers,
    selectedLessonTransferPassed,
  );

  return (
    <main className="shell">
      <button
        type="button"
        className="theme-toggle"
        onClick={toggleTheme}
        aria-label="Toggle theme"
      >
        <span className="theme-icon">{theme === "dark" ? "☀️" : "🌙"}</span>
        <span>{theme === "dark" ? "Light" : "Dark"}</span>
      </button>

      <section className="hero">
        <span className="eyebrow">
          Interactive software engineering training
        </span>
        <h1>{curriculum.productTitle}</h1>
        <p>{curriculum.productVision}</p>
        <div className="hero-grid">
          <div className="stats">
            <article className="stat-card">
              <span>Progression model</span>
              <div className="stat-value">
                {curriculum.phases.length} phases
              </div>
              <p>
                Computer mastery, engineering foundations, and modern
                AI-assisted delivery.
              </p>
            </article>
            <article className="stat-card">
              <span>Tracked completion</span>
              <div className="stat-value">{percentComplete}%</div>
              <p>
                Local progress persistence across lessons, notes, and validation
                exercises.
              </p>
            </article>
            <article className="stat-card">
              <span>Core promise</span>
              <div className="stat-value">Learn by doing</div>
              <p>
                Operational confidence first, programming understanding second,
                disciplined engineering execution third.
              </p>
            </article>
            <article className="stat-card">
              <span>Activity streak</span>
              <div className="stat-value streak-value">
                {activityStreak > 0 ? `${activityStreak}d` : "—"}
              </div>
              <p>
                {activityStreak > 1
                  ? `${activityStreak} consecutive days of activity.`
                  : activityStreak === 1
                    ? "Active today. Keep building the habit."
                    : "Complete your first lesson to start a streak."}
              </p>
            </article>
          </div>
          <article className="timeline-card">
            <h4>How the system trains</h4>
            <ul className="retention-list">
              <li>Explain the concept with operational clarity.</li>
              <li>Demonstrate the workflow in a guided environment.</li>
              <li>Require hands-on action and validate the response.</li>
              <li>Retain notes, outputs, and completion state for review.</li>
            </ul>
          </article>
        </div>
      </section>

      <section className="main-grid">
        <aside className="sidebar">
          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>Phases</h3>
                <p>
                  Progressive learning path from operational fluency to real
                  engineering work.
                </p>
              </div>
              <span className="tag">{curriculum.phases.length} total</span>
            </div>

            <progress
              className="progress-meter"
              aria-label="Overall completion"
              max={100}
              value={percentComplete}
            />

            <ul className="phase-list">
              {curriculum.phases.map((phase) => {
                const phaseLessonCount = phase.courses.flatMap(
                  (course) => course.lessons,
                ).length;
                const phaseCompletedCount = phase.courses
                  .flatMap((course) => course.lessons)
                  .filter((lesson) => progress[lesson.id]).length;

                return (
                  <li key={phase.id}>
                    <button
                      type="button"
                      className={`phase-button ${phase.id === selectedPhase.id ? "active" : ""}`}
                      onClick={() => selectPhase(phase.id)}
                    >
                      <span className="phase-kicker">{phase.level}</span>
                      <span className="phase-title">{phase.title}</span>
                      <div className="phase-metrics">
                        <span>{phase.duration}</span>
                        <span>
                          {phaseCompletedCount}/{phaseLessonCount} lessons
                        </span>
                      </div>
                    </button>
                  </li>
                );
              })}
            </ul>
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>{selectedPhase.title}</h3>
                <p>{selectedPhase.strapline}</p>
              </div>
              <span className="tag">
                {completedWithinPhase}/{totalWithinPhase}
              </span>
            </div>
            <p>{selectedPhase.purpose}</p>
            <ul className="tool-list">
              {selectedPhase.tools.map((tool) => (
                <li key={tool}>{tool}</li>
              ))}
            </ul>
          </section>
        </aside>

        <section className="content">
          <section className="panel">
            <nav className="breadcrumbs">
              <button
                type="button"
                className="breadcrumb-link"
                onClick={() => selectPhase(selectedPhase.id)}
              >
                {selectedPhase.title}
              </button>
              <span>›</span>
              <button
                type="button"
                className="breadcrumb-link"
                onClick={() => selectCourse(selectedCourse.id)}
              >
                {selectedCourse.title}
              </button>
              <span>›</span>
              <span>{selectedLesson.title}</span>
            </nav>

            <div className="lesson-headline">
              <span className="eyebrow">Current lesson</span>
              <span
                className={`status-pill ${progress[selectedLesson.id] ? "complete" : "pending"}`}
              >
                {progress[selectedLesson.id] ? "Completed" : "In progress"}
              </span>
            </div>
            <h2>{selectedLesson.title}</h2>
            <p className="lesson-overview">{selectedLesson.summary}</p>

            <div className="lesson-actions">
              {selectedPhase.courses.map((course) => (
                <button
                  key={course.id}
                  type="button"
                  className={`course-chip ${selectedCourse.id === course.id ? "active" : ""}`}
                  onClick={() => selectCourse(course.id)}
                >
                  {course.title}
                </button>
              ))}
              <button
                type="button"
                className={`toggle-chip ${showCompletedOnly ? "active" : ""}`}
                onClick={() => setShowCompletedOnly((current) => !current)}
              >
                {showCompletedOnly
                  ? "Showing completed only"
                  : "Show completed only"}
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() =>
                  setLessonCompletion(
                    selectedLesson.id,
                    !progress[selectedLesson.id],
                  )
                }
              >
                {progress[selectedLesson.id]
                  ? "Mark incomplete"
                  : "Mark complete"}
              </button>
              <button
                type="button"
                className="ghost-button reset-lab-button"
                onClick={resetLab}
              >
                ↺ Reset lab
              </button>
            </div>
            {lessonGateFeedback ? (
              <p className="panel-subtext">{lessonGateFeedback}</p>
            ) : null}

            <div className="lesson-meta">
              <span className="metric-pill">{selectedLesson.duration}</span>
              <span className="metric-pill">{selectedLesson.difficulty}</span>
              <span
                className={`status-pill ${selectedLessonEvidenceGate.passed ? "complete" : "pending"}`}
              >
                {selectedLessonEvidenceGate.passed
                  ? "Evidence gate ready"
                  : "Evidence gate pending"}
              </span>
              {selectedLesson.scaffoldingLevel ? (
                <span
                  className={`scaffolding-badge scaffolding-${selectedLesson.scaffoldingLevel}`}
                >
                  {selectedLesson.scaffoldingLevel === "step-by-step"
                    ? "Guided"
                    : selectedLesson.scaffoldingLevel === "goal-driven"
                      ? "Goal-driven"
                      : "Ticket-style"}
                </span>
              ) : null}
              {selectedLesson.transferTask ? (
                <span
                  className={`status-pill ${selectedLessonTransferPassed ? "complete" : "pending"}`}
                >
                  {selectedLessonTransferPassed
                    ? "Transfer evidence passed"
                    : "Transfer evidence pending"}
                </span>
              ) : null}
              <span className="metric-pill">
                Objective: {selectedLesson.objective}
              </span>
            </div>
          </section>

          <section className="section-grid">
            <article className="lesson-card">
              <h4>Concept explanation</h4>
              {selectedLesson.explanation.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>

            <article className="lesson-card">
              <h4>Guided demonstration</h4>
              {selectedLesson.demonstration.map((paragraph) => (
                <p key={paragraph}>{paragraph}</p>
              ))}
            </article>
          </section>

          <section className="exercise-grid">
            <article className="exercise-card">
              <h4>Hands-on exercise</h4>
              <ol className="exercise-list">
                {selectedLesson.exerciseSteps.map((step) => (
                  <li key={step}>{step}</li>
                ))}
              </ol>
            </article>

            <article className="check-card">
              <h4>Validation criteria</h4>
              <ul className="validation-list">
                {selectedLesson.validationChecks.map((check) => (
                  <li key={check}>{check}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="validation-grid">
            {selectedLesson.exercises.map((exercise) => {
              const exerciseAnswer = answers[exercise.id] ?? "";
              const exerciseFeedback = feedback[exercise.id];
              const isCorrect = evaluateExerciseAnswer(
                exercise,
                exerciseAnswer,
              ).passed;

              return (
                <article className="exercise-card" key={exercise.id}>
                  <div className="exercise-card-header">
                    <h4>{exercise.title}</h4>
                    {exercise.assessmentType ? (
                      <span
                        className={`assessment-badge assessment-${exercise.assessmentType}`}
                      >
                        {exercise.assessmentType}
                      </span>
                    ) : null}
                  </div>
                  <p>{exercise.prompt}</p>
                  <input
                    aria-label={exercise.title}
                    value={exerciseAnswer}
                    onChange={(event) =>
                      updateAnswer(exercise.id, event.target.value)
                    }
                    placeholder={exercise.placeholder}
                  />
                  <div className="toolbar">
                    <button
                      type="button"
                      className="validate-button"
                      onClick={() => validateExercise(exercise)}
                    >
                      Validate
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      disabled={
                        isCorrect || (currentHintLevels[exercise.id] ?? 0) >= 2
                      }
                      onClick={() => advanceHint(exercise.id)}
                    >
                      {(currentHintLevels[exercise.id] ?? 0) === 0
                        ? "Need a hint?"
                        : (currentHintLevels[exercise.id] ?? 0) === 1
                          ? "More help"
                          : "Hint shown"}
                    </button>
                    <span
                      className={`status-pill ${
                        isCorrect ? "complete" : "pending"
                      }`}
                    >
                      {isCorrect ? "✓ Ready" : "Needs review"}
                    </span>
                  </div>
                  {exerciseFeedback ? (
                    <div
                      className={`feedback ${isCorrect ? "success" : "warning"}`}
                    >
                      {exerciseFeedback}
                    </div>
                  ) : null}
                  {(currentHintLevels[exercise.id] ?? 0) >= 1 ? (
                    <div className="hint-layer">
                      {(currentHintLevels[exercise.id] ?? 0) === 1
                        ? "Take a closer look at the question. Think about the core concept being tested, then try again."
                        : exercise.hint}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </section>

          {selectedLesson.transferTask ? (
            <section className="validation-grid">
              <article className="exercise-card transfer-task-card">
                <div className="exercise-card-header">
                  <h4>{selectedLesson.transferTask.title}</h4>
                  <span className="assessment-badge assessment-transfer">
                    transfer
                  </span>
                </div>
                <p>{selectedLesson.transferTask.prompt}</p>
                <input
                  aria-label={selectedLesson.transferTask.title}
                  value={transferAnswers[selectedLesson.id] ?? ""}
                  onChange={(event) =>
                    setTransferAnswers((current) => ({
                      ...current,
                      [selectedLesson.id]: event.target.value,
                    }))
                  }
                  placeholder={selectedLesson.transferTask.placeholder}
                />
                <div className="toolbar">
                  <button
                    type="button"
                    className="validate-button"
                    onClick={validateTransferTask}
                  >
                    Validate transfer
                  </button>
                  <span
                    className={`status-pill ${selectedLessonTransferPassed ? "complete" : "pending"}`}
                  >
                    {selectedLessonTransferPassed ? "Passed" : "Not passed"}
                  </span>
                </div>
                {transferFeedback[selectedLesson.id] ? (
                  <div
                    className={`feedback ${selectedLessonTransferPassed ? "success" : "warning"}`}
                  >
                    {transferFeedback[selectedLesson.id]}
                  </div>
                ) : null}
                <div className="hint-layer">{selectedLesson.transferTask.hint}</div>
              </article>
            </section>
          ) : null}

          {selectedLesson.codeExercises &&
          selectedLesson.codeExercises.length > 0 ? (
            <section className="code-exercises-section">
              {selectedLesson.codeExercises.map((ex) => (
                <CodeExercise
                  key={ex.id}
                  title={ex.title}
                  description={ex.description}
                  starterCode={ex.starterCode}
                  language={ex.language}
                  hint={ex.hint}
                  validateFn={(code) => {
                    const passed = ex.acceptedPatterns.some((pattern) =>
                      code.includes(pattern),
                    );
                    return {
                      passed,
                      message: passed
                        ? "Pattern matched. Good structure."
                        : "Not quite — re-read the description and look for the expected pattern.",
                    };
                  }}
                />
              ))}
            </section>
          ) : null}

          <section className="notes-grid">
            <article className="note-card">
              <h4>Saved notes</h4>
              <p>{selectedLesson.notesPrompt}</p>
              <textarea
                aria-label="Lesson notes"
                value={notes[selectedLesson.id] ?? ""}
                onChange={(event) =>
                  updateNote(selectedLesson.id, event.target.value)
                }
                placeholder="Capture notes, commands, mistakes, and things to revisit later."
              />
              <p className="microcopy">
                Notes are stored locally for spaced repetition review.
              </p>
              <div className="notes-review-row">
                <span className="review-meta">
                  {recentArtifacts.length} saved artifacts for this lesson
                </span>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => saveNoteArtifact(selectedLesson.id)}
                >
                  Save note artifact
                </button>
              </div>
              {reviews[selectedLesson.id] != null ? (
                <div className="notes-review-row">
                  <span className="review-meta">
                    {reviews[selectedLesson.id].reviewCount > 0
                      ? `Reviewed ${reviews[selectedLesson.id].reviewCount}×`
                      : reviews[selectedLesson.id] != null &&
                          isDueForReview(reviews[selectedLesson.id])
                        ? "Due for review"
                        : "Not yet reviewed — check back soon"}
                  </span>
                  <button
                    type="button"
                    className="ghost-button"
                    onClick={() => markReviewed(selectedLesson.id)}
                  >
                    Mark reviewed
                  </button>
                </div>
              ) : null}
            </article>

            <article className="note-card">
              <h4>Retention cues</h4>
              <ul className="retention-list">
                {selectedLesson.retention.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            </article>
          </section>

          {showTerminal ? (
            <section className="lesson-terminal-section panel">
              <h4>Practice terminal</h4>
              <p className="terminal-intro-text">
                Try the commands from this lesson in a safe, simulated
                environment. Type <code>help</code> for available commands.
              </p>
              <TerminalSimulator />
            </section>
          ) : null}

          <nav className="lesson-nav">
            {prevEntry ? (
              <button
                type="button"
                className="lesson-nav-button"
                onClick={() => navigateToEntry(prevEntry)}
              >
                <span>←</span>
                <span className="lesson-nav-label">
                  <span className="lesson-nav-kicker">Previous</span>
                  <span className="lesson-nav-title">
                    {prevEntry.lesson.title}
                  </span>
                </span>
              </button>
            ) : (
              <span className="nav-spacer" />
            )}
            {nextEntry ? (
              <button
                type="button"
                className="lesson-nav-button"
                onClick={() => navigateToEntry(nextEntry)}
              >
                <span className="lesson-nav-label right">
                  <span className="lesson-nav-kicker">Next</span>
                  <span className="lesson-nav-title">
                    {nextEntry.lesson.title}
                  </span>
                </span>
                <span>→</span>
              </button>
            ) : (
              <span className="nav-spacer" />
            )}
          </nav>
        </section>

        <aside className="rail">
          <section className="panel">
            <h3>Learner profile</h3>
            <div className="profile-grid">
              <label className="profile-field">
                <span>Name</span>
                <input
                  aria-label="Learner name"
                  value={learnerProfile.displayName}
                  onChange={(event) =>
                    updateLearnerProfile({ displayName: event.target.value })
                  }
                  placeholder="Your name"
                />
              </label>
              <label className="profile-field">
                <span>Weekly hours</span>
                <input
                  aria-label="Weekly hours"
                  type="number"
                  min={1}
                  max={40}
                  value={learnerProfile.weeklyHours}
                  onChange={(event) =>
                    updateLearnerProfile({
                      weeklyHours: Math.max(
                        1,
                        Number.parseInt(event.target.value || "1", 10),
                      ),
                    })
                  }
                />
              </label>
              <label className="profile-field">
                <span>Current goal</span>
                <input
                  aria-label="Current goal"
                  value={learnerProfile.goal}
                  onChange={(event) =>
                    updateLearnerProfile({ goal: event.target.value })
                  }
                  placeholder="Example: Complete Phase 1 this month"
                />
              </label>
            </div>
          </section>

          <section className="panel">
            <h3>Evidence and attempts</h3>
            <p className="panel-subtext">
              Attempts and artifacts are saved locally as evidence for mastery
              gates.
            </p>
            <div className="phase-metrics">
              <span>{recentAttempts.length} recent attempts</span>
              <span>{recentArtifacts.length} lesson artifacts</span>
              <span>
                {transferEvidenceWithinPhase}/
                {transferLessonsWithinPhase.length} transfer gates passed
              </span>
            </div>
            {recentAttempts.length > 0 ? (
              <ul className="review-queue-list">
                {recentAttempts.map((attempt) => (
                  <li key={attempt.id}>
                    <div className="review-queue-item static-item">
                      <span className="review-course">{attempt.assessmentType}</span>
                      <span className="review-lesson">
                        {attempt.passed ? "Passed" : "Needs work"} · {attempt.exerciseId}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="microcopy">No attempts logged for this lesson yet.</p>
            )}
          </section>

          <section className="panel">
            <h3>Lessons in this course</h3>
            <progress
              className="course-progress"
              max={selectedCourse.lessons.length}
              value={
                selectedCourse.lessons.filter((l) => progress[l.id]).length
              }
              aria-label="Course completion"
            />
            <ul className="lesson-list">
              {visibleLessons.map((lesson) => (
                <li key={lesson.id}>
                  <button
                    type="button"
                    className={`lesson-button ${lesson.id === selectedLesson.id ? "active" : ""}`}
                    onClick={() => setSelectedLessonId(lesson.id)}
                  >
                    <span className="lesson-kicker">{lesson.duration}</span>
                    <span className="lesson-title">{lesson.title}</span>
                    <div className="lesson-button-status">
                      {reviews[lesson.id] != null &&
                      isDueForReview(reviews[lesson.id]) ? (
                        <span className="due-pill">Due</span>
                      ) : null}
                      <span
                        className={`status-pill ${progress[lesson.id] ? "complete" : "pending"}`}
                      >
                        {progress[lesson.id] ? "Complete" : "Pending"}
                      </span>
                    </div>
                  </button>
                </li>
              ))}
            </ul>
          </section>

          {reviewQueue.length > 0 ? (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>Due for review</h3>
                  <p>Spaced repetition keeps knowledge fresh.</p>
                </div>
                <span className="tag due-count">{reviewQueue.length}</span>
              </div>
              <ul className="review-queue-list">
                {reviewQueue.slice(0, 5).map(({ phase, course, lesson }) => (
                  <li key={lesson.id}>
                    <button
                      type="button"
                      className="review-queue-item"
                      onClick={() => navigateToEntry({ phase, course, lesson })}
                    >
                      <span className="review-course">{course.title}</span>
                      <span className="review-lesson">{lesson.title}</span>
                    </button>
                  </li>
                ))}
                {reviewQueue.length > 5 ? (
                  <li className="review-more">
                    +{reviewQueue.length - 5} more due
                  </li>
                ) : null}
              </ul>
            </section>
          ) : null}

          <section className="panel">
            <h3>Safe lab design</h3>
            <div className="lab-grid">
              <article className="safety-card">
                <h4>Guardrails</h4>
                <ul className="safety-list">
                  {selectedPhase.guardrails.map((item) => (
                    <li key={item}>{item}</li>
                  ))}
                </ul>
              </article>
              <article className="safety-card">
                <h4>Environment</h4>
                <p>{selectedPhase.environment}</p>
                <div className="chip-row">
                  <span className="safety-tag">Resettable labs</span>
                  <span className="safety-tag">Scoped permissions</span>
                  <span className="safety-tag">Replayable actions</span>
                </div>
              </article>
            </div>
          </section>

          <section className="panel">
            <h3>Practical outcomes</h3>
            <div className="project-grid">
              <article className="project-card">
                <h4>Milestones</h4>
                <ul className="project-list">
                  {selectedPhase.milestones.map((milestone) => (
                    <li key={milestone}>{milestone}</li>
                  ))}
                </ul>
              </article>
              <article className="project-card">
                <h4>Phase projects</h4>
                <ul className="deliverable-list">
                  {selectedPhase.projects.map((project) => (
                    <li key={project}>{project}</li>
                  ))}
                </ul>
              </article>
            </div>
          </section>

          {selectedPhase.competencyFocus &&
          selectedPhase.competencyFocus.length > 0 ? (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>Competency progress</h3>
                  <p>Tracked against completed lessons in this phase.</p>
                </div>
              </div>
              <div className="competency-list">
                {selectedPhase.competencyFocus.map((track) => {
                  const count = competencyLevels[track] ?? 0;
                  const level = getMasteryLevel(count);
                  return (
                    <div className="competency-item" key={track}>
                      <div className="competency-row">
                        <span className="competency-track">
                          {formatTrackName(track)}
                        </span>
                        <span className={`mastery-badge mastery-${level}`}>
                          {level}
                        </span>
                      </div>
                      <progress
                        className="mastery-bar"
                        max={15}
                        value={count}
                        aria-label={`${formatTrackName(track)} mastery`}
                      />
                    </div>
                  );
                })}
              </div>
            </section>
          ) : null}

          {selectedPhase.exitStandard
            ? (() => {
                const gates = selectedPhase.exitStandard.gates;
                const competencyGatesPassed = gates.every(
                  (gate) =>
                    (competencyLevels[gate.competency] ?? 0) >=
                    getLevelThreshold(gate.requiredLevel),
                );
                const transferGatePassed =
                  transferLessonsWithinPhase.length === 0 ||
                  transferEvidenceWithinPhase > 0;
                const allPassed = competencyGatesPassed && transferGatePassed;
                const nextPhaseIndex =
                  curriculum.phases.findIndex(
                    (p) => p.id === selectedPhase.id,
                  ) + 1;
                const nextPhase = curriculum.phases[nextPhaseIndex];
                return (
                  <>
                    <section className="panel">
                      <h3>Phase exit gates</h3>
                      <p className="panel-subtext">
                        {selectedPhase.exitStandard.summary}
                      </p>
                      <ul className="gate-list">
                        {gates.map((gate) => {
                          const count = competencyLevels[gate.competency] ?? 0;
                          const passed =
                            count >= getLevelThreshold(gate.requiredLevel);
                          return (
                            <li
                              key={`${gate.competency}-${gate.description}`}
                              className={`gate-item ${passed ? "gate-passed" : "gate-pending"}`}
                            >
                              <span className="gate-icon" aria-hidden="true">
                                {passed ? "✓" : "○"}
                              </span>
                              <span className="gate-description">
                                {gate.description}
                                <span className="gate-level">
                                  {gate.requiredLevel}
                                </span>
                              </span>
                            </li>
                          );
                        })}
                        <li
                          className={`gate-item ${transferGatePassed ? "gate-passed" : "gate-pending"}`}
                        >
                          <span className="gate-icon" aria-hidden="true">
                            {transferGatePassed ? "✓" : "○"}
                          </span>
                          <span className="gate-description">
                            Pass at least one transfer challenge in this phase
                            <span className="gate-level">
                              {transferEvidenceWithinPhase}/
                              {transferLessonsWithinPhase.length} complete
                            </span>
                          </span>
                        </li>
                      </ul>
                    </section>
                    {allPassed && nextPhase ? (
                      <section className="panel phase-advance-panel">
                        <div className="phase-advance-content">
                          <span
                            className="phase-advance-icon"
                            aria-hidden="true"
                          >
                            🏆
                          </span>
                          <div>
                            <h3>Phase complete!</h3>
                            <p>
                              All exit gates cleared. You are ready to advance
                              to <strong>{nextPhase.title}</strong>.
                            </p>
                            <button
                              type="button"
                              className="validate-button phase-advance-button"
                              onClick={() => selectPhase(nextPhase.id)}
                            >
                              Start {nextPhase.title} →
                            </button>
                          </div>
                        </div>
                      </section>
                    ) : null}
                  </>
                );
              })()
            : null}
        </aside>
      </section>
    </main>
  );
}
