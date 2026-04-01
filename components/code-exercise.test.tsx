import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it, vi } from "vitest";
import { CodeExercise } from "./code-exercise";

afterEach(cleanup);

describe("CodeExercise", () => {
  const base = {
    title: "Sum function",
    description: "Write a function that adds two numbers",
    starterCode: "function add(a, b) {\n  // your code\n}",
    language: "javascript",
  };

  it("renders title, description, and language badge", () => {
    render(<CodeExercise {...base} />);
    expect(screen.getByText("Sum function")).toBeInTheDocument();
    expect(
      screen.getByText("Write a function that adds two numbers"),
    ).toBeInTheDocument();
    expect(screen.getByText("javascript")).toBeInTheDocument();
  });

  it("shows starter code in the editor", () => {
    render(<CodeExercise {...base} />);
    const textarea = screen.getByRole("textbox", {
      name: /code editor: sum function/i,
    });
    expect(textarea).toHaveValue(base.starterCode);
  });

  it("shows validation feedback on Run check", async () => {
    const validateFn = vi.fn().mockReturnValue({
      passed: true,
      message: "Looks good!",
    });
    render(<CodeExercise {...base} validateFn={validateFn} />);

    await userEvent.click(screen.getByRole("button", { name: "Run check" }));

    expect(validateFn).toHaveBeenCalledWith(base.starterCode);
    expect(screen.getByText(/Looks good!/)).toBeInTheDocument();
  });

  it("shows failure feedback from validator", async () => {
    const validateFn = vi.fn().mockReturnValue({
      passed: false,
      message: "Missing return statement",
    });
    render(<CodeExercise {...base} validateFn={validateFn} />);

    await userEvent.click(screen.getByRole("button", { name: "Run check" }));

    expect(screen.getByText(/Missing return statement/)).toBeInTheDocument();
  });

  it("calls onAttempt with code and result", async () => {
    const onAttempt = vi.fn();
    const validateFn = vi
      .fn()
      .mockReturnValue({ passed: true, message: "OK" });
    render(
      <CodeExercise
        {...base}
        validateFn={validateFn}
        onAttempt={onAttempt}
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Run check" }));

    expect(onAttempt).toHaveBeenCalledWith(base.starterCode, true);
  });

  it("resets code to starter on Reset", async () => {
    render(<CodeExercise {...base} />);
    const textarea = screen.getByRole("textbox", {
      name: /code editor/i,
    });

    await userEvent.clear(textarea);
    await userEvent.type(textarea, "new code");
    expect(textarea).not.toHaveValue(base.starterCode);

    await userEvent.click(
      screen.getByRole("button", { name: "Reset code" }),
    );
    expect(textarea).toHaveValue(base.starterCode);
  });

  it("toggles hint visibility", async () => {
    render(<CodeExercise {...base} hint="Try using return a + b" />);

    expect(screen.queryByText("Try using return a + b")).not.toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Show hint" }),
    );
    expect(screen.getByText("Try using return a + b")).toBeInTheDocument();

    await userEvent.click(
      screen.getByRole("button", { name: "Hide hint" }),
    );
    expect(screen.queryByText("Try using return a + b")).not.toBeInTheDocument();
  });

  it("does not show hint button when no hint provided", () => {
    render(<CodeExercise {...base} />);
    expect(screen.queryByRole("button", { name: /hint/i })).not.toBeInTheDocument();
  });

  it("shows expected output when provided", () => {
    render(<CodeExercise {...base} expectedOutput="42" />);
    expect(screen.getByText("42")).toBeInTheDocument();
    expect(screen.getByText("Expected:")).toBeInTheDocument();
  });

  it("renders line numbers", () => {
    render(<CodeExercise {...base} />);
    expect(screen.getByText("1")).toBeInTheDocument();
    expect(screen.getByText("3")).toBeInTheDocument();
  });

  it("uses default validator when no validateFn provided", async () => {
    render(
      <CodeExercise
        {...base}
        starterCode=""
      />,
    );

    await userEvent.click(screen.getByRole("button", { name: "Run check" }));
    expect(screen.getByText(/Write some code first/)).toBeInTheDocument();
  });

  it("copies code to clipboard", async () => {
    const writeText = vi.fn().mockResolvedValue(undefined);
    Object.assign(navigator, {
      clipboard: { writeText },
    });

    render(<CodeExercise {...base} />);
    await userEvent.click(
      screen.getByRole("button", { name: "Copy code" }),
    );

    expect(writeText).toHaveBeenCalledWith(base.starterCode);
  });
});
