import inquirer from "inquirer";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import open from "open";
import { clearTerminal } from "../helper/clear_terminal";
import { searchMangaAPI } from "../api/search_manga";
import { fetchChaptersByMangaId } from "../api/manga_chapters";
import { displayManga } from "../helper/display_manga";
import { displayChapters } from "../helper/display_chapters";
import { fetchChapterPages } from "../api/chapter_pages";
import { generateHtmlViewer } from "../helper/generate_html_viewerl";

const COLUMNS = 3;
const DELAY_MS = 3000;

async function handleChapterSelection(
  mangaId: string,
  mangaTitle: string
): Promise<{ shouldReturnToManga: boolean }> {
  let chapterPage = 1;

  while (true) {
    clearTerminal();
    console.log(`Selected Manga: ${mangaTitle} — Page ${chapterPage}\n`);
    const chapters = await fetchChaptersByMangaId(mangaId, chapterPage);

    if (!chapters.length) {
      console.log("⚠ No chapters found on this page.");
      if (chapterPage > 1) {
        chapterPage--;
        console.log("🔄 Returning to previous page...");
        await new Promise((r) => setTimeout(r, DELAY_MS));
        continue;
      } else {
        console.log("❌ No chapters available.");
        await new Promise((r) => setTimeout(r, DELAY_MS));
        return { shouldReturnToManga: true };
      }
    }

    console.log(`\nAvailable Chapters:\n`);
    displayChapters(chapters, COLUMNS);

    console.log(
      `\nType a number to select chapter, or "next", "back", or "exit"`
    );
    const { chapterInput } = await inquirer.prompt([
      {
        type: "input",
        name: "chapterInput",
        message: "[select chapter >]",
        validate: (val) => {
          const lower = val.toLowerCase();
          if (["next", "back", "exit"].includes(lower)) return true;
          const num = parseInt(val);
          if (!isNaN(num) && num >= 1 && num <= chapters.length) return true;
          return `Enter a number (1-${chapters.length}) or "next", "back", or "exit"`;
        },
      },
    ]);

    const command = chapterInput.toLowerCase();

    if (command === "next") {
      chapterPage++;
    } else if (command === "back") {
      if (chapterPage > 1) {
        chapterPage--;
      } else {
        return { shouldReturnToManga: true }; // Go back to manga list
      }
    } else if (command === "exit") {
      process.exit(0); // Exit completely
    } else {
      const chapterIndex = parseInt(chapterInput) - 1;
      const selectedChapter = chapters[chapterIndex];
      console.log(
        `\nSelected Chapter: Ch. ${selectedChapter.chapter} - ${selectedChapter.title}`
      );
      const pages = await fetchChapterPages(selectedChapter.id);

      const htmlFile = await generateHtmlViewer(
        pages.map((page) => page.url),
        `Chapter ${selectedChapter.chapter} – ${selectedChapter.title}`
      );

      await open(htmlFile);

      // Here you would handle the chapter selection
      return { shouldReturnToManga: false };
    }
  }
}

async function handleMangaSelection(query: string): Promise<void> {
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
        return;
      }
    }

    displayManga(mangas, COLUMNS);
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
      return;
    } else {
      const index = parseInt(input) - 1;
      const selected = mangas[index];
      const title = selected.title.en || Object.values(selected.title)[0];

      const { shouldReturnToManga } = await handleChapterSelection(
        selected.id,
        title
      );
      if (!shouldReturnToManga) {
        return; // Exit if we selected a chapter
      }
      // Otherwise continue manga selection loop
    }
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

  await handleMangaSelection(query);
}
