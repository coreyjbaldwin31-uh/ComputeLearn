const features = [
  {
    icon: "📖",
    title: "Structured curriculum",
    description:
      "37 lessons across 4 phases move you from file-system basics to CI/CD pipeline delivery.",
  },
  {
    icon: "🔬",
    title: "Evidence-gated completion",
    description:
      "Every lesson requires validated hands-on action — no clicking through slides.",
  },
  {
    icon: "🧪",
    title: "Hands-on labs",
    description:
      "Guided, safe, resettable environments where you practice real terminal and code workflows.",
  },
  {
    icon: "📊",
    title: "Competency tracking",
    description:
      "Real-time mastery levels, weak-track alerts, and spaced repetition review queues.",
  },
  {
    icon: "📦",
    title: "Exportable artifacts",
    description:
      "Save notes, reflections, and completion evidence as portable learning artifacts.",
  },
  {
    icon: "🎯",
    title: "Transfer tasks",
    description:
      "Apply what you learned in new contexts — the real test of understanding.",
  },
];

export function FeatureHighlights() {
  return (
    <section className="feature-highlights" aria-label="Platform features">
      <div className="feature-highlights-header">
        <span className="eyebrow">Everything you need</span>
        <h2 className="feature-highlights-title">
          Built for real engineering competence
        </h2>
        <p className="feature-highlights-subtitle">
          Every feature is designed to build lasting operational skill, not just
          check a box.
        </p>
      </div>
      <div className="feature-grid">
        {features.map((feature) => (
          <article key={feature.title} className="feature-card">
            <span className="feature-icon" aria-hidden="true">
              {feature.icon}
            </span>
            <h3>{feature.title}</h3>
            <p>{feature.description}</p>
          </article>
        ))}
      </div>
    </section>
  );
}
