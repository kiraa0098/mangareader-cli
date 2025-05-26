import { clearTerminal } from "../utils/clear_terminal";
import inquirer from "inquirer";
import { searchMangaAPI } from "../api/search_manga";

const COLUMNS = 3;
const DELAY_MS = 3000;

function displayMangaInColumns(mangas: any[], columns: number): void {
  const maxLengths: number[] = [];

  for (let col = 0; col < columns; col++) {
    let maxLength = 0;
    for (let i = col; i < mangas.length; i += columns) {
      const title = mangas[i].title.en || Object.values(mangas[i].title)[0];
      const label = `[${i + 1}] ${title}`;
      maxLength = Math.max(maxLength, label.length);
    }
    maxLengths.push(maxLength);
  }

  const rows = Math.ceil(mangas.length / columns);
  for (let row = 0; row < rows; row++) {
    let line = "";
    for (let col = 0; col < columns; col++) {
      const index = row + col * rows;
      if (index < mangas.length) {
        const manga = mangas[index];
        const title = manga.title.en || Object.values(manga.title)[0];
        const label = `[${index + 1}] ${title}`;
        line += label.padEnd(maxLengths[col] + 2);
      }
    }
    console.log(line);
  }
}

export async function searchManga(defaultQuery: string): Promise<void> {
  clearTerminal();

  const { query } = await inquirer.prompt([
    {
      type: "input",
      name: "query",
      message: "Search Manga [>]:",
      default: defaultQuery,
    },
  ]);

  let page = 1;

  while (true) {
    clearTerminal();
    console.log(`Search: ${query} — Page ${page}\n`);

    const { mangas } = await searchMangaAPI(query, page);

    if (!mangas.length) {
      console.log("⚠ No results found on this page.");
      if (page > 1) {
        page--;
        console.log("🔄 Returning to previous page...");
        await new Promise((r) => setTimeout(r, DELAY_MS));
        continue;
      } else {
        console.log("❌ Exiting: No results found.");
        break;
      }
    }

    displayMangaInColumns(mangas, COLUMNS);
    console.log(`\nType a number to select, or "next", "back", or "exit"`);

    const { input } = await inquirer.prompt([
      {
        type: "input",
        name: "input",
        message: "[select manga >]",
        validate: (val) => {
          const lower = val.toLowerCase();
          if (["next", "back", "exit"].includes(lower)) return true;
          const num = parseInt(val);
          if (!isNaN(num) && num >= 1 && num <= mangas.length) return true;
          return `Enter a number (1-${mangas.length}) or "next", "back", or "exit"`;
        },
      },
    ]);

    const command = input.toLowerCase();

    if (command === "next") {
      page++;
    } else if (command === "back") {
      if (page > 1) {
        page--;
      } else {
        clearTerminal();
        console.log("⚠ Already at the first page.");
        console.log("🔄 Staying on current page...");
        await new Promise((r) => setTimeout(r, DELAY_MS));
      }
    } else if (command === "exit") {
      break;
    } else {
      const index = parseInt(input) - 1;
      const selected = mangas[index];
      const title = selected.title.en || Object.values(selected.title)[0];

      clearTerminal();
      console.log(`\n✅ You selected: [${index + 1}] ${title}`);
      // TODO: Add chapter loading or manga details view
      break;
    }
  }
}
