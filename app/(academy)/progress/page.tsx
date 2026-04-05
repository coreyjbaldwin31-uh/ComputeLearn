import { curriculum } from "@/data/curriculum";
import { CompetencyTracker } from "@/components/competency-tracker";
import { ProgressAnalytics } from "@/components/progress-analytics";
import { TranscriptExport } from "@/components/transcript-export";

export default function ProgressPage() {
  return (
    <div className="academy-page">
      <header className="academy-page-header">
        <p className="academy-kicker">Progress</p>
        <h1>Program progress</h1>
        <p className="academy-desc">
          Track competency levels, phase exit gates, and mastery progression
          across the full program.
        </p>
      </header>

      {/* Interactive competency tracker */}
      <CompetencyTracker />

      {/* Rich analytics panels */}
      <ProgressAnalytics />

      <table className="academy-progress-grid" role="table" aria-label="Phase overview">
        <thead>
          <tr className="academy-progress-row academy-progress-head">
            <th scope="col">Phase</th>
            <th scope="col">Level</th>
            <th scope="col">Duration</th>
            <th scope="col">Milestones</th>
          </tr>
        </thead>
        <tbody>
          {curriculum.phases.map((phase) => (
            <tr key={phase.id} className="academy-progress-row">
              <td>{phase.title}</td>
              <td>{phase.level}</td>
              <td>{phase.duration}</td>
              <td>{phase.milestones.length}</td>
            </tr>
          ))}
        </tbody>
      </table>

      {/* Transcript / portfolio export */}
      <TranscriptExport />
    </div>
  );
}
