"use client";

import type { Curriculum, Exercise, Lesson } from "@/data/curriculum";
import { phase1LabsByLesson, phase2LabsByLesson } from "@/data/lab-templates";
import { buildArtifactBrowserSummary } from "@/lib/artifact-browser-engine";
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
import type { LabInstance } from "@/lib/lab-engine";
import {
  buildLabCompletionSummary,
  createLabInstance,
  getLabHint,
  recordLabAttempt,
  resetLabInstance,
  validateLabInstance,
} from "@/lib/lab-engine";
import { evaluatePhaseMilestoneStatus } from "@/lib/milestone-engine";
import { buildMilestonePassRateSummary } from "@/lib/milestone-pass-rate-engine";
import { buildOutcomesDashboardSummary } from "@/lib/outcomes-dashboard-engine";
import { buildPhaseStatusRecords } from "@/lib/phase-status-engine";
import type { ReviewRecord } from "@/lib/progression-engine";
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
import { useLearnerProfile } from "./hooks/use-learner-profile";
import { InspectionPanel } from "./inspection-panel";
import { LabPanel } from "./lab-panel";
import { RailPanels } from "./rail-panels";
import { SidebarPanels } from "./sidebar-panels";
import { TerminalSimulator } from "./terminal-simulator";

type ProgressState = Record<string, true>;
type NotesState = Record<string, string>;
type AnswerState = Record<string, string>;
type ReflectionState = Record<string, string>;

type ReviewState = Record<string, ReviewRecord>;
type TransferState = Record<string, true>;

type TrainingPlatformProps = {
  curriculum: Curriculum;
};

const progressStorageKey = "computelearn-progress";
const notesStorageKey = "computelearn-notes";
const reflectionsStorageKey = "computelearn-reflections";
const reviewsStorageKey = "computelearn-reviews";
const attemptsStorageKey = "computelearn-attempts";
const artifactsStorageKey = "computelearn-artifacts";
const transferStorageKey = "computelearn-transfer";
const labInstancesStorageKey = "computelearn-lab-instances";

