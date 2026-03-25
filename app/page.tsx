import { TrainingPlatform } from "@/components/training-platform";
import { curriculum } from "@/data/curriculum";

export default function Home() {
  return <TrainingPlatform curriculum={curriculum} />;
}
