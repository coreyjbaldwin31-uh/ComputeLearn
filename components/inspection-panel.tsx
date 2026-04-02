import type { ExerciseInspection } from "@/lib/inspection-engine";

type InspectionPanelProps = {
  inspection: ExerciseInspection;
  keyPrefix?: string;
};

export function InspectionPanel({
  inspection,
  keyPrefix = "",
}: InspectionPanelProps) {
  return (
    <aside
      className="inspection-panel"
      role="region"
      aria-label="Response inspection"
    >
      <div className="inspection-skill-gap">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="inspection-gap-icon"
        >
          <circle
            cx="8"
            cy="8"
            r="7"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
          />
          <path
            d="M8 4.5v4M8 10.5v1"
            stroke="currentColor"
            strokeWidth="1.5"
            strokeLinecap="round"
          />
        </svg>
        <div>
          <span className="inspection-gap-label">Skill gap</span>
          <span className="inspection-gap-value">
            {inspection.probableSkillGap}
          </span>
        </div>
      </div>
      <div className="inspection-grid">
        <div>
          <h5 className="inspection-matched">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 8.5l3 3 5-5"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              />
            </svg>
            Matched signals
          </h5>
          <ul className="inspection-list inspection-list--matched">
            {(inspection.matchedSignals.length > 0
              ? inspection.matchedSignals
              : ["No expected signals matched yet."]
            ).map((signal) => (
              <li key={`${keyPrefix}match-${signal}`}>{signal}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="inspection-missing">
            <svg
              width="14"
              height="14"
              viewBox="0 0 16 16"
              fill="none"
              aria-hidden="true"
            >
              <path
                d="M4 4l8 8M12 4l-8 8"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
              />
            </svg>
            Missing signals
          </h5>
          <ul className="inspection-list inspection-list--missing">
            {(inspection.missingSignals.length > 0
              ? inspection.missingSignals
              : ["No missing signals."]
            ).map((signal) => (
              <li key={`${keyPrefix}missing-${signal}`}>{signal}</li>
            ))}
          </ul>
        </div>
      </div>
      <div>
        <h5 className="inspection-prompts">Inspection prompts</h5>
        <ul className="inspection-list">
          {inspection.inspectionPrompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ul>
      </div>
      <div>
        <h5>Signal diff</h5>
        <pre className="inspection-diff">
          {inspection.signalDiff.length > 0
            ? inspection.signalDiff.join("\n")
            : "No signal diff available yet."}
        </pre>
      </div>
    </aside>
  );
}
