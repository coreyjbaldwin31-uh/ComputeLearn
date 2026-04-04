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
  ps: "Get-Process",
  "get-process": "Get-Process",
  "get-volume": "Get-Volume",
  "copy-item": "Copy-Item",
  cp: "Copy-Item",
  "move-item": "Move-Item",
  mv: "Move-Item",
  "remove-item": "Remove-Item",
  rm: "Remove-Item",
  del: "Remove-Item",
  "rename-item": "Rename-Item",
  ren: "Rename-Item",
  sls: "Select-String",
  "select-string": "Select-String",
  "sort-object": "Sort-Object",
  "where-object": "Where-Object",
  where: "Where-Object",
  "select-object": "Select-Object",
  select: "Select-Object",
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
  const variablesRef = useRef<Record<string, string>>({});

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
              ps: "ps / Get-Process\n  Show running processes with resource usage.\n  Example: ps",
              "get-process":
                "Get-Process\n  PowerShell cmdlet to list running processes.\n  Alias: ps\n  Example: Get-Process",
              "get-volume":
                "Get-Volume\n  Show disk volume info: drive letter, filesystem type, health, size.\n  Example: Get-Volume",
              "copy-item":
                "Copy-Item <source> <destination> [-WhatIf]\n  Copy a file or folder to a new location.\n  Use -WhatIf to preview without copying.\n  Example: Copy-Item file.txt backup.txt",
              cp: "cp / Copy-Item <source> <destination>\n  Copy a file or folder. Alias for Copy-Item.\n  Example: cp file.txt backup.txt",
              "move-item":
                "Move-Item <source> <destination> [-WhatIf]\n  Move or rename a file or folder.\n  Use -WhatIf to preview without moving.\n  Example: Move-Item old.txt new-folder\\",
              "remove-item":
                "Remove-Item <path> [-WhatIf]\n  Delete a file or folder.\n  Use -WhatIf to preview without deleting.\n  Example: Remove-Item temp.txt",
              rm: "rm / Remove-Item <path>\n  Delete a file or folder. Alias for Remove-Item.\n  Example: rm temp.txt",
              del: "del / Remove-Item <path>\n  Delete a file or folder. Alias for Remove-Item.\n  Example: del temp.txt",
              "rename-item":
                "Rename-Item <path> <newName> [-WhatIf]\n  Rename a file or folder.\n  Use -WhatIf to preview without renaming.\n  Example: Rename-Item old.txt new.txt",
              ren: "ren / Rename-Item <path> <newName>\n  Rename a file or folder. Alias for Rename-Item.\n  Example: ren old.txt new.txt",
              sls: "sls / Select-String <pattern> [path]\n  Search for text patterns in files.\n  Example: sls \"error\" log.txt",
              "select-string":
                "Select-String <pattern> [path]\n  PowerShell cmdlet to search text in files.\n  Alias: sls\n  Example: Select-String \"TODO\" .\\src\\*.js",
              "sort-object":
                "Sort-Object [-Property <name>] [-Descending]\n  Sort pipeline input by a property.\n  Example: Get-Process | Sort-Object CPU",
              "where-object":
                "Where-Object { <condition> }\n  Filter pipeline input by a condition.\n  Alias: where\n  Example: Get-Process | Where-Object { $_.CPU -gt 10 }",
              "select-object":
                "Select-Object [-Property <names>] [-First <n>]\n  Choose specific properties or limit results.\n  Alias: select\n  Example: Get-Process | Select-Object Name, CPU",
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
              "  copy-item / cp        Copy a file or folder",
              "  move-item / mv        Move a file or folder",
              "  remove-item / rm      Delete a file or folder",
              "  rename-item / ren     Rename a file or folder",
              "",
              "┌─ Search & Pipeline ────────────────────────────┐",
              "  select-string / sls   Search text in files",
              "  sort-object           Sort pipeline input",
              "  where-object / where  Filter pipeline input",
              "  select-object / select  Select properties",
              "",
              "┌─ System ───────────────────────────────────────┐",
              "  whoami                Show current user",
              "  hostname              Show machine name",
              "  date / Get-Date       Show current date",
              "  get-process / ps      Show running processes",
              "  get-volume            Show disk volumes",
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

        case "get-process":
        case "ps": {
          const procTable = [
            "",
            "Handles  NPM(K)    PM(K)      WS(K)   CPU(s)     Id  ProcessName",
            "-------  ------    -----      -----   ------     --  -----------",
            "    542      23    58204      72108   312.45   4892  chrome",
            "    387      19    42156      51240   108.33   6720  Code",
            "    198      12    31048      38456    72.17  10384  node",
            "    312      15    18920      26340    45.89   3156  WindowsTerminal",
            "    624       8     8412      14280    22.56   1044  explorer",
            "    156       6     4820       8640    11.23   8512  powershell",
            "   1842      10     3208       6120     8.41    784  svchost",
            "    248       4     1024       4096     0.00      4  System",
            "",
          ];
          addEntry("output", procTable.join("\n"));
          return;
        }

        case "get-volume": {
          const volTable = [
            "",
            "DriveLetter  FileSystemType  HealthStatus  SizeRemaining      Size",
            "-----------  --------------  ------------  -------------      ----",
            "C            NTFS            Healthy         50.12 GB    256.00 GB",
            "D            NTFS            Healthy        120.45 GB    500.00 GB",
            "",
          ];
          addEntry("output", volTable.join("\n"));
          return;
        }

        case "copy-item":
        case "cp": {
          const whatIf = args.some((a) => a.toLowerCase() === "-whatif");
          const cleanArgs = args.filter((a) => a.toLowerCase() !== "-whatif");
          if (cleanArgs.length < 2) {
            addEntry("error", "Copy-Item: You must specify a source and destination.");
            return;
          }
          if (whatIf) {
            addEntry("output", `What if: Performing the operation "Copy File" on target "Item: ${cleanArgs[0]} Destination: ${cleanArgs[1]}".`);
          } else {
            addEntry("output", `[Simulated] Copied ${cleanArgs[0]} to ${cleanArgs[1]}`);
          }
          return;
        }

        case "move-item":
        case "mv": {
          const whatIf = args.some((a) => a.toLowerCase() === "-whatif");
          const cleanArgs = args.filter((a) => a.toLowerCase() !== "-whatif");
          if (cleanArgs.length < 2) {
            addEntry("error", "Move-Item: You must specify a source and destination.");
            return;
          }
          if (whatIf) {
            addEntry("output", `What if: Performing the operation "Move File" on target "Item: ${cleanArgs[0]} Destination: ${cleanArgs[1]}".`);
          } else {
            addEntry("output", `[Simulated] Moved ${cleanArgs[0]} to ${cleanArgs[1]}`);
          }
          return;
        }

        case "remove-item":
        case "rm":
        case "del": {
          const whatIf = args.some((a) => a.toLowerCase() === "-whatif");
          const cleanArgs = args.filter((a) => a.toLowerCase() !== "-whatif");
          if (cleanArgs.length < 1) {
            addEntry("error", "Remove-Item: You must specify a path.");
            return;
          }
          if (whatIf) {
            addEntry("output", `What if: Performing the operation "Remove File" on target "${cleanArgs[0]}".`);
          } else {
            addEntry("output", `[Simulated] Removed ${cleanArgs[0]}`);
          }
          return;
        }

        case "rename-item":
        case "ren": {
          const whatIf = args.some((a) => a.toLowerCase() === "-whatif");
          const cleanArgs = args.filter((a) => a.toLowerCase() !== "-whatif");
          if (cleanArgs.length < 2) {
            addEntry("error", "Rename-Item: You must specify a path and a new name.");
            return;
          }
          if (whatIf) {
            addEntry("output", `What if: Performing the operation "Rename File" on target "Item: ${cleanArgs[0]} NewName: ${cleanArgs[1]}".`);
          } else {
            addEntry("output", `[Simulated] Renamed ${cleanArgs[0]} to ${cleanArgs[1]}`);
          }
          return;
        }

        case "select-string":
        case "sls": {
          if (args.length < 1) {
            addEntry("error", "Select-String: You must specify a pattern.");
            return;
          }
          const pattern = args[0].replace(/^["']|["']$/g, "");
          const file = args[1] || "example.txt";
          addEntry(
            "output",
            [
              "",
              `${file}:3:  Found match for "${pattern}" in this line`,
              `${file}:17: Another occurrence of "${pattern}" appears here`,
              `${file}:42: Final match for "${pattern}" in the file`,
              "",
              "[Simulated] 3 matches found.",
            ].join("\n"),
          );
          return;
        }

        case "sort-object": {
          const prop = args.find((a) => !a.startsWith("-")) || "default";
          const desc = args.some((a) => a.toLowerCase() === "-descending");
          addEntry(
            "output",
            `[Simulated] Sort-Object: Sorting input by ${prop}${desc ? " (descending)" : ""}\n\nIn a pipeline, this would reorder objects by the specified property.\nExample: Get-Process | Sort-Object CPU -Descending`,
          );
          return;
        }

        case "where-object":
        case "where": {
          addEntry(
            "output",
            `[Simulated] Where-Object: Filtering input by condition\n\nIn a pipeline, this would keep only objects matching the condition.\nExample: Get-Process | Where-Object { $_.CPU -gt 10 }`,
          );
          return;
        }

        case "select-object":
        case "select": {
          const props = args.filter((a) => !a.startsWith("-")).join(", ") || "all properties";
          const first = args.find((_, i) => args[i - 1]?.toLowerCase() === "-first");
          let msg = `[Simulated] Select-Object: Selecting ${props}`;
          if (first) msg += ` (first ${first})`;
          msg += `\n\nIn a pipeline, this would pick specific properties from objects.\nExample: Get-Process | Select-Object Name, CPU -First 5`;
          addEntry("output", msg);
          return;
        }

        default: {
          // Variable assignment: $name = "value"
          const assignMatch = trimmed.match(/^\$(\w+)\s*=\s*(.+)$/);
          if (assignMatch) {
            const varName = assignMatch[1];
            const varValue = assignMatch[2].replace(/^["']|["']$/g, "");
            variablesRef.current[varName] = varValue;
            addEntry("output", varValue);
            return;
          }

          // Variable read: $name
          const readMatch = trimmed.match(/^\$(\w+)$/);
          if (readMatch && !lower.startsWith("$env:")) {
            const varName = readMatch[1];
            const value = variablesRef.current[varName];
            if (value !== undefined) {
              addEntry("output", value);
            } else {
              addEntry("output", "");
            }
            return;
          }

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
