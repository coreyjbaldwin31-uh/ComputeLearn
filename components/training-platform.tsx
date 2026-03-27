"use client";

import type { Curriculum, Exercise, Lesson } from "@/data/curriculum";
import {
  buildArtifactBrowserSummary,
  getArtifactPreview,
} from "@/lib/artifact-browser-engine";
import { buildArtifactCompletionSummary } from "@/lib/artifact-completion-engine";
import type { ArtifactRecord } from "@/lib/artifact-engine";
import {
  type AttemptRecord,
  buildArtifactRecord,
  buildAttemptRecord,
  createId,
  formatCompletionContent,
} from "@/lib/artifact-engine";
import {
  buildArtifactExportDocument,
  buildArtifactExportFilename,
} from "@/lib/artifact-export-engine";
import { buildAttemptAnalyticsSummary } from "@/lib/attempt-analytics-engine";
import { buildCompetencyDashboardSummary } from "@/lib/competency-dashboard-engine";
import { getWeakCompetencyTracks } from "@/lib/competency-engine";
import {
  advanceHintLevel,
  getHintButtonLabel,
  getHintText,
  isHintExhausted,
} from "@/lib/hint-engine";
import { buildIndependentLabSummary } from "@/lib/independent-lab-engine";
import { buildIndependentReadinessSummary } from "@/lib/independent-readiness-engine";
import { buildExerciseInspection } from "@/lib/inspection-engine";
import { evaluatePhaseMilestoneStatus } from "@/lib/milestone-engine";
import { buildMilestonePassRateSummary } from "@/lib/milestone-pass-rate-engine";
import { buildOutcomesDashboardSummary } from "@/lib/outcomes-dashboard-engine";
import { buildPhaseStatusRecords } from "@/lib/phase-status-engine";
import {
  calculateActivityStreak,
  calculateCompetencyLevels,
  calculatePercentComplete,
  evaluatePhaseExitStatus,
  flattenLessonEntries,
  formatTrackName,
  getDueReviewQueue,
  getLessonNeighbors,
  getMasteryLevel,
  getPhaseProgressSnapshot,
  isDueForReview,
} from "@/lib/progression-engine";
import {
  buildReflectionPrompts,
  formatReflectionArtifactContent,
} from "@/lib/reflection-engine";
import {
  getReinforcementQueue,
  getWeakTrackHits,
} from "@/lib/reinforcement-engine";
import { buildPhaseTransferAnalytics } from "@/lib/transfer-analytics-engine";
import {
  evaluateExerciseAnswer,
  evaluateLessonEvidenceGate,
} from "@/lib/validation-engine";
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
type ReflectionState = Record<string, string>;

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

type TrainingPlatformProps = {
  curriculum: Curriculum;
};

const progressStorageKey = "computelearn-progress";
const notesStorageKey = "computelearn-notes";
const reflectionsStorageKey = "computelearn-reflections";
const reviewsStorageKey = "computelearn-reviews";
const learnerProfileStorageKey = "computelearn-learner-profile";
const attemptsStorageKey = "computelearn-attempts";
const artifactsStorageKey = "computelearn-artifacts";
const transferStorageKey = "computelearn-transfer";

