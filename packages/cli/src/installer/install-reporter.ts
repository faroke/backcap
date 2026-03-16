import * as clack from "@clack/prompts";
import type { InstallResult } from "./selective-installer.js";

export function reportInstallResult(result: InstallResult): void {
  const sections: string[] = [];

  if (result.installed.length > 0) {
    sections.push(
      `Installed (${result.installed.length}):\n${result.installed.map((f) => `  + ${f}`).join("\n")}`,
    );
  }

  if (result.alwaysInstalled.length > 0) {
    sections.push(
      `Always installed (${result.alwaysInstalled.length}):\n${result.alwaysInstalled.map((f) => `  * ${f}`).join("\n")}`,
    );
  }

  if (result.skipped.length > 0) {
    sections.push(
      `Skipped (${result.skipped.length}):\n${result.skipped.map((f) => `  - ${f}`).join("\n")}`,
    );
  }

  clack.note(sections.join("\n\n"), "Install Summary");

  const totalWritten = result.installed.length + result.alwaysInstalled.length;
  clack.outro(`${totalWritten} files installed, ${result.skipped.length} skipped`);
}
