import type { Curriculum } from "@/data/curriculum";
import type { ArtifactRecord } from "./artifact-engine";
import {
  evaluatePhaseExitStatus,
  getMasteryLevel,
  getPhaseProgressSnapshot,
} from "./progression-engine";

export type IndependentReadinessCheck = {
  id: string;
  label: string;
  detail: string;
  passed: boolean;
};

export type IndependentReadinessSummary = {
  phaseId: string;
  phaseTitle: string;
  statusLabel: "not-started" | "building" | "capstone-ready" | "portfolio-ready";
  completedLessons: number;
  totalLessons: number;
  readinessPercent: number;
  documentedLessons: number;
  documentationArtifacts: number;
  completedCapstoneLessons: number;
  totalCapstoneLessons: number;
  unmetChecks: string[];
  checks: IndependentReadinessCheck[];
};

function isCapstoneLesson(lessonId: string, title: string): boolean {
  return /capstone|portfolio/i.test(`${lessonId} ${title}`);
}

function isDocumentationArtifact(type: ArtifactRecord["type"]): boolean {
  return type === "note" || type === "reflection";
}

export function buildIndependentReadinessSummary(
  curriculum: Curriculum,
  progress: Record<string, true>,
  transferProgress: Record<string, true>,
  competencyLevels: Record<string, number>,
  artifacts: ArtifactRecord[],
): IndependentReadinessSummary | null {
  const phase =
    curriculum.phases.find((entry) => entry.id === "phase-4") ??
    curriculum.phases.find((entry) => /independent/i.test(entry.title));

  if (!phase) {
    return null;
  }

  const lessons = phase.courses.flatMap((course) => course.lessons);
  const snapshot = getPhaseProgressSnapshot(phase, progress, transferProgress);
  const exitStatus = evaluatePhaseExitStatus(
    curriculum,
    phase.id,
    competencyLevels,
    snapshot.transferEvidence,
    snapshot.transferLessons,
  );
  const capstoneLessons = lessons.filter((lesson) =>
    isCapstoneLesson(lesson.id, lesson.title),
  );
  const coreLessons = lessons.filter(
    (lesson) => !isCapstoneLesson(lesson.id, lesson.title),
  );
  const phaseLessonIds = new Set(lessons.map((lesson) => lesson.id));
  const documentationArtifacts = artifacts.filter(
    (artifact) =>
      phaseLessonIds.has(artifact.lessonId) &&
      isDocumentationArtifact(artifact.type),
  );
  const documentedLessons = new Set(
    documentationArtifacts.map((artifact) => artifact.lessonId),
  ).size;
  const completedCoreLessons = coreLessons.filter(
    (lesson) => progress[lesson.id],
  ).length;
  const completedCapstoneLessons = capstoneLessons.filter(
    (lesson) => progress[lesson.id],
  ).length;
  const documentationTarget = Math.min(2, Math.max(1, lessons.length));

  const checks: IndependentReadinessCheck[] = [
    {
      id: "core-projects",
      label: "Core independent builds complete",
      detail: `${completedCoreLessons}/${coreLessons.length} project lessons complete`,
      passed:
        coreLessons.length > 0 && completedCoreLessons === coreLessons.length,
    },
    {
      id: "transfer-coverage",
      label: "Phase 4 transfer evidence captured",
      detail: `${snapshot.transferEvidence}/${snapshot.transferLessons} transfer tasks passed`,
      passed:
        snapshot.transferLessons === 0 ||
        snapshot.transferEvidence === snapshot.transferLessons,
    },
    ...((exitStatus?.gates ?? []).map((gate) => ({
      id: `gate-${gate.competency}`,
      label: gate.description,
      detail: `Current: ${getMasteryLevel(gate.currentScore)} (${gate.currentScore}) · Required: ${gate.requiredLevel}`,
      passed: gate.passed,
    })) satisfies IndependentReadinessCheck[]),
    {
      id: "portfolio-documentation",
      label: "Portfolio documentation captured",
      detail: `${documentationArtifacts.length} documentation artifacts across ${documentedLessons} lessons`,
      passed:
        documentationArtifacts.length >= 2 &&
        documentedLessons >= documentationTarget,
    },
    {
      id: "capstone-packaged",
      label: "Capstone packaged",
      detail: `${completedCapstoneLessons}/${capstoneLessons.length} capstone lessons complete`,
      passed:
        capstoneLessons.length === 0 ||
        completedCapstoneLessons === capstoneLessons.length,
    },
  ];

  const passedChecks = checks.filter((check) => check.passed).length;
  const readinessPercent =
    checks.length === 0 ? 0 : Math.round((passedChecks / checks.length) * 100);
  const competencyChecksPassed = checks
    .filter((check) => check.id.startsWith("gate-"))
    .every((check) => check.passed);
  const coreProjectsPassed = checks.find((check) => check.id === "core-projects")?.passed ?? false;
  const transferCoveragePassed =
    checks.find((check) => check.id === "transfer-coverage")?.passed ?? false;
  const capstonePackaged =
    checks.find((check) => check.id === "capstone-packaged")?.passed ?? false;

  let statusLabel: IndependentReadinessSummary["statusLabel"] = "building";
  if (snapshot.completedLessons === 0 && documentationArtifacts.length === 0) {
    statusLabel = "not-started";
  } else if (checks.every((check) => check.passed)) {
    statusLabel = "portfolio-ready";
  } else if (
    coreProjectsPassed &&
    transferCoveragePassed &&
    competencyChecksPassed &&
    !capstonePackaged
  ) {
    statusLabel = "capstone-ready";
  }

  return {
    phaseId: phase.id,
    phaseTitle: phase.title,
    statusLabel,
    completedLessons: snapshot.completedLessons,
    totalLessons: snapshot.totalLessons,
    readinessPercent,
    documentedLessons,
    documentationArtifacts: documentationArtifacts.length,
    completedCapstoneLessons,
    totalCapstoneLessons: capstoneLessons.length,
    unmetChecks: checks.filter((check) => !check.passed).map((check) => check.label),
    checks,
  };
}
