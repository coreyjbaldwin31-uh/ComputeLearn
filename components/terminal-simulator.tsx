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
  welcomeMessage,
  commands: extraCommands = [],
  filesystem = defaultFilesystem,
  onCommandExecuted,
  fileContents,
}: TerminalSimulatorProps) {
  const defaultWelcome = [
    "╔══════════════════════════════════════════════════╗",
    "║        ComputeLearn Training Terminal            ║",
    "║  Safe sandbox — nothing modifies your system.    ║",
    "╚══════════════════════════════════════════════════╝",
    "",
    "  Type  help           list all commands",
    "  Type  help <command>  learn about a specific command",
    "",
  ].join("\n");

  const [history, setHistory] = useState<HistoryEntry[]>([
    { id: 0, type: "system", text: welcomeMessage ?? defaultWelcome },
  ]);
  const [input, setInput] = useState("");
  const [cwd, setCwd] = useState("C:\\Users\\learner");
  const [commandHistory, setCommandHistory] = useState<string[]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const nextId = useRef(1);
  const scrollRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const activeCommandRef = useRef<string | null>(null);
  const draftInputRef = useRef("");

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
          if (args[0]) {
            const topic = args[0].toLowerCase();
            const helpTopics: Record<string, string> = {
              pwd: "pwd / Get-Location\n  Print the full path of the current working directory.\n  Example: pwd",
              "get-location":
                "Get-Location\n  PowerShell cmdlet that returns the current directory.\n  Alias: pwd",
              ls: "ls / dir / Get-ChildItem [path]\n  List files and folders in the current or given directory.\n  -a--- = file, d---- = directory\n  Example: ls Projects",
              dir: "dir / ls / Get-ChildItem [path]\n  List directory contents. Same as ls.\n  Example: dir Downloads",
              "get-childitem":
                "Get-ChildItem [path]\n  PowerShell cmdlet to list directory contents.\n  Aliases: ls, dir",
              cd: "cd / Set-Location <path>\n  Change the working directory.\n  Use .. to go up, ~ to go home.\n  Example: cd Projects\\hello-world",
              "set-location":
                "Set-Location <path>\n  PowerShell cmdlet to change directory.\n  Alias: cd",
              cat: "cat / Get-Content <file>\n  Display the contents of a file.\n  Example: cat README.md",
              "get-content":
                "Get-Content <file>\n  PowerShell cmdlet to read file contents.\n  Alias: cat",
              echo: "echo / Write-Output <text>\n  Print text to the terminal.\n  Example: echo Hello world",
              "write-output":
                "Write-Output <text>\n  PowerShell cmdlet to output text.\n  Alias: echo",
              mkdir:
                "mkdir / New-Item <name>\n  Create a new directory.\n  Example: mkdir my-project",
              "new-item":
                "New-Item <name>\n  PowerShell cmdlet to create a directory.\n  Alias: mkdir",
              clear:
                "clear / cls\n  Clear all terminal history.\n  Keyboard shortcut: Ctrl+L",
              cls: "cls / clear\n  Clear the terminal screen.\n  Keyboard shortcut: Ctrl+L",
              whoami: "whoami\n  Display the current logged-in user name.",
              hostname: "hostname\n  Display the name of the machine.",
              date: "date / Get-Date\n  Show the current date and time.",
              "get-date":
                "Get-Date\n  PowerShell cmdlet to get the current date.\n  Alias: date",
              history:
                "history\n  Show all commands typed this session.\n  Tip: Use Arrow Up/Down to cycle through previous commands.",
              tree: "tree\n  Show a visual tree of the current directory and one level of subdirectories.",
              git: "git <subcommand>\n  Simulated Git commands: status, log, branch, init.\n  Example: git status",
            };
            const detail = helpTopics[topic];
            if (detail) {
              addEntry("output", detail);
            } else {
              addEntry(
                "error",
                `No help topic for '${args[0]}'.\nType 'help' to see all available commands.`,
              );
            }
            return;
          }
          addEntry(
            "output",
            [
              "┌─ Navigation ──────────────────────────────────┐",
              "  pwd / Get-Location    Print current directory",
              "  ls / Get-ChildItem    List directory contents",
              "  cd / Set-Location     Change directory",
              "  tree                  Show directory tree",
              "",
              "┌─ Files ────────────────────────────────────────┐",
              "  cat / Get-Content     Show file contents",
              "  echo / Write-Output   Print text to terminal",
              "  mkdir / New-Item      Create a directory",
              "",
              "┌─ System ───────────────────────────────────────┐",
              "  whoami                Show current user",
              "  hostname              Show machine name",
              "  date / Get-Date       Show current date",
              "  history               Show command history",
              "  clear / cls           Clear terminal  (Ctrl+L)",
              "  $env:PATH             Show PATH variable",
              "",
              "┌─ Developer Tools ──────────────────────────────┐",
              "  git <cmd>             Git (status, log, branch, init)",
              "  npm / node            Node.js commands (simulated)",
              "  docker                Docker commands (simulated)",
              "",
              "  Type  help <command>  for detailed usage.",
              "  Try:  cd Projects\\hello-world",
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
      draftInputRef.current = "";
    } else if (e.key === "ArrowUp") {
      e.preventDefault();
      if (commandHistory.length === 0) return;
      if (historyIndex === -1) {
        draftInputRef.current = input;
      }
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
        setInput(draftInputRef.current);
      } else {
        setHistoryIndex(newIndex);
        setInput(commandHistory[newIndex]);
      }
    } else if (e.key === "l" && e.ctrlKey) {
      e.preventDefault();
      setHistory([]);
    }
  }

  const [copyLabel, setCopyLabel] = useState("Copy");

  function handleCopyOutput() {
    const outputText = history
      .filter((e) => e.type === "output" || e.type === "error")
      .map((e) => e.text)
      .join("\n");
    navigator.clipboard.writeText(outputText).then(() => {
      setCopyLabel("Copied!");
      setTimeout(() => setCopyLabel("Copy"), 1500);
    });
  }

  return (
    <div
      className="terminal-sim"
      onClick={() => inputRef.current?.focus()}
      role="region"
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
        <div className="terminal-toolbar">
          <button
            type="button"
            className={`terminal-copy-btn ${copyLabel === "Copied!" ? "copied" : ""}`}
            onClick={(e) => {
              e.stopPropagation();
              handleCopyOutput();
            }}
            aria-label="Copy terminal output"
          >
            {copyLabel}
          </button>
          <span className="terminal-badge-wrapper">
            <span className="terminal-badge">SAFE MODE</span>
            <span className="terminal-badge-tooltip">
              All commands are simulated — nothing modifies your real system
            </span>
          </span>
        </div>
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
        <div className="sr-only" aria-live="polite" aria-atomic="false">
          {history.length > 0 ? history[history.length - 1].text : ""}
        </div>
      </div>
    </div>
  );
}
