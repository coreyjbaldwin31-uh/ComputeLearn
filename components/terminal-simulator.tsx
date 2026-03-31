"use client";

import { useCallback, useEffect, useRef, useState } from "react";

type CommandHandler = {
  pattern: RegExp;
  response: string | ((match: RegExpMatchArray) => string);
};

type TerminalSimulatorProps = {
  prompt?: string;
  welcomeMessage?: string;
  commands?: CommandHandler[];
  filesystem?: Record<string, string[]>;
  /** Called after each command with the raw input and the output text. */
  onCommandExecuted?: (command: string, output: string) => void;
  /** Map of resolved file paths to content, used by cat/Get-Content. */
  fileContents?: Record<string, string>;
};

/** Map lowercase aliases to their canonical PowerShell command name.
 *  Used to normalise activeCommandRef so onCommandExecuted always fires
 *  with the canonical name that lab-engine validation rules expect.       */
const CANONICAL_COMMANDS: Record<string, string> = {
  pwd: "Get-Location",
  "get-location": "Get-Location",
  ls: "Get-ChildItem",
  dir: "Get-ChildItem",
  "get-childitem": "Get-ChildItem",
  cd: "Set-Location",
  "set-location": "Set-Location",
  cat: "Get-Content",
  "get-content": "Get-Content",
  echo: "Write-Output",
  "write-output": "Write-Output",
  mkdir: "New-Item",
  "new-item": "New-Item",
  date: "Get-Date",
  "get-date": "Get-Date",
};

const defaultFilesystem: Record<string, string[]> = {
  "C:\\Users\\learner": [
    "Desktop",
    "Documents",
    "Downloads",
    "Projects",
    ".gitconfig",
  ],
  "C:\\Users\\learner\\Desktop": ["shortcuts.txt", "notes.md"],
  "C:\\Users\\learner\\Documents": ["resume.docx", "budget.xlsx", "photos"],
  "C:\\Users\\learner\\Downloads": [
    "installer.exe",
    "archive.zip",
    "readme.pdf",
  ],
  "C:\\Users\\learner\\Projects": ["hello-world", "portfolio", "api-practice"],
  "C:\\Users\\learner\\Projects\\hello-world": [
    "index.html",
    "style.css",
    "app.js",
    "package.json",
  ],
  "C:\\Users\\learner\\Projects\\portfolio": [
    "src",
    "public",
    "README.md",
    "package.json",
  ],
  "C:\\Users\\learner\\Projects\\api-practice": [
    "server.js",
    "routes",
    "tests",
    ".env.example",
  ],
};

type HistoryEntry = {
  id: number;
  type: "input" | "output" | "error" | "system";
  text: string;
};

