"use client";

import { GlobalSearch } from "@/components/global-search";
import { useKeyboardShortcuts } from "@/components/hooks/use-keyboard-shortcuts";
import { useTheme } from "@/components/hooks/use-theme";
import { KeyboardHelpTrigger } from "@/components/keyboard-help-trigger";
import { KeyboardShortcutsDialog } from "@/components/keyboard-shortcuts-dialog";
import { PlatformNavbar } from "@/components/platform-navbar";
import { SaveToast } from "@/components/save-toast";
import { StorageHealthBanner } from "@/components/storage-health-banner";
import { useStorageHealthContext } from "@/components/storage-health-provider";
import { curriculum } from "@/data/curriculum";
import {
  calculatePercentComplete,
  flattenLessonEntries,
} from "@/lib/progression-engine";
import { usePathname, useRouter } from "next/navigation";
import { useMemo, useState } from "react";

export function AcademyGlobalUX({ children }: { children: React.ReactNode }) {
  const [showSearch, setShowSearch] = useState(false);
  const [showKeyboardHelp, setShowKeyboardHelp] = useState(false);
  const [progress] = useState<Record<string, true>>(() => {
    if (typeof window === "undefined") return {};
    try {
      const raw = localStorage.getItem("computelearn-progress");
      return raw ? JSON.parse(raw) : {};
    } catch {
      return {};
    }
  });
  const { theme, toggle: toggleTheme } = useTheme();
  const { health: storageHealth, actions: storageActions } =
    useStorageHealthContext();
  const pathname = usePathname();
  const router = useRouter();

  const allLessonsFlat = useMemo(() => flattenLessonEntries(curriculum), []);

  const percentComplete = useMemo(
    () => calculatePercentComplete(curriculum, progress),
    [progress],
  );

  useKeyboardShortcuts({
    navigateNext: null,
    navigatePrev: null,
    toggleTheme,
    toggleKeyboardHelp: () => setShowKeyboardHelp((v) => !v),
    closeOverlays: () => {
      setShowKeyboardHelp(false);
      setShowSearch(false);
    },
    openSearch: () => setShowSearch(true),
    goHome: () => router.push("/dashboard"),
    toggleCompletion: null,
    scrollToNotes: null,
    scrollToExercises: null,
  });

  return (
    <>
      <PlatformNavbar
        productTitle="ComputeLearn"
        percentComplete={percentComplete}
        viewMode={pathname.startsWith("/lessons/") ? "lesson" : "home"}
        breadcrumb={null}
        notifications={[]}
        theme={theme}
        onGoHome={() => router.push("/dashboard")}
        onToggleSearch={() => setShowSearch(true)}
        onDismissNotification={() => {}}
        onDismissAllNotifications={() => {}}
        onToggleTheme={toggleTheme}
      />
      <StorageHealthBanner
        mode={storageHealth.mode}
        failureCount={storageHealth.errorCount}
        lastFailureKey={storageHealth.lastFailureKey}
        lastSuccessfulSaveLabel={storageHealth.lastSuccessfulSaveLabel}
        isSaveStale={storageHealth.isSaveStale}
        onOpenRecovery={storageActions.openRecoveryDialog}
        onDismissRecovered={storageActions.dismissRecovered}
      />
      {children}
      {showSearch && (
        <GlobalSearch
          allLessonsFlat={allLessonsFlat}
          progress={progress}
          onNavigateToEntry={(entry) => {
            router.push(`/lessons/${entry.lesson.id}`);
            setShowSearch(false);
          }}
          onClose={() => setShowSearch(false)}
        />
      )}
      <KeyboardHelpTrigger onClick={() => setShowKeyboardHelp(true)} />
      <KeyboardShortcutsDialog
        isOpen={showKeyboardHelp}
        onClose={() => setShowKeyboardHelp(false)}
      />
      <SaveToast
        message={storageHealth.errorFlash ?? storageHealth.systemFlash ?? null}
        variant={storageHealth.errorFlash ? "error" : "success"}
        actionLabel={
          storageHealth.errorFlash
            ? storageHealth.errorCount >= 2
              ? "Recovery options"
              : "Retry save"
            : undefined
        }
        onAction={
          storageHealth.errorFlash
            ? storageHealth.errorCount >= 2
              ? storageActions.openRecoveryDialog
              : storageActions.retryFailedWrite
            : undefined
        }
      />
    </>
  );
}
