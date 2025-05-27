"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.clearTerminal = clearTerminal;
// src/utils/clear_terminal.ts
const child_process_1 = require("child_process");
/** Clears the terminal screen reliably across platforms */
function clearTerminal() {
    try {
        (0, child_process_1.execSync)(process.platform === "win32" ? "cls" : "clear", {
            stdio: "inherit",
        });
    }
    catch (_a) {
        console.clear();
    }
}
