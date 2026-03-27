import type { ArtifactRecord } from "./artifact-engine";
import type { LessonEntry } from "./progression-engine";

export type ArtifactExportOptions = {
  lessonId?: string;
  generatedAt?: string;
};

export function buildArtifactExportFilename(lessonId?: string): string {
  return lessonId ? `${lessonId}-evidence.md` : "computelearn-evidence.md";
}

export function buildArtifactExportDocument(
  artifacts: ArtifactRecord[],
  entries: LessonEntry[],
  options: ArtifactExportOptions = {},
): string {
  const generatedAt = options.generatedAt ?? new Date().toISOString();
  const filteredArtifacts = options.lessonId
    ? artifacts.filter((artifact) => artifact.lessonId === options.lessonId)
    : artifacts;

  if (filteredArtifacts.length === 0) {
    return [
      "# ComputeLearn Artifact Export",
      "",
      `Generated: ${generatedAt}`,
      options.lessonId ? `Scope: ${options.lessonId}` : "Scope: all lessons",
      "",
      "No artifacts available.",
    ].join("\n");
  }

  const entryByLessonId = new Map(
    entries.map((entry) => [entry.lesson.id, entry] as const),
  );
  const grouped = new Map<string, ArtifactRecord[]>();

  for (const artifact of filteredArtifacts) {
    const lessonArtifacts = grouped.get(artifact.lessonId) ?? [];
    lessonArtifacts.push(artifact);
    grouped.set(artifact.lessonId, lessonArtifacts);
  }

  const sections = Array.from(grouped.entries())
    .sort(([lessonA], [lessonB]) => lessonA.localeCompare(lessonB))
    .map(([lessonId, lessonArtifacts]) => {
      const entry = entryByLessonId.get(lessonId);
      const sortedArtifacts = [...lessonArtifacts].sort(
        (a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt),
      );

      return [
        `## ${entry?.lesson.title ?? lessonId}`,
        entry
          ? `Phase: ${entry.phase.title} | Course: ${entry.course.title}`
          : `Lesson: ${lessonId}`,
        `Artifacts: ${sortedArtifacts.length}`,
        "",
        ...sortedArtifacts.flatMap((artifact) => [
          `### ${artifact.title}`,
          `Type: ${artifact.type}`,
          `Saved: ${artifact.createdAt}`,
          "",
          artifact.content,
          "",
        ]),
      ].join("\n");
    });

  return [
    "# ComputeLearn Artifact Export",
    "",
    `Generated: ${generatedAt}`,
    options.lessonId ? `Scope: ${options.lessonId}` : "Scope: all lessons",
    `Total artifacts: ${filteredArtifacts.length}`,
    "",
    ...sections,
  ].join("\n");
}