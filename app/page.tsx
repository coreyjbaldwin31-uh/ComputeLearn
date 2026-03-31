import { ErrorBoundary } from "@/components/error-boundary";
import { TrainingPlatform } from "@/components/training-platform";
import { curriculum } from "@/data/curriculum";

export default function Home() {
  return (
    <ErrorBoundary>
      <TrainingPlatform curriculum={curriculum} />
    </ErrorBoundary>
  );
}
