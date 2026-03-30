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
    <div className="inspection-panel">
      <div className="inspection-row">
        <span className="inspection-label">Skill gap</span>
        <span>{inspection.probableSkillGap}</span>
      </div>
      <div className="inspection-grid">
        <div>
          <h5>Matched signals</h5>
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
          <h5>Missing signals</h5>
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
        <h5>Inspection prompts</h5>
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
    </div>
  );
}
