import { ReadinessWizard } from "@/components/readiness-wizard";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Independent Readiness | ComputeLearn",
  description: "Track your readiness for independent engineering work.",
};

export default function ReadinessPage() {
  return (
    <div className="academy-page">
      <header className="academy-page-header">
        <p className="academy-kicker">Readiness</p>
        <h1>Independent Readiness</h1>
        <p className="academy-desc">
          Track your progress toward independent engineering capability
        </p>
      </header>
      <ReadinessWizard />
    </div>
  );
}
