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

const lines = [
  "Autonomy context loaded for this repository.",
  `Branch: ${branch}`,
  `Remote: ${remote}`,
  `Changed files: ${changedFiles === "" || changedFiles === "unavailable" ? "clean or unavailable" : changedFiles.split("\n").length}`,
  `Node: ${nodeVersion}`,
  `npm: ${npmVersion}`,
  `Docker: ${dockerVersion}`,
  `Docker Compose: ${dockerCompose}`,
  `Newman: ${newmanVersion}`,
  `Postman CLI: ${postmanVersion}`,
  `Package scripts: ${packageScripts.join(", ") || "none detected"}`,
  "When autonomous delivery is requested, prefer verified increments, then commit and push them so the remote branch stays current.",
];

process.stdout.write(
  JSON.stringify({
    continue: true,
    systemMessage: lines.join("\n"),
  }),
);
