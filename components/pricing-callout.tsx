import styles from "./pricing-callout.module.css";

type PricingCalloutProps = {
  onBeginLesson: () => void;
};

export function PricingCallout({ onBeginLesson }: PricingCalloutProps) {
  return (
    <section className={styles.pricingCallout} aria-label="Get started">
      <div className={`${styles.pricingCard} ${styles.pricingCardFeatured}`}>
        <span className={styles.pricingBadge}>Full access</span>
        <h3 className={styles.pricingTitle}>Complete learning platform</h3>
        <p className={styles.pricingDescription}>
          All 37 lessons, 4 progressive phases, hands-on labs, competency
          tracking, artifact export, and spaced repetition review — with
          lifetime offline access.
        </p>
        <ul className={styles.pricingFeatures}>
          <li>
            <span className={styles.pricingCheck} aria-hidden="true">
              ✓
            </span>
            37 evidence-gated lessons
          </li>
          <li>
            <span className={styles.pricingCheck} aria-hidden="true">
              ✓
            </span>
            Hands-on validation labs
          </li>
          <li>
            <span className={styles.pricingCheck} aria-hidden="true">
              ✓
            </span>
            Competency &amp; mastery tracking
          </li>
          <li>
            <span className={styles.pricingCheck} aria-hidden="true">
              ✓
            </span>
            Spaced repetition review engine
          </li>
          <li>
            <span className={styles.pricingCheck} aria-hidden="true">
              ✓
            </span>
            Exportable learning artifacts
          </li>
          <li>
            <span className={styles.pricingCheck} aria-hidden="true">
              ✓
            </span>
            Offline-first — your data stays local
          </li>
          <li>
            <span className={styles.pricingCheck} aria-hidden="true">
              ✓
            </span>
            Dark mode &amp; keyboard navigation
          </li>
          <li>
            <span className={styles.pricingCheck} aria-hidden="true">
              ✓
            </span>
            Lifetime updates at no extra cost
          </li>
        </ul>
        <button
          type="button"
          className={styles.pricingCta}
          onClick={onBeginLesson}
        >
          Start learning now →
        </button>
        <p className={styles.pricingNote}>
          No subscription. No hidden fees. One-time purchase, unlimited access.
        </p>
      </div>
    </section>
  );
}
