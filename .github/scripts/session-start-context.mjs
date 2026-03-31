import { execSync } from "node:child_process";
import { readFileSync } from "node:fs";

const readStdin = async () =>
  new Promise((resolve) => {
    if (process.stdin.isTTY) {
      resolve();
      return;
    }

    process.stdin.on("data", () => {
      // Consume stdin if the hook runtime sends input JSON.
    });
    process.stdin.on("end", resolve);
  });

const run = (command) => {
  try {
    return execSync(command, {
      encoding: "utf8",
      stdio: ["ignore", "pipe", "ignore"],
      windowsHide: true,
    }).trim();
  } catch {
    return "unavailable";
  }
};

await readStdin();

let packageScripts = [];
try {
  const packageJson = JSON.parse(readFileSync("package.json", "utf8"));
  packageScripts = Object.keys(packageJson.scripts ?? {});
} catch {
  packageScripts = [];
}

const branch = run("git branch --show-current");
const remote = run("git config --get remote.origin.url");
const changedFiles = run("git status --short");
const dockerVersion = run("docker --version");
const dockerCompose = run("docker compose version");
const newmanVersion = run("newman --version");
const postmanVersion = run("postman --version");
const npmVersion = run("npm --version");
const nodeVersion = run("node --version");

// PR context
const prNumber = run("gh pr view --json number -q .number");
const prTitle = run("gh pr view --json title -q .title");

// Recent commits
const recentCommits = run("git log -3 --oneline");

// Quick test and lint check
const lintErrors = run("npm run lint 2>&1 | grep -c 'error'");
const testRun = run("npm run test 2>&1 | grep -E '(passed|failed)'");

const lines = [
  "Autonomy context loaded for this repository.",
  `Branch: ${branch}`,
  prNumber !== "unavailable"
    ? `Active PR: #${prNumber} — ${prTitle}`
    : "Active PR: none detected",
  `Remote: ${remote}`,
  `Changed files: ${changedFiles === "" || changedFiles === "unavailable" ? "clean or unavailable" : changedFiles.split("\n").length}`,
  "",
  "Recent commits:",
  recentCommits || "(none)",
  "",
  "Environment:",
  `Node: ${nodeVersion}`,
  `npm: ${npmVersion}`,
  `Docker: ${dockerVersion}`,
  `Docker Compose: ${dockerCompose}`,
  `Newman: ${newmanVersion}`,
  `Postman CLI: ${postmanVersion}`,
  "",
  "Available scripts:",
  packageScripts.join(", ") || "none detected",
  "",
  "Quick checks:",
  `Lint errors: ${lintErrors === "unavailable" || lintErrors === "0" ? "clean" : `${lintErrors} found`}`,
  `Tests: ${testRun || "status unavailable"}`,
  "",
  "When autonomous delivery is requested, prefer verified increments, then commit and push them so the remote branch stays current.",
];

process.stdout.write(
  JSON.stringify({
    continue: true,
    systemMessage: lines.join("\n"),
  }),
);
