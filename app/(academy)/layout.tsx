import { AcademyShell } from "@/components/academy-shell";
import { ProgressSyncProvider } from "@/components/progress-sync-provider";
import { StorageHealthProvider } from "@/components/storage-health-provider";

export default function AcademyLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <AcademyShell>
      <ProgressSyncProvider>
        <StorageHealthProvider>{children}</StorageHealthProvider>
      </ProgressSyncProvider>
    </AcademyShell>
  );
}
