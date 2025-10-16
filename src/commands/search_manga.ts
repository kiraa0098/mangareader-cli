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
import { displayMangaDetails } from "../helper/display_manga_details";
import chalk from "chalk";
import ora from "ora";

const COLUMNS = 3;
const DELAY_MS = 3000;

async function handleChapterViewing(
  chapterId: string,
  chapterTitle: string,
  chapterNumber: string
): Promise<void> {
  const spinner = ora(`Loading Chapter ${chapterNumber} - ${chapterTitle}...`).start();
  try {
    const pages = await fetchChapterPages(chapterId);
    spinner.succeed();

    if (!pages || !pages.length) {
      console.log("❌ No pages found for this chapter.");
      await new Promise((r) => setTimeout(r, DELAY_MS));
      return;
    }

    const htmlFile = await generateHtmlViewer(
      pages.map((page) => page.url),
      `Chapter ${chapterNumber} – ${chapterTitle}`
    );

    await open(htmlFile);

    console.log("\nChapter opened in browser!");
    console.log("Returning to chapter selection in 3 seconds...");
    await new Promise((r) => setTimeout(r, DELAY_MS));
  } catch (error) {
    spinner.fail();
    console.log(
      `❌ Error loading chapter: ${
        error instanceof Error ? error.message : "Unknown error"
      }`
    );
    console.log("🔄 Returning to chapter selection...");
    await new Promise((r) => setTimeout(r, DELAY_MS));
    return;
  }
}

