"use client";

import type { Lesson } from "@/data/curriculum";

type LessonExercisesProps = {
  lesson: Lesson;
};

export function LessonExercises({ lesson }: LessonExercisesProps) {
  return (
    <section className="exercise-grid" id="section-exercises">
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