const emptyProgress: ProgressState = {};
const emptyNotes: NotesState = {};
const emptyReflections: ReflectionState = {};
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
  const [reflections, setReflections] = useLocalStorageState<ReflectionState>(
    reflectionsStorageKey,
    emptyReflections,
  );
  const [answers, setAnswers] = useState<AnswerState>({});
  const [feedback, setFeedback] = useState<Record<string, string>>({});
  const [hintLevels, setHintLevels] = useState<Record<string, number>>({});
  const [inspectionOpen, setInspectionOpen] = useState<Record<string, boolean>>(
    {},
  );
  const [transferAnswers, setTransferAnswers] = useState<
    Record<string, string>
  >({});
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
  const [learnerProfile, setLearnerProfile] =
    useLocalStorageState<LearnerProfile>(
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

  const percentComplete = useMemo(
    () => calculatePercentComplete(curriculum, progress),
    [curriculum, progress],
  );

  const allLessonsFlat = useMemo(
    () => flattenLessonEntries(curriculum),
    [curriculum],
  );

  const lessonNeighbors = useMemo(
    () => getLessonNeighbors(allLessonsFlat, selectedLesson?.id),
    [allLessonsFlat, selectedLesson?.id],
  );
  const prevEntry = lessonNeighbors.previous;
  const nextEntry = lessonNeighbors.next;

  const showTerminal = selectedPhase?.id === "phase-1";

  const competencyLevels = useMemo(
    () => calculateCompetencyLevels(curriculum, progress),
    [curriculum, progress],
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

  const reviewQueue = useMemo(() => {
    return getDueReviewQueue(allLessonsFlat, reviews);
  }, [allLessonsFlat, reviews]);

  const selectedPhaseEntries = useMemo(
    () =>
      allLessonsFlat.filter((entry) => entry.phase.id === selectedPhase?.id),
    [allLessonsFlat, selectedPhase?.id],
  );

  const reinforcementQueue = useMemo(() => {
    return getReinforcementQueue(allLessonsFlat, reviews, weakCompetencyTracks);
  }, [allLessonsFlat, reviews, weakCompetencyTracks]);

  const phaseReinforcementQueue = useMemo(() => {
    return getReinforcementQueue(
      selectedPhaseEntries,
      reviews,
      weakCompetencyTracks,
    );
  }, [reviews, selectedPhaseEntries, weakCompetencyTracks]);

  const phaseProgressSnapshot = useMemo(
    () =>
      selectedPhase
        ? getPhaseProgressSnapshot(selectedPhase, progress, transferProgress)
        : null,
    [selectedPhase, progress, transferProgress],
  );

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

  const attemptAnalytics = useMemo(
    () => buildAttemptAnalyticsSummary(attempts),
    [attempts],
  );

  const lessonAttemptAnalytics = useMemo(
    () => buildAttemptAnalyticsSummary(attempts, selectedLesson?.id),
    [attempts, selectedLesson?.id],
  );

  const phaseStatuses = useMemo(
    () =>
      buildPhaseStatusRecords(
        curriculum,
        progress,
        transferProgress,
        competencyLevels,
        reviews,
      ),
    [curriculum, progress, transferProgress, competencyLevels, reviews],
  );

  const lessonArtifactSummary = useMemo(
    () => buildArtifactBrowserSummary(artifacts, selectedLesson?.id),
    [artifacts, selectedLesson?.id],
  );

  const artifactCompletionSummary = useMemo(
    () => buildArtifactCompletionSummary(curriculum, progress, artifacts),
    [artifacts, curriculum, progress],
  );

  const competencyDashboard = useMemo(
    () => buildCompetencyDashboardSummary(competencyLevels),
    [competencyLevels],
  );

  const phaseTransferAnalytics = useMemo(
    () => buildPhaseTransferAnalytics(curriculum, transferProgress),
    [curriculum, transferProgress],
  );

  const milestonePassRateSummary = useMemo(
    () => buildMilestonePassRateSummary(phaseStatuses),
    [phaseStatuses],
  );

  const independentReadiness = useMemo(
    () =>
      buildIndependentReadinessSummary(
        curriculum,
        progress,
        transferProgress,
        competencyLevels,
        artifacts,
      ),
    [artifacts, competencyLevels, curriculum, progress, transferProgress],
  );

  const independentLabSummary = useMemo(
    () =>
      buildIndependentLabSummary(
        curriculum,
        progress,
        transferProgress,
        attempts,
      ),
    [attempts, curriculum, progress, transferProgress],
  );

  const outcomesDashboardSummary = useMemo(
    () =>
      buildOutcomesDashboardSummary({
        transferAnalytics: phaseTransferAnalytics,
        independentLabSummary,
        attemptAnalytics,
        milestonePassRateSummary,
        artifactCompletionSummary,
      }),
    [
      artifactCompletionSummary,
      attemptAnalytics,
      independentLabSummary,
      milestonePassRateSummary,
      phaseTransferAnalytics,
    ],
  );

  const selectedLessonWeakTracks = useMemo(() => {
    if (!selectedLesson) return [];
    return getWeakTrackHits(selectedLesson, weakCompetencyTracks);
  }, [selectedLesson, weakCompetencyTracks]);

  const reflectionPrompts = useMemo(() => {
    if (!selectedLesson) return [];
    const reviewRecord = reviews[selectedLesson.id];
    return buildReflectionPrompts({
      lesson: selectedLesson,
      weakTracks: selectedLessonWeakTracks,
      isDueForReview:
        reviewRecord != null ? isDueForReview(reviewRecord) : false,
      reviewCount: reviewRecord?.reviewCount ?? 0,
    });
  }, [reviews, selectedLesson, selectedLessonWeakTracks]);

  function addArtifact(
    type: ArtifactRecord["type"],
    title: string,
    content: string,
    lessonId: string,
  ) {
    const trimmed = content.trim();
    if (!trimmed) return;
    const nextArtifact = buildArtifactRecord({
      id: createId("artifact"),
      lessonId,
      type,
      title,
      content: trimmed,
      createdAt: new Date().toISOString(),
    });
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

  const navigateToEntry = useCallback(
    (entry: {
      phase: typeof selectedPhase;
      course: typeof selectedCourse;
      lesson: Lesson;
    }) => {
      setSelectedPhaseId(entry.phase.id);
      setSelectedCourseId(entry.course.id);
      setSelectedLessonId(entry.lesson.id);
    },
    [],
  );

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
    const lesson = allLessonsFlat.find(
      (entry) => entry.lesson.id === lessonId,
    )?.lesson;

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
        formatCompletionContent(
          lesson?.title ?? lessonId,
          lesson?.exercises.length ?? 0,
          Boolean(transferProgress[lessonId]),
        ),
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

  function updateReflection(lessonId: string, value: string) {
    setReflections((current) => ({ ...current, [lessonId]: value }));
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
        : (validation.hint ??
          "Not quite right. Check your answer and try again."),
    }));

    setLessonGateFeedback(null);

    const record = buildAttemptRecord({
      id: createId("attempt"),
      lessonId: selectedLesson.id,
      exerciseId: exercise.id,
      assessmentType: exercise.assessmentType ?? "action",
      answer,
      passed,
      attemptedAt: new Date().toISOString(),
    });
    setAttempts((current) => [record, ...current].slice(0, 500));
  }

  function validateTransferTask() {
    if (!selectedLesson?.transferTask) return;
    const answer = transferAnswers[selectedLesson.id] ?? "";
    const validation = evaluateExerciseAnswer(
      selectedLesson.transferTask,
      answer,
    );
    const passed = validation.passed;

    setTransferFeedback((current) => ({
      ...current,
      [selectedLesson.id]: passed
        ? selectedLesson.transferTask!.successMessage
        : (validation.hint ??
          "Transfer response needs more evidence. Refine your plan and try again."),
    }));

    setLessonGateFeedback(null);

    const record = buildAttemptRecord({
      id: createId("attempt"),
      lessonId: selectedLesson.id,
      exerciseId: selectedLesson.transferTask.id,
      assessmentType: "transfer",
      answer,
      passed,
      attemptedAt: new Date().toISOString(),
    });
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

  function saveReflectionArtifact(lessonId: string) {
    if (!selectedLesson || selectedLesson.id !== lessonId) return;
    const reflection = reflections[lessonId] ?? "";
    const content = formatReflectionArtifactContent(
      selectedLesson.title,
      reflectionPrompts,
      reflection,
      selectedLessonWeakTracks,
    );
    addArtifact("reflection", "Reflection checkpoint", content, lessonId);
  }

  function advanceHint(exerciseId: string) {
    const key = `${selectedLesson?.id ?? ""}:${exerciseId}`;
    setHintLevels((prev) => ({
      ...prev,
      [key]: advanceHintLevel(prev[key] ?? 0),
    }));
  }

  function toggleInspection(exerciseId: string) {
    const key = `${selectedLesson?.id ?? ""}:${exerciseId}`;
    setInspectionOpen((prev) => ({
      ...prev,
      [key]: !prev[key],
    }));
  }

  function exportArtifacts(lessonId?: string) {
    const exportDocument = buildArtifactExportDocument(
      artifacts,
      allLessonsFlat,
      {
        lessonId,
      },
    );
    const blob = new Blob([exportDocument], {
      type: "text/markdown;charset=utf-8",
    });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = buildArtifactExportFilename(lessonId);
    document.body.append(link);
    link.click();
    link.remove();
    URL.revokeObjectURL(url);
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
  }, [navigateToEntry, nextEntry, prevEntry]);

  const currentHintLevels = useMemo(() => {
    const prefix = `${selectedLesson?.id ?? ""}:`;
    return Object.fromEntries(
      Object.entries(hintLevels)
        .filter(([k]) => k.startsWith(prefix))
        .map(([k, v]) => [k.slice(prefix.length), v]),
    );
  }, [hintLevels, selectedLesson?.id]);

  if (
    !selectedPhase ||
    !selectedCourse ||
    !selectedLesson ||
    !phaseProgressSnapshot
  ) {
    return null;
  }

  const {
    completedLessons: completedWithinPhase,
    totalLessons: totalWithinPhase,
    transferLessons: transferLessonsCount,
    transferEvidence: transferEvidenceWithinPhase,
  } = phaseProgressSnapshot;

  const phaseExitStatus = evaluatePhaseExitStatus(
    curriculum,
    selectedPhase.id,
    competencyLevels,
    transferEvidenceWithinPhase,
    transferLessonsCount,
  );
  const phaseMilestoneStatus = evaluatePhaseMilestoneStatus(
    phaseExitStatus,
    phaseReinforcementQueue.length,
  );
  const selectedLessonTransferPassed = Boolean(
    transferProgress[selectedLesson.id],
  );
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
                const status = phaseStatuses.find(
                  (record) => record.phaseId === phase.id,
                );
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
                        {status ? (
                          <span
                            className={`status-pill ${
                              status.statusLabel === "ready"
                                ? "complete"
                                : "pending"
                            }`}
                          >
                            {status.statusLabel === "not-started"
                              ? "Not started"
                              : status.statusLabel === "in-progress"
                                ? "In progress"
                                : status.statusLabel === "review-needed"
                                  ? "Review needed"
                                  : "Ready"}
                          </span>
                        ) : null}
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
              {selectedPhase.tools.map((tool, i) => (
                <li key={i}>{tool}</li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h3>Mastery overview</h3>
            <div className="phase-metrics">
              <span>{competencyDashboard.passingCount} strong tracks</span>
              <span>{competencyDashboard.weakCount} weak tracks</span>
            </div>
            {competencyDashboard.records.length > 0 ? (
              <ul className="review-queue-list">
                {competencyDashboard.records.slice(0, 5).map((record) => (
                  <li key={record.track}>
                    <div className="review-queue-item static-item">
                      <span className="review-course">{record.level}</span>
                      <span className="review-lesson">
                        {record.displayName}
                      </span>
                      <span className="microcopy">
                        {record.count} evidence point
                        {record.count === 1 ? "" : "s"}
                        {record.isWeak ? " · reinforcement suggested" : ""}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="microcopy">
                Complete lessons to build competency signals.
              </p>
            )}
          </section>

          <section className="panel">
            <h3>Transfer analytics</h3>
            <ul className="review-queue-list">
              {phaseTransferAnalytics.map((record) => (
                <li key={record.phaseId}>
                  <div className="review-queue-item static-item">
                    <span className="review-course">
                      {record.passRate}% passed
                    </span>
                    <span className="review-lesson">{record.phaseTitle}</span>
                    <span className="microcopy">
                      {record.passedTransferLessons}/
                      {record.totalTransferLessons} transfer lessons cleared
                    </span>
                  </div>
                </li>
              ))}
            </ul>
          </section>

          <section className="panel">
            <h3>Milestone pass rate</h3>
            <div className="phase-metrics">
              <span>{milestonePassRateSummary.passRate}% phases cleared</span>
              <span>
                {milestonePassRateSummary.passedPhases}/
                {milestonePassRateSummary.totalPhases} phases ready
              </span>
              <span>{milestonePassRateSummary.blockedPhases} blocked</span>
            </div>
            <div className="phase-metrics">
              <span>
                {milestonePassRateSummary.statusCounts.notStarted} not started
              </span>
              <span>
                {milestonePassRateSummary.statusCounts.inProgress} in progress
              </span>
              <span>
                {milestonePassRateSummary.statusCounts.reviewNeeded} review
                needed
              </span>
            </div>
            {milestonePassRateSummary.blockedPhaseTitles.length > 0 ? (
              <ul className="review-queue-list">
                {milestonePassRateSummary.blockedPhaseTitles.map((title) => (
                  <li key={title}>
                    <div className="review-queue-item static-item">
                      <span className="review-course">Blocked</span>
                      <span className="review-lesson">{title}</span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="microcopy">
                All phases currently satisfy milestone gates.
              </p>
            )}
          </section>

          <section className="panel">
            <div className="panel-header">
              <div>
                <h3>Outcomes dashboard</h3>
                <p>PRD metric rollup and recommended next actions.</p>
              </div>
              <span
                className={`status-pill ${
                  outcomesDashboardSummary.status === "strong"
                    ? "complete"
                    : "pending"
                }`}
              >
                {outcomesDashboardSummary.overallScore}%
              </span>
            </div>
            <ul className="review-queue-list">
              {outcomesDashboardSummary.snapshots.map((snapshot) => (
                <li key={snapshot.id}>
                  <div className="review-queue-item static-item">
                    <span
                      className={`review-course ${
                        snapshot.status === "strong" ? "" : "warning-text"
                      }`}
                    >
                      {snapshot.value}%
                    </span>
                    <span className="review-lesson">{snapshot.label}</span>
                  </div>
                </li>
              ))}
            </ul>
            <h4>Priority actions</h4>
            <ul className="retention-list">
              {outcomesDashboardSummary.prioritizedActions.map((action) => (
                <li key={action}>{action}</li>
              ))}
            </ul>
          </section>

          {independentReadiness ? (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>Independent readiness</h3>
                  <p>{independentReadiness.phaseTitle}</p>
                </div>
                <span
                  className={`status-pill ${
                    independentReadiness.statusLabel === "portfolio-ready"
                      ? "complete"
                      : "pending"
                  }`}
                >
                  {independentReadiness.statusLabel === "not-started"
                    ? "Not started"
                    : independentReadiness.statusLabel === "building"
                      ? "Building"
                      : independentReadiness.statusLabel === "capstone-ready"
                        ? "Capstone ready"
                        : "Portfolio ready"}
                </span>
              </div>
              <div className="phase-metrics">
                <span>{independentReadiness.readinessPercent}% ready</span>
                <span>
                  {independentReadiness.completedLessons}/
                  {independentReadiness.totalLessons} lessons complete
                </span>
              </div>
              <p className="microcopy">
                {independentReadiness.documentationArtifacts} documentation
                artifacts across {independentReadiness.documentedLessons}{" "}
                lessons.
              </p>
              <ul className="review-queue-list">
                {independentReadiness.checks.map((check) => (
                  <li key={check.id}>
                    <div className="review-queue-item static-item">
                      <span
                        className={`review-course ${check.passed ? "" : "warning-text"}`}
                      >
                        {check.passed ? "Ready" : "Blocked"}
                      </span>
                      <span className="review-lesson">{check.label}</span>
                      <span className="microcopy">{check.detail}</span>
                    </div>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

          <section className="panel">
            <h3>Independent lab completion</h3>
            <div className="phase-metrics">
              <span>{independentLabSummary.completionRate}% completed</span>
              <span>
                {independentLabSummary.completedLabs}/
                {independentLabSummary.totalLabs} ticket labs
              </span>
            </div>
            <div className="phase-metrics">
              <span>{independentLabSummary.validatedLabs} fully validated</span>
              <span>{independentLabSummary.firstPassLabs} first-pass labs</span>
            </div>
            {independentLabSummary.phaseBreakdown.some(
              (phase) => phase.totalLabs > 0,
            ) ? (
              <ul className="review-queue-list">
                {independentLabSummary.phaseBreakdown
                  .filter((phase) => phase.totalLabs > 0)
                  .map((phase) => (
                    <li key={phase.phaseId}>
                      <div className="review-queue-item static-item">
                        <span className="review-course">
                          {phase.completionRate}% complete
                        </span>
                        <span className="review-lesson">
                          {phase.phaseTitle}
                        </span>
                        <span className="microcopy">
                          {phase.completedLabs}/{phase.totalLabs} complete ·{" "}
                          {phase.validatedLabs} validated ·{" "}
                          {phase.firstPassLabs} first pass
                        </span>
                      </div>
                    </li>
                  ))}
              </ul>
            ) : (
              <p className="microcopy">
                Ticket-style labs appear in late phases and will populate here
                as you progress.
              </p>
            )}
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
              {selectedLesson.explanation.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </article>

            <article className="lesson-card">
              <h4>Guided demonstration</h4>
              {selectedLesson.demonstration.map((paragraph, i) => (
                <p key={i}>{paragraph}</p>
              ))}
            </article>
          </section>

          <section className="exercise-grid">
            <article className="exercise-card">
              <h4>Hands-on exercise</h4>
              <ol className="exercise-list">
                {selectedLesson.exerciseSteps.map((step, i) => (
                  <li key={i}>{step}</li>
                ))}
              </ol>
            </article>

            <article className="check-card">
              <h4>Validation criteria</h4>
              <ul className="validation-list">
                {selectedLesson.validationChecks.map((check, i) => (
                  <li key={i}>{check}</li>
                ))}
              </ul>
            </article>
          </section>

          <section className="validation-grid">
            {selectedLesson.exercises.map((exercise) => {
              const exerciseAnswer = answers[exercise.id] ?? "";
              const exerciseFeedback = feedback[exercise.id];
              const validation = evaluateExerciseAnswer(
                exercise,
                exerciseAnswer,
              );
              const isCorrect = validation.passed;
              const inspection = buildExerciseInspection(
                exercise,
                exerciseAnswer,
              );
              const inspectionKey = `${selectedLesson.id}:${exercise.id}`;
              const showInspection = Boolean(inspectionOpen[inspectionKey]);

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
                        isCorrect ||
                        isHintExhausted(currentHintLevels[exercise.id] ?? 0)
                      }
                      onClick={() => advanceHint(exercise.id)}
                    >
                      {getHintButtonLabel(currentHintLevels[exercise.id] ?? 0)}
                    </button>
                    <button
                      type="button"
                      className="ghost-button"
                      disabled={!exerciseAnswer.trim()}
                      onClick={() => toggleInspection(exercise.id)}
                    >
                      {showInspection
                        ? "Hide inspect mode"
                        : "Inspect response"}
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
                  {getHintText(
                    currentHintLevels[exercise.id] ?? 0,
                    exercise.hint,
                  ) !== null ? (
                    <div className="hint-layer">
                      {getHintText(
                        currentHintLevels[exercise.id] ?? 0,
                        exercise.hint,
                      )}
                    </div>
                  ) : null}
                  {showInspection ? (
                    <div className="inspection-panel">
                      <div className="inspection-row">
                        <span className="inspection-label">Skill gap</span>
                        <span>{inspection.probableSkillGap}</span>
                      </div>
                      <div className="inspection-grid">
                        <div>
                          <h5>Matched signals</h5>
                          <ul className="inspection-list">
                            {(inspection.matchedSignals.length > 0
                              ? inspection.matchedSignals
                              : ["No expected signals matched yet."]
                            ).map((signal) => (
                              <li key={`match-${signal}`}>{signal}</li>
                            ))}
                          </ul>
                        </div>
                        <div>
                          <h5>Missing signals</h5>
                          <ul className="inspection-list">
                            {(inspection.missingSignals.length > 0
                              ? inspection.missingSignals
                              : ["No missing signals."]
                            ).map((signal) => (
                              <li key={`missing-${signal}`}>{signal}</li>
                            ))}
                          </ul>
                        </div>
                      </div>
                      <div>
                        <h5>Inspection prompts</h5>
                        <ul className="inspection-list">
                          {inspection.inspectionPrompts.map((prompt) => (
                            <li key={prompt}>{prompt}</li>
                          ))}
                        </ul>
                      </div>
                      <div>
                        <h5>Signal diff</h5>
                        <pre className="inspection-diff">
                          {inspection.signalDiff.length > 0
                            ? inspection.signalDiff.join("\n")
                            : "No signal diff available yet."}
                        </pre>
                      </div>
                    </div>
                  ) : null}
                </article>
              );
            })}
          </section>

          {selectedLesson.transferTask ? (
            <section className="validation-grid">
              <article className="exercise-card transfer-task-card">
                {(() => {
                  const transferTask = selectedLesson.transferTask;
                  const transferInspection = buildExerciseInspection(
                    transferTask,
                    transferAnswers[selectedLesson.id] ?? "",
                  );
                  const transferInspectionKey = `${selectedLesson.id}:${transferTask.id}`;
                  const showTransferInspection = Boolean(
                    inspectionOpen[transferInspectionKey],
                  );

                  return (
                    <>
                      <div className="exercise-card-header">
                        <h4>{transferTask.title}</h4>
                        <span className="assessment-badge assessment-transfer">
                          transfer
                        </span>
                      </div>
                      <p>{transferTask.prompt}</p>
                      <input
                        aria-label={transferTask.title}
                        value={transferAnswers[selectedLesson.id] ?? ""}
                        onChange={(event) =>
                          setTransferAnswers((current) => ({
                            ...current,
                            [selectedLesson.id]: event.target.value,
                          }))
                        }
                        placeholder={transferTask.placeholder}
                      />
                      <div className="toolbar">
                        <button
                          type="button"
                          className="validate-button"
                          onClick={validateTransferTask}
                        >
                          Validate transfer
                        </button>
                        <button
                          type="button"
                          className="ghost-button"
                          disabled={
                            !(transferAnswers[selectedLesson.id] ?? "").trim()
                          }
                          onClick={() => toggleInspection(transferTask.id)}
                        >
                          {showTransferInspection
                            ? "Hide inspect mode"
                            : "Inspect response"}
                        </button>
                        <span
                          className={`status-pill ${selectedLessonTransferPassed ? "complete" : "pending"}`}
                        >
                          {selectedLessonTransferPassed
                            ? "Passed"
                            : "Not passed"}
                        </span>
                      </div>
                      {transferFeedback[selectedLesson.id] ? (
                        <div
                          className={`feedback ${selectedLessonTransferPassed ? "success" : "warning"}`}
                        >
                          {transferFeedback[selectedLesson.id]}
                        </div>
                      ) : null}
                      <div className="hint-layer">{transferTask.hint}</div>
                      {showTransferInspection ? (
                        <div className="inspection-panel">
                          <div className="inspection-row">
                            <span className="inspection-label">Skill gap</span>
                            <span>{transferInspection.probableSkillGap}</span>
                          </div>
                          <div className="inspection-grid">
                            <div>
                              <h5>Matched signals</h5>
                              <ul className="inspection-list">
                                {(transferInspection.matchedSignals.length > 0
                                  ? transferInspection.matchedSignals
                                  : ["No expected signals matched yet."]
                                ).map((signal) => (
                                  <li key={`transfer-match-${signal}`}>
                                    {signal}
                                  </li>
                                ))}
                              </ul>
                            </div>
                            <div>
                              <h5>Missing signals</h5>
                              <ul className="inspection-list">
                                {(transferInspection.missingSignals.length > 0
                                  ? transferInspection.missingSignals
                                  : ["No missing signals."]
                                ).map((signal) => (
                                  <li key={`transfer-missing-${signal}`}>
                                    {signal}
                                  </li>
                                ))}
                              </ul>
                            </div>
                          </div>
                          <div>
                            <h5>Inspection prompts</h5>
                            <ul className="inspection-list">
                              {transferInspection.inspectionPrompts.map(
                                (prompt) => (
                                  <li key={prompt}>{prompt}</li>
                                ),
                              )}
                            </ul>
                          </div>
                          <div>
                            <h5>Signal diff</h5>
                            <pre className="inspection-diff">
                              {transferInspection.signalDiff.length > 0
                                ? transferInspection.signalDiff.join("\n")
                                : "No signal diff available yet."}
                            </pre>
                          </div>
                        </div>
                      ) : null}
                    </>
                  );
                })()}
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
                {selectedLesson.retention.map((item, i) => (
                  <li key={i}>{item}</li>
                ))}
              </ul>
            </article>

            <article className="note-card">
              <h4>Reflection checkpoint</h4>
              <p className="microcopy">
                Capture what changed, what still feels weak, and what signal you
                will reuse next time.
              </p>
              <ul className="retention-list">
                {reflectionPrompts.map((prompt) => (
                  <li key={prompt}>{prompt}</li>
                ))}
              </ul>
              <textarea
                aria-label="Lesson reflection"
                value={reflections[selectedLesson.id] ?? ""}
                onChange={(event) =>
                  updateReflection(selectedLesson.id, event.target.value)
                }
                placeholder="Write a short reflection: what you verified, what was weak, and what you will do differently next time."
              />
              <div className="notes-review-row">
                <span className="review-meta">
                  {selectedLessonWeakTracks.length > 0
                    ? `Weak focus: ${selectedLessonWeakTracks.map(formatTrackName).join(", ")}`
                    : "No weak competency flags for this lesson yet"}
                </span>
                <button
                  type="button"
                  className="ghost-button"
                  onClick={() => saveReflectionArtifact(selectedLesson.id)}
                >
                  Save reflection artifact
                </button>
              </div>
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
            <div className="toolbar">
              <button
                type="button"
                className="ghost-button"
                onClick={() => exportArtifacts(selectedLesson.id)}
              >
                Export lesson evidence
              </button>
              <button
                type="button"
                className="ghost-button"
                onClick={() => exportArtifacts()}
              >
                Export all evidence
              </button>
            </div>
            <div className="phase-metrics">
              <span>{recentAttempts.length} recent attempts</span>
              <span>{lessonArtifactSummary.total} lesson artifacts</span>
              <span>
                {transferEvidenceWithinPhase}/{transferLessonsCount} transfer
                gates passed
              </span>
            </div>
            <div className="phase-metrics">
              <span>{lessonArtifactSummary.counts.note} notes</span>
              <span>{lessonArtifactSummary.counts.reflection} reflections</span>
              <span>{lessonArtifactSummary.counts.transfer} transfers</span>
            </div>
            <div className="phase-metrics">
              <span>
                {artifactCompletionSummary.completionRate}% artifact coverage
              </span>
              <span>
                {artifactCompletionSummary.lessonsWithEvidence}/
                {artifactCompletionSummary.completedLessons} completed lessons
                with evidence
              </span>
              <span>
                {artifactCompletionSummary.lessonsMissingEvidence} missing
                evidence
              </span>
            </div>
            <div className="phase-metrics">
              <span>{attemptAnalytics.errorReductionRate}% recovery rate</span>
              <span>
                {attemptAnalytics.recoveredExercises} recovered checks
              </span>
              <span>
                {attemptAnalytics.unresolvedExercises} unresolved checks
              </span>
            </div>
            <p className="microcopy">
              This lesson: {lessonAttemptAnalytics.failedAttempts} failed
              attempt{lessonAttemptAnalytics.failedAttempts === 1 ? "" : "s"},{" "}
              {lessonAttemptAnalytics.recoveredExercises} recovered exercise
              {lessonAttemptAnalytics.recoveredExercises === 1 ? "" : "s"}.
            </p>
            {attemptAnalytics.breakdown.length > 0 ? (
              <ul className="review-queue-list">
                {attemptAnalytics.breakdown.slice(0, 3).map((entry) => (
                  <li key={entry.assessmentType}>
                    <div className="review-queue-item static-item">
                      <span className="review-course">
                        {entry.assessmentType}
                      </span>
                      <span className="review-lesson">
                        {entry.failures} failures · {entry.recoveries}{" "}
                        recoveries
                      </span>
                      <span className="microcopy">
                        {entry.attempts} total attempts
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
            {recentAttempts.length > 0 ? (
              <ul className="review-queue-list">
                {recentAttempts.map((attempt) => (
                  <li key={attempt.id}>
                    <div className="review-queue-item static-item">
                      <span className="review-course">
                        {attempt.assessmentType}
                      </span>
                      <span className="review-lesson">
                        {attempt.passed ? "Passed" : "Needs work"} ·{" "}
                        {attempt.exerciseId}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : (
              <p className="microcopy">
                No attempts logged for this lesson yet.
              </p>
            )}
            {lessonArtifactSummary.recent.length > 0 ? (
              <ul className="review-queue-list">
                {lessonArtifactSummary.recent.map((artifact) => (
                  <li key={artifact.id}>
                    <div className="review-queue-item static-item">
                      <span className="review-course">{artifact.type}</span>
                      <span className="review-lesson">{artifact.title}</span>
                      <span className="microcopy">
                        {getArtifactPreview(artifact.content)}
                      </span>
                    </div>
                  </li>
                ))}
              </ul>
            ) : null}
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

          {reinforcementQueue.length > 0 ? (
            <section className="panel">
              <div className="panel-header">
                <div>
                  <h3>Reinforcement focus</h3>
                  <p>Due reviews prioritized by weak competency overlap.</p>
                </div>
                <span className="tag due-count">
                  {reinforcementQueue.length}
                </span>
              </div>
              <ul className="review-queue-list">
                {reinforcementQueue.map((item) => (
                  <li key={item.entry.lesson.id}>
                    <button
                      type="button"
                      className="review-queue-item"
                      onClick={() => navigateToEntry(item.entry)}
                    >
                      <span className="review-course">
                        {item.entry.course.title}
                      </span>
                      <span className="review-lesson">
                        {item.entry.lesson.title}
                      </span>
                      <span className="microcopy">
                        Focus: {item.weakTracks.map(formatTrackName).join(", ")}{" "}
                        · {item.dueSinceDays} day
                        {item.dueSinceDays === 1 ? "" : "s"} overdue
                      </span>
                    </button>
                  </li>
                ))}
              </ul>
            </section>
          ) : null}

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
                  {selectedPhase.guardrails.map((item, i) => (
                    <li key={i}>{item}</li>
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
                  {selectedPhase.milestones.map((milestone, i) => (
                    <li key={i}>{milestone}</li>
                  ))}
                </ul>
              </article>
              <article className="project-card">
                <h4>Phase projects</h4>
                <ul className="deliverable-list">
                  {selectedPhase.projects.map((project, i) => (
                    <li key={i}>{project}</li>
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
                  const isWeak = weakCompetencyTracks.includes(track);
                  return (
                    <div
                      className={`competency-item${isWeak ? " competency-weak" : ""}`}
                      key={track}
                    >
                      <div className="competency-row">
                        <span className="competency-track">
                          {formatTrackName(track)}
                        </span>
                        <span className={`mastery-badge mastery-${level}`}>
                          {level}
                        </span>
                        {isWeak ? (
                          <span
                            className="weak-indicator"
                            title="Needs reinforcement"
                          >
                            ↺
                          </span>
                        ) : null}
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

          {selectedPhase.exitStandard && phaseExitStatus ? (
            <>
              <section className="panel">
                <h3>Phase exit gates</h3>
                <p className="panel-subtext">
                  {selectedPhase.exitStandard.summary}
                </p>
                <ul className="gate-list">
                  {phaseExitStatus.gates.map((gate) => (
                    <li
                      key={`${gate.competency}-${gate.description}`}
                      className={`gate-item ${gate.passed ? "gate-passed" : "gate-pending"}`}
                    >
                      <span className="gate-icon" aria-hidden="true">
                        {gate.passed ? "✓" : "○"}
                      </span>
                      <span className="gate-description">
                        {gate.description}
                        <span className="gate-level">{gate.requiredLevel}</span>
                      </span>
                    </li>
                  ))}
                  <li
                    className={`gate-item ${phaseExitStatus.transferGatePassed ? "gate-passed" : "gate-pending"}`}
                  >
                    <span className="gate-icon" aria-hidden="true">
                      {phaseExitStatus.transferGatePassed ? "✓" : "○"}
                    </span>
                    <span className="gate-description">
                      Pass at least one transfer challenge in this phase
                      <span className="gate-level">
                        {transferEvidenceWithinPhase}/{transferLessonsCount}{" "}
                        complete
                      </span>
                    </span>
                  </li>
                  <li
                    className={`gate-item ${phaseMilestoneStatus?.reinforcementGatePassed ? "gate-passed" : "gate-pending"}`}
                  >
                    <span className="gate-icon" aria-hidden="true">
                      {phaseMilestoneStatus?.reinforcementGatePassed
                        ? "✓"
                        : "○"}
                    </span>
                    <span className="gate-description">
                      Clear overdue reinforcement work for weak competencies
                      <span className="gate-level">
                        {phaseReinforcementQueue.length === 0
                          ? "No overdue reinforcement"
                          : `${phaseReinforcementQueue.length} still due`}
                      </span>
                    </span>
                  </li>
                </ul>
              </section>
              {!phaseMilestoneStatus?.allPassed ? (
                <section className="panel">
                  <h3>Before you advance</h3>
                  <p className="panel-subtext">
                    Advancement now depends on competency, transfer, and
                    reinforcement readiness together.
                  </p>
                  <ul className="review-queue-list">
                    {phaseMilestoneStatus?.blockedReasons.map((reason) => (
                      <li key={reason}>
                        <div className="review-queue-item static-item">
                          <span className="review-lesson">{reason}</span>
                        </div>
                      </li>
                    ))}
                  </ul>
                </section>
              ) : null}
              {phaseMilestoneStatus?.allPassed && phaseExitStatus.nextPhase ? (
                <section className="panel phase-advance-panel">
                  <div className="phase-advance-content">
                    <span className="phase-advance-icon" aria-hidden="true">
                      🏆
                    </span>
                    <div>
                      <h3>Phase complete!</h3>
                      <p>
                        All milestone gates cleared. You are ready to advance to{" "}
                        <strong>{phaseExitStatus.nextPhase.title}</strong>.
                      </p>
                      <button
                        type="button"
                        className="validate-button phase-advance-button"
                        onClick={() =>
                          selectPhase(phaseExitStatus.nextPhase!.id)
                        }
                      >
                        Start {phaseExitStatus.nextPhase.title} →
                      </button>
                    </div>
                  </div>
                </section>
              ) : null}
            </>
          ) : null}
        </aside>
      </section>
    </main>
  );
}
