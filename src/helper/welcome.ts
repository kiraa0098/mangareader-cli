import chalk from 'chalk';
import { clearTerminal } from './clear_terminal';

export function displayWelcomeMessage() {
  clearTerminal();
  console.log(chalk.bold.magenta(`
   manga-cli`));
  console.log(chalk.gray(`  A command-line manga reader powered by MangaDex
`));
}
