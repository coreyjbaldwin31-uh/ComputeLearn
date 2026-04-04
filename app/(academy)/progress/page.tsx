import { curriculum } from "@/data/curriculum";
import { CompetencyTracker } from "@/components/competency-tracker";

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

      <div className="academy-progress-grid">
        <div className="academy-progress-row academy-progress-head">
          <span>Phase</span>
          <span>Level</span>
          <span>Duration</span>
          <span>Milestones</span>
        </div>
        {curriculum.phases.map((phase) => (
          <div key={phase.id} className="academy-progress-row">
            <span>{phase.title}</span>
            <span>{phase.level}</span>
            <span>{phase.duration}</span>
            <span>{phase.milestones.length}</span>
          </div>
        ))}
      </div>
    </div>
  );
}
