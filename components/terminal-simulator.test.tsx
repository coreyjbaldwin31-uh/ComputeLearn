import { cleanup, render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { afterEach, describe, expect, it } from "vitest";
import { TerminalSimulator } from "./terminal-simulator";

afterEach(cleanup);

describe("TerminalSimulator", () => {
  it("restores draft input after browsing history", async () => {
    render(<TerminalSimulator />);
    const input = screen.getByRole("textbox", {
      name: /terminal command input/i,
    });

    await userEvent.type(input, "pwd{Enter}");
    await userEvent.type(input, "git status{Enter}");
    await userEvent.type(input, "echo still typing");

    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveValue("git status");

    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveValue("pwd");

    await userEvent.keyboard("{ArrowDown}");
    expect(input).toHaveValue("git status");

    await userEvent.keyboard("{ArrowDown}");
    expect(input).toHaveValue("echo still typing");
  });

  it("keeps latest draft when multiple history traversals happen", async () => {
    render(<TerminalSimulator />);
    const input = screen.getByRole("textbox", {
      name: /terminal command input/i,
    });

    await userEvent.type(input, "pwd{Enter}");
    await userEvent.type(input, "first draft");

    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveValue("pwd");

    await userEvent.keyboard("{ArrowDown}");
    expect(input).toHaveValue("first draft");

    await userEvent.clear(input);
    await userEvent.type(input, "second draft");

    await userEvent.keyboard("{ArrowUp}");
    expect(input).toHaveValue("pwd");

    await userEvent.keyboard("{ArrowDown}");
    expect(input).toHaveValue("second draft");
  });
});
