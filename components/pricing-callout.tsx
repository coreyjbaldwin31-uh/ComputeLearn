type PricingCalloutProps = {
  onBeginLesson: () => void;
};

export function PricingCallout({ onBeginLesson }: PricingCalloutProps) {
  return (
    <section className="pricing-callout" aria-label="Get started">
      <div className="pricing-card pricing-card--featured">
        <span className="pricing-badge">Full access</span>
        <h3 className="pricing-title">Complete learning platform</h3>
        <p className="pricing-description">
          All 37 lessons, 4 progressive phases, hands-on labs, competency
          tracking, artifact export, and spaced repetition review — with
          lifetime offline access.
        </p>
        <ul className="pricing-features">
          <li>
            <span className="pricing-check" aria-hidden="true">
              ✓
            </span>
            37 evidence-gated lessons
          </li>
          <li>
            <span className="pricing-check" aria-hidden="true">
              ✓
            </span>
            Hands-on validation labs
          </li>
          <li>
            <span className="pricing-check" aria-hidden="true">
              ✓
            </span>
            Competency &amp; mastery tracking
          </li>
          <li>
            <span className="pricing-check" aria-hidden="true">
              ✓
            </span>
            Spaced repetition review engine
          </li>
          <li>
            <span className="pricing-check" aria-hidden="true">
              ✓
            </span>
            Exportable learning artifacts
          </li>
          <li>
            <span className="pricing-check" aria-hidden="true">
              ✓
            </span>
            Offline-first — your data stays local
          </li>
          <li>
            <span className="pricing-check" aria-hidden="true">
              ✓
            </span>
            Dark mode &amp; keyboard navigation
          </li>
          <li>
            <span className="pricing-check" aria-hidden="true">
              ✓
            </span>
            Lifetime updates at no extra cost
          </li>
        </ul>
        <button type="button" className="pricing-cta" onClick={onBeginLesson}>
          Start learning now →
        </button>
        <p className="pricing-note">
          No subscription. No hidden fees. One-time purchase, unlimited access.
        </p>
      </div>
    </section>
  );
}
