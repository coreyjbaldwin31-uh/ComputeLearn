"use client";

type ThemeToggleProps = {
  theme: "light" | "dark";
  onToggle: () => void;
};

export function ThemeToggle({ theme, onToggle }: ThemeToggleProps) {
  return (
    <button
      type="button"
      className="theme-toggle"
      onClick={onToggle}
      aria-label={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
      title={`Switch to ${theme === "dark" ? "light" : "dark"} theme`}
    >
      <span className="theme-icon" aria-hidden="true">
        {theme === "dark" ? "☀️" : "🌙"}
      </span>
      <span className="sr-only">
        {theme === "dark" ? "Light" : "Dark"} mode
      </span>
    </button>
  );
}
