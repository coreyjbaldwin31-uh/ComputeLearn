"use client";

import type { Curriculum, Lesson } from "@/data/curriculum";
import type { ArtifactRecord } from "@/lib/artifact-engine";
import {
  type AttemptRecord,
  formatCompletionContent,
} from "@/lib/artifact-engine";
import { getWeakCompetencyTracks } from "@/lib/competency-engine";
import type { LabInstance } from "@/lib/lab-engine";
import { evaluatePhaseMilestoneStatus } from "@/lib/milestone-engine";
import type { ReviewRecord } from "@/lib/progression-engine";
import {
  calculateActivityStreak,
  calculateCompetencyLevels,
  calculatePercentComplete,
  evaluatePhaseExitStatus,
  flattenLessonEntries,
  getDueReviewQueue,
  getLessonNeighbors,
  getMasteryLevel,
  getPhaseProgressSnapshot,
  isDueForReview,
} from "@/lib/progression-engine";
import { buildReflectionPrompts } from "@/lib/reflection-engine";
import {
  getReinforcementQueue,
  getWeakTrackHits,
} from "@/lib/reinforcement-engine";
import { evaluateLessonEvidenceGate } from "@/lib/validation-engine";
import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { AchievementPanel } from "./achievement-panel";
import { ActionBar } from "./action-bar";
import { FaqSection } from "./faq-section";
import { FeatureHighlights } from "./feature-highlights";
import { GlobalSearch } from "./global-search";
import { HeroSection } from "./hero-section";
import { HomeDashboard } from "./home-dashboard";
import { useAnalyticsDashboards } from "./hooks/use-analytics-dashboards";
import { useArtifactManager } from "./hooks/use-artifact-manager";
import { useExerciseValidation } from "./hooks/use-exercise-validation";
import { useKeyboardShortcuts } from "./hooks/use-keyboard-shortcuts";
import { useLabLifecycle } from "./hooks/use-lab-lifecycle";
import { useLearnerProfile } from "./hooks/use-learner-profile";
import { useLocalStorageState } from "./hooks/use-local-storage-state";
import { useTheme } from "./hooks/use-theme";
import { KeyboardHelpTrigger } from "./keyboard-help-trigger";
import { KeyboardShortcutsDialog } from "./keyboard-shortcuts-dialog";
import { LabPanel } from "./lab-panel";
import { LessonCodeExercises } from "./lesson-code-exercises";
import { LessonExercises } from "./lesson-exercises";
import { LessonExplanation } from "./lesson-explanation";
import { LessonHeader } from "./lesson-header";
import { LessonNavigation } from "./lesson-navigation";
import { LessonTerminal } from "./lesson-terminal";
import { LessonTransfer } from "./lesson-transfer";
import { LessonValidation } from "./lesson-validation";
import { NotesSection } from "./notes-section";
import type { Notification } from "./notification-bell";
import { OnboardingCard } from "./onboarding-card";
import { PageFooter } from "./page-footer";
import { PlatformNavbar } from "./platform-navbar";
import { PricingCallout } from "./pricing-callout";
import { ProgressRoadmap } from "./progress-roadmap";
import { RailPanels } from "./rail-panels";
import { SaveToast } from "./save-toast";
import { SidebarPanels } from "./sidebar-panels";
import { SkipLink } from "./skip-link";
import { SocialProof } from "./social-proof";

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
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [showResetConfirm, setShowResetConfirm] = useState(false);
  const [viewMode, setViewMode] = useState<"home" | "lesson">("home");
  const [showGlobalSearch, setShowGlobalSearch] = useState(false);
  const [dismissedNotifs, setDismissedNotifs] = useState<Set<string>>(
    () => new Set(),
  );
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
  const { theme, toggle: toggleTheme } = useTheme();

  const contentRef = useRef<HTMLElement>(null);

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
    selectedPhase?.id === "phase-1" ||
    selectedPhase?.id === "phase-2" ||
    selectedPhase?.id === "phase-3" ||
    selectedPhase?.id === "phase-4";

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

  const {
    recentAttempts,
    recentArtifacts,
    attemptAnalytics,
    lessonAttemptAnalytics,
    phaseStatuses,
    lessonArtifactSummary,
    artifactCompletionSummary,
    competencyDashboard,
    phaseTransferAnalytics,
    milestonePassRateSummary,
    independentReadiness,
    independentLabSummary,
    outcomesDashboardSummary,
  } = useAnalyticsDashboards({
    curriculum,
    progress,
    transferProgress,
    competencyLevels,
    reviews,
    attempts,
    artifacts,
    selectedLesson,
  });

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

  const {
    addArtifact,
    saveNoteArtifact,
    saveReflectionArtifact,
    exportArtifacts,
    saveFlash,
  } = useArtifactManager({
    artifacts,
    setArtifacts,
    notes,
    reflections,
    selectedLesson,
    reflectionPrompts,
    selectedLessonWeakTracks,
    allLessonsFlat,
  });

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
        const actionItems = completionGate.failedCriteria.map((criterion) => {
          const desc = criterion.description.toLowerCase();
          if (desc.includes("transfer"))
            return "Complete the transfer task below";
          if (desc.includes("reflection"))
            return "Write a reflection in the Reflection checkpoint section";
          if (desc.includes("exercise"))
            return "Answer the exercises in the Validation criteria section";
          return criterion.description;
        });
        setLessonGateFeedback(
          `To complete this lesson: ${actionItems.join(" • ")}`,
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

  function confirmResetLab() {
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
    setShowResetConfirm(false);
  }

  function resetAllProgress() {
    const keys = [
      progressStorageKey,
      notesStorageKey,
      reflectionsStorageKey,
      reviewsStorageKey,
      attemptsStorageKey,
      artifactsStorageKey,
      transferStorageKey,
      labInstancesStorageKey,
    ];
    for (const key of keys) localStorage.removeItem(key);
    setProgress(() => emptyProgress);
    setNotes(() => emptyNotes);
    setReflections(() => emptyReflections);
    setReviews(() => emptyReviews);
    setTransferProgress(() => emptyTransfer);
    setAttempts(() => []);
    setArtifacts(() => []);
    setLabInstances(() => ({}));
    setAnswers({});
    setFeedback({});
    setHintLevels({});
    setTransferAnswers({});
    setTransferFeedback({});
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

  // --- Lab lifecycle ---

  const {
    currentLabTemplate,
    currentLabInstance,
    startLab,
    validateLab,
    resetCurrentLab,
    requestLabHint,
    updateLabFile,
    updateCodeSubmission,
    updateTestOutput,
    handleTerminalCommand,
    labCompletionSummary,
    labTerminalFilesystem,
    labFileContents,
  } = useLabLifecycle(
    selectedLesson?.id,
    labInstances,
    setLabInstances,
    addArtifact,
  );

  const {
    validateExercise,
    validateTransferTask,
    advanceHint,
    toggleInspection,
    currentHintLevels,
    inspectionOpen,
    selectedLessonTransferPassed,
    setHintLevels,
  } = useExerciseValidation({
    selectedLesson,
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

  const phaseLessonCounts = useMemo(
    () =>
      curriculum.phases.map((phase) => {
        const lessons = phase.courses.flatMap((c) => c.lessons);
        return {
          total: lessons.length,
          completed: lessons.filter((l) => progress[l.id]).length,
        };
      }),
    [curriculum.phases, progress],
  );

  const notifications: Notification[] = useMemo(() => {
    const items: Notification[] = [];
    if (reviewQueue.length > 0) {
      items.push({
        id: "review-due",
        type: "review",
        message: `${reviewQueue.length} lesson${reviewQueue.length !== 1 ? "s" : ""} due for review`,
      });
    }
    for (const phase of curriculum.phases) {
      const lessons = phase.courses.flatMap((c) => c.lessons);
      if (lessons.length > 0 && lessons.every((l) => progress[l.id])) {
        items.push({
          id: `milestone-${phase.id}`,
          type: "milestone",
          message: `Phase complete: ${phase.title}`,
        });
      }
    }
    if (activityStreak >= 7) {
      items.push({
        id: `streak-${activityStreak}`,
        type: "streak",
        message: `${activityStreak}-day activity streak!`,
      });
    }
    return items.filter((n) => !dismissedNotifs.has(n.id));
  }, [
    reviewQueue.length,
    curriculum.phases,
    activityStreak,
    progress,
    dismissedNotifs,
  ]);

  const phaseBadges = useMemo(
    () =>
      curriculum.phases.map((phase) => {
        const lessons = phase.courses.flatMap((c) => c.lessons);
        return {
          phaseId: phase.id,
          phaseTitle: phase.title,
          phaseLevel: phase.level,
          earned: lessons.length > 0 && lessons.every((l) => progress[l.id]),
        };
      }),
    [curriculum.phases, progress],
  );

  const totalCompletedLessons = useMemo(
    () => allLessonsFlat.filter((e) => progress[e.lesson.id]).length,
    [allLessonsFlat, progress],
  );

  function dismissNotification(id: string) {
    setDismissedNotifs((prev) => new Set(prev).add(id));
  }

  function dismissAllNotifications() {
    setDismissedNotifs((prev) => {
      const next = new Set(prev);
      notifications.forEach((n) => next.add(n.id));
      return next;
    });
  }

  useKeyboardShortcuts({
    navigateNext: nextEntry ? () => navigateToEntry(nextEntry) : null,
    navigatePrev: prevEntry ? () => navigateToEntry(prevEntry) : null,
    toggleTheme,
    toggleKeyboardHelp: () => setShowKeyboardHelp((v) => !v),
    closeOverlays: () => {
      setShowKeyboardHelp(false);
      setShowResetConfirm(false);
    },
    openSearch: () => setShowGlobalSearch(true),
    goHome: viewMode === "lesson" ? () => setViewMode("home") : null,
    toggleCompletion:
      viewMode === "lesson" && selectedLesson
        ? () =>
            setLessonCompletion(selectedLesson.id, !progress[selectedLesson.id])
        : null,
    scrollToNotes:
      viewMode === "lesson"
        ? () =>
            document
              .getElementById("section-notes")
              ?.scrollIntoView({ behavior: "smooth" })
        : null,
    scrollToExercises:
      viewMode === "lesson"
        ? () =>
            document
              .getElementById("section-exercises")
              ?.scrollIntoView({ behavior: "smooth" })
        : null,
  });

  // Scroll content into view when lesson changes
  useEffect(() => {
    contentRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }, [selectedLessonId]);

  if (
    !selectedPhase ||
    !selectedCourse ||
    !selectedLesson ||
    !phaseProgressSnapshot
  ) {
    return (
      <main className="shell">
        <section className="hero skeleton-hero">
          <span className="eyebrow">Loading…</span>
          <h1>{curriculum.productTitle}</h1>
          <p>{curriculum.productVision}</p>
          <div className="skeleton-row">
            <span className="skeleton-block skeleton-block--1" />
            <span className="skeleton-block skeleton-block--2" />
            <span className="skeleton-block skeleton-block--3" />
          </div>
        </section>
        <div className="skeleton-grid">
          <div className="skeleton-panel skeleton-panel--1" />
          <div className="skeleton-panel skeleton-panel--wide skeleton-panel--2" />
          <div className="skeleton-panel skeleton-panel--3" />
        </div>
      </main>
    );
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

  const isNewUser = Object.keys(progress).length === 0;

  const isCurriculumComplete =
    allLessonsFlat.length > 0 &&
    allLessonsFlat.every((entry) => progress[entry.lesson.id]);

  const nextUnfinishedEntry = allLessonsFlat.find(
    (entry) => !progress[entry.lesson.id],
  );

  return (
    <main className="shell">
      <SkipLink href="#lesson-content">Skip to lesson content</SkipLink>

      <PlatformNavbar
        productTitle={curriculum.productTitle}
        percentComplete={percentComplete}
        viewMode={viewMode}
        breadcrumb={
          viewMode === "lesson"
            ? {
                phase: selectedPhase.title,
                course: selectedCourse.title,
                lesson: selectedLesson.title,
              }
            : null
        }
        notifications={notifications}
        theme={theme}
        onGoHome={() => setViewMode("home")}
        onToggleSearch={() => setShowGlobalSearch(true)}
        onDismissNotification={dismissNotification}
        onDismissAllNotifications={dismissAllNotifications}
        onToggleTheme={toggleTheme}
      />

      {viewMode === "home" ? (
        <>
          <HeroSection
            productTitle={curriculum.productTitle}
            productVision={curriculum.productVision}
            phasesCount={curriculum.phases.length}
            allLessonsCount={allLessonsFlat.length}
            percentComplete={percentComplete}
            activityStreak={activityStreak}
            isCurriculumComplete={isCurriculumComplete}
            isNewUser={isNewUser}
            nextUnfinishedEntry={nextUnfinishedEntry}
            onBeginLesson={() => {
              if (nextUnfinishedEntry) {
                setSelectedPhaseId(nextUnfinishedEntry.phase.id);
                setSelectedLessonId(nextUnfinishedEntry.lesson.id);
              }
              setViewMode("lesson");
              contentRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          />

          <ProgressRoadmap
            phases={curriculum.phases}
            selectedPhaseId={selectedPhase.id}
            progress={progress}
            phaseLessonCounts={phaseLessonCounts}
            onSelectPhase={(phaseId) => {
              selectPhase(phaseId);
              setViewMode("lesson");
            }}
          />

          <HomeDashboard
            curriculum={curriculum}
            percentComplete={percentComplete}
            activityStreak={activityStreak}
            progress={progress}
            reviews={reviews}
            allLessonsFlat={allLessonsFlat}
            nextUnfinishedEntry={nextUnfinishedEntry}
            reviewQueueCount={reviewQueue.length}
            phaseLessonCounts={phaseLessonCounts}
            onContinueCourse={() => {
              if (nextUnfinishedEntry) {
                setSelectedPhaseId(nextUnfinishedEntry.phase.id);
                setSelectedLessonId(nextUnfinishedEntry.lesson.id);
              }
              setViewMode("lesson");
              contentRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
            onSelectPhase={(phaseId) => {
              selectPhase(phaseId);
              setViewMode("lesson");
            }}
            onNavigateToEntry={(entry) => {
              navigateToEntry(entry);
              setViewMode("lesson");
            }}
          />

          <AchievementPanel
            phaseBadges={phaseBadges}
            activityStreak={activityStreak}
            totalCompleted={totalCompletedLessons}
            totalLessons={allLessonsFlat.length}
          />
        </>
      ) : (
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

          <section className="content" ref={contentRef} id="lesson-content">
            {isNewUser && (
              <OnboardingCard
                onStartFirstLesson={() => {
                  contentRef.current?.scrollIntoView({ behavior: "smooth" });
                }}
              />
            )}
            <LessonHeader
              selectedPhase={selectedPhase}
              selectedCourse={selectedCourse}
              selectedLesson={selectedLesson}
              progress={progress}
              showCompletedOnly={showCompletedOnly}
              showResetConfirm={showResetConfirm}
              lessonGateFeedback={lessonGateFeedback}
              onSelectCourse={selectCourse}
              onToggleCompletedOnly={() =>
                setShowCompletedOnly((current) => !current)
              }
              onResetLab={() => setShowResetConfirm(true)}
              onCancelReset={() => setShowResetConfirm(false)}
              onConfirmReset={confirmResetLab}
              showTerminal={showTerminal}
            />

            <ActionBar
              lesson={selectedLesson}
              isComplete={Boolean(progress[selectedLesson.id])}
              lessonProgress={{
                current: selectedLesson.exercises.filter((e) =>
                  answers[e.id]?.trim(),
                ).length,
                total: selectedLesson.exercises.length,
              }}
              onToggleCompletion={() =>
                setLessonCompletion(
                  selectedLesson.id,
                  !progress[selectedLesson.id],
                )
              }
              onScrollToNotes={() =>
                document
                  .getElementById("section-notes")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
              onScrollToExercises={() =>
                document
                  .getElementById("section-exercises")
                  ?.scrollIntoView({ behavior: "smooth" })
              }
            />

            <LessonExplanation lesson={selectedLesson} />

            <LessonExercises lesson={selectedLesson} />

            {selectedLesson.exercises.length > 0 && (
              <LessonValidation
                lesson={selectedLesson}
                answers={answers}
                feedback={feedback}
                currentHintLevels={currentHintLevels}
                inspectionOpenStates={inspectionOpen}
                onUpdateAnswer={updateAnswer}
                onValidateExercise={validateExercise}
                onAdvanceHint={advanceHint}
                onToggleInspection={toggleInspection}
              />
            )}

            {selectedLesson.transferTask && (
              <LessonTransfer
                lesson={selectedLesson}
                transferAnswers={transferAnswers}
                transferFeedback={transferFeedback}
                currentHintLevels={currentHintLevels}
                inspectionOpenStates={inspectionOpen}
                selectedLessonTransferPassed={selectedLessonTransferPassed}
                onUpdateTransferAnswer={(lessonId, answer) =>
                  setTransferAnswers((current) => ({
                    ...current,
                    [lessonId]: answer,
                  }))
                }
                onValidateTransferTask={validateTransferTask}
                onAdvanceHint={advanceHint}
                onToggleInspection={toggleInspection}
              />
            )}

            <LessonCodeExercises
              lesson={selectedLesson}
              onAttempt={(record) =>
                setAttempts((current) => [record, ...current].slice(0, 500))
              }
              onAddArtifact={addArtifact}
            />

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

            <NotesSection
              lessonId={selectedLesson.id}
              notesPrompt={selectedLesson.notesPrompt}
              retention={selectedLesson.retention}
              noteValue={notes[selectedLesson.id] ?? ""}
              reflectionValue={reflections[selectedLesson.id] ?? ""}
              reviewRecord={reviews[selectedLesson.id]}
              recentArtifactCount={recentArtifacts.length}
              reflectionPrompts={reflectionPrompts}
              weakTracks={selectedLessonWeakTracks}
              onNoteChange={updateNote}
              onReflectionChange={updateReflection}
              onMarkReviewed={markReviewed}
              onSaveNote={saveNoteArtifact}
              onSaveReflection={saveReflectionArtifact}
            />

            <LessonTerminal
              showTerminal={showTerminal}
              currentLabTemplate={currentLabTemplate}
              currentLabInstance={currentLabInstance}
              labTerminalFilesystem={labTerminalFilesystem}
              labFileContents={labFileContents}
              onCommandExecuted={handleTerminalCommand}
            />

            <LessonNavigation
              prevEntry={prevEntry}
              nextEntry={nextEntry}
              onNavigateToEntry={navigateToEntry}
            />
          </section>

          <RailPanels
            learnerProfile={learnerProfile}
            updateLearnerProfile={updateLearnerProfile}
            onResetAll={resetAllProgress}
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
      )}

      {viewMode === "home" && (
        <>
          {isNewUser && (
            <>
              <FeatureHighlights />
              <SocialProof />
              <FaqSection />
            </>
          )}

          <PricingCallout
            onBeginLesson={() => {
              if (nextUnfinishedEntry) {
                setSelectedPhaseId(nextUnfinishedEntry.phase.id);
                setSelectedLessonId(nextUnfinishedEntry.lesson.id);
              }
              setViewMode("lesson");
              contentRef.current?.scrollIntoView({ behavior: "smooth" });
            }}
          />
        </>
      )}

      <PageFooter />

      <SaveToast message={saveFlash} />

      <KeyboardHelpTrigger onClick={() => setShowKeyboardHelp(true)} />

      <KeyboardShortcutsDialog
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />

      {showGlobalSearch && (
        <GlobalSearch
          allLessonsFlat={allLessonsFlat}
          progress={progress}
          onNavigateToEntry={(entry) => {
            navigateToEntry(entry);
            setViewMode("lesson");
          }}
          onClose={() => setShowGlobalSearch(false)}
        />
      )}
    </main>
  );
}
