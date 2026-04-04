import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { LessonEntryCue } from "./lesson-entry-cue";

afterEach(cleanup);

describe("LessonEntryCue", () => {
  it("renders a status announcement message", () => {
    render(
      <LessonEntryCue
        message="Now studying: Intro lesson"
        onDismiss={vi.fn()}
      />,
    );

    expect(screen.getByRole("status")).toHaveTextContent(
      "Now studying: Intro lesson",
    );
  });

  it("calls dismiss handler", async () => {
    const onDismiss = vi.fn();
    render(
      <LessonEntryCue
        message="Now studying: Intro lesson"
        onDismiss={onDismiss}
      />,
    );

    await userEvent.click(
      screen.getByRole("button", { name: "Dismiss lesson entry cue" }),
    );

    expect(onDismiss).toHaveBeenCalledTimes(1);
  });
});
