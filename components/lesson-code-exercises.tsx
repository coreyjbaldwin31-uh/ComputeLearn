"use client";

import type { Lesson } from "@/data/curriculum";
import type { ArtifactRecord, AttemptRecord } from "@/lib/artifact-engine";
import { buildAttemptRecord, createId } from "@/lib/artifact-engine";
import { CodeExercise } from "./code-exercise";

type LessonCodeExercisesProps = {
  lesson: Lesson;
  onAttempt: (attempt: AttemptRecord) => void;
  onAddArtifact: (
    type: ArtifactRecord["type"],
    title: string,
    content: string,
    lessonId: string,
  ) => void;
};

export function LessonCodeExercises({
  lesson,
  onAttempt,
  onAddArtifact,
}: LessonCodeExercisesProps) {
  if (!lesson.codeExercises || lesson.codeExercises.length === 0) {
    return null;
  }

  return (
    <section className="code-exercises-section" id="section-code">
      <div className="section-label">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="section-label-icon">
          <path d="M5.5 4.5L2 8l3.5 3.5M10.5 4.5L14 8l-3.5 3.5" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        Code
      </div>
      {lesson.codeExercises.map((ex) => (
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
              lessonId: lesson.id,
              exerciseId: ex.id,
              assessmentType: "action",
              answer: code,
              passed,
              attemptedAt: new Date().toISOString(),
            });
            onAttempt(record);
            if (passed) {
              onAddArtifact(
                "completion",
                `Code exercise: ${ex.title}`,
                code,
                lesson.id,
              );
            }
          }}
        />
      ))}
    </section>
  );
}
