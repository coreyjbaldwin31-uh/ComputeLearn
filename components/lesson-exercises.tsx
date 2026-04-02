"use client";

import type { Lesson } from "@/data/curriculum";

type LessonExercisesProps = {
  lesson: Lesson;
};

export function LessonExercises({ lesson }: LessonExercisesProps) {
  return (
    <section className="exercise-grid" id="section-exercises">
      <div className="section-label">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="section-label-icon"
        >
          <path
            d="M3 8h10M5 5v6M11 5v6M2 7v2M14 7v2"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        Practice
      </div>
      <article className="exercise-card">
        <h4>Hands-on exercise</h4>
        <ol className="exercise-list">
          {lesson.exerciseSteps.map((step, i) => (
            <li key={i}>{step}</li>
          ))}
        </ol>
      </article>

      <article className="check-card">
        <h4>Validation criteria</h4>
        <ul className="validation-list">
          {lesson.validationChecks.map((check, i) => (
            <li key={i}>{check}</li>
          ))}
        </ul>
      </article>
    </section>
  );
}
