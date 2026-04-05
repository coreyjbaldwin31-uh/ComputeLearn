"use client";

import type { Lesson } from "@/data/curriculum";
import { RichText } from "./rich-text";

type GuidedNotesProps = {
  lesson: Lesson;
  conceptNotes: Record<number, string>;
  understood: Record<number, boolean>;
  onNoteChange: (index: number, value: string) => void;
  onUnderstoodChange: (index: number, checked: boolean) => void;
};

export function GuidedNotes({
  lesson,
  conceptNotes,
  understood,
  onNoteChange,
  onUnderstoodChange,
}: GuidedNotesProps) {
  return (
    <div className="gn">
      <h3 className="gn-title">Key Concepts</h3>
      <p className="gn-intro">
        Read each concept carefully. Write down what it means in your own words,
        then mark it understood when you are confident.
      </p>

      <div className="gn-cards">
        {lesson.explanation.map((concept, i) => (
          <div
            key={i}
            className={`gn-card${understood[i] ? " gn-card--understood" : ""}`}
          >
            <div className="gn-card-header">
              <span className="gn-concept-number">{i + 1}</span>
              <div className="gn-concept-text">
                <RichText content={concept} />
              </div>
            </div>

            <div className="gn-card-body">
              <label className="gn-note-label" htmlFor={`gn-note-${i}`}>
                Your notes on this concept:
              </label>
              <textarea
                id={`gn-note-${i}`}
                className="gn-textarea"
                rows={3}
                value={conceptNotes[i] ?? ""}
                onChange={(e) => onNoteChange(i, e.target.value)}
                placeholder="Restate this concept in your own words..."
              />
            </div>

            <div className="gn-card-footer">
              <label className="gn-understood-label">
                <input
                  type="checkbox"
                  checked={!!understood[i]}
                  onChange={(e) => onUnderstoodChange(i, e.target.checked)}
                  className="gn-checkbox"
                />
                <span className="gn-checkbox-visual" />I understand this concept
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Progress summary */}
      <div className="gn-progress" role="status" aria-live="polite">
        <div className="gn-progress-bar" aria-hidden="true">
          <div
            className="gn-progress-fill"
            ref={(el) => {
              if (el)
                el.style.width = `${(Object.values(understood).filter(Boolean).length / Math.max(lesson.explanation.length, 1)) * 100}%`;
            }}
          />
        </div>
        <span className="gn-progress-text">
          {Object.values(understood).filter(Boolean).length} of{" "}
          {lesson.explanation.length} concepts understood
        </span>
      </div>
    </div>
  );
}