const emptyProgress: ProgressState = {};
const emptyNotes: NotesState = {};
const emptyReflections: ReflectionState = {};
const emptyReviews: ReviewState = {};
const emptyTransfer: TransferState = {};

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
  const { profile: learnerProfile, update: updateLearnerProfile } =
    useLearnerProfile();
  const [attempts, setAttempts] = useLocalStorageState<AttemptRecord[]>(
    attemptsStorageKey,
    [],
  );
  const [artifacts, setArtifacts] = useLocalStorageState<ArtifactRecord[]>(
    artifactsStorageKey,
    [],
  );
  const [labInstances, setLabInstances] = useLocalStorageState<
    Record<string, LabInstance>
  >(labInstancesStorageKey, {});
  const [labHintLevels, setLabHintLevels] = useState<Record<string, number>>(
    {},
  );
  const { theme, toggle: toggleTheme } = useTheme();

  const [todayKey, setTodayKey] = useState(() => new Date().toDateString());

  useEffect(() => {
    const intervalId = setInterval(() => {
      const nextKey = new Date().toDateString();
      setTodayKey((prev) => (prev === nextKey ? prev : nextKey));
    }, 60_000);
    return () => clearInterval(intervalId);
  }, []);

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

  const showTerminal =
    selectedPhase?.id === "phase-1" || selectedPhase?.id === "phase-2";

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- todayKey is an intentional cache-buster for date-dependent review filtering
  }, [allLessonsFlat, reviews, todayKey]);

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
    // eslint-disable-next-line react-hooks/exhaustive-deps -- todayKey is an intentional cache-buster for date-dependent streak calculation
    [reviews, todayKey],
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

    if (!isComplete) {
      setReviews((current) => {
        if (!current[lessonId]) return current;
        const next = { ...current };
        delete next[lessonId];
        return next;
      });
      setTransferProgress((current) => {
        if (!current[lessonId]) return current;
        const next = { ...current };
        delete next[lessonId];
        return next;
      });
    }

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
    setTransferProgress((prev) => {
      const next = { ...prev };
      delete next[selectedLesson.id];
      return next;
    });
    setLessonGateFeedback(null);
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

  // --- Lab lifecycle handlers ---

  const currentLabTemplates = selectedLesson
    ? (phase1LabsByLesson[selectedLesson.id] ??
        phase2LabsByLesson[selectedLesson.id] ??
        null)
    : null;
  const currentLabTemplate = currentLabTemplates?.[0] ?? null;
  const currentLabInstance = currentLabTemplate
    ? (labInstances[currentLabTemplate.id] ?? null)
    : null;

  function startLab() {
    if (!currentLabTemplate) return;
    const instance = createLabInstance(currentLabTemplate);
    setLabInstances((prev) => ({ ...prev, [currentLabTemplate.id]: instance }));
  }

  function validateLab() {
    if (!currentLabTemplate || !currentLabInstance) return null;
    const result = validateLabInstance(currentLabTemplate, currentLabInstance);
    const updated = recordLabAttempt(currentLabInstance, result);
    setLabInstances((prev) => ({
      ...prev,
      [currentLabTemplate.id]: updated,
    }));
    if (result.passed && selectedLesson) {
      addArtifact(
        "completion",
        `Lab completed: ${currentLabTemplate.title}`,
        buildLabCompletionSummary(currentLabTemplate, updated),
        selectedLesson.id,
      );
    }
    return result;
  }

  function resetCurrentLab() {
    if (!currentLabTemplate || !currentLabInstance) return;
    const reset = resetLabInstance(currentLabInstance, currentLabTemplate);
    setLabInstances((prev) => ({
      ...prev,
      [currentLabTemplate.id]: reset,
    }));
  }

  function requestLabHint(ruleIndex: number) {
    if (!currentLabTemplate) return null;
    // Track hint levels per template+rule in a simple escalation
    const key = `${currentLabTemplate.id}:${ruleIndex}`;
    const currentLevel = labHintLevels[key] ?? 0;
    const hint = getLabHint(currentLabTemplate, ruleIndex, currentLevel);
    setLabHintLevels((prev) => ({ ...prev, [key]: currentLevel + 1 }));
    return hint;
  }

  function updateLabFile(path: string, content: string) {
    if (!currentLabTemplate || !currentLabInstance) return;
    const updatedFiles = currentLabInstance.files.map((f) =>
      f.path === path ? { ...f, content } : f,
    );
    setLabInstances((prev) => ({
      ...prev,
      [currentLabTemplate.id]: { ...currentLabInstance, files: updatedFiles },
    }));
  }

  function updateCodeSubmission(ruleIndex: number, code: string) {
    if (!currentLabTemplate || !currentLabInstance) return;
    setLabInstances((prev) => {
      const instance = prev[currentLabTemplate.id];
      if (!instance) return prev;
      return {
        ...prev,
        [currentLabTemplate.id]: {
          ...instance,
          codeSubmissions: { ...instance.codeSubmissions, [ruleIndex]: code },
        },
      };
    });
  }

  function updateTestOutput(command: string, output: string) {
    if (!currentLabTemplate || !currentLabInstance) return;
    setLabInstances((prev) => {
      const instance = prev[currentLabTemplate.id];
      if (!instance) return prev;
      return {
        ...prev,
        [currentLabTemplate.id]: {
          ...instance,
          commandOutputs: { ...instance.commandOutputs, [command]: output },
        },
      };
    });
  }

  const labCompletionSummary =
    currentLabTemplate && currentLabInstance?.status === "completed"
      ? buildLabCompletionSummary(currentLabTemplate, currentLabInstance)
      : null;

  // ---- T2: terminal ↔ lab integration ----

  /** Build a terminal-compatible filesystem from lab template files. */
  const labTerminalFilesystem = useMemo(() => {
    if (!currentLabTemplate) return undefined;
    const basePath = "C:\\Users\\learner";
    const fs: Record<string, string[]> = { [basePath]: [] };
    for (const file of currentLabTemplate.initialFiles) {
      const segments = file.path.split("/");
      let dir = basePath;
      for (let i = 0; i < segments.length; i++) {
        const name = segments[i];
        if (!fs[dir]) fs[dir] = [];
        if (!fs[dir].includes(name)) {
          fs[dir].push(name);
        }
        if (i < segments.length - 1) {
          dir = `${dir}\\${name}`;
        }
      }
    }
    return fs;
  }, [currentLabTemplate]);

  /** Map resolved terminal paths to lab file contents for cat/Get-Content. */
  const labFileContents = useMemo(() => {
    if (!currentLabInstance) return undefined;
    const map: Record<string, string> = {};
    for (const f of currentLabInstance.files) {
      map[`C:\\Users\\learner\\${f.path.replace(/\//g, "\\")}`] = f.content;
    }
    return map;
  }, [currentLabInstance]);

  /** Capture terminal command output into the active lab instance.
   *
   *  The `command` argument is already the canonical PowerShell name
   *  (e.g. "Get-Location" even when the user typed "pwd") because
   *  TerminalSimulator resolves aliases via CANONICAL_COMMANDS before
   *  invoking onCommandExecuted.
   *
   *  NOTE: test-pass validation rules are not yet supported — no Phase 1
   *  labs use them.  When Phase 2+ labs add test-pass rules, a lab-aware
   *  test runner (simulated npm-test output) will need to be wired here. */
  function handleTerminalCommand(command: string, output: string) {
    if (!currentLabTemplate || !currentLabInstance) return;
    const firstToken = command.split(/\s+/)[0];
    const keys = new Set([command, firstToken]);
    setLabInstances((prev) => {
      const instance = prev[currentLabTemplate.id];
      if (!instance) return prev;
      const updatedOutputs = { ...instance.commandOutputs };
      for (const key of keys) {
        updatedOutputs[key] = output;
      }
      return {
        ...prev,
        [currentLabTemplate.id]: {
          ...instance,
          commandOutputs: updatedOutputs,
        },
      };
    });
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
          <div className="stats stats--four-column">
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
        <SidebarPanels
          curriculum={curriculum}
          selectedPhase={selectedPhase}
          percentComplete={percentComplete}
          progress={progress}
          completedWithinPhase={completedWithinPhase}
          totalWithinPhase={totalWithinPhase}
          phaseStatuses={phaseStatuses}
          competencyDashboard={competencyDashboard}
          phaseTransferAnalytics={phaseTransferAnalytics}
          milestonePassRateSummary={milestonePassRateSummary}
          outcomesDashboardSummary={outcomesDashboardSummary}
          independentReadiness={independentReadiness}
          independentLabSummary={independentLabSummary}
          selectPhase={selectPhase}
        />

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
                className={`status-pill ${selectedLessonEvidenceGate.passed || !!progress[selectedLesson.id] ? "complete" : "pending"}`}
              >
                {selectedLessonEvidenceGate.passed ||
                !!progress[selectedLesson.id]
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
                    <InspectionPanel inspection={inspection} />
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
                        <InspectionPanel
                          inspection={transferInspection}
                          keyPrefix="transfer-"
                        />
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
                  onAttempt={(code, passed) => {
                    const record = buildAttemptRecord({
                      id: createId("attempt"),
                      lessonId: selectedLesson.id,
                      exerciseId: ex.id,
                      assessmentType: "action",
                      answer: code,
                      passed,
                      attemptedAt: new Date().toISOString(),
                    });
                    setAttempts((current) =>
                      [record, ...current].slice(0, 500),
                    );
                    if (passed) {
                      addArtifact(
                        "completion",
                        `Code exercise: ${ex.title}`,
                        code,
                        selectedLesson.id,
                      );
                    }
                  }}
                />
              ))}
            </section>
          ) : null}

          {currentLabTemplate ? (
            <section className="lab-section">
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
              <TerminalSimulator
                key={currentLabTemplate?.id ?? "default"}
                filesystem={labTerminalFilesystem}
                fileContents={labFileContents}
                onCommandExecuted={
                  currentLabInstance?.status === "active"
                    ? handleTerminalCommand
                    : undefined
                }
              />
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

        <RailPanels
          learnerProfile={learnerProfile}
          updateLearnerProfile={updateLearnerProfile}
          selectedPhase={selectedPhase}
          selectedCourse={selectedCourse}
          selectedLesson={selectedLesson}
          progress={progress}
          reviews={reviews}
          visibleLessons={visibleLessons}
          setSelectedLessonId={setSelectedLessonId}
          exportArtifacts={exportArtifacts}
          recentAttempts={recentAttempts}
          lessonArtifactSummary={lessonArtifactSummary}
          artifactCompletionSummary={artifactCompletionSummary}
          attemptAnalytics={attemptAnalytics}
          lessonAttemptAnalytics={lessonAttemptAnalytics}
          transferEvidenceWithinPhase={transferEvidenceWithinPhase}
          transferLessonsCount={transferLessonsCount}
          competencyLevels={competencyLevels}
          weakCompetencyTracks={weakCompetencyTracks}
          reinforcementQueue={reinforcementQueue}
          phaseReinforcementQueue={phaseReinforcementQueue}
          reviewQueue={reviewQueue}
          navigateToEntry={navigateToEntry}
          selectPhase={selectPhase}
          phaseExitStatus={phaseExitStatus}
          phaseMilestoneStatus={phaseMilestoneStatus}
        />
      </section>
    </main>
  );
}
