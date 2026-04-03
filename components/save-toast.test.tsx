import { cleanup, render, screen } from "@testing-library/react";
import { afterEach, describe, expect, it } from "vitest";
import { SaveToast } from "./save-toast";

afterEach(cleanup);

describe("SaveToast", () => {
  it("renders success state by default", () => {
    render(<SaveToast message="Note saved" />);

    const toast = screen.getByRole("status");
    expect(toast).toHaveClass("save-toast");
    expect(toast).not.toHaveClass("save-toast--error");
    expect(toast).toHaveTextContent("Note saved");
  });

  it("renders error state with alert semantics", () => {
    render(<SaveToast message="Storage unavailable" variant="error" />);

    const toast = screen.getByRole("alert");
    expect(toast).toHaveClass("save-toast");
    expect(toast).toHaveClass("save-toast--error");
    expect(toast).toHaveTextContent("Storage unavailable");
  });

  it("renders nothing when message is null", () => {
    const { container } = render(<SaveToast message={null} />);
    expect(container).toBeEmptyDOMElement();
  });
});
