"use client";

import type { LabInstance, LabTemplate } from "@/lib/lab-engine";
import { TerminalSimulator } from "./terminal-simulator";

type LessonTerminalProps = {
  showTerminal: boolean;
  currentLabTemplate: LabTemplate | null;
  currentLabInstance: LabInstance | null;
  labTerminalFilesystem?: Record<string, string[]>;
  labFileContents?: Record<string, string>;
  onCommandExecuted: (command: string, output: string) => void;
};

export function LessonTerminal({
  showTerminal,
  currentLabTemplate,
  currentLabInstance,
  labTerminalFilesystem,
  labFileContents,
  onCommandExecuted,
}: LessonTerminalProps) {
  if (!showTerminal) return null;

  return (
    <section className="lesson-terminal-section panel" id="section-terminal">
      <div className="section-label">
        <svg
          width="16"
          height="16"
          viewBox="0 0 16 16"
          fill="none"
          aria-hidden="true"
          className="section-label-icon"
        >
          <rect
            x="1"
            y="2"
            width="14"
            height="12"
            rx="2"
            stroke="currentColor"
            strokeWidth="1.3"
            fill="none"
          />
          <path
            d="M4 7l2.5 2L4 11"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
            strokeLinejoin="round"
          />
          <path
            d="M9 11h3"
            stroke="currentColor"
            strokeWidth="1.3"
            strokeLinecap="round"
          />
        </svg>
        Terminal
      </div>
      <h4>Practice terminal</h4>
      <p className="terminal-intro-text">
        Try the commands from this lesson in a safe, simulated environment. Type{" "}
        <code>help</code> for available commands.
      </p>
      <TerminalSimulator
        key={currentLabTemplate?.id ?? "default"}
        filesystem={labTerminalFilesystem ?? {}}
        fileContents={labFileContents ?? {}}
        onCommandExecuted={
          currentLabInstance?.status === "active"
            ? onCommandExecuted
            : undefined
        }
      />
    </section>
  );
}
