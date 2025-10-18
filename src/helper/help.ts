import chalk from 'chalk';
import { clearTerminal } from './clear_terminal';

export function displayHelp() {
  clearTerminal();
  console.log(chalk.bold.yellow('\n--- How to Use Manga-CLI ---\n'));
  console.log(chalk.cyan('1. Search for a Manga:'));
  console.log('   - Start the CLI and type your search query.');
  console.log('   - A list of manga will appear.\n');

  console.log(chalk.cyan('2. Navigate Lists:'));
  console.log('   - Use the arrow keys (↑/↓) to highlight an option.');
  console.log('   - Press Enter to select a manga, chapter, or action (like Next Page, Exit, etc.).\n');

  console.log(chalk.cyan('3. Reading Chapters:'));
  console.log('   - After selecting a manga, choose "View Chapters".');
  console.log('   - Select a chapter to open it in your default web browser.');
  console.log('   - After reading, you can choose to read the next/previous chapter or return to the list.\n');

  console.log(chalk.gray('----------------------------------------\n'));
}
