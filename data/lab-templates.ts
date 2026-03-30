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
          'export function greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n',
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
        paths: [
          "project/src",
          "project/src/utils",
          "project/.config",
        ],
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
        { level: 0, text: "Use a command to print the current directory path." },
        { level: 1, text: "Run `Get-Location` or `pwd` to see where you are." },
      ],
      1: [
        { level: 0, text: "List everything, including hidden items." },
        { level: 1, text: "Use `Get-ChildItem -Force` to reveal dotfiles and dotfolders." },
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
        content: "# Keyboard Practice\n\nRecord the shortcuts you discover below.\n",
      },
      {
        path: "workspace/app.ts",
        content: "const version = 1;\nconsole.log(`App v${version}`);\n",
      },
      {
        path: "workspace/shortcut-log.md",
        content: "# Shortcut Log\n\n| Action | Shortcut |\n|--------|----------|\n",
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
        { level: 0, text: "Think about the modifier keys you press with letter keys." },
        { level: 1, text: "Add entries like `| Open file | Ctrl+O |` to the log." },
      ],
      1: [
        { level: 0, text: "Each row in the table needs pipes on both sides." },
        { level: 1, text: "Format: `| Save file | Ctrl+S |`" },
      ],
      2: [
        { level: 0, text: "Make sure you haven't deleted the log file." },
        { level: 1, text: "The file must still exist at `workspace/shortcut-log.md`." },
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
        content: "# System Health Report\n\n## OS\n\n## Processes\n\n## Disk\n\n## Memory\n",
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
        { level: 0, text: "Fill in the OS section with your operating system name and version." },
        { level: 1, text: "Run `[System.Environment]::OSVersion` or `Get-ComputerInfo | Select-Object OsName` to find the OS." },
      ],
      1: [
        { level: 0, text: "Include a number with a unit like GB or MB." },
        { level: 1, text: "Use `Get-CimInstance Win32_PhysicalMemory` or `systeminfo` to find memory values." },
      ],
      2: [
        { level: 0, text: "Make sure the Disk section has data below its heading." },
        { level: 1, text: "Run `Get-PSDrive C | Select-Object Used, Free` and note the values." },
      ],
      3: [
        { level: 0, text: "Don't delete the report file!" },
        { level: 1, text: "The file must remain at `reports/health-report.md`." },
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
        { level: 1, text: "Run `New-Item -ItemType Directory -Path sandbox/backup`." },
      ],
      1: [
        { level: 0, text: "Copy the draft into backup before removing it." },
        { level: 1, text: "Use `Copy-Item sandbox/draft-report.txt sandbox/backup/`." },
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
        { level: 0, text: "Search for the filename across the entire project tree." },
        { level: 1, text: "Run `Get-ChildItem -Recurse -Filter app.json` to find all matches." },
      ],
      1: [
        { level: 0, text: "Look at what config.ts expects — it reads from a specific path." },
        { level: 1, text: "The file content must include `ComputeLearn` as the appName." },
      ],
      2: [
        { level: 0, text: "The old copy should no longer be in the archive." },
        { level: 1, text: "Use `Move-Item` instead of `Copy-Item` so the original is removed." },
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
        { level: 1, text: "Create `workspace/cleanup.ps1` with your cleanup logic." },
      ],
      1: [
        { level: 0, text: "Your script should use a command that removes files." },
        { level: 1, text: "Use `Remove-Item` to delete files matching a pattern." },
      ],
      2: [
        { level: 0, text: "Target only files ending in `.tmp`." },
        { level: 1, text: "Use a wildcard like `*.tmp` in your Remove-Item call." },
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
        content: "# TODO: pipe processes.csv through Where-Object and Select-Object\n",
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
        { level: 0, text: "Read the CSV first, then pipe the results through a filter." },
        { level: 1, text: "Start with `Import-Csv lab/processes.csv | Where-Object { ... }`." },
      ],
      1: [
        { level: 0, text: "After filtering rows, narrow down which columns to keep." },
        { level: 1, text: "Pipe into `Select-Object Name, Memory`." },
      ],
      2: [
        { level: 0, text: "The pipe character connects commands together." },
        { level: 1, text: "Chain commands like `Import-Csv ... | Where-Object ... | Select-Object ...`." },
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
        { level: 1, text: "Use `foreach ($file in Get-ChildItem *.txt) { ... }` to iterate." },
      ],
      1: [
        { level: 0, text: "Use a cmdlet that changes a file's name without moving it." },
        { level: 1, text: "`Rename-Item` changes the name in place." },
      ],
      2: [
        { level: 0, text: "Store intermediate values in variables using `$`." },
        { level: 1, text: "Example: `$date = Get-Date -Format 'yyyy-MM-dd'`." },
      ],
      3: [
        { level: 0, text: "Build the new name from the date and the original filename." },
        { level: 1, text: 'Use `"${date}_$($file.Name)"` and pass it to `Rename-Item -NewName`.' },
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
        content: "Install steps:\n1. Download installer\n2. Run as admin\n3. Reboot\n",
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
        { level: 1, text: "Use `foreach ($file in Get-ChildItem -File) { ... }`." },
      ],
      1: [
        { level: 0, text: "Use a cmdlet that relocates a file to a different directory." },
        { level: 1, text: "`Move-Item` moves a file to a new path." },
      ],
      2: [
        { level: 0, text: "Each file object has a property for its extension." },
        { level: 1, text: "Access `$file.Extension` and trim the leading dot with `.TrimStart('.')`." },
      ],
      3: [
        { level: 0, text: "Create the target folder if it doesn't exist yet." },
        { level: 1, text: "Use `New-Item -ItemType Directory -Force` to create the subfolder." },
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
        content:
          "# My Engineering Vault\n\nA place to capture what I learn.\n",
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
        { level: 1, text: "Run `New-Item -ItemType Directory -Path vault/notes`." },
      ],
      1: [
        { level: 0, text: "Link between notes using double-bracket syntax." },
        { level: 1, text: "Write `[[other-note]]` inside one of your notes to create a wiki-link." },
      ],
      2: [
        { level: 0, text: "Add tags so you can find notes by topic later." },
        { level: 1, text: "Add `#powershell` or `#filesystem` at the bottom of your note." },
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
