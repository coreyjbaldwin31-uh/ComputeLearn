export type ValidationMode = "includes" | "exact";

export type AssessmentType = "action" | "reasoning" | "debugging" | "transfer";

export type ScaffoldingLevel = "step-by-step" | "goal-driven" | "ticket-style";

export type CompetencyMasteryLevel =
  | "Aware"
  | "Assisted"
  | "Functional"
  | "Independent";

export type CompetencyTarget = {
  track: string;
  targetLevel: CompetencyMasteryLevel;
};

export type ExitStandardGate = {
  description: string;
  competency: string;
  requiredLevel: CompetencyMasteryLevel;
};

export type ExitStandard = {
  summary: string;
  gates: ExitStandardGate[];
  representativeLabs: string[];
};

export type CodeExercise = {
  id: string;
  title: string;
  description: string;
  starterCode: string;
  language: string;
  hint: string;
  acceptedPatterns: string[];
};

export type Exercise = {
  id: string;
  title: string;
  prompt: string;
  placeholder: string;
  validationMode: ValidationMode;
  acceptedAnswers: string[];
  successMessage: string;
  hint: string;
  assessmentType?: AssessmentType;
};

export type Lesson = {
  id: string;
  title: string;
  summary: string;
  duration: string;
  difficulty: string;
  objective: string;
  explanation: string[];
  demonstration: string[];
  exerciseSteps: string[];
  validationChecks: string[];
  retention: string[];
  tools: string[];
  notesPrompt: string;
  exercises: Exercise[];
  transferTask?: Exercise;
  codeExercises?: CodeExercise[];
  competencies?: CompetencyTarget[];
  scaffoldingLevel?: ScaffoldingLevel;
};

export type Course = {
  id: string;
  title: string;
  focus: string;
  outcome: string;
  lessons: Lesson[];
};

export type Phase = {
  id: string;
  title: string;
  strapline: string;
  purpose: string;
  level: string;
  duration: string;
  environment: string;
  tools: string[];
  guardrails: string[];
  milestones: string[];
  projects: string[];
  courses: Course[];
  competencyFocus?: string[];
  exitStandard?: ExitStandard;
};

export type Curriculum = {
  productTitle: string;
  productVision: string;
  promise: string;
  phases: Phase[];
};

export const curriculum: Curriculum = {
  productTitle: "ComputeLearn",
  productVision:
    "ComputeLearn is a mastery-based engineering learning platform that takes learners from everyday computer use to practical software development competence through guided labs, real debugging, and project-driven progression.",
  promise:
    "Rather than relying on passive lessons, learners work inside controlled, reversible environments where they practice terminal commands, filesystem operations, scripting, coding, debugging, version control, testing, and delivery workflows. Each step builds operational confidence first, programming understanding second, and disciplined engineering execution third.",
  phases: [
    {
      id: "phase-1",
      title: "Computer and Tooling Mastery",
      strapline: "Operate with speed, confidence, and precision.",
      purpose:
        "Build operational fluency and confidence with the OS, terminal, filesystem, automation, and engineering productivity tools.",
      level: "Beginner",
      duration: "4–6 weeks",
      environment:
        "Sandboxed workspace with resettable file trees and guided terminal history",
      tools: [
        "Windows Terminal",
        "PowerShell",
        "PowerToys",
        "File Explorer",
        "Obsidian",
      ],
      guardrails: [
        "Commands run against training directories, never personal folders by default.",
        "Every lab includes reset, replay, and inspect actions.",
        "Unsafe actions are simulated first, then explained before any real execution.",
      ],
      milestones: [
        "Navigate files without getting lost",
        "Use keyboard-driven workflows to reduce friction",
        "Write safe automation scripts",
        "Organize engineering knowledge in a vault",
      ],
      projects: [
        "Create a personal command cheat sheet with saved terminal transcripts",
        "Build a folder automation workflow for recurring tasks",
      ],
      competencyFocus: [
        "SystemNavigation",
        "TerminalOperation",
        "Automation",
        "FileManipulation",
      ],
      exitStandard: {
        summary:
          "The learner can inspect, navigate, create, modify, move, search, and automate within a controlled workspace without getting lost.",
        gates: [
          {
            description:
              "Navigate directories and files without GUI assistance",
            competency: "SystemNavigation",
            requiredLevel: "Functional",
          },
          {
            description: "Write and run basic PowerShell scripts safely",
            competency: "TerminalOperation",
            requiredLevel: "Functional",
          },
          {
            description: "Build a repeatable automation for a common task",
            competency: "Automation",
            requiredLevel: "Assisted",
          },
          {
            description:
              "Create, move, copy, rename, and delete files safely from the terminal",
            competency: "FileManipulation",
            requiredLevel: "Functional",
          },
        ],
        representativeLabs: [
          "Recover a misplaced file using search and path reasoning",
          "Bulk rename files safely in a sandbox",
          "Write a PowerShell script that organizes downloads by extension",
        ],
      },
      courses: [
        {
          id: "course-os-navigation",
          title: "Operating System Fluency",
          focus: "Files, shortcuts, system awareness, and terminal confidence",
          outcome:
            "Learners can navigate Windows efficiently, inspect system state, and work comfortably from both GUI and terminal contexts.",
          lessons: [
            {
              id: "lesson-filesystem",
              title: "Navigate the Filesystem with Intent",
              summary:
                "Understand where things live, how to move through directories quickly, and how to avoid destructive mistakes.",
              duration: "45 min",
              difficulty: "Foundational",
              objective:
                "Move through folders, inspect files, distinguish absolute from relative paths, and reason about the working directory before taking action.",
              explanation: [
                "Every command you run in a terminal executes **relative to a location** called the **working directory**. If you do not know your working directory, you cannot predict what a command will affect. The first habit to build is checking where you are before doing anything else. In PowerShell, the command is `Get-Location` (alias: `pwd`). Run it, read the path, and only then proceed.",
                "Once you know where you are, the next question is: what is here? `Get-ChildItem` (aliases: `dir`, `ls`) lists the files and folders in your current directory. Think of it as looking around the room before rearranging furniture. You will use this command constantly — before creating files, before deleting files, and before running scripts.",
                "To move between directories, use `Set-Location` (alias: `cd`) followed by the folder name. `cd Projects` moves you into a subfolder called Projects. `cd ..` moves you up one level to the **parent directory**. `cd ~` takes you to your **home directory** (e.g., `C:\\Users\\learner`). These three — `cd <folder>` to go deeper, `cd ..` to go up, and `cd ~` to go home — are all you need to navigate any directory tree.",
                "Understand the difference between **absolute paths** and **relative paths**. An **absolute path** starts from the root of the drive and specifies the full location: `C:\\Users\\learner\\Projects\\app`. It works the same no matter where your working directory is. A **relative path** starts from your current working directory: `Projects\\app` means 'the Projects folder inside wherever I am right now.' If you run `cd Projects\\app` from `C:\\Users\\learner`, you end up at `C:\\Users\\learner\\Projects\\app`. If you run it from `C:\\`, it fails because there is no `Projects` folder there. Relative paths are shorter and convenient; absolute paths are unambiguous and safe. Use absolute paths in scripts and configuration files where reliability matters.",
                "The pattern that keeps you safe is: **check, inspect, then act**. Run `Get-Location` to confirm your position, run `Get-ChildItem` to see what is around you, and only then execute commands that create, move, or delete files. This three-step habit prevents the most common terminal mistakes.",
              ],
              demonstration: [
                "Run `Get-Location` to check your starting position:\n```\nPS C:\\Users\\learner> Get-Location\n\nPath\n----\nC:\\Users\\learner\n```\nThis confirms your working directory is `C:\\Users\\learner`. Now run `Get-ChildItem` to see what is here:\n```\nPS C:\\Users\\learner> Get-ChildItem\n\n    Directory: C:\\Users\\learner\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\nd-----         3/15/2026   9:22 AM                Desktop\nd-----         3/15/2026   9:22 AM                Documents\nd-----         3/15/2026   9:22 AM                Projects\n-a----         3/14/2026   2:10 PM            142 README.txt\n-a----         3/14/2026   3:45 PM           1024 notes.txt\n```\nThe output shows directories (marked with `d-----` in the Mode column) and files (marked with `-a----`) along with their last modified time, size in bytes, and name.",
                "Navigate into the Projects folder and confirm the move:\n```\nPS C:\\Users\\learner> cd Projects\nPS C:\\Users\\learner\\Projects> Get-Location\n\nPath\n----\nC:\\Users\\learner\\Projects\n```\nYour working directory changed. Now go back up one level with `cd ..` and confirm:\n```\nPS C:\\Users\\learner\\Projects> cd ..\nPS C:\\Users\\learner> pwd\n\nPath\n----\nC:\\Users\\learner\n```\nYou are back where you started. The `pwd` alias works identically to `Get-Location`.",
                "Compare relative and absolute paths. From `C:\\Users\\learner`, both of these reach the same destination:\n```\nPS C:\\Users\\learner> cd Projects\nPS C:\\Users\\learner\\Projects> pwd\n\nPath\n----\nC:\\Users\\learner\\Projects\n\nPS C:\\Users\\learner\\Projects> cd ~\nPS C:\\Users\\learner> cd C:\\Users\\learner\\Projects\nPS C:\\Users\\learner\\Projects> pwd\n\nPath\n----\nC:\\Users\\learner\\Projects\n```\nThe **relative path** `Projects` resolves from your current location. The **absolute path** `C:\\Users\\learner\\Projects` works from anywhere because it specifies the full route from the drive root. Use `cd ~` to jump home in one step.",
                "What happens when you navigate to a folder that does not exist?\n```\nPS C:\\Users\\learner> cd NonExistentFolder\nSet-Location: Cannot find path 'C:\\Users\\learner\\NonExistentFolder' because it does not exist.\n```\nPowerShell stops and tells you exactly what went wrong. This is why the **check → inspect → move → check again** rhythm matters: run `Get-ChildItem` first to see available folders before attempting to navigate.",
                "Notice the rhythm: **check → inspect → move → check again**. Every navigation step is bookended by a location check. This is not slow — it is precise. Engineers who skip context checks are the ones who accidentally delete files in the wrong directory.",
              ],
              exerciseSteps: [
                "Open the training terminal below and run `Get-Location` (or `pwd`) to confirm your current directory.",
                "Run `Get-ChildItem` (or `dir` or `ls`) to list the contents of the workspace and identify the Projects folder.",
                "Use `cd Projects` to change into the practice directory, then run `cd ..` to move back out without using the mouse.",
              ],
              validationChecks: [
                "User runs `Get-Location` or `pwd` to print the current working directory.",
                "User runs `Get-ChildItem`, `dir`, or `ls` to list directory contents.",
                "User can explain why checking your working directory before running file-changing commands prevents accidental damage.",
              ],
              retention: [
                "Always know where you are before running file-changing commands.",
                "Prefer inspection first, modification second.",
                "Fast navigation comes from repetition, not memorizing a giant command list.",
              ],
              tools: ["Windows Terminal", "PowerShell", "File Explorer"],
              notesPrompt:
                "Write the three commands you want to become muscle memory, and note one mistake this lesson helped you avoid.",
              exercises: [
                {
                  id: "pwd-check",
                  title: "Context check",
                  prompt:
                    "Enter a PowerShell command that shows the current working directory.",
                  placeholder: "Example: Get-...",
                  validationMode: "includes",
                  acceptedAnswers: ["get-location", "pwd"],
                  successMessage:
                    "Correct. The habit to build is checking location before acting.",
                  hint: "In PowerShell, both the full cmdlet and a short alias are common.",
                  assessmentType: "action",
                },
                {
                  id: "list-check",
                  title: "Inspect contents",
                  prompt:
                    "Enter a PowerShell command that lists directory contents.",
                  placeholder: "Example: Get-...",
                  validationMode: "includes",
                  acceptedAnswers: ["get-childitem", "dir", "ls"],
                  successMessage:
                    "Correct. Engineers inspect the terrain before making changes.",
                  hint: "There is a full cmdlet and a couple of short aliases.",
                  assessmentType: "action",
                },
                {
                  id: "cd-check",
                  title: "Change directory",
                  prompt:
                    "What command moves you into a subfolder called Projects?",
                  placeholder: "cd ...",
                  validationMode: "includes",
                  acceptedAnswers: ["cd projects", "set-location projects"],
                  successMessage:
                    "Correct. Deliberate navigation is the foundation of safe terminal use.",
                  hint: "Use cd or Set-Location followed by the folder name.",
                  assessmentType: "action",
                },
                {
                  id: "absolute-vs-relative",
                  title: "Path types",
                  prompt:
                    "Is the path 'C:\\Users\\learner\\Projects' an absolute path or a relative path? Why?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: ["absolute"],
                  successMessage:
                    "Correct. It starts from the drive root (C:\\), making it absolute — it works the same no matter where your working directory is.",
                  hint: "Look at whether the path starts from the root of the drive or from the current directory.",
                  assessmentType: "reasoning",
                },
                {
                  id: "home-directory",
                  title: "Navigate home",
                  prompt:
                    "What shortcut takes you directly to your home directory from anywhere in the filesystem?",
                  placeholder: "cd ...",
                  validationMode: "includes",
                  acceptedAnswers: ["cd ~", "~"],
                  successMessage:
                    "Correct. The tilde (~) is a universal shortcut for your home directory in both PowerShell and Unix shells.",
                  hint: "It uses a special character that represents the home directory.",
                  assessmentType: "action",
                },
              ],
              transferTask: {
                id: "transfer-filesystem-recovery",
                title: "Transfer challenge: recover a misplaced file",
                prompt:
                  "You are in the wrong directory and need to find a misplaced file safely. Describe the command sequence you would use before moving or deleting anything.",
                placeholder: "Describe commands and reasoning",
                validationMode: "includes",
                acceptedAnswers: ["get-location", "dir", "ls", "cd", "inspect"],
                successMessage:
                  "Strong transfer response. You emphasized context checks and inspection before modification.",
                hint: "Mention at least one context check and one inspection command before any file-changing action.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "ce-filesystem-navigate",
                  title: "Navigate and verify",
                  description:
                    "Navigate into the Projects folder and confirm your location by printing the working directory.",
                  starterCode:
                    "# Navigate into the Projects folder, then check your location\n",
                  language: "powershell",
                  hint: "Use cd to change directory, then Get-Location or pwd to confirm.",
                  acceptedPatterns: [
                    "cd Projects",
                    "cd projects",
                    "Set-Location Projects",
                  ],
                },
                {
                  id: "ce-filesystem-list",
                  title: "Inspect directory contents",
                  description:
                    "List all files and folders in the current directory.",
                  starterCode: "# List everything in the current directory\n",
                  language: "powershell",
                  hint: "Use Get-ChildItem, dir, or ls to see what is in the current folder.",
                  acceptedPatterns: ["Get-ChildItem", "dir", "ls"],
                },
              ],
              competencies: [
                { track: "SystemNavigation", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "step-by-step",
            },
            {
              id: "lesson-keyboard-shortcuts",
              title: "Keyboard-First Workflows",
              summary:
                "Learn to operate faster by replacing mouse clicks with keyboard shortcuts across the OS and terminal.",
              duration: "30 min",
              difficulty: "Foundational",
              objective:
                "Identify and use keyboard shortcuts that eliminate friction in daily computer use.",
              explanation: [
                "Speed on a computer is not about typing fast — it is about **reducing the gap between what you want to do and doing it**. Every time you reach for the mouse to switch windows, open a folder, or re-type a command, you lose seconds. Those seconds compound into hours over a week. Keyboard shortcuts let you stay in flow.",
                "The most important OS shortcuts to internalize: `Alt+Tab` switches between open windows instantly. `Win+E` opens **File Explorer** without touching the Start menu. `Ctrl+Shift+Esc` opens **Task Manager** directly — critical when you need to investigate a frozen or slow application. These three shortcuts alone eliminate the majority of mouse-driven OS navigation.",
                "In the terminal, two shortcuts save enormous time. **Up Arrow** recalls your previous command — press it multiple times to scroll back through your command history. **Tab completion** auto-completes file and folder names: start typing a path and press `Tab` to let PowerShell finish it for you. This prevents typos and speeds up navigation dramatically.",
                "Other terminal essentials: `Ctrl+C` cancels a running command (critical when something hangs), and `Ctrl+L` clears the screen without losing your session. Build the habit of using these shortcuts until they feel automatic — that is when the speed gain becomes real.",
              ],
              demonstration: [
                "Try it now: press `Alt+Tab` to switch to another window, then press it again to come back. Open File Explorer with `Win+E`, look at it, then close it with `Alt+F4`. Open Task Manager with `Ctrl+Shift+Esc` — notice it opens directly, no right-clicking the taskbar needed. These three shortcuts eliminate the most common mouse-driven OS navigation.",
                "In the terminal, type `Get-ChildItem` and press Enter. Now press **Up Arrow** once — the command reappears without retyping:\n```\nPS C:\\Users\\learner> Get-ChildItem\n\n    Directory: C:\\Users\\learner\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\nd-----         3/15/2026   9:22 AM                Projects\n-a----         3/14/2026   2:10 PM            142 README.txt\n\nPS C:\\Users\\learner> Get-ChildItem    <-- pressed Up Arrow, then Enter\n```\nThe command ran again without retyping. Press Up Arrow multiple times to scroll back through your entire command history.",
                "Now try **Tab completion**: type `cd Pro` and press Tab. If a folder starting with `Pro` exists, PowerShell auto-completes the name:\n```\nPS C:\\Users\\learner> cd Pro[Tab]\nPS C:\\Users\\learner> cd .\\Projects\\\n```\nTab completion prevents typos and speeds up navigation dramatically. If multiple matches exist, press Tab repeatedly to cycle through them. Finally, press `Ctrl+L` to clear the screen — your session and history are preserved, only the visual clutter is gone.",
              ],
              exerciseSteps: [
                "Practice switching between three windows using `Alt+Tab` — do not touch the mouse.",
                "Open File Explorer with `Win+E`, then close it with `Alt+F4`.",
                "In the training terminal, run a command, then press **Up Arrow** to recall it and run it again.",
              ],
              validationChecks: [
                "User can name `Alt+Tab`, `Win+E`, and `Ctrl+Shift+Esc` and describe what each does.",
                "User demonstrates **Up Arrow** for terminal command recall.",
                "User can explain why keyboard-first habits reduce error rates compared to mouse-driven workflows.",
              ],
              retention: [
                "Alt+Tab is not optional \u2014 it is a core navigation tool.",
                "Terminal command recall (Up Arrow) saves more time than you think.",
                "Every shortcut you learn compounds over thousands of uses.",
              ],
              tools: ["Windows Terminal", "PowerShell", "File Explorer"],
              notesPrompt:
                "List five keyboard shortcuts you plan to use every day. Note which ones feel unnatural \u2014 those need the most practice.",
              exercises: [
                {
                  id: "shortcut-switch",
                  title: "Window switching",
                  prompt:
                    "What keyboard shortcut switches between open windows?",
                  placeholder: "Key combination",
                  validationMode: "includes",
                  acceptedAnswers: ["alt+tab", "alt tab"],
                  successMessage:
                    "Correct. Alt+Tab is the single most used shortcut in professional work.",
                  hint: "It involves the Alt key and another key.",
                  assessmentType: "action",
                },
                {
                  id: "shortcut-explorer",
                  title: "Quick launch",
                  prompt: "What shortcut opens File Explorer instantly?",
                  placeholder: "Key combination",
                  validationMode: "includes",
                  acceptedAnswers: ["win+e", "windows+e"],
                  successMessage:
                    "Correct. Win+E bypasses the Start menu entirely.",
                  hint: "It uses the Windows key combined with a letter.",
                  assessmentType: "action",
                },
                {
                  id: "shortcut-cancel",
                  title: "Cancel a command",
                  prompt:
                    "What keyboard shortcut cancels a running command in the terminal?",
                  placeholder: "Key combination",
                  validationMode: "includes",
                  acceptedAnswers: ["ctrl+c", "ctrl c"],
                  successMessage:
                    "Correct. Ctrl+C is essential for stopping runaway commands or hung processes in the terminal.",
                  hint: "It uses the Ctrl key combined with a letter associated with cancel or copy.",
                  assessmentType: "action",
                },
              ],
              transferTask: {
                id: "transfer-keyboard-workflow",
                title: "Transfer challenge: keyboard-only task",
                prompt:
                  "Describe how you would open a terminal, navigate to a project folder, check Git status, and switch to your editor — using only keyboard shortcuts. List each shortcut.",
                placeholder: "Shortcut sequence",
                validationMode: "includes",
                acceptedAnswers: ["alt+tab", "cd", "git status", "win", "ctrl"],
                successMessage:
                  "Transfer evidence accepted. You mapped a full workflow to keyboard shortcuts.",
                hint: "Walk through the workflow step by step: launch, navigate, command, switch.",
                assessmentType: "transfer",
              },
              competencies: [
                { track: "SystemNavigation", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "step-by-step",
            },
            {
              id: "lesson-system-inspection",
              title: "Understand Your Machine",
              summary:
                "Learn to inspect system state so you can reason about performance, storage, and running processes.",
              duration: "40 min",
              difficulty: "Foundational",
              objective:
                "Check CPU, memory, disk usage, and running processes using both GUI and terminal tools.",
              explanation: [
                "A computer is not a black box — it is a system with measurable state. Engineers check what is running, what is consuming resources, and what is filling storage **before** guessing at problems. When a machine feels slow, you do not restart and hope — you investigate. This lesson gives you the tools to do exactly that.",
                "The GUI starting point is **Task Manager**, which you can open instantly with `Ctrl+Shift+Esc`. It shows every running process, sorted by CPU, memory, disk, or network usage. Click the column headers to sort — the process consuming the most CPU floats to the top. Task Manager is your first stop whenever something feels wrong.",
                "From the terminal, `Get-Process` (alias: `ps`) lists all running processes with their CPU and memory consumption. The output is a table with columns like Handles, NPM (non-paged memory), PM (paged memory), WS (working set), CPU (seconds of processor time), and Id (process identifier). Scan the **CPU** column to spot the heaviest consumers — this is faster than clicking through Task Manager and the output can be used in scripts. In a later lesson, you will learn to sort and filter this output using pipes.",
                "For disk space, `Get-Volume` shows every drive letter with its total size, used space, and **free space remaining**. The output looks like a table with columns for DriveLetter, SizeRemaining, and Size. When your build fails with a disk space error, `Get-Volume` tells you instantly whether storage is the bottleneck.",
              ],
              demonstration: [
                "Open Task Manager with `Ctrl+Shift+Esc` and click the **CPU** column header to sort by usage. Now open the terminal and run `Get-Process` to see the same information as text:\n```\nPS C:\\Users\\learner> Get-Process\n\n NPM(K)    PM(M)      WS(M)     CPU(s)      Id  SI ProcessName\n ------    -----      -----     ------      --  -- -----------\n     12     4.25      14.82       0.17    3412   1 conhost\n     30    52.18      67.45      12.83    7264   1 explorer\n     85   182.40     245.12     142.56    4120   1 msedge\n     15    22.75      35.60       3.42    6892   1 pwsh\n     20    38.90      52.14       8.91    2104   1 SearchHost\n     45    95.30     120.88      45.22    1580   0 svchost\n```\nThe columns show **NPM** (non-paged memory in KB), **PM** (paged memory in MB), **WS** (working set in MB), **CPU** (processor time in seconds), **Id** (process identifier), and **ProcessName**. The terminal version of this data can be saved, searched, and scripted — advantages you do not get from the GUI.",
                "Run `Get-Volume` to check disk space:\n```\nPS C:\\Users\\learner> Get-Volume\n\nDriveLetter FriendlyName FileSystemType DriveType HealthStatus SizeRemaining      Size\n----------- ------------ -------------- --------- ------------ -------------      ----\nC           Windows      NTFS           Fixed     Healthy          85.23 GB 237.88 GB\nD           Data         NTFS           Fixed     Healthy         412.50 GB 476.94 GB\n```\nIf your C: drive shows less than 10 GB under **SizeRemaining**, that is a potential problem worth addressing before it causes build failures or application crashes.",
                "Filter and sort process output to find the top CPU consumers:\n```\nPS C:\\Users\\learner> Get-Process | Sort-Object CPU -Descending | Select-Object -First 5\n\n NPM(K)    PM(M)      WS(M)     CPU(s)      Id  SI ProcessName\n ------    -----      -----     ------      --  -- -----------\n     85   182.40     245.12     142.56    4120   1 msedge\n     45    95.30     120.88      45.22    1580   0 svchost\n     30    52.18      67.45      12.83    7264   1 explorer\n     20    38.90      52.14       8.91    2104   1 SearchHost\n     15    22.75      35.60       3.42    6892   1 pwsh\n```\nThis pipeline sorts all processes by CPU time in descending order and shows only the top 5. You will learn to build these pipeline chains from scratch in a later lesson.",
              ],
              exerciseSteps: [
                "Open the training terminal and run `Get-Process` (or `ps`) to list all running processes.",
                "Scan the `Get-Process` output to identify which process is using the most memory by reading the WS (working set) column.",
                "Run `Get-Volume` to check how much free disk space is available on each drive.",
              ],
              validationChecks: [
                "User runs `Get-Process` or `ps` to list processes from the terminal.",
                "User reads the WS (memory) and CPU columns in the `Get-Process` output and identifies the most resource-intensive process.",
                "User runs `Get-Volume` to check available disk space and can read the output.",
              ],
              retention: [
                "Know your machine before blaming your code.",
                "Task Manager is the first stop for performance investigation.",
                "Get-Process and Get-Volume replace guessing with data.",
              ],
              tools: ["Windows Terminal", "PowerShell", "Task Manager"],
              notesPrompt:
                "Write down the commands to check CPU, memory, and disk space. Note anything surprising you found about your system.",
              exercises: [
                {
                  id: "process-list",
                  title: "List processes",
                  prompt:
                    "Enter a PowerShell command that shows running processes.",
                  placeholder: "Get-...",
                  validationMode: "includes",
                  acceptedAnswers: ["get-process", "ps"],
                  successMessage:
                    "Correct. Knowing what is running is the first step to understanding system behavior.",
                  hint: "The cmdlet name describes exactly what it does \u2014 it gets processes.",
                  assessmentType: "action",
                },
                {
                  id: "disk-space",
                  title: "Check disk space",
                  prompt:
                    "What PowerShell cmdlet shows disk volume information including free space?",
                  placeholder: "Get-...",
                  validationMode: "includes",
                  acceptedAnswers: ["get-volume"],
                  successMessage:
                    "Correct. Get-Volume shows drive letters, sizes, and free space so you can assess storage before it becomes a problem.",
                  hint: "The cmdlet gets information about storage volumes.",
                  assessmentType: "action",
                },
                {
                  id: "high-cpu-reasoning",
                  title: "Investigate high CPU",
                  prompt:
                    "A machine feels slow. You open Task Manager and see one process using 95% CPU. What should you do before killing it?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "identify",
                    "what it is",
                    "name",
                    "research",
                    "check",
                    "look up",
                  ],
                  successMessage:
                    "Correct. Always identify the process first \u2014 it could be a critical system service or an active operation you do not want to interrupt.",
                  hint: "Killing an unknown process can cause data loss or system instability.",
                  assessmentType: "reasoning",
                },
              ],
              transferTask: {
                id: "transfer-system-triage",
                title: "Transfer challenge: diagnose a slow machine",
                prompt:
                  "A colleague says their computer is running slowly. Describe the commands or tools you would use to identify the cause, in the order you would run them.",
                placeholder: "Diagnostic steps",
                validationMode: "includes",
                acceptedAnswers: [
                  "get-process",
                  "task manager",
                  "cpu",
                  "memory",
                  "disk",
                  "sort",
                ],
                successMessage:
                  "Transfer evidence accepted. You demonstrated systematic performance triage.",
                hint: "Start with what is consuming the most resources, then narrow down.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "ce-inspection-processes",
                  title: "List running processes",
                  description:
                    "Run the command that lists all running processes on your system.",
                  starterCode: "# Show all running processes\n",
                  language: "powershell",
                  hint: "The cmdlet name describes exactly what it does — it gets processes.",
                  acceptedPatterns: ["Get-Process", "ps"],
                },
                {
                  id: "ce-inspection-disk",
                  title: "Check disk space",
                  description:
                    "Run the command that shows disk volume information including free space remaining.",
                  starterCode: "# Check available disk space on all drives\n",
                  language: "powershell",
                  hint: "The cmdlet gets information about storage volumes.",
                  acceptedPatterns: ["Get-Volume"],
                },
              ],
              competencies: [
                { track: "SystemNavigation", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "step-by-step",
            },
            {
              id: "lesson-file-operations",
              title: "Create, Move, Copy, and Delete Files Safely",
              summary:
                "Master the core file operations: create, rename, copy, move, and delete — with the discipline to avoid catastrophic mistakes.",
              duration: "40 min",
              difficulty: "Foundational",
              objective:
                "Execute file CRUD operations from the terminal, reason about their scope, and apply safety checks before destructive actions.",
              explanation: [
                "File operations are the most common actions in any engineering workflow: creating configuration files, organizing output, moving assets, and cleaning up waste. The terminal versions are faster, scriptable, and composable — you can batch-create, batch-move, or batch-rename files in seconds. This lesson teaches the five core PowerShell cmdlets for file manipulation.",
                "`New-Item` creates files and folders. To create a file: `New-Item -Path notes.txt -ItemType File`. To create a folder: `New-Item -Path backup -ItemType Directory`. The `-ItemType` parameter tells PowerShell what kind of item to make. You can also use the alias `ni`.",
                "`Copy-Item` duplicates a file or folder: `Copy-Item notes.txt backup/notes.txt` creates a copy while leaving the original in place. `Move-Item` relocates it: `Move-Item notes.txt archive/notes.txt` moves the file and **removes it from the original location**. The key difference: **Copy-Item** leaves the source intact, **Move-Item** does not. `Rename-Item` changes a file's name without moving it: `Rename-Item notes.txt meeting-notes.txt`.",
                "`Remove-Item` deletes files and folders — and this is where discipline matters. Deleted files from the terminal do **not** go to the Recycle Bin. Before running `Remove-Item` on anything important, use the `-WhatIf` flag: `Remove-Item *.log -WhatIf`. This prints what **would** be deleted without actually deleting anything. Make `-WhatIf` a reflex before every bulk delete.",
              ],
              demonstration: [
                "Start in the sandbox directory. Create a file and a folder, then verify:\n```\nPS C:\\Users\\learner\\sandbox> New-Item -Path notes.txt -ItemType File\n\n    Directory: C:\\Users\\learner\\sandbox\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n-a----         3/15/2026  10:30 AM              0 notes.txt\n\nPS C:\\Users\\learner\\sandbox> New-Item -Path archive -ItemType Directory\n\n    Directory: C:\\Users\\learner\\sandbox\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\nd-----         3/15/2026  10:30 AM                archive\n```\n`New-Item` confirms each creation by showing the item details. The file starts at 0 bytes; the directory has no size listed.",
                "Copy the file, rename the original, and move the copy into the archive folder:\n```\nPS C:\\Users\\learner\\sandbox> Copy-Item notes.txt backup-notes.txt\nPS C:\\Users\\learner\\sandbox> Get-ChildItem\n\n    Directory: C:\\Users\\learner\\sandbox\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\nd-----         3/15/2026  10:30 AM                archive\n-a----         3/15/2026  10:30 AM              0 backup-notes.txt\n-a----         3/15/2026  10:30 AM              0 notes.txt\n\nPS C:\\Users\\learner\\sandbox> Rename-Item notes.txt meeting-notes.txt\nPS C:\\Users\\learner\\sandbox> Move-Item backup-notes.txt archive/\nPS C:\\Users\\learner\\sandbox> Get-ChildItem archive/\n\n    Directory: C:\\Users\\learner\\sandbox\\archive\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n-a----         3/15/2026  10:30 AM              0 backup-notes.txt\n```\n`Copy-Item` leaves the original in place. `Move-Item` removes it from the source location.",
                "Preview a cleanup operation before executing it:\n```\nPS C:\\Users\\learner\\sandbox> Remove-Item *.txt -WhatIf\nWhat if: Performing the operation \"Remove File\" on target \"C:\\Users\\learner\\sandbox\\meeting-notes.txt\".\n```\nNothing is actually deleted — `-WhatIf` only prints what **would** happen. Review the list carefully. Only after confirming the preview matches your intent should you remove the `-WhatIf` flag.",
                "What happens when you try to remove a file that does not exist?\n```\nPS C:\\Users\\learner\\sandbox> Remove-Item nonexistent.txt\nRemove-Item: Cannot find path 'C:\\Users\\learner\\sandbox\\nonexistent.txt' because it does not exist.\n```\nPowerShell reports the exact path it could not find. Use `Get-ChildItem` to verify what exists before running destructive commands.",
              ],
              exerciseSteps: [
                "Run `New-Item -Path notes.txt -ItemType File` to create a new file in the sandbox directory.",
                "Use `Copy-Item` to copy it to a backup folder, then use `Rename-Item` to rename the original.",
                "Use `Move-Item` to relocate the backup into a nested subdirectory, then run `dir` to verify it arrived.",
              ],
              validationChecks: [
                "User creates a file using `New-Item` from the terminal.",
                "User demonstrates `Copy-Item` and `Move-Item` with correct syntax.",
                "User runs `Remove-Item` with `-WhatIf` before any actual deletion.",
              ],
              retention: [
                "Inspect before you delete — -WhatIf is not optional.",
                "Copy before overwrite when in doubt.",
                "File operations are composable — combine them in scripts.",
              ],
              tools: ["PowerShell", "Windows Terminal", "File Explorer"],
              notesPrompt:
                "Write a command reference for the five file operations in this lesson. Add a -WhatIf example next to Remove-Item.",
              exercises: [
                {
                  id: "new-item",
                  title: "Create a file",
                  prompt:
                    "What PowerShell cmdlet creates a new file or folder?",
                  placeholder: "Cmdlet name",
                  validationMode: "includes",
                  acceptedAnswers: ["new-item", "ni"],
                  successMessage:
                    "Correct. New-Item creates files, folders, and other items in the filesystem.",
                  hint: "The cmdlet name starts with New-.",
                  assessmentType: "action",
                },
                {
                  id: "whatif-flag",
                  title: "Safe deletion preview",
                  prompt:
                    "What flag runs a PowerShell command in preview mode without making changes?",
                  placeholder: "-...",
                  validationMode: "includes",
                  acceptedAnswers: ["-whatif", "whatif"],
                  successMessage:
                    "Correct. -WhatIf is the single most important safety flag for destructive operations.",
                  hint: "It tells PowerShell to describe what it would do, without doing it.",
                  assessmentType: "action",
                },
                {
                  id: "move-vs-copy",
                  title: "Move vs copy",
                  prompt:
                    "What is the key difference between Move-Item and Copy-Item?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "removes",
                    "original",
                    "source",
                    "copy leaves",
                    "move deletes",
                    "stays",
                    "gone",
                  ],
                  successMessage:
                    "Correct. Copy leaves the source in place. Move removes it from the original location.",
                  hint: "Think about what happens to the original file after the operation.",
                  assessmentType: "reasoning",
                },
              ],
              transferTask: {
                id: "transfer-file-cleanup",
                title: "Transfer challenge: safe folder cleanup",
                prompt:
                  "You need to reorganize a folder by moving files of different types into subfolders and deleting old backups. Describe your terminal workflow, including safety steps before deletion.",
                placeholder: "Describe commands and safety checks",
                validationMode: "includes",
                acceptedAnswers: [
                  "whatif",
                  "preview",
                  "move-item",
                  "get-childitem",
                  "inspect",
                  "filter",
                ],
                successMessage:
                  "Transfer evidence accepted. Your workflow demonstrates safety-first file manipulation at scale.",
                hint: "Mention how you would preview the deletions before running them, and how you would filter by file type.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "ce-fileops-create",
                  title: "Create a file",
                  description:
                    "Create a new file called notes.txt in the current directory using PowerShell.",
                  starterCode: "# Create a new file called notes.txt\n",
                  language: "powershell",
                  hint: "Use New-Item with -Path and -ItemType parameters.",
                  acceptedPatterns: ["New-Item", "notes.txt"],
                },
                {
                  id: "ce-fileops-whatif",
                  title: "Preview before deleting",
                  description:
                    "Write a command that previews which .tmp files would be deleted, without actually deleting them.",
                  starterCode:
                    "# Preview deletion of all .tmp files (don't actually delete)\n",
                  language: "powershell",
                  hint: "Use Remove-Item with the -WhatIf flag to see what would happen.",
                  acceptedPatterns: ["Remove-Item", "-WhatIf"],
                },
              ],
              competencies: [
                { track: "FileManipulation", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "step-by-step",
            },
            {
              id: "lesson-search-files",
              title: "Search and Filter Files Like a Pro",
              summary:
                "Find files by name, content, size, or date using terminal search tools — without hunting through the GUI.",
              duration: "35 min",
              difficulty: "Foundational",
              objective:
                "Use Get-ChildItem with filters, Select-String, and pipeline composition to locate files and content quickly.",
              explanation: [
                "Engineers lose enormous time digging through folders in a file manager. The terminal can find files by name pattern, filter by extension or date, and search **inside** files for specific text — all in seconds. Once you learn terminal search, you will never go back to clicking through folders.",
                "To search for files by name, use `Get-ChildItem` with the `-Recurse` and `-Filter` flags. `-Recurse` tells PowerShell to search **all subdirectories**, not just the current folder. `-Filter` narrows results by name pattern. For example: `Get-ChildItem -Recurse -Filter *.log` finds every `.log` file in the current directory and all directories beneath it.",
                'To search **inside** files for specific text, use `Select-String` (alias: `sls`). It works like `grep` on Linux — it reads file contents and returns lines that match your search term. For example: `Select-String -Path *.txt -Pattern "error"` searches all `.txt` files in the current directory for lines containing the word "error". Combine it with `Get-ChildItem` using a pipe for recursive content search: `Get-ChildItem -Recurse -Filter *.log | Select-String "timeout"`.',
                "PowerShell lets you chain commands together using the **pipe operator** (`|`). The pipe takes the output of one command and sends it as input to the next command. For example: `Get-ChildItem -Recurse -Filter *.log | Select-String \"timeout\"` first finds all `.log` files, then searches inside them for the word 'timeout'. You will explore piping in depth in a later lesson — for now, just remember that `|` connects one command's output to another command's input.",
              ],
              demonstration: [
                "Run `Get-ChildItem -Recurse -Filter *.txt` in the sandbox to find every `.txt` file in the directory tree:\n```\nPS C:\\Users\\learner\\sandbox> Get-ChildItem -Recurse -Filter *.txt\n\n    Directory: C:\\Users\\learner\\sandbox\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n-a----         3/15/2026  10:30 AM            142 README.txt\n-a----         3/14/2026   3:45 PM           1024 notes.txt\n\n    Directory: C:\\Users\\learner\\sandbox\\Projects\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n-a----         3/13/2026  11:15 AM            512 TODO.txt\n```\nNotice that `-Recurse` descended into subdirectories automatically — no need to navigate into each one manually.",
                "Now search inside those files for specific text using `Select-String`:\n```\nPS C:\\Users\\learner\\sandbox> Get-ChildItem -Recurse -Filter *.txt | Select-String \"TODO\"\n\nProjects\\TODO.txt:1:TODO: Set up project dependencies\nProjects\\TODO.txt:3:TODO: Write unit tests for parser module\nREADME.txt:8:See TODO.txt for outstanding tasks\n```\nThe output shows the filename, line number, and the matching text on each line. This is how you answer questions like 'which file contains the database port?' in seconds.",
                "What happens when a search finds nothing? The command completes silently:\n```\nPS C:\\Users\\learner\\sandbox> Get-ChildItem -Recurse -Filter *.txt | Select-String \"xyznonexistent\"\nPS C:\\Users\\learner\\sandbox>\n```\nNo output means no matches. PowerShell returns you to the prompt without an error. If you expected results and got none, check your spelling, file filter, and search path.",
              ],
              exerciseSteps: [
                "Run `Get-ChildItem -Recurse -Filter *.txt` to search the sandbox for all `.txt` files recursively.",
                "Pipe the results into `Select-String` to search inside those files for a specific keyword.",
                "Use the pipe operator to chain `Get-ChildItem` into `Select-String` for recursive content search.",
              ],
              validationChecks: [
                "User uses `Get-ChildItem` with `-Recurse` to search nested directories.",
                "User pipes file output into `Select-String` for content search.",
                "User applies a filter using `-Filter` to narrow results by file extension.",
              ],
              retention: [
                "Get-ChildItem -Recurse -Filter is the terminal equivalent of system search.",
                "Select-String is grep for PowerShell — learn it well.",
                "Pipelines compose search: find files, then search inside them.",
              ],
              tools: ["PowerShell", "Windows Terminal"],
              notesPrompt:
                "Write the command to find all files containing the word 'TODO' in a project folder. Explain each stage of the pipeline.",
              exercises: [
                {
                  id: "recursive-search",
                  title: "Recursive file search",
                  prompt:
                    "What flag makes Get-ChildItem search all subdirectories?",
                  placeholder: "-...",
                  validationMode: "includes",
                  acceptedAnswers: ["-recurse", "recurse"],
                  successMessage:
                    "Correct. -Recurse descends into all child directories automatically.",
                  hint: "Think about the word that means going through all levels.",
                  assessmentType: "action",
                },
                {
                  id: "content-search",
                  title: "Search inside files",
                  prompt:
                    "What PowerShell cmdlet searches the content of files for a specific pattern?",
                  placeholder: "Cmdlet name",
                  validationMode: "includes",
                  acceptedAnswers: ["select-string", "sls"],
                  successMessage:
                    "Correct. Select-String is the PowerShell equivalent of grep and is essential for log analysis.",
                  hint: "It selects lines from files that match a string or pattern.",
                  assessmentType: "action",
                },
                {
                  id: "pipe-search-combo",
                  title: "Pipeline search",
                  prompt:
                    "Write a command that finds all .log files recursively and searches inside them for the word 'error' using a pipe.",
                  placeholder: "Pipeline command",
                  validationMode: "includes",
                  acceptedAnswers: ["get-childitem", "|", "select-string"],
                  successMessage:
                    "Correct. Combining Get-ChildItem with Select-String via a pipe is the standard pattern for recursive content search.",
                  hint: "Pipe the output of Get-ChildItem -Recurse -Filter into Select-String.",
                  assessmentType: "action",
                },
              ],
              transferTask: {
                id: "transfer-file-search",
                title: "Transfer challenge: find a config value",
                prompt:
                  "A teammate asks: 'Which file sets the database port?' Describe the terminal pipeline you would use to search every file in the project for the port number. Include the cmdlets and flags.",
                placeholder: "Search pipeline",
                validationMode: "includes",
                acceptedAnswers: [
                  "select-string",
                  "get-childitem",
                  "recurse",
                  "pipe",
                  "|",
                ],
                successMessage:
                  "Transfer evidence accepted. You built a practical search pipeline from components.",
                hint: "Combine recursive file listing with content search using the pipe operator.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "ce-search-recursive",
                  title: "Recursive file search",
                  description:
                    "Find all .log files in the current directory and all subdirectories.",
                  starterCode: "# Find all .log files recursively\n",
                  language: "powershell",
                  hint: "Use Get-ChildItem with -Recurse and -Filter flags.",
                  acceptedPatterns: ["Get-ChildItem", "-Recurse", "-Filter"],
                },
                {
                  id: "ce-search-content",
                  title: "Search inside files",
                  description:
                    "Search all .txt files in the current directory for lines containing the word 'TODO'.",
                  starterCode: "# Search for 'TODO' inside all .txt files\n",
                  language: "powershell",
                  hint: "Use Select-String with -Path and -Pattern parameters.",
                  acceptedPatterns: ["Select-String", "TODO"],
                },
              ],
              competencies: [
                { track: "TerminalOperation", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "step-by-step",
            },
          ],
        },
        {
          id: "course-terminal-automation",
          title: "Terminal Automation",
          focus: "Scripting basics, repeatable workflows, and safe automation",
          outcome:
            "Learners can write simple scripts, batch rename files, and automate repetitive tasks inside safe environments.",
          lessons: [
            {
              id: "lesson-terminal-automation",
              title: "Automate Repetitive Tasks Safely",
              summary:
                "Use scripts and repeatable commands to eliminate friction without turning your machine into a mess.",
              duration: "45 min",
              difficulty: "Intermediate",
              objective:
                "Recognize repetitive workflows and encode them into safe, reviewable automation steps.",
              explanation: [
                "Automation is leverage — but it cuts both ways. Good automation saves time repeatedly across hundreds of files. Bad automation makes the same destructive mistake at scale. The difference comes down to discipline: **scope it, preview it, then execute it**.",
                'In PowerShell, you store reusable values in **variables** using the `$` prefix. For example: `$targetFolder = "C:\\Projects\\logs"` saves a path you can reference later as `$targetFolder` in your commands. Variables keep your automation flexible — change the value in one place instead of editing every command.',
                "The **dry-run** pattern is your safety net before any bulk operation. Use `-WhatIf` on any cmdlet that supports it: `Remove-Item $targetFolder\\*.tmp -WhatIf` prints what **would** be deleted without deleting anything. For commands that do not support `-WhatIf`, build your own preview: pipe your file list into `Select-Object Name` to review which files will be affected before running the real operation.",
                "Safe automation follows a strict sequence: (1) define the **scope** — which files, which folder, which pattern; (2) run a **dry-run** or preview to verify your scope is correct; (3) **execute** the real operation; (4) **verify** the result matches expectations. Skipping step 2 is how engineers accidentally delete production logs or overwrite config files.",
              ],
              demonstration: [
                "Start by storing the target in a variable and inspecting the contents:\n```\nPS C:\\Users\\learner> $folder = \".\\sandbox\\logs\"\nPS C:\\Users\\learner> Get-ChildItem $folder\n\n    Directory: C:\\Users\\learner\\sandbox\\logs\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n-a----         3/14/2026   8:15 AM           2048 app.tmp\n-a----         3/14/2026   8:15 AM            512 cache.tmp\n-a----         3/14/2026   9:00 AM           1024 debug.log\n```\nYou can see `.tmp` files that need cleanup. Now preview the operation before running it:\n```\nPS C:\\Users\\learner> Remove-Item $folder\\*.tmp -WhatIf\nWhat if: Performing the operation \"Remove File\" on target \"C:\\Users\\learner\\sandbox\\logs\\app.tmp\".\nWhat if: Performing the operation \"Remove File\" on target \"C:\\Users\\learner\\sandbox\\logs\\cache.tmp\".\n```\nPowerShell prints each file it **would** delete. Read the list — does it match your intent? Only then remove the `-WhatIf` flag.",
                "Now capture this as a reusable workflow. The key elements: a `$folder` variable for scope, a `Get-ChildItem` call to inspect, a `-WhatIf` pass to preview, and the actual `Remove-Item` to execute:\n```\n# Removes .tmp files from logs folder. Reverse by restoring from backup.\n$folder = \".\\sandbox\\logs\"\nGet-ChildItem $folder -Filter *.tmp    # Step 1: Inspect\nRemove-Item $folder\\*.tmp -WhatIf      # Step 2: Preview\nRemove-Item $folder\\*.tmp              # Step 3: Execute (only after review)\n```\nDocumentation is part of automation quality — your future self will thank you.",
                "To roll back, you need a plan **before** you execute. The simplest rollback is to `Copy-Item` the target files into a backup folder before the destructive step. A more advanced approach is to use `Git` to track changes. Either way: if you cannot describe how to undo your automation, you are not ready to run it.",
                "What happens when a script has a syntax error? PowerShell stops and points to the problem:\n```\nPS C:\\Users\\learner> .\\cleanup.ps1\nParserError:\nLine |\n   3 |  if ($count -gt 10 {\n     |                    ~\n     | Missing closing ')' after expression in 'if' statement.\n```\nThe error message shows the exact line, a caret (`~`) pointing to the problem character, and a description of what is wrong. Read the error message carefully — it almost always tells you exactly what to fix.",
              ],
              exerciseSteps: [
                "Identify a repetitive task in the sandbox workspace and store the target path in a `$variable`.",
                "Write a command using `-WhatIf` or pipe into `Select-Object` to preview the action before making changes.",
                "Describe how you would roll the action back if something goes wrong.",
              ],
              validationChecks: [
                "User defines the target scope of the automation using a `$variable`.",
                "User includes a `-WhatIf` preview or dry-run step in the workflow.",
                "User records how to reverse the operation (backup, undo plan, or version control).",
              ],
              retention: [
                "Automate only what you understand.",
                "Prefer reversible workflows and training sandboxes.",
                "Documentation is part of automation quality.",
              ],
              tools: [
                "PowerShell",
                "Windows Terminal",
                "PowerToys",
                "Obsidian",
              ],
              notesPrompt:
                "Capture one repetitive workflow from your own computer life and describe how you would sandbox it before automating it.",
              exercises: [
                {
                  id: "safety-principle",
                  title: "Safety first",
                  prompt:
                    "Type the principle that should come before writing automation that modifies many files.",
                  placeholder: "Short phrase",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "dry run",
                    "preview",
                    "test in sandbox",
                    "reversible",
                  ],
                  successMessage:
                    "Correct. Safe automation starts with previewing, isolating, and making rollback possible.",
                  hint: "Think about what you should do before bulk edits hit real files.",
                  assessmentType: "action",
                },
                {
                  id: "variable-store",
                  title: "Store a value",
                  prompt:
                    "In PowerShell, what symbol precedes a variable name when you assign or read it?",
                  placeholder: "Single character",
                  validationMode: "includes",
                  acceptedAnswers: ["$"],
                  successMessage:
                    "Correct. PowerShell uses $ to declare and reference variables, e.g. $fileName = 'report.txt'.",
                  hint: "It is the same symbol used for variables in many scripting languages.",
                  assessmentType: "action",
                },
                {
                  id: "automation-scope",
                  title: "Scope the change",
                  prompt:
                    "Why is it important to define the scope of an automation before running it?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "limit",
                    "control",
                    "unintended",
                    "wrong files",
                    "boundary",
                    "target",
                    "only affect",
                  ],
                  successMessage:
                    "Correct. Without clear scope, automation can modify files or folders you did not intend to touch.",
                  hint: "Think about what happens if a script runs against the wrong directory.",
                  assessmentType: "reasoning",
                },
              ],
              transferTask: {
                id: "transfer-automation-plan",
                title: "Transfer challenge: plan a safe automation",
                prompt:
                  "You need to rename 200 log files from .log to .log.bak. Describe your automation plan including: how you scope the change, preview it, execute it, and roll it back if something goes wrong.",
                placeholder: "Automation plan with safety steps",
                validationMode: "includes",
                acceptedAnswers: [
                  "preview",
                  "dry run",
                  "whatif",
                  "rollback",
                  "rename",
                  "test",
                  "scope",
                ],
                successMessage:
                  "Transfer evidence accepted. Your plan demonstrates safety-first automation thinking.",
                hint: "Cover scope, preview, execution, and rollback — in that order.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "ce-automation-variable",
                  title: "Store a target path",
                  description:
                    "Create a variable called $folder that stores the path '.\\sandbox\\logs'.",
                  starterCode: "# Store the target folder path in a variable\n",
                  language: "powershell",
                  hint: "Use $variableName = 'value' to assign a string to a variable.",
                  acceptedPatterns: ["$folder", "sandbox"],
                },
                {
                  id: "ce-automation-preview",
                  title: "Dry-run a cleanup",
                  description:
                    "Write a command that previews removing all .tmp files from the $folder path without actually deleting them.",
                  starterCode:
                    "# Preview removing .tmp files from $folder\n$folder = '.\\sandbox\\logs'\n",
                  language: "powershell",
                  hint: "Use Remove-Item with the -WhatIf flag.",
                  acceptedPatterns: ["Remove-Item", "-WhatIf"],
                },
              ],
              competencies: [
                { track: "Automation", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "step-by-step",
            },
            {
              id: "lesson-piping-filtering",
              title: "Piping and Filtering Output",
              summary:
                "Chain commands together to transform, filter, and direct output exactly where you need it.",
              duration: "40 min",
              difficulty: "Intermediate",
              objective:
                "Use pipes, Select-Object, Where-Object, and output redirection to process information efficiently.",
              explanation: [
                "The **pipe operator** (`|`) is the most powerful composition tool in the terminal. It takes the output of one command and sends it directly as input to the next command. Instead of saving intermediate results to files or variables, you chain commands together in a single line — each stage transforms or filters the data flowing through.",
                "`Sort-Object` reorders output by a property you choose. For example, `Get-Process | Sort-Object CPU -Descending` sorts all running processes from highest to lowest CPU usage. Without `-Descending`, it sorts in ascending order. You can sort by any property: `Name`, `WorkingSet` (memory), `CPU`, or file properties like `Length` and `LastWriteTime`.",
                '`Where-Object` (alias: `where`) **filters** objects based on a condition. The syntax uses a script block: `Get-ChildItem | Where-Object { $_.Length -gt 1MB }` keeps only files larger than 1 MB. The special variable `$_` refers to the current object in the pipeline. Think of `Where-Object` as asking a yes/no question about each item — only items that answer "yes" pass through.',
                "`Select-Object` (alias: `select`) **chooses which properties to display** or limits the number of results. `Get-Process | Select-Object Name, CPU` shows only the name and CPU columns. `Select-Object -First 5` keeps only the first five results. Combine all three in a single pipeline: `Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 | Select-Object Name, CPU` gives you a clean top-5 CPU report.",
                "`Group-Object` (alias: `group`) groups pipeline output by a shared property value. For example, `Get-ChildItem | Group-Object Extension` groups files by their file extension — each group tells you the count and the items. This is powerful for quick diagnostics: `Get-Process | Group-Object ProcessName | Sort-Object Count -Descending | Select-Object -First 5` shows which process names have the most instances running. Be aware that pipelines process objects one at a time, which is elegant but can become slow on very large datasets (tens of thousands of items). When performance matters, collect results into a variable first (`$items = Get-ChildItem -Recurse`) and use direct collection methods or `foreach` loops instead of piping through multiple stages.",
              ],
              demonstration: [
                "Run a pipeline that finds the top CPU-consuming processes:\n```\nPS C:\\Users\\learner> Get-Process | Sort-Object CPU -Descending | Select-Object -First 5\n\n NPM(K)    PM(M)      WS(M)     CPU(s)      Id  SI ProcessName\n ------    -----      -----     ------      --  -- -----------\n     85   182.40     245.12     142.56    4120   1 msedge\n     45    95.30     120.88      45.22    1580   0 svchost\n     30    52.18      67.45      12.83    7264   1 explorer\n     20    38.90      52.14       8.91    2104   1 SearchHost\n     15    22.75      35.60       3.42    6892   1 pwsh\n```\nEach `|` passes data to the next stage: `Get-Process` gathers all processes, `Sort-Object CPU -Descending` reorders them, and `Select-Object -First 5` keeps only the top five.",
                "Now filter files by size using `Where-Object`:\n```\nPS C:\\Users\\learner\\sandbox> Get-ChildItem | Sort-Object Length -Descending\n\n    Directory: C:\\Users\\learner\\sandbox\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n-a----         3/14/2026   3:45 PM          15360 database.bak\n-a----         3/13/2026  11:15 AM           4096 report.docx\n-a----         3/14/2026   2:10 PM           1024 notes.txt\n-a----         3/15/2026  10:30 AM            142 README.txt\n\nPS C:\\Users\\learner\\sandbox> Get-ChildItem | Where-Object { $_.Length -gt 1KB }\n\n    Directory: C:\\Users\\learner\\sandbox\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n-a----         3/14/2026   3:45 PM          15360 database.bak\n-a----         3/13/2026  11:15 AM           4096 report.docx\n-a----         3/14/2026   2:10 PM           1024 notes.txt\n```\nThe `$_` variable represents each file as it flows through the pipeline. `Where-Object` keeps only files where the condition (`Length -gt 1KB`) is true — `README.txt` at 142 bytes was filtered out.",
                "To save pipeline output to a file, use the redirection operator `>`:\n```\nPS C:\\Users\\learner> Get-Process | Sort-Object CPU -Descending | Select-Object -First 10 > top-processes.txt\nPS C:\\Users\\learner> Get-ChildItem top-processes.txt\n\n    Directory: C:\\Users\\learner\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\n-a----         3/15/2026  11:00 AM           1284 top-processes.txt\n```\nThe output went to the file instead of the screen. Use `>>` to **append** to an existing file instead of overwriting it. This is how you capture diagnostic output for sharing or later analysis.",
              ],
              exerciseSteps: [
                "Run `Get-Process | Sort-Object WorkingSet -Descending` to sort processes by memory usage using the `|` pipe.",
                "Use `Get-ChildItem | Where-Object { $_.LastWriteTime -gt (Get-Date).Date }` to filter directory contents to files modified today.",
                "Redirect the output of a command to a file using `>`.",
              ],
              validationChecks: [
                "User chains at least two commands with the `|` pipe operator.",
                "User demonstrates filtering with `Where-Object` using a condition.",
                "User shows output redirection to a file using `>` or `>>`.",
              ],
              retention: [
                "The pipe is how you compose small tools into powerful workflows.",
                "Where-Object is your filter. Select-Object is your lens.",
                "Redirect to a file when you need to save or share output.",
              ],
              tools: ["PowerShell", "Windows Terminal"],
              notesPrompt:
                "Write three pipe chains you found useful. Note what each stage does.",
              exercises: [
                {
                  id: "pipe-basics",
                  title: "Pipe operator",
                  prompt:
                    "What symbol connects the output of one command to the input of the next?",
                  placeholder: "Single character",
                  validationMode: "exact",
                  acceptedAnswers: ["|"],
                  successMessage:
                    "Correct. The pipe is the foundation of command composition.",
                  hint: "It is a vertical bar character on your keyboard.",
                  assessmentType: "action",
                },
                {
                  id: "filter-command",
                  title: "Filter results",
                  prompt:
                    "What PowerShell cmdlet filters objects based on a condition?",
                  placeholder: "Cmdlet name",
                  validationMode: "includes",
                  acceptedAnswers: ["where-object", "where"],
                  successMessage:
                    "Correct. Where-Object lets you keep only what matches your criteria.",
                  hint: "Think about WHERE you want to look in the results.",
                  assessmentType: "action",
                },
                {
                  id: "select-properties",
                  title: "Choose properties",
                  prompt:
                    "What PowerShell cmdlet selects which properties to display or limits the number of results?",
                  placeholder: "Cmdlet name",
                  validationMode: "includes",
                  acceptedAnswers: ["select-object", "select"],
                  successMessage:
                    "Correct. Select-Object lets you pick specific columns and limit output count.",
                  hint: "It selects specific objects or properties from the pipeline.",
                  assessmentType: "action",
                },
              ],
              transferTask: {
                id: "transfer-pipeline-compose",
                title: "Transfer challenge: build a diagnostic pipeline",
                prompt:
                  "Write a PowerShell pipeline that finds the 5 largest files in a folder and displays only name and size. Explain what each stage of the pipe does.",
                placeholder: "Pipeline with explanation",
                validationMode: "includes",
                acceptedAnswers: [
                  "get-childitem",
                  "sort",
                  "select",
                  "|",
                  "length",
                  "first",
                  "5",
                ],
                successMessage:
                  "Transfer evidence accepted. You composed multiple stages into a practical pipeline.",
                hint: "List files, sort by size descending, then select the top 5 with only the properties you need.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "ce-piping-sort",
                  title: "Sort processes by CPU",
                  description:
                    "Write a pipeline that lists all processes sorted by CPU usage in descending order.",
                  starterCode:
                    "# List processes sorted by CPU usage (highest first)\n",
                  language: "powershell",
                  hint: "Pipe Get-Process into Sort-Object with the CPU property and -Descending.",
                  acceptedPatterns: ["Get-Process", "|", "Sort-Object"],
                },
                {
                  id: "ce-piping-filter",
                  title: "Filter large files",
                  description:
                    "Write a pipeline that lists only files larger than 1KB in the current directory.",
                  starterCode: "# Show only files larger than 1KB\n",
                  language: "powershell",
                  hint: "Pipe Get-ChildItem into Where-Object with a size condition.",
                  acceptedPatterns: ["Get-ChildItem", "|", "Where-Object"],
                },
              ],
              competencies: [
                { track: "TerminalOperation", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "step-by-step",
            },
            {
              id: "lesson-powershell-scripting",
              title: "Write Your First PowerShell Scripts",
              summary:
                "Move from one-off commands to reusable scripts with variables, conditionals, and loops.",
              duration: "50 min",
              difficulty: "Intermediate",
              objective:
                "Write a PowerShell script that uses variables, an if/else block, and a loop to automate a real repetitive task.",
              explanation: [
                "A **script** is just a saved sequence of commands stored in a `.ps1` file. Everything you type in the interactive terminal works the same way inside a script — the difference is that a script can be re-run, shared, and version-controlled. This lesson teaches you the four building blocks of PowerShell scripting: **variables**, **string interpolation**, **loops**, and **conditionals**.",
                '**Variables** in PowerShell always start with `$`. Assignment is straightforward: `$folderPath = "C:\\Projects"` stores a string, `$maxSize = 1024` stores a number, and `$files = Get-ChildItem $folderPath` stores command output. You reference the variable the same way: `$folderPath` anywhere in your script returns its value.',
                "**String interpolation** lets you embed variables directly inside double-quoted strings. `\"Processing folder: $folderPath\"` outputs `Processing folder: C:\\Projects`. For property access inside strings, use `$()`: `\"Found $($files.Count) files\"`. Single-quoted strings (`'...'`) do **not** interpolate — `'$folderPath'` outputs the literal text `$folderPath`.",
                'The **foreach** loop iterates over a collection: `foreach ($file in $files) { ... }` runs the code block once for every item in `$files`, with `$file` holding the current item each time. The **if/else** conditional branches logic: `if ($file.Length -lt 1KB) { Write-Host "Skipping small file" } else { Write-Host "Processing $($file.Name)" }`. Together, these let you write scripts that inspect every file and make decisions about each one.',
              ],
              demonstration: [
                "Create a new file called `organize.ps1` with variables and a loop. Here is what the script contains and what happens when you run it:\n```\nPS C:\\Users\\learner> Get-Content .\\organize.ps1\n$folderPath = \".\\sandbox\"\n$files = Get-ChildItem $folderPath -Filter *.txt\nforeach ($file in $files) {\n    Write-Host \"Found: $($file.Name)\"\n}\n\nPS C:\\Users\\learner> .\\organize.ps1\nFound: README.txt\nFound: notes.txt\nFound: TODO.txt\n```\nThe script stores the folder path in `$folderPath`, retrieves matching files into `$files`, then loops through each file and prints its name using **string interpolation** (`$($file.Name)` inside double quotes).",
                "Add a conditional inside the loop to make decisions about each file:\n```\nPS C:\\Users\\learner> Get-Content .\\organize.ps1\n$folderPath = \".\\sandbox\"\n$files = Get-ChildItem $folderPath -Filter *.txt\nforeach ($file in $files) {\n    if ($file.Length -lt 1KB) {\n        Write-Host \"Skipping $($file.Name) (too small)\"\n    } else {\n        Write-Host \"Processing $($file.Name)\"\n    }\n}\n\nPS C:\\Users\\learner> .\\organize.ps1\nSkipping README.txt (too small)\nProcessing notes.txt\nProcessing TODO.txt\n```\nThe `if`/`else` block checks each file's size. Notice that `$($file.Name)` inside double quotes inserts the file's name into the output — this is **string interpolation** in action.",
                "Before adding any destructive operation (like renaming or deleting), add a `-WhatIf` preview. The safe pattern is: loop through the files, print what you **would** do, review the output, then add the real command only after confirming the preview looks correct. This is how professional automation scripts are built — incrementally, with safety checks at every stage.",
                "What happens when you call a function with the wrong parameters?\n```\nPS C:\\Users\\learner> function Get-Greeting { param([string]$Name) \"Hello, $Name!\" }\nPS C:\\Users\\learner> Get-Greeting -Name \"Alex\"\nHello, Alex!\nPS C:\\Users\\learner> Get-Greeting -Name \"Alex\" -ExtraParam \"oops\"\nGet-Greeting: A positional parameter cannot be found that accepts argument 'oops'.\n```\nPowerShell tells you exactly which argument caused the problem. Read error messages carefully — they almost always point directly to the fix.",
              ],
              exerciseSteps: [
                "Create a new `.ps1` file and declare two variables using `$variableName = value` syntax.",
                "Add a `foreach ($file in $files)` loop that prints each filename in a directory using string interpolation.",
                "Add an `if` conditional inside the loop that skips files smaller than 1KB.",
              ],
              validationChecks: [
                "Script runs without errors when executed with `.\\scriptname.ps1` from the terminal.",
                "The `foreach` loop correctly iterates over the file list and prints each filename.",
                "An `if` conditional is applied to check file properties before any modification.",
              ],
              retention: [
                "Variables start with $ in PowerShell.",
                "foreach ($item in $collection) is the standard loop pattern.",
                "Parameterize scripts so they work on more than one machine.",
              ],
              tools: ["PowerShell", "Windows Terminal", "Visual Studio Code"],
              notesPrompt:
                "Write the skeleton of a reusable PowerShell script with a param block, a loop, and an if check. Keep it as a reference.",
              exercises: [
                {
                  id: "ps-variable",
                  title: "Variable syntax",
                  prompt:
                    "How do you declare a variable called folderPath in PowerShell?",
                  placeholder: "$...",
                  validationMode: "includes",
                  acceptedAnswers: ["$folderpath", "$folderPath"],
                  successMessage:
                    "Correct. All PowerShell variables are prefixed with $.",
                  hint: "PowerShell variables always start with a dollar sign.",
                  assessmentType: "action",
                },
                {
                  id: "ps-loop",
                  title: "Loop structure",
                  prompt:
                    "Complete the PowerShell foreach loop header: foreach (___ in $files)",
                  placeholder: "Variable name that refers to each item",
                  validationMode: "includes",
                  acceptedAnswers: ["$file", "$item", "$f"],
                  successMessage:
                    "Correct. The foreach variable receives each item in the collection on every iteration.",
                  hint: "It is a new variable that holds each element of $files one at a time.",
                  assessmentType: "action",
                },
                {
                  id: "ps-conditional",
                  title: "Conditional logic",
                  prompt:
                    "What keyword begins a conditional block in PowerShell?",
                  placeholder: "Keyword",
                  validationMode: "includes",
                  acceptedAnswers: ["if"],
                  successMessage:
                    "Correct. if is how you branch behavior based on a condition in any language.",
                  hint: "It is the same keyword used in nearly every programming language.",
                  assessmentType: "action",
                },
              ],
              transferTask: {
                id: "transfer-ps-script",
                title: "Transfer challenge: automate a file workflow",
                prompt:
                  "Describe a PowerShell script that scans a downloads folder, moves PDFs into a Documents/PDFs subfolder, and logs each move with the filename and timestamp. Include the key script elements you would use.",
                placeholder: "Describe variables, loop, and logic",
                validationMode: "includes",
                acceptedAnswers: [
                  "foreach",
                  "move-item",
                  "variable",
                  "$",
                  "if",
                  "loop",
                  "get-childitem",
                ],
                successMessage:
                  "Transfer evidence accepted. Your script design shows scripting intuition applied to a real-world task.",
                hint: "Mention the loop structure, file type check, move command, and how you would log actions.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "ce-scripting-variables",
                  title: "Declare and use a variable",
                  description:
                    "Create a variable called $folderPath set to '.\\Projects' and print its value using Write-Host with string interpolation.",
                  starterCode:
                    "# Declare a folder path variable and print it\n",
                  language: "powershell",
                  hint: "Use $variableName = 'value' then Write-Host with double-quoted string interpolation.",
                  acceptedPatterns: ["$folderPath", "Write-Host"],
                },
                {
                  id: "ce-scripting-loop",
                  title: "Loop over files",
                  description:
                    "Write a foreach loop that iterates over files from Get-ChildItem and prints each filename.",
                  starterCode:
                    "# Loop over files and print each name\n$files = Get-ChildItem .\\sandbox\n",
                  language: "powershell",
                  hint: "Use foreach ($file in $files) { ... } with Write-Host inside the block.",
                  acceptedPatterns: ["foreach", "$file", "Write-Host"],
                },
              ],
              competencies: [
                { track: "Automation", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "goal-driven",
            },
          ],
        },
        {
          id: "course-knowledge-management",
          title: "Knowledge Management with Obsidian",
          focus:
            "Note-taking, linked documentation, and personal reference systems",
          outcome:
            "Learners build a personal knowledge vault with structured notes, backlinks, and reusable references.",
          lessons: [
            {
              id: "lesson-obsidian-vault",
              title: "Build Your Engineering Vault",
              summary:
                "Set up an Obsidian vault structured for engineering learning, command references, and project notes.",
              duration: "35 min",
              difficulty: "Foundational",
              objective:
                "Create a vault with folders, note templates, and a tagging strategy that supports engineering work.",
              explanation: [
                "Engineers who retain what they learn use structured note systems — not scattered text files or bookmarks they never revisit. **Obsidian** is a note-taking app where your notes are stored as plain Markdown files in a folder called a **vault**. The vault lives on your filesystem, which means you own your data and can back it up with Git or any file sync tool.",
                "A well-organized vault starts with **folders** that match how you think. For engineering work, a proven structure is: `Commands/` for terminal reference notes, `Concepts/` for mental models and explanations, `Projects/` for project-specific context, and `Logs/` for debugging journals and daily entries. You can add folders as your needs grow — the structure should serve retrieval, not impose bureaucracy.",
                "The power of Obsidian comes from **backlinks** — connections between notes created with the `[[note name]]` syntax. When you type `[[Get-ChildItem]]` inside a note about file searching, Obsidian creates a clickable link to your Get-ChildItem reference note. These links are **bidirectional**: the target note shows all other notes that link to it. Over time, your vault becomes a web of connected knowledge, not a graveyard of isolated pages.",
                "**Tags** provide a second layer of organization using the `#` prefix: add `#powershell`, `#debugging`, or `#daily` to any note. Tags work across folders — a note in `Projects/` tagged `#powershell` shows up alongside a note in `Commands/` with the same tag. The **graph view** (accessible from Obsidian's sidebar) visualizes all your notes and their backlinks as an interactive network diagram, revealing clusters of related knowledge you might not have noticed.",
              ],
              demonstration: [
                "You can create the vault folder structure from the terminal before opening Obsidian:\n```\nPS C:\\Users\\learner> New-Item -Path Engineering\\Commands -ItemType Directory\nPS C:\\Users\\learner> New-Item -Path Engineering\\Concepts -ItemType Directory\nPS C:\\Users\\learner> New-Item -Path Engineering\\Projects -ItemType Directory\nPS C:\\Users\\learner> New-Item -Path Engineering\\Logs -ItemType Directory\nPS C:\\Users\\learner> Get-ChildItem Engineering\n\n    Directory: C:\\Users\\learner\\Engineering\n\nMode                 LastWriteTime         Length Name\n----                 -------------         ------ ----\nd-----         3/15/2026  11:30 AM                Commands\nd-----         3/15/2026  11:30 AM                Concepts\nd-----         3/15/2026  11:30 AM                Logs\nd-----         3/15/2026  11:30 AM                Projects\n```\nOpen Obsidian and point it at this `Engineering` folder to use it as your vault. Now create a note in `Commands/` called `Get-ChildItem.md` with this content:\n```\n# Get-ChildItem\n\nLists files and folders in the current directory.\n\n## Usage\n`Get-ChildItem -Recurse -Filter *.log`\n\n## See Also\n[[File Searching]]\n\n#powershell\n```\nThe note includes an example, a `[[backlink]]` to a related concept note, and a `#powershell` tag for search.",
                "Next, create a note in `Concepts/` called `File Searching.md`. Include a backlink to your command reference:\n```\n# File Searching\n\nTerminal search replaces clicking through folders.\n\n## Key Commands\n- [[Get-ChildItem]] with `-Recurse` for file name search\n- `Select-String` for content search inside files\n\n## Pipeline Pattern\n`Get-ChildItem -Recurse -Filter *.log | Select-String \"error\"`\n\n#search #powershell\n```\nNow open the `Get-ChildItem` note in Obsidian — you will see a **Backlinks** panel showing that `File Searching` references it. This bidirectional linking is what makes Obsidian more powerful than a flat folder of files.",
                "Open the **graph view** from the left sidebar. You will see your notes as dots with lines connecting them based on your `[[backlinks]]`. As your vault grows, this graph reveals clusters — commands that relate to the same concept, projects that share techniques, or debugging logs that reference the same tools. Add tags like `#daily` and `#debugging` to make search and filtering even faster.",
              ],
              exerciseSteps: [
                "Create a vault structure with at least four topic folders (e.g., `Commands/`, `Concepts/`, `Projects/`, `Logs/`).",
                "Write a note for a command you learned today, including an example and a `[[backlink]]` to a related note.",
                "Add `#tags` to organize the note for later retrieval and search.",
              ],
              validationChecks: [
                "User has a vault with organized folders matching engineering knowledge categories.",
                "User demonstrates creating a `[[backlink]]` between two related notes.",
                "User applies `#tags` consistently to notes for cross-folder discovery.",
              ],
              retention: [
                "A good vault grows with you \u2014 build the habit early.",
                "Backlinks create a web of understanding, not just isolated notes.",
                "Searchability beats perfect organization.",
              ],
              tools: ["Obsidian"],
              notesPrompt:
                "Design your ideal vault folder structure. List the categories that matter most for your learning.",
              exercises: [
                {
                  id: "vault-structure",
                  title: "Vault categories",
                  prompt:
                    "Name at least three folder categories you would create in an engineering knowledge vault.",
                  placeholder: "e.g. Commands, Concepts, ...",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "commands",
                    "concepts",
                    "projects",
                    "logs",
                    "notes",
                    "debugging",
                    "references",
                  ],
                  successMessage:
                    "Good structure. Organized vaults make knowledge retrieval fast.",
                  hint: "Think about the types of information an engineer needs to record.",
                  assessmentType: "action",
                },
                {
                  id: "backlink-purpose",
                  title: "Why backlink?",
                  prompt:
                    "What is the purpose of creating backlinks between notes in a knowledge vault?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "connect",
                    "link",
                    "relationship",
                    "related",
                    "discover",
                    "navigate",
                    "find",
                  ],
                  successMessage:
                    "Correct. Backlinks create a web of connections so you can discover related knowledge and navigate between topics.",
                  hint: "Think about how one concept relates to another and how you would find those connections later.",
                  assessmentType: "reasoning",
                },
                {
                  id: "vault-daily-use",
                  title: "Daily engineering notes",
                  prompt:
                    "Name one type of information an engineer should capture in their vault daily to make debugging and decision-making faster later.",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "error",
                    "decision",
                    "command",
                    "fix",
                    "solution",
                    "bug",
                    "log",
                    "what I tried",
                    "problem",
                    "learned",
                  ],
                  successMessage:
                    "Correct. Recording errors, fixes, commands, and decisions creates a personal knowledge base that accelerates future work.",
                  hint: "Think about what you wish you had written down the last time you hit a problem you had solved before.",
                  assessmentType: "reasoning" as const,
                },
              ],
              transferTask: {
                id: "transfer-vault-design",
                title: "Transfer challenge: design a project vault",
                prompt:
                  "You are starting a new software project. Describe the vault structure you would create: folder names, what goes in each, and how you would use backlinks to connect notes across folders.",
                placeholder: "Vault design with linking strategy",
                validationMode: "includes",
                acceptedAnswers: [
                  "folder",
                  "backlink",
                  "link",
                  "commands",
                  "notes",
                  "project",
                  "tag",
                ],
                successMessage:
                  "Transfer evidence accepted. You designed a knowledge system tailored to engineering work.",
                hint: "Name specific folders, give an example note, and explain how two notes in different folders would link.",
                assessmentType: "transfer",
              },
              competencies: [{ track: "Automation", targetLevel: "Assisted" }],
              scaffoldingLevel: "step-by-step",
            },
          ],
        },
      ],
    },
    {
      id: "phase-2",
      title: "Programming and Debugging Foundations",
      strapline: "Build mental models for how software behaves.",
      purpose:
        "Transition from using tools to understanding how software systems work. Read code, fix bugs, handle configuration, and work with APIs and small applications.",
      level: "Intermediate",
      duration: "8–10 weeks",
      environment:
        "Isolated project workspaces with seeded bugs, tests, and version history",
      tools: [
        "Visual Studio Code",
        "Git",
        "GitHub",
        "Node.js",
        "npm",
        "Postman",
        "Docker",
      ],
      guardrails: [
        "Every practice repo is disposable and resettable.",
        "Broken states are intentional and recoverable to teach debugging.",
        "Validation combines command checks, code checks, and reflection.",
      ],
      milestones: [
        "Read and change code confidently",
        "Debug broken behavior systematically",
        "Use Git without fear",
        "Work with APIs and HTTP",
        "Manage dependencies and project structure",
      ],
      projects: [
        "Repair a broken starter app using logs, breakpoints, and tests",
        "Build an API-backed feature through a structured Git workflow",
        "Complete an authenticated API workflow using Postman collections",
      ],
      competencyFocus: [
        "CodeReading",
        "Debugging",
        "VersionControl",
        "ApiInteraction",
        "ProgrammingLogic",
      ],
      exitStandard: {
        summary:
          "The learner can read small programs, modify behavior intentionally, diagnose common failures, build working features in a guided codebase, and work with external APIs.",
        gates: [
          {
            description:
              "Read an unfamiliar codebase and explain its data flow",
            competency: "CodeReading",
            requiredLevel: "Functional",
          },
          {
            description: "Identify bug cause from symptoms and verify the fix",
            competency: "Debugging",
            requiredLevel: "Functional",
          },
          {
            description: "Use Git branches, commits, and diffs safely",
            competency: "VersionControl",
            requiredLevel: "Assisted",
          },
          {
            description:
              "Make HTTP requests and handle API responses correctly",
            competency: "ApiInteraction",
            requiredLevel: "Assisted",
          },
        ],
        representativeLabs: [
          "Fix a broken form submission",
          "Trace an API request from UI to response",
          "Debug a failing TypeScript function",
          "Add validation to an existing feature",
        ],
      },
      courses: [
        {
          id: "course-software-engineering",
          title: "Practical Software Engineering",
          focus: "Code, debugging, version control, and project structure",
          outcome:
            "Learners can work on a real codebase, investigate failures, and make disciplined changes with version control.",
          lessons: [
            {
              id: "lesson-code-reading",
              title: "Read Code Before Writing Code",
              summary:
                "Build the skill of reading and understanding existing code \u2014 the most common engineering activity.",
              duration: "40 min",
              difficulty: "Core",
              objective:
                "Navigate an unfamiliar codebase, identify structure, trace data flow, and explain what code does before modifying it.",
              explanation: [
                "Engineers spend more time reading code than writing it. The ability to open an unfamiliar file and quickly understand its purpose, dependencies, and behavior is a **core professional skill**. Studies consistently show that developers spend 60–70 % of their time reading existing code, not writing new code. If you cannot read efficiently, every other skill slows down.",
                'Systematic reading starts with the **entry point** — the file where execution begins. In a Node.js project, this is typically `index.js`, `index.ts`, `server.js`, or whatever the `"main"` field in `package.json` points to. Open `package.json` first and look for the `"main"` or `"scripts"` section — it tells you where the application starts.',
                "From the entry point, trace **imports** and **function calls** outward. Every `import` or `require()` statement is a link to another module. Follow those links to build a map of the codebase. Your goal is to understand the **data flow**: where data enters the system, how it is transformed, and where it exits (as a response, a file write, or a log).",
                "VS Code has three navigation shortcuts you will use constantly: `F12` (**Go to Definition**) jumps to where a function or variable is declared. `Shift+F12` (**Find All References**) shows every place a symbol is used. `Ctrl+Shift+O` opens the **Outline view**, which lists all functions and classes in the current file. These tools replace scrolling and guessing with precise, instant navigation.",
              ],
              demonstration: [
                'Start with `package.json` to find the entry point. Look for the `"main"` field or the `"scripts"` section:\n```json\n{\n  "name": "sample-app",\n  "main": "src/index.ts",\n  "scripts": {\n    "start": "ts-node src/index.ts",\n    "build": "tsc",\n    "test": "vitest"\n  },\n  "dependencies": {\n    "express": "^4.18.2"\n  }\n}\n```\nThe `"main"` field points to `src/index.ts` — that is where execution begins. The `"scripts"` section tells you how to operate the project. Always read this file first when you open a new codebase.',
                "Open `src/index.ts`. The `import` statements at the top reveal the module structure:\n```typescript\nimport { handleRequest } from './routes';\nimport { connectDB } from './db';\n\nconst app = express();\nawait connectDB();\napp.use('/api', handleRequest);\napp.listen(3000, () => console.log('Server running on port 3000'));\n```\nWithout reading a single implementation, you already know the architecture: the app connects to a database, routes API requests through `handleRequest`, and listens on port 3000. Click on `handleRequest` and press `F12` — VS Code jumps to its definition in `routes.ts`. This is **Go to Definition**.",
                "Inside `routes.ts`, trace the data flow through the handler:\n```typescript\nimport { fetchUser } from './db';\n\nexport function handleRequest(req: Request, res: Response) {\n  const userId = req.query.id as string;\n  const user = fetchUser(userId);\n  if (!user) {\n    return res.status(404).json({ error: 'User not found' });\n  }\n  res.json({ status: 'ok', user });\n}\n```\nThe function receives a `Request`, extracts a query parameter, calls `fetchUser()`, handles the not-found case, and returns JSON. Press `Shift+F12` on `fetchUser` to see every place it is called — this is **Find All References**. You now have a mental map: entry point → route handler → data fetch → response.",
                "Press `Ctrl+Shift+O` to open the **Outline view**, which lists every symbol in the current file without scrolling:\n```\nOUTLINE\n  ▸ handleRequest(req, res)    — line 3\n  ▸ validateAuth(req)          — line 12\n  ▸ formatResponse(data)       — line 20\n```\nWhat goes wrong without this system: opening a random file and reading top-to-bottom wastes hours in a large codebase. The pattern is always: **entry point → imports → data flow → behaviour**. Follow this sequence and you will understand any project in minutes, not hours.",
              ],
              exerciseSteps: [
                "Open the provided starter project and read `package.json` to find the entry point file.",
                "Open the entry point and use `F12` (Go to Definition) to navigate to at least two imported functions.",
                "Trace one data path from input to output and write a one-sentence description of what it does.",
              ],
              validationChecks: [
                "User identifies the entry point by reading `package.json` or recognizing the conventional filename.",
                "User uses `F12` or `Shift+F12` to navigate between modules instead of scrolling.",
                "User describes a data flow path through the code in their own words.",
              ],
              retention: [
                "Read before you write \u2014 always.",
                "Entry point \u2192 imports \u2192 data flow \u2192 behavior.",
                "VS Code navigation tools are faster than scrolling.",
              ],
              tools: ["Visual Studio Code", "terminal"],
              notesPrompt:
                "Describe your code reading process in three steps. Note which VS Code shortcuts helped you navigate.",
              exercises: [
                {
                  id: "entry-point",
                  title: "Find the entry point",
                  prompt:
                    "In a Node.js project, what file typically serves as the main entry point?",
                  placeholder: "Filename",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "index.js",
                    "index.ts",
                    "server.js",
                    "app.js",
                    "main.js",
                  ],
                  successMessage:
                    "Correct. The entry point is where execution begins \u2014 always find it first.",
                  hint: "Look at the 'main' field in package.json or common naming conventions.",
                  assessmentType: "action",
                },
                {
                  id: "goto-def",
                  title: "Navigate code",
                  prompt:
                    "What VS Code shortcut jumps to the definition of a function or variable?",
                  placeholder: "Key combination",
                  validationMode: "includes",
                  acceptedAnswers: ["f12"],
                  successMessage:
                    "Correct. F12 (Go to Definition) is essential for code navigation.",
                  hint: "It is a single function key.",
                  assessmentType: "action",
                },
                {
                  id: "find-all-references",
                  title: "Trace usage across files",
                  prompt:
                    "What VS Code shortcut shows every place a function or variable is used across the codebase?",
                  placeholder: "Keyboard shortcut",
                  validationMode: "includes",
                  acceptedAnswers: ["shift+f12", "Shift+F12", "shift f12"],
                  successMessage:
                    "Correct. Shift+F12 opens the References panel, showing every location where the symbol is used \u2014 critical for understanding impact before making changes.",
                  hint: "It is a variation of the F12 shortcut you already know, with the Shift modifier.",
                  assessmentType: "action" as const,
                },
              ],
              transferTask: {
                id: "transfer-code-reading",
                title: "Transfer challenge: navigate an unfamiliar codebase",
                prompt:
                  "You are handed a project you have never seen. Describe your first five steps to understand its structure and main behavior, including which files you open first and which VS Code features you use.",
                placeholder: "Code reading strategy",
                validationMode: "includes",
                acceptedAnswers: [
                  "entry point",
                  "package.json",
                  "import",
                  "definition",
                  "f12",
                  "structure",
                  "trace",
                ],
                successMessage:
                  "Transfer evidence accepted. You described a systematic approach to reading unfamiliar code.",
                hint: "Start with the entry point, trace imports, use Go to Definition, and map the module structure.",
                assessmentType: "transfer",
              },
              competencies: [
                { track: "CodeReading", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "step-by-step",
              codeExercises: [
                {
                  id: "code-read-trace-flow",
                  title: "Trace data through a function chain",
                  description:
                    "Read the code below and fill in the missing return statement in processOrder so the pipeline produces the correct output. Trace the data from createOrder through applyDiscount to processOrder.",
                  starterCode:
                    "function createOrder(item, qty) {\n  return { item, qty, total: qty * 10 };\n}\n\nfunction applyDiscount(order) {\n  return { ...order, total: order.total * 0.9 };\n}\n\nfunction processOrder(item, qty) {\n  const order = createOrder(item, qty);\n  const discounted = applyDiscount(order);\n  // Return the final total\n  return discounted.total;\n}\n\nconsole.log(processOrder('Widget', 5)); // 45",
                  language: "javascript",
                  hint: "Follow the data: createOrder builds the object, applyDiscount modifies total, processOrder should return the final total from the discounted object.",
                  acceptedPatterns: ["discounted.total", "return discounted"],
                },
                {
                  id: "code-read-find-bug",
                  title: "Spot the bug by reading",
                  description:
                    "This function should return the full name by joining first and last with a space, but it returns the wrong result. Read the code, find the bug, and fix it without running it first.",
                  starterCode:
                    "function getFullName(user) {\n  return user.first + user.last;\n}\n\n// Expected: 'Jane Doe'\nconsole.log(getFullName({ first: 'Jane', last: 'Doe' }));",
                  language: "javascript",
                  hint: "The function joins first and last directly. What is missing between them?",
                  acceptedPatterns: [
                    "+ ' ' +",
                    '+ " " +',
                    "` `",
                    "${user.first} ${user.last}",
                  ],
                },
              ],
            },
            {
              id: "lesson-debugging",
              title: "Debug Systems Instead of Guessing",
              summary:
                "Learn the habits that separate deliberate engineering from random trial-and-error.",
              duration: "50 min",
              difficulty: "Core",
              objective:
                "Observe symptoms, isolate causes, test hypotheses, and verify the fix with evidence.",
              explanation: [
                "Debugging is not a talent trick. It is **disciplined investigation**. Engineers who debug effectively follow a repeatable process instead of changing random lines hoping something sticks. The difference between junior and senior debugging is not intelligence — it is method.",
                "The **debugging loop** has five steps: **reproduce** the failure reliably, **inspect** the actual data (logs, variables, inputs), **narrow** the scope to the smallest code area that could cause the symptom, **hypothesize** a specific cause, and **verify** both the fix and the original failure condition. Skipping any step invites wasted time.",
                "Reproducing the bug means making it happen on demand. If you cannot trigger the failure consistently, you cannot confirm whether a change fixed it. Write down the exact steps: what input, what action, what you expected, what happened instead. This is your **reproduction case**.",
                "Adding `console.log()` statements at function boundaries is the quickest way to see what data is actually flowing through code. Log the inputs and outputs of each function in the suspected chain. When expected output diverges from actual output, you have found the region where the bug lives. From there, the fix is usually small and obvious.",
              ],
              demonstration: [
                "The practice app has a broken checkout function. Running the app and clicking Checkout shows an error in the browser console:\n```\nTypeError: Cannot read properties of undefined (reading 'price')\n    at calculateTotal (src/checkout.js:8:22)\n    at handleCheckout (src/checkout.js:3:15)\n    at HTMLButtonElement.onclick (index.html:12:1)\n```\nThe first step is to **reproduce** this consistently — click Checkout, see the TypeError every time. Consistent reproduction confirmed.",
                "Next, add a `console.log()` at the top of `calculateTotal` to inspect its input:\n```js\nfunction calculateTotal(items) {\n  console.log('items:', items);\n  return items.reduce((sum, item) => sum + item.price, 0);\n}\n```\nRefresh and click Checkout again. The console output:\n```\nitems: undefined\nTypeError: Cannot read properties of undefined (reading 'price')\n```\nThe input is `undefined` — the bug is not in `calculateTotal` itself but in whatever calls it and passes `undefined` instead of the items array.",
                "Trace the call one level up. `handleCheckout()` calls `calculateTotal(cart.items)`. Add a log for `cart`:\n```js\nfunction handleCheckout() {\n  console.log('cart:', cart);\n  const total = calculateTotal(cart.items);\n  displayTotal(total);\n}\n```\nThe console shows:\n```\ncart: {}\n```\nThe cart object exists but has no `items` property — it was initialised as `const cart = {}` instead of `const cart = { items: [] }`. Fix the initialisation:\n```js\nconst cart = { items: [] };  // was: const cart = {}\n```",
                "After fixing, re-run the exact reproduction case — click Checkout. The console now shows:\n```\ncart: { items: [] }\nitems: []\nTotal: $0.00\n```\nThe TypeError is gone and the total displays correctly. This is the **verification step** — a fix is only complete when the original failure no longer occurs and the expected behaviour works.",
              ],
              exerciseSteps: [
                "Reproduce the bug by following the exact steps described in the bug report.",
                "Add a `console.log()` at the function boundary to inspect the actual input and write down one hypothesis about the cause.",
                "Make the smallest code change that addresses your hypothesis, then re-run the reproduction case to verify the fix.",
              ],
              validationChecks: [
                "User reproduces the bug consistently before making any code changes.",
                "User inspects actual data (using `console.log()` or the debugger) instead of guessing.",
                "User verifies the fix by re-running the original reproduction case and confirming expected behavior.",
              ],
              retention: [
                "Reproduce before changing code.",
                "Evidence beats confidence.",
                "A fix is incomplete until verified.",
              ],
              tools: ["Visual Studio Code", "terminal", "test runner", "Git"],
              notesPrompt:
                "Record one debugging habit you want to adopt immediately and one anti-pattern you want to stop using.",
              exercises: [
                {
                  id: "debug-loop",
                  title: "First step",
                  prompt:
                    "What should you do before editing code when investigating a reported bug?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: ["reproduce", "observe", "confirm the bug"],
                  successMessage:
                    "Correct. Reproduction establishes a stable target for investigation.",
                  hint: "Think about the first reliable move in a debugging loop.",
                  assessmentType: "debugging",
                },
                {
                  id: "verification-loop",
                  title: "Close the loop",
                  prompt:
                    "After making a fix, what must you do to know the work is complete?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: ["verify", "test", "re-run", "confirm"],
                  successMessage:
                    "Correct. Verification is what turns a code change into an engineering result.",
                  hint: "The answer is not \u2018commit it\u2019.",
                  assessmentType: "debugging",
                },
                {
                  id: "narrow-scope",
                  title: "Narrow the scope",
                  prompt:
                    "During debugging, how do you confirm which function is producing the wrong value \u2014 before changing any code?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "console.log",
                    "log",
                    "print",
                    "breakpoint",
                    "inspect",
                    "debugger",
                  ],
                  successMessage:
                    "Correct. Adding console.log or setting breakpoints lets you observe actual values at specific points \u2014 narrowing the cause before you edit anything.",
                  hint: "Think about inserting observation points to see what the code is actually doing at each step.",
                  assessmentType: "reasoning" as const,
                },
              ],
              transferTask: {
                id: "transfer-debug-triage",
                title: "Transfer challenge: triage an unknown bug",
                prompt:
                  "A teammate says: 'Checkout fails for some users.' Outline the first three debugging steps you would run and what evidence each step should produce.",
                placeholder: "Step 1..., Step 2..., Step 3...",
                validationMode: "includes",
                acceptedAnswers: [
                  "reproduce",
                  "logs",
                  "hypothesis",
                  "verify",
                  "test",
                  "evidence",
                ],
                successMessage:
                  "Transfer evidence accepted. Your plan follows a reproducible debugging loop.",
                hint: "Start with reproduction, then gather evidence, then verify the fix criteria.",
                assessmentType: "transfer",
              },
              competencies: [{ track: "Debugging", targetLevel: "Functional" }],
              scaffoldingLevel: "step-by-step",
              codeExercises: [
                {
                  id: "debug-null-dereference",
                  title: "Fix a null dereference crash",
                  description:
                    "This function crashes with 'TypeError: Cannot read properties of null (reading \\'name\\')'. Add a guard so the function returns 'Unknown' when user is null instead of crashing.",
                  starterCode:
                    "function getDisplayName(user) {\n  return user.name.toUpperCase();\n}\n\nconsole.log(getDisplayName(null)); // should print 'Unknown'",
                  language: "javascript",
                  hint: "Add an if check at the top of the function. If user is null or undefined, return a safe default.",
                  acceptedPatterns: [
                    "if (!user)",
                    "if (user === null)",
                    "user?.",
                    "Unknown",
                  ],
                },
                {
                  id: "debug-off-by-one",
                  title: "Fix an off-by-one error",
                  description:
                    "This loop skips the last item in the array. Fix the condition so all four elements are processed and the output is ['A', 'B', 'C', 'D'].",
                  starterCode:
                    "const items = ['a', 'b', 'c', 'd'];\nconst result = [];\nfor (let i = 0; i < items.length - 1; i++) {\n  result.push(items[i].toUpperCase());\n}\nconsole.log(result); // should be ['A', 'B', 'C', 'D']",
                  language: "javascript",
                  hint: "The loop condition uses items.length - 1. Remove the - 1 to include the last element.",
                  acceptedPatterns: [
                    "i < items.length;",
                    "i < items.length )",
                    "i <= items.length -",
                  ],
                },
              ],
            },
            {
              id: "lesson-project-structure",
              title: "Project Structure and Dependencies",
              summary:
                "Understand how projects are organized, what configuration files do, and how dependencies are managed.",
              duration: "45 min",
              difficulty: "Core",
              objective:
                "Navigate a project, understand package.json, manage dependencies, and reason about project configuration.",
              explanation: [
                "Every professional project has a **structure**: source code, configuration, dependencies, tests, and build artifacts. Understanding this structure is required before you can contribute effectively. When you clone a repo, the first thing you read is the file tree — not the code.",
                '`package.json` is the identity card of a Node.js project. It stores the project name, version, scripts, and dependency lists. The `"scripts"` section defines commands you can run with `npm run <name>` — for example, `npm run dev` typically starts the development server. Always read this section when joining a project.',
                "Dependencies are listed in two groups. **`dependencies`** are packages the application needs at runtime (e.g., `express`, `react`). **`devDependencies`** are packages needed only during development — linters, test frameworks, build tools. The distinction matters because production deployments should install only `dependencies` to keep the bundle small and the attack surface minimal.",
                "When you run `npm install`, npm reads `package.json`, resolves every dependency (and their sub-dependencies), downloads them into the `node_modules/` folder, and writes the exact resolved versions into `package-lock.json`. The **lock file** guarantees that every developer and CI server installs the same versions. It should always be committed to version control.",
              ],
              demonstration: [
                "Open the practice project in the terminal and examine the directory structure:\n```\nmy-app/\n├── package.json        ← project identity and dependencies\n├── package-lock.json   ← exact dependency versions\n├── tsconfig.json       ← TypeScript compiler settings\n├── .eslintrc.json      ← linter rules\n├── .gitignore          ← files Git should ignore\n├── src/\n│   ├── index.ts        ← entry point\n│   ├── routes.ts       ← request handlers\n│   └── db.ts           ← database helpers\n├── test/\n│   └── app.test.ts     ← tests\n└── node_modules/       ← installed dependencies (not committed)\n```\nEach file has a specific role: `package.json` defines the project, `tsconfig.json` configures the TypeScript compiler, `.eslintrc.json` configures the linter, `src/` holds source code, and `test/` holds tests. `node_modules/` is generated by `npm install` and never committed to Git.",
                'Open `package.json` and look at the `"scripts"` section:\n```json\n{\n  "scripts": {\n    "dev": "next dev",\n    "build": "next build",\n    "lint": "eslint ."\n  }\n}\n```\nThese are the commands you use to operate the project. Run `npm run dev` to start the dev server. Run `npm run build` to create a production build. Run `npm run lint` to check for code quality issues.',
                "Now install dependencies by running `npm install` in the terminal:\n```bash\nnpm install\n# added 847 packages in 12s\n```\nThe output shows how many packages were installed. Open `package-lock.json` — this file records the exact version of every package, including transitive dependencies. If you delete `node_modules/` and run `npm install` again, the lock file ensures you get the exact same versions.",
              ],
              exerciseSteps: [
                'Open the `package.json` of the practice project and identify the project name, the `"scripts"` section, and the list of `dependencies` and `devDependencies`.',
                "Run `npm install` in the terminal to install all dependencies, then confirm that `node_modules/` was created.",
                "Run `npm run dev` (or whichever script starts the development server) and verify the application starts successfully.",
              ],
              validationChecks: [
                'User can identify the purpose of `"scripts"`, `"dependencies"`, and `"devDependencies"` in `package.json`.',
                "User understands that `dependencies` are for runtime and `devDependencies` are for development tooling only.",
                "User can run scripts defined in `package.json` using `npm run <name>`.",
              ],
              retention: [
                "package.json is the project\u2019s identity card.",
                "The lock file ensures reproducible installs.",
                "Read the scripts section \u2014 it tells you how to operate the project.",
              ],
              tools: ["Visual Studio Code", "terminal", "npm"],
              notesPrompt:
                "List the five most important fields in package.json and what each one controls.",
              exercises: [
                {
                  id: "npm-install",
                  title: "Install dependencies",
                  prompt:
                    "What command installs all dependencies listed in package.json?",
                  placeholder: "npm ...",
                  validationMode: "includes",
                  acceptedAnswers: ["npm install", "npm i"],
                  successMessage:
                    "Correct. npm install reads package.json and downloads everything the project needs.",
                  hint: "It is the most common first command when cloning a project.",
                  assessmentType: "action",
                },
                {
                  id: "dev-vs-prod-deps",
                  title: "Dev vs production dependencies",
                  prompt:
                    "What is the difference between dependencies and devDependencies in package.json?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "production",
                    "development",
                    "build",
                    "runtime",
                    "deploy",
                    "test",
                    "not needed in production",
                  ],
                  successMessage:
                    "Correct. dependencies are needed at runtime; devDependencies are only needed during development (testing, building, linting).",
                  hint: "Think about which packages the app needs to run vs. which are only used while building or testing.",
                  assessmentType: "reasoning",
                },
              ],
              transferTask: {
                id: "transfer-project-onboard",
                title: "Transfer challenge: onboard onto a new project",
                prompt:
                  "You clone a repo for the first time. Describe the order in which you inspect the project: which files you read, what commands you run, and how you verify the project works locally.",
                placeholder: "Onboarding steps",
                validationMode: "includes",
                acceptedAnswers: [
                  "package.json",
                  "npm install",
                  "scripts",
                  "readme",
                  "run",
                  "dev",
                ],
                successMessage:
                  "Transfer evidence accepted. You described a repeatable onboarding workflow.",
                hint: "Start with README and package.json, install dependencies, then run the dev script.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "project-structure-mkdir",
                  title: "Create project directory structure",
                  description:
                    "Write bash commands to create a standard Node.js project structure with src/, test/, and docs/ directories.",
                  starterCode: "# Create the project directories\n",
                  language: "bash",
                  hint: "Use 'mkdir -p' to create nested directories in one command.",
                  acceptedPatterns: [
                    "mkdir -p src",
                    "mkdir -p test",
                    "mkdir -p docs",
                  ],
                },
                {
                  id: "project-structure-tree",
                  title: "Display project structure",
                  description:
                    "Write the command to display a tree view of the project directory structure.",
                  starterCode: "# Show directory tree\n",
                  language: "bash",
                  hint: "Use 'tree' command or 'find' with formatting to show directory structure.",
                  acceptedPatterns: ["tree", "find . -type d"],
                },
              ],
              competencies: [
                { track: "ProgrammingLogic", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "step-by-step",
            },
            {
              id: "lesson-package-management",
              title: "Package Management: Semver, Audits, and Lock Files",
              summary:
                "Master version pinning, security auditing, and the role of lock files in reproducible builds.",
              duration: "40 min",
              difficulty: "Core",
              objective:
                "Read semver ranges, upgrade packages deliberately, run npm audit, and explain why lock files matter.",
              explanation: [
                "**Semver** (semantic versioning) uses three numbers: `MAJOR.MINOR.PATCH`. A `MAJOR` bump means breaking changes. A `MINOR` bump adds new features without breaking existing ones. A `PATCH` bump fixes bugs. For example, `2.3.1` means major version 2, minor version 3, patch 1.",
                "In `package.json`, version ranges control how aggressively npm upgrades. The **caret** (`^2.3.1`) allows `MINOR` and `PATCH` upgrades — so npm would install `2.4.0` or `2.3.5` but never `3.0.0`. The **tilde** (`~2.3.1`) allows only `PATCH` upgrades — so npm would install `2.3.5` but not `2.4.0`. An **exact** version (`2.3.1` with no prefix) locks to that specific release.",
                "`npm audit` scans every installed dependency for **known security vulnerabilities** and reports severity levels (low, moderate, high, critical). Run it immediately after `npm install` on any project. If vulnerabilities are found, `npm audit fix` attempts to upgrade affected packages to patched versions automatically. It is the first security check every developer should run.",
                "**Lock files** (`package-lock.json` or `yarn.lock`) record the exact resolved version of every dependency — including transitive ones — so every install is identical regardless of when or where it runs. Without a lock file, two developers running `npm install` a week apart could get different versions. Commit your lock file to version control — it is the contract for reproducible installs.",
              ],
              demonstration: [
                'Open `package.json` and examine the dependency versions:\n```json\n{\n  "dependencies": {\n    "express": "^4.18.2",\n    "dotenv": "^16.3.1"\n  },\n  "devDependencies": {\n    "typescript": "~5.3.2",\n    "eslint": "8.56.0",\n    "@types/express": "^4.17.21"\n  }\n}\n```\nNotice the version prefixes: `^4.18.2` (caret — allows minor and patch upgrades within 4.x), `~5.3.2` (tilde — allows only patch upgrades within 5.3.x), and `8.56.0` (no prefix — pinned to that exact version). Understanding these prefixes tells you how much version drift is possible.',
                "Run `npm outdated` in the terminal to see which packages have newer versions available:\n```bash\nnpm outdated\n# Package     Current  Wanted  Latest\n# express     4.18.2   4.19.1  4.19.1\n# typescript  5.3.2    5.3.3   5.4.5\n```\n`Current` is what is installed. `Wanted` is the newest version allowed by the semver range in `package.json`. `Latest` is the newest version published. If `Latest` is a major version ahead, upgrading requires checking for breaking changes.",
                "Now run `npm audit` to check for security issues:\n```bash\nnpm audit\n# found 2 vulnerabilities (1 moderate, 1 high)\n```\nThe report lists each vulnerability, the affected package, and the severity. Run `npm audit fix` to apply automatic patches. After fixing, inspect the `package-lock.json` diff with `git diff package-lock.json` to confirm which versions actually changed.",
                "When things go wrong with package management, the error output tells you exactly what happened. If `npm audit` finds vulnerabilities, you see a structured table with severity, package name, and fix availability:\n```bash\nnpm audit\n# ┌───────────────┬──────────────────────────────────────────────────┐\n# │ High          │ Prototype Pollution in lodash                    │\n# ├───────────────┼──────────────────────────────────────────────────┤\n# │ Package       │ lodash                                           │\n# │ Patched in    │ >=4.17.21                                        │\n# │ Dependency of │ my-app                                           │\n# │ Path          │ my-app > lodash                                  │\n# └───────────────┴──────────────────────────────────────────────────┘\n# found 3 vulnerabilities (1 low, 1 moderate, 1 high)\n```\nIf `npm install` fails due to a version conflict, you see an `ERESOLVE` error:\n```bash\nnpm install some-package\n# npm ERR! code ERESOLVE\n# npm ERR! ERESOLVE unable to resolve dependency tree\n# npm ERR! Found: react@18.2.0\n# npm ERR! Could not resolve dependency:\n# npm ERR! peer react@\"^17.0.0\" from some-package@1.0.0\n# npm ERR! Fix the upstream dependency conflict, or retry\n# npm ERR! with --force or --legacy-peer-deps\n```\nThe `ERESOLVE` error means a package requires a version of a peer dependency that conflicts with what is already installed. Read the `Found` and `Could not resolve` lines to identify the version mismatch.",
              ],
              exerciseSteps: [
                "Open the `package.json` of the practice project and categorize each dependency as `^` (caret), `~` (tilde), or exact-pinned.",
                "Run `npm outdated` and identify at least one package with an available minor update.",
                "Run `npm audit` and note the severity of any findings. If vulnerabilities exist, run `npm audit fix`.",
              ],
              validationChecks: [
                "User can explain the difference between `^` (caret — allows minor+patch) and `~` (tilde — allows patch only) version ranges.",
                "User can run `npm outdated` and interpret the Current, Wanted, and Latest columns.",
                "User understands that the lock file must be committed to version control to guarantee reproducible installs.",
              ],
              retention: [
                "^ allows non-breaking upgrades; ~ allows only bug fixes.",
                "npm audit is a one-command security scan — run it at install time.",
                "Commit your lock file — it is the contract for reproducible installs.",
              ],
              tools: ["terminal", "npm"],
              notesPrompt:
                "Write a semver cheat sheet: what ^ means, what ~ means, what exact pinning means, and when you'd choose each.",
              exercises: [
                {
                  id: "semver-caret",
                  title: "Caret range meaning",
                  prompt:
                    "A package is listed as ^2.3.1 in package.json. Which type of upgrade will npm install automatically?",
                  placeholder: "MAJOR / MINOR / PATCH",
                  validationMode: "includes",
                  acceptedAnswers: ["minor", "patch", "minor and patch"],
                  successMessage:
                    "Correct. ^ pins the MAJOR version and allows compatible MINOR and PATCH upgrades.",
                  hint: "The caret keeps the left-most non-zero digit fixed.",
                  assessmentType: "action",
                },
                {
                  id: "lock-file-purpose",
                  title: "Lock file purpose",
                  prompt:
                    "Why should package-lock.json be committed to version control?",
                  placeholder: "Reason",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "reproducible",
                    "identical",
                    "same version",
                    "consistent",
                    "exact",
                  ],
                  successMessage:
                    "Correct. The lock file guarantees every developer and CI run installs the same exact versions.",
                  hint: "Think about what happens if two developers run npm install a month apart without it.",
                  assessmentType: "action",
                },
                {
                  id: "save-dev-flag",
                  title: "Dev vs production dependencies",
                  prompt:
                    "A linting tool like ESLint is needed during development but not in production. Which flag do you use with npm install to save it as a dev dependency?",
                  placeholder: "npm install flag",
                  validationMode: "includes",
                  acceptedAnswers: ["--save-dev", "-D", "devDependencies"],
                  successMessage:
                    "Correct. --save-dev (or -D) puts the package in devDependencies, keeping production installs lean and secure.",
                  hint: "There is a specific npm install flag that puts packages in the devDependencies section of package.json.",
                  assessmentType: "action" as const,
                },
              ],
              transferTask: {
                id: "transfer-dependency-audit",
                title: "Transfer challenge: audit a project's dependencies",
                prompt:
                  "A project has not been updated in 6 months. Describe the commands you would run to check for outdated packages and security vulnerabilities, and how you decide which updates to apply.",
                placeholder: "Audit workflow",
                validationMode: "includes",
                acceptedAnswers: [
                  "npm outdated",
                  "npm audit",
                  "semver",
                  "major",
                  "minor",
                  "lock",
                  "breaking",
                ],
                successMessage:
                  "Transfer evidence accepted. You demonstrated a deliberate dependency management workflow.",
                hint: "Run npm outdated, check npm audit, then prioritize security fixes before feature upgrades.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "npm-install-package",
                  title: "Install a package",
                  description:
                    "Write the npm command to install the 'lodash' package as a development dependency.",
                  starterCode: "# Install lodash as dev dependency\n",
                  language: "bash",
                  hint: "Use npm install with --save-dev or -D flag.",
                  acceptedPatterns: ["npm install", "lodash", "--save-dev"],
                },
                {
                  id: "npm-audit-fix",
                  title: "Run security audit",
                  description:
                    "Write the command to run a security audit on project dependencies and automatically fix vulnerabilities.",
                  starterCode: "# Audit and fix security issues\n",
                  language: "bash",
                  hint: "Use npm audit fix to automatically resolve security issues.",
                  acceptedPatterns: ["npm audit fix"],
                },
              ],
              competencies: [
                { track: "ProgrammingLogic", targetLevel: "Functional" },
                {
                  track: "ConfigurationAndEnvironments",
                  targetLevel: "Functional",
                },
              ],
              scaffoldingLevel: "goal-driven",
            },
            {
              id: "lesson-programming-logic",
              title: "Variables, Functions, and Control Flow",
              summary:
                "Build the mental model for how programs store data, make decisions, and repeat work.",
              duration: "50 min",
              difficulty: "Core",
              objective:
                "Declare variables, write functions, apply if/else branching, and loop over data to produce predictable results.",
              explanation: [
                "Programs are sequences of **decisions** and **repetitions**. Three building blocks make up virtually all programming logic: **variables** store data, **functions** package reusable logic, and **control flow** (`if`/`else`, loops) governs which code runs and how many times.",
                "In TypeScript, you declare variables with `const` (for values that never change) or `let` (for values that will be reassigned). `const` is preferred by default because it makes intent clear and prevents accidental mutation. Example:\n```ts\nconst name: string = 'Alice';\nlet score: number = 0;\nscore = 10; // allowed with let\n// name = 'Bob'; // ERROR with const\n```",
                "A **function** packages reusable logic behind a name. In TypeScript, you annotate the parameter types and the return type so the compiler can verify every call is correct:\n```ts\nfunction greet(name: string): string {\n  return `Hello, ${name}!`;\n}\n```\nThe return type annotation (`: string` after the parentheses) tells both the compiler and the reader what the function produces.",
                "`if`/`else` branches execute different code based on a condition. The condition must be a boolean expression — something that evaluates to `true` or `false`:\n```ts\nif (score > 50) {\n  console.log('Pass');\n} else {\n  console.log('Fail');\n}\n```\nLoops automate repetition. `for` loops with an index and `for...of` loops over arrays are the most common patterns. `forEach` is a method on arrays that calls a function for each element: `items.forEach(item => console.log(item))`.",
                "**Short-circuit evaluation** means `&&` and `||` do not always evaluate both sides. With `&&`, if the left side is falsy the right side never runs: `user && user.name` safely returns `undefined` instead of crashing when `user` is null. With `||`, the first truthy value wins: `input || 'default'` returns `'default'` when `input` is empty. JavaScript has six **falsy values**: `false`, `0`, `''` (empty string), `null`, `undefined`, and `NaN` — everything else is truthy, including empty arrays `[]` and empty objects `{}`. Understanding falsy values prevents subtle bugs: `if (count)` fails when `count` is legitimately `0`, because `0` is falsy. Use explicit checks like `if (count !== undefined)` when zero is a valid value.",
              ],
              demonstration: [
                "Start by declaring a typed constant and a mutable variable:\n```ts\nconst learnerName: string = 'Alex';\nlet attempts: number = 0;\nattempts += 1;\nconsole.log(learnerName, attempts); // Alex 1\n```\n`const` prevents reassignment of `learnerName`. `let` allows `attempts` to be updated.",
                "Next, write a function with typed parameters and a return type:\n```ts\nfunction summarize(name: string, score: number): string {\n  if (score >= 80) {\n    return `${name}: excellent`;\n  } else {\n    return `${name}: needs practice`;\n  }\n}\nconsole.log(summarize('Alex', 85)); // Alex: excellent\n```\nThe `if`/`else` inside the function demonstrates branching — the return value depends on the condition.",
                "Finally, loop over an array using `forEach`:\n```ts\nconst scores: number[] = [72, 85, 91, 68];\nscores.forEach(s => {\n  console.log(summarize('Learner', s));\n});\n// Learner: needs practice\n// Learner: excellent\n// Learner: excellent\n// Learner: needs practice\n```\nThe type system follows the data through the iteration: `s` is inferred as `number` because `scores` is `number[]`. Type safety is automatic when you annotate the source.",
              ],
              exerciseSteps: [
                "Declare a `const` for a learner's name (type `string`) and a `let` for their score (type `number`).",
                "Write a function that accepts a `number` parameter and returns a `string` summary, using a `: string` return type annotation.",
                "Add an `if`/`else` branch inside the function that returns different strings based on whether the input is above or below a threshold.",
              ],
              validationChecks: [
                "User can write a `const` declaration with a type annotation and a `let` declaration that is later reassigned.",
                "User defines a function with typed parameters (e.g., `value: number`) and a return type annotation (e.g., `: string`).",
                "User uses an `if`/`else` block with a boolean condition to produce different outputs.",
              ],
              retention: [
                "const is for values that don\u2019t change; let is for values that do.",
                "Functions should do one thing and name it clearly.",
                "Control flow only does what the condition actually tests \u2014 not what you intended.",
              ],
              tools: ["Visual Studio Code", "terminal", "TypeScript compiler"],
              notesPrompt:
                "Write your own cheat sheet: const vs let, function syntax, if/else pattern, and one loop example.",
              exercises: [
                {
                  id: "const-vs-let",
                  title: "Immutable vs mutable binding",
                  prompt:
                    "Which keyword declares a variable whose binding cannot be reassigned after initialisation?",
                  placeholder: "Keyword",
                  validationMode: "exact",
                  acceptedAnswers: ["const"],
                  successMessage:
                    "Correct. const prevents reassignment, making intent explicit and reducing accidental mutation.",
                  hint: "It is the counterpart to let and is preferred for values that don\u2019t change.",
                  assessmentType: "action",
                },
                {
                  id: "function-return-type",
                  title: "Return type annotation",
                  prompt:
                    "In TypeScript, where do you write the return type of a function? (e.g., function greet(name: string): _____)",
                  placeholder: "Syntax position",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "after the closing parenthesis",
                    "after )",
                    ": string",
                    "after params",
                    "colon after",
                  ],
                  successMessage:
                    "Correct. The return type annotation comes after the closing parenthesis of the parameter list.",
                  hint: "It appears between the ) and the opening { of the function body.",
                  assessmentType: "action",
                },
                {
                  id: "if-else-branch",
                  title: "Conditional branching",
                  prompt:
                    "What keyword introduces the alternative path when an if condition is false?",
                  placeholder: "Keyword",
                  validationMode: "exact",
                  acceptedAnswers: ["else"],
                  successMessage:
                    "Correct. else handles the case where the if condition is not met.",
                  hint: "It follows the closing brace of the if block.",
                  assessmentType: "action",
                },
              ],
              transferTask: {
                id: "transfer-programming-logic",
                title: "Transfer challenge: trace a function",
                prompt:
                  "A function receives a number. If the number is above 50, it returns 'high'. Otherwise it returns 'low'. Write the TypeScript function signature and body in your own words, including the type annotations.",
                placeholder: "function classify(value: number): ...",
                validationMode: "includes",
                acceptedAnswers: ["number", "string", "if", "return", "50"],
                successMessage:
                  "Transfer evidence accepted. Your function captures the typed conditional pattern correctly.",
                hint: "Include the parameter type, the return type, an if condition, and two return statements.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "write-classify-function",
                  title: "Write a classify function",
                  description:
                    "Write a function called classify that accepts a number and returns 'high' if it is above 50, or 'low' otherwise. Include TypeScript type annotations for the parameter and return type.",
                  starterCode:
                    "function classify(value) {\n  // return 'high' if value > 50, 'low' otherwise\n}",
                  language: "typescript",
                  hint: "Add : number after the parameter name and : string after the parentheses. Use an if/else with a return in each branch.",
                  acceptedPatterns: [
                    "classify",
                    "value: number",
                    ": string",
                    "if",
                    "return",
                  ],
                },
                {
                  id: "fix-loop-accumulator",
                  title: "Fix a loop accumulator",
                  description:
                    "This function should return the sum of all numbers in the array, but it always returns 0. Fix the bug.",
                  starterCode:
                    "function sum(numbers: number[]): number {\n  let total = 0;\n  for (let i = 0; i < numbers.length; i++) {\n    let total = total + numbers[i];\n  }\n  return total;\n}\n\nconsole.log(sum([1, 2, 3])); // should print 6",
                  language: "typescript",
                  hint: "The let keyword inside the loop creates a new 'total' variable that shadows the outer one. Remove the re-declaration.",
                  acceptedPatterns: [
                    "total = total + numbers[i]",
                    "total += numbers[i]",
                    "total =",
                  ],
                },
              ],
              competencies: [
                { track: "ProgrammingLogic", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "step-by-step",
            },
            {
              id: "lesson-data-structures",
              title: "Arrays, Objects, and Data Manipulation",
              summary:
                "Learn to store, access, and transform collections of data using arrays and objects — the fundamental data structures in every JavaScript and TypeScript program.",
              duration: "50 min",
              difficulty: "Core",
              objective:
                "Create arrays and objects, access values with index and dot/bracket notation, and use core array methods to filter, map, and transform data.",
              explanation: [
                "An **array** is an ordered list of values. You create one with square brackets: `const items = ['a', 'b', 'c']`. Each value has a numeric **index** starting from zero — so `items[0]` returns `'a'`, `items[1]` returns `'b'`, and `items[2]` returns `'c'`. The `.length` property tells you how many elements the array contains (`items.length` is `3`). Arrays are **zero-indexed** because the index represents an offset from the start — the first element is zero steps away from the beginning.",
                "Arrays come with built-in **methods** that let you manipulate their contents. `.push('d')` adds an element to the end. `.pop()` removes the last element and returns it. `.includes('b')` returns `true` if the value exists in the array. `.indexOf('c')` returns the index where that value is found (or `-1` if missing). Two especially powerful methods create new arrays from existing ones: `.filter()` keeps only elements that pass a test (`items.filter(x => x !== 'a')` returns `['b', 'c']`), and `.map()` transforms every element (`items.map(x => x.toUpperCase())` returns `['A', 'B', 'C']`).",
                "An **object** is a collection of named properties. You create one with curly braces: `const user = { name: 'Alice', age: 25 }`. Access properties using **dot notation** (`user.name` returns `'Alice'`) or **bracket notation** (`user['name']` returns `'Alice'`). Use dot notation for known, fixed property names — it is shorter and clearer. Use bracket notation when the property name is stored in a variable (`const key = 'age'; user[key]`) or when the name contains special characters.",
                "The most common real-world pattern is an **array of objects** — a list where each item has named properties. For example: `const users = [{ name: 'Alice', age: 30 }, { name: 'Bob', age: 25 }]`. You access individual values by combining index and dot notation: `users[0].name` returns `'Alice'` and `users[1].age` returns `25`. Almost every API response, database result, and configuration file follows this pattern.",
                "**Destructuring** lets you extract values from objects and arrays into named variables in a single statement. For objects: `const { name, age } = user` pulls `name` and `age` out of `user`. For arrays: `const [first, ...rest] = items` assigns the first element to `first` and collects everything else into `rest`. The **spread operator** (`...`) also combines structures: `const merged = { ...defaults, ...overrides }` creates a new object with all properties from both, where `overrides` wins on any duplicate keys.",
                "JavaScript provides two additional collection types beyond arrays and plain objects. A **Set** stores unique values and provides O(1) lookup with `set.has(value)` — compared to `array.includes(value)` which is O(n) because it scans every element. Use a Set when you need fast membership checks or want to automatically deduplicate a list: `const unique = new Set([1, 2, 2, 3])` gives you `{1, 2, 3}`. A **Map** stores key-value pairs like an object but allows any type as a key (not just strings), guarantees iteration in insertion order, and provides `.size` for the count. Use Map over plain objects when keys are dynamic, non-string, or when you need ordered iteration. The time complexity intuition: `array.includes()` is O(n) because it walks the list; `Set.has()` and `Map.get()` are O(1) because they use hash-based lookup internally.",
              ],
              demonstration: [
                "Start by creating an array and working through common operations step by step:\n```typescript\nconst fruits = ['apple', 'banana', 'cherry'];\nconsole.log(fruits.length);  // 3\n\nfruits.push('date');\nconsole.log(fruits);  // ['apple', 'banana', 'cherry', 'date']\n\nconst removed = fruits.pop();\nconsole.log(removed);  // 'date'\nconsole.log(fruits);   // ['apple', 'banana', 'cherry']\n\nconst longNames = fruits.filter(f => f.length > 5);\nconsole.log(longNames);  // ['banana', 'cherry']\n\nconst uppercased = fruits.map(f => f.toUpperCase());\nconsole.log(uppercased);  // ['APPLE', 'BANANA', 'CHERRY']\n```\nEach method either modifies the original array (`.push()`, `.pop()`) or returns a new array (`.filter()`, `.map()`). Knowing which is which prevents accidental data mutation.",
                "Now create an object and explore property access. A realistic example is an API response:\n```typescript\nconst response = {\n  status: 200,\n  data: {\n    user: { name: 'Alice', email: 'alice@example.com' },\n    timestamp: '2025-01-15T10:30:00Z',\n  },\n};\n\nconsole.log(response.status);           // 200\nconsole.log(response.data.user.name);   // 'Alice'\nconsole.log(response.data.user.email);  // 'alice@example.com'\n\n// Modify a value\nresponse.data.user.name = 'Alice Smith';\nconsole.log(response.data.user.name);   // 'Alice Smith'\n```\nDot notation chains naturally for nested access. Each dot goes one level deeper into the structure.",
                "Finally, combine arrays of objects with filtering, mapping, and destructuring:\n```typescript\nconst users = [\n  { name: 'Alice', age: 30 },\n  { name: 'Bob', age: 17 },\n  { name: 'Carol', age: 25 },\n];\n\n// Filter: keep only users aged 18 or older\nconst adults = users.filter(u => u.age >= 18);\nconsole.log(adults);  // [{ name: 'Alice', age: 30 }, { name: 'Carol', age: 25 }]\n\n// Map: extract just the names\nconst names = users.map(u => u.name);\nconsole.log(names);  // ['Alice', 'Bob', 'Carol']\n\n// Destructure in a loop\nfor (const { name, age } of users) {\n  console.log(`${name} is ${age} years old`);\n}\n// Alice is 30 years old\n// Bob is 17 years old\n// Carol is 25 years old\n```\nThis pattern — filter, map, destructure — appears in nearly every professional codebase.",
              ],
              exerciseSteps: [
                "Create an array of at least four strings, access an element by index, and use `.filter()` to create a new array with only elements longer than four characters.",
                "Create an object with three properties, access each property using both dot notation and bracket notation, then modify one value and confirm the change.",
                "Build an array of three objects (each with `name` and `age`), filter for ages above 20, map to extract names, and destructure one object into individual variables.",
              ],
              validationChecks: [
                "User can create arrays and objects with correct syntax and access individual values by index, dot notation, or bracket notation.",
                "User can use `.filter()` and `.map()` to transform arrays without modifying the original data.",
                "User can destructure objects and arrays to extract values, and explain when to use bracket notation versus dot notation.",
              ],
              retention: [
                "Arrays use indexes (starting at 0). Objects use named keys. Arrays of objects combine both.",
                "`.filter()` keeps matching items; `.map()` transforms every item. Both return new arrays.",
                "Destructuring unpacks values: `const { name } = obj` for objects, `const [first] = arr` for arrays.",
              ],
              tools: [
                "Visual Studio Code",
                "TypeScript compiler",
                "terminal",
                "Node.js REPL",
              ],
              notesPrompt:
                "Write definitions for: array, object, index, dot notation, bracket notation, .filter(), .map(), destructuring, spread operator.",
              exercises: [
                {
                  id: "ds-array-access",
                  title: "Array index access",
                  prompt:
                    "Given `const items = ['a', 'b', 'c', 'd']`, what value does `items[2]` return?",
                  placeholder: "Value",
                  validationMode: "exact",
                  acceptedAnswers: ["c", "'c'", '"c"'],
                  successMessage:
                    "Correct. Arrays are zero-indexed, so index 2 is the third element.",
                  hint: "Index 0 is 'a', index 1 is 'b', index 2 is…",
                  assessmentType: "action",
                },
                {
                  id: "ds-filter-method",
                  title: "Array filter method",
                  prompt:
                    "Which array method creates a new array containing only items that pass a test?",
                  placeholder: "Method name",
                  validationMode: "includes",
                  acceptedAnswers: ["filter", ".filter", ".filter()"],
                  successMessage:
                    "Correct. `.filter()` accepts a callback and returns a new array with only the elements where the callback returned true.",
                  hint: "This method's name describes exactly what it does — it removes items that don't meet a condition.",
                  assessmentType: "reasoning",
                },
                {
                  id: "ds-object-dot-notation",
                  title: "Object dot notation",
                  prompt:
                    "How do you access the `email` property of a `user` object using dot notation?",
                  placeholder: "Expression",
                  validationMode: "exact",
                  acceptedAnswers: ["user.email"],
                  successMessage:
                    "Correct. Dot notation chains the object name, a dot, and the property name.",
                  hint: "The syntax is objectName.propertyName — no brackets or quotes needed.",
                  assessmentType: "action",
                },
                {
                  id: "ds-nested-access",
                  title: "Nested array-object access",
                  prompt:
                    "Given `const users = [{ name: 'Alice' }, { name: 'Bob' }]`, how do you get Bob's name?",
                  placeholder: "Expression",
                  validationMode: "exact",
                  acceptedAnswers: ["users[1].name"],
                  successMessage:
                    "Correct. Index 1 selects the second object, and `.name` accesses the property.",
                  hint: "Bob is the second element (index 1). Then use dot notation for the property.",
                  assessmentType: "action",
                },
              ],
              transferTask: {
                id: "ds-transfer-bookmarks",
                title: "Transfer challenge: design a bookmarks data model",
                prompt:
                  "Design a data model for a bookmarks app. Describe the structure as an array of objects (include at least `title`, `url`, and `tags` properties). Show how you would access the URL of the second bookmark, and write a `.filter()` expression that returns only bookmarks tagged with 'typescript'.",
                placeholder:
                  "const bookmarks = [{ title: ..., url: ..., tags: [...] }, ...];\nbookmarks[1].url\nbookmarks.filter(...)",
                validationMode: "includes",
                acceptedAnswers: [
                  "bookmarks",
                  "title",
                  "url",
                  "tags",
                  "filter",
                ],
                successMessage:
                  "Transfer evidence accepted. Your bookmarks model demonstrates array-of-objects design, property access, and filtering.",
                hint: "Define an array with at least two bookmark objects. Each object needs title, url, and tags (an array of strings). Then use index + dot notation for access, and .filter() with a callback that checks the tags array.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "ds-filter-even-numbers",
                  title: "Filter even numbers",
                  description:
                    "Given an array of numbers, use `.filter()` to create a new array containing only the even numbers.",
                  starterCode:
                    "const numbers = [1, 2, 3, 4, 5, 6, 7, 8, 9, 10];\n\n// Use .filter() to keep only even numbers\nconst evens = numbers.filter(/* your code here */);\n\nconsole.log(evens); // should print [2, 4, 6, 8, 10]",
                  language: "typescript",
                  hint: "A number is even when `n % 2 === 0`. Pass an arrow function to `.filter()` that tests this condition.",
                  acceptedPatterns: ["filter", "% 2", "=== 0"],
                },
                {
                  id: "ds-map-user-names",
                  title: "Map user objects to names",
                  description:
                    "Given an array of user objects, use `.map()` to create a new array containing only the name strings.",
                  starterCode:
                    "const users = [\n  { name: 'Alice', age: 30 },\n  { name: 'Bob', age: 25 },\n  { name: 'Carol', age: 28 },\n];\n\n// Use .map() to extract just the names\nconst names = users.map(/* your code here */);\n\nconsole.log(names); // should print ['Alice', 'Bob', 'Carol']",
                  language: "typescript",
                  hint: "Pass an arrow function to `.map()` that receives a user object and returns `user.name`.",
                  acceptedPatterns: ["map", ".name"],
                },
                {
                  id: "ds-destructure-object",
                  title: "Destructure an object",
                  description:
                    "Use object destructuring to extract the `name` and `email` properties from the `contact` object into individual variables.",
                  starterCode:
                    "const contact = { name: 'Alice', email: 'alice@example.com', role: 'admin' };\n\n// Destructure name and email from contact\n// Your code here\n\nconsole.log(name);  // should print 'Alice'\nconsole.log(email); // should print 'alice@example.com'",
                  language: "typescript",
                  hint: "Use `const { name, email } = contact;` to pull both values out in one statement.",
                  acceptedPatterns: ["const {", "name", "email", "} = contact"],
                },
              ],
              competencies: [
                { track: "ProgrammingLogic", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "step-by-step",
            },
            {
              id: "lesson-typescript-types",
              title: "TypeScript Types and Compile-Time Safety",
              summary:
                "Understand how TypeScript catches bugs before the code runs using the type system.",
              duration: "45 min",
              difficulty: "Core",
              objective:
                "Read TypeScript type annotations, interpret compile-time errors, and distinguish compile-time from runtime failures.",
              explanation: [
                "TypeScript adds a **type layer** on top of JavaScript. The TypeScript compiler (`tsc`) checks your code **before it runs** and reports errors as structured diagnostic messages. This is called **compile-time checking** — a completely different category from errors that happen at runtime.",
                "A **compile-time error** means the type system found a contradiction in your code before execution began. A **runtime error** means the code compiled successfully but behaved unexpectedly while running. Example compile error:\n```\nsrc/utils.ts(12,5): error TS2322: Type 'string' is not assignable to type 'number'.\n```\nThis tells you the file (`src/utils.ts`), the exact location (line 12, column 5), the error code (`TS2322`), and the conflicting types (`string` vs `number`).",
                "**Type annotations** make intent explicit. You can annotate variables (`let count: number`), function parameters (`function greet(name: string)`), and return types (`function add(a: number, b: number): number`). The compiler uses these annotations to verify that every value flows to a compatible destination.",
                "Two powerful type features you will see constantly: **interfaces** define the shape of an object, and **union types** allow a value to be one of several types. An interface describes what properties an object must have:\n```ts\ninterface User {\n  name: string;\n  age: number;\n}\n```\nA union type uses the `|` operator to allow alternatives: `let id: string | number;` means `id` can hold either a `string` or a `number`.",
              ],
              demonstration: [
                "Assign a number to a variable annotated as `string` and observe the compiler error:\n```ts\nlet greeting: string = 42;\n// error TS2322: Type 'number' is not assignable to type 'string'.\n```\nThe error message tells you exactly what went wrong: you tried to put a `number` where a `string` was expected. Fix it by changing the value to a string or changing the annotation.",
                "Define an interface and use it as a parameter type:\n```ts\ninterface User {\n  name: string;\n  email: string;\n}\n\nfunction greetUser(user: User): string {\n  return `Hello, ${user.name}!`;\n}\n\ngreetUser({ name: 'Alice', email: 'alice@example.com' }); // OK\ngreetUser({ name: 'Bob' }); // error: Property 'email' is missing\n```\nThe compiler enforces the interface contract — every caller must provide all required fields.",
                "Create a union type to allow flexible inputs:\n```ts\nfunction formatId(id: string | number): string {\n  return `ID-${id}`;\n}\nformatId(42);      // OK\nformatId('abc');   // OK\nformatId(true);    // error: Type 'boolean' is not assignable to type 'string | number'\n```\nThe `|` operator declares the set of allowed types. Anything outside that set is caught at compile time, before your code ever runs.",
                "When TypeScript catches multiple errors, the compiler reports every one with precise locations. Here is what realistic multi-error output looks like when you run `npx tsc --noEmit`:\n```\nsrc/handlers.ts(8,3): error TS2322: Type 'string' is not assignable to type 'number'.\nsrc/handlers.ts(15,20): error TS2345: Argument of type '{ name: string; }' is not assignable\n  to parameter of type 'User'.\n  Property 'email' is missing in type '{ name: string; }' but required in type 'User'.\nsrc/utils.ts(22,7): error TS7006: Parameter 'x' implicitly has an 'any' type.\n\nFound 3 errors in 2 files.\n```\nEach error includes the file, line, column, error code, and a description. `TS2322` is a type assignment mismatch. `TS2345` means an argument is missing required properties. `TS7006` means a parameter needs a type annotation (with `strict` mode enabled). Learn to read these codes — the compiler is giving you a roadmap to every fix.",
              ],
              exerciseSteps: [
                "Read a TypeScript compiler diagnostic (e.g., `error TS2322`) and identify which line, which types conflict, and what fix is needed.",
                "Declare an `interface` with two fields and annotate a function parameter with it.",
                "Explain when a union type (`string | number`) is more appropriate than a single type annotation.",
              ],
              validationChecks: [
                "User can read a TypeScript diagnostic and identify the conflicting types, the file, and the line number.",
                "User can write an `interface` and use it as a type annotation on a function parameter.",
                "User can explain the difference between a **compile-time error** (caught by `tsc` before running) and a **runtime error** (thrown by JavaScript while running).",
              ],
              retention: [
                "Compile-time: TypeScript found it before running. Runtime: JavaScript found it while running.",
                "Interfaces describe the shape of an object; union types allow a value to be one of several types.",
                "The TS compiler is your first reviewer \u2014 it reads your intent before anyone else does.",
              ],
              tools: ["Visual Studio Code", "TypeScript compiler", "terminal"],
              notesPrompt:
                "Write definitions for: type annotation, interface, union type, compile-time error, and runtime error.",
              exercises: [
                {
                  id: "ts-when-checked",
                  title: "When TypeScript checks",
                  prompt:
                    "When does TypeScript report a type error — before the code runs, or while it is running?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "before",
                    "compile",
                    "compile-time",
                    "compile time",
                    "tsc",
                  ],
                  successMessage:
                    "Correct. TypeScript performs static analysis before execution \u2014 that is why it is called compile-time checking.",
                  hint: "TypeScript produces diagnostics during a phase that happens before node or the browser ever runs anything.",
                  assessmentType: "reasoning",
                },
                {
                  id: "ts-union-type",
                  title: "Union type syntax",
                  prompt:
                    "What operator separates the alternatives in a TypeScript union type? (e.g., string ___ number)",
                  placeholder: "Symbol",
                  validationMode: "exact",
                  acceptedAnswers: ["|"],
                  successMessage:
                    "Correct. The pipe | declares that a value may be any one of the listed types.",
                  hint: "It is a single character used in bitwise OR in other contexts.",
                  assessmentType: "action",
                },
                {
                  id: "ts-interface",
                  title: "Interface keyword",
                  prompt:
                    "What TypeScript keyword defines a named shape for an object type?",
                  placeholder: "Keyword",
                  validationMode: "exact",
                  acceptedAnswers: ["interface"],
                  successMessage:
                    "Correct. interface declares a named contract that objects and parameters can be typed against.",
                  hint: "It starts with the letter i and is distinct from type aliases.",
                  assessmentType: "action",
                },
              ],
              transferTask: {
                id: "transfer-typescript-types",
                title: "Transfer challenge: interpret a type error",
                prompt:
                  "The compiler says: \"Argument of type 'string' is not assignable to parameter of type 'number'.\" Explain in plain language: what caused this error, when it occurred, and what change would fix it.",
                placeholder: "The error happened because...",
                validationMode: "includes",
                acceptedAnswers: [
                  "string",
                  "number",
                  "type",
                  "compile",
                  "change",
                  "annotation",
                ],
                successMessage:
                  "Transfer evidence accepted. You correctly interpreted the diagnostic and identified the fix path.",
                hint: "Address: what the function expected, what was passed, whether this is a compile or runtime error, and one concrete fix.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "add-type-annotation",
                  title: "Fix a type mismatch",
                  description:
                    "The function below causes a compile error because it returns a number but is annotated as returning a string. Fix the return type annotation so it matches what the function actually returns.",
                  starterCode:
                    "function add(a: number, b: number): string {\n  return a + b;\n}",
                  language: "typescript",
                  hint: "Change the return type annotation to match what a + b produces when both are numbers.",
                  acceptedPatterns: [": number", "number {"],
                },
                {
                  id: "define-interface",
                  title: "Define an interface",
                  description:
                    "Define a TypeScript interface called User with three properties: id (number), name (string), and active (boolean). Then create a variable of type User.",
                  starterCode:
                    "// Define the User interface\n\n// Create a user variable\nconst user = { id: 1, name: 'Alice', active: true };",
                  language: "typescript",
                  hint: "Use the interface keyword followed by the type name and property declarations with their types.",
                  acceptedPatterns: [
                    "interface User",
                    "id:",
                    "name:",
                    "active:",
                    "boolean",
                  ],
                },
              ],
              competencies: [
                { track: "ProgrammingLogic", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "goal-driven",
            },
            {
              id: "lesson-json-config",
              title: "Configuration Files and Environment Variables",
              summary:
                "Read, write, and reason about JSON config files and environment variables that shape application behaviour.",
              duration: "40 min",
              difficulty: "Core",
              objective:
                "Parse JSON syntax, identify common configuration files, and explain the role of environment variables in separating secrets from code.",
              explanation: [
                "**Configuration files** let teams change application behaviour without touching code. **JSON** (JavaScript Object Notation) is the most common format: it uses key-value pairs, arrays, nested objects, and strict syntax rules. Nearly every tool in the JavaScript ecosystem reads JSON for configuration.",
                'JSON syntax is stricter than JavaScript. Keys must be wrapped in double quotes (`"key"`). Values can be strings, numbers, booleans (`true`/`false`), `null`, arrays (`[]`), or nested objects (`{}`). JSON does **not** allow trailing commas, comments, or single quotes. These restrictions are the source of most parse errors:\n```json\n{\n  "appName": "my-app",\n  "port": 3000,\n  "debug": true\n}\n```\nNotice: no comma after the last property. Adding one would cause a `SyntaxError`.',
                "**Environment variables** keep secrets and deployment-specific values out of source code. A `.env` file stores them locally as `KEY=VALUE` pairs:\n```\nDATABASE_URL=postgres://localhost:5432/mydb\nAPI_SECRET=s3cret-t0ken\n```\nThe application reads them at startup using `process.env.DATABASE_URL`. This separation means you can change database URLs, API keys, and feature flags without modifying code.",
                "Secrets must **never** be committed to version control. Add `.env` to `.gitignore` so Git ignores it. Create a `.env.example` file (with placeholder values like `DATABASE_URL=your_url_here`) and commit that instead — it documents which variables the project needs without exposing real credentials.",
              ],
              demonstration: [
                'Open the practice project\'s `config.json` file. It contains a syntax error — a trailing comma after the last property:\n```json\n{\n  "appName": "my-app",\n  "port": 3000,\n  "debug": true,\n}\n```\nRunning the app produces: `SyntaxError: Unexpected token }`. Remove the trailing comma after `true` and the file parses correctly. Two other frequent JSON errors: **unquoted keys** (`{ port: 3000 }` is invalid — must be `{ "port": 3000 }`) and **single-quoted strings** (`{ \'name\': \'app\' }` is invalid — JSON requires double quotes exclusively).',
                "Now open the `.env` file:\n```\nDATABASE_URL=postgres://localhost:5432/mydb\nAPI_SECRET=s3cret-t0ken\nPORT=3000\n```\nIn the application code, find where these values are read:\n```typescript\nconst dbUrl = process.env.DATABASE_URL;\nconst secret = process.env.API_SECRET;\nconst port = process.env.PORT || 3000;\n```\nThis is how secrets stay out of source files — the code references the variable name, not the value. If someone reads the source code, they see `process.env.API_SECRET`, not the actual secret.",
                "Check `.gitignore` to confirm `.env` is listed. If it is not, add it immediately:\n```bash\necho .env >> .gitignore\ngit status\n# .gitignore modified, .env is now untracked\n```\nThen verify that `.env.example` exists in the repo with placeholder values so other developers know which variables to set up.",
              ],
              exerciseSteps: [
                "Open the provided JSON config file, locate the syntax error (trailing comma or missing quote), and fix it.",
                "Find where the application reads an environment variable (search for `process.env`) and identify which variable it depends on.",
                "Confirm that `.env` is listed in `.gitignore`. If it is not, add it.",
              ],
              validationChecks: [
                "User can identify and fix a JSON syntax error such as a trailing comma or missing double quotes.",
                "User understands that `.env` files must never be committed and that `.env.example` serves as documentation.",
                "User can trace where an environment variable is read in code by searching for `process.env.<NAME>`.",
              ],
              retention: [
                "JSON does not allow trailing commas or comments \u2014 these are the most common parse errors.",
                "Secrets belong in environment variables, not in source code.",
                ".env goes in .gitignore; .env.example (with fake values) goes in version control.",
              ],
              tools: ["Visual Studio Code", "terminal", "npm"],
              notesPrompt:
                "List the five JSON syntax rules that catch most parse errors, and write the two .gitignore lines every project needs.",
              exercises: [
                {
                  id: "json-outer-delimiter",
                  title: "JSON object syntax",
                  prompt: "What character pair wraps a JSON object?",
                  placeholder: "Characters",
                  validationMode: "includes",
                  acceptedAnswers: ["{", "}"],
                  successMessage:
                    "Correct. Curly braces delimit a JSON object; square brackets delimit an array.",
                  hint: "The same characters wrap objects in JavaScript.",
                  assessmentType: "action",
                },
                {
                  id: "env-file-secret-rule",
                  title: "Secret management rule",
                  prompt:
                    "Which file stores environment-specific secrets locally and must never be committed to version control?",
                  placeholder: "Filename",
                  validationMode: "includes",
                  acceptedAnswers: [".env"],
                  successMessage:
                    "Correct. .env holds configuration that changes per environment and must stay out of the repository.",
                  hint: "It starts with a dot and has no extension.",
                  assessmentType: "reasoning",
                },
                {
                  id: "json-trailing-comma",
                  title: "Common JSON syntax error",
                  prompt:
                    "What is the most common JSON syntax error that causes a parse failure?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "trailing comma",
                    "extra comma",
                    "comma after last",
                  ],
                  successMessage:
                    "Correct. JSON does not allow a comma after the last property \u2014 this breaks parsers in every language.",
                  hint: "It is something that JavaScript allows but JSON forbids.",
                  assessmentType: "debugging",
                },
              ],
              transferTask: {
                id: "transfer-json-config",
                title: "Transfer challenge: diagnose a config failure",
                prompt:
                  "A teammate's app crashes on startup with: 'SyntaxError: Unexpected token }'. They say the config file looks fine. List two things you would check in the JSON file and one thing you would verify about the environment variable setup.",
                placeholder: "I would check...",
                validationMode: "includes",
                acceptedAnswers: [
                  "comma",
                  "bracket",
                  "brace",
                  "env",
                  "gitignore",
                  "syntax",
                  "trailing",
                ],
                successMessage:
                  "Transfer evidence accepted. You identified the likely JSON syntax cause and the environment variable verification step.",
                hint: "Think: what JSON syntax errors cause unexpected-token errors, and what could be missing from the environment?",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "json-fix-trailing-comma",
                  title: "Fix the JSON syntax error",
                  description:
                    "This JSON config has a trailing comma that causes a parse error. Remove it so the file parses correctly.",
                  starterCode: `{
  "appName": "my-app",
  "port": 3000,
  "debug": true,
}`,
                  language: "json",
                  hint: "JSON does not allow a comma after the last property in an object or array.",
                  acceptedPatterns: [
                    '"debug": true\n}',
                    '"debug":true\n}',
                    '"debug": true }',
                  ],
                },
                {
                  id: "json-parse-config-value",
                  title: "Read a value from parsed JSON",
                  description:
                    "Write a line of JavaScript that parses the JSON string stored in `raw` and logs the value of the `port` property.",
                  starterCode: `const raw = '{"host":"localhost","port":8080}';
// Parse the JSON and log the port value
`,
                  language: "javascript",
                  hint: "Use JSON.parse() to convert the string to an object, then access .port.",
                  acceptedPatterns: ["JSON.parse", ".port"],
                },
              ],
              competencies: [
                { track: "ProgrammingLogic", targetLevel: "Functional" },
                {
                  track: "ConfigurationAndEnvironments",
                  targetLevel: "Functional",
                },
              ],
              scaffoldingLevel: "goal-driven",
            },
            {
              id: "lesson-error-reading",
              title: "Reading Errors and Stack Traces",
              summary:
                "Turn cryptic error output into a clear starting point for investigation.",
              duration: "45 min",
              difficulty: "Core",
              objective:
                "Identify the error type, message, and location from a stack trace and determine the first place to investigate.",
              explanation: [
                "Error messages are **structured data**, not obstacles. Every error contains three parts: an **error type** (what kind of failure), a **message** (what specifically went wrong), and a **stack trace** (which functions were executing at the moment of failure, innermost first). Learning to read these three parts turns panic into a targeted starting point.",
                "The **error type** is the first word before the colon. Common types: `TypeError` (a value was the wrong type for the operation), `ReferenceError` (a variable was used before it was defined), `SyntaxError` (the code itself is malformed). Each type narrows the investigation immediately.",
                "A **stack trace** lists function calls from most recent (top) to oldest (bottom). Your job is to scan from top to bottom and find the **first line that belongs to your code** rather than a library or Node internal. That file and line number is your starting point for investigation. Example:\n```\nTypeError: Cannot read properties of undefined (reading 'name')\n    at getUserName (src/user.ts:14:22)\n    at handleRequest (src/routes.ts:8:12)\n    at Layer.handle (node_modules/express/lib/router/layer.js:95:5)\n```\nThe first application frame is `src/user.ts:14` — that is where you look first. The `express` frame below it is library code and usually not the cause.",
                "TypeScript compile errors follow a different format but are equally precise: `src/utils.ts(12,5): error TS2322: Type 'string' is not assignable to type 'number'.` This gives you the file (`src/utils.ts`), the line and column (`12,5`), the error code (`TS2322`), and a plain-language description. Compile errors are caught **before** the code runs, so they are always cheaper to fix than runtime errors.",
              ],
              demonstration: [
                "Here is a real `TypeError` with a stack trace:\n```\nTypeError: Cannot read properties of undefined (reading 'email')\n    at getContactInfo (src/contacts.ts:22:18)\n    at processUser (src/users.ts:45:10)\n    at main (src/index.ts:8:3)\n```\nStep 1: The error type is `TypeError`. Step 2: The message says something is `undefined` when it should have an `email` property. Step 3: The first application frame is `src/contacts.ts:22` — open that file, go to line 22, and inspect what variable is `undefined`.",
                "Now look at a TypeScript compile diagnostic:\n```\nsrc/api.ts(31,7): error TS2345: Argument of type 'string' is not\nassignable to parameter of type 'number'.\n```\nThe format is `file(line,column): error TSxxxx: message`. Open `src/api.ts`, go to line 31, column 7. The function expects a `number` but is receiving a `string`. Fix the caller or the function signature.",
                "Here is what happens when you investigate without reading the error properly — a common mistake:\n```\nReferenceError: users is not defined\n    at loadDashboard (src/dashboard.ts:15:3)\n    at initApp (src/index.ts:8:1)\n```\nA beginner might start debugging in `index.ts` because it is the entry point. But the stack trace says the error originated at `src/dashboard.ts:15` — that is where `users` is referenced before being defined. The key insight: **error type + message + first application frame** gives you everything you need. Read the top, find your code, and go there.",
              ],
              exerciseSteps: [
                "Read the sample stack trace and identify the **error type** (the word before the colon).",
                "Scan the stack trace top-to-bottom and find the first frame that references your application code (not `node_modules/`).",
                "Restate the error message in plain language: what was the code trying to do, and what went wrong?",
              ],
              validationChecks: [
                "User identifies the error type (e.g., `TypeError`, `ReferenceError`) from the first line of the trace.",
                "User locates the first application-code frame and names the file and line number.",
                "User can explain a TypeScript compile diagnostic by identifying the file, line, error code, and conflicting types.",
              ],
              retention: [
                "Error type + message + first app frame = the starting point for every investigation.",
                "Read top-to-bottom in a stack trace; stop at the first line you recognise.",
                "Compile errors reference a file, line, and column \u2014 they are precise, not vague.",
              ],
              tools: ["Visual Studio Code", "terminal", "TypeScript compiler"],
              notesPrompt:
                "Describe the three parts of a useful error message. Write one note about how you would explain a TypeError to a teammate who has never read a stack trace.",
              exercises: [
                {
                  id: "error-type-read",
                  title: "Identify the error type",
                  prompt:
                    "In the error 'TypeError: Cannot read properties of undefined (reading \\'name\\')', what is the error type?",
                  placeholder: "Error name",
                  validationMode: "includes",
                  acceptedAnswers: ["TypeError", "typeerror"],
                  successMessage:
                    "Correct. The error type is always the first word before the colon. TypeError means a value was the wrong type for the operation.",
                  hint: "It appears before the colon and names the category of failure.",
                  assessmentType: "action",
                },
                {
                  id: "stack-entry-point",
                  title: "Find the investigation starting point",
                  prompt:
                    "When reading a stack trace, which frame should you investigate first?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "first",
                    "top",
                    "your code",
                    "application code",
                    "own code",
                  ],
                  successMessage:
                    "Correct. Start from the top of the stack and find the first frame that is your own code, not a library or Node internal.",
                  hint: "Stack traces list the most recent call at the top. Library frames below yours are usually just the engine delivering the error.",
                  assessmentType: "debugging",
                },
                {
                  id: "compile-error-location",
                  title: "TypeScript compile error anatomy",
                  prompt:
                    "A TypeScript compiler error shows: 'src/utils.ts(12,5): error TS2322'. What does '12,5' represent?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "line 12",
                    "line and column",
                    "line",
                    "row and column",
                    "position",
                  ],
                  successMessage:
                    "Correct. The format is (line, column) — it tells you exactly where in the file to look.",
                  hint: "The two numbers in parentheses follow a consistent convention used by most compilers.",
                  assessmentType: "reasoning",
                },
              ],
              transferTask: {
                id: "transfer-error-reading",
                title: "Transfer challenge: triage an error report",
                prompt:
                  "A teammate pastes this error: 'ReferenceError: fetch is not defined\\n    at getUserData (src/api.ts:8:3)\\n    at main (src/index.ts:4:1)'. Identify the error type, the error message, and the best line to investigate first. Then suggest one fix.",
                placeholder:
                  "Error type is..., message says..., investigate...",
                validationMode: "includes",
                acceptedAnswers: [
                  "ReferenceError",
                  "fetch",
                  "api.ts",
                  "src/api.ts",
                  "line 8",
                ],
                successMessage:
                  "Transfer evidence accepted. You correctly read the error type, message, and first application frame.",
                hint: "The error type is the first word. The message follows the colon. The first app frame is the topmost line in the trace.",
                assessmentType: "transfer",
              },
              competencies: [{ track: "Debugging", targetLevel: "Functional" }],
              scaffoldingLevel: "goal-driven",
              codeExercises: [
                {
                  id: "error-fix-undefined-access",
                  title: "Fix an undefined property access",
                  description:
                    "This code throws 'TypeError: Cannot read properties of undefined (reading \\'email\\')'. The user object does not always have a contact property. Add a guard so the function returns 'no email' when contact is missing.",
                  starterCode:
                    "function getUserEmail(user) {\n  return user.contact.email;\n}\n\nconst user = { name: 'Alice' };\nconsole.log(getUserEmail(user)); // should print 'no email'",
                  language: "javascript",
                  hint: "Check whether user.contact exists before accessing .email. Use optional chaining (?.) or an if statement.",
                  acceptedPatterns: [
                    "user.contact?.email",
                    "if (!user.contact)",
                    "if (user.contact)",
                    "no email",
                  ],
                },
                {
                  id: "error-fix-reference",
                  title: "Fix a ReferenceError",
                  description:
                    "This code throws 'ReferenceError: totl is not defined' because of a typo. Find the misspelled variable name and correct it so the function returns the sum.",
                  starterCode:
                    "function calculateTotal(prices) {\n  let total = 0;\n  for (const price of prices) {\n    totl = totl + price;\n  }\n  return total;\n}\n\nconsole.log(calculateTotal([10, 20, 30])); // should print 60",
                  language: "javascript",
                  hint: "Look at each use of the variable name inside the loop. Compare it to the declaration on the line above.",
                  acceptedPatterns: ["total = total + price", "total += price"],
                },
              ],
            },
            {
              id: "lesson-vscode-debugger",
              title: "The VS Code Debugger and Breakpoints",
              summary:
                "Use the VS Code integrated debugger to pause execution, inspect variables, and trace a bug to its source.",
              duration: "50 min",
              difficulty: "Core",
              objective:
                "Set a breakpoint, step through execution, and use the Variables and Call Stack panels to diagnose a runtime bug.",
              explanation: [
                "The integrated debugger turns a running program into an **inspectable machine**. Instead of scattering `console.log()` calls everywhere, **breakpoints** let you pause execution at any line and inspect the exact program state at that moment — every variable, every argument, every return value.",
                "To set a **breakpoint**, click the gutter (the space to the left of the line numbers) in VS Code. A red dot appears. When you start the debugger with `F5`, the program runs normally until it hits that line, then **pauses**. The program is still alive — it is just frozen in place so you can inspect it.",
                "While paused, the **Variables panel** (in the Debug sidebar) shows every variable in the current scope and its value. The **Call Stack panel** shows which functions called which — the chain of execution that reached the current line. These two panels replace guesswork with observable facts.",
                "Three step controls let you navigate execution: **Step Over** (`F10`) executes the current line and moves to the next one without entering any functions it calls. **Step Into** (`F11`) descends into the function being called on the current line. **Step Out** (`Shift+F11`) runs the rest of the current function and returns to the caller. Use Step Over for scanning, Step Into when you suspect the bug is inside a specific function.",
              ],
              demonstration: [
                "Open the practice script. It has a buggy function — `calculateDiscount` should apply a percentage discount but returns the wrong value:\n```javascript\nfunction calculateDiscount(price, discountPercent) {\n  const discount = price * discountPercent;\n  const result = price + discount;  // bug: should be price - discount\n  return result;\n}\n\nconsole.log(calculateDiscount(100, 0.2)); // prints 120, expected 80\n```\nClick the gutter (left of the line numbers) on the `const discount` line — a red dot appears. This is a **breakpoint**. Press `F5` to start the debugger.",
                "The program pauses at the breakpoint. The **Variables panel** (Debug sidebar, left) shows the current state:\n```\nVARIABLES\n  Local\n    price: 100\n    discountPercent: 0.2\n    discount: undefined\n    result: undefined\n```\nPress `F10` (Step Over) once. The `discount` line executes and the Variables panel updates:\n```\n  Local\n    discount: 20\n```\n`discount` is `20` — that is correct (100 × 0.2). Press `F10` again. Now `result` shows `120`. The bug is visible: `price + discount` adds instead of subtracting. No `console.log()` needed — the debugger shows every value in real time.",
                "The **Call Stack** panel shows the chain of function calls that reached the current line:\n```\nCALL STACK\n  calculateDiscount    app.js:2\n  (anonymous)          app.js:7\n```\nIf `calculateDiscount` called a helper function, you would use `F11` (Step Into) to descend into it and inspect its variables. `Shift+F11` (Step Out) returns you to the caller. Fix the bug by changing `+` to `-`:\n```javascript\nconst result = price - discount;  // fixed: subtract the discount\n```\nPress `F5` again to re-run. `calculateDiscount(100, 0.2)` now returns `80` — verified.",
                "The debugger workflow follows a repeatable pattern: **set a breakpoint → run with F5 → inspect the Variables panel → step through with F10 → dive into functions with F11 → verify the fix**. This is faster than scattering `console.log()` calls because you can inspect any variable at any pause point without modifying your code.",
              ],
              exerciseSteps: [
                "Open the practice script in VS Code and set a breakpoint on the first line of the main function by clicking the gutter.",
                "Press `F5` to start the debugger and confirm the program pauses at the breakpoint. Read the **Variables panel** to see the current values.",
                "Use `F10` (Step Over) to advance through the function line by line and identify where a variable's value becomes unexpected.",
              ],
              validationChecks: [
                "User can set a breakpoint by clicking the gutter and sees the red dot indicator.",
                "User starts the debugger with `F5` and uses `F10` (Step Over) to advance execution one line at a time.",
                "User reads the **Variables panel** to inspect variable values mid-execution without adding `console.log()` statements.",
              ],
              retention: [
                "Breakpoints freeze execution — the program is still running and inspectable.",
                "Step Over moves to the next statement; Step Into descends into the called function.",
                "The Call Stack panel shows you the full chain of calls that reached the current line.",
              ],
              tools: ["Visual Studio Code", "terminal", "Node.js"],
              notesPrompt:
                "Write a cheat sheet: breakpoint, step over, step into, step out, call stack, watch expression. Add one tip for when you would use each.",
              exercises: [
                {
                  id: "debugger-start",
                  title: "Launch the debugger",
                  prompt:
                    "What keyboard shortcut starts a debug session in VS Code?",
                  placeholder: "Key or key combination",
                  validationMode: "includes",
                  acceptedAnswers: ["F5"],
                  successMessage:
                    "Correct. F5 starts the debug session using the launch configuration in your project.",
                  hint: "It is a single function key. The same key also resumes execution when paused at a breakpoint.",
                  assessmentType: "action",
                },
                {
                  id: "debugger-step-over",
                  title: "Step through execution",
                  prompt:
                    "Which VS Code debugger button executes the current line and moves to the next one WITHOUT entering called functions?",
                  placeholder: "Button name or key",
                  validationMode: "includes",
                  acceptedAnswers: ["Step Over", "F10", "step over"],
                  successMessage:
                    "Correct. Step Over (F10) advances to the next statement in the current function without descending into nested calls.",
                  hint: "There is a 'step' button for staying at the same level and one for going deeper. You want the one that stays at the same level.",
                  assessmentType: "action",
                },
                {
                  id: "debugger-variables-panel",
                  title: "Inspect variable state",
                  prompt:
                    "While paused at a breakpoint, what VS Code panel shows you the current values of all variables in scope?",
                  placeholder: "Panel name",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "Variables",
                    "variables panel",
                    "debug panel",
                  ],
                  successMessage:
                    "Correct. The Variables panel shows every in-scope binding and its current value at the paused line.",
                  hint: "It is one of the panels visible in the Debug sidebar when a session is active.",
                  assessmentType: "action",
                },
              ],
              transferTask: {
                id: "transfer-vscode-debugger",
                title: "Transfer challenge: plan a debugging session",
                prompt:
                  "A function is returning -1 when you expect it to return a positive number. You can reproduce the failure consistently. Describe how you would use the VS Code debugger to find the cause — include where you would place the breakpoint, what you would watch in the Variables panel, and which step controls you would use.",
                placeholder:
                  "I would set a breakpoint at..., watch for..., use Step Over/Into to...",
                validationMode: "includes",
                acceptedAnswers: [
                  "breakpoint",
                  "variables",
                  "step",
                  "inspect",
                  "panel",
                  "value",
                ],
                successMessage:
                  "Transfer evidence accepted. Your plan demonstrates deliberate use of the debugger to inspect state rather than guessing.",
                hint: "Cover: where to set the first breakpoint, what variable value you would examine, and which step command you would use to trace the logic.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "debugger-breakpoint",
                  title: "Set a breakpoint",
                  description:
                    "In VS Code, click the gutter next to line 3 to set a breakpoint, then run the debugger to pause execution.",
                  starterCode:
                    "function add(a, b) {\n  return a + b;\n}\n\nconsole.log(add(2, 3));",
                  language: "javascript",
                  hint: "Click the red dot area to the left of the line number to set a breakpoint.",
                  acceptedPatterns: ["breakpoint", "gutter", "line 3"],
                },
                {
                  id: "debugger-step-through",
                  title: "Step through code",
                  description:
                    "With a breakpoint set, use Step Over (F10) to advance through the function call and inspect the return value.",
                  starterCode:
                    "function multiply(x, y) {\n  const result = x * y;\n  return result;\n}\n\nconsole.log(multiply(4, 5));",
                  language: "javascript",
                  hint: "After hitting the breakpoint, use F10 to step over each line and watch the Variables panel.",
                  acceptedPatterns: ["Step Over", "F10", "Variables"],
                },
              ],
              competencies: [{ track: "Debugging", targetLevel: "Functional" }],
              scaffoldingLevel: "goal-driven",
            },
          ],
        },
        {
          id: "course-version-control",
          title: "Version Control with Git",
          focus: "Commits, branches, merges, and collaboration workflows",
          outcome:
            "Learners can use Git confidently for personal and team work, treating version control as a safety system.",
          lessons: [
            {
              id: "lesson-git-workflow",
              title: "Use Git as a Safety System",
              summary:
                "Treat version control as a way to reason about change, not as a scary ritual.",
              duration: "45 min",
              difficulty: "Core",
              objective:
                "Understand how Git protects work, explains history, and supports structured experimentation.",
              explanation: [
                "Git gives engineers a **memory system for change**. It answers three questions that file-saving alone cannot: **what** changed, **why** it changed, and **how to return to a known good state**. Every professional codebase uses Git, and understanding it is non-negotiable.",
                "Git tracks changes in three stages. The **working tree** is your actual files on disk. The **staging area** (also called the index) holds the changes you have selected for the next commit. A **commit** is a permanent snapshot of those staged changes with a message explaining what they accomplish. The flow is: edit files → stage with `git add` → commit with `git commit`.",
                "Run `git status` constantly — it is the most important command in Git. It shows which files have been modified, which are staged, and which are untracked:\n```bash\ngit status\n# On branch main\n# Changes not staged for commit:\n#   modified:   src/app.ts\n# Untracked files:\n#   src/utils.ts\n```\nThis output tells you exactly what Git sees. Read it before every `git add` and every `git commit`.",
                'A good commit is **small** (one logical change), **complete** (it does not break the build), and has a **clear message** that explains intent. Compare: `"fix stuff"` tells a future reader nothing. `"Fix null check in checkout handler"` tells them exactly what changed and why. Clear commit messages compound in value as the project grows — they become a searchable history of every decision.',
              ],
              demonstration: [
                "Start by checking the current state of the repository:\n```bash\ngit status\n# On branch main\n# Changes not staged for commit:\n#   modified:   src/app.ts\n```\nOne file has been modified. Before staging anything, look at the actual change with `git diff`:\n```bash\ngit diff src/app.ts\n# -  const user = null;\n# +  const user = getUser(id);\n```\nThe diff shows exactly what changed: a `null` was replaced with a function call. This is the change you want to commit.",
                "Stage the file with `git add src/app.ts`, then check status again:\n```bash\ngit add src/app.ts\ngit status\n# Changes to be committed:\n#   modified:   src/app.ts\n```\nThe file has moved from 'Changes not staged' to 'Changes to be committed'. Now commit with a descriptive message:\n```bash\ngit commit -m \"Fix user lookup to call getUser instead of returning null\"\n# [main a1b2c3d] Fix user lookup to call getUser instead of returning null\n#  1 file changed, 1 insertion(+), 1 deletion(-)\n```",
                "Verify the commit appears in the history with `git log`:\n```bash\ngit log --oneline -3\n# a1b2c3d Fix user lookup to call getUser instead of returning null\n# 9f8e7d6 Add input validation to checkout handler\n# 3c4d5e6 Initial project setup\n```\nEach commit tells a clear story. Contrast this with a chaotic history where every message says `update` or `wip` — when something breaks, a clean log lets you pinpoint the exact commit that introduced the problem using `git log` or `git bisect`. A messy history leaves you guessing.",
                "Here is what Git tells you when common operations fail. If you try to commit with nothing staged:\n```bash\ngit commit -m \"Update config\"\n# On branch main\n# nothing to commit, working tree clean\n```\nGit refuses silently — no error, just a status message reminding you to `git add` first. If you try to push when the remote has commits you do not have:\n```bash\ngit push origin main\n# To github.com:user/project.git\n#  ! [rejected]        main -> main (fetch first)\n# error: failed to push some refs to 'github.com:user/project.git'\n# hint: Updates were rejected because the remote contains work that you do not\n# hint: have locally. Integrate the remote changes (e.g., 'git pull ...') before pushing again.\n```\nThe `[rejected]` line tells you the push was blocked. The hint tells you to `git pull` first so you can integrate the remote changes before pushing. Read Git's hints — they almost always tell you the exact next step.",
              ],
              exerciseSteps: [
                "Run `git status` to inspect modified files and distinguish unstaged changes from staged changes.",
                "Use `git add <file>` to stage only the specific file you intend to commit — not `git add .` blindly.",
                'Write a `git commit -m` message that explains **what** changed and **why**, not just `"update"`.',
              ],
              validationChecks: [
                "User runs `git status` before staging and can distinguish unstaged from staged changes.",
                "User uses `git add <file>` to scope a commit to a single coherent change.",
                'User writes a commit message that communicates intent (e.g., `"Fix null check in checkout handler"`).',
              ],
              retention: [
                "Small commits make reasoning easier.",
                "Version control is a safety system, not just a delivery requirement.",
                "Clear history compounds in value over time.",
              ],
              tools: ["Git", "GitHub", "Visual Studio Code"],
              notesPrompt:
                "Write your own definition of staging, then describe what a \u2018good commit\u2019 means in practical terms.",
              exercises: [
                {
                  id: "git-status",
                  title: "Inspect repo state",
                  prompt:
                    "Enter the Git command that shows the working tree and staging status.",
                  placeholder: "git ...",
                  validationMode: "exact",
                  acceptedAnswers: ["git status"],
                  successMessage:
                    "Correct. Inspecting state before acting is a repeated professional habit.",
                  hint: "This is the command most engineers run constantly.",
                  assessmentType: "action",
                },
                {
                  id: "git-add",
                  title: "Stage a change",
                  prompt:
                    "What command stages a specific file for the next commit?",
                  placeholder: "git ...",
                  validationMode: "includes",
                  acceptedAnswers: ["git add"],
                  successMessage:
                    "Correct. Staging lets you choose exactly what goes into each commit.",
                  hint: "You add files to the staging area.",
                  assessmentType: "action",
                },
                {
                  id: "git-diff-review",
                  title: "Review before committing",
                  prompt:
                    "What Git command shows the exact line-by-line changes in your working directory that have not been staged yet?",
                  placeholder: "git ...",
                  validationMode: "includes",
                  acceptedAnswers: ["git diff"],
                  successMessage:
                    "Correct. git diff shows unstaged changes line by line \u2014 always review your changes before staging and committing.",
                  hint: "This command shows the difference between your working directory and the staging area.",
                  assessmentType: "action" as const,
                },
              ],
              transferTask: {
                id: "transfer-git-safety",
                title: "Transfer challenge: explain Git as a safety system",
                prompt:
                  "A new developer asks: 'Why should I bother with Git if I can just save files?' Explain the three ways Git protects your work that file saving alone cannot provide.",
                placeholder: "Three safety benefits",
                validationMode: "includes",
                acceptedAnswers: [
                  "history",
                  "revert",
                  "branch",
                  "undo",
                  "rollback",
                  "diff",
                  "compare",
                ],
                successMessage:
                  "Transfer evidence accepted. You articulated Git's value beyond simple file storage.",
                hint: "Think about history, experimentation (branches), and the ability to undo mistakes.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "git-status-read",
                  title: "Read a git status output",
                  description:
                    "The output below shows `git status`. Add a line that stages the modified file for commit.",
                  starterCode: `# git status output:\n# On branch main\n# Changes not staged for commit:\n#   modified:   src/app.ts\n\n# Write the git command to stage src/app.ts:\n`,
                  language: "bash",
                  hint: "Use git add followed by the file path.",
                  acceptedPatterns: ["git add", "src/app.ts"],
                },
                {
                  id: "git-commit-message",
                  title: "Write a proper commit command",
                  description:
                    "Write a git commit command with a descriptive message for fixing a login bug.",
                  starterCode: `# Write a git commit command with a message:\n`,
                  language: "bash",
                  hint: "Use git commit -m followed by a quoted message.",
                  acceptedPatterns: ["git commit", "-m"],
                },
              ],
              competencies: [
                { track: "VersionControl", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "step-by-step",
            },
            {
              id: "lesson-branching",
              title: "Branches and Safe Experimentation",
              summary:
                "Use branches to try ideas, isolate changes, and merge with confidence.",
              duration: "45 min",
              difficulty: "Core",
              objective:
                "Create branches, switch between them, and merge changes back into the main line.",
              explanation: [
                "**Branches** let you work on changes in isolation. You create a branch, make changes, and those changes do not affect `main` (or any other branch) until you explicitly **merge** them. This gives you a safe space to experiment, make mistakes, and iterate without risk.",
                "To create a new branch and switch to it in one command, use `git checkout -b <name>` or the newer `git switch -c <name>`:\n```bash\ngit checkout -b feature/login-form\n# Switched to a new branch 'feature/login-form'\n```\nYou are now on a separate timeline. Every commit you make goes onto this branch, not `main`.",
                "To see all local branches and which one you are on, run `git branch`:\n```bash\ngit branch\n#   main\n# * feature/login-form\n```\nThe asterisk (`*`) marks your current branch. To switch back to `main`, run `git checkout main` or `git switch main`. When you switch, your working tree updates to reflect that branch's latest commit.",
                "When the feature is ready, you **merge** it into `main`. Switch to `main` first, then merge the feature branch:\n```bash\ngit checkout main\ngit merge feature/login-form\n# Merge made by the 'ort' strategy.\n#  src/login.ts | 45 +++++++++++++++\n#  1 file changed, 45 insertions(+)\n```\nBranch names should describe the work: `feature/login-form`, `fix/null-check`, `chore/update-deps`. A clear name makes the Git log self-documenting.",
              ],
              demonstration: [
                "Start on `main`. Create a feature branch:\n```bash\ngit checkout -b feature/add-greeting\n# Switched to a new branch 'feature/add-greeting'\n```\nMake a small change — add a greeting function to `src/utils.ts`. Stage and commit:\n```bash\ngit add src/utils.ts\ngit commit -m \"Add greeting utility function\"\n```",
                "Now switch back to `main` and verify the change is not there:\n```bash\ngit checkout main\ncat src/utils.ts\n# The greeting function does not exist here\n```\nThis proves branch isolation: the work exists only on `feature/add-greeting` until you merge it.",
                "Merge the feature branch into `main`:\n```bash\ngit merge feature/add-greeting\n# Updating a1b2c3d..e4f5g6h\n#  src/utils.ts | 4 ++++\n#  1 file changed, 4 insertions(+)\n```\nNow `main` has the greeting function. The merge commit records when the feature was integrated. Run `git log --oneline` to see the history.",
                "When things go wrong with branches, Git gives you clear warnings. If you try to delete a branch that has commits not yet merged into any other branch:\n```bash\ngit branch -d feature/experimental\n# error: The branch 'feature/experimental' is not fully merged.\n# If you are sure you want to delete it, run 'git branch -D feature/experimental'.\n```\nGit uses lowercase `-d` as a safe delete that refuses to destroy unmerged work. The uppercase `-D` forces deletion and discards those commits permanently. Always read Git's error messages carefully — the lowercase/uppercase distinction is your safety net against losing work. If you see this error, ask yourself: did I already merge this branch? If not, do I still need this work?",
              ],
              exerciseSteps: [
                "Create a new branch with `git checkout -b <name>` using a descriptive name like `feature/practice-change`.",
                "Make a small change on the feature branch, stage it with `git add`, and commit it.",
                "Switch back to `main` with `git checkout main` and verify the change is not present on `main`.",
              ],
              validationChecks: [
                "User can create a branch with `git checkout -b` or `git switch -c` and name it descriptively.",
                "User runs `git branch` to see all local branches and identifies the current branch by the `*` marker.",
                "User understands that branches isolate changes: work on one branch does not appear on another until merged.",
              ],
              retention: [
                "Branch names should describe the work, not the person.",
                "Branches are cheap \u2014 use them for every non-trivial change.",
                "Merge with intent, not with haste.",
              ],
              tools: ["Git", "Visual Studio Code", "terminal"],
              notesPrompt:
                "Write the commands for creating, switching, and merging a branch. Note common mistakes to avoid.",
              exercises: [
                {
                  id: "branch-create",
                  title: "Create a branch",
                  prompt:
                    "What Git command creates a new branch and switches to it?",
                  placeholder: "git ...",
                  validationMode: "includes",
                  acceptedAnswers: ["git checkout -b", "git switch -c"],
                  successMessage:
                    "Correct. This single command creates and positions you on the new branch.",
                  hint: "There are two ways: one with checkout and one with switch.",
                  assessmentType: "action",
                },
                {
                  id: "branch-list",
                  title: "List branches",
                  prompt:
                    "What Git command shows all local branches and highlights the one you are currently on?",
                  placeholder: "git ...",
                  validationMode: "includes",
                  acceptedAnswers: ["git branch"],
                  successMessage:
                    "Correct. git branch lists local branches and marks the active one with an asterisk.",
                  hint: "The command name is simply the concept itself.",
                  assessmentType: "action",
                },
                {
                  id: "branch-merge",
                  title: "Merge a branch",
                  prompt:
                    "After finishing work on a feature branch, what Git command merges it into main? (Assume you are already on main.)",
                  placeholder: "git ...",
                  validationMode: "includes",
                  acceptedAnswers: ["git merge"],
                  successMessage:
                    "Correct. git merge integrates the feature branch's changes into main. Always review the diff before merging.",
                  hint: "You are on main and want to bring in the changes from another branch.",
                  assessmentType: "action" as const,
                },
              ],
              transferTask: {
                id: "transfer-branching-strategy",
                title: "Transfer challenge: recommend a branching strategy",
                prompt:
                  "A three-person team asks you how they should use branches. Describe when to create a branch, how to name it, and when to merge it back. Include at least one rule that prevents conflicts.",
                placeholder: "Branching strategy",
                validationMode: "includes",
                acceptedAnswers: [
                  "feature",
                  "branch",
                  "merge",
                  "main",
                  "name",
                  "small",
                  "review",
                ],
                successMessage:
                  "Transfer evidence accepted. You designed a practical team branching workflow.",
                hint: "Cover branch naming, when to branch, and how to keep branches short-lived.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "git-branch-create",
                  title: "Create a feature branch",
                  description:
                    "Write the git command to create and switch to a new branch named 'feature/login-form'.",
                  starterCode: "# Create and switch to the new branch\n",
                  language: "bash",
                  hint: "Use 'git checkout -b' or 'git switch -c' followed by the branch name.",
                  acceptedPatterns: [
                    "checkout -b feature/login-form",
                    "switch -c feature/login-form",
                  ],
                },
                {
                  id: "git-branch-list",
                  title: "List and identify branches",
                  description:
                    "Write the git command that lists all local branches and shows which one is currently checked out.",
                  starterCode: "# List local branches\n",
                  language: "bash",
                  hint: "The simplest form of 'git branch' with no arguments lists local branches.",
                  acceptedPatterns: ["git branch"],
                },
              ],
              competencies: [
                { track: "VersionControl", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "step-by-step",
            },
            {
              id: "lesson-git-merge-conflict",
              title: "Resolving Merge Conflicts",
              summary:
                "Understand what causes merge conflicts, how to read conflict markers, and how to resolve them with confidence.",
              duration: "45 min",
              difficulty: "Core",
              objective:
                "Read Git conflict markers, choose the correct version of each conflicting change, and complete a merge cleanly.",
              explanation: [
                "A **merge conflict** occurs when two branches both modify the same lines of a file. Git cannot decide automatically which version is correct, so it marks the file with **conflict markers** and stops the merge for the human to resolve. Conflicts are not errors — they are Git asking for a decision.",
                "Conflict markers divide the file into three sections. `<<<<<<< HEAD` marks the start of the current branch's version. `=======` is the separator. `>>>>>>> feature-branch` marks the end of the incoming branch's version:\n```\n<<<<<<< HEAD\nconst greeting = 'Hello';\n=======\nconst greeting = 'Hi there';\n>>>>>>> feature/update-greeting\n```\nYour job is to produce the correct final version by editing the file, choosing one side (or combining both), and **removing all three markers**.",
                "After resolving every conflict in a file, you must **stage** the resolved file with `git add <file>` and then **complete the merge** with `git commit`. Git will not let you commit until all conflict markers are removed from all files. The complete sequence is:\n```bash\n# 1. Resolve conflicts by editing the file\n# 2. Stage the resolved file\ngit add src/greeting.ts\n# 3. Complete the merge\ngit commit\n# (Git auto-generates a merge commit message)\n```\nIf you get overwhelmed or realize the merge was premature, you can **abort the entire merge** with `git merge --abort`. This resets your working directory to the state before the merge started \u2014 no changes lost, no damage done. It is always safe to abort and try again after investigating further.",
                "VS Code provides a **merge editor** that shows both sides and lets you click to accept one or both. But understanding the raw markers is essential — you will encounter them in terminals, CI logs, and code reviews where no visual editor is available. Read both sides, understand the intent of each change, then produce the correct final state.",
              ],
              demonstration: [
                "The practice repo has `main` and `feature/format-name` branches that both modify line 3 of `src/utils.ts`. Attempt the merge:\n```bash\ngit checkout main\ngit merge feature/format-name\n# Auto-merging src/utils.ts\n# CONFLICT (content): Merge conflict in src/utils.ts\n# Automatic merge failed; fix conflicts and then commit.\n```\nGit has paused the merge. Run `git status` to see the conflicted file listed under 'Unmerged paths'.",
                "Open `src/utils.ts`. The conflict markers show both versions:\n```\n<<<<<<< HEAD\nconst name = user.first + ' ' + user.last;\n=======\nconst name = `${user.first} ${user.last}`;\n>>>>>>> feature/format-name\n```\nBoth lines do the same thing with different syntax. Choose the template literal version (cleaner), delete the other line and all three markers, and save the file.",
                "Stage and complete the merge:\n```bash\ngit add src/utils.ts\ngit commit\n# [main 9f8e7d6] Merge branch 'feature/format-name'\n```\nThe merge is complete. Run `git log --oneline --graph` to see the merge commit in the history. The key habit: **read both sides, decide, remove markers, stage, commit**.",
              ],
              exerciseSteps: [
                "Open the conflicted file and identify the three sections: `<<<<<<< HEAD` (current branch), `=======` (separator), and `>>>>>>> <branch>` (incoming branch).",
                "Choose which version to keep (or combine lines manually) and remove all conflict markers from the file.",
                "Stage the resolved file with `git add <file>` and complete the merge with `git commit`.",
              ],
              validationChecks: [
                "User can identify the `<<<<<<< HEAD` section (current branch) and the `>>>>>>>` section (incoming branch) in a conflict.",
                "User removes all three conflict markers (`<<<<<<<`, `=======`, `>>>>>>>`) before staging.",
                "User completes the merge by running `git add` followed by `git commit`.",
              ],
              retention: [
                "Conflict markers are not errors \u2014 they are Git asking for a human decision.",
                "Resolve conflicts by editing the file, not by guessing. Read both sides before choosing.",
                "After resolving, git add the file and git commit to close the merge.",
              ],
              tools: ["Git", "Visual Studio Code", "terminal"],
              notesPrompt:
                "Describe the three sections of a conflict marker block. Write down the exact sequence of commands to complete a merge after resolving all conflicts.",
              exercises: [
                {
                  id: "conflict-marker-head",
                  title: "Identify the current branch section",
                  prompt:
                    "In a Git conflict, what marker indicates the start of the current branch's version of the code?",
                  placeholder: "Git marker",
                  validationMode: "includes",
                  acceptedAnswers: ["<<<<<<< HEAD", "<<<<<<<", "HEAD"],
                  successMessage:
                    "Correct. <<<<<<< HEAD marks the beginning of the version from your current branch.",
                  hint: "Conflict markers start with angle brackets. HEAD refers to your current working branch.",
                  assessmentType: "action",
                },
                {
                  id: "conflict-separator",
                  title: "Identify the separator",
                  prompt:
                    "What Git conflict marker separates the two conflicting versions?",
                  placeholder: "Git marker",
                  validationMode: "includes",
                  acceptedAnswers: ["=======", "====="],
                  successMessage:
                    "Correct. The ======= line divides the current branch content above from the incoming branch content below.",
                  hint: "It is a line of equals signs that acts as a divider between the two versions.",
                  assessmentType: "action",
                },
                {
                  id: "conflict-complete-merge",
                  title: "Complete the merge",
                  prompt:
                    "After editing a conflict file to remove all markers, what are the two commands needed to complete the merge?",
                  placeholder: "git ..., git ...",
                  validationMode: "includes",
                  acceptedAnswers: ["git add", "git commit"],
                  successMessage:
                    "Correct. Stage the resolved file with git add and then close the merge with git commit.",
                  hint: "The same two commands that conclude any normal change also conclude a conflict resolution.",
                  assessmentType: "action",
                },
              ],
              transferTask: {
                id: "transfer-merge-conflict",
                title: "Transfer challenge: guide a conflict resolution",
                prompt:
                  "A teammate says: 'I ran git merge and now there are conflict markers in three files. I don't know what to do.' Write a step-by-step resolution guide that walks them through opening each file, reading the markers, resolving correctly, and closing the merge.",
                placeholder: "Step 1: open the conflicted file...",
                validationMode: "includes",
                acceptedAnswers: [
                  "conflict marker",
                  "<<<",
                  "git add",
                  "git commit",
                  "remove",
                  "resolve",
                ],
                successMessage:
                  "Transfer evidence accepted. Your guide covers the read-decide-remove-stage-commit sequence.",
                hint: "Cover: how to identify conflicted files, how to read the three sections, how to make the final version, how to stage, and how to commit.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "resolve-conflict-markers",
                  title: "Resolve a merge conflict",
                  description:
                    "The file below has Git conflict markers from a merge. Remove the conflict markers and keep both changes so the function validates email format AND checks for minimum length.",
                  starterCode:
                    "function validateEmail(email: string): boolean {\n<<<<<<< HEAD\n  return email.includes('@') && email.includes('.');\n=======\n  return email.length >= 5;\n>>>>>>> feature/min-length\n}",
                  language: "typescript",
                  hint: "Remove the <<<<<<< HEAD, =======, and >>>>>>> lines. Combine both conditions with && so the function checks both rules.",
                  acceptedPatterns: [
                    "email.includes('@')",
                    "email.length",
                    "&&",
                  ],
                },
              ],
              competencies: [
                { track: "VersionControl", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "goal-driven",
            },
          ],
        },

        {
          id: "course-api-fundamentals",
          title: "API Fundamentals",
          focus:
            "HTTP, REST, request/response cycles, status codes, and headers",
          outcome:
            "Learners understand how web APIs work and can make requests using both terminal and GUI tools.",
          lessons: [
            {
              id: "lesson-http-basics",
              title: "HTTP: The Language of the Web",
              summary:
                "Understand HTTP methods, status codes, headers, and the request/response cycle that powers every API.",
              duration: "45 min",
              difficulty: "Core",
              objective:
                "Explain the HTTP request/response model and use correct methods for different operations.",
              explanation: [
                "**HTTP** (HyperText Transfer Protocol) is the protocol behind every web API. It defines how a **client** (your code, your browser, Postman) sends a **request** to a **server**, and how the server sends a **response** back. Understanding HTTP is non-negotiable for any engineer who works with web services.",
                "Every HTTP request has a **method** that declares intent. The four most common: `GET` retrieves a resource without modifying it. `POST` creates a new resource. `PUT` updates an existing resource by replacing it. `DELETE` removes a resource. Choosing the correct method is not optional — it tells the server (and every proxy, cache, and log between you and the server) what kind of operation this is.",
                "Every HTTP response includes a **status code** — a three-digit number that classifies the result. The families: `2xx` means **success** (e.g., `200 OK`, `201 Created`). `3xx` means **redirect**. `4xx` means **client error** — you sent something wrong (e.g., `400 Bad Request`, `401 Unauthorized`, `404 Not Found`). `5xx` means **server error** — the server failed to handle a valid request (e.g., `500 Internal Server Error`).",
                "**Headers** carry metadata that the body cannot. The `Content-Type` header tells the server what format the request body is in (e.g., `application/json`). The `Authorization` header carries authentication credentials. The `Accept` header tells the server what format the client wants the response in. Headers are key-value pairs sent with every request and response.",
                "Two concepts are essential for understanding API behavior at scale. **Idempotency** means making the same request multiple times produces the same result: `GET` and `PUT` are idempotent (repeating them does not create duplicates), while `POST` is not (each call may create a new resource). This matters for retry logic — if a network error interrupts a `PUT`, you can safely retry; retrying a `POST` might create duplicates. **CORS** (Cross-Origin Resource Sharing) is a browser security mechanism that blocks JavaScript from making requests to a different domain unless the server explicitly allows it via `Access-Control-Allow-Origin` headers. When you see a CORS error in the browser console, the fix is on the server (adding the correct headers), not in your frontend code.",
              ],
              demonstration: [
                'Make a `GET` request to the training API using the terminal:\n```bash\ncurl https://api.example.com/users\n# HTTP/1.1 200 OK\n# Content-Type: application/json\n# [{"id": 1, "name": "Alice"}, {"id": 2, "name": "Bob"}]\n```\nThe `200 OK` status code confirms success. The `Content-Type: application/json` header tells you the body is JSON. The body contains the actual data.',
                'Now send a `POST` request to create a new user:\n```bash\ncurl -X POST https://api.example.com/users \\\n  -H "Content-Type: application/json" \\\n  -d \'{"name": "Charlie"}\'\n# HTTP/1.1 201 Created\n# {"id": 3, "name": "Charlie"}\n```\n`-X POST` sets the method. `-H` sets a header. `-d` sends the request body. The `201 Created` status confirms the resource was created.',
                'Send a request for a resource that does not exist:\n```bash\ncurl https://api.example.com/users/999\n# HTTP/1.1 404 Not Found\n# {"error": "User not found"}\n```\n`404 Not Found` is a client error — it means the URL is valid but the resource does not exist. This is different from `500`, which means the server itself failed.',
                'When the server itself fails, you see a `500 Internal Server Error`. This means your request was valid but something broke on the backend:\n```bash\ncurl https://api.example.com/users\n# HTTP/1.1 500 Internal Server Error\n# {"error": "Internal server error", "message": "Cannot read properties of undefined"}\n```\n`500` tells the client nothing useful about what to fix — the problem is server-side (a crash, database failure, or unhandled exception). If a request times out entirely, `curl` reports a connection failure with no HTTP status at all:\n```bash\ncurl --max-time 5 https://api.example.com/slow-endpoint\n# curl: (28) Operation timed out after 5001 milliseconds\n```\nA timeout means the server did not respond within the limit. This could be a server overload, a network issue, or a query that takes too long. The three failure modes — `4xx` (your fault), `5xx` (server\'s fault), and timeout (no response) — each require different debugging strategies.',
              ],
              exerciseSteps: [
                "Make a `GET` request to the training API endpoint and inspect the status code, headers, and response body.",
                "Send a `POST` request with a JSON body (using the `Content-Type: application/json` header) and confirm the server responds with `201 Created`.",
                "Request a resource that does not exist and verify you receive a `404 Not Found` status code. Explain the difference between `4xx` and `5xx` errors.",
              ],
              validationChecks: [
                "User knows that `GET` reads, `POST` creates, `PUT` updates, and `DELETE` removes.",
                "User can read a status code and identify whether the result is success (`2xx`), client error (`4xx`), or server error (`5xx`).",
                "User understands that headers like `Content-Type` and `Authorization` carry request/response metadata.",
              ],
              retention: [
                "GET reads, POST creates, PUT updates, DELETE removes.",
                "2xx means success, 4xx means client error, 5xx means server error.",
                "Headers carry the context that the body cannot.",
              ],
              tools: ["Postman", "terminal", "Docker"],
              notesPrompt:
                "Create a reference table of HTTP methods and their purposes. Add the status codes you encountered.",
              exercises: [
                {
                  id: "http-get",
                  title: "Read operation",
                  prompt:
                    "Which HTTP method is used to retrieve a resource without modifying it?",
                  placeholder: "Method name",
                  validationMode: "exact",
                  acceptedAnswers: ["get", "GET"],
                  successMessage:
                    "Correct. GET is for reading \u2014 it should never cause side effects.",
                  hint: "It is the default method when you open a URL in a browser.",
                  assessmentType: "action",
                },
                {
                  id: "status-404",
                  title: "Not found",
                  prompt:
                    "What HTTP status code means the requested resource was not found?",
                  placeholder: "Number",
                  validationMode: "exact",
                  acceptedAnswers: ["404"],
                  successMessage:
                    "Correct. 404 tells the client the resource does not exist at that URL.",
                  hint: "This is probably the most famous status code on the internet.",
                  assessmentType: "action",
                },
                {
                  id: "http-post-method",
                  title: "Create operation",
                  prompt:
                    "Which HTTP method is used to send data to a server to create a new resource?",
                  placeholder: "HTTP method",
                  validationMode: "includes",
                  acceptedAnswers: ["post", "POST"],
                  successMessage:
                    "Correct. POST sends data in the request body to create a new resource. The server typically responds with 201 Created.",
                  hint: "GET reads data. This method writes new data to the server.",
                  assessmentType: "action" as const,
                },
              ],
              transferTask: {
                id: "transfer-http-debug",
                title: "Transfer challenge: diagnose an API failure",
                prompt:
                  "An API call returns a 500 status code. Explain what 500 means, what the three most likely server-side causes are, and what you would check first as the developer.",
                placeholder: "Diagnosis and causes",
                validationMode: "includes",
                acceptedAnswers: [
                  "server",
                  "error",
                  "log",
                  "500",
                  "internal",
                  "crash",
                  "exception",
                ],
                successMessage:
                  "Transfer evidence accepted. You demonstrated HTTP status code reasoning applied to debugging.",
                hint: "500 is a server-side error. Think about what could go wrong on the backend.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "http-fetch-get",
                  title: "Write a fetch GET request",
                  description:
                    "Write JavaScript that uses fetch() to make a GET request to '/api/users' and logs the parsed JSON response.",
                  starterCode: `// Make a GET request to /api/users and log the result\n`,
                  language: "javascript",
                  hint: "Use fetch('/api/users'), then .then(res => res.json()), then .then(data => console.log(data)).",
                  acceptedPatterns: ["fetch", "/api/users", ".json()"],
                },
                {
                  id: "http-status-check",
                  title: "Check the response status",
                  description:
                    "Add a status check to the fetch call. If the response is not ok, throw an error with the status code.",
                  starterCode: `fetch('/api/data')\n  .then(res => {\n    // Check if response is ok, throw if not\n    return res.json();\n  })\n  .then(data => console.log(data));\n`,
                  language: "javascript",
                  hint: "Check res.ok or res.status and throw new Error if the request failed.",
                  acceptedPatterns: ["res.ok", "throw"],
                },
              ],
              competencies: [
                { track: "ApiInteraction", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "goal-driven",
            },
            {
              id: "lesson-postman-basics",
              title: "Professional API Testing with Postman",
              summary:
                "Use Postman to build, organize, and automate API requests like a professional.",
              duration: "50 min",
              difficulty: "Core",
              objective:
                "Create collections, use environment variables, send authenticated requests, and run collection tests.",
              explanation: [
                "**Postman** is the industry standard for API exploration and testing. It goes far beyond making individual requests \u2014 it organises entire API workflows into reusable **collections** that can be shared, versioned, and automated.",
                "A **collection** is a folder of related API requests. Instead of rebuilding requests from scratch every time, you save them in a collection and replay them with one click. This is especially valuable during development: you build a collection once and use it throughout the project lifecycle for testing, debugging, and demonstration.",
                "**Environment variables** in Postman make collections portable. Instead of hardcoding `http://localhost:3000` into every request URL, you define a variable `{{baseUrl}}` and set its value per environment (local, staging, production). The syntax uses double curly braces: `{{baseUrl}}/api/users`. When you switch environments, every request automatically uses the correct URL.",
                "Postman also supports **test scripts** \u2014 small JavaScript assertions that run after each request and verify the response. For example, you can assert that a `GET` request returns status `200` and the body contains a `name` field. This turns manual API checking into **automated verification** that catches regressions immediately.",
              ],
              demonstration: [
                'Create a new collection called `Training API`. First, set up an **environment variable**: click the eye icon in the top-right, add a variable `baseUrl` with value `http://localhost:3000`. Now add a `GET` request with the URL `{{baseUrl}}/api/users`. When you send the request, Postman replaces `{{baseUrl}}` with the actual URL and the response appears:\n```\nStatus: 200 OK\nContent-Type: application/json\n\n[\n  { "id": 1, "name": "Alice", "email": "alice@example.com" },\n  { "id": 2, "name": "Bob", "email": "bob@example.com" }\n]\n```\nIf you switch the environment to staging, every request in the collection automatically uses the staging URL — no manual edits needed.',
                'Add a `POST` request to `{{baseUrl}}/api/users` with a JSON body:\n```json\n{\n  "name": "Charlie",\n  "email": "charlie@example.com"\n}\n```\nSet the `Content-Type` header to `application/json`. Send the request and confirm a `201 Created` response.',
                "Add a test script to the `GET` request. In the 'Tests' tab, write:\n```js\npm.test('Status is 200', function () {\n  pm.response.to.have.status(200);\n});\npm.test('Response has users', function () {\n  const body = pm.response.json();\n  pm.expect(body).to.be.an('array');\n});\n```\nRun the request \u2014 the test results appear in the 'Test Results' tab. Green checks mean the assertions passed. This is the foundation of automated API testing.",
              ],
              exerciseSteps: [
                "Create a new Postman collection for the training API and add a `GET` request with `{{baseUrl}}` as the URL prefix.",
                "Set up an environment variable called `baseUrl` and configure it with the local server URL.",
                "Add a `POST` request with a JSON body and write a test script that asserts the response status code is `201`.",
              ],
              validationChecks: [
                "User creates an organized collection with descriptive request names.",
                "User uses `{{variableName}}` environment variables instead of hardcoded URLs.",
                "User can write a basic test assertion using `pm.test()` and `pm.response` in the Tests tab.",
              ],
              retention: [
                "Collections organize work \u2014 loose requests create chaos.",
                "Environment variables make collections portable.",
                "Test scripts turn manual checks into automated verification.",
              ],
              tools: ["Postman", "Docker"],
              notesPrompt:
                "Document the steps to create a Postman collection from scratch. Note how variables make it flexible.",
              exercises: [
                {
                  id: "postman-env-var",
                  title: "Environment variables",
                  prompt:
                    "In Postman, how do you reference an environment variable in a URL? Use double curly braces syntax.",
                  placeholder: "{{...}}",
                  validationMode: "includes",
                  acceptedAnswers: ["{{", "}}"],
                  successMessage:
                    "Correct. {{variable_name}} is how Postman injects dynamic values.",
                  hint: "Variables are wrapped in a special syntax using curly braces.",
                  assessmentType: "action",
                },
                {
                  id: "postman-collection-benefit",
                  title: "Why use collections?",
                  prompt:
                    "Why should you organize API requests into a Postman collection instead of sending them individually?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "reuse",
                    "organize",
                    "share",
                    "repeat",
                    "automate",
                    "group",
                    "save",
                    "portable",
                  ],
                  successMessage:
                    "Correct. Collections let you organize, reuse, share, and automate groups of related requests.",
                  hint: "Think about what happens when you need to re-run the same set of requests tomorrow or share them with a teammate.",
                  assessmentType: "reasoning",
                },
                {
                  id: "postman-test-script",
                  title: "Verify with test scripts",
                  prompt:
                    "In Postman, what function do you use to assert that a response has a specific status code? (Start with pm.)",
                  placeholder: "pm. ...",
                  validationMode: "includes",
                  acceptedAnswers: ["pm.test", "pm.response", "pm.expect"],
                  successMessage:
                    "Correct. pm.test() lets you write assertions in the Tests tab \u2014 for example, checking that a response returns status 200 or contains expected data.",
                  hint: "Postman provides a pm object with a test() method that accepts a name and a function containing assertions.",
                  assessmentType: "action" as const,
                },
              ],
              transferTask: {
                id: "transfer-postman-collection",
                title: "Transfer challenge: design a test collection",
                prompt:
                  "You need to test a REST API with three endpoints: list users (GET), create user (POST), delete user (DELETE). Describe how you would organize these in a Postman collection, including which variables you would create and one test assertion per request.",
                placeholder: "Collection design",
                validationMode: "includes",
                acceptedAnswers: [
                  "collection",
                  "variable",
                  "GET",
                  "POST",
                  "DELETE",
                  "status",
                  "test",
                  "assert",
                ],
                successMessage:
                  "Transfer evidence accepted. You designed a structured API test collection.",
                hint: "Name the collection, define a base URL variable, and describe what each request tests.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "postman-test-assertion",
                  title: "Write a Postman test script",
                  description:
                    "Write a Postman test script that verifies the response status code is 200 and the response body contains a 'users' array.",
                  starterCode:
                    "// Write your Postman test script\npm.test('Status is 200', function () {\n  // Assert status code is 200\n});\n\npm.test('Response has users array', function () {\n  // Parse the response and check for users\n});",
                  language: "javascript",
                  hint: "Use pm.response.to.have.status(200) for status checks and pm.response.json() to parse the body.",
                  acceptedPatterns: ["pm.test", "pm.response", "status", "200"],
                },
              ],
              competencies: [
                { track: "ApiInteraction", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "goal-driven",
            },
            {
              id: "lesson-api-authentication",
              title: "API Authentication: Tokens, Keys, and Secrets",
              summary:
                "Understand and implement bearer token auth, API key headers, and safe secret storage with .env files.",
              duration: "50 min",
              difficulty: "Core",
              objective:
                "Send authenticated requests using bearer tokens and API keys, store secrets in .env, and explain why secrets must never be committed.",
              explanation: [
                "Most production APIs require **authentication** to identify and authorise the caller. The two most common mechanisms are **API keys** (a static secret sent in a header or query string) and **bearer tokens** (a short-lived credential obtained by logging in, then sent in the `Authorization` header on every subsequent request).",
                "An **API key** is a long string assigned to your account. You include it in requests as a header (e.g., `X-API-Key: abc123`) or a query parameter (e.g., `?api_key=abc123`). API keys identify the caller but do not expire automatically — if leaked, they remain valid until revoked.",
                "A **bearer token** is obtained through a login or OAuth flow and typically expires after a set time. You send it in the `Authorization` header with the `Bearer` scheme:\n```\nAuthorization: Bearer eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...\n```\nIf the token is missing or expired, the server responds with `401 Unauthorized`. If the token is valid but the user lacks permission, the server responds with `403 Forbidden`. Understanding the difference between `401` and `403` is essential for debugging auth issues.",
                "Secrets must **never** be hardcoded in source files. Store them in a `.env` file as `KEY=VALUE` pairs, then read them in code with `process.env.API_SECRET`. Add `.env` to `.gitignore` so it is never committed. Create `.env.example` with placeholder values and commit that instead — it documents which variables the project needs without exposing real credentials.",
              ],
              demonstration: [
                'Send an unauthenticated request to the practice API:\n```bash\ncurl https://api.example.com/protected\n# HTTP/1.1 401 Unauthorized\n# {"error": "Missing or invalid token"}\n```\nThe `401` status code tells you the request was rejected because no valid credentials were provided.',
                'Now add the bearer token in an `Authorization` header:\n```bash\ncurl -H "Authorization: Bearer eyJhbG..." https://api.example.com/protected\n# HTTP/1.1 200 OK\n# {"data": "secret information"}\n```\nThe `200 OK` response confirms authentication succeeded. In Postman, you set this in the \'Authorization\' tab by choosing \'Bearer Token\' and pasting the token value.',
                "Move the token into a `.env` file for safe storage:\n```bash\necho 'API_TOKEN=eyJhbG...' > .env\necho '.env' >> .gitignore\ngit status\n# .env is untracked (ignored by .gitignore) \u2014 safe\n```\nIn the application code, read it with `const token = process.env.API_TOKEN;`. The secret stays out of version control and can be rotated without changing code.",
                "When authentication fails, the server gives you specific error responses that tell you what went wrong. An expired bearer token still returns `401` but includes expiration details:\n```bash\ncurl -H \"Authorization: Bearer eyJhbG...expired\" https://api.example.com/protected\n# HTTP/1.1 401 Unauthorized\n# {\"error\": \"Token expired\", \"expired_at\": \"2026-04-04T12:00:00Z\"}\n```\nIf you send a malformed header (missing the `Bearer` prefix), the error message changes:\n```bash\ncurl -H \"Authorization: eyJhbG...\" https://api.example.com/protected\n# HTTP/1.1 401 Unauthorized\n# {\"error\": \"Invalid authorization header format. Expected 'Bearer <token>'\"}\n```\nA valid token on a resource the user cannot access returns `403 Forbidden` instead:\n```bash\ncurl -H \"Authorization: Bearer eyJhbG...valid\" https://api.example.com/admin/settings\n# HTTP/1.1 403 Forbidden\n# {\"error\": \"Insufficient permissions\"}\n```\nThe distinction matters: `401` means retry with valid credentials; `403` means the credentials are fine but the user role does not have access.",
              ],
              exerciseSteps: [
                "Send an unauthenticated request to the practice API and observe the `401 Unauthorized` response.",
                "Add the provided bearer token in the `Authorization: Bearer <token>` header and confirm a `200 OK` response.",
                "Create a `.env` file, store the token as `API_TOKEN=<value>`, and verify that `.env` is listed in `.gitignore`.",
              ],
              validationChecks: [
                "User can construct a valid `Authorization: Bearer <token>` header and send an authenticated request.",
                "User stores the secret in `.env` and reads it via `process.env` in the application code.",
                "User confirms `.env` is listed in `.gitignore` before making any commits.",
              ],
              retention: [
                "Bearer tokens go in the Authorization header: Authorization: Bearer <token>.",
                ".env keeps secrets off disk and out of Git — always gitignore it.",
                "A 401 means unauthenticated; a 403 means authenticated but not authorised.",
              ],
              tools: ["Postman", "terminal", "Visual Studio Code"],
              notesPrompt:
                "Describe the difference between an API key and a bearer token. Note where each is sent and how you store each safely.",
              exercises: [
                {
                  id: "bearer-header-syntax",
                  title: "Bearer header format",
                  prompt:
                    "What is the correct HTTP header name and value format for sending a bearer token?",
                  placeholder: "HeaderName: Value",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "Authorization: Bearer",
                    "authorization: bearer",
                  ],
                  successMessage:
                    "Correct. The Authorization header with the Bearer scheme is the standard way to send access tokens.",
                  hint: "The header is named Authorization and the value starts with a specific word before the token.",
                  assessmentType: "action",
                },
                {
                  id: "env-gitignore",
                  title: "Protecting secrets from Git",
                  prompt:
                    "Which file must you add to .gitignore to prevent API secrets from being committed?",
                  placeholder: "filename",
                  validationMode: "includes",
                  acceptedAnswers: [".env"],
                  successMessage:
                    "Correct. .env holds local secrets and must always be excluded from version control.",
                  hint: "It starts with a dot and holds environment variable assignments.",
                  assessmentType: "action",
                },
                {
                  id: "auth-status-codes",
                  title: "Authentication status codes",
                  prompt:
                    "What is the difference between HTTP status code 401 and 403?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "unauthorized",
                    "forbidden",
                    "identity",
                    "permission",
                    "credentials",
                    "not authenticated",
                    "not authorized",
                  ],
                  successMessage:
                    "Correct. 401 means the client is not authenticated (no valid credentials provided). 403 means the client is authenticated but does not have permission to access the resource.",
                  hint: "One means 'I do not know who you are.' The other means 'I know who you are, but you are not allowed.'",
                  assessmentType: "reasoning" as const,
                },
              ],
              transferTask: {
                id: "transfer-api-auth",
                title: "Transfer challenge: secure an API workflow",
                prompt:
                  "You are building a script that calls a third-party API requiring a bearer token. Describe how you store the token, how the script reads it, and what safeguards prevent the token from being committed to Git.",
                placeholder: "Secret management approach",
                validationMode: "includes",
                acceptedAnswers: [
                  ".env",
                  "gitignore",
                  "environment",
                  "variable",
                  "bearer",
                  "secret",
                  "never commit",
                ],
                successMessage:
                  "Transfer evidence accepted. You demonstrated secure secret management for API workflows.",
                hint: "Cover .env storage, process.env access, and .gitignore protection.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "fetch-with-bearer",
                  title: "Add bearer token to a fetch request",
                  description:
                    "Complete the fetch call so it includes the Authorization header with a bearer token read from an environment variable.",
                  starterCode:
                    "const API_TOKEN = process.env.API_TOKEN;\n\nasync function getUser(id: number) {\n  const response = await fetch(`https://api.example.com/users/${id}`, {\n    headers: {\n      // Add the Authorization header with bearer token\n    },\n  });\n  return response.json();\n}",
                  language: "typescript",
                  hint: "The header name is 'Authorization' and the value format is 'Bearer ' followed by the token variable.",
                  acceptedPatterns: ["Authorization", "Bearer", "API_TOKEN"],
                },
                {
                  id: "env-secret-loading",
                  title: "Load secrets from environment",
                  description:
                    "Write code that reads an API key from a .env file using process.env and throws an error if the key is missing.",
                  starterCode:
                    "// Read the API key from environment\n// Throw an error with a clear message if it is not set\n\nconst apiKey = // your code here\n\nconsole.log('Key loaded:', apiKey ? 'yes' : 'no');",
                  language: "typescript",
                  hint: "Use process.env.API_KEY and check if it is undefined or empty before proceeding.",
                  acceptedPatterns: ["process.env", "throw", "API_KEY"],
                },
              ],
              competencies: [
                { track: "ApiInteraction", targetLevel: "Functional" },
                { track: "SecurityAwareness", targetLevel: "Aware" },
              ],
              scaffoldingLevel: "goal-driven",
            },
          ],
        },
      ],
    },
    {
      id: "phase-3",
      title: "Engineering Workflow and Delivery",
      strapline:
        "Learn how engineering work is actually managed and completed.",
      purpose:
        "Build disciplined project execution: Git workflows, testing strategy, refactoring, task planning, deployment concepts, security basics, observability, and AI-assisted work with verification discipline.",
      level: "Intermediate to advanced",
      duration: "8–10 weeks",
      environment:
        "Practice repos with pre-seeded issues, broken tests, and deployment pipelines",
      tools: [
        "Git",
        "GitHub",
        "Docker",
        "GitHub Actions",
        "Vitest",
        "Visual Studio Code",
        "AI coding assistant",
        "terminal",
      ],
      guardrails: [
        "All practice repos are disposable and resettable.",
        "Broken states are intentional and recoverable.",
        "AI suggestions require explicit verification before acceptance.",
        "Every delivery task ends with a verification step.",
      ],
      milestones: [
        "Fix a bug on a feature branch and produce a clean commit",
        "Write tests for a failing component",
        "Containerize a small application",
        "Complete a task from issue to working solution",
        "Use AI tools with systematic verification",
      ],
      projects: [
        "Fix a bug on a feature branch and produce a clean commit",
        "Write tests for a failing component and make them pass",
        "Refactor duplicated logic without breaking behavior",
        "Set up a GitHub Actions workflow for automated testing",
        "Complete a mini capstone from issue to working solution",
      ],
      competencyFocus: [
        "VersionControl",
        "Testing",
        "DeliveryWorkflow",
        "Debugging",
        "Documentation",
      ],
      exitStandard: {
        summary:
          "The learner can take a scoped task, implement it in a small codebase, validate it, document it, and explain what they changed and why.",
        gates: [
          {
            description:
              "Execute a full Git workflow: branch, commit, diff, and pull request",
            competency: "VersionControl",
            requiredLevel: "Functional",
          },
          {
            description:
              "Write and run tests for a component, interpret failures",
            competency: "Testing",
            requiredLevel: "Functional",
          },
          {
            description:
              "Complete a delivery task with validation and a clean commit message",
            competency: "DeliveryWorkflow",
            requiredLevel: "Assisted",
          },
          {
            description: "Diagnose a broken local app startup from logs",
            competency: "Debugging",
            requiredLevel: "Functional",
          },
          {
            description:
              "Write a README and code comments that a new teammate can follow",
            competency: "Documentation",
            requiredLevel: "Assisted",
          },
        ],
        representativeLabs: [
          "Fix a bug on a feature branch and produce a clean commit",
          "Write tests for a failing component",
          "Refactor duplicated logic without breaking behavior",
          "Diagnose a broken local app startup",
          "Complete a mini capstone from issue to working solution",
        ],
      },
      courses: [
        {
          id: "course-docker-fundamentals",
          title: "Docker Fundamentals",
          focus: "Images, containers, Dockerfiles, volumes, and compose",
          outcome:
            "Learners can build, run, and debug containerized applications confidently.",
          lessons: [
            {
              id: "lesson-docker-basics",
              title: "Containers: Isolated Environments on Demand",
              summary:
                "Understand what containers are, why they matter, and how to run your first one.",
              duration: "45 min",
              difficulty: "Core",
              objective:
                "Run a container, inspect its state, and understand the difference between images and containers.",
              explanation: [
                "A **container** is a lightweight, isolated environment that runs a process with its own filesystem, network, and dependencies — completely separate from your host machine. It solves the classic 'works on my machine' problem because the container carries everything it needs to run. Think of it as a sealed box: same contents every time, on any machine that has Docker installed.",
                "The mental model you need: an **image** is a blueprint — a read-only template that defines what goes inside the container. A **container** is a running instance of that image. You can run many containers from the same image, just like you can print many copies from the same PDF. Images are built once and reused; containers are created, started, stopped, and discarded.",
                "The core Docker CLI commands you will use constantly: `docker pull` downloads an image, `docker run` creates and starts a container from an image, `docker ps` lists running containers, `docker logs <container>` shows the output of a container, `docker stop <container>` shuts it down, and `docker exec -it <container> sh` opens an interactive shell inside a running container for inspection. When you run a container, the `-p` flag maps a network port from the container to your host machine — for example, `docker run -p 8080:80 nginx` makes the container's port 80 accessible at `http://localhost:8080`. Port mapping and interactive exec are the two features that turn containers from abstract concepts into practical tools.",
                "Containers are **ephemeral by default** — when you stop and remove a container, any data written inside it disappears. This is a feature, not a bug: ephemeral containers mean you can always start fresh. When you need data to persist (like a database or uploaded files), you mount a **volume** using the `-v` flag. The syntax `docker run -v mydata:/app/data myimage` creates a named volume called `mydata` and mounts it at `/app/data` inside the container. Data written to that path survives container removal — stop, remove, and recreate the container, and the volume data is still there:\n\n```bash\ndocker run -v pgdata:/var/lib/postgresql/data postgres\n# Database files persist in the pgdata volume even after the container is removed\n```\n\nVolumes are how stateful services work in Docker. Stateless services (web servers, API servers) should remain ephemeral — that is the default you want.",
              ],
              demonstration: [
                'Run a web server in a container with port mapping. `docker run -d -p 8080:80 --name web nginx` starts Nginx in the background, maps host port 8080 to container port 80, and names the container `web`:\n\n```bash\n$ docker run -d -p 8080:80 --name web nginx\na1b2c3d4e5f6789012345678...\n\n$ docker ps\nCONTAINER ID   IMAGE   COMMAND                  PORTS                  STATUS\na1b2c3d4e5f6   nginx   "/docker-entrypoint.…"   0.0.0.0:8080->80/tcp   Up 5 seconds\n\n$ curl http://localhost:8080\n<!DOCTYPE html>\n<html>\n<head><title>Welcome to nginx!</title></head>\n<body>\n<h1>Welcome to nginx!</h1>\n...\n</body>\n</html>\n```\n\nThe `PORTS` column in `docker ps` confirms the mapping: traffic to `localhost:8080` reaches port 80 inside the container. This is how you expose any containerized service to your host machine.',
                'Check what a container is doing with `docker logs`, and inspect it interactively with `docker exec`:\n\n```bash\n$ docker logs web\n172.17.0.1 - - [05/Apr/2026:14:22:01 +0000] "GET / HTTP/1.1" 200 615 "-" "curl/8.4.0"\n```\n\nOpen a shell inside the running container to explore its filesystem:\n\n```bash\n$ docker exec -it web sh\n/ # ls /usr/share/nginx/html/\n50x.html  index.html\n/ # cat /etc/nginx/nginx.conf | head -3\nuser  nginx;\nworker_processes  auto;\nerror_log  /var/log/nginx/error.log notice;\n/ # exit\n```\n\nNow see a common error — starting a second container on the same port:\n\n```bash\n$ docker run -d -p 8080:80 --name web2 nginx\ndocker: Error response from daemon: Ports are not available:\nexposing port TCP 0.0.0.0:8080 -> 0.0.0.0:0:\nlisten tcp 0.0.0.0:8080: bind: address already in use.\n```\n\nThe fix: use a different host port (`docker run -d -p 8081:80 --name web2 nginx`) or stop the existing container first with `docker stop web`.',
                'Volumes make data survive container removal. Write a file inside a container using a named volume, then destroy the container and verify the data persists:\n\n```bash\n$ docker run -d -v appdata:/data --name writer alpine sh -c "echo hello > /data/greeting.txt && sleep 3600"\n2f4a6b8c...\n\n$ docker exec writer cat /data/greeting.txt\nhello\n\n$ docker stop writer && docker rm writer\nwriter\nwriter\n\n$ docker run --rm -v appdata:/data alpine cat /data/greeting.txt\nhello\n```\n\nThe `writer` container is gone, but the `appdata` volume kept the file. This is how databases and other stateful services maintain data between container restarts. Clean up with `docker stop web && docker rm web` and `docker volume rm appdata`.',
              ],
              exerciseSteps: [
                "Run `docker pull hello-world` to download the training image, then run `docker run hello-world` to create and start a container from it.",
                "Run `docker ps` to list running containers. Since hello-world exits immediately, run `docker ps -a` to see all containers including stopped ones — identify yours by the IMAGE column showing `hello-world`.",
                "Run `docker run -d --name practice nginx` to start a background container, then run `docker stop practice` to shut it down. Verify it is no longer running with `docker ps`, and confirm it still exists in a stopped state with `docker ps -a`.",
              ],
              validationChecks: [
                "User runs `docker pull` and `docker run` to download an image and start a container from it.",
                "User runs `docker ps` and `docker ps -a` to list running and stopped containers, and can identify which container corresponds to which image.",
                "User can explain the container lifecycle: pull → run → running → stop → exited, and understands that containers are **ephemeral** by default — data inside them does not persist after removal.",
              ],
              retention: [
                "Images are blueprints. Containers are running instances.",
                "Containers are ephemeral by default \u2014 data disappears when they stop.",
                "docker ps shows what is running. docker ps -a shows everything.",
              ],
              tools: ["Docker", "terminal"],
              notesPrompt:
                "Write the five Docker commands you consider essential. Explain what each does in one sentence.",
              exercises: [
                {
                  id: "docker-run",
                  title: "Run a container",
                  prompt:
                    "What Docker command runs a new container from an image?",
                  placeholder: "docker ...",
                  validationMode: "includes",
                  acceptedAnswers: ["docker run"],
                  successMessage:
                    "Correct. docker run creates and starts a container from the specified image.",
                  hint: "The command name literally describes what it does.",
                  assessmentType: "action",
                },
                {
                  id: "docker-ps",
                  title: "List containers",
                  prompt:
                    "What command shows currently running Docker containers?",
                  placeholder: "docker ...",
                  validationMode: "includes",
                  acceptedAnswers: ["docker ps"],
                  successMessage:
                    "Correct. docker ps is the first thing you check when debugging container issues.",
                  hint: "ps stands for process status \u2014 a Linux convention.",
                  assessmentType: "action",
                },
                {
                  id: "docker-logs",
                  title: "View container output",
                  prompt:
                    "What Docker command shows the output (logs) of a running or stopped container?",
                  placeholder: "docker ...",
                  validationMode: "includes",
                  acceptedAnswers: ["docker logs"],
                  successMessage:
                    "Correct. docker logs <container> shows the standard output and error output \u2014 your first debugging tool for containers.",
                  hint: "You need to see what a container printed while running. The command takes the container name or ID.",
                  assessmentType: "action",
                },
              ],
              transferTask: {
                id: "transfer-docker-debug",
                title: "Transfer challenge: debug a failing container",
                prompt:
                  "A team member says their container starts but the app inside is unreachable. Describe the Docker commands you would run to diagnose the problem and the order you would run them in.",
                placeholder: "Docker debugging steps",
                validationMode: "includes",
                acceptedAnswers: [
                  "docker ps",
                  "docker logs",
                  "docker stop",
                  "docker run",
                ],
                successMessage:
                  "Transfer evidence accepted. You demonstrated a systematic container debugging approach.",
                hint: "Start with what is running, then check logs for errors, then verify the container is still running and was started correctly.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "docker-run-hello-world",
                  title: "Run hello-world container",
                  description:
                    "Run the official hello-world Docker image to verify Docker is working.",
                  starterCode: "# Run the hello-world container\n",
                  language: "bash",
                  hint: "Use docker run hello-world to pull and run the hello-world image.",
                  acceptedPatterns: ["docker run", "hello-world"],
                },
                {
                  id: "docker-list-containers",
                  title: "List all containers",
                  description:
                    "List all containers including stopped ones to see the full container history.",
                  starterCode: "# List all containers\n",
                  language: "bash",
                  hint: "Use docker ps -a to show all containers, not just running ones.",
                  acceptedPatterns: ["docker ps", "-a"],
                },
              ],
              competencies: [
                { track: "DeliveryWorkflow", targetLevel: "Functional" },
                { track: "Debugging", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "goal-driven",
            },
            {
              id: "lesson-dockerfile",
              title: "Write a Dockerfile",
              summary:
                "Create a Dockerfile that builds a custom image for your application.",
              duration: "50 min",
              difficulty: "Core",
              objective:
                "Write a Dockerfile with proper layering, caching, and security considerations.",
              explanation: [
                "A **Dockerfile** is a text file that contains the exact recipe for building a Docker image. Each line is an instruction, and each instruction creates a **layer** in the final image. Docker caches these layers — so when you rebuild after a small change, only the layers affected by the change need to rebuild. This is why **instruction order matters for build speed**.",
                "The five core instructions you will use in nearly every Dockerfile: `FROM` sets the base image (every Dockerfile starts with this), `COPY` copies files from your project into the image, `RUN` executes a command inside the image during build (like `npm install`), `EXPOSE` documents which port the application listens on, and `CMD` defines the default command that runs when a container starts.",
                "The most important optimization: **put rarely-changing instructions first**. Copy `package.json` and run `npm install` *before* copying the rest of your source code. Why? Because source code changes frequently, but dependencies change rarely. If you copy everything first, Docker invalidates the `npm install` cache on every source change — meaning a slow install runs every single build. The correct pattern:\n\n```dockerfile\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\n```",
                "Two production best practices: first, create a `.dockerignore` file to exclude `node_modules`, `.git`, and other files that should not be in the image — this keeps images small and prevents leaking secrets. Second, **do not run your application as root** inside the container. Add a `USER node` instruction (or create a non-root user) before `CMD`. Running as root inside a container is a security risk — if the container is compromised, the attacker has root access to the container's filesystem.",
              ],
              demonstration: [
                'Start with a complete Dockerfile for a Node.js application:\n\n```dockerfile\nFROM node:20-alpine\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nEXPOSE 3000\nUSER node\nCMD ["node", "server.js"]\n```\n\nEach line has a purpose: `FROM` picks a small Alpine-based Node image, `WORKDIR` sets the working directory inside the container, `COPY package*.json` copies only the dependency files first, `RUN npm ci` installs dependencies (cached unless package.json changes), `COPY . .` brings in the source code, `EXPOSE` documents the port, `USER` drops root privileges, and `CMD` starts the app.',
                "Build the image: `docker build -t myapp .` — Docker processes each instruction and caches the result. The first build takes longer because `npm ci` must download everything. Now change a line in `server.js` and rebuild: `docker build -t myapp .` — notice that the `COPY package*.json` and `RUN npm ci` layers say `CACHED`. Only the `COPY . .` layer and everything after it rebuilds. This is the caching optimization in action:\n\n```bash\ndocker build -t myapp .\n# [2/6] COPY package*.json ./    CACHED\n# [3/6] RUN npm ci                CACHED\n# [4/6] COPY . .                  0.2s\n```",
                "Run the built image: `docker run -p 3000:3000 myapp` — the `-p` flag maps port 3000 on your host to port 3000 in the container. Open a browser to `http://localhost:3000` to verify the app is running inside the container with the correct dependencies and configuration.",
                'For production images, use a **multi-stage build** to separate the build environment from the runtime environment. The build stage installs dev dependencies and compiles; the runtime stage copies only the production artifacts:\n\n```dockerfile\n# Build stage\nFROM node:20-alpine AS build\nWORKDIR /app\nCOPY package*.json ./\nRUN npm ci\nCOPY . .\nRUN npm run build\n\n# Runtime stage \u2014 no dev dependencies, no source code\nFROM node:20-alpine\nWORKDIR /app\nCOPY --from=build /app/dist ./dist\nCOPY --from=build /app/node_modules ./node_modules\nCOPY package*.json ./\nUSER node\nCMD ["node", "dist/server.js"]\n```\n\nThe build output shows layer caching in action:\n\n```bash\n$ docker build -t myapp .\n[build 1/6] FROM node:20-alpine          CACHED\n[build 2/6] COPY package*.json ./        CACHED\n[build 3/6] RUN npm ci                   CACHED\n[build 4/6] COPY . .                     0.3s\n[build 5/6] RUN npm run build            2.1s\n[stage-1 1/4] COPY --from=build /app/dist ./dist  0.1s\n```\n\nThe final image contains only compiled output and production dependencies \u2014 no TypeScript source, no dev tooling, no test files. Smaller images are faster to deploy and have a reduced attack surface.',
                "Create a `.dockerignore` file to exclude files that should never enter the Docker build context. Without it, `COPY . .` sends everything — including `node_modules`, `.git`, and potentially secrets — into the image:\n\n```\nnode_modules\n.git\n.gitignore\n*.md\n.env\n.env.*\ncoverage\ndist\n.DS_Store\n```\n\nA good `.dockerignore` keeps images lean (avoids copying a 200 MB `node_modules` folder that `npm ci` will replace anyway) and prevents accidental secret leakage (no `.env` files with API keys baked into the image). It follows the same glob syntax as `.gitignore`.",
              ],
              exerciseSteps: [
                "Write a Dockerfile that starts with `FROM node:20-alpine`, sets a `WORKDIR`, copies `package*.json` and runs `npm ci` before copying the rest of the source code.",
                "Build the image with `docker build -t practice-app .` and read the build output to confirm each layer is processed. Note which layers are cached on a second build.",
                "Run the image with `docker run -p 3000:3000 practice-app` and verify the application responds correctly. Check that your Dockerfile includes a `USER` instruction to avoid running as root.",
              ],
              validationChecks: [
                "Dockerfile starts with a `FROM` instruction using an appropriate base image (e.g., `node:20-alpine`).",
                "`COPY package*.json` and `RUN npm ci` appear **before** `COPY . .` to optimize layer caching — changing source code does not trigger a full dependency reinstall.",
                "The image builds cleanly with `docker build`, runs with `docker run`, and serves the expected output. A `USER` instruction or non-root configuration is present for security.",
              ],
              retention: [
                "Order matters \u2014 put rarely changing instructions first.",
                "Use .dockerignore to keep images clean.",
                "Run as non-root in production images.",
              ],
              tools: ["Docker", "Visual Studio Code", "terminal"],
              notesPrompt:
                "Write a Dockerfile template you can reuse. Annotate each line with its purpose.",
              exercises: [
                {
                  id: "dockerfile-from",
                  title: "Base image",
                  prompt:
                    "What Dockerfile instruction specifies the base image?",
                  placeholder: "Instruction name",
                  validationMode: "exact",
                  acceptedAnswers: ["FROM", "from"],
                  successMessage:
                    "Correct. FROM is always the first instruction in a Dockerfile.",
                  hint: "Every Docker image is built FROM another image.",
                  assessmentType: "action",
                },
                {
                  id: "dockerfile-layer-order",
                  title: "Layer ordering",
                  prompt:
                    "Why should you COPY package.json and run npm install before copying the rest of your source code in a Dockerfile?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "cache",
                    "layer",
                    "rebuild",
                    "change",
                    "faster",
                    "avoid",
                    "skip",
                  ],
                  successMessage:
                    "Correct. Copying package.json first lets Docker cache the npm install layer. Source code changes then skip the slow install step.",
                  hint: "Think about what Docker has to re-run when a layer changes.",
                  assessmentType: "reasoning",
                },
                {
                  id: "dockerignore-purpose",
                  title: ".dockerignore purpose",
                  prompt:
                    "Why should you create a .dockerignore file, and name two things it should exclude?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "node_modules",
                    ".git",
                    "size",
                    "small",
                    "exclude",
                    "secret",
                    "leak",
                    "ignore",
                  ],
                  successMessage:
                    "Correct. A .dockerignore excludes files like node_modules and .git from the build context \u2014 keeping images small and preventing secrets from being included.",
                  hint: "Think about files that are large or sensitive and should not end up inside your Docker image.",
                  assessmentType: "reasoning",
                },
              ],
              transferTask: {
                id: "transfer-dockerfile-review",
                title: "Transfer challenge: review a Dockerfile",
                prompt:
                  "A colleague sends you a Dockerfile that COPYs everything before RUN npm install and runs the app as root. Identify both problems and explain how to fix them.",
                placeholder: "Problems and fixes",
                validationMode: "includes",
                acceptedAnswers: [
                  "cache",
                  "order",
                  "non-root",
                  "user",
                  "layer",
                  ".dockerignore",
                ],
                successMessage:
                  "Transfer evidence accepted. You demonstrated Dockerfile review competence.",
                hint: "Think about what happens to the npm install layer when source code changes, and why running as root is risky.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "dockerfile-base-image",
                  title: "Set the base image",
                  description:
                    "Write the first line of a Dockerfile that uses Node.js 20 on Alpine Linux as the base image.",
                  starterCode: `# Write the FROM instruction\n`,
                  language: "dockerfile",
                  hint: "Use FROM followed by the image name and tag, e.g. node:20-alpine.",
                  acceptedPatterns: ["FROM", "node", "alpine"],
                },
                {
                  id: "dockerfile-copy-install",
                  title: "Copy and install dependencies",
                  description:
                    "Write the Dockerfile lines that copy package.json first, run npm ci, then copy the rest of the source code. This pattern optimises the Docker layer cache.",
                  starterCode: `WORKDIR /app\n# Copy package files and install, then copy source\n`,
                  language: "dockerfile",
                  hint: "COPY package*.json first, then RUN npm ci, then COPY . . for the source.",
                  acceptedPatterns: ["COPY", "npm ci", "package"],
                },
              ],
              competencies: [
                { track: "DeliveryWorkflow", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "goal-driven",
            },
          ],
        },

        {
          id: "course-ai-engineering",
          title: "AI in Real Engineering Work",
          focus:
            "Planning, implementation, review, and verification with AI assistance",
          outcome:
            "Learners can use AI to accelerate work while preserving correctness, clarity, and system understanding.",
          lessons: [
            {
              id: "lesson-ai-prompting",
              title: "Write Prompts Like an Engineer",
              summary:
                "Learn to give AI clear, constrained, context-rich instructions.",
              duration: "40 min",
              difficulty: "Advanced",
              objective:
                "Write engineering prompts that specify constraints, context, expected output format, and verification criteria.",
              explanation: [
                "The quality of AI output is directly proportional to the quality of the input. A prompt like 'write a function' gives the AI almost nothing to work with — it does not know the language, the input types, the edge cases, or how you plan to verify the result. **Vague prompts produce vague results.** Precise engineering prompts produce code that is closer to production-ready on the first attempt.",
                "An effective engineering prompt has five components: **task definition** (what the function/component should do), **constraints** (language, framework, performance requirements), **context** (where this code fits in the system), **expected output format** (return type, response shape, error format), and **uncertainty handling** (what the AI should do if it is unsure — ask, flag, or use a safe default).",
                "The difference is dramatic. Compare these two prompts:\n\n- Vague: `Write a sort function`\n- Precise: `Write a TypeScript function called sortByDate that takes an array of objects with a createdAt: string field (ISO 8601), returns a new array sorted newest-first, and throws a TypeError if any createdAt value is not a valid date string. Include JSDoc.`\n\nThe second prompt constrains the language, names the function, defines the input shape, specifies the sort order, handles the error case, and requests documentation. The AI has almost no room to guess wrong.",
                "One more critical habit: **include verification criteria in the prompt**. Adding 'include a test that covers the happy path, an empty array, and an invalid date input' means the AI generates its own validation alongside the code. This saves you from writing the test from scratch and forces the AI to think about edge cases during generation, not after.",
              ],
              demonstration: [
                "Start with the vague prompt: `Write a function to validate emails.` The AI produces something generic — it might pick JavaScript or Python, might or might not handle empty strings, and probably does not include tests. Now compare with the precise version:\n\n```text\nWrite a TypeScript function called isValidEmail that:\n- Takes a single string parameter\n- Returns boolean\n- Returns false for empty strings, strings without @, and strings where @ is the first or last character\n- Does NOT use regex — use string methods only\n- Include a Vitest test covering: valid email, empty string, missing @, @ at start, @ at end\n```\n\nThe precise prompt eliminates guesswork. The AI knows the language, the function name, the return type, every edge case to handle, the implementation constraint (no regex), and exactly what tests to write.",
                "Review the AI output against the prompt like a checklist: Does the function use TypeScript? Does it handle all five edge cases? Does it avoid regex? Do the tests cover what was requested? This is how engineering prompts create verifiable output — you know exactly what to check because you specified it upfront.",
                "Notice the meta-skill: **writing a good prompt requires the same thinking as writing the code yourself** — you have to understand the requirements, edge cases, and verification criteria. The prompt is not a shortcut around understanding. It is a way to externalize your engineering thinking so the AI can execute it faster.",
              ],
              exerciseSteps: [
                "Read this vague prompt: `Write code to handle user data.` Identify at least three missing pieces of information (language, data shape, operation type, error handling, output format).",
                "Rewrite the prompt as a precise engineering prompt that includes: **task definition**, **constraints** (language, types), **context**, **expected output format**, and at least one **edge case** to handle.",
                "Compare your rewritten prompt to the original. For each constraint you added, explain how it reduces the chance of the AI producing unusable output.",
              ],
              validationChecks: [
                "User identifies at least three missing elements in a vague prompt (e.g., language, types, edge cases, return format, verification).",
                "User rewrites the prompt with specific **constraints**, **expected output format**, and at least one named edge case.",
                "User includes verification criteria — such as `include a test for...` or `the caller should be able to verify by...` — in the rewritten prompt.",
              ],
              retention: [
                "Better prompts come from better engineering thinking.",
                "Always specify language, constraints, and edge cases.",
                "If the prompt does not mention how to verify, add that.",
              ],
              tools: ["AI coding assistant", "Visual Studio Code"],
              notesPrompt:
                "Write a template for engineering prompts. Include sections for task, constraints, context, and verification.",
              exercises: [
                {
                  id: "prompt-improve",
                  title: "Improve the prompt",
                  prompt:
                    "A developer says \u2018write a function to sort data.\u2019 Name one critical missing constraint.",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "type",
                    "language",
                    "order",
                    "input",
                    "format",
                    "ascending",
                    "descending",
                    "what kind",
                  ],
                  successMessage:
                    "Correct. Without specifying the data type, language, or sort order, the AI is guessing.",
                  hint: "Think about what you would need to know before writing the function yourself.",
                  assessmentType: "reasoning",
                },
                {
                  id: "prompt-edge-cases",
                  title: "Specify edge cases",
                  prompt:
                    "Why should an engineering prompt include edge cases or error conditions for the AI to handle?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "miss",
                    "ignore",
                    "skip",
                    "forget",
                    "handle",
                    "robust",
                    "error",
                    "unexpected",
                    "assume",
                  ],
                  successMessage:
                    "Correct. Without explicit edge cases, AI will often produce code that only handles the happy path and breaks on unexpected input.",
                  hint: "Think about what AI-generated code usually leaves out when the prompt does not mention it.",
                  assessmentType: "reasoning",
                },
                {
                  id: "prompt-verification",
                  title: "Include verification criteria",
                  prompt:
                    "Why should you add 'include a test for...' or 'verify by...' to your AI prompt?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "verify",
                    "check",
                    "test",
                    "validate",
                    "correct",
                    "edge",
                    "prove",
                    "catch",
                  ],
                  successMessage:
                    "Correct. Including verification criteria forces the AI to consider correctness during generation and gives you a concrete way to check the output.",
                  hint: "Think about what you would do after the AI generates code \u2014 and how you could ask for that upfront.",
                  assessmentType: "reasoning",
                },
              ],
              transferTask: {
                id: "transfer-prompt-engineering",
                title: "Transfer challenge: write a production prompt",
                prompt:
                  "Write an engineering prompt that asks AI to create a function. Include: task definition, language, input/output types, edge cases, and how to verify the result.",
                placeholder: "Full engineering prompt",
                validationMode: "includes",
                acceptedAnswers: [
                  "function",
                  "type",
                  "edge",
                  "test",
                  "verify",
                  "return",
                  "input",
                ],
                successMessage:
                  "Transfer evidence accepted. You demonstrated structured prompt engineering.",
                hint: "Cover what the function does, its signature, at least one edge case, and how you would test the output.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "ai-prompt-structure",
                  title: "Structure an AI prompt",
                  description:
                    "Write a well-structured prompt for an AI to generate a function that calculates Fibonacci numbers up to n.",
                  starterCode: "# Write your prompt here\n",
                  language: "text",
                  hint: "Include the task, constraints (language, efficiency), context, expected output format, and verification criteria.",
                  acceptedPatterns: [
                    "function",
                    "fibonacci",
                    "calculate",
                    "up to",
                    "return",
                  ],
                },
                {
                  id: "ai-prompt-refine",
                  title: "Refine a vague prompt",
                  description:
                    "Take the vague prompt 'write code' and refine it into a precise engineering prompt for a React component.",
                  starterCode: "# Refined prompt\n",
                  language: "text",
                  hint: "Add specifics about the component's purpose, props, state, and expected behavior.",
                  acceptedPatterns: [
                    "component",
                    "props",
                    "state",
                    "render",
                    "React",
                  ],
                },
              ],
              competencies: [
                { track: "DeliveryWorkflow", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "goal-driven",
            },
            {
              id: "lesson-ai-verification",
              title: "Verify AI Output Like a Professional",
              summary:
                "Learn where AI helps, where it misleads, and how to wrap its output in professional verification.",
              duration: "55 min",
              difficulty: "Advanced",
              objective:
                "Apply AI to planning, coding, refactoring, and debugging while maintaining clear accountability for correctness.",
              explanation: [
                "AI coding assistants are powerful because they compress **draft generation** (writing boilerplate, scaffolding functions), **recall** (remembering API signatures, syntax patterns), and **iteration** (refactoring, renaming, restructuring). They are dangerous because they can produce output that **sounds convincing while being wrong** — hallucinated API methods, outdated library usage, or logic that passes a quick glance but fails on edge cases.",
                "The operating principle: **AI is a drafting tool, not an authority.** You direct it with precise prompts, you constrain it with context about your actual codebase, and you verify every piece of output before it enters your code. The AI does not know your project's architecture, your team's conventions, or whether the library version it references is the one you are actually using.",
                "Verification has two layers: **automated checks** and **manual inspection**. Automated checks include running `npx tsc --noEmit` (type checking), `npm run lint` (style and correctness rules), and `npm test` (behavioral verification). If any of these fail on AI-generated code, the code is not ready. Manual inspection means reading the generated code line by line to check for: assumptions that do not match your codebase, hardcoded values that should be configurable, missing error handling, and security issues like unsanitized input.",
                "The professional standard is simple: **never commit AI-generated code you have not verified.** Treat AI output the same way you would treat a pull request from a junior teammate — review it, test it, and only accept it when you are confident it meets your standards. The time AI saves in writing is only valuable if you do not spend twice as long debugging its mistakes.",
              ],
              demonstration: [
                "Watch the verification loop in action. First, an AI generates a utility function from a well-structured prompt. The code looks clean and compiles — but before committing, run the automated checks:\n\n```bash\nnpx tsc --noEmit      # Does it type-check?\nnpm run lint          # Does it follow project conventions?\nnpm test              # Do existing tests still pass?\n```\n\nAll three must pass. If any fails, the AI output needs correction before proceeding.",
                "Now the manual inspection layer. Read the generated code and check: Does it import from packages that are actually in your `package.json`? Does it handle the error cases you specified? Does it follow your project's naming conventions? In this example, the AI used `axios` but the project uses `fetch` — a subtle mismatch that automated checks would not catch but a code review would. Another common trap is **hallucinated APIs**: the AI might write `users.findFirst(u => u.active)` — a method that sounds reasonable but does not exist on JavaScript arrays. The correct method is `users.find(u => u.active)`. These plausible-looking errors are the most dangerous because they compile without warning and fail silently at runtime.",
                "Finally, write a targeted test for the AI-generated function — not just the happy path, but the edge cases the AI might have overlooked. Run `npm test` again with the new test included. If it passes, the function is verified. If it fails, you have found a gap the AI missed. This **prompt → generate → verify → test → accept** loop is the professional workflow for AI-assisted engineering.",
              ],
              exerciseSteps: [
                "Write a precise prompt for a utility function, then generate or simulate the AI output. Before touching the result, write down what you expect: return type, edge cases handled, imports used.",
                "Read the AI-generated code line by line. Check: Does it use the correct imports for **your** project? Does it handle the edge cases from your prompt? Flag any assumptions that do not match your codebase.",
                "Run the automated verification loop: `npx tsc --noEmit`, `npm run lint`, and `npm test`. If all pass, write one additional test targeting an edge case. If any fail, fix the AI output and re-run.",
              ],
              validationChecks: [
                "User names at least one high-value AI use case (e.g., scaffolding, boilerplate, refactoring) and one major limitation (e.g., hallucinated APIs, outdated patterns, missing project context).",
                "User describes a concrete verification workflow: automated checks (`tsc`, `lint`, `test`) followed by manual code review before committing.",
                "User explains why AI output requires human verification — specifically that AI lacks access to the project's actual architecture, dependencies, and conventions.",
              ],
              retention: [
                "AI speeds work; it does not remove accountability.",
                "Verification is mandatory, not optional.",
                "Better prompts come from better engineering thinking.",
              ],
              tools: [
                "AI coding assistant",
                "tests",
                "linters",
                "terminal",
                "editor diagnostics",
              ],
              notesPrompt:
                "Write your personal AI operating rules for software engineering work. Keep them strict enough to prevent lazy trust.",
              exercises: [
                {
                  id: "ai-rule",
                  title: "State the rule",
                  prompt:
                    "Complete this idea in your own words: AI output must always be...",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "verified",
                    "checked",
                    "tested",
                    "reviewed",
                  ],
                  successMessage:
                    "Correct. AI is a drafting and acceleration tool, not a substitute for validation.",
                  hint: "Think about the minimum professional standard before shipping AI-assisted work.",
                  assessmentType: "reasoning",
                },
                {
                  id: "ai-limitation",
                  title: "Know the limits",
                  prompt:
                    "Name one thing AI coding assistants commonly get wrong.",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "context",
                    "hallucinate",
                    "outdated",
                    "wrong",
                    "stale",
                    "assumptions",
                    "dependencies",
                    "version",
                  ],
                  successMessage:
                    "Correct. Awareness of limitations is what separates productive AI use from dangerous AI use.",
                  hint: "Think about what AI does not have access to when generating code.",
                  assessmentType: "reasoning",
                },
                {
                  id: "ai-hallucinated-api",
                  title: "Catch hallucinated APIs",
                  prompt:
                    "AI generates code using users.findFirst(). JavaScript arrays have find() but not findFirst(). How would you catch this error?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "tsc",
                    "typecheck",
                    "type check",
                    "compile",
                    "run",
                    "test",
                    "docs",
                    "documentation",
                    "MDN",
                    "review",
                  ],
                  successMessage:
                    "Correct. Running the TypeScript compiler (tsc --noEmit) or reading the docs would catch this immediately. Hallucinated methods compile-check is the fastest catch.",
                  hint: "Think about the automated verification step that would flag a non-existent method.",
                  assessmentType: "reasoning",
                },
              ],
              transferTask: {
                id: "transfer-ai-verification",
                title: "Transfer challenge: verify AI-generated code",
                prompt:
                  "An AI assistant generated a utility function for your project. Describe the verification steps you would take before committing it, including at least one automated check and one manual check.",
                placeholder: "Verification steps",
                validationMode: "includes",
                acceptedAnswers: [
                  "test",
                  "lint",
                  "review",
                  "read",
                  "run",
                  "edge",
                  "manual",
                ],
                successMessage:
                  "Transfer evidence accepted. You demonstrated a professional AI verification workflow.",
                hint: "Think about both automated checks (tests, linting) and manual steps (reading the code, checking assumptions).",
                assessmentType: "transfer",
              },
              competencies: [
                { track: "DeliveryWorkflow", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "goal-driven",
            },
          ],
        },

        {
          id: "course-workflow-practice",
          title: "Engineering Workflow Practice",
          focus:
            "Git workflows, testing, refactoring, code review, and task execution",
          outcome:
            "Learners execute engineering tasks from scoped issue to clean, tested, committed solution.",
          lessons: [
            {
              id: "lesson-git-workflow-advanced",
              title: "Git Workflows for Real Projects",
              summary:
                "Use branches, commits, diffs, and pull request thinking to manage change safely.",
              duration: "50 min",
              difficulty: "Core",
              objective:
                "Execute a complete Git workflow: create a branch, make targeted commits, review the diff, and prepare a pull request.",
              explanation: [
                "**Git** is not a backup tool — it is the primary system for managing, communicating, and reviewing change in professional software work. Every commit is a message to your future self and your teammates. A disciplined Git workflow makes your work **reviewable** (someone can understand what changed), **reversible** (you can undo mistakes cleanly), and **traceable** (you can find out when and why something changed).",
                'The workflow you will use on real projects follows this rhythm: `git checkout -b feature/description` creates a **branch** for your change (keeping `main` clean), you make small focused edits and commit each one with `git add` and `git commit -m "clear message"`, you review your own work with `git diff` before pushing, and finally `git push` sends your branch to the remote for a pull request.',
                "**Atomic commits** are the discipline that makes Git useful. Each commit should represent one logical change — not 'did a bunch of stuff' but 'add email validation to signup form'. The command sequence for one atomic commit:\n\n```bash\ngit add src/validation.ts\ngit commit -m \"add: email format validation before form submit\"\n```\n\nNotice: `git add` stages specific files (not `git add .` which grabs everything), and the commit message explains **intent**, not mechanics. A message like 'fix stuff' is useless six months later. A message like 'fix: prevent duplicate form submission on double-click' is documentation.",
                "Before pushing, always review what you are about to share. `git diff main` shows every change between your branch and main. `git log --oneline` shows your commit history. Read both. If a commit message does not make sense to a stranger, rewrite it with `git commit --amend`. The diff is your **pre-review** — catch problems here instead of in the pull request.",
              ],
              demonstration: [
                'Start a feature branch: `git checkout -b fix/login-validation`. Make a targeted edit to the validation file, then stage and commit it:\n\n```bash\ngit add src/login-validation.ts\ngit commit -m "fix: reject empty email before API call"\n```\n\nMake a second edit — updating the test — and commit it separately:\n\n```bash\ngit add src/login-validation.test.ts\ngit commit -m "test: add assertion for empty email rejection"\n```\n\nTwo commits, each with a single clear purpose. Compare this to one commit with the message \'fix login\' — the atomic version is reviewable, the single commit is not.',
                "Before pushing, review your work. Run `git diff main` to see every line you changed. Run `git log --oneline main..HEAD` to see your commits:\n\n```bash\ngit log --oneline main..HEAD\n# a3f2c1d test: add assertion for empty email rejection\n# 7b8e4f2 fix: reject empty email before API call\n```\n\nThis is what your reviewer will see. If the commits tell a clear story, the review goes faster. Push with `git push -u origin fix/login-validation` and open the pull request.",
                "In the pull request description, summarize: **what** changed, **why** it changed, and **how to verify**. Example: 'Empty email strings were reaching the API and causing a 500 error. Added a validation check before the API call. Run `npm test` to verify — the new test covers the empty email case.' This gives your reviewer everything they need to approve confidently.",
              ],
              exerciseSteps: [
                "Create a branch with `git checkout -b fix/descriptive-name` — choose a name that communicates the purpose of the change.",
                'Make two separate commits using `git add <specific-file>` and `git commit -m "clear message"`. Each commit should represent one logical change with a message that explains **why**, not just what.',
                "Run `git diff main` to review all changes, then run `git log --oneline main..HEAD` to see your commit history. Write a one-line summary of the overall change suitable for a pull request title.",
              ],
              validationChecks: [
                "User creates a branch with `git checkout -b` (or `git switch -c`) using a descriptive name like `fix/login-validation` or `feature/add-search`.",
                "User writes commit messages that explain **intent** — e.g., `fix: prevent duplicate submission` rather than `fix stuff` or `update file`.",
                "User runs `git diff` and `git log --oneline` to review their own changes and can summarize what the diff shows in one sentence.",
              ],
              retention: [
                "Branch early, commit often, push deliberately.",
                "A good commit message explains intent, not mechanics.",
                "The diff is your change review — read it before pushing.",
              ],
              tools: ["Git", "terminal", "Visual Studio Code"],
              notesPrompt:
                "Write your personal Git workflow checklist: what you check before committing and before pushing.",
              exercises: [
                {
                  id: "git-branch-naming",
                  title: "Branch naming",
                  prompt:
                    "Name the Git command that creates and switches to a new branch called fix/login-error.",
                  placeholder: "git ...",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "git checkout -b fix/login-error",
                    "git switch -c fix/login-error",
                  ],
                  successMessage:
                    "Correct. Descriptive branch names communicate intent before anyone reads a single commit.",
                  hint: "Use git checkout -b or git switch -c followed by the branch name.",
                  assessmentType: "action",
                },
                {
                  id: "commit-message-quality",
                  title: "Commit messages",
                  prompt:
                    "Which commit message is better: 'fix stuff' or 'fix: validate email before form submission'? Explain why.",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "validate",
                    "specific",
                    "why",
                    "explain",
                    "descriptive",
                  ],
                  successMessage:
                    "Correct. Commit messages are documentation — they should explain the intent of the change.",
                  hint: "Think about what a teammate would need to understand the change six months later.",
                  assessmentType: "reasoning",
                },
                {
                  id: "diff-before-push",
                  title: "Review before pushing",
                  prompt:
                    "What Git command shows the exact changes between your current branch and main before you push?",
                  placeholder: "git ...",
                  validationMode: "includes",
                  acceptedAnswers: ["git diff main", "git diff origin/main"],
                  successMessage:
                    "Correct. git diff main shows every change you are about to share. Review your own work before asking others to review it.",
                  hint: "You want to see the difference between your branch and the main branch.",
                  assessmentType: "action",
                },
              ],
              transferTask: {
                id: "transfer-git-ticket-flow",
                title: "Transfer challenge: issue to PR flow",
                prompt:
                  "Given a bug ticket, describe your Git flow from branch creation through final review check before opening a pull request.",
                placeholder: "Describe your flow",
                validationMode: "includes",
                acceptedAnswers: [
                  "branch",
                  "commit",
                  "diff",
                  "test",
                  "status",
                  "push",
                  "pull request",
                ],
                successMessage:
                  "Great. Your workflow demonstrates delivery discipline and review readiness.",
                hint: "Include branch strategy, commit quality, and at least one verification command before PR.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "atomic-commit-message",
                  title: "Write an atomic commit message",
                  description:
                    "Write a commit message for a change that adds email validation to a signup form. Follow the conventional format: type: description.",
                  starterCode: "# Write your commit message below\n",
                  language: "text",
                  hint: "Use a prefix like 'feat:', 'fix:', or 'add:' followed by a description of the intent — not just 'update file'.",
                  acceptedPatterns: ["feat:", "fix:", "add:", "email", "valid"],
                },
                {
                  id: "git-log-review",
                  title: "Review commit history",
                  description:
                    "Write the git command that shows a compact one-line log of commits on your current branch that are NOT on main.",
                  starterCode: "# Write the git command\n",
                  language: "text",
                  hint: "Use git log --oneline with a range like main..HEAD to show only your branch's commits.",
                  acceptedPatterns: ["git log", "--oneline", "main"],
                },
              ],
              competencies: [
                { track: "VersionControl", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "goal-driven",
            },
            {
              id: "lesson-automated-testing",
              title: "Write Tests That Prove Your Code Works",
              summary:
                "Learn to write unit and integration tests that verify real behavior — and make failing tests your first diagnostic tool.",
              duration: "55 min",
              difficulty: "Core",
              objective:
                "Write tests that assert meaningful behavior, run them in a CI-ready runner, and interpret failures to locate a bug without reading every line of code.",
              explanation: [
                "Tests serve three purposes in professional engineering: they **document expected behavior** (a test suite is a living specification), they **verify changes did not break anything** (regression safety net), and they **serve as the fastest diagnostic tool** when something breaks — a failing test points you directly to the broken contract without requiring a full code read.",
                "This lesson uses **Vitest** — a fast, TypeScript-native test runner that integrates with modern JavaScript projects. The core structure: `describe()` groups related tests, `it()` defines a single test case, and `expect()` makes an assertion about the result. A minimal test looks like:\n\n```typescript\nimport { describe, it, expect } from 'vitest';\n\ndescribe('add', () => {\n  it('returns the sum of two numbers', () => {\n    expect(add(2, 3)).toBe(5);\n  });\n});\n```",
                "The most common assertions: `expect(value).toBe(expected)` for primitive equality, `expect(value).toEqual(expected)` for deep object equality, `expect(fn).toThrow()` for error cases, and `expect(value).toBeTruthy()` / `toBeFalsy()` for boolean checks. Run the entire suite with `npm test` or `npx vitest`. When a test fails, Vitest prints the expected value, the received value, and the exact line — this is the diagnostic power of tests.",
                "Every function you test should have at minimum three cases: the **happy path** (normal expected input), a **boundary/edge case** (empty string, zero, maximum value), and a **failure case** (null, undefined, invalid input). This pattern catches the bugs that production users will find — because they will send inputs you did not expect.",
                "The **test pyramid** describes the optimal distribution of test types. **Unit tests** form the base — they are fast (milliseconds), isolated, and you should have many of them. **Integration tests** sit in the middle — they verify that components work together (e.g., an API handler with a real database) and run slower. **End-to-end (e2e) tests** are at the top — they simulate real user flows through the full system and are the slowest and most brittle. A healthy test suite has many unit tests, fewer integration tests, and a small number of targeted e2e tests. **Mocking** replaces external dependencies (APIs, databases, file systems) with controlled fakes so unit tests stay fast and deterministic — but never mock the system under test, only its collaborators. **Test flakiness** (tests that sometimes pass and sometimes fail with no code change) is a serious engineering problem because it erodes trust in the entire test suite. Flaky tests usually stem from shared state, timing dependencies, or non-deterministic data — fix them immediately rather than ignoring or retrying.",
              ],
              demonstration: [
                "Save tests in a file following the naming convention `<module>.test.ts` alongside the source file. Here is a complete test file for a `formatCurrency` function:\n\n```typescript\n// formatCurrency.test.ts\nimport { describe, it, expect } from 'vitest';\nimport { formatCurrency } from './formatCurrency';\n\ndescribe('formatCurrency', () => {\n  it('formats a normal amount', () => {\n    expect(formatCurrency(1050)).toBe('$10.50');\n  });\n  it('handles zero', () => {\n    expect(formatCurrency(0)).toBe('$0.00');\n  });\n  it('handles negative amounts', () => {\n    expect(formatCurrency(-500)).toBe('-$5.00');\n  });\n});\n```\n\nRun `npx vitest run` and the output shows each test with a pass indicator:\n\n```bash\n$ npx vitest run\n ✓ formatCurrency.test.ts (3 tests) 2ms\n   ✓ formatCurrency > formats a normal amount\n   ✓ formatCurrency > handles zero\n   ✓ formatCurrency > handles negative amounts\n\n Test Files  1 passed (1)\n      Tests  3 passed (3)\n   Duration  145ms\n```\n\nEach test documents one behavior. The file name tells you what is covered at a glance.",
                'Now break the function deliberately — change the division from 100 to 10. Run `npx vitest run` and the failure output pinpoints exactly what broke:\n\n```bash\n$ npx vitest run\n ✓ formatCurrency > handles zero\n ✓ formatCurrency > handles negative amounts\n ✗ formatCurrency > formats a normal amount\n\n⎯⎯⎯⎯ Failed Tests 1 ⎯⎯⎯⎯\n\n FAIL  formatCurrency.test.ts > formatCurrency > formats a normal amount\nAssertionError: expected "$105.00" to be "$10.50"\n\n  Expected: "$10.50"\n  Received: "$105.00"\n\n ❯ formatCurrency.test.ts:6:35\n\n Test Files  1 failed (1)\n      Tests  1 failed | 2 passed (3)\n   Duration  152ms\n```\n\nYou see the exact test name, the expected vs. received values, and the file and line number where the assertion failed. No need to read the entire function — the test output tells you what broke and where. This is why tests are your fastest debugging tool.',
                "Run `npx vitest run --coverage` to generate a coverage report showing which lines your tests exercise:\n\n```bash\n$ npx vitest run --coverage\n ✓ formatCurrency.test.ts (3 tests) 2ms\n\n--------------------|---------|----------|---------|---------\nFile                 | % Stmts | % Branch | % Funcs | % Lines\n--------------------|---------|----------|---------|---------\nformatCurrency.ts    |     100 |      100 |     100 |     100\n--------------------|---------|----------|---------|---------\nAll files            |     100 |      100 |     100 |     100\n--------------------|---------|----------|---------|---------\n```\n\n100% coverage on this small function means every line and branch was executed. But **coverage shows gaps, not quality** — a test that calls a function without asserting on the return value achieves high coverage with zero diagnostic value. Use coverage to find untested code paths, then write meaningful assertions for each one.",
              ],
              exerciseSteps: [
                "Write a `describe` block with three `it` cases for a sample function: one happy-path test using `expect().toBe()`, one edge case (e.g., empty input or zero), and one failure case (e.g., invalid input). Use the pattern from the demonstration.",
                "Run the tests with `npx vitest` (or `npm test`) and observe the output format — note how passing tests show a checkmark and failing tests show expected vs. received values.",
                "Break the function intentionally (change one value or operator) and run `npx vitest` again. Identify which assertion fails and read the expected/received output to locate the problem without reading the function source.",
              ],
              validationChecks: [
                "Tests include at least three `it()` cases: one happy path, one null/empty/zero case, and one edge case or invalid input case.",
                "Learner can explain what each `expect().toBe()` or `expect().toEqual()` assertion verifies — not just that it passes, but what behavior it documents.",
                "Learner reads a failing test output (expected vs. received) and locates the source of the failure without reading every line of the function under test.",
              ],
              retention: [
                "Test the contract, not the implementation.",
                "A failing test is information — it tells you exactly what broke.",
                "Coverage shows gaps; it does not guarantee quality.",
              ],
              tools: ["Vitest", "Visual Studio Code", "terminal"],
              notesPrompt:
                "Write a testing checklist: what cases you always write first, and what a 'well-tested function' looks like to you.",
              exercises: [
                {
                  id: "test-command",
                  title: "Run tests",
                  prompt:
                    "What npm script command runs the test suite as configured in package.json?",
                  placeholder: "npm run ...",
                  validationMode: "includes",
                  acceptedAnswers: ["npm run test", "npm test", "npx vitest"],
                  successMessage:
                    "Correct. Running tests is the first thing you do when you pull new code or land a change.",
                  hint: "Look at the scripts section of package.json.",
                  assessmentType: "action",
                },
                {
                  id: "test-assertion",
                  title: "Assertion syntax",
                  prompt:
                    "In Vitest, what function checks that a value equals an expected result?",
                  placeholder: "expect(...).to...",
                  validationMode: "includes",
                  acceptedAnswers: ["expect", "toBe", "toEqual"],
                  successMessage:
                    "Correct. expect().toBe() and expect().toEqual() are the most common assertions.",
                  hint: "It combines two chained calls — one to set up the value and one to declare the expected result.",
                  assessmentType: "action",
                },
                {
                  id: "test-boundary",
                  title: "Edge case thinking",
                  prompt:
                    "Besides the happy path, name two input conditions every function test should cover.",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "null",
                    "empty",
                    "undefined",
                    "invalid",
                    "edge",
                    "boundary",
                    "zero",
                  ],
                  successMessage:
                    "Correct. Edge cases and null/empty inputs are where production bugs most commonly hide.",
                  hint: "Think about inputs that reach the function from outside normal usage.",
                  assessmentType: "reasoning",
                },
              ],
              transferTask: {
                id: "transfer-test-design",
                title: "Transfer challenge: design a test suite",
                prompt:
                  "Given a function that parses a date string and returns a formatted output, describe four test cases you would write and explain what each one verifies.",
                placeholder: "Case 1: ..., Case 2: ...",
                validationMode: "includes",
                acceptedAnswers: [
                  "valid",
                  "invalid",
                  "empty",
                  "null",
                  "edge",
                  "format",
                  "boundary",
                  "undefined",
                ],
                successMessage:
                  "Transfer evidence accepted. Your test suite covers the cases that matter before the happy path is even run.",
                hint: "Think in terms of: does the happy path work? What happens with null or empty input? What happens with a surprising format?",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "write-test-assertion",
                  title: "Write a test for isEven",
                  description:
                    "Write a Vitest test that verifies the isEven function returns true for 4 and false for 7. Use describe, it, and expect.",
                  starterCode:
                    "import { describe, it, expect } from 'vitest';\n\nfunction isEven(n: number): boolean {\n  return n % 2 === 0;\n}\n\n// Write your tests below",
                  language: "typescript",
                  hint: "Use describe('isEven', () => { it('returns true for even', () => { expect(isEven(4)).toBe(true) }) }).",
                  acceptedPatterns: ["describe", "it(", "expect", "toBe"],
                },
                {
                  id: "test-edge-case",
                  title: "Add an edge-case test",
                  description:
                    "The function below trims and lowercases an email. Add a test case that checks what happens when the input is an empty string.",
                  starterCode:
                    "import { describe, it, expect } from 'vitest';\n\nfunction normalizeEmail(email: string): string {\n  return email.trim().toLowerCase();\n}\n\ndescribe('normalizeEmail', () => {\n  it('lowercases and trims', () => {\n    expect(normalizeEmail('  Hello@Test.COM  ')).toBe('hello@test.com');\n  });\n\n  // Add your edge-case test below\n});",
                  language: "typescript",
                  hint: "Call normalizeEmail('') and assert on its result. What does trimming and lowering an empty string produce?",
                  acceptedPatterns: ["normalizeEmail('')", "toBe('')", "it("],
                },
              ],
              competencies: [{ track: "Testing", targetLevel: "Functional" }],
              scaffoldingLevel: "goal-driven",
            },
            {
              id: "lesson-ci-cd",
              title: "Automate Quality with GitHub Actions",
              summary:
                "Build a CI pipeline that runs lint, tests, and build checks automatically on every pull request.",
              duration: "50 min",
              difficulty: "Core",
              objective:
                "Write a GitHub Actions workflow that runs quality gates and understand how CI prevents regressions from reaching the main branch.",
              explanation: [
                "**Continuous Integration (CI)** means every push to the repository is automatically checked by the same quality gates your team trusts — linting, type checking, tests, and builds. It removes the 'works on my machine' variability because CI runs in a clean, reproducible environment every time. When CI catches a regression, the broken code never reaches `main`.",
                "**GitHub Actions** is the CI system built into GitHub. You define workflows in YAML files inside `.github/workflows/`. A workflow has **triggers** (when it runs), **jobs** (what it does), and **steps** (individual commands within a job). The minimum viable CI workflow triggers on `push` and `pull_request`, checks out the code, installs dependencies, and runs your quality gates.",
                "Here is the structure of a basic CI workflow file (`.github/workflows/ci.yml`):\n\n```yaml\nname: CI\non:\n  push:\n    branches: [main]\n  pull_request:\n    branches: [main]\njobs:\n  quality:\n    runs-on: ubuntu-latest\n    steps:\n      - uses: actions/checkout@v4\n      - uses: actions/setup-node@v4\n        with:\n          node-version: 20\n      - run: npm ci\n      - run: npm run lint\n      - run: npm test\n      - run: npm run build\n```\n\nEach `run:` step executes a command. If any step fails, the job fails and the PR is blocked.",
                "The enforcement layer is **required status checks** in GitHub branch protection. When you configure the `quality` job as a required check for the `main` branch, GitHub will not allow merging a PR with a failing CI run. This means broken code **cannot** reach main — CI is not a suggestion, it is a gate.",
                "Three advanced CI concepts distinguish production-grade pipelines. **Pipeline as code** means your CI configuration (the YAML file) is version-controlled alongside your application code — changes to the build process go through the same review and history as feature code, so you can always trace when and why a pipeline step was added or changed. **Caching strategies** dramatically speed up CI runs: caching `node_modules` between runs avoids re-downloading every dependency, and Docker layer caching avoids rebuilding unchanged image layers. GitHub Actions provides `actions/cache@v4` for this purpose. **Branch protection rules** go beyond required status checks — you can require a minimum number of code review approvals, enforce that branches are up-to-date with `main` before merging, and restrict who can push directly to protected branches. Together, these features make CI the automated enforcer of team quality standards.",
              ],
              demonstration: [
                "Create the workflow file at `.github/workflows/ci.yml`. Start with the triggers — run on both `push` and `pull_request` events targeting `main`. Add a single job called `quality` that runs on `ubuntu-latest`. The steps: check out code, set up Node.js, install dependencies with `npm ci`, then run each quality gate:\n\n```bash\n# These are the steps CI will execute in order:\nnpm ci           # Clean install dependencies\nnpm run lint     # Check code style and correctness\nnpm test         # Run the test suite\nnpm run build    # Verify the project builds cleanly\n```\n\nIf any step exits with a non-zero code, the entire job fails.",
                'When CI passes, the GitHub Actions log shows each step completing successfully:\n\n```\n✓ Set up job                    2s\n✓ Run actions/checkout@v4       1s\n✓ Run actions/setup-node@v4     3s\n✓ Run npm ci                   12s\n✓ Run npm run lint              4s\n✓ Run npm test                  6s\n✓ Run npm run build            18s\n✓ Complete job                  1s\n```\n\nWhen a test fails, the failing step shows a red X and the log reveals the exact error — the same output you would see locally:\n\n```\n✓ Run npm run lint              4s\n✗ Run npm test                  3s\n  FAIL  src/utils.test.ts\n  ✗ formatDate > returns ISO format\n    Expected: "2026-04-05"\n    Received: "04/05/2026"\n  Tests: 1 failed, 14 passed\n\n  Error: Process completed with exit code 1.\n```\n\nThe PR page shows a red checks-failed badge and the merge button is blocked if required status checks are enabled. The developer fixes the issue, pushes a new commit, and CI runs again automatically.',
                "This creates a safety loop: **write code → push → CI checks → fix if needed → merge when green.** The key insight is that CI runs the same commands you run locally (`npm run lint`, `npm test`, `npm run build`) — the difference is that CI runs them consistently, on every push, in a clean environment, without anyone having to remember.",
              ],
              exerciseSteps: [
                "Create the directory `.github/workflows/` and a file called `ci.yml` with triggers for `push` and `pull_request` events on the `main` branch.",
                "Add a `quality` job that runs on `ubuntu-latest` with steps: `actions/checkout@v4`, `actions/setup-node@v4`, `npm ci`, `npm run lint`, `npm test`, and `npm run build`.",
                "Push the workflow file and open the Actions tab on GitHub to inspect the output. Verify each step ran in order and check what happens when a step succeeds vs. when it fails.",
              ],
              validationChecks: [
                "Workflow YAML includes both `push` and `pull_request` triggers under the `on:` key.",
                "The job includes `npm run lint`, `npm test`, and `npm run build` as separate `run:` steps — each quality gate is an independent step that can fail individually.",
                "Learner can navigate the GitHub Actions log, locate a failing step by its red X indicator, and read the error output to identify the problem.",
              ],
              retention: [
                "CI is peer review for the machine — it does not get tired or forget.",
                "A failing CI check is information, not a punishment.",
                "Required status checks prevent merging broken code.",
              ],
              tools: ["GitHub Actions", "Git", "GitHub", "terminal"],
              notesPrompt:
                "Write the YAML skeleton for a CI workflow from memory. Note which parts you always need to look up.",
              exercises: [
                {
                  id: "ci-trigger",
                  title: "Workflow trigger",
                  prompt:
                    "Name two GitHub Actions event triggers that should be present in a standard CI workflow.",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: ["push", "pull_request"],
                  successMessage:
                    "Correct. Running CI on both push and pull_request catches errors both during development and at review time.",
                  hint: "Think about the two moments when you want automated checks to run in a typical team workflow.",
                  assessmentType: "action",
                },
                {
                  id: "ci-required-check",
                  title: "Required status checks",
                  prompt:
                    "What GitHub branch protection feature prevents merging if the CI workflow fails?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "required status",
                    "required check",
                    "branch protection",
                    "status check",
                  ],
                  successMessage:
                    "Correct. Required status checks are the enforcement layer that makes CI meaningful.",
                  hint: "Find it in the branch protection rules for the main branch.",
                  assessmentType: "action",
                },
                {
                  id: "ci-failure-debug",
                  title: "Debug a CI failure",
                  prompt:
                    "A CI job fails on npm test but passes on npm run lint. Where in GitHub Actions do you look to read the exact test failure?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "step",
                    "log",
                    "output",
                    "click",
                    "expand",
                    "details",
                    "npm test",
                  ],
                  successMessage:
                    "Correct. Click into the failed job, expand the npm test step, and read the output \u2014 it shows the same error you would see locally.",
                  hint: "Each step in a GitHub Actions job produces its own output log that you can expand.",
                  assessmentType: "reasoning",
                },
              ],
              transferTask: {
                id: "transfer-ci-workflow",
                title: "Transfer challenge: design a CI pipeline",
                prompt:
                  "A teammate asks you to add CI to a new repo. Describe the workflow file: what triggers it, what steps it runs, and what happens when a step fails.",
                placeholder: "Workflow design and failure handling",
                validationMode: "includes",
                acceptedAnswers: [
                  "push",
                  "pull_request",
                  "test",
                  "lint",
                  "build",
                  "fail",
                  "block",
                  "status",
                ],
                successMessage:
                  "Transfer evidence accepted. You demonstrated the ability to design a CI pipeline from scratch.",
                hint: "Cover triggers, job steps, and what enforcement prevents broken code from merging.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "ci-workflow-syntax",
                  title: "GitHub Actions workflow syntax",
                  description:
                    "Write a basic GitHub Actions workflow YAML that runs tests on push to main branch.",
                  starterCode:
                    "name: CI\non:\n  push:\n    branches: [main]\njobs:\n  test:\n    runs-on: ubuntu-latest\n    steps:\n    - uses: actions/checkout@v4\n    - name: Run tests\n      run: |\n",
                  language: "yaml",
                  hint: "Include checkout step, setup Node.js, install dependencies, and run tests.",
                  acceptedPatterns: [
                    "uses: actions/checkout",
                    "uses: actions/setup-node",
                    "npm test",
                    "run: npm test",
                  ],
                },
                {
                  id: "ci-status-check",
                  title: "Branch protection status check",
                  description:
                    "Write the GitHub branch protection rule that requires the 'test' job to pass before merging.",
                  starterCode: "# Branch protection settings\n",
                  language: "text",
                  hint: "Specify the required status check name that matches the job name in the workflow.",
                  acceptedPatterns: ["test", "status check", "required"],
                },
              ],
              competencies: [
                { track: "DeliveryWorkflow", targetLevel: "Functional" },
                { track: "Testing", targetLevel: "Assisted" },
              ],
              scaffoldingLevel: "goal-driven",
            },
            {
              id: "lesson-refactoring",
              title: "Refactor Without Breaking Things",
              summary:
                "Improve code structure without changing behavior — and verify you succeeded.",
              duration: "50 min",
              difficulty: "Core",
              objective:
                "Identify duplicated logic, extract it into reusable functions, and verify behavior is preserved with tests.",
              explanation: [
                "**Refactoring** means improving the internal structure of code without changing its external behavior. The function does exactly the same thing after you refactor — the difference is that the code is easier to read, maintain, and extend. Refactoring is how codebases stay healthy as they grow instead of becoming unmaintainable.",
                "The discipline that makes refactoring safe is a three-step loop: **run tests before** (confirm they pass and document current behavior), **make the structural change** (extract a function, rename a variable, remove duplication), then **run tests after** (confirm they still pass). If the tests pass before and after, you have proof that behavior is preserved. Without tests, refactoring is guessing.",
                "The most common refactoring move is **extract function** — you find duplicated logic (the same 5–10 lines copied into multiple places), pull it into a single named function, and replace the copies with calls to that function. For example:\n\n```typescript\n// Before: duplicated validation in two places\nif (!email.includes('@') || !email.includes('.')) { throw new Error('Invalid'); }\n\n// After: extracted into a shared function\nfunction isValidEmail(email: string): boolean {\n  return email.includes('@') && email.includes('.');\n}\n```\n\nNow you have one source of truth for email validation. Fix a bug once, fixed everywhere.",
                "The **guard clause** pattern replaces deeply nested if/else chains with early returns. Instead of burying your logic inside multiple levels of indentation, check each invalid condition at the top and return immediately. The happy path runs at the top indentation level, and each guard clause handles one edge case. This eliminates nesting, reduces cognitive load, and makes the logical flow obvious at a glance. Other high-value moves: **rename** (a variable called `d` becomes `daysUntilExpiry` — the cheapest documentation you can write) and **inline** (remove an unnecessary abstraction that adds complexity without value).",
                "Learn to recognize **code smells** — patterns that signal structural problems even when the code technically works. The most common: **long functions** (more than 20–30 lines usually means multiple responsibilities mixed together), **deep nesting** (more than 2–3 levels of indentation indicates conditionals that should be simplified with guard clauses), **magic numbers** (unexplained numeric literals like `0.2` or `86400` that should be named constants), and **duplicated logic** (the same 5+ lines appearing in multiple functions — extract into a shared function). Code smells are not bugs. They are maintenance risks that grow worse over time.",
                "Know **when NOT to refactor**. Do not refactor code you do not have tests for — without a safety net, you are guessing. Do not refactor during an active incident — stabilize first, clean up later. Consider a full **rewrite** instead of refactoring when: the code is so tangled that every change creates new bugs, the underlying assumptions are wrong (not just the structure), or the technology is deprecated and the team is migrating. The decision criteria: if you can improve the code in small, tested steps, refactor. If the code resists safe incremental change, plan a rewrite with a clear scope and deadline.",
              ],
              demonstration: [
                "Here are three functions with identical validation logic copy-pasted into each:\n\n```typescript\nfunction registerUser(email: string) {\n  if (!email.includes('@') || !email.includes('.')) throw new Error('Invalid email');\n  // ... register logic\n}\nfunction updateEmail(email: string) {\n  if (!email.includes('@') || !email.includes('.')) throw new Error('Invalid email');\n  // ... update logic\n}\nfunction inviteUser(email: string) {\n  if (!email.includes('@') || !email.includes('.')) throw new Error('Invalid email');\n  // ... invite logic\n}\n```\n\nFirst, run `npm test` — all tests pass. This is your behavioral baseline.",
                "Extract the shared logic into a function:\n\n```typescript\nfunction isValidEmail(email: string): boolean {\n  return email.includes('@') && email.includes('.');\n}\n```\n\nUpdate all three call sites to use `if (!isValidEmail(email)) throw new Error('Invalid email');`. Run `npm test` again — all tests still pass. The behavior is identical, but now there is **one source of truth** for email validation. A bug fix or improvement happens in one place.",
                "A powerful refactoring move is replacing deeply nested conditionals with **guard clauses**. Here is the before/after transformation:\n\n```typescript\n// BEFORE: logic buried inside nested checks\nfunction processOrder(order) {\n  if (order) {\n    if (order.items) {\n      if (order.items.length > 0) {\n        if (order.status === 'pending') {\n          return calculateTotal(order.items);\n        }\n      }\n    }\n  }\n  return 0;\n}\n\n// AFTER: guard clauses — exit early, logic at top level\nfunction processOrder(order) {\n  if (!order) return 0;\n  if (!order.items || order.items.length === 0) return 0;\n  if (order.status !== 'pending') return 0;\n\n  return calculateTotal(order.items);\n}\n```\n\nBoth versions produce identical output. The guard-clause version is easier to read because each condition is handled and dismissed immediately — no mental stack of nested `if` blocks to track. Run `npm test` after the transformation to confirm equivalence.",
                "Replace **magic numbers** with named constants. Magic numbers are unexplained numeric literals that make code fragile and hard to understand:\n\n```typescript\n// BEFORE: magic numbers — what do 0.2 and 50 mean?\nfunction calculateShipping(subtotal: number): number {\n  if (subtotal > 50) return 0;\n  return subtotal * 0.2;\n}\n\n// AFTER: named constants — the code explains itself\nconst FREE_SHIPPING_THRESHOLD = 50;\nconst SHIPPING_RATE = 0.2;\n\nfunction calculateShipping(subtotal: number): number {\n  if (subtotal > FREE_SHIPPING_THRESHOLD) return 0;\n  return subtotal * SHIPPING_RATE;\n}\n```\n\nThe function works identically, but now a future developer can understand the business rules without guessing. Named constants also create a single source of truth — when the shipping rate changes, you update one line instead of hunting for every `0.2` in the codebase. Run `npm test` to confirm the refactored version passes.",
              ],
              exerciseSteps: [
                "Read the practice file and identify code that appears in more than one function. Highlight the duplicated lines and note how many times they appear.",
                "Extract the duplicated logic into a single, clearly named function (e.g., `isValidEmail`, `formatAmount`). Replace every occurrence of the duplicated code with a call to the new function.",
                "Run `npm test` (or `npx vitest`) before and after the refactoring. Confirm that all tests pass both times — if they do, the behavior is preserved and the refactoring is safe.",
              ],
              validationChecks: [
                "User correctly identifies all instances of duplicated logic across multiple functions in the practice file.",
                "User extracts the shared logic into a function with a **descriptive name** that communicates what the function does (not `helper` or `util`).",
                "User runs `npm test` (or `npx vitest`) before and after the refactoring and confirms that all tests pass — behavior is preserved.",
              ],
              retention: [
                "Refactor in small steps — one change at a time.",
                "Tests are the safety net that make refactoring possible.",
                "A good name is the cheapest documentation you can write.",
              ],
              tools: ["Visual Studio Code", "terminal", "Vitest"],
              notesPrompt:
                "List three refactoring moves you know (e.g., extract function, rename variable) and when you would use each.",
              exercises: [
                {
                  id: "refactor-safety",
                  title: "Safety first",
                  prompt:
                    "What must be in place before refactoring to ensure you don't break behavior?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: ["tests", "test suite", "unit tests"],
                  successMessage:
                    "Correct. Tests are the safety net that make refactoring possible without fear.",
                  hint: "Think about what would catch a regression automatically.",
                  assessmentType: "reasoning",
                },
                {
                  id: "refactor-extract",
                  title: "Extract function",
                  prompt:
                    "You see the same five lines of code copied into three different functions. What refactoring move should you apply?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "extract",
                    "shared function",
                    "reusable function",
                    "helper",
                    "common function",
                  ],
                  successMessage:
                    "Correct. Extract the shared logic into a single named function and call it from all three places.",
                  hint: "The goal is to have one source of truth for that logic instead of three copies.",
                  assessmentType: "action",
                },
                {
                  id: "refactor-rename",
                  title: "Rename for clarity",
                  prompt:
                    "A variable named `d` stores the number of days until expiry. What refactoring move improves this code without changing behavior?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "rename",
                    "daysUntilExpiry",
                    "descriptive",
                    "name",
                    "meaningful",
                  ],
                  successMessage:
                    "Correct. Renaming d to daysUntilExpiry is the cheapest documentation you can write \u2014 the code explains itself.",
                  hint: "The variable works fine but its name does not communicate its purpose.",
                  assessmentType: "reasoning",
                },
              ],
              transferTask: {
                id: "transfer-refactoring",
                title: "Transfer challenge: plan a refactor",
                prompt:
                  "You find three functions that each build an HTML string by concatenating hardcoded tags. Describe how you would refactor them: what you extract, how you name it, and how you verify behavior is preserved.",
                placeholder: "Refactoring plan and verification",
                validationMode: "includes",
                acceptedAnswers: [
                  "extract",
                  "function",
                  "test",
                  "verify",
                  "shared",
                  "reuse",
                  "name",
                ],
                successMessage:
                  "Transfer evidence accepted. You demonstrated systematic refactoring thinking.",
                hint: "Name the shared function, explain the extraction, and describe the verification step.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "extract-validator",
                  title: "Extract shared validation",
                  description:
                    "The two functions below both validate email format with identical logic. Extract the validation into a shared isValidEmail function that both can call.",
                  starterCode:
                    "function registerUser(email, password) {\n  if (!email.includes('@') || !email.includes('.')) {\n    throw new Error('Invalid email');\n  }\n  // register logic...\n}\n\nfunction updateEmail(userId, email) {\n  if (!email.includes('@') || !email.includes('.')) {\n    throw new Error('Invalid email');\n  }\n  // update logic...\n}",
                  language: "javascript",
                  hint: "Create a function called isValidEmail(email) that returns a boolean, then call it in both places.",
                  acceptedPatterns: [
                    "isValidEmail",
                    "function isValidEmail",
                    "includes('@')",
                  ],
                },
                {
                  id: "rename-variable",
                  title: "Rename for clarity",
                  description:
                    "The code below uses single-letter variable names that make it hard to understand. Rename the variables to be descriptive without changing the behavior.",
                  starterCode:
                    "function calc(p: number, q: number): number {\n  const r = p * q;\n  const t = r * 0.2;\n  return r - t;\n}",
                  language: "typescript",
                  hint: "What do p, q, r, and t actually represent? Give them names that explain their purpose.",
                  acceptedPatterns: [
                    "price",
                    "quantity",
                    "total",
                    "discount",
                    "subtotal",
                  ],
                },
              ],
              competencies: [
                { track: "CodeReading", targetLevel: "Functional" },
                { track: "Debugging", targetLevel: "Assisted" },
              ],
              scaffoldingLevel: "goal-driven",
            },
            {
              id: "lesson-technical-documentation",
              title: "Write Documentation That Works Without You",
              summary:
                "Write READMEs, inline comments, and change descriptions that enable a stranger to understand and run your project.",
              duration: "45 min",
              difficulty: "Core",
              objective:
                "Write a project README with setup instructions, explain a function with inline comments, and describe a pull request clearly enough that a reviewer can understand the change without asking questions.",
              explanation: [
                "Documentation is not extra work after the real work is done — it **is** part of the deliverable. A project without documentation is a project that only works while you are in the room. The moment you leave, hand it off, or come back six months later, undocumented code becomes a puzzle that takes hours to re-learn.",
                "There are three levels of documentation, each serving a different audience at a different time. **Project-level** documentation is the README — it tells a stranger what the project does, how to set it up, how to run it, and how to test it. **Code-level** documentation is comments and naming — they help the next developer (often future-you) understand *why* a decision was made, not *what* the code does (the code already says that). **Change-level** documentation is commit messages and PR descriptions — they help reviewers and future investigators understand what changed and why.",
                "A minimum viable README has four sections: **Purpose** (what the project does in 1–2 sentences), **Setup** (how to install dependencies and configure the environment), **Usage** (how to run the application), and **Testing** (how to run the test suite). Example:\n\n```markdown\n# Task Manager API\nA REST API for managing tasks with CRUD operations.\n\n## Setup\nnpm install\ncp .env.example .env\n\n## Usage\nnpm run dev    # starts on http://localhost:3000\n\n## Testing\nnpm test\n```\n\nThis takes five minutes to write and saves hours for every person who encounters the project.",
                "For code comments, the rule is: **comment why, not what.** A comment like `// increment i` restates the code and adds nothing. A comment like `// retry up to 3 times — the external API has intermittent timeouts` explains a decision the code cannot express on its own. For PR descriptions, include **what** changed, **why** it changed, and **how to verify** the change works. A reviewer who reads your PR description should be able to approve without asking clarifying questions.",
              ],
              demonstration: [
                "Compare two READMEs for the same project. The weak one:\n\n```markdown\n# My App\nA task app.\n```\n\nThe strong one:\n\n```markdown\n# Task Manager API\nA REST API for managing tasks with CRUD operations and SQLite persistence.\n\n## Setup\nnpm install\ncp .env.example .env\n\n## Usage\nnpm run dev    # starts on http://localhost:3000\n\n## Testing\nnpm test       # runs Vitest suite\n```\n\nThe weak README requires someone to explore the codebase to figure out how to run it. The strong README gets a new developer from clone to running in under a minute.",
                "Now compare two versions of the same function. Without comments:\n\n```typescript\nfunction retry(fn: () => Promise<any>, n: number) {\n  return fn().catch(() => n > 0 ? retry(fn, n - 1) : Promise.reject());\n}\n```\n\nWith a comment explaining *why*:\n\n```typescript\n// External payment API has intermittent 503s — retry up to 3 times before failing\nfunction retry(fn: () => Promise<any>, n: number) {\n  return fn().catch(() => n > 0 ? retry(fn, n - 1) : Promise.reject());\n}\n```\n\nThe comment does not describe the recursion (the code does that). It explains **why the retry exists** — context that would otherwise require reading the commit history or asking the original author.",
                "Finally, a good vs. bad PR description. Bad: `Updated stuff.` Good: `Fix: empty task titles now return 400 instead of creating a blank task. Added validation in createTask handler. Run npm test — new test covers the empty-title case.` The good version gives the reviewer everything they need: what changed, why, and how to verify.",
                "A production-quality README for a larger project follows this six-section template. Copy this structure and fill it in for every project:\n\n```markdown\n# Project Name\nOne-sentence description of what the project does and who it is for.\n\n## Prerequisites\n- Node.js 20+\n- Docker (for database)\n\n## Setup\ngit clone <repo-url>\ncd project-name\nnpm install\ncp .env.example .env    # fill in API keys\nnpm run db:migrate      # set up the database\n\n## Usage\nnpm run dev             # starts on http://localhost:3000\nnpm run build           # production build\nnpm start               # run the production build\n\n## Testing\nnpm test                # run the full test suite\nnpm run test:coverage   # run with coverage report\n\n## Project Structure\nsrc/\n  api/          # route handlers and middleware\n  models/       # data models and database queries\n  utils/        # shared helper functions\n  __tests__/    # test files mirror src/ structure\n\n## Contributing\n1. Create a feature branch from main\n2. Make changes with tests\n3. Run npm run lint && npm test\n4. Open a pull request with what/why/how-to-verify\n```\n\nEvery section answers a specific question a new contributor will ask. The goal: zero questions between cloning and contributing.",
              ],
              exerciseSteps: [
                "Write a README for a sample project with four sections: **Purpose** (what the project does), **Setup** (`npm install` and any environment configuration), **Usage** (how to start the application), and **Testing** (`npm test` or equivalent command).",
                "Add a one-line comment above each exported function in a sample file explaining **why** the function exists — not what it does. Follow the pattern: `// <context that the code cannot express on its own>`.",
                "Write a pull request description for a hypothetical change using the format: **What** changed (one sentence), **Why** it changed (the problem it solves), and **How to verify** (specific commands or steps a reviewer can follow).",
              ],
              validationChecks: [
                "README includes at least four sections: purpose, setup (with exact commands), usage (with run command), and testing (with `npm test` or equivalent).",
                "Comments explain **why** a decision was made — not restating what the code does. Each comment adds context that cannot be inferred from reading the code alone.",
                "PR description follows the **what/why/how to verify** structure and includes at least one specific verification command (e.g., `npm test`, `curl localhost:3000/api/tasks`).",
              ],
              retention: [
                "A README is the front door to your project. If it is locked, nobody enters.",
                "Comment why, not what. The code already says what.",
                "A PR description is a gift to your reviewer. Make it easy to say yes.",
              ],
              tools: ["Visual Studio Code", "Git", "Markdown"],
              notesPrompt:
                "Write a README template you can reuse for every project. Include the sections you consider non-negotiable.",
              exercises: [
                {
                  id: "readme-sections",
                  title: "README essentials",
                  prompt:
                    "List four sections every project README should include to be useful to a new contributor.",
                  placeholder: "Section names",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "setup",
                    "install",
                    "usage",
                    "purpose",
                    "what",
                    "test",
                    "how to run",
                  ],
                  successMessage:
                    "Correct. Purpose, setup, usage, and testing are the minimum viable README.",
                  hint: "Think about what a stranger needs to answer before they can use or contribute to your project.",
                  assessmentType: "reasoning",
                },
                {
                  id: "comment-quality",
                  title: "Good vs bad comments",
                  prompt:
                    "Which is a better comment: '// increment i' or '// retry up to 3 times before failing'? Explain why.",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "why",
                    "intent",
                    "retry",
                    "purpose",
                    "reason",
                  ],
                  successMessage:
                    "Correct. Comments should explain intent and context the code cannot express on its own.",
                  hint: "One restates the code. The other explains a decision. Which helps more?",
                  assessmentType: "reasoning",
                },
                {
                  id: "pr-description",
                  title: "PR description quality",
                  prompt:
                    "Name three things a good pull request description should include.",
                  placeholder: "Short list",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "what",
                    "why",
                    "how",
                    "verify",
                    "test",
                    "change",
                    "context",
                  ],
                  successMessage:
                    "Correct. What changed, why, and how to verify it are the minimum for a reviewable PR.",
                  hint: "Put yourself in the reviewer's seat: what do they need before they can approve?",
                  assessmentType: "reasoning",
                },
              ],
              transferTask: {
                id: "transfer-documentation-audit",
                title: "Transfer challenge: audit and improve documentation",
                prompt:
                  "You join a new team and find a project with no README, no comments, and commit messages like 'fix stuff' and 'update'. Describe three specific improvements you would make in priority order, and explain why each matters.",
                placeholder: "Three prioritized improvements",
                validationMode: "includes",
                acceptedAnswers: [
                  "readme",
                  "comment",
                  "commit",
                  "message",
                  "setup",
                  "explain",
                  "why",
                  "describe",
                ],
                successMessage:
                  "Transfer evidence accepted. You demonstrated the ability to assess and improve project documentation systematically.",
                hint: "Start with the highest-impact documentation gap. What unlocks the most value for the team?",
                assessmentType: "transfer",
              },
              competencies: [
                { track: "Documentation", targetLevel: "Assisted" },
              ],
              scaffoldingLevel: "goal-driven",
            },
          ],
        },
      ],
    },
    {
      id: "phase-4",
      title: "Independent Build and Portfolio",
      strapline: "Prove what you can do.",
      purpose:
        "Transition from training to independent execution. Build complete projects with reduced scaffolding, make architectural decisions, and document work for portfolio presentation.",
      level: "Advanced",
      duration: "6–8 weeks",
      environment:
        "Open workspaces with minimal scaffolding — ticket-style briefs only",
      tools: [
        "Visual Studio Code",
        "Git",
        "GitHub",
        "Node.js",
        "chosen stack tooling",
        "AI coding assistant",
      ],
      guardrails: [
        "Scaffolding is intentionally minimal — learners should ask for help from AI or documentation, not step-by-step instructions.",
        "All projects must include a README, setup instructions, and at least basic tests.",
        "AI assistance is permitted but must be documented in a decision log.",
      ],
      milestones: [
        "Build a working CLI utility independently",
        "Complete a CRUD web app from requirements",
        "Document and present a debugging case study",
        "Deliver a capstone with README, tests, and setup instructions",
      ],
      projects: [
        "Personal CLI utility with documented purpose and usage",
        "CRUD web application with frontend and API",
        "API-integrated dashboard",
        "Debugging case study with root cause analysis",
        "Documented capstone with README, setup instructions, and test coverage",
      ],
      competencyFocus: [
        "DeliveryWorkflow",
        "Debugging",
        "Testing",
        "ApiInteraction",
        "IndependentProblemSolving",
      ],
      exitStandard: {
        summary:
          "The learner can build and explain one or more complete projects that demonstrate engineering competence — inspect systems, modify code, diagnose failures, and build working solutions with discipline.",
        gates: [
          {
            description: "Build and ship a working application independently",
            competency: "DeliveryWorkflow",
            requiredLevel: "Independent",
          },
          {
            description: "Write tests that verify core behaviors of a project",
            competency: "Testing",
            requiredLevel: "Functional",
          },
          {
            description:
              "Debug and document a real failure from symptoms to fix",
            competency: "Debugging",
            requiredLevel: "Independent",
          },
          {
            description: "Integrate at least one external API in a project",
            competency: "ApiInteraction",
            requiredLevel: "Functional",
          },
          {
            description:
              "Solve an unfamiliar problem independently using available resources",
            competency: "IndependentProblemSolving",
            requiredLevel: "Functional",
          },
        ],
        representativeLabs: [
          "Build a personal CLI utility",
          "Complete a CRUD web app from a ticket brief",
          "Debug and document a broken app startup",
          "Deliver a capstone with README and test coverage",
        ],
      },
      courses: [
        {
          id: "course-capstone-tracks",
          title: "Capstone Tracks",
          focus: "Independent project execution with minimal scaffolding",
          outcome:
            "Learners complete one or more scoped projects that demonstrate end-to-end engineering competence.",
          lessons: [
            {
              id: "lesson-cli-build",
              title: "Build a CLI Utility",
              summary:
                "Design and build a command-line tool that solves a real problem, documented for use by others.",
              duration: "3–4 hours",
              difficulty: "Advanced",
              objective:
                "Design, implement, test, and document a CLI tool from scratch.",
              explanation: [
                "A **CLI (command-line interface) tool** is one of the most direct demonstrations of engineering skill: you define the interface (what arguments and flags it accepts), implement the logic, handle edge cases (missing arguments, invalid paths, permission errors), and ship something usable by anyone with a terminal. It is a complete engineering deliverable in miniature.",
                "Building a CLI forces you to think about **interface design before implementation**. Before writing any logic, decide: What arguments does the tool accept? What flags modify its behavior? What does the output look like? What happens when the user provides invalid input? In Node.js, `process.argv` gives you access to command-line arguments — `process.argv[0]` is the Node binary, `process.argv[1]` is the script path, and `process.argv[2]` onward are user-supplied arguments:\n\n```typescript\n// node mycli.ts ./src\n// process.argv[0] = 'node'\n// process.argv[1] = 'mycli.ts'\n// process.argv[2] = './src'    <-- the user's input\n```",
                "This lab is **ticket-style** — you receive a brief describing what to build, you plan the approach, you build it incrementally with tests after each major function, and you document it in a README. There are no step-by-step instructions. The brief: build a tool that accepts a directory path as an argument and outputs a summary of file types and their counts (e.g., `.ts: 12, .json: 3, .md: 2`).",
                "The deliverables match what a professional would ship: a working script that runs from the command line, a README explaining what the tool does and how to use it (including example output), and at least two tests verifying core behavior — one for a valid directory and one for error handling (e.g., the path does not exist).",
              ],
              demonstration: [
                "The brief: build a CLI tool that accepts a directory path and outputs a count of files by extension. Here is the execution showing both success and error handling:\n\n```bash\n$ node filecounter.ts ./src\n.ts:    14\n.json:   3\n.md:     2\n.css:    1\n---\nTotal: 20 files in ./src\n\n$ node filecounter.ts\nError: Please provide a directory path.\nUsage: node filecounter.ts <directory>\n\n$ node filecounter.ts ./nonexistent\nError: Directory does not exist: ./nonexistent\n```\n\nThe tool handles three scenarios: valid directory (prints the report), missing argument (shows usage), and invalid path (explains what went wrong). Each error exits with a non-zero code so scripts and CI can detect the failure.",
                "Break the implementation into testable functions. Here is the core logic — `countExtensions` counts file types from a list of paths, and `getFiles` recursively reads a directory:\n\n```typescript\nimport { readdirSync, statSync } from 'fs';\nimport { join, extname } from 'path';\n\nfunction getFiles(dir: string): string[] {\n  const entries = readdirSync(dir, { withFileTypes: true });\n  return entries.flatMap(entry =>\n    entry.isDirectory()\n      ? getFiles(join(dir, entry.name))\n      : [join(dir, entry.name)]\n  );\n}\n\nfunction countExtensions(files: string[]): Record<string, number> {\n  const counts: Record<string, number> = {};\n  for (const file of files) {\n    const ext = extname(file) || '(no extension)';\n    counts[ext] = (counts[ext] || 0) + 1;\n  }\n  return counts;\n}\n```\n\nWrite a test after each function to confirm it works before building the next:\n\n```typescript\ndescribe('countExtensions', () => {\n  it('counts .ts and .json files correctly', () => {\n    const files = ['src/app.ts', 'src/utils.ts', 'config.json'];\n    expect(countExtensions(files)).toEqual({ '.ts': 2, '.json': 1 });\n  });\n  it('handles files with no extension', () => {\n    expect(countExtensions(['Makefile'])).toEqual({ '(no extension)': 1 });\n  });\n});\n```",
                "The README should cover: what the tool does (one sentence), how to run it (`node filecounter.ts <directory>`), example output, and how to run the tests (`npm test`). This is the minimum viable documentation for a CLI tool — anyone should be able to clone the repo and use the tool within a minute.",
              ],
              exerciseSteps: [
                "Read the brief and define the CLI interface: what argument does the tool accept (`process.argv[2]`), what output format will it produce, and what error should it show when the argument is missing or invalid?",
                "Build the tool incrementally — implement one function at a time (e.g., `getFiles`, `countExtensions`) and write a test with `describe`/`it`/`expect` after each. Run `npm test` after each addition to confirm the suite stays green.",
                "Write a README with four sections: **Purpose** (what the tool does), **Usage** (exact command to run it with an example), **Example Output** (what the user will see), and **Testing** (`npm test` to run the suite).",
              ],
              validationChecks: [
                "Tool runs from the command line with `node <script> <directory>` and produces the expected output format.",
                "Missing or invalid arguments produce a clear error message and a non-zero exit code — the tool does not crash silently or print a stack trace.",
                "README includes purpose, usage with example command, example output, and `npm test` instructions — a stranger can use the tool within a minute of reading it.",
                "At least two tests pass: one verifying core functionality (correct file counts) and one verifying error handling (missing argument or invalid path).",
              ],
              retention: [
                "Define the interface before writing logic.",
                "Tests after each function, not after the whole project.",
                "A README is the first impression of your work.",
              ],
              tools: ["Node.js", "terminal", "Visual Studio Code", "Git"],
              notesPrompt:
                "Document the decisions you made: language choice, argument parsing approach, test strategy. Explain one tradeoff you encountered.",
              exercises: [
                {
                  id: "cli-interface",
                  title: "Define the interface",
                  prompt:
                    "Before writing code for a CLI tool, what should you define first?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "interface",
                    "arguments",
                    "flags",
                    "input",
                    "output",
                    "contract",
                  ],
                  successMessage:
                    "Correct. Defining the interface first prevents you from building a tool that is hard to use.",
                  hint: "Think about what a user of your tool needs to know before running it.",
                  assessmentType: "reasoning",
                },
                {
                  id: "cli-test-timing",
                  title: "When to test",
                  prompt:
                    "When building a CLI tool incrementally, at what point should you write tests?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "after each",
                    "each function",
                    "as you go",
                    "incrementally",
                    "every step",
                    "each major",
                  ],
                  successMessage:
                    "Correct. Write tests after each major function, not after the whole project is built. Incremental testing catches issues early.",
                  hint: "Think about the cost of finding a bug in the last function vs. the first.",
                  assessmentType: "reasoning",
                },
                {
                  id: "cli-error-handling",
                  title: "Handle invalid input",
                  prompt:
                    "When a user runs your CLI tool without providing the required directory argument, what should the tool do instead of crashing with a stack trace?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "error message",
                    "usage",
                    "help",
                    "exit",
                    "print",
                    "inform",
                    "clear message",
                    "non-zero",
                  ],
                  successMessage:
                    "Correct. A professional CLI tool prints a clear error message and usage instructions, then exits with a non-zero code \u2014 never a raw stack trace.",
                  hint: "Think about what you would want to see if you forgot an argument. Stack traces help developers, not users.",
                  assessmentType: "reasoning" as const,
                },
              ],
              transferTask: {
                id: "transfer-cli-delivery",
                title: "Transfer challenge: ship-ready CLI",
                prompt:
                  "Describe the minimum deliverables required to ship your CLI utility so another developer can install, run, and verify it independently.",
                placeholder: "List deliverables",
                validationMode: "includes",
                acceptedAnswers: [
                  "readme",
                  "tests",
                  "usage",
                  "install",
                  "example",
                  "verification",
                ],
                successMessage:
                  "Transfer challenge passed. You identified the core delivery artifacts needed for independent use.",
                hint: "Think in terms of reproducibility: setup, usage, and proof it works.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "parse-cli-args",
                  title: "Parse command-line arguments",
                  description:
                    "Complete the function so it reads the first positional argument from process.argv and returns it. If no argument is provided, return the string 'No path given'.",
                  starterCode:
                    "function getTargetDir(): string {\n  // process.argv: [node, script, ...args]\n  // Return the first user argument, or 'No path given'\n}\n\nconsole.log(getTargetDir());",
                  language: "typescript",
                  hint: "process.argv[2] is the first user-supplied argument. Check if it exists before returning it.",
                  acceptedPatterns: [
                    "process.argv[2]",
                    "process.argv",
                    "No path given",
                  ],
                },
              ],
              competencies: [
                { track: "DeliveryWorkflow", targetLevel: "Independent" },
                { track: "Testing", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "ticket-style",
            },
            {
              id: "lesson-crud-app",
              title: "Build a CRUD Web Application",
              summary:
                "Build a full-stack CRUD application from a requirements brief with frontend, API, and data persistence.",
              duration: "4–6 hours",
              difficulty: "Advanced",
              objective:
                "Build a working CRUD app with a frontend UI, backend API, and persistent storage from a ticket-style brief.",
              explanation: [
                "**CRUD** — Create, Read, Update, Delete — covers the four fundamental operations behind most web applications. A task manager, a contacts list, a bookmark organizer — they all share this pattern. Building a CRUD app independently tests your ability to make architectural decisions, connect the frontend to a backend API, validate input at the right boundaries, and handle the edge cases that separate a demo from a real application.",
                "The architecture has three layers: a **data model** (what shape the data takes — fields, types, constraints), an **API** (endpoints that accept requests, validate input, and return responses with appropriate status codes), and a **frontend** (UI that calls the API and renders the results). The data model constrains everything else — get it right first:\n\n```typescript\n// Example: Task data model\ntype Task = {\n  id: string;\n  title: string;       // required, non-empty\n  completed: boolean;   // defaults to false\n  createdAt: string;    // ISO 8601 timestamp\n};\n```",
                "The API endpoints follow REST conventions. For a task manager, that means: `POST /api/tasks` (create), `GET /api/tasks` (read all), `PUT /api/tasks/:id` (update), and `DELETE /api/tasks/:id` (delete). **Validate at the API boundary** — never trust the frontend alone because API endpoints can be called directly (via `curl`, Postman, or a malicious client). If a required field is missing, return `400 Bad Request` with a clear error message.",
                "This lab is ticket-style. The brief: build a task manager where users can add, edit, complete, and delete tasks. Data must persist between page refreshes (use a file, SQLite, or `localStorage` — your choice). The deliverables: a working app, documented API (at minimum, list the endpoints in the README), basic test coverage for at least two endpoints, and a README with setup and run instructions.",
              ],
              demonstration: [
                "Start with the data model. Define the `Task` type with required fields (`id`, `title`, `completed`, `createdAt`). Then design the API endpoints:\n\n```\nPOST   /api/tasks          → create a task (body: { title })\nGET    /api/tasks           → list all tasks\nPUT    /api/tasks/:id       → update a task (body: { title?, completed? })\nDELETE /api/tasks/:id       → delete a task\n```\n\nEach endpoint should return appropriate status codes: `201` for creation, `200` for success, `400` for invalid input, `404` for not found.",
                'Build the `POST /api/tasks` endpoint first with input validation. Test it with `curl` to see the exact request/response flow for all four operations:\n\n```bash\n# Create a task — happy path\n$ curl -s -X POST http://localhost:3000/api/tasks \\\n  -H "Content-Type: application/json" \\\n  -d \'{"title": "Write unit tests"}\'\n{"id":"a1b2c3","title":"Write unit tests","completed":false,"createdAt":"2026-04-05T14:30:00Z"}\n\n# Missing title — validation error\n$ curl -s -X POST http://localhost:3000/api/tasks \\\n  -H "Content-Type: application/json" \\\n  -d \'{"title": ""}\'\n{"error":"Title is required"}   # HTTP 400 Bad Request\n\n# List all tasks\n$ curl -s http://localhost:3000/api/tasks\n[{"id":"a1b2c3","title":"Write unit tests","completed":false,"createdAt":"2026-04-05T14:30:00Z"}]\n\n# Toggle completion\n$ curl -s -X PUT http://localhost:3000/api/tasks/a1b2c3 \\\n  -H "Content-Type: application/json" \\\n  -d \'{"completed": true}\'\n{"id":"a1b2c3","title":"Write unit tests","completed":true,"createdAt":"2026-04-05T14:30:00Z"}\n\n# Delete a task\n$ curl -s -X DELETE http://localhost:3000/api/tasks/a1b2c3\n{"message":"Task deleted"}      # HTTP 200 OK\n```\n\nEach endpoint returns proper status codes: `201 Created` for POST, `200 OK` for GET/PUT/DELETE, `400 Bad Request` for validation failures, and `404 Not Found` for missing resources. Write a test for the POST endpoint verifying both the happy path (valid title returns 201) and the validation error (empty title returns 400) before building the next endpoint.',
                "Connect the frontend to the API with `fetch` calls. The UI should show the task list on load (`GET /api/tasks`), allow adding a new task (`POST`), toggling completion (`PUT`), and deleting (`DELETE`). Verify that data persists: add a task, refresh the page, confirm the task is still there. This is the full-stack round trip that proves your layers are connected correctly.",
              ],
              exerciseSteps: [
                "Design the data model first: define the `Task` type with its fields, types, and constraints (e.g., `title` is required, `completed` defaults to `false`).",
                "Build the API endpoints one at a time, starting with `POST /api/tasks`. Add input validation — return `400` with a clear error if `title` is missing or empty. Test each endpoint before moving to the next.",
                "Connect the frontend to the API using `fetch`. Implement the create, read, update, and delete operations in the UI.",
                "Add data persistence (file, database, or `localStorage`) and verify: add a task, refresh the page, confirm the task is still present.",
                "Write tests for at least two API endpoints using `describe`/`it`/`expect` — one testing the happy path and one testing validation (e.g., `POST` with an empty title returns `400`).",
              ],
              validationChecks: [
                "All four CRUD operations work end-to-end: creating a task, reading the task list, updating a task (e.g., marking complete), and deleting a task.",
                "Data persists between page refreshes — adding a task and refreshing the page shows the task is still present.",
                "API validates input at the boundary: a `POST` request with a missing or empty `title` returns `400 Bad Request` with a descriptive error message — not a `500` server error.",
                "At least two tests verify API behavior: one happy-path test (valid input → correct response) and one validation test (invalid input → `400` response).",
              ],
              retention: [
                "Data model first — it constrains everything else.",
                "Validate at the API boundary, not just the UI.",
                "Test the contract, not the implementation.",
              ],
              tools: [
                "Node.js",
                "Visual Studio Code",
                "Git",
                "terminal",
                "Postman",
              ],
              notesPrompt:
                "Write up the architecture decisions you made. What would you change if you built this again?",
              exercises: [
                {
                  id: "crud-model-first",
                  title: "Data model priority",
                  prompt:
                    "Why should you design the data model before writing API routes for a CRUD application?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "schema",
                    "structure",
                    "fields",
                    "model",
                    "constrain",
                    "shape",
                  ],
                  successMessage:
                    "Correct. The data model defines the shape of everything else — routes, validation, and UI all follow from it.",
                  hint: "Think about what your routes and validation depend on.",
                  assessmentType: "reasoning",
                },
                {
                  id: "crud-validation-boundary",
                  title: "Where to validate",
                  prompt:
                    "Should input validation happen in the frontend UI, the API route, or both? Why?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "both",
                    "api",
                    "server",
                    "boundary",
                    "bypass",
                    "trust",
                  ],
                  successMessage:
                    "Correct. Validate at the API boundary because the UI can be bypassed. Frontend validation improves UX but the server is the authority.",
                  hint: "Think about what happens if someone sends a request directly to the API, skipping the UI.",
                  assessmentType: "reasoning",
                },
                {
                  id: "crud-status-codes",
                  title: "REST status codes",
                  prompt:
                    "What HTTP status code should a successful POST request return when creating a new resource? What about a successful DELETE?",
                  placeholder: "POST: ..., DELETE: ...",
                  validationMode: "includes",
                  acceptedAnswers: ["201", "200", "204"],
                  successMessage:
                    "Correct. POST \u2192 201 Created (a new resource was made), DELETE \u2192 200 OK or 204 No Content (the resource was removed). Correct status codes make APIs predictable.",
                  hint: "POST creates something new (which specific 2xx code?). DELETE removes something (200 or 204 are both acceptable).",
                  assessmentType: "action" as const,
                },
              ],
              transferTask: {
                id: "transfer-crud-variation",
                title: "Transfer challenge: design a different CRUD app",
                prompt:
                  "You receive a brief for a bookmark manager: users can add, tag, search, and delete bookmarks. Describe your data model, list the API endpoints you would create, and explain one validation rule you would enforce at the API boundary.",
                placeholder: "Data model, endpoints, and validation",
                validationMode: "includes",
                acceptedAnswers: [
                  "endpoint",
                  "route",
                  "validate",
                  "model",
                  "schema",
                  "create",
                  "delete",
                  "field",
                ],
                successMessage:
                  "Transfer evidence accepted. You demonstrated independent CRUD design from a fresh brief.",
                hint: "Describe the fields in your data model, name the routes, and pick one validation rule.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "validate-task-input",
                  title: "Add API input validation",
                  description:
                    "This createTask handler accepts any input. Add validation so it returns a 400 error if the title is missing or empty.",
                  starterCode:
                    "function createTask(req) {\n  const { title } = req.body;\n  // Add validation: if title is missing or empty, \n  // return { status: 400, error: 'Title is required' }\n  return { status: 201, data: { id: 1, title } };\n}",
                  language: "javascript",
                  hint: "Check if !title or title.trim() === '' before creating the task.",
                  acceptedPatterns: [
                    "!title",
                    "title.trim",
                    "400",
                    "Title is required",
                  ],
                },
              ],
              competencies: [
                { track: "DeliveryWorkflow", targetLevel: "Independent" },
                { track: "ApiInteraction", targetLevel: "Functional" },
                { track: "Testing", targetLevel: "Functional" },
              ],
              scaffoldingLevel: "ticket-style",
            },
            {
              id: "lesson-debugging-case-study",
              title: "Debugging Case Study",
              summary:
                "Investigate and document a real-world style broken application — from symptoms to root cause to fix.",
              duration: "2–3 hours",
              difficulty: "Advanced",
              objective:
                "Apply systematic debugging to a broken application, document the investigation process, and produce a clean fix with a written root cause analysis.",
              explanation: [
                "A **debugging case study** proves you can think like an engineer under pressure: observe symptoms without assumptions, form hypotheses, isolate the cause through evidence, apply a targeted fix, and explain the entire chain from symptom to root cause to resolution. This is the skill that separates someone who can write code from someone who can maintain and fix systems.",
                "The debugging protocol has five steps: **reproduce** (trigger the failure reliably — if you cannot reproduce it, you cannot confirm a fix), **observe** (read error messages, check logs with `console.log` or `docker logs`, inspect network responses in the browser dev tools), **hypothesize** (form a theory about what is causing the failure), **isolate** (narrow the scope — is it the frontend, the API, the database, or the configuration?), and **fix and verify** (apply the smallest change that addresses the root cause, then reproduce the original steps to confirm the fix).",
                "Critically: **the root cause is not the line that throws the error**. A `500 Internal Server Error` is a symptom. The root cause might be a missing environment variable, a database connection timeout, a null value that was not checked, or a dependency that was not installed. Your job is to follow the chain backwards from the symptom to the actual cause:\n\n```\nSymptom:  500 error on POST /api/tasks\nLog:      TypeError: Cannot read property 'trim' of undefined\nLine:     title.trim() in createTask handler\nRoot cause: request body is empty because express.json() middleware is missing\n```",
                "The deliverable is a **bug report** — a written artifact that makes your debugging **portable knowledge**. It covers: the symptom (what was observed), the reproduction steps (how to trigger it), the investigation process (what you checked and what you found), the root cause (why it happened — not just where), the fix (the specific change), and the verification (how you confirmed the fix works). This format turns a debugging session into documentation that helps the team prevent similar issues.",
              ],
              demonstration: [
                'The broken application: a task API that returns `500 Internal Server Error` on `POST /api/tasks` requests. Start by reproducing the failure:\n\n```bash\ncurl -X POST http://localhost:3000/api/tasks \\\n  -H "Content-Type: application/json" \\\n  -d \'{"title": "Test task"}\'\n# Response: 500 Internal Server Error\n```\n\nThe error is reproducible. Now check the logs — the server output shows `TypeError: Cannot read property \'trim\' of undefined` in the `createTask` handler. This tells you `title` is `undefined` when it reaches `title.trim()`.',
                'Form a hypothesis: the request body is not being parsed, so `req.body` is empty. Check the server setup — look for `app.use(express.json())`. It is missing. The `express.json()` middleware converts the raw JSON request body into a JavaScript object. Without it, `req.body` is `undefined`, so `req.body.title` is `undefined`, and `.trim()` throws.\n\nThe fix: add `app.use(express.json())` before the route handlers. One line. Verify:\n\n```bash\ncurl -X POST http://localhost:3000/api/tasks \\\n  -H "Content-Type: application/json" \\\n  -d \'{"title": "Test task"}\'\n# Response: 201 Created {"id": "1", "title": "Test task"}\n```',
                "The bug report documents the entire chain:\n\n```\nSymptom: POST /api/tasks returns 500\nReproduction: curl POST with valid JSON body\nInvestigation: Server logs show TypeError on title.trim()\nRoot cause: express.json() middleware was missing — req.body was undefined\nFix: Added app.use(express.json()) before route handlers\nVerification: POST now returns 201 with correct response body\n```\n\nThis artifact is useful to the team months later when a similar issue occurs.",
              ],
              exerciseSteps: [
                "Reproduce the failure reliably using a specific request or action. Document the exact steps: the command you ran (e.g., `curl -X POST ...`), the response you received, and the error in the logs.",
                "Investigate logs and narrow the scope: identify which function threw the error, read the error message, and check the inputs to that function. Use `console.log`, `docker logs`, or browser dev tools as needed.",
                "Identify the **root cause** — not just the line that throws, but **why** it throws. Follow the chain: what value is wrong, where does it come from, and what is missing or misconfigured?",
                "Apply the **smallest fix** that addresses the root cause. Re-run the reproduction steps to verify the error is gone and the expected behavior works.",
                "Write a short bug report with five sections: **Symptom**, **Reproduction steps**, **Root cause**, **Fix**, and **Verification**.",
              ],
              validationChecks: [
                "Bug is reproduced with a documented, repeatable set of steps **before** any code changes are made.",
                "Root cause is identified as a specific **why** — not just the line that throws (symptom) but the underlying condition (e.g., missing middleware, null value, misconfigured environment variable).",
                "Fix is minimal and targeted — one or two lines that address the root cause, not a broad rewrite of the function.",
                "Bug report includes all five sections: **Symptom**, **Reproduction**, **Root cause**, **Fix**, and **Verification** with specific commands or steps.",
              ],
              retention: [
                "Reproduce first — always.",
                "Root cause is not the line that throws. It is why that line throws.",
                "A bug report is the artifact that makes your debugging portable knowledge.",
              ],
              tools: ["Visual Studio Code", "terminal", "Git", "Node.js"],
              notesPrompt:
                "Write your personal debugging protocol in five steps. Note which step most engineers skip.",
              exercises: [
                {
                  id: "root-cause-vs-symptom",
                  title: "Root cause vs symptom",
                  prompt:
                    "A server throws a 500 error. Is the 500 error the root cause? Why or why not?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "symptom",
                    "not the cause",
                    "result",
                    "what happened",
                    "deeper",
                  ],
                  successMessage:
                    "Correct. The 500 error is the symptom. The root cause is the condition that triggered it — which requires investigation to find.",
                  hint: "Think about the difference between what you observe and why it happened.",
                  assessmentType: "debugging",
                },
                {
                  id: "reproduce-first",
                  title: "Reproduce before fixing",
                  prompt:
                    "Why must you reproduce a bug reliably before attempting to fix it?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "verify",
                    "confirm",
                    "know",
                    "prove",
                    "same",
                    "consistent",
                    "reliable",
                    "actually fixed",
                  ],
                  successMessage:
                    "Correct. Without reliable reproduction, you cannot confirm the fix works — you might fix the wrong thing or mask the real issue.",
                  hint: "Think about how you would know your fix actually solved the problem.",
                  assessmentType: "debugging",
                },
                {
                  id: "minimal-fix",
                  title: "Smallest possible fix",
                  prompt:
                    "After identifying the root cause of a bug, why should your fix be the smallest change possible instead of a larger rewrite?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "risk",
                    "break",
                    "side effect",
                    "regression",
                    "scope",
                    "verify",
                    "isolate",
                    "confidence",
                  ],
                  successMessage:
                    "Correct. A minimal fix reduces the risk of introducing new bugs. The smaller the change, the easier it is to verify and the less likely it creates side effects.",
                  hint: "Think about what could go wrong if you rewrote the entire function instead of fixing the one broken line.",
                  assessmentType: "reasoning" as const,
                },
              ],
              transferTask: {
                id: "transfer-debugging-protocol",
                title: "Transfer challenge: debug from a new symptom",
                prompt:
                  "A user reports that a web form silently fails on submit — no error, no feedback, no data saved. Describe your debugging protocol: what you check first, how you narrow scope, and how you verify your fix.",
                placeholder: "Investigation steps and reasoning",
                validationMode: "includes",
                acceptedAnswers: [
                  "reproduce",
                  "console",
                  "network",
                  "log",
                  "inspect",
                  "verify",
                  "narrow",
                  "isolate",
                ],
                successMessage:
                  "Transfer evidence accepted. You demonstrated a systematic debugging approach to an unfamiliar symptom.",
                hint: "Start with reproduction, then narrow scope through observable signals.",
                assessmentType: "transfer",
              },
              codeExercises: [
                {
                  id: "add-diagnostic-logs",
                  title: "Add diagnostic logging",
                  description:
                    "The function below silently returns undefined when it should return a user. Add console.log statements to determine why the user is not found.",
                  starterCode:
                    "function findUser(users: any[], email: string) {\n  const result = users.find(u => u.email === email);\n  return result;\n}\n\nconst users = [\n  { name: 'Alice', email: 'alice@test.com' },\n  { name: 'Bob', email: 'bob@test.com' },\n];\n\nconst found = findUser(users, 'Alice@test.com');\nconsole.log(found); // undefined — why?",
                  language: "typescript",
                  hint: "Add console.log to see the actual email values being compared. The issue is case sensitivity.",
                  acceptedPatterns: ["console.log", "email", "u.email"],
                },
              ],
              competencies: [
                { track: "Debugging", targetLevel: "Independent" },
                { track: "DeliveryWorkflow", targetLevel: "Functional" },
                {
                  track: "IndependentProblemSolving",
                  targetLevel: "Functional",
                },
              ],
              scaffoldingLevel: "ticket-style",
            },
            {
              id: "lesson-portfolio-capstone",
              title: "Portfolio Capstone",
              summary:
                "Deliver and document one or more projects as a coherent portfolio — with READMEs, test coverage, and a written reflection on technical decisions.",
              duration: "4–8 hours",
              difficulty: "Advanced",
              objective:
                "Package completed projects into a presentable portfolio that demonstrates engineering competence to future collaborators, employers, or clients.",
              explanation: [
                "A portfolio is not a resume bullet point — it is **evidence**. Anyone who visits your repository should be able to understand what you built, why you made the choices you did, and how to run it themselves — without asking you a single question. The difference between 'I built a task manager' on a resume and a working project with a clear README, passing tests, and documented decisions is the difference between a claim and proof.",
                "This capstone requires you to treat your completed projects as **professional deliverables**. That means: a comprehensive README (purpose, setup, usage, testing — all four sections), at least basic test coverage (core behaviors verified, not just 'the tests folder exists'), documented architecture decisions (what you chose, what you considered, and why you decided), and a written reflection (what worked, what you would do differently, what you learned).",
                "A **decisions log** is surprisingly valuable. The format is simple:\n\n```markdown\n## Decision: SQLite over PostgreSQL for persistence\n**Considered:** PostgreSQL (production-grade), localStorage (no backend needed), SQLite (file-based, zero config)\n**Chose:** SQLite — simpler setup, no external service, sufficient for the project scope\n**Tradeoff:** Not suitable for concurrent multi-user access; would switch to PostgreSQL if the app needed multiple simultaneous users\n```\n\nThis shows an interviewer or collaborator that you make deliberate, reasoned choices — not just whatever tutorial you found first.",
                "The final test for portfolio readiness: **clone and run**. Clone your own repository into a fresh directory, follow only the README instructions, and verify that the project runs, the tests pass, and the output matches what the README describes. If you get stuck at any point, your documentation has a gap. Fix it before you ship.",
              ],
              demonstration: [
                "Compare three READMEs for the same project. The weak one:\n\n```markdown\n# My App\nA task app.\n```\n\nThe functional one:\n\n```markdown\n# Task Manager\nCRUD task manager built with Node.js and Express.\n\n## Setup\nnpm install\n\n## Run\nnpm start\n```\n\nThe strong one:\n\n```markdown\n# Task Manager API\nA REST API for managing tasks with CRUD operations, input validation, and SQLite persistence.\n\n## Setup\nnpm install\ncp .env.example .env\n\n## Usage\nnpm run dev    # starts on http://localhost:3000\n\n## API Endpoints\nPOST /api/tasks, GET /api/tasks, PUT /api/tasks/:id, DELETE /api/tasks/:id\n\n## Testing\nnpm test       # 8 tests covering all endpoints\n\n## Decisions\nSee decisions.md for architecture choices.\n```\n\nThe difference: the strong README lets a stranger go from clone to running and verified in under two minutes.",
                "Write a decisions log entry. Pick one real choice from your project — the persistence strategy, the framework, the testing approach — and document it in the **Considered / Chose / Tradeoff** format:\n\n```markdown\n## Decision: Vitest over Jest for testing\n**Considered:** Jest (widely used, large ecosystem), Vitest (fast, native TypeScript, Vite-compatible)\n**Chose:** Vitest — faster execution, native TypeScript support without extra transforms, simpler configuration\n**Tradeoff:** Smaller community and fewer third-party plugins compared to Jest\n```\n\nThis format forces you to articulate your reasoning — which is the real value. The decision itself matters less than the fact that you made it deliberately.",
                "Finally, the clone-and-run test. Clone your project into a new directory, follow nothing but the README, and verify: `npm install` works, `npm test` passes, `npm run dev` (or equivalent) starts the app, and the behavior matches what the README describes. Any point where you get stuck is a documentation gap. Fix it and repeat.",
              ],
              exerciseSteps: [
                "Select one or more completed projects from previous lessons. These are the projects you will package as portfolio deliverables.",
                "Write a README with the four required sections: **Purpose** (what the project does), **Setup** (`npm install` and any configuration), **Usage** (how to run it with exact commands), and **Testing** (`npm test`). Include at least one documented architectural decision.",
                "Verify test coverage: run `npm test` on a clean install and confirm at least two meaningful tests pass — not placeholder tests, but tests that verify core behaviors of the application.",
                "Write a short reflection (3–5 sentences): what worked well, what you would do differently if you started over, and the single most important thing you learned. Be specific — not 'I learned a lot' but 'I learned that designing the data model first prevents rework in the API layer.'",
              ],
              validationChecks: [
                "README includes four sections: **Purpose**, **Setup** (with exact commands), **Usage** (with run command), and **Testing** (with `npm test`), plus at least one documented architectural decision.",
                "Tests exist and pass on a clean `npm install` followed by `npm test` — they verify core behaviors, not just that the test runner starts.",
                "Reflection is honest and specific — it names a concrete thing that worked, a concrete thing to change, and a specific lesson learned (not generic 'it was a great experience' language).",
                "Project runs end-to-end from a fresh `git clone`: the README instructions lead to a working application without needing to ask the author for help.",
              ],
              retention: [
                "A README is the front door to your work — make it work without you.",
                "Decisions matter more than conclusions — document why, not just what.",
                "Tests are proof that you know your code works, not just that it ran once.",
              ],
              tools: [
                "Visual Studio Code",
                "Git",
                "GitHub",
                "Node.js",
                "terminal",
              ],
              notesPrompt:
                "Write your own definition of a portfolio-ready project. What does it need that a personal practice project does not?",
              exercises: [
                {
                  id: "readme-must-haves",
                  title: "README essentials",
                  prompt:
                    "Name the four sections every technical README must include to be useful to a stranger.",
                  placeholder: "Short list",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "setup",
                    "install",
                    "usage",
                    "what it does",
                    "purpose",
                    "how to run",
                    "tests",
                  ],
                  successMessage:
                    "Correct. A README that covers purpose, setup, usage, and testing is immediately useful to anyone who finds it.",
                  hint: "Think about what you need to answer before someone else can use your project independently.",
                  assessmentType: "reasoning",
                },
                {
                  id: "portfolio-evidence",
                  title: "Evidence over claims",
                  prompt:
                    "Why is a link to a working project more valuable than a bullet point on a resume?",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "evidence",
                    "proof",
                    "show",
                    "demonstrate",
                    "verify",
                    "see",
                    "working",
                  ],
                  successMessage:
                    "Correct. Evidence is verifiable. Claims are not. A portfolio converts self-description into demonstrable capability.",
                  hint: "Think about the difference between saying you can do something and showing it.",
                  assessmentType: "reasoning",
                },
                {
                  id: "clone-and-run-test",
                  title: "The clone-and-run test",
                  prompt:
                    "What is the ultimate test that your portfolio project is ready to share? Describe the process in one sentence.",
                  placeholder: "Short answer",
                  validationMode: "includes",
                  acceptedAnswers: [
                    "clone",
                    "fresh",
                    "new directory",
                    "follow readme",
                    "run",
                    "install",
                    "works",
                  ],
                  successMessage:
                    "Correct. Clone your repo into a fresh directory, follow only the README instructions, and verify everything works. If you get stuck, your docs have a gap.",
                  hint: "Imagine someone who has never seen your project before. What would they try first?",
                  assessmentType: "reasoning" as const,
                },
              ],
              transferTask: {
                id: "transfer-portfolio-review",
                title: "Transfer challenge: review a peer portfolio",
                prompt:
                  "Imagine you are reviewing a peer's portfolio project. The README exists but only says 'a task manager app'. There are no tests. The project runs but has no error handling. Write three specific, actionable pieces of feedback you would give to improve it.",
                placeholder: "Three specific feedback items",
                validationMode: "includes",
                acceptedAnswers: [
                  "readme",
                  "test",
                  "error",
                  "document",
                  "setup",
                  "instructions",
                  "handle",
                  "cover",
                ],
                successMessage:
                  "Transfer evidence accepted. You demonstrated the ability to evaluate and improve engineering work critically.",
                hint: "Focus on the gaps: documentation, testing, and robustness.",
                assessmentType: "transfer",
              },
              competencies: [
                { track: "DeliveryWorkflow", targetLevel: "Independent" },
                { track: "Debugging", targetLevel: "Functional" },
                {
                  track: "IndependentProblemSolving",
                  targetLevel: "Independent",
                },
              ],
              scaffoldingLevel: "ticket-style",
            },
          ],
        },
      ],
    },
  ],
};
