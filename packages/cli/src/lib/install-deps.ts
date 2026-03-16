import { spawn } from "node:child_process";
import { buildInstallCommand } from "./detect-pm.js";
import type { PackageManager } from "./detect-pm.js";

export async function installDeps(
  pm: PackageManager,
  deps: string[],
  cwd: string,
  dev = false,
): Promise<void> {
  if (deps.length === 0) return;

  const [cmd, ...args] = buildInstallCommand(pm, deps, dev);
  if (!cmd) return;

  return new Promise((resolve, reject) => {
    const child = spawn(cmd, args, { cwd, stdio: "pipe" });
    child.on("close", (code) => {
      if (code === 0) resolve();
      else reject(new Error(`${cmd} exited with code ${code}`));
    });
    child.on("error", reject);
  });
}
