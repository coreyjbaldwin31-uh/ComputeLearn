type PhaseBadge = {
  phaseId: string;
  phaseTitle: string;
  phaseLevel: string;
  earned: boolean;
};

import styles from "./achievement-panel.module.css";

type AchievementPanelProps = {
  phaseBadges: PhaseBadge[];
  activityStreak: number;
  totalCompleted: number;
  totalLessons: number;
};

function streakTierClass(tier: string) {
  if (tier === "starting") return styles.streakStarting;
  if (tier === "building") return styles.streakBuilding;
  if (tier === "strong") return styles.streakStrong;
  return styles.streakLegendary;
}

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
    <div className={`${styles.streakBadge} ${streakTierClass(tier)}`}>
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
  const overallPct =
    totalLessons > 0 ? Math.round((totalCompleted / totalLessons) * 100) : 0;

  return (
    <section className={styles.panel}>
      <h3 className={styles.title}>
        <svg
          width="18"
          height="18"
          viewBox="0 0 18 18"
          fill="none"
          aria-hidden="true"
        >
          <path
            d="M9 1l2.2 4.5 5 .7-3.6 3.5.85 5L9 12.5 4.55 14.7l.85-5L1.8 6.2l5-.7L9 1z"
            fill="var(--gold)"
          />
        </svg>
        Achievements
      </h3>

      <div className={styles.statsRow}>
        <div className={styles.statCard}>
          <span className={styles.statValue}>{totalCompleted}</span>
          <span className={styles.statLabel}>Lessons done</span>
        </div>
        <div className={styles.statCard}>
          <span className={styles.statValue}>
            {phaseBadges.filter((b) => b.earned).length}/{phaseBadges.length}
          </span>
          <span className={styles.statLabel}>Phases cleared</span>
        </div>
        <div className={`${styles.statCard} ${styles.statCardAccent}`}>
          <span className={styles.statValue}>{overallPct}%</span>
          <span className={styles.statLabel}>Overall</span>
        </div>
      </div>

      <StreakBadge streak={activityStreak} />

      <div>
        <h4 className={styles.badgesTitle}>Phase badges</h4>
        <div className={styles.badgesGrid}>
          {phaseBadges.map((badge) => (
            <div
              key={badge.phaseId}
              className={`${styles.badge} ${badge.earned ? styles.badgeEarned : ""}`}
            >
              <BadgeIcon earned={badge.earned} />
              <span className={styles.badgeLevel}>{badge.phaseLevel}</span>
              <span className={styles.badgeLabel}>
                {badge.earned ? "Cleared" : "Locked"}
              </span>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
