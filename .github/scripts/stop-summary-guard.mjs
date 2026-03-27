import { execSync } from "node:child_process";

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

const branch = run("git branch --show-current");
const status = run("git status --short");
const aheadBehind = run("git rev-list --left-right --count @{upstream}...HEAD");

let ahead = 0;
let aheadBehindText = "upstream unavailable";
if (aheadBehind !== "unavailable") {
  const parts = aheadBehind.split(/\s+/);
  ahead = parseInt(parts[1] ?? "0", 10);
  aheadBehindText = `ahead ${ahead}, behind ${parts[0] ?? "0"}`;
}

const dirtyFiles =
  status === "" || status === "unavailable"
    ? []
    : status.split("\n").filter(Boolean);
const dirtyCount = dirtyFiles.length;

// Block if uncommitted changes exist — agent must verify and commit before stopping.
if (dirtyCount > 0) {
  process.stderr.write(
    `\nStop blocked: ${dirtyCount} uncommitted change(s) on branch ${branch}.\n` +
      `Run \`npm run verify\`, then stage and commit all changes before this session ends.\n` +
      `Files:\n${dirtyFiles.join("\n")}\n`,
  );
  process.exit(2);
}

// Block if verified commits have not been pushed yet.
if (ahead > 0) {
  process.stderr.write(
    `\nStop blocked: branch ${branch} is ${ahead} commit(s) ahead of the remote.\n` +
      `Run \`git push\` to sync the remote branch before this session ends.\n`,
  );
  process.exit(2);
}

// All clear — emit informational context and allow stop.
process.stdout.write(
  JSON.stringify({
    continue: true,
    systemMessage: [
      `Session stop check passed for branch ${branch}.`,
      `Working tree: clean.`,
      `Remote sync: ${aheadBehindText}.`,
      "Repository is in a clean and pushed state.",
    ].join("\n"),
  }),
);
