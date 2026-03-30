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

const DANGEROUS_COMMANDS = [
  /git\s+push\s+.*--force/i,
  /git\s+reset\s+.*--hard/i,
  /git\s+clean\s+-fd/i,
  /rm\s+-rf/i,
  /^del\s+\//i,
];

await readStdin();

// Read the hook input to extract the tool call details
let toolCall = "";
try {
  const input = await (async () => {
    let data = "";
    for await (const chunk of process.stdin) {
      data += chunk;
    }
    return data;
  })();
  if (input) {
    try {
      const json = JSON.parse(input);
      toolCall = json.toolCall?.command || json.toolName || "";
    } catch {
      toolCall = input;
    }
  }
} catch {
  // stdin not available in this hook context
}

// Check if the command is dangerous
const isDangerous = DANGEROUS_COMMANDS.some((pattern) =>
  pattern.test(toolCall),
);

if (isDangerous) {
  process.stderr.write(
    `\n⚠ DANGEROUS OPERATION DETECTED: ${toolCall}\n` +
      `This command cannot be executed without explicit confirmation.\n` +
      `Dangerous commands: git push --force, git reset --hard, git clean -fd, rm -rf, del /\n` +
      `If you are certain this is intentional, use: git <options> or manually run the command in the terminal.\n`,
  );
  process.exit(1);
}

// Allow the operation
process.stdout.write(
  JSON.stringify({
    continue: true,
  }),
);
