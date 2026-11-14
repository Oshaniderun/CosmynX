import { spawn, spawnSync } from "node:child_process";
import fs from "node:fs";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, "..");
const backendDir = path.join(rootDir, "backend");
const frontendDir = path.join(rootDir, "frontend");
const isWin = process.platform === "win32";

function resolvePython() {
  const candidates = isWin
    ? [path.join(backendDir, ".venv", "Scripts", "python.exe")]
    : [path.join(backendDir, ".venv", "bin", "python")];

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) {
      return candidate;
    }
  }
  return isWin ? "python" : "python3";
}

function pipePrefixed(stream, target, label) {
  let buffer = "";
  stream.on("data", (chunk) => {
    buffer += chunk.toString();
    const lines = buffer.split(/\r?\n/);
    buffer = lines.pop() ?? "";
    for (const line of lines) {
      target.write(`${label} ${line}\n`);
    }
  });
  stream.on("end", () => {
    if (buffer.length > 0) {
      target.write(`${label} ${buffer}\n`);
      buffer = "";
    }
  });
}

function killTree(child) {
  if (!child || child.killed || child.exitCode !== null) return;
  if (isWin && child.pid) {
    spawnSync("taskkill", ["/pid", String(child.pid), "/T", "/F"], {
      stdio: "ignore",
    });
  } else {
    child.kill("SIGTERM");
  }
}

const useColor = process.stdout.isTTY;
const backendLabel = useColor ? "\x1b[36m[backend]\x1b[0m" : "[backend]";
const frontendLabel = useColor ? "\x1b[35m[frontend]\x1b[0m" : "[frontend]";

const pythonBin = resolvePython();
console.log(`Starting backend (${pythonBin}) and frontend (vite)...`);

const backend = spawn(
  pythonBin,
  ["-m", "uvicorn", "app.main:app", "--reload", "--port", "8000"],
  {
    cwd: backendDir,
    stdio: ["ignore", "pipe", "pipe"],
  }
);

const frontend = spawn("npm", ["run", "dev"], {
  cwd: frontendDir,
  shell: isWin,
  stdio: ["ignore", "pipe", "pipe"],
});

pipePrefixed(backend.stdout, process.stdout, backendLabel);
pipePrefixed(backend.stderr, process.stderr, backendLabel);
pipePrefixed(frontend.stdout, process.stdout, frontendLabel);
pipePrefixed(frontend.stderr, process.stderr, frontendLabel);

let shuttingDown = false;
function shutdown(code = 0) {
  if (shuttingDown) return;
  shuttingDown = true;
  killTree(backend);
  killTree(frontend);
  process.exit(code);
}

process.on("SIGINT", () => shutdown(0));
process.on("SIGTERM", () => shutdown(0));

backend.on("exit", (code) => {
  if (!shuttingDown) {
    console.error(`[backend] exited with code ${code ?? 1}`);
    shutdown(code ?? 1);
  }
});

frontend.on("exit", (code) => {
  if (!shuttingDown) {
    console.error(`[frontend] exited with code ${code ?? 1}`);
    shutdown(code ?? 1);
  }
});
