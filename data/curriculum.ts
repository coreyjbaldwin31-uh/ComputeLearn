export type ValidationMode = "includes" | "exact";

export type Exercise = {
  id: string;
  title: string;
  prompt: string;
  placeholder: string;
  validationMode: ValidationMode;
  acceptedAnswers: string[];
  successMessage: string;
  hint: string;
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
};

export type Curriculum = {
  productTitle: string;
  productVision: string;
  promise: string;
  phases: Phase[];
};

export const curriculum: Curriculum = {
  productTitle: "ComputeLearn",
  productVision: "A safe, hands-on platform that takes a regular computer user from operational fluency to practical software engineering competence.",
  promise: "Users learn by doing inside guided labs, structured projects, and reversible practice environments rather than passive lesson consumption.",
  phases: [
    {
      id: "phase-1",
      title: "Computer Mastery",
      strapline: "Operate with speed, confidence, and control.",
      purpose: "Build fast, practical competence with the operating system, terminal, filesystem, automation, and modern productivity tooling.",
      level: "Beginner to intermediate",
      duration: "4\u20136 weeks",
      environment: "Sandboxed workspace with resettable file trees and guided terminal history",
      tools: ["Windows Terminal", "PowerShell", "PowerToys", "File Explorer", "Obsidian"],
      guardrails: [
        "Commands run against training directories, never personal folders by default.",
        "Every lab includes reset, replay, and inspect actions.",
        "Unsafe actions are simulated first, then explained before any real execution.",
      ],
      milestones: [
        "Navigate files without getting lost",
        "Use keyboard-driven workflows to reduce friction",
        "Automate repetitive computer tasks safely",
      ],
      projects: [
        "Create a personal command cheat sheet with saved terminal transcripts",
        "Build a folder automation workflow for recurring tasks",
      ],
      courses: [
        {
          id: "course-os-navigation",
          title: "Operating System Fluency",
          focus: "Files, shortcuts, system awareness, and terminal confidence",
          outcome: "Learners can navigate Windows efficiently, inspect system state, and work comfortably from both GUI and terminal contexts.",
          lessons: [
            {
              id: "lesson-filesystem",
              title: "Navigate the Filesystem with Intent",
              summary: "Understand where things live, how to move through directories quickly, and how to avoid destructive mistakes.",
              duration: "35 min",
              difficulty: "Foundational",
              objective: "Move through folders, inspect files, and reason about the working directory before taking action.",
              explanation: [
                "A capable engineer does not treat the filesystem as a mystery. They know their current location, the objects around them, and the scope of every command before pressing Enter.",
                "This lesson introduces practical navigation patterns: checking the current path, listing contents, moving deliberately, and distinguishing between inspection and modification.",
              ],
              demonstration: [
                "The guided demo shows a training workspace with nested folders, then walks through listing contents, moving into a subdirectory, returning to the parent, and confirming each step.",
                "It also contrasts a safe inspection command with a potentially destructive command, reinforcing the habit of verifying context first.",
              ],
              exerciseSteps: [
                "Open the training terminal below and confirm your current directory.",
                "List the contents of the workspace and identify the Projects folder.",
                "Change into a practice directory, then move back out without using the mouse.",
              ],
              validationChecks: [
                "User demonstrates the correct command to print the current location.",
                "User demonstrates a directory listing command.",
                "User can describe why context-checking prevents accidental damage.",
              ],
              retention: [
                "Always know where you are before running file-changing commands.",
                "Prefer inspection first, modification second.",
                "Fast navigation comes from repetition, not memorizing a giant command list.",
              ],
              tools: ["Windows Terminal", "PowerShell", "File Explorer"],
              notesPrompt: "Write the three commands you want to become muscle memory, and note one mistake this lesson helped you avoid.",
              exercises: [
                { id: "pwd-check", title: "Context check", prompt: "Enter a PowerShell command that shows the current working directory.", placeholder: "Example: Get-...", validationMode: "includes", acceptedAnswers: ["get-location", "pwd"], successMessage: "Correct. The habit to build is checking location before acting.", hint: "In PowerShell, both the full cmdlet and a short alias are common." },
                { id: "list-check", title: "Inspect contents", prompt: "Enter a PowerShell command that lists directory contents.", placeholder: "Example: Get-...", validationMode: "includes", acceptedAnswers: ["get-childitem", "dir", "ls"], successMessage: "Correct. Engineers inspect the terrain before making changes.", hint: "There is a full cmdlet and a couple of short aliases." },
                { id: "cd-check", title: "Change directory", prompt: "What command moves you into a subfolder called Projects?", placeholder: "cd ...", validationMode: "includes", acceptedAnswers: ["cd projects", "set-location projects"], successMessage: "Correct. Deliberate navigation is the foundation of safe terminal use.", hint: "Use cd or Set-Location followed by the folder name." },
              ],
            },
            {
              id: "lesson-keyboard-shortcuts",
              title: "Keyboard-First Workflows",
              summary: "Learn to operate faster by replacing mouse clicks with keyboard shortcuts across the OS and terminal.",
              duration: "30 min",
              difficulty: "Foundational",
              objective: "Identify and use keyboard shortcuts that eliminate friction in daily computer use.",
              explanation: [
                "Speed on a computer comes from reducing the distance between intent and execution. Keyboard shortcuts eliminate navigation overhead and keep your hands in the action zone.",
                "This lesson covers window management, taskbar shortcuts, terminal shortcuts, and text editing shortcuts that every power user and engineer relies on.",
              ],
              demonstration: [
                "The demo shows switching between apps using Alt+Tab, opening Task Manager with Ctrl+Shift+Esc, using Win+E for File Explorer, and Ctrl+L to focus the address bar.",
                "In the terminal, it demonstrates Tab completion, Ctrl+C to cancel, Ctrl+L to clear, and Up Arrow for command recall.",
              ],
              exerciseSteps: [
                "Practice switching between three windows using only keyboard shortcuts.",
                "Open and close File Explorer without the mouse.",
                "In the training terminal, use Up Arrow to recall your last command.",
              ],
              validationChecks: [
                "User names at least three OS keyboard shortcuts.",
                "User demonstrates terminal command recall.",
                "User can explain why keyboard-first habits reduce error rates.",
              ],
              retention: [
                "Alt+Tab is not optional \u2014 it is a core navigation tool.",
                "Terminal command recall (Up Arrow) saves more time than you think.",
                "Every shortcut you learn compounds over thousands of uses.",
              ],
              tools: ["Windows Terminal", "PowerShell", "File Explorer"],
              notesPrompt: "List five keyboard shortcuts you plan to use every day. Note which ones feel unnatural \u2014 those need the most practice.",
              exercises: [
                { id: "shortcut-switch", title: "Window switching", prompt: "What keyboard shortcut switches between open windows?", placeholder: "Key combination", validationMode: "includes", acceptedAnswers: ["alt+tab", "alt tab"], successMessage: "Correct. Alt+Tab is the single most used shortcut in professional work.", hint: "It involves the Alt key and another key." },
                { id: "shortcut-explorer", title: "Quick launch", prompt: "What shortcut opens File Explorer instantly?", placeholder: "Key combination", validationMode: "includes", acceptedAnswers: ["win+e", "windows+e"], successMessage: "Correct. Win+E bypasses the Start menu entirely.", hint: "It uses the Windows key combined with a letter." },
              ],
            },
            {
              id: "lesson-system-inspection",
              title: "Understand Your Machine",
              summary: "Learn to inspect system state so you can reason about performance, storage, and running processes.",
              duration: "40 min",
              difficulty: "Foundational",
              objective: "Check CPU, memory, disk usage, and running processes using both GUI and terminal tools.",
              explanation: [
                "A computer is not a black box. Engineers know how to check what is running, what is consuming resources, and what is filling storage.",
                "This lesson introduces Task Manager, Resource Monitor, and PowerShell commands like Get-Process and Get-Volume for system inspection.",
              ],
              demonstration: [
                "The demo opens Task Manager, sorts by CPU usage, identifies a process, and then shows the same information via Get-Process in PowerShell.",
                "It then checks disk space using Get-Volume and explains how to interpret used vs. free space.",
              ],
              exerciseSteps: [
                "Open the training terminal and list running processes.",
                "Identify which process is using the most memory.",
                "Check how much free disk space is available.",
              ],
              validationChecks: [
                "User can list processes from the terminal.",
                "User explains how to sort or filter by resource usage.",
                "User knows how to check available disk space.",
              ],
              retention: [ "Know your machine before blaming your code.", "Task Manager is the first stop for performance investigation.", "Get-Process and Get-Volume replace guessing with data." ],
              tools: ["Windows Terminal", "PowerShell", "Task Manager"],
              notesPrompt: "Write down the commands to check CPU, memory, and disk space. Note anything surprising you found about your system.",
              exercises: [
                { id: "process-list", title: "List processes", prompt: "Enter a PowerShell command that shows running processes.", placeholder: "Get-...", validationMode: "includes", acceptedAnswers: ["get-process", "ps"], successMessage: "Correct. Knowing what is running is the first step to understanding system behavior.", hint: "The cmdlet name describes exactly what it does \u2014 it gets processes." },
              ],
            },
          ],
        },
        {
          id: "course-terminal-automation",
          title: "Terminal Automation",
          focus: "Scripting basics, repeatable workflows, and safe automation",
          outcome: "Learners can write simple scripts, batch rename files, and automate repetitive tasks inside safe environments.",
          lessons: [
            {
              id: "lesson-terminal-automation",
              title: "Automate Repetitive Tasks Safely",
              summary: "Use scripts and repeatable commands to eliminate friction without turning your machine into a mess.",
              duration: "45 min",
              difficulty: "Intermediate",
              objective: "Recognize repetitive workflows and encode them into safe, reviewable automation steps.",
              explanation: [
                "Automation is leverage. Good automation saves time repeatedly. Bad automation makes the same mistake repeatedly at scale.",
                "This lesson frames automation as a disciplined process: isolate the scope, dry-run the action, verify assumptions, and then commit the repeatable workflow.",
              ],
              demonstration: [
                "The demo walks through renaming a batch of files inside a sandbox, previewing the intended changes, and capturing the process in reusable script form.",
                "It then shows how to document the script so a future version of the learner knows what the script touches and how to reverse it.",
              ],
              exerciseSteps: [ "Identify a repetitive task in the sandbox workspace.", "Write a command or short script that previews the action before making changes.", "Describe how you would roll the action back." ],
              validationChecks: [ "User describes the target scope of the automation.", "User includes a preview or dry-run mindset in the workflow.", "User records how to reverse the operation." ],
              retention: [ "Automate only what you understand.", "Prefer reversible workflows and training sandboxes.", "Documentation is part of automation quality." ],
              tools: ["PowerShell", "Windows Terminal", "PowerToys", "Obsidian"],
              notesPrompt: "Capture one repetitive workflow from your own computer life and describe how you would sandbox it before automating it.",
              exercises: [
                { id: "safety-principle", title: "Safety first", prompt: "Type the principle that should come before writing automation that modifies many files.", placeholder: "Short phrase", validationMode: "includes", acceptedAnswers: ["dry run", "preview", "test in sandbox", "reversible"], successMessage: "Correct. Safe automation starts with previewing, isolating, and making rollback possible.", hint: "Think about what you should do before bulk edits hit real files." },
              ],
            },
            {
              id: "lesson-piping-filtering",
              title: "Piping and Filtering Output",
              summary: "Chain commands together to transform, filter, and direct output exactly where you need it.",
              duration: "40 min",
              difficulty: "Intermediate",
              objective: "Use pipes, Select-Object, Where-Object, and output redirection to process information efficiently.",
              explanation: [
                "The pipe operator (|) is the most powerful composition tool in the terminal. It takes the output of one command and sends it as input to the next.",
                "Combined with filtering (Where-Object) and selection (Select-Object), you can extract exactly the information you need from any command output.",
              ],
              demonstration: [
                "The demo shows Get-Process | Sort-Object CPU -Descending | Select-Object -First 5 to find the top CPU consumers.",
                "It then pipes Get-ChildItem into Where-Object to find files larger than a threshold, demonstrating practical filtering.",
              ],
              exerciseSteps: [ "Use the pipe operator to sort processes by memory usage.", "Filter directory contents to show only files modified today.", "Redirect the output of a command to a file." ],
              validationChecks: [ "User can chain at least two commands with a pipe.", "User demonstrates filtering with Where-Object or similar.", "User shows output redirection to a file." ],
              retention: [ "The pipe is how you compose small tools into powerful workflows.", "Where-Object is your filter. Select-Object is your lens.", "Redirect to a file when you need to save or share output." ],
              tools: ["PowerShell", "Windows Terminal"],
              notesPrompt: "Write three pipe chains you found useful. Note what each stage does.",
              exercises: [
                { id: "pipe-basics", title: "Pipe operator", prompt: "What symbol connects the output of one command to the input of the next?", placeholder: "Single character", validationMode: "exact", acceptedAnswers: ["|"], successMessage: "Correct. The pipe is the foundation of command composition.", hint: "It is a vertical bar character on your keyboard." },
                { id: "filter-command", title: "Filter results", prompt: "What PowerShell cmdlet filters objects based on a condition?", placeholder: "Cmdlet name", validationMode: "includes", acceptedAnswers: ["where-object", "where"], successMessage: "Correct. Where-Object lets you keep only what matches your criteria.", hint: "Think about WHERE you want to look in the results." },
              ],
            },
          ],
        },
        {
          id: "course-knowledge-management",
          title: "Knowledge Management with Obsidian",
          focus: "Note-taking, linked documentation, and personal reference systems",
          outcome: "Learners build a personal knowledge vault with structured notes, backlinks, and reusable references.",
          lessons: [
            {
              id: "lesson-obsidian-vault",
              title: "Build Your Engineering Vault",
              summary: "Set up an Obsidian vault structured for engineering learning, command references, and project notes.",
              duration: "35 min",
              difficulty: "Foundational",
              objective: "Create a vault with folders, note templates, and a tagging strategy that supports engineering work.",
              explanation: [
                "Engineers who retain what they learn use structured note systems. A vault in Obsidian works like a personal wiki \u2014 searchable, linked, and always growing.",
                "This lesson sets up a vault structure optimized for engineering: commands, concepts, debugging logs, project notes, and daily entries.",
              ],
              demonstration: [
                "The demo creates an Obsidian vault with folders for Commands, Concepts, Projects, and Logs.",
                "It shows how to create a note, add tags, create backlinks between notes, and use the graph view to see connections.",
              ],
              exerciseSteps: [ "Create a vault structure with at least four topic folders.", "Write a note for a command you learned today with an example and a backlink.", "Add tags to organize the note for later retrieval." ],
              validationChecks: [ "User has a vault with organized folders.", "User demonstrates backlinking between notes.", "User uses tags consistently." ],
              retention: [ "A good vault grows with you \u2014 build the habit early.", "Backlinks create a web of understanding, not just isolated notes.", "Searchability beats perfect organization." ],
              tools: ["Obsidian"],
              notesPrompt: "Design your ideal vault folder structure. List the categories that matter most for your learning.",
              exercises: [
                { id: "vault-structure", title: "Vault categories", prompt: "Name at least three folder categories you would create in an engineering knowledge vault.", placeholder: "e.g. Commands, Concepts, ...", validationMode: "includes", acceptedAnswers: ["commands", "concepts", "projects", "logs", "notes", "debugging", "references"], successMessage: "Good structure. Organized vaults make knowledge retrieval fast.", hint: "Think about the types of information an engineer needs to record." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "phase-2",
      title: "Engineering Foundations",
      strapline: "From commands to code, debugging, and version control.",
      purpose: "Transition from computer competence into repeatable software engineering workflows with real projects and debugging loops.",
      level: "Intermediate",
      duration: "8\u201310 weeks",
      environment: "Isolated project workspaces with seeded bugs, tests, and version history",
      tools: ["Visual Studio Code", "Git", "GitHub", "Node.js", "package managers"],
      guardrails: [ "Every practice repo is disposable and resettable.", "Broken states are intentional and recoverable to teach debugging.", "Validation combines command checks, code checks, and reflection." ],
      milestones: [ "Read and change code confidently", "Debug broken behavior systematically", "Use Git without fear" ],
      projects: [ "Repair a broken starter app using logs, breakpoints, and tests", "Ship a small API-backed feature through a structured Git workflow" ],
      courses: [
        {
          id: "course-software-engineering",
          title: "Practical Software Engineering",
          focus: "Code, debugging, version control, and project structure",
          outcome: "Learners can work on a real codebase, investigate failures, and make disciplined changes with version control.",
          lessons: [
            {
              id: "lesson-code-reading",
              title: "Read Code Before Writing Code",
              summary: "Build the skill of reading and understanding existing code \u2014 the most common engineering activity.",
              duration: "40 min",
              difficulty: "Core",
              objective: "Navigate an unfamiliar codebase, identify structure, trace data flow, and explain what code does before modifying it.",
              explanation: [
                "Engineers spend more time reading code than writing it. The ability to open an unfamiliar file and quickly understand its purpose, dependencies, and behavior is a core professional skill.",
                "This lesson trains systematic reading: start from the entry point, trace imports and function calls, identify data shapes, and form a mental model before touching anything.",
              ],
              demonstration: [
                "The demo opens a small project and walks through the entry point, identifies the main modules, traces a request from input to output, and annotates the key decision points.",
                "It shows how to use VS Code's Go to Definition, Find All References, and Outline view to navigate efficiently.",
              ],
              exerciseSteps: [ "Open the provided starter project in the code area.", "Identify the entry point and list the main functions.", "Trace one data path from input to output and describe it." ],
              validationChecks: [ "User identifies the entry point correctly.", "User names at least two key functions and their purposes.", "User describes a data flow path through the code." ],
              retention: [ "Read before you write \u2014 always.", "Entry point \u2192 imports \u2192 data flow \u2192 behavior.", "VS Code navigation tools are faster than scrolling." ],
              tools: ["Visual Studio Code", "terminal"],
              notesPrompt: "Describe your code reading process in three steps. Note which VS Code shortcuts helped you navigate.",
              exercises: [
                { id: "entry-point", title: "Find the entry point", prompt: "In a Node.js project, what file typically serves as the main entry point?", placeholder: "Filename", validationMode: "includes", acceptedAnswers: ["index.js", "index.ts", "server.js", "app.js", "main.js"], successMessage: "Correct. The entry point is where execution begins \u2014 always find it first.", hint: "Look at the 'main' field in package.json or common naming conventions." },
                { id: "goto-def", title: "Navigate code", prompt: "What VS Code shortcut jumps to the definition of a function or variable?", placeholder: "Key combination", validationMode: "includes", acceptedAnswers: ["f12"], successMessage: "Correct. F12 (Go to Definition) is essential for code navigation.", hint: "It is a single function key." },
              ],
            },
            {
              id: "lesson-debugging",
              title: "Debug Systems Instead of Guessing",
              summary: "Learn the habits that separate deliberate engineering from random trial-and-error.",
              duration: "50 min",
              difficulty: "Core",
              objective: "Observe symptoms, isolate causes, test hypotheses, and verify the fix with evidence.",
              explanation: [
                "Debugging is not a talent trick. It is disciplined investigation. Engineers start by observing what is actually happening rather than inventing explanations too early.",
                "This lesson trains the loop: reproduce, inspect logs and inputs, narrow the scope, form a hypothesis, test it, and confirm the result with an explicit check.",
              ],
              demonstration: [
                "The demo starts with a broken app, adds logging at the boundaries, and uses the data to eliminate wrong guesses quickly.",
                "It then shows how a fix is only complete after the original failure condition is re-tested and a regression check passes.",
              ],
              exerciseSteps: [ "Reproduce the bug exactly as reported.", "Write down one hypothesis and one piece of evidence you need.", "Choose the smallest change that can test your idea." ],
              validationChecks: [ "User can describe the reproduction step.", "User identifies evidence instead of relying on intuition alone.", "User names a verification step after the fix." ],
              retention: [ "Reproduce before changing code.", "Evidence beats confidence.", "A fix is incomplete until verified." ],
              tools: ["Visual Studio Code", "terminal", "test runner", "Git"],
              notesPrompt: "Record one debugging habit you want to adopt immediately and one anti-pattern you want to stop using.",
              exercises: [
                { id: "debug-loop", title: "First step", prompt: "What should you do before editing code when investigating a reported bug?", placeholder: "Short answer", validationMode: "includes", acceptedAnswers: ["reproduce", "observe", "confirm the bug"], successMessage: "Correct. Reproduction establishes a stable target for investigation.", hint: "Think about the first reliable move in a debugging loop." },
                { id: "verification-loop", title: "Close the loop", prompt: "After making a fix, what must you do to know the work is complete?", placeholder: "Short answer", validationMode: "includes", acceptedAnswers: ["verify", "test", "re-run", "confirm"], successMessage: "Correct. Verification is what turns a code change into an engineering result.", hint: "The answer is not \u2018commit it\u2019." },
              ],
            },
            {
              id: "lesson-project-structure",
              title: "Project Structure and Dependencies",
              summary: "Understand how projects are organized, what configuration files do, and how dependencies are managed.",
              duration: "45 min",
              difficulty: "Core",
              objective: "Navigate a project, understand package.json, manage dependencies, and reason about project configuration.",
              explanation: [
                "Every professional project has a structure: source code, configuration, dependencies, tests, and build artifacts. Understanding this structure is required before you can contribute effectively.",
                "This lesson covers package.json, node_modules, lock files, scripts, and the difference between devDependencies and dependencies.",
              ],
              demonstration: [
                "The demo opens a real project and walks through each top-level file: what it configures, who reads it, and when it matters.",
                "It shows how to install dependencies, add a new package, and understand what npm install actually does.",
              ],
              exerciseSteps: [ "Read the package.json of the practice project.", "Identify the project name, scripts, and dependencies.", "Install dependencies and run the dev script." ],
              validationChecks: [ "User can identify the purpose of package.json fields.", "User knows the difference between dependencies and devDependencies.", "User can run scripts defined in the project." ],
              retention: [ "package.json is the project\u2019s identity card.", "The lock file ensures reproducible installs.", "Read the scripts section \u2014 it tells you how to operate the project." ],
              tools: ["Visual Studio Code", "terminal", "npm"],
              notesPrompt: "List the five most important fields in package.json and what each one controls.",
              exercises: [
                { id: "npm-install", title: "Install dependencies", prompt: "What command installs all dependencies listed in package.json?", placeholder: "npm ...", validationMode: "includes", acceptedAnswers: ["npm install", "npm i"], successMessage: "Correct. npm install reads package.json and downloads everything the project needs.", hint: "It is the most common first command when cloning a project." },
              ],
            },
          ],
        },
        {
          id: "course-version-control",
          title: "Version Control with Git",
          focus: "Commits, branches, merges, and collaboration workflows",
          outcome: "Learners can use Git confidently for personal and team work, treating version control as a safety system.",
          lessons: [
            {
              id: "lesson-git-workflow",
              title: "Use Git as a Safety System",
              summary: "Treat version control as a way to reason about change, not as a scary ritual.",
              duration: "45 min",
              difficulty: "Core",
              objective: "Understand how Git protects work, explains history, and supports structured experimentation.",
              explanation: [
                "Git gives engineers a memory system for change. It helps answer what changed, why it changed, and how to return to a known good state.",
                "This lesson focuses on mental models first: working tree, staged changes, commits, branches, and the idea that small, clear changes are easier to validate and review.",
              ],
              demonstration: [
                "The demo shows a small bug fix moving from changed file to staged snapshot to meaningful commit.",
                "It then contrasts a clean commit history with a chaotic one so the learner feels the difference in maintainability.",
              ],
              exerciseSteps: [ "Inspect modified files.", "Stage only the change you intend to describe.", "Write a commit message that explains what changed and why." ],
              validationChecks: [ "User distinguishes unstaged from staged changes.", "User scopes a commit to a single coherent change.", "User writes a message that communicates intent." ],
              retention: [ "Small commits make reasoning easier.", "Version control is a safety system, not just a delivery requirement.", "Clear history compounds in value over time." ],
              tools: ["Git", "GitHub", "Visual Studio Code"],
              notesPrompt: "Write your own definition of staging, then describe what a \u2018good commit\u2019 means in practical terms.",
              exercises: [
                { id: "git-status", title: "Inspect repo state", prompt: "Enter the Git command that shows the working tree and staging status.", placeholder: "git ...", validationMode: "exact", acceptedAnswers: ["git status"], successMessage: "Correct. Inspecting state before acting is a repeated professional habit.", hint: "This is the command most engineers run constantly." },
                { id: "git-add", title: "Stage a change", prompt: "What command stages a specific file for the next commit?", placeholder: "git ...", validationMode: "includes", acceptedAnswers: ["git add"], successMessage: "Correct. Staging lets you choose exactly what goes into each commit.", hint: "You add files to the staging area." },
              ],
            },
            {
              id: "lesson-branching",
              title: "Branches and Safe Experimentation",
              summary: "Use branches to try ideas, isolate changes, and merge with confidence.",
              duration: "45 min",
              difficulty: "Core",
              objective: "Create branches, switch between them, and merge changes back into the main line.",
              explanation: [
                "Branches let you work on changes in isolation. You can experiment without affecting the main codebase, and merge only when the work is ready.",
                "This lesson covers creating branches, switching between them, understanding HEAD, and merging changes with clear intent.",
              ],
              demonstration: [
                "The demo creates a feature branch, makes a few commits, then merges it back to main with a clear merge commit.",
                "It shows what happens when two branches modify the same line and walks through a simple merge conflict resolution.",
              ],
              exerciseSteps: [ "Create a new branch for a practice feature.", "Make a small change and commit it on the feature branch.", "Switch back to main and observe that the change is not there." ],
              validationChecks: [ "User can create and name a branch.", "User demonstrates switching between branches.", "User understands that branches isolate changes." ],
              retention: [ "Branch names should describe the work, not the person.", "Branches are cheap \u2014 use them for every non-trivial change.", "Merge with intent, not with haste." ],
              tools: ["Git", "Visual Studio Code", "terminal"],
              notesPrompt: "Write the commands for creating, switching, and merging a branch. Note common mistakes to avoid.",
              exercises: [
                { id: "branch-create", title: "Create a branch", prompt: "What Git command creates a new branch and switches to it?", placeholder: "git ...", validationMode: "includes", acceptedAnswers: ["git checkout -b", "git switch -c"], successMessage: "Correct. This single command creates and positions you on the new branch.", hint: "There are two ways: one with checkout and one with switch." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "phase-3",
      title: "APIs and Service Workflows",
      strapline: "Build, test, and debug networked systems.",
      purpose: "Train learners to work with APIs, HTTP, authentication, and service communication using real tools.",
      level: "Intermediate",
      duration: "6\u20138 weeks",
      environment: "Local API servers in Docker with preconfigured endpoints and auth workflows",
      tools: ["Postman", "Insomnia", "Docker", "Node.js", "REST APIs"],
      guardrails: [ "API servers run in containers \u2014 no external network calls required.", "Auth tokens are training-only credentials.", "All data is disposable and resettable between exercises." ],
      milestones: [ "Understand HTTP methods, status codes, and headers", "Test APIs using professional tools", "Handle authentication workflows end-to-end" ],
      projects: [ "Build and test a REST API with CRUD operations", "Complete an authenticated API workflow using Postman collections" ],
      courses: [
        {
          id: "course-api-fundamentals",
          title: "API Fundamentals",
          focus: "HTTP, REST, request/response cycles, status codes, and headers",
          outcome: "Learners understand how web APIs work and can make requests using both terminal and GUI tools.",
          lessons: [
            {
              id: "lesson-http-basics",
              title: "HTTP: The Language of the Web",
              summary: "Understand HTTP methods, status codes, headers, and the request/response cycle that powers every API.",
              duration: "45 min",
              difficulty: "Core",
              objective: "Explain the HTTP request/response model and use correct methods for different operations.",
              explanation: [
                "HTTP is the protocol behind every web API. It defines how clients request resources and how servers respond. Understanding HTTP is non-negotiable for any engineer.",
                "This lesson covers the four main methods (GET, POST, PUT, DELETE), status code families (2xx, 3xx, 4xx, 5xx), and how headers carry metadata.",
              ],
              demonstration: [
                "The demo makes a GET request to a training API and inspects the status code, headers, and body.",
                "It then sends a POST request with a JSON body and shows how the server responds with a 201 Created status.",
              ],
              exerciseSteps: [ "Make a GET request to the training API and inspect the response.", "Send a POST request with a JSON body.", "Identify the status code and explain what it means." ],
              validationChecks: [ "User knows which HTTP method to use for reading vs. creating.", "User can read and interpret status codes.", "User understands the role of headers in requests." ],
              retention: [ "GET reads, POST creates, PUT updates, DELETE removes.", "2xx means success, 4xx means client error, 5xx means server error.", "Headers carry the context that the body cannot." ],
              tools: ["Postman", "terminal", "Docker"],
              notesPrompt: "Create a reference table of HTTP methods and their purposes. Add the status codes you encountered.",
              exercises: [
                { id: "http-get", title: "Read operation", prompt: "Which HTTP method is used to retrieve a resource without modifying it?", placeholder: "Method name", validationMode: "exact", acceptedAnswers: ["get", "GET"], successMessage: "Correct. GET is for reading \u2014 it should never cause side effects.", hint: "It is the default method when you open a URL in a browser." },
                { id: "status-404", title: "Not found", prompt: "What HTTP status code means the requested resource was not found?", placeholder: "Number", validationMode: "exact", acceptedAnswers: ["404"], successMessage: "Correct. 404 tells the client the resource does not exist at that URL.", hint: "This is probably the most famous status code on the internet." },
              ],
            },
            {
              id: "lesson-postman-basics",
              title: "Professional API Testing with Postman",
              summary: "Use Postman to build, organize, and automate API requests like a professional.",
              duration: "50 min",
              difficulty: "Core",
              objective: "Create collections, use environment variables, send authenticated requests, and run collection tests.",
              explanation: [
                "Postman is the industry standard for API exploration and testing. It goes far beyond making single requests \u2014 it organizes entire API workflows into reusable collections.",
                "This lesson covers creating requests, using variables for dynamic values, setting up authentication, and running automated test scripts.",
              ],
              demonstration: [
                "The demo creates a Postman collection with GET and POST requests, adds environment variables for the base URL, and sets up bearer token authentication.",
                "It then runs a collection test that verifies the API returns expected data.",
              ],
              exerciseSteps: [ "Create a new Postman collection for the training API.", "Add a GET request with a variable for the base URL.", "Add a POST request with a JSON body and test the response." ],
              validationChecks: [ "User creates an organized collection.", "User uses environment variables instead of hardcoded URLs.", "User can write a basic test assertion." ],
              retention: [ "Collections organize work \u2014 loose requests create chaos.", "Environment variables make collections portable.", "Test scripts turn manual checks into automated verification." ],
              tools: ["Postman", "Docker"],
              notesPrompt: "Document the steps to create a Postman collection from scratch. Note how variables make it flexible.",
              exercises: [
                { id: "postman-env-var", title: "Environment variables", prompt: "In Postman, how do you reference an environment variable in a URL? Use double curly braces syntax.", placeholder: "{{...}}", validationMode: "includes", acceptedAnswers: ["{{", "}}"], successMessage: "Correct. {{variable_name}} is how Postman injects dynamic values.", hint: "Variables are wrapped in a special syntax using curly braces." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "phase-4",
      title: "Containers and Deployment",
      strapline: "Ship and operate software with professional tooling.",
      purpose: "Train learners to containerize applications, understand deployment concepts, and operate development environments with Docker.",
      level: "Intermediate to advanced",
      duration: "6\u20138 weeks",
      environment: "Containerized lab environments with build pipelines and deployment simulations",
      tools: ["Docker", "Docker Compose", "GitHub Actions", "terminal"],
      guardrails: [ "Containers isolate all experiments from the host machine.", "Build failures are learning opportunities, not emergencies.", "Deployment simulations run locally \u2014 no cloud accounts needed." ],
      milestones: [ "Build and run a Docker container from scratch", "Compose multi-service applications", "Understand CI/CD pipeline concepts" ],
      projects: [ "Containerize a full-stack application with a Dockerfile and docker-compose.yml", "Set up a basic GitHub Actions workflow for automated testing" ],
      courses: [
        {
          id: "course-docker-fundamentals",
          title: "Docker Fundamentals",
          focus: "Images, containers, Dockerfiles, volumes, and compose",
          outcome: "Learners can build, run, and debug containerized applications confidently.",
          lessons: [
            {
              id: "lesson-docker-basics",
              title: "Containers: Isolated Environments on Demand",
              summary: "Understand what containers are, why they matter, and how to run your first one.",
              duration: "45 min",
              difficulty: "Core",
              objective: "Run a container, inspect its state, and understand the difference between images and containers.",
              explanation: [
                "A container is a lightweight, isolated environment that runs a process with its own filesystem, network, and dependencies. It solves the \u2018works on my machine\u2019 problem.",
                "This lesson introduces images (the blueprints), containers (the running instances), and the Docker CLI commands to manage them.",
              ],
              demonstration: [ "The demo pulls an image, runs a container, lists running containers, inspects logs, and stops the container.", "It shows how containers are ephemeral \u2014 when stopped, their state can be discarded or preserved with volumes." ],
              exerciseSteps: [ "Pull the training image and run it as a container.", "List running containers and identify yours.", "Stop the container and verify it is no longer running." ],
              validationChecks: [ "User can pull and run a container.", "User can list and identify running containers.", "User understands the container lifecycle." ],
              retention: [ "Images are blueprints. Containers are running instances.", "Containers are ephemeral by default \u2014 data disappears when they stop.", "docker ps shows what is running. docker ps -a shows everything." ],
              tools: ["Docker", "terminal"],
              notesPrompt: "Write the five Docker commands you consider essential. Explain what each does in one sentence.",
              exercises: [
                { id: "docker-run", title: "Run a container", prompt: "What Docker command runs a new container from an image?", placeholder: "docker ...", validationMode: "includes", acceptedAnswers: ["docker run"], successMessage: "Correct. docker run creates and starts a container from the specified image.", hint: "The command name literally describes what it does." },
                { id: "docker-ps", title: "List containers", prompt: "What command shows currently running Docker containers?", placeholder: "docker ...", validationMode: "includes", acceptedAnswers: ["docker ps"], successMessage: "Correct. docker ps is the first thing you check when debugging container issues.", hint: "ps stands for process status \u2014 a Linux convention." },
              ],
            },
            {
              id: "lesson-dockerfile",
              title: "Write a Dockerfile",
              summary: "Create a Dockerfile that builds a custom image for your application.",
              duration: "50 min",
              difficulty: "Core",
              objective: "Write a multi-stage Dockerfile with proper layering, caching, and security considerations.",
              explanation: [
                "A Dockerfile is a recipe for building an image. Each instruction creates a layer, and the order matters for build speed and cache efficiency.",
                "This lesson covers FROM, COPY, RUN, EXPOSE, and CMD \u2014 the core instructions \u2014 plus best practices like minimizing layers and running as non-root.",
              ],
              demonstration: [ "The demo writes a Dockerfile for a Node.js app, explaining each instruction and why the order matters for caching.", "It builds the image, runs it, and then modifies source code to show that only changed layers rebuild." ],
              exerciseSteps: [ "Write a Dockerfile for the practice project.", "Build the image and tag it with a meaningful name.", "Run the built image and verify the app works." ],
              validationChecks: [ "Dockerfile starts with an appropriate base image.", "COPY and RUN are ordered for optimal caching.", "The container runs successfully and serves the expected output." ],
              retention: [ "Order matters \u2014 put rarely changing instructions first.", "Use .dockerignore to keep images clean.", "Run as non-root in production images." ],
              tools: ["Docker", "Visual Studio Code", "terminal"],
              notesPrompt: "Write a Dockerfile template you can reuse. Annotate each line with its purpose.",
              exercises: [
                { id: "dockerfile-from", title: "Base image", prompt: "What Dockerfile instruction specifies the base image?", placeholder: "Instruction name", validationMode: "exact", acceptedAnswers: ["FROM", "from"], successMessage: "Correct. FROM is always the first instruction in a Dockerfile.", hint: "Every Docker image is built FROM another image." },
              ],
            },
          ],
        },
      ],
    },
    {
      id: "phase-5",
      title: "AI-Assisted Engineering",
      strapline: "Accelerate work without surrendering judgment.",
      purpose: "Train learners to use AI as a force multiplier while maintaining accountability, verification, and system understanding.",
      level: "Advanced",
      duration: "4\u20136 weeks",
      environment: "AI interaction logs with verification checkpoints and review tasks",
      tools: ["AI coding assistants", "tests", "linters", "terminal", "editor diagnostics"],
      guardrails: [ "AI suggestions are always paired with verification tasks.", "Learners must explain AI output before accepting it.", "Over-reliance on AI is flagged through reflection exercises." ],
      milestones: [ "Write effective engineering prompts", "Verify AI-generated code systematically", "Know when AI helps and when it misleads" ],
      projects: [ "Run an AI-assisted refactor with verification checkpoints and review notes", "Build a feature using AI assistance with documented decision log" ],
      courses: [
        {
          id: "course-ai-engineering",
          title: "AI in Real Engineering Work",
          focus: "Planning, implementation, review, and verification with AI assistance",
          outcome: "Learners can use AI to accelerate work while preserving correctness, clarity, and system understanding.",
          lessons: [
            {
              id: "lesson-ai-prompting",
              title: "Write Prompts Like an Engineer",
              summary: "Learn to give AI clear, constrained, context-rich instructions.",
              duration: "40 min",
              difficulty: "Advanced",
              objective: "Write engineering prompts that specify constraints, context, expected output format, and verification criteria.",
              explanation: [
                "The quality of AI output is directly proportional to the quality of the input. Vague prompts produce vague results. Precise engineering prompts produce actionable output.",
                "This lesson teaches the structure of an effective prompt: task definition, constraints, context, expected format, and what to do if uncertain.",
              ],
              demonstration: [
                "The demo compares a vague prompt (\u2018write a function\u2019) with a precise one (\u2018write a TypeScript function that validates email format, returns boolean, handles edge cases for empty strings and missing @ symbol\u2019).",
                "It shows how the precise prompt produces code that is closer to production-ready on the first attempt.",
              ],
              exerciseSteps: [ "Read the vague prompt and identify what is missing.", "Rewrite it as a precise engineering prompt with constraints.", "Explain how your improved prompt would produce better output." ],
              validationChecks: [ "User identifies missing context in vague prompts.", "User adds specific constraints and expected output format.", "User includes verification criteria in the prompt." ],
              retention: [ "Better prompts come from better engineering thinking.", "Always specify language, constraints, and edge cases.", "If the prompt does not mention how to verify, add that." ],
              tools: ["AI coding assistant", "Visual Studio Code"],
              notesPrompt: "Write a template for engineering prompts. Include sections for task, constraints, context, and verification.",
              exercises: [
                { id: "prompt-improve", title: "Improve the prompt", prompt: "A developer says \u2018write a function to sort data.\u2019 Name one critical missing constraint.", placeholder: "Short answer", validationMode: "includes", acceptedAnswers: ["type", "language", "order", "input", "format", "ascending", "descending", "what kind"], successMessage: "Correct. Without specifying the data type, language, or sort order, the AI is guessing.", hint: "Think about what you would need to know before writing the function yourself." },
              ],
            },
            {
              id: "lesson-ai-verification",
              title: "Verify AI Output Like a Professional",
              summary: "Learn where AI helps, where it misleads, and how to wrap its output in professional verification.",
              duration: "55 min",
              difficulty: "Advanced",
              objective: "Apply AI to planning, coding, refactoring, and debugging while maintaining clear accountability for correctness.",
              explanation: [
                "AI is useful because it compresses draft generation, recall, and iteration. It is dangerous because it can sound convincing while being wrong, incomplete, or mismatched to the actual codebase.",
                "This lesson treats AI as a collaborator that must be directed, constrained, and verified. The learner stays responsible for the plan, the evidence, and the final result.",
              ],
              demonstration: [
                "The guided demo compares a vague prompt with a precise engineering prompt and shows the difference in output quality.",
                "It then walks through validating AI-generated code using tests, manual inspection, and environment-specific checks before acceptance.",
              ],
              exerciseSteps: [ "Define the task, constraints, and expected output before asking AI for help.", "Review the result for correctness, assumptions, and missing context.", "Run an explicit verification loop with tests or reproduction steps." ],
              validationChecks: [ "User names at least one useful AI use case and one major limitation.", "User describes how they would verify generated code.", "User explains why AI should not replace system understanding." ],
              retention: [ "AI speeds work; it does not remove accountability.", "Verification is mandatory, not optional.", "Better prompts come from better engineering thinking." ],
              tools: ["AI coding assistant", "tests", "linters", "terminal", "editor diagnostics"],
              notesPrompt: "Write your personal AI operating rules for software engineering work. Keep them strict enough to prevent lazy trust.",
              exercises: [
                { id: "ai-rule", title: "State the rule", prompt: "Complete this idea in your own words: AI output must always be...", placeholder: "Short answer", validationMode: "includes", acceptedAnswers: ["verified", "checked", "tested", "reviewed"], successMessage: "Correct. AI is a drafting and acceleration tool, not a substitute for validation.", hint: "Think about the minimum professional standard before shipping AI-assisted work." },
                { id: "ai-limitation", title: "Know the limits", prompt: "Name one thing AI coding assistants commonly get wrong.", placeholder: "Short answer", validationMode: "includes", acceptedAnswers: ["context", "hallucinate", "outdated", "wrong", "stale", "assumptions", "dependencies", "version"], successMessage: "Correct. Awareness of limitations is what separates productive AI use from dangerous AI use.", hint: "Think about what AI does not have access to when generating code." },
              ],
            },
          ],
        },
      ],
    },
  ],
};
