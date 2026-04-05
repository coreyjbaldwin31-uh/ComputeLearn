import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";

/* ---- mock next/navigation ---- */
const mockPush = vi.fn();
vi.mock("next/navigation", () => ({
  usePathname: () => "/dashboard",
  useRouter: () => ({ push: mockPush }),
}));

/* ---- mock StorageHealthProvider context ---- */
vi.mock("./storage-health-provider", () => ({
  useStorageHealthContext: () => ({
    health: {
      mode: "stable" as const,
      errorFlash: null,
      systemFlash: null,
      errorCount: 0,
      lastFailureKey: null,
      lastSuccessfulSaveLabel: null,
      isSaveStale: false,
      noteDirty: false,
      reflectionDirty: false,
      profileDirty: false,
      surfaceFailures: {},
      recoveryLog: [],
      showRecoveryDialog: false,
    },
    actions: {
      markNoteDirty: vi.fn(),
      markReflectionDirty: vi.fn(),
      markProfileDirty: vi.fn(),
      retryFailedWrite: vi.fn(),
      exportRecoveryBackup: vi.fn(),
      resetAfterFailure: vi.fn(),
      openRecoveryDialog: vi.fn(),
      closeRecoveryDialog: vi.fn(),
      dismissRecovered: vi.fn(),
    },
  }),
}));

/* ---- mock data/curriculum ---- */
vi.mock("@/data/curriculum", () => ({
  curriculum: { phases: [] },
}));

/* ---- mock progression-engine ---- */
vi.mock("@/lib/progression-engine", () => ({
  flattenLessonEntries: () => [],
  calculatePercentComplete: () => 0,
}));

/* ---- mock hooks ---- */
vi.mock("./hooks/use-theme", () => ({
  useTheme: () => ({ theme: "light", toggle: vi.fn() }),
}));

vi.mock("./hooks/use-keyboard-shortcuts", () => ({
  useKeyboardShortcuts: vi.fn(),
}));

/* ---- stub heavy children to keep tests focused ---- */
vi.mock("./global-search", () => ({
  GlobalSearch: ({ onClose }: { onClose: () => void }) => (
    <div data-testid="global-search">
      <button onClick={onClose}>Close search</button>
    </div>
  ),
}));
vi.mock("./keyboard-shortcuts-dialog", () => ({
  KeyboardShortcutsDialog: () => null,
}));
vi.mock("./storage-health-banner", () => ({
  StorageHealthBanner: () => null,
}));
vi.mock("./save-toast", () => ({
  SaveToast: () => null,
}));

import { AcademyGlobalUX } from "./academy-global-ux";

afterEach(() => {
  cleanup();
  mockPush.mockReset();
});

describe("AcademyGlobalUX", () => {
  it("renders PlatformNavbar with product title", () => {
    render(
      <AcademyGlobalUX>
        <p>page content</p>
      </AcademyGlobalUX>,
    );

    expect(screen.getByText("ComputeLearn")).toBeInTheDocument();
    expect(screen.getByText("page content")).toBeInTheDocument();
  });

  it("renders keyboard help trigger button", () => {
    render(
      <AcademyGlobalUX>
        <div />
      </AcademyGlobalUX>,
    );

    expect(
      screen.getByRole("button", { name: "Keyboard shortcuts" }),
    ).toBeInTheDocument();
  });

  it("opens GlobalSearch when search toggle is clicked", async () => {
    render(
      <AcademyGlobalUX>
        <div />
      </AcademyGlobalUX>,
    );

    // The navbar renders a search button
    const searchBtn = screen.getByRole("button", { name: /search/i });
    await userEvent.click(searchBtn);

    expect(screen.getByTestId("global-search")).toBeInTheDocument();
  });
});
