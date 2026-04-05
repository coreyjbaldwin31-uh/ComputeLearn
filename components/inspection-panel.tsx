import type { ExerciseInspection } from "@/lib/inspection-engine";
import styles from "./inspection-panel.module.css";

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
      className={styles.panel}
      role="region"
      aria-label="Response inspection"
    >
      <div className={styles.skillGap}>
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className={styles.gapIcon}
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
          <span className={styles.gapLabel}>Skill gap</span>
          <span className={styles.gapValue}>
            {inspection.probableSkillGap}
          </span>
        </div>
      </div>
      <div className={styles.grid}>
        <div>
          <h5 className={styles.matchedHeading}>
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
          <ul className={`${styles.list} ${styles.listMatched}`}>
            {(inspection.matchedSignals.length > 0
              ? inspection.matchedSignals
              : ["No expected signals matched yet."]
            ).map((signal) => (
              <li key={`${keyPrefix}match-${signal}`}>{signal}</li>
            ))}
          </ul>
        </div>
        <div>
          <h5 className={styles.missingHeading}>
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
          <ul className={`${styles.list} ${styles.listMissing}`}>
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
        <h5 className={styles.promptsHeading}>Inspection prompts</h5>
        <ul className={styles.list}>
          {inspection.inspectionPrompts.map((prompt) => (
            <li key={prompt}>{prompt}</li>
          ))}
        </ul>
      </div>
      <div>
        <h5>Signal diff</h5>
        <pre className={styles.diff}>
          {inspection.signalDiff.length > 0
            ? inspection.signalDiff.join("\n")
            : "No signal diff available yet."}
        </pre>
      </div>
    </aside>
  );
}