export function TerminalSimulator({
  prompt = "PS C:\\Users\\learner>",
  welcomeMessage = "ComputeLearn Training Terminal — Type commands to practice. Type 'help' for available commands.",
  commands: extraCommands = [],
  filesystem = defaultFilesystem,
  onCommandExecuted,
  fileContents,
}: TerminalSimulatorProps) {
  const [history, setHistory] = useState<HistoryEntry[]>([
    { id: 0, type: "system", text: welcomeMessage },
  ]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("C:\\Users\\learner");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeCommandRef = useRef<string | null>(null);

  const scrollToBottom = useCallback(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
    }
  }, []);

  useEffect(() => {
    scrollToBottom();
  }, [history, scrollToBottom]);

  function addEntry(type: HistoryEntry["type"], text: string) {
    const entry: HistoryEntry = { id: nextId.current++, type, text };
    setHistory((prev) => [...prev, entry]);
    if (
      activeCommandRef.current &&
      (type === "output" || type === "error") &&
      onCommandExecuted
    ) {
      onCommandExecuted(activeCommandRef.current, text);
    }
  }

  function resolvePath(target: string): string {
    if (target === "~") return "C:\\Users\\learner";
    if (target === "..") {
      const parts = cwd.split("\\");
      if (parts.length > 1) return parts.slice(0, -1).join("\\");
      return cwd;
    }
    if (target === ".") return cwd;
    if (target.includes(":")) return target;
    return `${cwd}\\${target}`;
  }

  function processCommand(raw: string) {
    const trimmed = raw.trim();
    if (!trimmed) return;

    const parts = trimmed.split(/\s+/);
    const cmd = parts[0].toLowerCase();
    activeCommandRef.current = CANONICAL_COMMANDS[cmd] ?? trimmed;
    try {
      addEntry("input", `${prompt} ${trimmed}`);
      setCommandHistory((prev) => [...prev, trimmed]);
      setHistoryIndex(-1);

      const lower = trimmed.toLowerCase();
      const args = parts.slice(1);

      // Check extra commands first
      for (const handler of extraCommands) {
        const match = trimmed.match(handler.pattern);
        if (match) {
          const output =
            typeof handler.response === "function"
              ? handler.response(match)
              : handler.response;
          addEntry("output", output);
          return;
        }
      }

      // Built-in commands
      switch (cmd) {
        case "help": {
          addEntry(
            "output",
            [
              "Available commands:",
              "  help                Show this help message",
              "  pwd / Get-Location  Print current directory",
              "  ls / dir / Get-ChildItem  List directory contents",
              "  cd / Set-Location   Change directory",
              "  cat / Get-Content   Show file contents (simulated)",
              "  echo / Write-Output Print text to terminal",
              "  mkdir / New-Item    Create a directory (simulated)",
              "  clear / cls         Clear terminal history",
              "  whoami              Show current user",
              "  hostname            Show machine name",
              "  date / Get-Date     Show current date",
              "  history             Show command history",
              "  tree                Show directory tree",
              "  $env:PATH           Show PATH variable (simulated)",
              "",
              "Try navigating: cd Projects\\hello-world",
            ].join("\n"),
          );
          return;
        }

        case "pwd":
        case "get-location": {
          addEntry("output", `\nPath\n----\n${cwd}\n`);
          return;
        }

        case "ls":
        case "dir":
        case "get-childitem": {
          const target = args[0] ? resolvePath(args[0]) : cwd;
          const contents = filesystem[target];
          if (!contents) {
            addEntry(
              "error",
              `Get-ChildItem: Cannot find path '${target}' because it does not exist.`,
            );
            return;
          }
          const header = `\n    Directory: ${target}\n\nMode          Name\n----          ----`;
          const lines = contents.map((item) => {
            const isDir = !item.includes(".");
            return `${isDir ? "d----" : "-a---"}         ${item}`;
          });
          addEntry("output", `${header}\n${lines.join("\n")}\n`);
          return;
        }

        case "cd":
        case "set-location": {
          if (!args[0]) {
            addEntry("output", cwd);
            return;
          }
          const target = resolvePath(args[0]);
          if (filesystem[target]) {
            setCwd(target);
            return;
          }
          addEntry(
            "error",
            `Set-Location: Cannot find path '${target}' because it does not exist.`,
          );
          return;
        }

        case "cat":
        case "get-content": {
          if (!args[0]) {
            addEntry("error", "Get-Content: You must specify a file path.");
            return;
          }
          const filePath = resolvePath(args[0]).replace(/\//g, "\\");
          if (fileContents && filePath in fileContents) {
            addEntry("output", fileContents[filePath]);
            return;
          }
          addEntry(
            "output",
            `[Simulated content of ${args[0]}]\n\nIn a real environment, this would display the file contents.\nThis training terminal simulates the command flow so you can practice safely.`,
          );
          return;
        }

        case "echo":
        case "write-output": {
          addEntry("output", args.join(" "));
          return;
        }

        case "clear":
        case "cls": {
          setHistory([]);
          return;
        }

        case "whoami": {
          addEntry("output", "learner");
          return;
        }

        case "hostname": {
          addEntry("output", "COMPUTELEARN-PC");
          return;
        }

        case "date":
        case "get-date": {
          addEntry("output", new Date().toString());
          return;
        }

        case "history": {
          const lines = commandHistory.map((c, i) => `  ${i + 1}  ${c}`);
          addEntry(
            "output",
            lines.length > 0 ? lines.join("\n") : "(no history yet)",
          );
          return;
        }

        case "mkdir":
        case "new-item": {
          if (!args[0]) {
            addEntry("error", "New-Item: You must specify a name.");
            return;
          }
          addEntry(
            "output",
            `    Directory: ${cwd}\n\nMode          Name\n----          ----\nd----         ${args[0]}\n\n[Simulated — directory would be created in a real environment]`,
          );
          return;
        }

        case "tree": {
          const contents = filesystem[cwd];
          if (!contents) {
            addEntry("output", `${cwd}\n(empty)`);
            return;
          }
          const lines = [`${cwd}`];
          contents.forEach((item, i) => {
            const prefix = i === contents.length - 1 ? "└── " : "├── ";
            lines.push(`${prefix}${item}`);
            const subPath = `${cwd}\\${item}`;
            if (filesystem[subPath]) {
              const subPrefix = i === contents.length - 1 ? "    " : "│   ";
              filesystem[subPath].forEach((sub, j) => {
                const subItemPrefix =
                  j === filesystem[subPath].length - 1 ? "└── " : "├── ";
                lines.push(`${subPrefix}${subItemPrefix}${sub}`);
              });
            }
          });
          addEntry("output", lines.join("\n"));
          return;
        }

        default: {
          if (lower.startsWith("$env:")) {
            addEntry(
              "output",
              "C:\\Windows\\system32;C:\\Windows;C:\\Users\\learner\\AppData\\Local\\Programs\\node;C:\\Program Files\\Git\\cmd;C:\\Program Files\\Docker\\cli-plugins",
            );
            return;
          }

          if (lower.startsWith("git ")) {
            const gitCmd = parts[1]?.toLowerCase();
            switch (gitCmd) {
              case "status":
                addEntry(
                  "output",
                  "On branch main\nnothing to commit, working tree clean",
                );
                return;
              case "log":
                addEntry(
                  "output",
                  "commit a1b2c3d (HEAD -> main)\nAuthor: learner <learner@computelearn.dev>\nDate:   Today\n\n    Initial commit",
                );
                return;
              case "branch":
                addEntry("output", "* main");
                return;
              case "init":
                addEntry(
                  "output",
                  "Initialized empty Git repository in " + cwd + "\\.git\\",
                );
                return;
              default:
                addEntry(
                  "output",
                  `[Simulated] git ${parts.slice(1).join(" ")}`,
                );
                return;
            }
          }

          if (lower.startsWith("npm ") || lower.startsWith("node ")) {
            addEntry(
              "output",
              `[Simulated] ${trimmed}\n\nThis command would run in a real Node.js environment.\nThe training terminal shows command flow and syntax practice.`,
            );
            return;
          }

          if (lower.startsWith("docker ")) {
            addEntry(
              "output",
              `[Simulated] ${trimmed}\n\nDocker commands run in isolated containers in the full lab environment.`,
            );
            return;
          }

          addEntry(
            "error",
            `'${parts[0]}' is not recognized as a command.\nType 'help' to see available commands.`,
          );
        }
      }
    } finally {
      activeCommandRef.current = null;
    }
  }

  function handleKeyDown(e: React.KeyboardEvent<HTMLInputElement>) {
    if (e.key === "Enter") {
      processCommand(input);
      setInput("");
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      const newIndex =
        historyIndex === -1
          ? commandHistory.length - 1
          : Math.max(0, historyIndex - 1);
      setHistoryIndex(newIndex);
      setInput(commandHistory[newIndex]);
    } else if (e.key === "ArrowDown") {
      e.preventDefault();
      if (historyIndex === -1) return;
      const newIndex = historyIndex + 1;
      if (newIndex >= commandHistory.length) {
        setHistoryIndex(-1);
        setInput("");
      } else {
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  }

  return (
    <div
      className="terminal-sim"
      onClick={() => inputRef.current?.focus()}
      role="application"
      aria-label="Training terminal simulator"
    >
      <div className="terminal-titlebar">
        <div className="terminal-dots">
          <span className="dot dot-red" />
          <span className="dot dot-yellow" />
          <span className="dot dot-green" />
        </div>
        <span className="terminal-title">
          ComputeLearn Terminal — PowerShell
        </span>
        <span className="terminal-badge">SAFE MODE</span>
      </div>
      <div className="terminal-body" ref={scrollRef}>
        {history.map((entry) => (
          <div
            key={entry.id}
            className={`terminal-line terminal-${entry.type}`}
          >
            <pre>{entry.text}</pre>
          </div>
        ))}
        <div className="terminal-input-line">
          <span className="terminal-prompt">{prompt}</span>
          <input
            ref={inputRef}
            className="terminal-input"
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            spellCheck={false}
            autoComplete="off"
            aria-label="Terminal command input"
          />
        </div>
      </div>
    </div>
  );
}
