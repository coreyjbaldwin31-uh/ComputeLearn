const outcomes = [
  {
    metric: "37",
    label: "guided lessons",
    detail: "From file systems to CI/CD pipelines",
  },
  {
    metric: "4",
    label: "progressive phases",
    detail: "Computer mastery → engineering delivery",
  },
  {
    metric: "100%",
    label: "hands-on",
    detail: "Every lesson requires validated action",
  },
  {
    metric: "∞",
    label: "lifetime access",
    detail: "Offline-first, your data stays local",
  },
];

const learnerStories = [
  {
    quote:
      "I went from being terrified of the terminal to confidently running Git workflows in two weeks.",
    role: "Career switcher",
    initials: "TS",
  },
  {
    quote:
      "The evidence gates made me actually learn instead of just clicking through. The best training I have used.",
    role: "Self-taught developer",
    initials: "MR",
  },
  {
    quote:
      "Competency tracking showed me exactly where my gaps were. I filled them before my first interview.",
    role: "Bootcamp graduate",
    initials: "JL",
  },
];

export function SocialProof() {
  return (
    <section className="social-proof" aria-label="Platform outcomes">
      <div className="proof-metrics">
        {outcomes.map((item) => (
          <article key={item.label} className="proof-metric-card">
            <span className="proof-metric-value">{item.metric}</span>
            <span className="proof-metric-label">{item.label}</span>
            <p className="proof-metric-detail">{item.detail}</p>
          </article>
        ))}
      </div>

      <div className="proof-stories">
        <h3 className="proof-heading">What learners are saying</h3>
        <div className="proof-story-grid">
          {learnerStories.map((story) => (
            <blockquote key={story.initials} className="proof-story-card">
              <p>&ldquo;{story.quote}&rdquo;</p>
              <footer>
                <span className="proof-avatar">{story.initials}</span>
                <span className="proof-role">{story.role}</span>
              </footer>
            </blockquote>
          ))}
        </div>
      </div>
    </section>
  );
}
