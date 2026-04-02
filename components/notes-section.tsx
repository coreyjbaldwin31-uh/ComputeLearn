import type { ReviewRecord } from "@/lib/progression-engine";
import { formatTrackName, isDueForReview } from "@/lib/progression-engine";

type NotesSectionProps = {
  lessonId: string;
  notesPrompt: string;
  retention: string[];
  noteValue: string;
  reflectionValue: string;
  reviewRecord: ReviewRecord | undefined;
  recentArtifactCount: number;
  reflectionPrompts: string[];
  weakTracks: string[];
  onNoteChange: (lessonId: string, value: string) => void;
  onReflectionChange: (lessonId: string, value: string) => void;
  onMarkReviewed: (lessonId: string) => void;
  onSaveNote: (lessonId: string) => void;
  onSaveReflection: (lessonId: string) => void;
};

export function NotesSection({
  lessonId,
  notesPrompt,
  retention,
  noteValue,
  reflectionValue,
  reviewRecord,
  recentArtifactCount,
  reflectionPrompts,
  weakTracks,
  onNoteChange,
  onReflectionChange,
  onMarkReviewed,
  onSaveNote,
  onSaveReflection,
}: NotesSectionProps) {
  return (
    <section className="notes-grid" id="section-notes">
      <div className="section-label">
        <svg width="16" height="16" viewBox="0 0 16 16" fill="none" aria-hidden="true" className="section-label-icon">
          <path d="M3 2h7l3 3v9H3V2z" stroke="currentColor" strokeWidth="1.3" fill="none" />
          <path d="M10 2v3h3" stroke="currentColor" strokeWidth="1.3" />
          <path d="M5.5 8h5M5.5 10.5h3" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" />
        </svg>
        Notes
      </div>
      <article className="note-card">
        <h4>Saved notes</h4>
        <p>{notesPrompt}</p>
        <textarea
          aria-label="Lesson notes"
          value={noteValue}
          onChange={(event) => onNoteChange(lessonId, event.target.value)}
          placeholder="Capture notes, commands, mistakes, and things to revisit later."
        />
        <p className="microcopy">
          Notes are stored locally for spaced repetition review.
        </p>
        <div className="notes-review-row">
          <span className="review-meta">
            {recentArtifactCount} saved artifacts for this lesson
          </span>
          <button
            type="button"
            className="ghost-button"
            onClick={() => onSaveNote(lessonId)}
          >
            Save note artifact
          </button>
        </div>
        {reviewRecord != null ? (
          <div className="notes-review-row">
            <span className="review-meta">
              {reviewRecord.reviewCount > 0
                ? `Reviewed ${reviewRecord.reviewCount}×`
                : reviewRecord != null && isDueForReview(reviewRecord)
                  ? "Due for review"
                  : "Not yet reviewed — check back soon"}
            </span>
            <button
              type="button"
              className="ghost-button"
              onClick={() => onMarkReviewed(lessonId)}
            >
              Mark reviewed
            </button>
          </div>
        ) : null}
      </article>

      <article className="note-card">
        <h4>Retention cues</h4>
        <ul className="retention-list">
          {retention.map((item, i) => (
            <li key={i}>{item}</li>
          ))}
        </ul>
      </article>

      <article className="note-card">
        <h4>Reflection checkpoint</h4>
        <p className="microcopy">
          Capture what changed, what still feels weak, and what signal you will
          reuse next time.
        </p>
        <ul className="retention-list">
          {reflectionPrompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ul>
        <textarea
          aria-label="Lesson reflection"
          value={reflectionValue}
          onChange={(event) => onReflectionChange(lessonId, event.target.value)}
          placeholder="Write a short reflection: what you verified, what was weak, and what you will do differently next time."
        />
        <div className="notes-review-row">
          <span className="review-meta">
            {weakTracks.length > 0
              ? `Weak focus: ${weakTracks.map(formatTrackName).join(", ")}`
              : "No weak competency flags for this lesson yet"}
          </span>
          <button
            type="button"
            className="ghost-button"
            onClick={() => onSaveReflection(lessonId)}
          >
            Save reflection artifact
          </button>
        </div>
      </article>
    </section>
  );
}
