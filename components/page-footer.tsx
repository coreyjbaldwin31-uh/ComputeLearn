export function PageFooter() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="page-footer">
      <div className="footer-grid">
        <div className="footer-brand">
          <span className="footer-logo">ComputeLearn</span>
          <p>
            Mastery-based software engineering training. Learn by building, not
            by watching.
          </p>
        </div>

        <div className="footer-links">
          <h4>Platform</h4>
          <ul>
            <li>4-phase curriculum</li>
            <li>Hands-on validation labs</li>
            <li>Competency tracking</li>
            <li>Exportable artifacts</li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Support</h4>
          <ul>
            <li>Getting started guide</li>
            <li>Keyboard shortcuts</li>
            <li>Progress &amp; data privacy</li>
            <li>Accessibility</li>
          </ul>
        </div>

        <div className="footer-links">
          <h4>Built with</h4>
          <ul>
            <li>Next.js &amp; React</li>
            <li>TypeScript</li>
            <li>Offline-first storage</li>
            <li>WCAG 2.1 AA compliant</li>
          </ul>
        </div>
      </div>

      <div className="footer-bottom">
        <span>&copy; {currentYear} ComputeLearn. All rights reserved.</span>
        <span className="footer-tagline">
          Train engineering behavior, not just engineering knowledge.
        </span>
      </div>
    </footer>
  );
}
