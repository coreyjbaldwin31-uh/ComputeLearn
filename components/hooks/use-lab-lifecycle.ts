"use client";

import {
  phase1LabsByLesson,
  phase2LabsByLesson,
  phase3LabsByLesson,
  phase4LabsByLesson,
} from "@/data/lab-templates";
import type { ArtifactRecord } from "@/lib/artifact-engine";
import type { LabInstance } from "@/lib/lab-engine";
import {
  buildLabCompletionSummary,
  createLabInstance,
  getLabHint,
  recordLabAttempt,
  resetLabInstance,
  validateLabInstance,
} from "@/lib/lab-engine";
import { useMemo, useState } from "react";

type AddArtifactFn = (
  type: ArtifactRecord["type"],
  title: string,
  content: string,
  lessonId: string,
) => void;

export function useLabLifecycle(
  selectedLessonId: string | undefined,
  labInstances: Record<string, LabInstance>,
  setLabInstances: (
    fn:
      | Record<string, LabInstance>
      | ((prev: Record<string, LabInstance>) => Record<string, LabInstance>),
  ) => void,
  addArtifact: AddArtifactFn,
) {
  const [labHintLevels, setLabHintLevels] = useState<Record<string, number>>(
    {},
  );

  const currentLabTemplates = selectedLessonId
    ? (phase1LabsByLesson[selectedLessonId] ??
      phase2LabsByLesson[selectedLessonId] ??
      phase3LabsByLesson[selectedLessonId] ??
      phase4LabsByLesson[selectedLessonId] ??
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
    if (result.passed && selectedLessonId) {
      addArtifact(
        "completion",
        `Lab completed: ${currentLabTemplate.title}`,
        buildLabCompletionSummary(currentLabTemplate, updated),
        selectedLessonId,
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

  const labCompletionSummary =
    currentLabTemplate && currentLabInstance?.status === "completed"
      ? buildLabCompletionSummary(currentLabTemplate, currentLabInstance)
      : null;

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

  const labFileContents = useMemo(() => {
    if (!currentLabInstance) return undefined;
    const map: Record<string, string> = {};
    for (const f of currentLabInstance.files) {
      map[`C:\\Users\\learner\\${f.path.replace(/\//g, "\\")}`] = f.content;
    }
    return map;
  }, [currentLabInstance]);

  return {
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
  };
}
