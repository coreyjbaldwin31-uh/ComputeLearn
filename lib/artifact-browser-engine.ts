import type { ArtifactRecord, ArtifactType } from "./artifact-engine";

export type ArtifactCountByType = Record<ArtifactType, number>;

export type ArtifactBrowserSummary = {
  total: number;
  counts: ArtifactCountByType;
  recent: ArtifactRecord[];
};

export function buildArtifactBrowserSummary(
  artifacts: ArtifactRecord[],
  lessonId?: string,
  limit: number = 6,
): ArtifactBrowserSummary {
  const filtered = lessonId
    ? artifacts.filter((artifact) => artifact.lessonId === lessonId)
    : artifacts;
  const recent = [...filtered]
    .sort((a, b) => Date.parse(b.createdAt) - Date.parse(a.createdAt))
    .slice(0, limit);

  const counts: ArtifactCountByType = {
    note: 0,
    completion: 0,
    transfer: 0,
    reflection: 0,
  };

  for (const artifact of filtered) {
    counts[artifact.type] += 1;
  }

  return {
    total: filtered.length,
    counts,
    recent,
  };
}

export function getArtifactPreview(content: string, limit: number = 96): string {
  const normalized = content.replace(/\s+/g, " ").trim();
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit - 1)}…`;
}