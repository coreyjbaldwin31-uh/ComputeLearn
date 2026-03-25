"use client";

import type { Curriculum, Exercise, Lesson } from "@/data/curriculum";
import {
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  useSyncExternalStore,
} from "react";
import { TerminalSimulator } from "./terminal-simulator";

type ProgressState = Record<string, true>;
type NotesState = Record<string, string>;
type AnswerState = Record<string, string>;

type TrainingPlatformProps = {
  curriculum: Curriculum;
};

const progressStorageKey = "computelearn-progress";
const notesStorageKey = "computelearn-notes";

const emptyProgress: ProgressState = {};
const emptyNotes: NotesState = {};

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

function normalize(value: string) {
  return value.trim().toLowerCase();
}

function isExerciseCorrect(exercise: Exercise, answer: string) {
  const normalizedAnswer = normalize(answer);

  if (!normalizedAnswer) {
    return false;
  }

  return exercise.acceptedAnswers.some((acceptedAnswer) => {
    const normalizedAccepted = normalize(acceptedAnswer);
    return exercise.validationMode === "exact"
      ? normalizedAnswer === normalizedAccepted
      : normalizedAnswer.includes(normalizedAccepted);
  });
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
  const [showCompletedOnly, setShowCompletedOnly] = useState(false);
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
    setProgress((current) => {
      if (isComplete) {
        return { ...current, [lessonId]: true };
      }

      const next = { ...current };
      delete next[lessonId];
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
    const answer = answers[exercise.id] ?? "";
    const passed = isExerciseCorrect(exercise, answer);

    setFeedback((current) => ({
      ...current,
      [exercise.id]: passed ? exercise.successMessage : exercise.hint,
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

  if (!selectedPhase || !selectedCourse || !selectedLesson) {
    return null;
  }

  const completedWithinPhase = selectedPhase.courses
    .flatMap((course) => course.lessons)
    .filter((lesson) => progress[lesson.id]).length;
  const totalWithinPhase = selectedPhase.courses.flatMap(
    (course) => course.lessons,
  ).length;

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
              <p>{curriculum.promise}</p>
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
            </div>

            <div className="lesson-meta">
              <span className="metric-pill">{selectedLesson.duration}</span>
              <span className="metric-pill">{selectedLesson.difficulty}</span>
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
              const isCorrect = isExerciseCorrect(exercise, exerciseAnswer);

              return (
                <article className="exercise-card" key={exercise.id}>
                  <h4>{exercise.title}</h4>
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
                      Validate answer
                    </button>
                    <span
                      className={`status-pill ${isCorrect ? "complete" : "pending"}`}
                    >
                      {isCorrect ? "Ready" : "Needs review"}
                    </span>
                  </div>
                  {exerciseFeedback ? (
                    <div
                      className={`feedback ${isCorrect ? "success" : "warning"}`}
                    >
                      {exerciseFeedback}
                    </div>
                  ) : null}
                </article>
              );
            })}
          </section>

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
                Notes are stored locally for review and spaced repetition.
              </p>
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
              <p style={{ color: "var(--muted)", marginBottom: 14 }}>
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
            <h3>Lessons in this course</h3>
            <div className="course-progress">
              <div
                className="course-progress-fill"
                style={{
                  width: `${selectedCourse.lessons.length === 0 ? 0 : Math.round((selectedCourse.lessons.filter((l) => progress[l.id]).length / selectedCourse.lessons.length) * 100)}%`,
                }}
              />
            </div>
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
                    <span
                      className={`status-pill ${progress[lesson.id] ? "complete" : "pending"}`}
                    >
                      {progress[lesson.id] ? "Complete" : "Pending"}
                    </span>
                  </button>
                </li>
              ))}
            </ul>
          </section>

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
        </aside>
      </section>
    </main>
  );
}
