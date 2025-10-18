"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayWelcomeMessage = displayWelcomeMessage;
const chalk_1 = __importDefault(require("chalk"));
const clear_terminal_1 = require("./clear_terminal");
function displayWelcomeMessage() {
    (0, clear_terminal_1.clearTerminal)();
    console.log(chalk_1.default.bold.magenta(`
   manga-cli`));
    console.log(chalk_1.default.gray(`  A command-line manga reader powered by MangaDex
`));
}
