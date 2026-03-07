import { run, EXIT_CODES } from "./commands.js";

const [command, ...rest] = process.argv.slice(2);

if (!command || !["export", "copy", "download"].includes(command)) {
  console.error("Usage: atlas-cli <export|copy|download> [--host 127.0.0.1] [--port 9222] [--target id]");
  process.exit(EXIT_CODES.BAD_ARGS);
}

run(command, rest);
