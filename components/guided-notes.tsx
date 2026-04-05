"use client";

import type { Lesson } from "@/data/curriculum";
import { RichText } from "./rich-text";
import styles from "./guided-notes.module.css";

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
    <div className={styles.root}>
      <h3 className={styles.title}>Key Concepts</h3>
      <p className={styles.intro}>
        Read each concept carefully. Write down what it means in your own words,
        then mark it understood when you are confident.
      </p>

      <div className={styles.cards}>
        {lesson.explanation.map((concept, i) => (
          <div
            key={i}
            className={`${styles.card}${understood[i] ? ` ${styles.cardUnderstood}` : ""}`}
            data-testid="guided-note-card"
            data-understood={understood[i] ? "true" : "false"}
          >
            <div className={styles.cardHeader}>
              <span className={styles.conceptNumber}>{i + 1}</span>
              <div className={styles.conceptText}>
                <RichText content={concept} />
              </div>
            </div>

            <div className={styles.cardBody}>
              <label className={styles.noteLabel} htmlFor={`gn-note-${i}`}>
                Your notes on this concept:
              </label>
              <textarea
                id={`gn-note-${i}`}
                className={styles.textarea}
                rows={3}
                value={conceptNotes[i] ?? ""}
                onChange={(e) => onNoteChange(i, e.target.value)}
                placeholder="Restate this concept in your own words..."
              />
            </div>

            <div className={styles.cardFooter}>
              <label className={styles.understoodLabel}>
                <input
                  type="checkbox"
                  checked={!!understood[i]}
                  onChange={(e) => onUnderstoodChange(i, e.target.checked)}
                  className={styles.checkbox}
                />
                <span className={styles.checkboxVisual} />I understand this concept
              </label>
            </div>
          </div>
        ))}
      </div>

      {/* Progress summary */}
      <div className={styles.progress} role="status" aria-live="polite">
        <div className={styles.progressBar} aria-hidden="true">
          <div
            className={styles.progressFill}
            ref={(el) => {
              if (el)
                el.style.width = `${(Object.values(understood).filter(Boolean).length / Math.max(lesson.explanation.length, 1)) * 100}%`;
            }}
          />
        </div>
        <span className={styles.progressText}>
          {Object.values(understood).filter(Boolean).length} of{" "}
          {lesson.explanation.length} concepts understood
        </span>
      </div>
    </div>
  );
}
