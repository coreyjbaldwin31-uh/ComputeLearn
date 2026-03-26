import { describe, expect, it } from "vitest";
import {
    GENERIC_HINT_TEXT,
    MAX_HINT_LEVEL,
    advanceHintLevel,
    getHintButtonLabel,
    getHintText,
    isHintExhausted,
} from "./hint-engine";

describe("MAX_HINT_LEVEL", () => {
  it("is 2", () => {
    expect(MAX_HINT_LEVEL).toBe(2);
  });
});

describe("advanceHintLevel", () => {
  it("increments from 0 to 1", () => {
    expect(advanceHintLevel(0)).toBe(1);
  });

  it("increments from 1 to 2", () => {
    expect(advanceHintLevel(1)).toBe(2);
  });

  it("caps at MAX_HINT_LEVEL and does not exceed 2", () => {
    expect(advanceHintLevel(2)).toBe(2);
    expect(advanceHintLevel(5)).toBe(2);
  });
});

describe("isHintExhausted", () => {
  it("returns false when below the maximum level", () => {
    expect(isHintExhausted(0)).toBe(false);
    expect(isHintExhausted(1)).toBe(false);
  });

  it("returns true at and above the maximum level", () => {
    expect(isHintExhausted(2)).toBe(true);
    expect(isHintExhausted(3)).toBe(true);
  });
});

describe("getHintButtonLabel", () => {
  it("returns 'Need a hint?' at level 0", () => {
    expect(getHintButtonLabel(0)).toBe("Need a hint?");
  });

  it("returns 'More help' at level 1", () => {
    expect(getHintButtonLabel(1)).toBe("More help");
  });

  it("returns 'Hint shown' at level 2 and above", () => {
    expect(getHintButtonLabel(2)).toBe("Hint shown");
    expect(getHintButtonLabel(3)).toBe("Hint shown");
  });
});

describe("getHintText", () => {
  const exerciseHint = "Look at the package.json scripts section.";

  it("returns null at level 0", () => {
    expect(getHintText(0, exerciseHint)).toBeNull();
  });

  it("returns the generic hint at level 1", () => {
    expect(getHintText(1, exerciseHint)).toBe(GENERIC_HINT_TEXT);
    expect(getHintText(1, exerciseHint)).not.toBe(exerciseHint);
  });

  it("returns the exercise-specific hint at level 2", () => {
    expect(getHintText(2, exerciseHint)).toBe(exerciseHint);
  });

  it("returns the exercise-specific hint for any level above 2", () => {
    expect(getHintText(3, exerciseHint)).toBe(exerciseHint);
  });

  it("returns null for level 0 regardless of the hint text", () => {
    expect(getHintText(0, "any hint")).toBeNull();
  });
});
