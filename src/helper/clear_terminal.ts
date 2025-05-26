// src/utils/clear_terminal.ts
import { execSync } from "child_process";

/** Clears the terminal screen reliably across platforms */
export function clearTerminal(): void {
  try {
    execSync(process.platform === "win32" ? "cls" : "clear", {
      stdio: "inherit",
    });
  } catch {
    console.clear();
  }
}
