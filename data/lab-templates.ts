/**
 * Phase 1 lab templates — authored labs for the 9 foundational lessons.
 *
 * 10 templates total: one per lesson, plus a second for lesson-powershell-scripting
 * that maps to the PRD exit standard "organize downloads by extension."
 */

import type { LabTemplate } from "@/lib/lab-engine";

// ---------------------------------------------------------------------------
// Extended type — adds lessonId so we can map labs back to lessons
// ---------------------------------------------------------------------------

export type Phase1LabTemplate = LabTemplate & { lessonId: string };

// ---------------------------------------------------------------------------
// Lab templates
// ---------------------------------------------------------------------------

export const phase1LabTemplates: Phase1LabTemplate[] = [
  // -----------------------------------------------------------------------
  // 1. Filesystem Navigation
  // -----------------------------------------------------------------------
  {
    id: "lab-filesystem-nav",
    lessonId: "lesson-filesystem",
    title: "Navigate a Project Tree",
    description:
      "Practice navigating a multi-level project directory. Print your working directory, list contents, and change into nested folders to locate a hidden config file.",
    difficulty: 1,
    scaffoldingLevel: "step-by-step",
    maxResets: 3,
    initialFiles: [
      {
        path: "project/README.md",
        content: "# My App\n\nA small demo project for filesystem practice.\n",
      },
      {
        path: "project/src/index.ts",
        content:
          "export function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n",
      },
      {
        path: "project/src/utils/helpers.ts",
        content:
          "export const clamp = (n: number, lo: number, hi: number) =>\n  Math.min(hi, Math.max(lo, n));\n",
      },
      {
        path: "project/.config/settings.json",
        content: '{\n  "theme": "dark",\n  "fontSize": 14\n}\n',
      },
    ],
    rules: [
      {
        kind: "command-output",
        command: "Get-Location",
        expectedOutput: "project",
        isRegex: false,
      },
      {
        kind: "directory-structure",
        paths: ["project/src", "project/src/utils", "project/.config"],
        shouldExist: true,
      },
      {
        kind: "file-presence",
        path: "project/.config/settings.json",
        shouldExist: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Use a command to print the current directory path.",
        },
        { level: 1, text: "Run `Get-Location` or `pwd` to see where you are." },
      ],
      1: [
        { level: 0, text: "List everything, including hidden items." },
        {
          level: 1,
          text: "Use `Get-ChildItem -Force` to reveal dotfiles and dotfolders.",
        },
      ],
      2: [
        { level: 0, text: "Look for a folder whose name starts with a dot." },
        { level: 1, text: "The file is at `project/.config/settings.json`." },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 2. Keyboard Shortcuts
  // -----------------------------------------------------------------------
  {
    id: "lab-keyboard-shortcuts",
    lessonId: "lesson-keyboard-shortcuts",
    title: "Keyboard-First File Workflow",
    description:
      "Open, edit, save, and switch between files using only keyboard shortcuts. Record the shortcuts you used in a log file.",
    difficulty: 1,
    scaffoldingLevel: "step-by-step",
    maxResets: 3,
    initialFiles: [
      {
        path: "workspace/notes.md",
        content:
          "# Keyboard Practice\n\nRecord the shortcuts you discover below.\n",
      },
      {
        path: "workspace/app.ts",
        content: "const version = 1;\nconsole.log(`App v${version}`);\n",
      },
      {
        path: "workspace/shortcut-log.md",
        content:
          "# Shortcut Log\n\n| Action | Shortcut |\n|--------|----------|\n",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "workspace/shortcut-log.md",
        pattern: "Ctrl|Alt|Shift",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "workspace/shortcut-log.md",
        pattern: "\\|.+\\|.+\\|",
        isRegex: true,
      },
      {
        kind: "file-presence",
        path: "workspace/shortcut-log.md",
        shouldExist: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Think about the modifier keys you press with letter keys.",
        },
        {
          level: 1,
          text: "Add entries like `| Open file | Ctrl+O |` to the log.",
        },
      ],
      1: [
        { level: 0, text: "Each row in the table needs pipes on both sides." },
        { level: 1, text: "Format: `| Save file | Ctrl+S |`" },
      ],
      2: [
        { level: 0, text: "Make sure you haven't deleted the log file." },
        {
          level: 1,
          text: "The file must still exist at `workspace/shortcut-log.md`.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 3. System Inspection
  // -----------------------------------------------------------------------
  {
    id: "lab-system-inspection",
    lessonId: "lesson-system-inspection",
    title: "System Health Snapshot",
    description:
      "Gather system information — OS version, running processes, disk usage, and memory — and write a short health report.",
    difficulty: 1,
    scaffoldingLevel: "step-by-step",
    maxResets: 3,
    initialFiles: [
      {
        path: "reports/health-report.md",
        content:
          "# System Health Report\n\n## OS\n\n## Processes\n\n## Disk\n\n## Memory\n",
      },
      {
        path: "reports/example-report.md",
        content:
          "# Example Report\n\n## OS\nWindows 11 Pro 23H2\n\n## Processes\n142 running\n\n## Disk\nC: 58 % used\n\n## Memory\n12.4 GB / 16 GB\n",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "reports/health-report.md",
        pattern: "## OS",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "reports/health-report.md",
        pattern: "\\d+.*GB|\\d+.*MB",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "reports/health-report.md",
        pattern: "## Disk",
        isRegex: false,
      },
      {
        kind: "file-presence",
        path: "reports/health-report.md",
        shouldExist: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Fill in the OS section with your operating system name and version.",
        },
        {
          level: 1,
          text: "Run `[System.Environment]::OSVersion` or `Get-ComputerInfo | Select-Object OsName` to find the OS.",
        },
      ],
      1: [
        { level: 0, text: "Include a number with a unit like GB or MB." },
        {
          level: 1,
          text: "Use `Get-CimInstance Win32_PhysicalMemory` or `systeminfo` to find memory values.",
        },
      ],
      2: [
        {
          level: 0,
          text: "Make sure the Disk section has data below its heading.",
        },
        {
          level: 1,
          text: "Run `Get-PSDrive C | Select-Object Used, Free` and note the values.",
        },
      ],
      3: [
        { level: 0, text: "Don't delete the report file!" },
        {
          level: 1,
          text: "The file must remain at `reports/health-report.md`.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 4. File Operations — safe delete
  // -----------------------------------------------------------------------
  {
    id: "lab-file-ops-safe-delete",
    lessonId: "lesson-file-operations",
    title: "Safe File Operations",
    description:
      "Practice creating, moving, copying, renaming, and safely deleting files in a sandbox. A backup directory should hold copies before deletion.",
    difficulty: 1,
    scaffoldingLevel: "step-by-step",
    maxResets: 3,
    initialFiles: [
      {
        path: "sandbox/draft-report.txt",
        content: "Q1 revenue summary — DRAFT. Do not distribute.\n",
      },
      {
        path: "sandbox/image-temp.png",
        content: "(binary placeholder)\n",
      },
      {
        path: "sandbox/keep-this.md",
        content: "# Important Notes\n\nThis file must not be deleted.\n",
      },
      {
        path: "sandbox/old-log.log",
        content: "[2025-12-01] startup complete\n[2025-12-01] shutdown\n",
      },
    ],
    rules: [
      {
        kind: "directory-structure",
        paths: ["sandbox/backup"],
        shouldExist: true,
      },
      {
        kind: "file-presence",
        path: "sandbox/backup/draft-report.txt",
        shouldExist: true,
      },
      {
        kind: "file-presence",
        path: "sandbox/draft-report.txt",
        shouldExist: false,
      },
      {
        kind: "file-presence",
        path: "sandbox/keep-this.md",
        shouldExist: true,
      },
    ],
    hints: {
      0: [
        { level: 0, text: "Create the backup directory first." },
        {
          level: 1,
          text: "Run `New-Item -ItemType Directory -Path sandbox/backup`.",
        },
      ],
      1: [
        { level: 0, text: "Copy the draft into backup before removing it." },
        {
          level: 1,
          text: "Use `Copy-Item sandbox/draft-report.txt sandbox/backup/`.",
        },
      ],
      2: [
        { level: 0, text: "Remove the original draft from the sandbox root." },
        { level: 1, text: "Run `Remove-Item sandbox/draft-report.txt`." },
      ],
      3: [
        { level: 0, text: "Be careful not to remove files that should stay." },
        { level: 1, text: "`keep-this.md` must remain in sandbox/." },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 5. Search Files — recover a misplaced file (PRD exit standard)
  // -----------------------------------------------------------------------
  {
    id: "lab-search-recover",
    lessonId: "lesson-search-files",
    title: "Recover a Misplaced File",
    description:
      "A configuration file was accidentally moved to the wrong folder. Use search and path reasoning to locate it and move it back to its correct location.",
    difficulty: 2,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "project/src/app.ts",
        content:
          'import { loadConfig } from "./config";\n\nconst cfg = loadConfig();\nconsole.log(cfg.appName);\n',
      },
      {
        path: "project/src/config.ts",
        content:
          'import fs from "fs";\nexport function loadConfig() {\n  return JSON.parse(fs.readFileSync("project/config/app.json", "utf-8"));\n}\n',
      },
      {
        path: "project/docs/archive/2024/app.json",
        content:
          '{\n  "appName": "ComputeLearn",\n  "version": "0.1.0",\n  "debug": false\n}\n',
      },
      {
        path: "project/config/.gitkeep",
        content: "",
      },
    ],
    rules: [
      {
        kind: "file-presence",
        path: "project/config/app.json",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "project/config/app.json",
        pattern: "ComputeLearn",
        isRegex: false,
      },
      {
        kind: "file-presence",
        path: "project/docs/archive/2024/app.json",
        shouldExist: false,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Search for the filename across the entire project tree.",
        },
        {
          level: 1,
          text: "Run `Get-ChildItem -Recurse -Filter app.json` to find all matches.",
        },
      ],
      1: [
        {
          level: 0,
          text: "Look at what config.ts expects — it reads from a specific path.",
        },
        {
          level: 1,
          text: "The file content must include `ComputeLearn` as the appName.",
        },
      ],
      2: [
        { level: 0, text: "The old copy should no longer be in the archive." },
        {
          level: 1,
          text: "Use `Move-Item` instead of `Copy-Item` so the original is removed.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 6. Terminal Automation
  // -----------------------------------------------------------------------
  {
    id: "lab-terminal-automation",
    lessonId: "lesson-terminal-automation",
    title: "Automate a Cleanup Task",
    description:
      "Write a short script that removes all `.tmp` files from a workspace and logs the count to a summary file.",
    difficulty: 2,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "workspace/data.csv",
        content: "id,name,score\n1,Alice,88\n2,Bob,72\n",
      },
      {
        path: "workspace/cache1.tmp",
        content: "temporary data 1\n",
      },
      {
        path: "workspace/cache2.tmp",
        content: "temporary data 2\n",
      },
      {
        path: "workspace/notes.md",
        content: "# Notes\n\nKeep this file.\n",
      },
      {
        path: "workspace/build.tmp",
        content: "stale build artifact\n",
      },
    ],
    rules: [
      {
        kind: "file-presence",
        path: "workspace/cleanup.ps1",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "workspace/cleanup.ps1",
        pattern: "Remove-Item|del |rm ",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "workspace/cleanup.ps1",
        pattern: "\\.tmp",
        isRegex: true,
      },
      {
        kind: "file-presence",
        path: "workspace/data.csv",
        shouldExist: true,
      },
    ],
    hints: {
      0: [
        { level: 0, text: "Create a new `.ps1` file in the workspace folder." },
        {
          level: 1,
          text: "Create `workspace/cleanup.ps1` with your cleanup logic.",
        },
      ],
      1: [
        {
          level: 0,
          text: "Your script should use a command that removes files.",
        },
        {
          level: 1,
          text: "Use `Remove-Item` to delete files matching a pattern.",
        },
      ],
      2: [
        { level: 0, text: "Target only files ending in `.tmp`." },
        {
          level: 1,
          text: "Use a wildcard like `*.tmp` in your Remove-Item call.",
        },
      ],
      3: [
        { level: 0, text: "Make sure you don't delete important files." },
        { level: 1, text: "`data.csv` and `notes.md` must remain untouched." },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 7. Piping & Filtering
  // -----------------------------------------------------------------------
  {
    id: "lab-piping-filtering",
    lessonId: "lesson-piping-filtering",
    title: "Filter and Transform Process Data",
    description:
      "Use pipes, Where-Object, and Select-Object to filter a list of processes and write the results to a file.",
    difficulty: 2,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "lab/processes.csv",
        content:
          "Name,CPU,Memory\ncode,12.4,320\nidle,0.0,4\nchrome,8.2,1100\nnode,3.1,210\nexplorer,1.0,85\nspotify,5.5,450\n",
      },
      {
        path: "lab/filter-script.ps1",
        content:
          "# TODO: pipe processes.csv through Where-Object and Select-Object\n",
      },
      {
        path: "lab/expected-output.md",
        content:
          "# Expected\n\nYour filtered output should contain only processes using more than 200 MB of memory, showing Name and Memory columns.\n",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "lab/filter-script.ps1",
        pattern: "Where-Object|where ",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "lab/filter-script.ps1",
        pattern: "Select-Object|select ",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "lab/filter-script.ps1",
        pattern: "\\|",
        isRegex: true,
      },
      {
        kind: "file-presence",
        path: "lab/filter-script.ps1",
        shouldExist: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Read the CSV first, then pipe the results through a filter.",
        },
        {
          level: 1,
          text: "Start with `Import-Csv lab/processes.csv | Where-Object { ... }`.",
        },
      ],
      1: [
        {
          level: 0,
          text: "After filtering rows, narrow down which columns to keep.",
        },
        { level: 1, text: "Pipe into `Select-Object Name, Memory`." },
      ],
      2: [
        { level: 0, text: "The pipe character connects commands together." },
        {
          level: 1,
          text: "Chain commands like `Import-Csv ... | Where-Object ... | Select-Object ...`.",
        },
      ],
      3: [
        { level: 0, text: "Don't delete the script file." },
        { level: 1, text: "Edit `lab/filter-script.ps1` in place." },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 8a. PowerShell Scripting — basics (foreach, variables, loops)
  // -----------------------------------------------------------------------
  {
    id: "lab-powershell-basics",
    lessonId: "lesson-powershell-scripting",
    title: "Bulk Rename Files Safely",
    description:
      "Write a PowerShell script that renames every `.txt` file in a folder by adding a date prefix (e.g., `2026-03-29_report.txt`). Verify no files are lost.",
    difficulty: 2,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "rename-lab/report.txt",
        content: "Quarterly earnings summary.\n",
      },
      {
        path: "rename-lab/notes.txt",
        content: "Meeting action items from Monday.\n",
      },
      {
        path: "rename-lab/todo.txt",
        content: "- Fix build\n- Update docs\n- Deploy staging\n",
      },
      {
        path: "rename-lab/rename.ps1",
        content:
          "# TODO: rename all .txt files with a date prefix\n# Example: report.txt -> 2026-03-29_report.txt\n",
      },
      {
        path: "rename-lab/image.png",
        content: "(binary placeholder — should not be renamed)\n",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "rename-lab/rename.ps1",
        pattern: "foreach|ForEach-Object|for\\s*\\(",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "rename-lab/rename.ps1",
        pattern: "Rename-Item|Move-Item",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "rename-lab/rename.ps1",
        pattern: "\\$\\w+",
        isRegex: true,
      },
      {
        kind: "code-behavior",
        requiredPatterns: ["Rename-Item", "Get-Date"],
        forbiddenPatterns: ["Remove-Item"],
      },
    ],
    hints: {
      0: [
        { level: 0, text: "You need a loop to process each `.txt` file." },
        {
          level: 1,
          text: "Use `foreach ($file in Get-ChildItem *.txt) { ... }` to iterate.",
        },
      ],
      1: [
        {
          level: 0,
          text: "Use a cmdlet that changes a file's name without moving it.",
        },
        { level: 1, text: "`Rename-Item` changes the name in place." },
      ],
      2: [
        { level: 0, text: "Store intermediate values in variables using `$`." },
        { level: 1, text: "Example: `$date = Get-Date -Format 'yyyy-MM-dd'`." },
      ],
      3: [
        {
          level: 0,
          text: "Build the new name from the date and the original filename.",
        },
        {
          level: 1,
          text: 'Use `"${date}_$($file.Name)"` and pass it to `Rename-Item -NewName`.',
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 8b. PowerShell Scripting — organize downloads (PRD exit standard)
  // -----------------------------------------------------------------------
  {
    id: "lab-powershell-organize-downloads",
    lessonId: "lesson-powershell-scripting",
    title: "Organize Downloads by Extension",
    description:
      "Write a PowerShell script that sorts files in a simulated Downloads folder into sub-folders by extension (e.g., `.pdf` → `pdf/`, `.jpg` → `jpg/`). The script should handle unknown extensions gracefully.",
    difficulty: 2,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "downloads/presentation.pptx",
        content: "(slide deck placeholder)\n",
      },
      {
        path: "downloads/photo-vacation.jpg",
        content: "(image placeholder)\n",
      },
      {
        path: "downloads/budget-2026.pdf",
        content: "(pdf placeholder)\n",
      },
      {
        path: "downloads/setup-notes.txt",
        content:
          "Install steps:\n1. Download installer\n2. Run as admin\n3. Reboot\n",
      },
      {
        path: "downloads/organize.ps1",
        content:
          "# TODO: move each file into a subfolder named after its extension\n# Example: budget-2026.pdf -> pdf/budget-2026.pdf\n",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "downloads/organize.ps1",
        pattern: "foreach|ForEach-Object|for\\s*\\(",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "downloads/organize.ps1",
        pattern: "Move-Item",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "downloads/organize.ps1",
        pattern: "\\.Extension|extension",
        isRegex: true,
      },
      {
        kind: "code-behavior",
        requiredPatterns: ["Move-Item", "New-Item"],
        forbiddenPatterns: ["Remove-Item -Recurse -Force /"],
      },
      {
        kind: "content-match",
        path: "downloads/organize.ps1",
        pattern: "\\$\\w+",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        { level: 0, text: "Loop through every file in the downloads folder." },
        {
          level: 1,
          text: "Use `foreach ($file in Get-ChildItem -File) { ... }`.",
        },
      ],
      1: [
        {
          level: 0,
          text: "Use a cmdlet that relocates a file to a different directory.",
        },
        { level: 1, text: "`Move-Item` moves a file to a new path." },
      ],
      2: [
        {
          level: 0,
          text: "Each file object has a property for its extension.",
        },
        {
          level: 1,
          text: "Access `$file.Extension` and trim the leading dot with `.TrimStart('.')`.",
        },
      ],
      3: [
        { level: 0, text: "Create the target folder if it doesn't exist yet." },
        {
          level: 1,
          text: "Use `New-Item -ItemType Directory -Force` to create the subfolder.",
        },
      ],
      4: [
        { level: 0, text: "Store the extension in a variable for reuse." },
        { level: 1, text: "Example: `$ext = $file.Extension.TrimStart('.')`." },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 9. Obsidian Vault
  // -----------------------------------------------------------------------
  {
    id: "lab-obsidian-vault",
    lessonId: "lesson-obsidian-vault",
    title: "Build an Engineering Knowledge Vault",
    description:
      "Create a minimal Obsidian-style vault with linked markdown notes covering a topic you learned. Use wiki-links, tags, and a consistent folder structure.",
    difficulty: 2,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "vault/README.md",
        content: "# My Engineering Vault\n\nA place to capture what I learn.\n",
      },
      {
        path: "vault/templates/note-template.md",
        content:
          "# {{title}}\n\n## Summary\n\n## Key Takeaways\n\n## Links\n\n#tag\n",
      },
    ],
    rules: [
      {
        kind: "directory-structure",
        paths: ["vault/notes", "vault/templates"],
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "vault/notes",
        pattern: "\\[\\[.+\\]\\]",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "vault/notes",
        pattern: "#[a-zA-Z]",
        isRegex: true,
      },
      {
        kind: "file-presence",
        path: "vault/README.md",
        shouldExist: true,
      },
    ],
    hints: {
      0: [
        { level: 0, text: "Create a `notes` folder inside the vault." },
        {
          level: 1,
          text: "Run `New-Item -ItemType Directory -Path vault/notes`.",
        },
      ],
      1: [
        { level: 0, text: "Link between notes using double-bracket syntax." },
        {
          level: 1,
          text: "Write `[[other-note]]` inside one of your notes to create a wiki-link.",
        },
      ],
      2: [
        { level: 0, text: "Add tags so you can find notes by topic later." },
        {
          level: 1,
          text: "Add `#powershell` or `#filesystem` at the bottom of your note.",
        },
      ],
      3: [
        { level: 0, text: "Don't delete the vault README." },
        { level: 1, text: "The file `vault/README.md` must still exist." },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Lookup map — labs grouped by lesson ID
// ---------------------------------------------------------------------------

export const phase1LabsByLesson: Record<string, Phase1LabTemplate[]> = {};
for (const lab of phase1LabTemplates) {
  (phase1LabsByLesson[lab.lessonId] ??= []).push(lab);
}

// ---------------------------------------------------------------------------
// Phase 2 lab templates — 15 labs for Phase 2 lessons (one per lesson)
// ---------------------------------------------------------------------------

export type Phase2LabTemplate = LabTemplate & { lessonId: string };

export const phase2LabTemplates: Phase2LabTemplate[] = [
  // =======================================================================
  // Course 1: Practical Software Engineering
  // =======================================================================

  // -----------------------------------------------------------------------
  // 1. lesson-code-reading — Read Code Before Writing Code
  // -----------------------------------------------------------------------
  {
    id: "lab-code-reading",
    lessonId: "lesson-code-reading",
    title: "Trace Data Flow Through a Multi-File Project",
    description:
      "Read a small Node.js project with multiple files that import each other. Trace how data flows from the entry point through helper modules and add comments documenting the flow.",
    difficulty: 2,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "app/index.ts",
        content:
          'import { fetchUsers } from "./services/user-service";\nimport { formatReport } from "./utils/formatter";\n\nconst users = fetchUsers();\nconst report = formatReport(users);\nconsole.log(report);\n',
      },
      {
        path: "app/services/user-service.ts",
        content:
          'import { db } from "../data/database";\n\nexport function fetchUsers() {\n  return db.query("SELECT * FROM users WHERE active = true");\n}\n',
      },
      {
        path: "app/data/database.ts",
        content:
          'export const db = {\n  query(sql: string) {\n    // Simulated DB query\n    return [\n      { id: 1, name: "Alice", active: true },\n      { id: 2, name: "Bob", active: true },\n    ];\n  },\n};\n',
      },
      {
        path: "app/utils/formatter.ts",
        content:
          'export function formatReport(users: { id: number; name: string }[]) {\n  const header = "=== User Report ===";\n  const lines = users.map((u) => `  #${u.id} ${u.name}`);\n  return [header, ...lines].join("\\n");\n}\n',
      },
      {
        path: "app/FLOW.md",
        content:
          "# Data Flow\n\nDocument the data flow through this project below.\n",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "app/FLOW.md",
        pattern: "index\\.ts",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "app/FLOW.md",
        pattern: "user-service|fetchUsers",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "app/FLOW.md",
        pattern: "database|db\\.query",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "app/FLOW.md",
        pattern: "formatter|formatReport",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        { level: 0, text: "Start at the entry point — which file runs first?" },
        {
          level: 1,
          text: "Open `app/index.ts`. It imports from two modules — note them in FLOW.md.",
        },
      ],
      1: [
        {
          level: 0,
          text: "Follow the first import — where does the data come from?",
        },
        {
          level: 1,
          text: "Mention `user-service.ts` and how `fetchUsers` calls the database.",
        },
      ],
      2: [
        {
          level: 0,
          text: "What provides the raw data that the service returns?",
        },
        {
          level: 1,
          text: "The `database.ts` module simulates a DB query — document this in FLOW.md.",
        },
      ],
      3: [
        {
          level: 0,
          text: "How is the raw data transformed before being printed?",
        },
        {
          level: 1,
          text: "The `formatReport` function in `formatter.ts` builds the output string.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 2. lesson-debugging — Debug Systems Instead of Guessing
  // -----------------------------------------------------------------------
  {
    id: "lab-debugging",
    lessonId: "lesson-debugging",
    title: "Find and Fix the Off-by-One Bug",
    description:
      "A function that calculates the sum of numbers 1 to N has an off-by-one error. Observe the incorrect output, form a hypothesis, and fix the code so the tests pass.",
    difficulty: 2,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "src/sum-range.ts",
        content:
          "export function sumRange(n: number): number {\n  let total = 0;\n  // BUG: should include n, but loop stops early\n  for (let i = 1; i < n; i++) {\n    total += i;\n  }\n  return total;\n}\n",
      },
      {
        path: "src/sum-range.test.ts",
        content:
          'import { sumRange } from "./sum-range";\n\nconsole.log("sumRange(5):", sumRange(5), "expected: 15");\nconsole.log("sumRange(1):", sumRange(1), "expected: 1");\nconsole.log("sumRange(10):", sumRange(10), "expected: 55");\n',
      },
      {
        path: "src/debug-log.md",
        content:
          "# Debug Log\n\n## Observed behavior\n\n## Hypothesis\n\n## Fix applied\n",
      },
    ],
    rules: [
      {
        kind: "code-behavior",
        requiredPatterns: ["i <= n"],
        forbiddenPatterns: ["i < n;"],
      },
      {
        kind: "content-match",
        path: "src/debug-log.md",
        pattern: "[Hh]ypothesis",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "src/debug-log.md",
        pattern: "[Ff]ix|[Cc]hange|<=",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Look at the loop condition — does it include all numbers up to N?",
        },
        {
          level: 1,
          text: "Change `i < n` to `i <= n` so the loop includes N itself.",
        },
      ],
      1: [
        { level: 0, text: "Document what you observed before the fix." },
        {
          level: 1,
          text: "Write your hypothesis in the debug log, e.g., 'The loop stops one iteration early.'",
        },
      ],
      2: [
        { level: 0, text: "Describe the fix you applied in the log." },
        {
          level: 1,
          text: "Note that you changed `<` to `<=` in the Fix section of debug-log.md.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 3. lesson-project-structure — Project Structure and Dependencies
  // -----------------------------------------------------------------------
  {
    id: "lab-project-structure",
    lessonId: "lesson-project-structure",
    title: "Organize a Disorganized Project",
    description:
      "A project has all files dumped in the root directory. Reorganize them into a proper src/, test/, and docs/ structure with appropriate files in each.",
    difficulty: 2,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "messy-project/app.ts",
        content:
          'import { helper } from "./helper";\n\nexport function main() {\n  return helper("world");\n}\n',
      },
      {
        path: "messy-project/helper.ts",
        content:
          "export function helper(name: string): string {\n  return `Hello, ${name}!`;\n}\n",
      },
      {
        path: "messy-project/app.test.ts",
        content:
          '// Test for app.ts\nimport { main } from "./app";\nconsole.log(main());\n',
      },
      {
        path: "messy-project/README.md",
        content: "# Messy Project\n\nThis project needs to be reorganized.\n",
      },
      {
        path: "messy-project/package.json",
        content:
          '{\n  "name": "messy-project",\n  "version": "1.0.0",\n  "main": "src/app.ts"\n}\n',
      },
    ],
    rules: [
      {
        kind: "directory-structure",
        paths: [
          "messy-project/src",
          "messy-project/test",
          "messy-project/docs",
        ],
        shouldExist: true,
      },
      {
        kind: "file-presence",
        path: "messy-project/src/app.ts",
        shouldExist: true,
      },
      {
        kind: "file-presence",
        path: "messy-project/test/app.test.ts",
        shouldExist: true,
      },
      {
        kind: "file-presence",
        path: "messy-project/docs/README.md",
        shouldExist: true,
      },
    ],
    hints: {
      0: [
        { level: 0, text: "Create three directories: src, test, and docs." },
        {
          level: 1,
          text: "Run `mkdir messy-project/src messy-project/test messy-project/docs`.",
        },
      ],
      1: [
        { level: 0, text: "Move source code files into src/." },
        {
          level: 1,
          text: "Move `app.ts` and `helper.ts` into `messy-project/src/`.",
        },
      ],
      2: [
        { level: 0, text: "Move test files into test/." },
        { level: 1, text: "Move `app.test.ts` into `messy-project/test/`." },
      ],
      3: [
        { level: 0, text: "Move documentation files into docs/." },
        { level: 1, text: "Move `README.md` into `messy-project/docs/`." },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 4. lesson-package-management — Semver, Audits, Lock Files
  // -----------------------------------------------------------------------
  {
    id: "lab-package-management",
    lessonId: "lesson-package-management",
    title: "Update Dependencies with Semver",
    description:
      "A project has outdated dependencies with pinned versions. Update the package.json to use proper semver ranges and document your reasoning for each change.",
    difficulty: 2,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "webapp/package.json",
        content:
          '{\n  "name": "webapp",\n  "version": "1.0.0",\n  "dependencies": {\n    "express": "4.17.1",\n    "lodash": "4.17.20",\n    "axios": "0.21.0"\n  },\n  "devDependencies": {\n    "typescript": "4.9.0",\n    "jest": "29.0.0"\n  }\n}\n',
      },
      {
        path: "webapp/UPGRADE.md",
        content:
          "# Dependency Upgrade Plan\n\nFor each dependency, note the current version, target range, and why.\n\n## express\n\n## lodash\n\n## axios\n",
      },
      {
        path: "webapp/src/index.ts",
        content:
          'import express from "express";\nconst app = express();\napp.get("/", (req, res) => res.send("Hello"));\nexport default app;\n',
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "webapp/package.json",
        pattern: "\\^[0-9]|~[0-9]",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "webapp/UPGRADE.md",
        pattern: "express",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "webapp/UPGRADE.md",
        pattern: "\\^|~|semver|range|patch|minor",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "webapp/package.json",
        pattern: "axios",
        isRegex: false,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Replace exact versions with semver ranges using ^ or ~.",
        },
        {
          level: 1,
          text: 'Change `"express": "4.17.1"` to `"express": "^4.17.1"` to allow minor updates.',
        },
      ],
      1: [
        {
          level: 0,
          text: "Document why you chose each version range in UPGRADE.md.",
        },
        {
          level: 1,
          text: "Under each heading, write the current pinned version and the new range.",
        },
      ],
      2: [
        {
          level: 0,
          text: "Explain the difference between ^ and ~ in your notes.",
        },
        {
          level: 1,
          text: "^ allows minor+patch updates; ~ allows only patch updates. Note which you chose.",
        },
      ],
      3: [
        {
          level: 0,
          text: "Make sure all dependencies still appear in package.json.",
        },
        {
          level: 1,
          text: "Don't remove any dependency — just update the version strings.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 5. lesson-programming-logic — Variables, Functions, Control Flow
  // -----------------------------------------------------------------------
  {
    id: "lab-programming-logic",
    lessonId: "lesson-programming-logic",
    title: "Build a FizzBuzz Function with Types",
    description:
      "Write a typed function that takes a number and returns an array of FizzBuzz results. Use variables, conditionals, and a loop. The function must handle 1 to N.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "src/fizzbuzz.ts",
        content:
          '// Write your fizzBuzz function here.\n// It should take a number n and return a string[] of results from 1 to n.\n// Rules: divisible by 3 → "Fizz", by 5 → "Buzz", both → "FizzBuzz", else the number as a string.\n\nexport function fizzBuzz(n: number): string[] {\n  // TODO: implement\n  return [];\n}\n',
      },
      {
        path: "src/fizzbuzz.test.ts",
        content:
          'import { fizzBuzz } from "./fizzbuzz";\n\nconst result = fizzBuzz(15);\nconsole.log("Length:", result.length, "expected: 15");\nconsole.log("result[2]:", result[2], "expected: Fizz");\nconsole.log("result[4]:", result[4], "expected: Buzz");\nconsole.log("result[14]:", result[14], "expected: FizzBuzz");\nconsole.log("result[0]:", result[0], "expected: 1");\n',
      },
    ],
    rules: [
      {
        kind: "code-behavior",
        requiredPatterns: ["function fizzBuzz", "for", "return"],
        forbiddenPatterns: ["return \\[\\];\n}"],
      },
      {
        kind: "content-match",
        path: "src/fizzbuzz.ts",
        pattern: "if.*%.*3|%.*5",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "src/fizzbuzz.ts",
        pattern: "Fizz",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "src/fizzbuzz.ts",
        pattern: "Buzz",
        isRegex: false,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Use a for loop and conditionals to build the result array.",
        },
        {
          level: 1,
          text: "Loop `for (let i = 1; i <= n; i++)` and push the right string based on modulo checks.",
        },
      ],
      1: [
        { level: 0, text: "Check divisibility using the modulo operator %." },
        {
          level: 1,
          text: "Use `if (i % 15 === 0)` for FizzBuzz, then `% 3` for Fizz, then `% 5` for Buzz.",
        },
      ],
      2: [
        { level: 0, text: 'Numbers divisible by 3 produce "Fizz".' },
        {
          level: 1,
          text: 'Push `"Fizz"` when `i % 3 === 0` (and not also divisible by 5).',
        },
      ],
      3: [
        { level: 0, text: 'Numbers divisible by 5 produce "Buzz".' },
        {
          level: 1,
          text: 'Push `"Buzz"` when `i % 5 === 0` (and not also divisible by 3).',
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 5b. lesson-data-structures — Arrays, Objects, and Data Manipulation
  // -----------------------------------------------------------------------
  {
    id: "lab-data-structures",
    lessonId: "lesson-data-structures",
    title: "Transform and Filter a User Dataset",
    description:
      "You have an array of user objects. Write functions to filter active users, extract their emails using .map(), and find a user by ID. Use destructuring where appropriate.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "src/users.ts",
        content:
          "type User = {\n  id: number;\n  name: string;\n  email: string;\n  active: boolean;\n};\n\nconst users: User[] = [\n  { id: 1, name: 'Alice', email: 'alice@example.com', active: true },\n  { id: 2, name: 'Bob', email: 'bob@example.com', active: false },\n  { id: 3, name: 'Charlie', email: 'charlie@example.com', active: true },\n  { id: 4, name: 'Diana', email: 'diana@example.com', active: true },\n];\n\n// 1. Return only active users\nexport function getActiveUsers(data: User[]): User[] {\n  // TODO: use .filter()\n  return [];\n}\n\n// 2. Return an array of just email strings\nexport function getEmails(data: User[]): string[] {\n  // TODO: use .map()\n  return [];\n}\n\n// 3. Find a user by ID, return undefined if not found\nexport function findUserById(data: User[], id: number): User | undefined {\n  // TODO: use .find()\n  return undefined;\n}\n\n// Test your functions\nconsole.log('Active:', getActiveUsers(users).length, '(expected 3)');\nconsole.log('Emails:', getEmails(users).length, '(expected 4)');\nconsole.log('Find #3:', findUserById(users, 3)?.name, '(expected Charlie)');\n",
      },
      {
        path: "src/users.test.ts",
        content:
          "import { getActiveUsers, getEmails, findUserById } from './users';\n\nconst testUsers = [\n  { id: 1, name: 'Alice', email: 'alice@test.com', active: true },\n  { id: 2, name: 'Bob', email: 'bob@test.com', active: false },\n];\n\nconsole.log('getActiveUsers returns 1 active:', getActiveUsers(testUsers).length === 1);\nconsole.log('getEmails returns 2 emails:', getEmails(testUsers).length === 2);\nconsole.log('findUserById(1) is Alice:', findUserById(testUsers, 1)?.name === 'Alice');\nconsole.log('findUserById(99) is undefined:', findUserById(testUsers, 99) === undefined);\n",
      },
    ],
    rules: [
      {
        kind: "code-behavior",
        requiredPatterns: [".filter(", ".map(", ".find("],
        forbiddenPatterns: ["return \\[\\];\n}", "return undefined;\n}"],
      },
      {
        kind: "content-match",
        path: "src/users.ts",
        pattern: "\\.active",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "src/users.ts",
        pattern: "\\.email",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Use .filter() with a condition that checks the active property.",
        },
        {
          level: 1,
          text: "Return data.filter(user => user.active) to keep only active users.",
        },
      ],
      1: [
        {
          level: 0,
          text: "Use .map() to transform each user object into just their email string.",
        },
        {
          level: 1,
          text: "Return data.map(user => user.email) to extract the email field.",
        },
      ],
      2: [
        {
          level: 0,
          text: "Use .find() which returns the first matching element or undefined.",
        },
        {
          level: 1,
          text: "Return data.find(user => user.id === id) to locate a user by their ID.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 6. lesson-typescript-types — TypeScript Types and Compile-Time Safety
  // -----------------------------------------------------------------------
  {
    id: "lab-typescript-types",
    lessonId: "lesson-typescript-types",
    title: "Replace 'any' with Proper Types",
    description:
      "A module uses 'any' in several places. Add proper type annotations so the code is type-safe. No 'any' should remain.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "src/user-service.ts",
        content:
          '// Fix all the "any" types in this module\n\nexport function getUser(id: any): any {\n  return { id, name: "Alice", email: "alice@example.com", age: 30 };\n}\n\nexport function formatUser(user: any): any {\n  return `${user.name} (${user.email})`;\n}\n\nexport function filterAdults(users: any): any {\n  return users.filter((u: any) => u.age >= 18);\n}\n',
      },
      {
        path: "src/types.ts",
        content:
          "// Define your User type here\n\n// export type User = { ... };\n",
      },
    ],
    rules: [
      {
        kind: "code-behavior",
        requiredPatterns: ["type User", "name:", "email:", "age:"],
        forbiddenPatterns: [": any"],
      },
      {
        kind: "content-match",
        path: "src/user-service.ts",
        pattern: "User",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "src/types.ts",
        pattern: "export type User",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "src/user-service.ts",
        pattern: "import.*User.*from",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Define a User type with id, name, email, and age fields.",
        },
        {
          level: 1,
          text: "In `types.ts`: `export type User = { id: number; name: string; email: string; age: number };`",
        },
      ],
      1: [
        {
          level: 0,
          text: "Use the User type as the return type and parameter type in user-service.ts.",
        },
        {
          level: 1,
          text: "Change `getUser(id: any): any` to `getUser(id: number): User`.",
        },
      ],
      2: [
        { level: 0, text: "Make sure User is exported from types.ts." },
        {
          level: 1,
          text: "Add `export` before the type definition: `export type User = { ... }`.",
        },
      ],
      3: [
        { level: 0, text: "Import the User type into user-service.ts." },
        {
          level: 1,
          text: 'Add `import { User } from "./types";` at the top of user-service.ts.',
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 7. lesson-json-config — Configuration Files and Environment Variables
  // -----------------------------------------------------------------------
  {
    id: "lab-json-config",
    lessonId: "lesson-json-config",
    title: "Extract Hardcoded Values into Config",
    description:
      "A server file has hardcoded values for port, database URL, and API key. Move them into a config.json and a .env file, then reference them properly.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "server/app.ts",
        content:
          '// TODO: Move hardcoded values to config.json and .env\nconst PORT = 3000;\nconst DB_URL = "postgres://localhost:5432/mydb";\nconst API_KEY = "sk-secret-key-12345";\n\nconsole.log(`Starting on port ${PORT}`);\nconsole.log(`DB: ${DB_URL}`);\n',
      },
      {
        path: "server/README.md",
        content:
          "# Server Config Lab\n\nMove hardcoded values into config.json (non-secret) and .env (secrets).\n",
      },
    ],
    rules: [
      {
        kind: "file-presence",
        path: "server/config.json",
        shouldExist: true,
      },
      {
        kind: "file-presence",
        path: "server/.env",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "server/config.json",
        pattern: "port|PORT",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "server/.env",
        pattern: "API_KEY|SECRET",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Create a config.json for non-secret configuration.",
        },
        {
          level: 1,
          text: 'Create `server/config.json` with `{ "port": 3000, "dbUrl": "postgres://localhost:5432/mydb" }`.',
        },
      ],
      1: [
        {
          level: 0,
          text: "Secrets should never go in JSON files — use .env instead.",
        },
        {
          level: 1,
          text: "Create `server/.env` with `API_KEY=sk-secret-key-12345`.",
        },
      ],
      2: [
        { level: 0, text: "The config.json should contain the port number." },
        { level: 1, text: 'Add `"port": 3000` to config.json.' },
      ],
      3: [
        { level: 0, text: "The .env file should contain the API key." },
        {
          level: 1,
          text: "Add `API_KEY=sk-secret-key-12345` to the .env file.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 8. lesson-error-reading — Reading Errors and Stack Traces
  // -----------------------------------------------------------------------
  {
    id: "lab-error-reading",
    lessonId: "lesson-error-reading",
    title: "Diagnose a Stack Trace",
    description:
      "Given a stack trace from a crashing application, identify the error type, the message, and the exact file and line number where the error originated. Write your diagnosis in a report file.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "crash/stacktrace.txt",
        content:
          "TypeError: Cannot read properties of undefined (reading 'map')\n    at formatUsers (src/formatter.ts:12:18)\n    at processData (src/pipeline.ts:45:10)\n    at main (src/index.ts:8:3)\n    at Object.<anonymous> (src/index.ts:15:1)\n",
      },
      {
        path: "crash/diagnosis.md",
        content:
          "# Error Diagnosis\n\n## Error Type\n\n## Error Message\n\n## Origin File\n\n## Origin Line\n\n## Root Cause\n",
      },
      {
        path: "crash/src/formatter.ts",
        content:
          'export function formatUsers(users: { name: string }[] | undefined) {\n  // Line 12 below is where the error occurs\n  // The function doesn\'t check for undefined before using .map\n  const names = users.map((u) => u.name);\n  return names.join(", ");\n}\n',
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "crash/diagnosis.md",
        pattern: "TypeError",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "crash/diagnosis.md",
        pattern: "undefined|map",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "crash/diagnosis.md",
        pattern: "formatter\\.ts|line.*12|12",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "The first line of a stack trace tells you the error type and message.",
        },
        {
          level: 1,
          text: "The error type is `TypeError` — write it in the Error Type section.",
        },
      ],
      1: [
        {
          level: 0,
          text: "Read the error message carefully — what value was being accessed?",
        },
        {
          level: 1,
          text: "The message is: \"Cannot read properties of undefined (reading 'map')\".",
        },
      ],
      2: [
        {
          level: 0,
          text: "The top frame in the stack trace shows where the error originated.",
        },
        { level: 1, text: "The origin is `src/formatter.ts` at line 12." },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 9. lesson-vscode-debugger — The VS Code Debugger and Breakpoints
  // -----------------------------------------------------------------------
  {
    id: "lab-vscode-debugger",
    lessonId: "lesson-vscode-debugger",
    title: "Configure the Debugger and Fix a Variable Bug",
    description:
      "A function calculates a discount price but uses the wrong variable. Create a VS Code launch.json configuration and fix the variable reference so the function returns the correct result.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "shop/src/pricing.ts",
        content:
          'export function applyDiscount(price: number, discountPercent: number): number {\n  const discountAmount = price * (discountPercent / 100);\n  // BUG: should subtract discountAmount, but subtracts discountPercent instead\n  const finalPrice = price - discountPercent;\n  return finalPrice;\n}\n\nconsole.log("$100 with 20% off:", applyDiscount(100, 20), "expected: 80");\n',
      },
      {
        path: "shop/src/pricing.test.ts",
        content:
          'import { applyDiscount } from "./pricing";\n\nconsole.log("Test 1:", applyDiscount(100, 20) === 80 ? "PASS" : "FAIL");\nconsole.log("Test 2:", applyDiscount(50, 10) === 45 ? "PASS" : "FAIL");\n',
      },
    ],
    rules: [
      {
        kind: "file-presence",
        path: "shop/.vscode/launch.json",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "shop/.vscode/launch.json",
        pattern: "configurations",
        isRegex: false,
      },
      {
        kind: "code-behavior",
        requiredPatterns: ["price - discountAmount"],
        forbiddenPatterns: ["price - discountPercent"],
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Create a .vscode folder and a launch.json inside it.",
        },
        {
          level: 1,
          text: 'Create `shop/.vscode/launch.json` with a `{ "version": "0.2.0", "configurations": [...] }` structure.',
        },
      ],
      1: [
        {
          level: 0,
          text: "The launch.json needs at least one configuration to run a Node file.",
        },
        {
          level: 1,
          text: 'Add a config with `"type": "node"`, `"request": "launch"`, and `"program": "${workspaceFolder}/src/pricing.ts"`.',
        },
      ],
      2: [
        {
          level: 0,
          text: "Look at which variable is being subtracted — is it the right one?",
        },
        {
          level: 1,
          text: "Change `price - discountPercent` to `price - discountAmount`.",
        },
      ],
    },
  },

  // =======================================================================
  // Course 2: Version Control with Git
  // =======================================================================

  // -----------------------------------------------------------------------
  // 10. lesson-git-workflow — Use Git as a Safety System
  // -----------------------------------------------------------------------
  {
    id: "lab-git-workflow",
    lessonId: "lesson-git-workflow",
    title: "Set Up a Git Safety Net",
    description:
      "Initialize a project for version control. Create a proper .gitignore to exclude build artifacts and secrets, then write a descriptive commit message in a file.",
    difficulty: 2,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "my-project/src/index.ts",
        content:
          "export function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n",
      },
      {
        path: "my-project/package.json",
        content:
          '{\n  "name": "my-project",\n  "version": "0.1.0",\n  "scripts": {\n    "build": "tsc"\n  }\n}\n',
      },
      {
        path: "my-project/dist/index.js",
        content: "// compiled output — should be gitignored\n",
      },
      {
        path: "my-project/.env",
        content: "SECRET_KEY=do-not-commit-this\n",
      },
    ],
    rules: [
      {
        kind: "file-presence",
        path: "my-project/.gitignore",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "my-project/.gitignore",
        pattern: "node_modules|dist",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "my-project/.gitignore",
        pattern: "\\.env",
        isRegex: true,
      },
      {
        kind: "file-presence",
        path: "my-project/COMMIT_MSG.md",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "my-project/COMMIT_MSG.md",
        pattern: ".{10,}",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        { level: 0, text: "Create a .gitignore file in the project root." },
        {
          level: 1,
          text: "Create `my-project/.gitignore` to list patterns of files Git should ignore.",
        },
      ],
      1: [
        {
          level: 0,
          text: "Build artifacts like dist/ and node_modules/ should be ignored.",
        },
        {
          level: 1,
          text: "Add `node_modules/` and `dist/` on separate lines in .gitignore.",
        },
      ],
      2: [
        { level: 0, text: "Secret files must never be committed." },
        {
          level: 1,
          text: "Add `.env` to .gitignore to prevent committing secrets.",
        },
      ],
      3: [
        {
          level: 0,
          text: "Write a commit message that describes what this initial commit contains.",
        },
        {
          level: 1,
          text: 'Create `COMMIT_MSG.md` with a message like "Initial project setup with src and build config".',
        },
      ],
      4: [
        {
          level: 0,
          text: "A good commit message is at least a full sentence.",
        },
        {
          level: 1,
          text: "Make sure the message is at least 10 characters long and describes the change.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 11. lesson-branching — Branches and Safe Experimentation
  // -----------------------------------------------------------------------
  {
    id: "lab-branching",
    lessonId: "lesson-branching",
    title: "Feature Branch Workflow",
    description:
      "Practice the feature branch workflow. Create a feature branch record, make changes on it, and document the merge back to main.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "repo/main.ts",
        content: '// Main branch code\nexport const version = "1.0.0";\n',
      },
      {
        path: "repo/BRANCHES.md",
        content:
          "# Branch Log\n\nDocument your branching workflow here.\n\n## Branch Name\n\n## Changes Made\n\n## Merge Status\n",
      },
    ],
    rules: [
      {
        kind: "file-presence",
        path: "repo/feature.ts",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "repo/BRANCHES.md",
        pattern: "feature|branch",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "repo/BRANCHES.md",
        pattern: "[Mm]erge|[Cc]omplete|[Dd]one",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "repo/feature.ts",
        pattern: "export",
        isRegex: false,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Create a new file to represent work done on the feature branch.",
        },
        {
          level: 1,
          text: "Create `repo/feature.ts` with an exported function or constant.",
        },
      ],
      1: [
        { level: 0, text: "Document the branch name you would use." },
        {
          level: 1,
          text: "Write a branch name like `feature/add-login` in the Branch Name section.",
        },
      ],
      2: [
        { level: 0, text: "Record the merge status of the branch." },
        {
          level: 1,
          text: 'Write "Merged to main" or "Complete" in the Merge Status section.',
        },
      ],
      3: [
        {
          level: 0,
          text: "The feature file should export something meaningful.",
        },
        {
          level: 1,
          text: 'Add `export const featureName = "login";` or similar to feature.ts.',
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 12. lesson-git-merge-conflict — Resolving Merge Conflicts
  // -----------------------------------------------------------------------
  {
    id: "lab-git-merge-conflict",
    lessonId: "lesson-git-merge-conflict",
    title: "Resolve a Merge Conflict",
    description:
      "Two branches edited the same file differently. The file now has conflict markers. Resolve the conflict by choosing the correct content and removing all markers.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "conflict/config.ts",
        content:
          'export const config = {\n  appName: "MyApp",\n<<<<<<< HEAD\n  port: 3000,\n  debug: true,\n=======\n  port: 8080,\n  debug: false,\n>>>>>>> feature/production-settings\n  version: "2.0.0",\n};\n',
      },
      {
        path: "conflict/RESOLUTION.md",
        content:
          "# Merge Conflict Resolution\n\n## What conflicted\n\n## What I chose and why\n\n## Verification\n",
      },
      {
        path: "conflict/README.md",
        content:
          "# Conflict Resolution Lab\n\nResolve the conflict markers in config.ts and document your decision.\n",
      },
    ],
    rules: [
      {
        kind: "code-behavior",
        requiredPatterns: ["port"],
        forbiddenPatterns: ["<<<<<<<", "=======", ">>>>>>>"],
      },
      {
        kind: "content-match",
        path: "conflict/config.ts",
        pattern: "port.*:\\s*\\d+",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "conflict/RESOLUTION.md",
        pattern: "port|debug|chose|pick",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Remove ALL conflict markers: <<<<<<<, =======, and >>>>>>>.",
        },
        {
          level: 1,
          text: "Delete the lines containing `<<<<<<< HEAD`, `=======`, and `>>>>>>> feature/production-settings`.",
        },
      ],
      1: [
        {
          level: 0,
          text: "Choose one version of the conflicting lines (or combine them).",
        },
        {
          level: 1,
          text: "Keep either `port: 3000, debug: true` or `port: 8080, debug: false` — or pick each value.",
        },
      ],
      2: [
        { level: 0, text: "Document what you chose and why in RESOLUTION.md." },
        {
          level: 1,
          text: "Write which port and debug values you kept and your reasoning.",
        },
      ],
    },
  },

  // =======================================================================
  // Course 3: API Fundamentals
  // =======================================================================

  // -----------------------------------------------------------------------
  // 13. lesson-http-basics — HTTP: The Language of the Web
  // -----------------------------------------------------------------------
  {
    id: "lab-http-basics",
    lessonId: "lesson-http-basics",
    title: "Complete HTTP Request and Response Files",
    description:
      "Fill in correct HTTP methods, status codes, and headers in request/response template files to demonstrate understanding of how HTTP works.",
    difficulty: 2,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "http/requests.md",
        content:
          '# HTTP Requests\n\nFill in the correct HTTP method for each operation:\n\n## Get all users\nMethod: ___\nURL: /api/users\n\n## Create a new user\nMethod: ___\nURL: /api/users\nBody: { "name": "Alice" }\n\n## Delete user 42\nMethod: ___\nURL: /api/users/42\n',
      },
      {
        path: "http/responses.md",
        content:
          "# HTTP Responses\n\nFill in the correct status code for each scenario:\n\n## Successful resource creation\nStatus: ___\n\n## Resource not found\nStatus: ___\n\n## Unauthorized access\nStatus: ___\n",
      },
      {
        path: "http/reference.md",
        content:
          "# HTTP Quick Reference\n\n| Method | Purpose |\n|--------|---------|\n| GET    | Retrieve |\n| POST   | Create  |\n| PUT    | Update  |\n| DELETE | Remove  |\n\n| Code | Meaning       |\n|------|---------------|\n| 200  | OK            |\n| 201  | Created       |\n| 401  | Unauthorized  |\n| 404  | Not Found     |\n| 500  | Server Error  |\n",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "http/requests.md",
        pattern: "GET",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "http/requests.md",
        pattern: "POST",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "http/requests.md",
        pattern: "DELETE",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "http/responses.md",
        pattern: "201|404|401",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        { level: 0, text: "Retrieving data uses which HTTP method?" },
        {
          level: 1,
          text: "Replace `___` with `GET` for the 'Get all users' request.",
        },
      ],
      1: [
        { level: 0, text: "Creating a new resource uses which method?" },
        {
          level: 1,
          text: "Replace `___` with `POST` for the 'Create a new user' request.",
        },
      ],
      2: [
        { level: 0, text: "Removing a resource uses which method?" },
        {
          level: 1,
          text: "Replace `___` with `DELETE` for the 'Delete user 42' request.",
        },
      ],
      3: [
        {
          level: 0,
          text: "Use the reference table to match status codes to scenarios.",
        },
        {
          level: 1,
          text: "201 = Created, 404 = Not Found, 401 = Unauthorized.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 14. lesson-postman-basics — Professional API Testing with Postman
  // -----------------------------------------------------------------------
  {
    id: "lab-postman-basics",
    lessonId: "lesson-postman-basics",
    title: "Complete a Postman Collection",
    description:
      "A Postman collection JSON file has missing request methods and URLs. Complete the collection so it covers GET, POST, and DELETE operations against a REST API.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "postman/collection.json",
        content:
          '{\n  "info": {\n    "name": "Users API",\n    "_postman_id": "lab-collection",\n    "schema": "https://schema.getpostman.com/json/collection/v2.1.0/collection.json"\n  },\n  "item": [\n    {\n      "name": "List Users",\n      "request": {\n        "method": "___",\n        "url": "{{baseUrl}}/api/users"\n      }\n    },\n    {\n      "name": "Create User",\n      "request": {\n        "method": "___",\n        "url": "{{baseUrl}}/api/users",\n        "body": {\n          "mode": "raw",\n          "raw": "{ \\"name\\": \\"Alice\\" }"\n        }\n      }\n    },\n    {\n      "name": "Delete User",\n      "request": {\n        "method": "___",\n        "url": "{{baseUrl}}/api/users/1"\n      }\n    }\n  ]\n}\n',
      },
      {
        path: "postman/environment.json",
        content:
          '{\n  "name": "Local",\n  "values": [\n    {\n      "key": "baseUrl",\n      "value": "___",\n      "enabled": true\n    }\n  ]\n}\n',
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "postman/collection.json",
        pattern: '"method":\\s*"GET"',
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "postman/collection.json",
        pattern: '"method":\\s*"POST"',
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "postman/collection.json",
        pattern: '"method":\\s*"DELETE"',
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "postman/environment.json",
        pattern: "http://localhost|https?://",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "The List Users request retrieves data — what method is that?",
        },
        {
          level: 1,
          text: 'Replace `"___"` with `"GET"` for the List Users request.',
        },
      ],
      1: [
        {
          level: 0,
          text: "The Create User request sends data to create a resource.",
        },
        {
          level: 1,
          text: 'Replace `"___"` with `"POST"` for the Create User request.',
        },
      ],
      2: [
        { level: 0, text: "The Delete User request removes a resource." },
        {
          level: 1,
          text: 'Replace `"___"` with `"DELETE"` for the Delete User request.',
        },
      ],
      3: [
        { level: 0, text: "The environment needs a real baseUrl value." },
        {
          level: 1,
          text: 'Set `"value"` to `"http://localhost:3000"` in environment.json.',
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 15. lesson-api-authentication — API Auth: Tokens, Keys, Secrets
  // -----------------------------------------------------------------------
  {
    id: "lab-api-authentication",
    lessonId: "lesson-api-authentication",
    title: "Secure an API Project with Tokens and .gitignore",
    description:
      "Set up API authentication for a project. Create a .env file with a bearer token, configure .gitignore to exclude it, and update the API client to reference the environment variable.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "api-project/src/client.ts",
        content:
          '// TODO: Replace the hardcoded token with an environment variable reference\nconst API_TOKEN = "hardcoded-secret-token";\n\nexport async function fetchData(url: string) {\n  return fetch(url, {\n    headers: {\n      Authorization: `Bearer ${API_TOKEN}`,\n    },\n  });\n}\n',
      },
      {
        path: "api-project/package.json",
        content:
          '{\n  "name": "api-project",\n  "version": "1.0.0",\n  "scripts": {\n    "start": "node src/client.js"\n  }\n}\n',
      },
    ],
    rules: [
      {
        kind: "file-presence",
        path: "api-project/.env",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "api-project/.env",
        pattern: "API_TOKEN|BEARER|TOKEN",
        isRegex: true,
      },
      {
        kind: "file-presence",
        path: "api-project/.gitignore",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "api-project/.gitignore",
        pattern: "\\.env",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "api-project/src/client.ts",
        pattern: "process\\.env|ENV",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        { level: 0, text: "Create a .env file with your API token." },
        {
          level: 1,
          text: "Create `api-project/.env` with `API_TOKEN=your-secret-token-here`.",
        },
      ],
      1: [
        {
          level: 0,
          text: "The token value in .env should look like a real token.",
        },
        {
          level: 1,
          text: "Use a value like `API_TOKEN=sk-abc123xyz` in the .env file.",
        },
      ],
      2: [
        {
          level: 0,
          text: "Prevent .env from being committed to version control.",
        },
        {
          level: 1,
          text: "Create `api-project/.gitignore` and add `.env` to it.",
        },
      ],
      3: [
        {
          level: 0,
          text: "The .gitignore must list .env to keep secrets out of the repo.",
        },
        {
          level: 1,
          text: "Add a line with just `.env` in the .gitignore file.",
        },
      ],
      4: [
        {
          level: 0,
          text: "Replace the hardcoded token with an environment variable.",
        },
        {
          level: 1,
          text: 'Change `const API_TOKEN = "hardcoded..."` to `const API_TOKEN = process.env.API_TOKEN`.',
        },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Lookup map — Phase 2 labs grouped by lesson ID
// ---------------------------------------------------------------------------

export const phase2LabsByLesson: Record<string, Phase2LabTemplate[]> = {};
for (const lab of phase2LabTemplates) {
  (phase2LabsByLesson[lab.lessonId] ??= []).push(lab);
}

// ---------------------------------------------------------------------------
// Phase 3 lab templates — 9 labs for Phase 3 lessons (one per lesson)
// ---------------------------------------------------------------------------

export type Phase3LabTemplate = LabTemplate & { lessonId: string };

export const phase3LabTemplates: Phase3LabTemplate[] = [
  // =======================================================================
  // Course 1: Containers and AI-Assisted Development
  // =======================================================================

  // -----------------------------------------------------------------------
  // 1. lesson-docker-basics — Run containers, list containers, image vs container
  // -----------------------------------------------------------------------
  {
    id: "lab-docker-basics",
    lessonId: "lesson-docker-basics",
    title: "Run and Inspect Docker Containers",
    description:
      "Pull an image, run a container, list running containers, and document the difference between an image and a container in a report file.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "docker-lab/report.md",
        content:
          "# Docker Basics Report\n\n## Image vs Container\n\n## Commands Used\n\n## Running Containers\n",
      },
      {
        path: "docker-lab/commands.sh",
        content:
          "# Record each Docker command you run below\n# Example: docker pull nginx\n",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "docker-lab/commands.sh",
        pattern: "docker (run|pull|start)",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "docker-lab/commands.sh",
        pattern: "docker (ps|container ls|container list)",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "docker-lab/report.md",
        pattern: "[Ii]mage",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "docker-lab/report.md",
        pattern: "[Cc]ontainer",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Start by pulling or running an image — record the command.",
        },
        {
          level: 1,
          text: "Add `docker pull nginx` or `docker run --rm nginx` to commands.sh.",
        },
      ],
      1: [
        {
          level: 0,
          text: "How do you see which containers are currently active?",
        },
        {
          level: 1,
          text: "Add `docker ps` to commands.sh to list running containers.",
        },
      ],
      2: [
        {
          level: 0,
          text: "An image is a blueprint — what does a container add on top?",
        },
        {
          level: 1,
          text: "Write that an image is a read-only template and a container is a running instance of that image.",
        },
      ],
      3: [
        { level: 0, text: "Fill in all three sections of the report." },
        {
          level: 1,
          text: "The report must mention both 'image' and 'container' with explanations.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 2. lesson-dockerfile — Write multi-stage Dockerfiles with proper layering
  // -----------------------------------------------------------------------
  {
    id: "lab-dockerfile",
    lessonId: "lesson-dockerfile",
    title: "Write a Multi-Stage Dockerfile",
    description:
      "Create a multi-stage Dockerfile for a Node.js app. The build stage compiles TypeScript and the production stage copies only the compiled output. Add a .dockerignore to keep the image lean.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "webapp/src/index.ts",
        content:
          'const message: string = "Hello from the container!";\nconsole.log(message);\n',
      },
      {
        path: "webapp/package.json",
        content:
          '{\n  "name": "webapp",\n  "version": "1.0.0",\n  "scripts": {\n    "build": "tsc",\n    "start": "node dist/index.js"\n  },\n  "devDependencies": {\n    "typescript": "^5.0.0"\n  }\n}\n',
      },
      {
        path: "webapp/tsconfig.json",
        content:
          '{\n  "compilerOptions": {\n    "outDir": "dist",\n    "target": "ES2022",\n    "module": "commonjs",\n    "strict": true\n  },\n  "include": ["src"]\n}\n',
      },
    ],
    rules: [
      {
        kind: "file-presence",
        path: "webapp/Dockerfile",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "webapp/Dockerfile",
        pattern: "FROM.*AS",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "webapp/Dockerfile",
        pattern: "COPY --from=",
        isRegex: false,
      },
      {
        kind: "file-presence",
        path: "webapp/.dockerignore",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "webapp/.dockerignore",
        pattern: "node_modules",
        isRegex: false,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "A multi-stage Dockerfile has more than one FROM instruction.",
        },
        {
          level: 1,
          text: "Start with `FROM node:20-alpine AS build` for the build stage.",
        },
      ],
      1: [
        {
          level: 0,
          text: "The build stage should install dependencies and compile TypeScript.",
        },
        {
          level: 1,
          text: "Add `RUN npm install && npm run build` in the build stage.",
        },
      ],
      2: [
        {
          level: 0,
          text: "The production stage copies artifacts from the build stage.",
        },
        {
          level: 1,
          text: "Use `COPY --from=build /app/dist ./dist` to copy only compiled output.",
        },
      ],
      3: [
        {
          level: 0,
          text: "Create a .dockerignore to exclude unnecessary files from the build context.",
        },
        {
          level: 1,
          text: "Add `node_modules` and `dist` to `webapp/.dockerignore`.",
        },
      ],
      4: [
        {
          level: 0,
          text: "The .dockerignore works like .gitignore — list files to exclude.",
        },
        {
          level: 1,
          text: "Add `node_modules`, `dist`, and `.git` on separate lines.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 3. lesson-ai-prompting — Write clear, constrained, context-rich prompts
  // -----------------------------------------------------------------------
  {
    id: "lab-ai-prompting",
    lessonId: "lesson-ai-prompting",
    title: "Craft Effective AI Prompts",
    description:
      "Write a series of prompts that progress from vague to precise. Each prompt should include context, constraints, and an expected output format. Document why each revision improves on the last.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "prompts/bad-prompt.md",
        content:
          '# Bad Prompt Example\n\n"Write me some code."\n\nThis prompt is too vague. It lacks context, constraints, and a desired format.\n',
      },
      {
        path: "prompts/prompt-template.md",
        content:
          "# Prompt Template\n\n## Context\nDescribe the project, language, and current state.\n\n## Task\nWhat exactly should the AI produce?\n\n## Constraints\nLimitations, patterns to follow, things to avoid.\n\n## Expected Output Format\nFile type, structure, length, etc.\n",
      },
      {
        path: "prompts/my-prompts.md",
        content:
          "# My Prompts\n\n## Prompt 1 (Vague)\n\n## Prompt 2 (Better)\n\n## Prompt 3 (Production-Ready)\n\n## Reflection\nWhy is each revision better than the last?\n",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "prompts/my-prompts.md",
        pattern: "## Prompt 1",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "prompts/my-prompts.md",
        pattern: "[Cc]ontext|[Cc]onstraint|[Ff]ormat",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "prompts/my-prompts.md",
        pattern: "## Prompt 3",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "prompts/my-prompts.md",
        pattern: "## Reflection",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "prompts/my-prompts.md",
        pattern: ".{200,}",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Start with a deliberately vague prompt to show the contrast.",
        },
        {
          level: 1,
          text: "Under Prompt 1, write something short and unclear like 'Make a function.'",
        },
      ],
      1: [
        {
          level: 0,
          text: "Good prompts mention context, constraints, or expected format.",
        },
        {
          level: 1,
          text: "In Prompt 2, add the language, purpose, and any constraints like 'no external libraries.'",
        },
      ],
      2: [
        {
          level: 0,
          text: "A production-ready prompt is specific, scoped, and structured.",
        },
        {
          level: 1,
          text: "Prompt 3 should include all sections from the template: context, task, constraints, and output format.",
        },
      ],
      3: [
        { level: 0, text: "Explain what improved between each version." },
        {
          level: 1,
          text: "In the Reflection section, describe how added context and constraints make the prompt more effective.",
        },
      ],
      4: [
        {
          level: 0,
          text: "Your prompts should be detailed — short one-liners won't pass.",
        },
        {
          level: 1,
          text: "The total content must be at least 200 characters — write real, thoughtful prompts.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 4. lesson-ai-verification — Verify AI output before acceptance
  // -----------------------------------------------------------------------
  {
    id: "lab-ai-verification",
    lessonId: "lesson-ai-verification",
    title: "Verify and Fix AI-Generated Code",
    description:
      "Review a piece of AI-generated code that contains subtle bugs and security issues. Document each problem found, fix the code, and write a verification checklist.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "review/ai-generated.ts",
        content:
          "// AI-generated code — review carefully before accepting\n\nexport function parseUserInput(input: any): { name: string; age: number } {\n  const parsed = JSON.parse(input);\n  return { name: parsed.name, age: parsed.age };\n}\n\nexport function buildQuery(table: string, id: string): string {\n  return `SELECT * FROM ${table} WHERE id = '${id}'`;\n}\n\nexport function readConfig(path: string) {\n  const fs = require('fs');\n  return eval(fs.readFileSync(path, 'utf-8'));\n}\n",
      },
      {
        path: "review/checklist.md",
        content:
          "# AI Code Verification Checklist\n\n## Issues Found\n\n## Fixes Applied\n\n## Verification Steps\n- [ ] No use of `any`\n- [ ] No SQL injection\n- [ ] No `eval()`\n- [ ] Input validation present\n",
      },
      {
        path: "review/fixed.ts",
        content: "// Write your fixed version of the AI-generated code here\n",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "review/checklist.md",
        pattern: "[Ss]QL injection|injection",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "review/checklist.md",
        pattern: "eval|[Ee]val",
        isRegex: true,
      },
      {
        kind: "code-behavior",
        requiredPatterns: ["function parseUserInput", "function buildQuery"],
        forbiddenPatterns: ["eval(", ": any)", "${table}", "${id}"],
      },
      {
        kind: "content-match",
        path: "review/fixed.ts",
        pattern: "function parseUserInput",
        isRegex: false,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Look at each function — are there any security vulnerabilities?",
        },
        {
          level: 1,
          text: "The `buildQuery` function is vulnerable to SQL injection via string interpolation.",
        },
      ],
      1: [
        {
          level: 0,
          text: "Using `eval()` on file contents is extremely dangerous.",
        },
        {
          level: 1,
          text: "Replace `eval(...)` with `JSON.parse(...)` in the `readConfig` function.",
        },
      ],
      2: [
        {
          level: 0,
          text: "Write the fixed versions in fixed.ts without the dangerous patterns.",
        },
        {
          level: 1,
          text: "Use parameterized queries instead of template literals, remove `eval`, and replace `any` with proper types.",
        },
      ],
      3: [
        { level: 0, text: "Document what you found in the checklist." },
        {
          level: 1,
          text: "Under Issues Found, list: SQL injection in buildQuery, eval in readConfig, any type in parseUserInput.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 5. lesson-git-workflow-advanced — Branches, atomic commits, diffs, PRs
  // -----------------------------------------------------------------------
  {
    id: "lab-git-workflow-advanced",
    lessonId: "lesson-git-workflow-advanced",
    title: "Create a Pull Request Workflow",
    description:
      "Simulate a feature branch workflow: create a branch plan, make atomic commits with descriptive messages, write a diff summary, and compose a pull request description.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "pr-workflow/src/utils.ts",
        content:
          "export function add(a: number, b: number): number {\n  return a + b;\n}\n",
      },
      {
        path: "pr-workflow/src/utils.test.ts",
        content:
          'import { add } from "./utils";\n\nconsole.log("add(2, 3):", add(2, 3), "expected: 5");\n',
      },
      {
        path: "pr-workflow/PR.md",
        content:
          "# Pull Request\n\n## Branch Name\n\n## Summary\n\n## Changes\n\n## Commit Messages\n\n## Testing\n",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "pr-workflow/PR.md",
        pattern: "## Branch Name",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "pr-workflow/PR.md",
        pattern: "feature/|fix/|chore/",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "pr-workflow/PR.md",
        pattern: "## Commit Messages",
        isRegex: false,
      },
      {
        kind: "file-presence",
        path: "pr-workflow/src/utils.ts",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "pr-workflow/PR.md",
        pattern: "## Testing",
        isRegex: false,
      },
    ],
    hints: {
      0: [
        { level: 0, text: "Start by choosing a descriptive branch name." },
        {
          level: 1,
          text: "Under Branch Name, write something like `feature/add-multiply-function`.",
        },
      ],
      1: [
        {
          level: 0,
          text: "Use a branch naming convention — feature/, fix/, or chore/.",
        },
        {
          level: 1,
          text: "Branch names should start with `feature/`, `fix/`, or `chore/` followed by a short description.",
        },
      ],
      2: [
        {
          level: 0,
          text: "Break your work into small, atomic commit messages.",
        },
        {
          level: 1,
          text: "Under Commit Messages, list commits like 'Add multiply function' and 'Add tests for multiply'.",
        },
      ],
      3: [
        {
          level: 0,
          text: "Do not delete the source files — a real PR adds to existing code.",
        },
        {
          level: 1,
          text: "Keep `pr-workflow/src/utils.ts` with your additions.",
        },
      ],
      4: [
        { level: 0, text: "Describe how the changes were tested." },
        {
          level: 1,
          text: "Under Testing, write what you ran to verify the changes work.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 6. lesson-automated-testing — Write unit/integration tests with Vitest
  // -----------------------------------------------------------------------
  {
    id: "lab-automated-testing",
    lessonId: "lesson-automated-testing",
    title: "Write Unit Tests with Vitest",
    description:
      "Write unit tests for a string utility module. Cover the happy path, edge cases, and boundary conditions. All tests must use proper Vitest assertions.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "testing-lab/src/string-utils.ts",
        content:
          'export function capitalize(str: string): string {\n  if (!str) return "";\n  return str.charAt(0).toUpperCase() + str.slice(1);\n}\n\nexport function truncate(str: string, maxLength: number): string {\n  if (str.length <= maxLength) return str;\n  return str.slice(0, maxLength) + "...";\n}\n\nexport function slugify(str: string): string {\n  return str\n    .toLowerCase()\n    .trim()\n    .replace(/[^a-z0-9]+/g, "-")\n    .replace(/^-|-$/g, "");\n}\n',
      },
      {
        path: "testing-lab/src/string-utils.test.ts",
        content:
          '// Write your Vitest tests here\nimport { describe, it, expect } from "vitest";\nimport { capitalize, truncate, slugify } from "./string-utils";\n\n// TODO: Add describe blocks and test cases for each function\n// Cover: happy path, empty strings, edge cases\n',
      },
      {
        path: "testing-lab/vitest.config.ts",
        content:
          'import { defineConfig } from "vitest/config";\n\nexport default defineConfig({\n  test: {\n    include: ["src/**/*.test.ts"],\n  },\n});\n',
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "testing-lab/src/string-utils.test.ts",
        pattern: "describe",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "testing-lab/src/string-utils.test.ts",
        pattern: "expect\\(",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "testing-lab/src/string-utils.test.ts",
        pattern: "it\\(|test\\(",
        isRegex: true,
      },
      {
        kind: "code-behavior",
        requiredPatterns: [
          "describe",
          "expect",
          "capitalize",
          "truncate",
          "slugify",
        ],
        forbiddenPatterns: ["console.log"],
      },
      {
        kind: "test-pass",
        command: "npx vitest run",
        minPassing: 3,
        maxFailing: 0,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Group related tests inside a `describe` block for each function.",
        },
        {
          level: 1,
          text: 'Start with `describe("capitalize", () => { ... })` and add `it(...)` blocks inside.',
        },
      ],
      1: [
        {
          level: 0,
          text: "Use `expect(...).toBe(...)` for value comparisons.",
        },
        {
          level: 1,
          text: 'Write `expect(capitalize("hello")).toBe("Hello")` to test the happy path.',
        },
      ],
      2: [
        { level: 0, text: "Each function should have at least one test." },
        {
          level: 1,
          text: "Add `it(...)` or `test(...)` blocks for capitalize, truncate, and slugify.",
        },
      ],
      3: [
        {
          level: 0,
          text: "Use proper assertions — avoid console.log for test verification.",
        },
        {
          level: 1,
          text: "Replace any `console.log` checks with `expect(...).toBe(...)` or `.toEqual(...)`.",
        },
      ],
      4: [
        {
          level: 0,
          text: "All tests must pass when run with `npx vitest run`.",
        },
        {
          level: 1,
          text: "Run the tests to verify — at least 3 tests must pass with 0 failures.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 7. lesson-ci-cd — Build GitHub Actions workflows
  // -----------------------------------------------------------------------
  {
    id: "lab-ci-cd",
    lessonId: "lesson-ci-cd",
    title: "Build a GitHub Actions CI Pipeline",
    description:
      "Create a GitHub Actions workflow that checks out code, installs dependencies, runs lint, and runs tests. The workflow should trigger on push to main and on pull requests.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "ci-project/package.json",
        content:
          '{\n  "name": "ci-project",\n  "version": "1.0.0",\n  "scripts": {\n    "lint": "eslint src/",\n    "test": "vitest run"\n  }\n}\n',
      },
      {
        path: "ci-project/src/index.ts",
        content:
          "export function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n",
      },
      {
        path: "ci-project/README.md",
        content:
          "# CI Project\n\nThis project needs a CI pipeline.\n\n## Requirements\n- Run lint on every push\n- Run tests on every PR\n- Use Node.js 20\n",
      },
    ],
    rules: [
      {
        kind: "file-presence",
        path: "ci-project/.github/workflows/ci.yml",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "ci-project/.github/workflows/ci.yml",
        pattern: "on:",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "ci-project/.github/workflows/ci.yml",
        pattern: "actions/checkout",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "ci-project/.github/workflows/ci.yml",
        pattern: "npm (run lint|run test|ci|install)",
        isRegex: true,
      },
      {
        kind: "directory-structure",
        paths: ["ci-project/.github/workflows"],
        shouldExist: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "GitHub Actions workflows live in `.github/workflows/`.",
        },
        {
          level: 1,
          text: "Create `ci-project/.github/workflows/ci.yml` with a valid workflow structure.",
        },
      ],
      1: [
        { level: 0, text: "Every workflow needs an `on:` trigger section." },
        {
          level: 1,
          text: "Add `on: { push: { branches: [main] }, pull_request: {} }` to trigger on push and PRs.",
        },
      ],
      2: [
        { level: 0, text: "Use the official checkout action to get the code." },
        { level: 1, text: "Add a step: `- uses: actions/checkout@v4`." },
      ],
      3: [
        {
          level: 0,
          text: "The pipeline should run your project's lint and test scripts.",
        },
        {
          level: 1,
          text: "Add steps for `npm ci`, `npm run lint`, and `npm run test`.",
        },
      ],
      4: [
        {
          level: 0,
          text: "Workflows are YAML — check that the directory structure is correct.",
        },
        {
          level: 1,
          text: "The file must be at `.github/workflows/ci.yml` inside `ci-project/`.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 8. lesson-refactoring — Extract duplicated logic, rename for clarity
  // -----------------------------------------------------------------------
  {
    id: "lab-refactoring",
    lessonId: "lesson-refactoring",
    title: "Extract and Clean Up Duplicated Code",
    description:
      "A module has duplicated validation logic across three functions. Extract the common pattern into a shared helper, rename unclear variables, and ensure the behavior stays the same.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "refactor-lab/src/handlers.ts",
        content:
          'export function createUser(d: any) {\n  if (!d) throw new Error("missing");\n  if (typeof d.name !== "string") throw new Error("bad name");\n  if (d.name.length < 1 || d.name.length > 100) throw new Error("name length");\n  return { id: 1, name: d.name };\n}\n\nexport function updateUser(d: any) {\n  if (!d) throw new Error("missing");\n  if (typeof d.name !== "string") throw new Error("bad name");\n  if (d.name.length < 1 || d.name.length > 100) throw new Error("name length");\n  return { id: d.id, name: d.name };\n}\n\nexport function createTeam(d: any) {\n  if (!d) throw new Error("missing");\n  if (typeof d.name !== "string") throw new Error("bad name");\n  if (d.name.length < 1 || d.name.length > 100) throw new Error("name length");\n  return { id: 1, name: d.name, members: [] };\n}\n',
      },
      {
        path: "refactor-lab/src/validators.ts",
        content: "// Extract shared validation logic here\n",
      },
      {
        path: "refactor-lab/REFACTOR-LOG.md",
        content:
          "# Refactoring Log\n\n## What was duplicated\n\n## What I extracted\n\n## Renames applied\n",
      },
    ],
    rules: [
      {
        kind: "file-presence",
        path: "refactor-lab/src/validators.ts",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "refactor-lab/src/validators.ts",
        pattern: "export function|export const",
        isRegex: true,
      },
      {
        kind: "code-behavior",
        requiredPatterns: ["import", "validators"],
        forbiddenPatterns: [": any"],
      },
      {
        kind: "content-match",
        path: "refactor-lab/REFACTOR-LOG.md",
        pattern: "[Dd]uplicate|[Ee]xtract|[Rr]ename",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "Look for the code that is copy-pasted across all three functions.",
        },
        {
          level: 1,
          text: "The null check, type check, and length check for `name` are repeated in every function.",
        },
      ],
      1: [
        {
          level: 0,
          text: "Move the repeated pattern into a shared function in validators.ts.",
        },
        {
          level: 1,
          text: "Create `export function validateName(data: unknown)` in validators.ts that throws on invalid input.",
        },
      ],
      2: [
        {
          level: 0,
          text: "Replace the duplicated code in handlers.ts with a call to the shared function.",
        },
        {
          level: 1,
          text: 'Add `import { validateName } from "./validators"` and call `validateName(data)` in each handler.',
        },
      ],
      3: [
        {
          level: 0,
          text: "Document what you changed and why in the refactoring log.",
        },
        {
          level: 1,
          text: "Describe the duplication, what you extracted, and any variable renames you applied.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 9. lesson-technical-documentation — READMEs, inline comments, PR descriptions
  // -----------------------------------------------------------------------
  {
    id: "lab-technical-documentation",
    lessonId: "lesson-technical-documentation",
    title: "Write Complete Project Documentation",
    description:
      "Write a README with setup instructions, add inline code comments to an undocumented module, and compose a pull request description for a hypothetical feature.",
    difficulty: 3,
    scaffoldingLevel: "goal-driven",
    maxResets: 0,
    initialFiles: [
      {
        path: "docs-lab/src/auth.ts",
        content:
          'import crypto from "crypto";\n\nconst SALT_LENGTH = 16;\nconst KEY_LENGTH = 64;\nconst ITERATIONS = 100000;\nconst DIGEST = "sha512";\n\nexport function hashPassword(password: string): string {\n  const salt = crypto.randomBytes(SALT_LENGTH).toString("hex");\n  const hash = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");\n  return `${salt}:${hash}`;\n}\n\nexport function verifyPassword(password: string, stored: string): boolean {\n  const [salt, hash] = stored.split(":");\n  const candidate = crypto.pbkdf2Sync(password, salt, ITERATIONS, KEY_LENGTH, DIGEST).toString("hex");\n  return crypto.timingSafeEqual(Buffer.from(hash), Buffer.from(candidate));\n}\n',
      },
      {
        path: "docs-lab/README.md",
        content:
          "# Project Name\n\n## Overview\n\n## Setup\n\n## Usage\n\n## Scripts\n",
      },
      {
        path: "docs-lab/PR-DESCRIPTION.md",
        content:
          "# Pull Request: Add Auth Module\n\n## Summary\n\n## Changes\n\n## How to Test\n\n## Checklist\n- [ ] Tests pass\n- [ ] Docs updated\n",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "docs-lab/README.md",
        pattern: "## Setup",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "docs-lab/README.md",
        pattern: "npm|install|clone",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "docs-lab/src/auth.ts",
        pattern: "//.*[a-zA-Z]{5,}",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "docs-lab/PR-DESCRIPTION.md",
        pattern: "## Summary",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "docs-lab/PR-DESCRIPTION.md",
        pattern: ".{50,}",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "The README needs real content under the Setup heading.",
        },
        {
          level: 1,
          text: "Add setup instructions like `npm install` and `npm run build` under the Setup section.",
        },
      ],
      1: [
        {
          level: 0,
          text: "The README should mention how to install or get started.",
        },
        {
          level: 1,
          text: "Include a `git clone` command, `npm install`, and basic usage instructions.",
        },
      ],
      2: [
        {
          level: 0,
          text: "The auth module has no comments — add inline comments explaining what each function does.",
        },
        {
          level: 1,
          text: "Add a comment above `hashPassword` explaining it generates a salt and hashes with PBKDF2.",
        },
      ],
      3: [
        {
          level: 0,
          text: "The PR description needs a real summary of the changes.",
        },
        {
          level: 1,
          text: "Under Summary, describe what the auth module does and why it was added.",
        },
      ],
      4: [
        {
          level: 0,
          text: "PR descriptions should be detailed — at least a few sentences.",
        },
        {
          level: 1,
          text: "The description must be at least 50 characters — explain the feature, changes, and test plan.",
        },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Lookup map — Phase 3 labs grouped by lesson ID
// ---------------------------------------------------------------------------

export const phase3LabsByLesson: Record<string, Phase3LabTemplate[]> = {};
for (const lab of phase3LabTemplates) {
  (phase3LabsByLesson[lab.lessonId] ??= []).push(lab);
}

// ---------------------------------------------------------------------------
// Phase 4 lab templates — 4 capstone labs (one per lesson)
// ---------------------------------------------------------------------------

export type Phase4LabTemplate = LabTemplate & { lessonId: string };

export const phase4LabTemplates: Phase4LabTemplate[] = [
  // -----------------------------------------------------------------------
  // 1. lesson-cli-build — Build CLI utility independently
  // -----------------------------------------------------------------------
  {
    id: "lab-cli-build",
    lessonId: "lesson-cli-build",
    title: "Build a CLI Utility from Scratch",
    description:
      "You receive a brief: build a Node.js command-line utility that processes text files. The tool should accept arguments, read/write files, display help text, and include tests. Ship a working, documented CLI.",
    difficulty: 4,
    scaffoldingLevel: "ticket-style",
    maxResets: 0,
    initialFiles: [
      {
        path: "cli-tool/package.json",
        content:
          '{\n  "name": "text-tool",\n  "version": "0.1.0",\n  "description": "",\n  "main": "src/index.js",\n  "bin": {\n    "text-tool": "src/index.js"\n  },\n  "scripts": {\n    "start": "node src/index.js",\n    "test": "node --test test/"\n  },\n  "keywords": [],\n  "license": "MIT"\n}\n',
      },
      {
        path: "cli-tool/src/index.js",
        content:
          '#!/usr/bin/env node\n\n// Entry point — parse arguments and dispatch commands\n\nconst args = process.argv.slice(2);\n\nif (args.length === 0) {\n  console.log("Usage: text-tool <command> [options]");\n  process.exit(1);\n}\n\n// TODO: implement argument parsing, help flag, and file commands\n',
      },
      {
        path: "cli-tool/src/file-io.js",
        content:
          '// File I/O helpers — reading and writing text files\n\nconst fs = require("fs");\nconst path = require("path");\n\n// TODO: implement readTextFile, writeTextFile, and listFiles\n',
      },
      {
        path: "cli-tool/test/.gitkeep",
        content: "",
      },
      {
        path: "cli-tool/README.md",
        content:
          "# text-tool\n\n> A CLI utility for processing text files.\n\n## Installation\n\n## Usage\n\n## Commands\n\n## Examples\n",
      },
    ],
    rules: [
      {
        kind: "file-presence",
        path: "cli-tool/package.json",
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "cli-tool/src/index.js",
        pattern: "--help|help|-h",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "cli-tool/src/file-io.js",
        pattern: "readFile|readFileSync|fs\\.promises",
        isRegex: true,
      },
      {
        kind: "test-pass",
        command: "node --test test/",
        minPassing: 3,
        maxFailing: 0,
      },
      {
        kind: "content-match",
        path: "cli-tool/README.md",
        pattern: "## Usage[\\s\\S]{20,}",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "The project needs a valid package.json with the right entry point.",
        },
        {
          level: 1,
          text: "Check that `main` and `bin` both reference your entry file.",
        },
      ],
      1: [
        {
          level: 0,
          text: "Users expect a --help flag to explain available commands.",
        },
        {
          level: 1,
          text: "Check process.argv for `--help` or `-h` and print usage info.",
        },
      ],
      2: [
        {
          level: 0,
          text: "The file I/O module needs to actually read and write files.",
        },
        {
          level: 1,
          text: "Use `fs.readFileSync` or `fs.promises.readFile` to implement the helpers.",
        },
      ],
      3: [
        {
          level: 0,
          text: "A shipping CLI needs tests — at least for the core commands.",
        },
        {
          level: 1,
          text: "Write test files in `test/` using Node's built-in test runner.",
        },
      ],
      4: [
        {
          level: 0,
          text: "The README should explain how to use the tool, not just list section headers.",
        },
        {
          level: 1,
          text: "Fill in the Usage section with actual command examples and flags.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 2. lesson-crud-app — Build full-stack CRUD from requirements
  // -----------------------------------------------------------------------
  {
    id: "lab-crud-app",
    lessonId: "lesson-crud-app",
    title: "Build a Full-Stack CRUD Application",
    description:
      "You receive a product brief: build a task manager with create, read, update, and delete operations. Implement the data layer, route handlers, error handling, and tests. Deliver a working application.",
    difficulty: 4,
    scaffoldingLevel: "ticket-style",
    maxResets: 0,
    initialFiles: [
      {
        path: "crud-app/package.json",
        content:
          '{\n  "name": "task-manager",\n  "version": "0.1.0",\n  "description": "A simple task manager with CRUD operations",\n  "main": "src/server.js",\n  "scripts": {\n    "start": "node src/server.js",\n    "test": "node --test test/"\n  },\n  "keywords": [],\n  "license": "MIT"\n}\n',
      },
      {
        path: "crud-app/src/server.js",
        content:
          '// Server entry point — wire up routes and start listening\n\nconst http = require("http");\n\nconst PORT = process.env.PORT || 3000;\n\n// TODO: create HTTP server, define routes, listen on PORT\n\nconsole.log(`Server starting on port ${PORT}...`);\n',
      },
      {
        path: "crud-app/src/data-store.js",
        content:
          "// In-memory data store for tasks\n\n/** @type {{ id: number, title: string, done: boolean }[]} */\nlet tasks = [];\nlet nextId = 1;\n\n// TODO: implement create, getAll, getById, update, remove\n\nmodule.exports = { tasks };\n",
      },
      {
        path: "crud-app/src/routes.js",
        content:
          "// Route handlers — map HTTP methods and paths to data operations\n\n// TODO: implement handlers for:\n// POST   /tasks       — create a task\n// GET    /tasks       — list all tasks\n// GET    /tasks/:id   — get one task\n// PUT    /tasks/:id   — update a task\n// DELETE /tasks/:id   — delete a task\n\nmodule.exports = {};\n",
      },
      {
        path: "crud-app/test/.gitkeep",
        content: "",
      },
      {
        path: "crud-app/README.md",
        content:
          "# Task Manager\n\n> CRUD task manager API.\n\n## Setup\n\n## API Endpoints\n\n## Error Handling\n",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "crud-app/src/routes.js",
        pattern: "POST|GET|PUT|DELETE",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "crud-app/src/data-store.js",
        pattern: "function (create|add|getAll|getById|update|remove|delete)",
        isRegex: true,
      },
      {
        kind: "code-behavior",
        requiredPatterns: ["try", "catch", "error", "status"],
        forbiddenPatterns: [],
      },
      {
        kind: "test-pass",
        command: "node --test test/",
        minPassing: 4,
        maxFailing: 0,
      },
      {
        kind: "content-match",
        path: "crud-app/README.md",
        pattern: "## API Endpoints[\\s\\S]{30,}",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "The routes module should handle standard HTTP methods for a resource.",
        },
        {
          level: 1,
          text: "Parse the request method and URL to dispatch to the right handler.",
        },
      ],
      1: [
        {
          level: 0,
          text: "The data store needs functions to manage the task collection.",
        },
        {
          level: 1,
          text: "Export functions like `create(title)`, `getAll()`, `update(id, data)`, `remove(id)`.",
        },
      ],
      2: [
        {
          level: 0,
          text: "Production APIs handle errors gracefully and return proper status codes.",
        },
        {
          level: 1,
          text: "Wrap handler logic in try/catch and return 400 or 404 with error messages.",
        },
      ],
      3: [
        {
          level: 0,
          text: "Test each CRUD operation — create, read, update, and delete.",
        },
        {
          level: 1,
          text: "Write tests that call data-store functions and assert the results.",
        },
      ],
      4: [
        {
          level: 0,
          text: "The README should document every endpoint with method, path, and expected behavior.",
        },
        {
          level: 1,
          text: "List each route with its HTTP method, request body shape, and response format.",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 3. lesson-debugging-case-study — Investigate broken app, document root cause
  // -----------------------------------------------------------------------
  {
    id: "lab-debugging-case-study",
    lessonId: "lesson-debugging-case-study",
    title: "Investigate and Fix a Broken Application",
    description:
      "You receive a bug report: the application crashes on startup and produces wrong output for certain inputs. Investigate the codebase, identify the root causes, fix the bugs, and write a ROOT-CAUSE.md analysis documenting your findings.",
    difficulty: 4,
    scaffoldingLevel: "ticket-style",
    maxResets: 0,
    initialFiles: [
      {
        path: "broken-app/package.json",
        content:
          '{\n  "name": "report-generator",\n  "version": "1.0.0",\n  "description": "Generates formatted reports from CSV data",\n  "main": "src/index.js",\n  "scripts": {\n    "start": "node src/index.js",\n    "test": "node --test test/"\n  }\n}\n',
      },
      {
        path: "broken-app/src/index.js",
        content:
          '// Report generator entry point\n\nconst { parseCSV } = require("./parser");\nconst { formatReport } = require("./formatter");\nconst fs = require("fs");\n\nconst inputFile = process.argv[2] || "data/input.csv";\n\ntry {\n  const raw = fs.readFileSyn(inputFile, "utf8"); // Bug 1: typo in method name\n  const records = parseCSV(raw);\n  const report = formatReport(records);\n  console.log(report);\n} catch (err) {\n  console.error("Failed:", err.mesage); // Bug 2: typo in property name\n  process.exit(1);\n}\n',
      },
      {
        path: "broken-app/src/parser.js",
        content:
          '// CSV parser — converts raw CSV text to an array of objects\n\nfunction parseCSV(text) {\n  const lines = text.split("\\n").filter(Boolean);\n  const headers = lines[0].split(",");\n  const records = [];\n  for (let i = 1; i <= lines.length; i++) { // Bug 3: off-by-one (should be < not <=)\n    const values = lines[i].split(",");\n    const record = {};\n    headers.forEach((h, idx) => {\n      record[h.trim()] = values[idx]?.trim() ?? "";\n    });\n    records.push(record);\n  }\n  return records;\n}\n\nmodule.exports = { parseCSV };\n',
      },
      {
        path: "broken-app/src/formatter.js",
        content:
          '// Report formatter — converts records to a readable report\n\nfunction formatReport(records) {\n  let output = "=== Report ===\\n\\n";\n  for (const rec of records) {\n    const keys = Object.keys(rec);\n    for (const key of keys) {\n      output += `${key}: ${rec[key]}\\n`;\n    }\n    output += "---\\n";\n  }\n  output += `\\nTotal records: ${records.lenght}\\n`; // Bug 4: typo in property name\n  return output;\n}\n\nmodule.exports = { formatReport };\n',
      },
      {
        path: "broken-app/data/input.csv",
        content:
          "name,role,department\nAlice,Engineer,Platform\nBob,Designer,Product\nCarol,Manager,Engineering\n",
      },
      {
        path: "broken-app/ROOT-CAUSE.md",
        content:
          "# Root Cause Analysis\n\n## Bug Report\nThe report generator crashes on startup and produces incorrect output.\n\n## Investigation\n\n## Root Causes\n\n## Fixes Applied\n\n## Lessons Learned\n",
      },
      {
        path: "broken-app/test/.gitkeep",
        content: "",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "broken-app/src/index.js",
        pattern: "readFileSync",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "broken-app/src/parser.js",
        pattern: "i < lines.length",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "broken-app/src/formatter.js",
        pattern: "records.length",
        isRegex: false,
      },
      {
        kind: "content-match",
        path: "broken-app/ROOT-CAUSE.md",
        pattern: "## Root Causes[\\s\\S]{50,}",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "broken-app/ROOT-CAUSE.md",
        pattern: "[Tt]ypo|[Oo]ff.by.one|[Bb]oundary|[Mm]isspell",
        isRegex: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "The app crashes before it can read any data — look at the first I/O call.",
        },
        {
          level: 1,
          text: "Check the method name used to read the file in index.js.",
        },
      ],
      1: [
        {
          level: 0,
          text: "The parser processes too many lines — check loop bounds.",
        },
        {
          level: 1,
          text: "Look at the loop condition — does it read past the last line?",
        },
      ],
      2: [
        {
          level: 0,
          text: "The report total is wrong — check the property access.",
        },
        {
          level: 1,
          text: "Look for misspelled property names in formatter.js.",
        },
      ],
      3: [
        {
          level: 0,
          text: "Document each bug you found, what caused it, and how you fixed it.",
        },
        {
          level: 1,
          text: "The Root Causes section should describe each defect with enough detail to prevent recurrence.",
        },
      ],
      4: [
        {
          level: 0,
          text: "Name the specific class of error — typo, off-by-one, etc.",
        },
        {
          level: 1,
          text: "Categorize each bug (e.g., 'method name typo', 'loop boundary error').",
        },
      ],
    },
  },

  // -----------------------------------------------------------------------
  // 4. lesson-portfolio-capstone — Package projects as professional deliverables
  // -----------------------------------------------------------------------
  {
    id: "lab-portfolio-capstone",
    lessonId: "lesson-portfolio-capstone",
    title: "Package Projects as a Professional Portfolio",
    description:
      "You have completed several projects. Now package them into a professional portfolio: write a top-level README, add deployment or setup documentation for each project, organize the directory structure cleanly, and ensure every deliverable is presentation-ready.",
    difficulty: 4,
    scaffoldingLevel: "ticket-style",
    maxResets: 0,
    initialFiles: [
      {
        path: "portfolio/README.md",
        content: "# My Portfolio\n\n## Projects\n\n## About Me\n\n## Contact\n",
      },
      {
        path: "portfolio/projects/cli-tool/README.md",
        content:
          "# CLI Tool\n\nA command-line utility built during the capstone phase.\n\n## Quick Start\n\n## Features\n\n## Lessons Learned\n",
      },
      {
        path: "portfolio/projects/crud-app/README.md",
        content:
          "# Task Manager API\n\nA CRUD application built during the capstone phase.\n\n## Quick Start\n\n## API Reference\n\n## Architecture Decisions\n",
      },
      {
        path: "portfolio/projects/crud-app/src/server.js",
        content:
          '// Placeholder server — learner should ensure this is a working reference\nconst http = require("http");\nhttp.createServer((req, res) => {\n  res.writeHead(200);\n  res.end("Task Manager API");\n}).listen(3000);\n',
      },
      {
        path: "portfolio/docs/DEPLOYMENT.md",
        content:
          "# Deployment Guide\n\n## Prerequisites\n\n## Steps\n\n## Environment Variables\n\n## Troubleshooting\n",
      },
      {
        path: "portfolio/docs/SETUP.md",
        content:
          "# Local Setup Guide\n\n## Requirements\n\n## Installation\n\n## Running Locally\n\n## Running Tests\n",
      },
    ],
    rules: [
      {
        kind: "content-match",
        path: "portfolio/README.md",
        pattern: "## Projects[\\s\\S]{50,}",
        isRegex: true,
      },
      {
        kind: "directory-structure",
        paths: [
          "portfolio/projects/cli-tool",
          "portfolio/projects/crud-app",
          "portfolio/docs",
        ],
        shouldExist: true,
      },
      {
        kind: "content-match",
        path: "portfolio/docs/DEPLOYMENT.md",
        pattern: "## Steps[\\s\\S]{30,}",
        isRegex: true,
      },
      {
        kind: "content-match",
        path: "portfolio/docs/SETUP.md",
        pattern: "## Installation[\\s\\S]{30,}",
        isRegex: true,
      },
      {
        kind: "file-presence",
        path: "portfolio/projects/cli-tool/README.md",
        shouldExist: true,
      },
    ],
    hints: {
      0: [
        {
          level: 0,
          text: "The portfolio README should describe each project — not just list names.",
        },
        {
          level: 1,
          text: "Under Projects, write a short paragraph about each project with a link to its directory.",
        },
      ],
      1: [
        {
          level: 0,
          text: "A professional portfolio has a clear, navigable structure.",
        },
        {
          level: 1,
          text: "Keep projects in their own directories with individual READMEs.",
        },
      ],
      2: [
        {
          level: 0,
          text: "Deployment docs should have real, actionable steps.",
        },
        {
          level: 1,
          text: "Fill in the Steps section with commands a reader can follow to deploy.",
        },
      ],
      3: [
        {
          level: 0,
          text: "Setup docs should cover everything someone needs to run the projects locally.",
        },
        {
          level: 1,
          text: "Include Node.js version, install commands, and how to start and test.",
        },
      ],
      4: [
        {
          level: 0,
          text: "Every project should have its own README with enough context to evaluate.",
        },
        {
          level: 1,
          text: "Each project README should explain what it does, how to run it, and what you learned.",
        },
      ],
    },
  },
];

// ---------------------------------------------------------------------------
// Lookup map — Phase 4 labs grouped by lesson ID
// ---------------------------------------------------------------------------

export const phase4LabsByLesson: Record<string, Phase4LabTemplate[]> = {};
for (const lab of phase4LabTemplates) {
  (phase4LabsByLesson[lab.lessonId] ??= []).push(lab);
}
