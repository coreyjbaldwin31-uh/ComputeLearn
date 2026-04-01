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
