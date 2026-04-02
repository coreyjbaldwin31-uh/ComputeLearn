"use client";

import type { Lesson } from "@/data/curriculum";

type LessonExplanationProps = {
  lesson: Lesson;
};

export function LessonExplanation({ lesson }: LessonExplanationProps) {
  return (
    <section className="section-grid" id="section-explanation">
      <div className="section-label">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="section-label-icon">
          <path d="M2 2h5v12H2V2zM9 2h5v12H9V2z" stroke="currentColor" strokeWidth="1.3" fill="none" strokeLinejoin="round" />
        </svg>
        Concept
      </div>
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
