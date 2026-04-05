import { AcademyShell } from "@/components/academy-shell";
import { ProgressSyncProvider } from "@/components/progress-sync-provider";

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AcademyShell>
      <ProgressSyncProvider>{children}</ProgressSyncProvider>
    </AcademyShell>
  );
}
