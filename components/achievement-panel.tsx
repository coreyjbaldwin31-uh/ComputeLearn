type PhaseBadge = {
  phaseId: string;
  phaseTitle: string;
  phaseLevel: string;
  earned: boolean;
};

type AchievementPanelProps = {
  phaseBadges: PhaseBadge[];
  activityStreak: number;
  totalCompleted: number;
  totalLessons: number;
};

function BadgeIcon({ earned }: { earned: boolean }) {
  if (earned) {
    return (
      <svg
        width="32"
        height="32"
        viewBox="0 0 32 32"
        fill="none"
        aria-hidden="true"
      >
        <circle cx="16" cy="13" r="11" fill="var(--accent)" opacity="0.15" />
        <circle
          cx="16"
          cy="13"
          r="11"
          stroke="var(--accent)"
          strokeWidth="1.5"
          fill="none"
        />
        <path
          d="M11 13.5l3 3 7-7"
          stroke="var(--accent)"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        />
        <path d="M11 24l5-3 5 3v-5" fill="var(--accent)" opacity="0.25" />
      </svg>
    );
  }
  return (
    <svg
      width="32"
      height="32"
      viewBox="0 0 32 32"
      fill="none"
      aria-hidden="true"
    >
      <circle
        cx="16"
        cy="13"
        r="11"
        stroke="var(--border)"
        strokeWidth="1.5"
        fill="none"
        strokeDasharray="4 3"
      />
      <path d="M11 24l5-3 5 3v-5" fill="var(--border)" opacity="0.2" />
    </svg>
  );
}

function StreakBadge({ streak }: { streak: number }) {
  const tier =
    streak >= 30
      ? "legendary"
      : streak >= 14
        ? "strong"
        : streak >= 7
          ? "building"
          : streak >= 3
            ? "starting"
            : "none";

  if (tier === "none") return null;

  const label =
    tier === "legendary"
      ? "30-day streak!"
      : tier === "strong"
        ? "14-day streak"
        : tier === "building"
          ? "7-day streak"
          : "3-day streak";

  return (
    <div
      className={`achievement-streak-badge achievement-streak-badge--${tier}`}
    >
      <svg
        width="20"
        height="20"
        viewBox="0 0 20 20"
        fill="none"
        aria-hidden="true"
      >
        <path
          d="M10 2c0 4-3 5-3 8a3 3 0 006 0c0-3-3-4-3-8z"
          fill="var(--gold)"
        />
      </svg>
      <span>{label}</span>
    </div>
  );
}

export function AchievementPanel({
  phaseBadges,
  activityStreak,
  totalCompleted,
  totalLessons,
}: AchievementPanelProps) {
  return (
    <section className="achievement-panel">
      <h3 className="achievement-title">Achievements</h3>

      <div className="achievement-summary">
        <div className="achievement-stat">
          <span className="achievement-stat-value">{totalCompleted}</span>
          <span className="achievement-stat-label">Lessons done</span>
        </div>
        <div className="achievement-stat">
          <span className="achievement-stat-value">
            {phaseBadges.filter((b) => b.earned).length}
          </span>
          <span className="achievement-stat-label">Phases cleared</span>
        </div>
        <div className="achievement-stat">
          <span className="achievement-stat-value">
            {totalLessons > 0
              ? Math.round((totalCompleted / totalLessons) * 100)
              : 0}
            %
          </span>
          <span className="achievement-stat-label">Overall</span>
        </div>
      </div>

      <StreakBadge streak={activityStreak} />

      <div className="achievement-badges">
        <h4 className="achievement-badges-title">Phase badges</h4>
        <div className="achievement-badges-grid">
          {phaseBadges.map((badge) => (
            <div
              key={badge.phaseId}
              className={`achievement-badge ${badge.earned ? "achievement-badge--earned" : ""}`}
            >
              <BadgeIcon earned={badge.earned} />
              <span className="achievement-badge-level">
                {badge.phaseLevel}
              </span>
              <span className="achievement-badge-label">
                {badge.earned ? "Cleared" : "Locked"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
