"use client";

import type { Lesson } from "@/data/curriculum";

type LessonExplanationProps = {
  lesson: Lesson;
};

export function LessonExplanation({ lesson }: LessonExplanationProps) {
  return (
    <section className="section-grid" id="section-explanation">
      <div className="section-label"><span className="section-label-icon">📖</span> Concept</div>
      <article className="lesson-card">
        <h4>Concept explanation</h4>
        {lesson.explanation.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </article>

      <article className="lesson-card">
        <h4>Guided demonstration</h4>
        {lesson.demonstration.map((paragraph, i) => (
          <p key={i}>{paragraph}</p>
        ))}
      </article>
    </section>
  );
}
