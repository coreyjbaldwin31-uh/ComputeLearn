"use client";

type OnboardingCardProps = {
  onStartFirstLesson: () => void;
};

export function OnboardingCard({ onStartFirstLesson }: OnboardingCardProps) {
  return (
    <section className="onboarding-card">
      <div className="onboarding-steps">
        <div className="onboarding-step">
          <span className="onboarding-step-number">1</span>
          <div className="onboarding-step-content">
            <h4>Read the concept explanation</h4>
            <p>
              Each lesson starts with a clear, practical explanation of the
              topic followed by a guided demonstration.
            </p>
          </div>
        </div>
        <div className="onboarding-step">
          <span className="onboarding-step-number">2</span>
          <div className="onboarding-step-content">
            <h4>Complete the exercises</h4>
            <p>
              Work through hands-on exercises and validate your answers. Use
              hints and inspection mode if you get stuck.
            </p>
          </div>
        </div>
        <div className="onboarding-step">
          <span className="onboarding-step-number">3</span>
          <div className="onboarding-step-content">
            <h4>Apply what you learned</h4>
            <p>
              Transfer tasks and code exercises let you practice in realistic
              scenarios. Labs give you a full simulated environment.
            </p>
          </div>
        </div>
        <div className="onboarding-step">
          <span className="onboarding-step-number">4</span>
          <div className="onboarding-step-content">
            <h4>Reflect and advance</h4>
            <p>
              Capture notes, mark the lesson complete, and move on. The platform
              tracks your competency and surfaces review when needed.
            </p>
          </div>
        </div>
      </div>
      <button
        type="button"
        className="onboarding-cta"
        onClick={onStartFirstLesson}
      >
        Start your first lesson →
      </button>
    </section>
  );
}
