import type { Lesson } from "@/data/curriculum";
import type { ArtifactRecord } from "@/lib/artifact-engine";
import { buildArtifactRecord, createId } from "@/lib/artifact-engine";
import {
  buildArtifactExportDocument,
  buildArtifactExportFilename,
} from "@/lib/artifact-export-engine";
import type { LessonEntry } from "@/lib/progression-engine";
import { formatReflectionArtifactContent } from "@/lib/reflection-engine";
import { useCallback, useState } from "react";

type ArtifactManagerConfig = {
  artifacts: ArtifactRecord[];
  setArtifacts: (fn: (current: ArtifactRecord[]) => ArtifactRecord[]) => void;
  notes: Record<string, string>;
  reflections: Record<string, string>;
  selectedLesson: Lesson | undefined;
  reflectionPrompts: string[];
  selectedLessonWeakTracks: string[];
  allLessonsFlat: LessonEntry[];
};

export function useArtifactManager({
  artifacts,
  setArtifacts,
  notes,
  reflections,
  selectedLesson,
  reflectionPrompts,
  selectedLessonWeakTracks,
  allLessonsFlat,
}: ArtifactManagerConfig) {
  const [saveFlash, setSaveFlash] = useState<string | null>(null);

  const addArtifact = useCallback(
    (
      type: ArtifactRecord["type"],
      title: string,
      content: string,
      lessonId: string,
    ) => {
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
    },
    [setArtifacts],
  );

  const showSaveConfirmation = useCallback((label: string) => {
    setSaveFlash(label);
    setTimeout(() => setSaveFlash(null), 2000);
  }, []);

  const saveNoteArtifact = useCallback(
    (lessonId: string) => {
      const note = notes[lessonId] ?? "";
      addArtifact("note", "Lesson note", note, lessonId);
      showSaveConfirmation("Note saved ✓");
    },
    [addArtifact, notes, showSaveConfirmation],
  );

  const saveReflectionArtifact = useCallback(
    (lessonId: string) => {
      if (!selectedLesson || selectedLesson.id !== lessonId) return;
      const reflection = reflections[lessonId] ?? "";
      const content = formatReflectionArtifactContent(
        selectedLesson.title,
        reflectionPrompts,
        reflection,
        selectedLessonWeakTracks,
      );
      addArtifact("reflection", "Reflection checkpoint", content, lessonId);
      showSaveConfirmation("Reflection saved ✓");
    },
    [
      addArtifact,
      reflections,
      reflectionPrompts,
      selectedLesson,
      selectedLessonWeakTracks,
      showSaveConfirmation,
    ],
  );

  const exportArtifacts = useCallback(
    (lessonId?: string) => {
      const exportDocument = buildArtifactExportDocument(
        artifacts,
        allLessonsFlat,
        { lessonId },
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
    },
    [allLessonsFlat, artifacts],
  );

  return {
    addArtifact,
    saveNoteArtifact,
    saveReflectionArtifact,
    exportArtifacts,
    saveFlash,
  };
}
