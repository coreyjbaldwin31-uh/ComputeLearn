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

let aheadBehindText = "upstream unavailable";
if (aheadBehind !== "unavailable") {
  const [behind, ahead] = aheadBehind.split(/\s+/);
  aheadBehindText = `ahead ${ahead ?? "0"}, behind ${behind ?? "0"}`;
}

const dirtyCount = status === "" || status === "unavailable" ? 0 : status.split("\n").length;

process.stdout.write(
  JSON.stringify({
    continue: true,
    systemMessage: [
      `Session stop check for branch ${branch}.`,
      `Working tree changes: ${dirtyCount}.`,
      `Remote sync: ${aheadBehindText}.`,
      "Before ending, ensure you summarized the work, ran relevant validation, and if autonomous repo updates were requested, committed and pushed verified changes.",
    ].join("\n"),
  }),
);