async function handleChapterSelection(
  mangaId: string,
  mangaTitle: string
): Promise<{ shouldReturnToManga: boolean }> {
  let chapterPage = 1;

  while (true) {
    const spinner = ora(`Fetching chapters for ${mangaTitle}...`).start();
    try {
      const chapters = await fetchChaptersByMangaId(mangaId, chapterPage);
      spinner.succeed();
      clearTerminal();
      console.log(`Selected Manga: ${mangaTitle} — Page ${chapterPage}\n`);

      if (!chapters || !chapters.length) {
        console.log("⚠ No chapters found on this page.");
        if (chapterPage > 1) {
          chapterPage--;
          console.log("🔄 Returning to previous page...");
          await new Promise((r) => setTimeout(r, DELAY_MS));
          continue;
        } else {
          console.log("❌ No chapters available for this manga.");
          console.log("🔄 Returning to manga selection...");
          await new Promise((r) => setTimeout(r, DELAY_MS));
          return { shouldReturnToManga: true };
        }
      }

      console.log(`\nAvailable Chapters:\n`);
      displayChapters(chapters, COLUMNS);

      console.log(
        `\nType a number to select chapter, "next", "back", "return" (to manga list), or "exit"`
      );

      const { chapterInput } = await inquirer.prompt([
        {
          type: "input",
          name: "chapterInput",
          message: "[select chapter >]",
          validate: (val) => {
            if (!val || typeof val !== "string" || !val.trim()) {
              return "Please enter a command or chapter number";
            }
            return true; // Allow any input, we'll handle validation after
          },
        },
      ]);

      const command = chapterInput.trim().toLowerCase();

      if (command === "next") {
        chapterPage++;
      } else if (command === "back") {
        if (chapterPage > 1) {
          chapterPage--;
        } else {
          console.log("⚠ Already at the first page of chapters.");
          await new Promise((r) => setTimeout(r, DELAY_MS));
        }
      } else if (command === "return") {
        return { shouldReturnToManga: true }; // Go back to manga list
      } else if (command === "exit") {
        process.exit(0); // Exit completely
      } else {
        // Try to parse as number
        const num = parseInt(chapterInput.trim());
        if (!isNaN(num) && num >= 1 && num <= chapters.length) {
          let chapterIndex = num - 1;

          while (true) {
            const selectedChapter = chapters[chapterIndex];

            await handleChapterViewing(
              selectedChapter.id,
              selectedChapter.title,
              selectedChapter.chapter
            );

            // After viewing, ask about the next chapter.
            // The "next" chapter is at `chapterIndex - 1` because of descending sort.
            if (chapterIndex > 0) {
              const { readNext } = await inquirer.prompt([
                {
                  type: "confirm",
                  name: "readNext",
                  message: `Read next chapter? (Ch. ${chapters[chapterIndex - 1].chapter})`,
                  default: true,
                },
              ]);

              if (readNext) {
                chapterIndex--; // Move to the next chapter
                continue; // Continue the inner while loop
              }
            }
            
            // If no next chapter or user says no, break the inner loop
            // and go back to the main chapter selection loop.
            break;
          }
        } else {
          clearTerminal();
          console.log(`❌ Invalid input: "${chapterInput}"`);
          console.log(
            `Valid options: number (1-${chapters.length}), "next", "back", "return", or "exit"`
          );
          console.log("🔄 Invalid input, retrying again...");

          // Clear any pending input and wait
          process.stdin.pause();
          await new Promise((r) => setTimeout(r, DELAY_MS));
          process.stdin.resume();

          continue; // Continue the loop to ask again
        }
      }
    } catch (error) {
      spinner.fail();
      console.log(
        `❌ Error in chapter selection: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      console.log("🔄 Returning to manga selection...");
      await new Promise((r) => setTimeout(r, DELAY_MS));
      return { shouldReturnToManga: true };
    }
  }
}

async function handleMangaSelection(query: string): Promise<boolean> {
  let page = 1;

  while (true) {
    const spinner = ora(`Searching for "${query}"...`).start();
    try {
      const searchResult = await searchMangaAPI(query, page);
      spinner.succeed();
      clearTerminal();
      console.log(`Search: ${query} — Page ${page}\n`);
      const mangas = searchResult?.mangas || [];

      if (!mangas || !mangas.length) {
        console.log("⚠ No results found on this page.");
        if (page > 1) {
          page--;
          console.log("🔄 Returning to previous page...");
          await new Promise((r) => setTimeout(r, DELAY_MS));
          continue;
        } else {
          console.log("❌ No results found for this search.");
          console.log("🔄 Returning to search...");
          await new Promise((r) => setTimeout(r, DELAY_MS));
          return false;
        }
      }

      displayManga(mangas, COLUMNS);
      console.log(
        `\nType a number to select, "next", "back", "search" (new search), or "exit"`
      );

      const { input } = await inquirer.prompt([
        {
          type: "input",
          name: "input",
          message: "[select manga >]",
          validate: (val) => {
            if (!val || typeof val !== "string" || !val.trim()) {
              return "Please enter a command or manga number";
            }
            return true;
          },
        },
      ]);

      const command = input.trim().toLowerCase();

      if (command === "next") {
        page++;
      } else if (command === "back") {
        if (page > 1) {
          page--;
        } else {
          console.log("⚠ Already at the first page.");
          await new Promise((r) => setTimeout(r, DELAY_MS));
        }
      } else if (command === "search") {
        return false;
      } else if (command === "exit") {
        process.exit(0);
      } else {
        const num = parseInt(input.trim());
        if (!isNaN(num) && num >= 1 && num <= mangas.length) {
          const index = num - 1;
          const selected = mangas[index];

          clearTerminal();
          displayMangaDetails(selected);

          const { action } = await inquirer.prompt([
            {
              type: "list",
              name: "action",
              message: "What do you want to do?",
              choices: [
                { name: "View Chapters", value: "view_chapters" },
                { name: "Back to manga list", value: "back" },
              ],
            },
          ]);

          if (action === "view_chapters") {
            const title =
              selected?.title?.en ||
              (selected?.title && Object.values(selected.title)[0]) ||
              "Unknown Title";

            await handleChapterSelection(selected.id, title);
            continue;
          } else {
            continue;
          }
        } else {
          clearTerminal();
          console.log(`❌ Invalid input: "${input}"`);
          console.log(
            `Valid options: number (1-${mangas.length}), "next", "back", "search", or "exit"`
          );
          console.log("🔄 Invalid input, retrying again...");

          process.stdin.pause();
          await new Promise((r) => setTimeout(r, DELAY_MS));
          process.stdin.resume();

          continue;
        }
      }
    } catch (error) {
      spinner.fail();
      console.log(
        `❌ Error in manga selection: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      console.log("🔄 Returning to search...");
      await new Promise((r) => setTimeout(r, DELAY_MS));
      return false;
    }
  }
}

export async function searchManga(defaultQuery: string = ""): Promise<void> {
  let searchQuery = defaultQuery;
  while (true) {
    try {
      clearTerminal();

      if (!searchQuery) {
        const { query } = await inquirer.prompt([
          {
            type: "input",
            name: "query",
            message: "Search Manga [>]:",
            default: "",
            validate: (val) => {
              if (!val || typeof val !== "string" || !val.trim()) {
                return "Please enter a search query (cannot be empty)";
              }
              return true;
            },
          },
        ]);
        searchQuery = query.trim();

        if (!searchQuery) {
          console.log("❌ Search query cannot be empty.");
          await new Promise((r) => setTimeout(r, DELAY_MS));
          continue;
        }
      }

      const shouldContinueSearch = await handleMangaSelection(searchQuery);

      if (!shouldContinueSearch) {
        // User wants a new search, so clear the query to trigger the prompt
        searchQuery = "";
        continue;
      }

      // If we reach here, user wants to exit
      break;
    } catch (error) {
      console.log(
        `❌ Error in search: ${
          error instanceof Error ? error.message : "Unknown error"
        }`
      );
      console.log("🔄 Restarting search...");
      await new Promise((r) => setTimeout(r, DELAY_MS));
      searchQuery = ""; // Reset default query on error
    }
  }
}
