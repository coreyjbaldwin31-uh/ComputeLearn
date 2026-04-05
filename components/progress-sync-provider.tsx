"use client";

import { useProgressSync } from "@/components/hooks/use-progress-sync";

export function ProgressSyncProvider({
  children,
}: {
  children: React.ReactNode;
}) {
  useProgressSync();
  return <>{children}</>;
}
