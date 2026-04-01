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
      <div className="inspection-row">
        <span className="inspection-label">Skill gap</span>
        <span>{inspection.probableSkillGap}</span>
      </div>
      <div className="inspection-grid">
        <div>
          <h5 className="inspection-matched">✓ Matched signals</h5>
          <ul className="inspection-list">
            {(inspection.matchedSignals.length > 0
              ? inspection.matchedSignals
              : ["No expected signals matched yet."]
            ).map((signal) => (
              <li key={`${keyPrefix}match-${signal}`}>{signal}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className="inspection-missing">✗ Missing signals</h5>
          <ul className="inspection-list">
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
