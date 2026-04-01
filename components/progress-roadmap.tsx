"use client";

type ProgressRoadmapProps = {
  phases: { id: string; title: string; level: string }[];
  selectedPhaseId: string;
  progress: Record<string, true>;
  phaseLessonCounts: { total: number; completed: number }[];
  onSelectPhase: (phaseId: string) => void;
};

export function ProgressRoadmap({
  phases,
  selectedPhaseId,
  phaseLessonCounts,
  onSelectPhase,
}: ProgressRoadmapProps) {
  return (
    <nav className="progress-roadmap" aria-label="Curriculum progress">
      <ol className="roadmap-track">
        {phases.map((phase, i) => {
          const counts = phaseLessonCounts[i];
          const pct =
            counts && counts.total > 0
              ? Math.round((counts.completed / counts.total) * 100)
              : 0;
          const isActive = phase.id === selectedPhaseId;
          const isDone = pct === 100;

          return (
            <li key={phase.id} className="roadmap-step">
              <button
                type="button"
                className={`roadmap-node ${isActive ? "roadmap-node--active" : ""} ${isDone ? "roadmap-node--done" : ""}`}
                onClick={() => onSelectPhase(phase.id)}
                aria-current={isActive ? "step" : undefined}
                title={`${phase.title} — ${pct}% complete`}
              >
                <span className="roadmap-dot" />
                <span className="roadmap-label">{phase.level}</span>
                <span className="roadmap-pct">{pct}%</span>
              </button>
              {i < phases.length - 1 && <span className="roadmap-connector" />}
            </li>
          );
        })}
      </ol>
    </nav>
  );
}
