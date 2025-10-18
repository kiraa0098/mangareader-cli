import inquirer from "inquirer";
import fs from "fs/promises";
import path from "path";
import os from "os";
import { fileURLToPath } from "url";
import open from "open";
import { clearTerminal } from "../helper/clear_terminal";
import { searchMangaAPI } from "../api/search_manga";
import { fetchChaptersByMangaId } from "../api/manga_chapters";

import { fetchChapterPages } from "../api/chapter_pages";
import { generateHtmlViewer } from "../helper/generate_html_viewerl";
import { displayMangaDetails } from "../helper/display_manga_details";
import { handleMangaSelection } from "../helper/prompts";
import { displayWelcomeMessage } from "../helper/welcome";
import chalk from "chalk";
import ora from "ora";







export async function searchManga(defaultQuery: string = ""): Promise<void> {
  let searchQuery = defaultQuery;
  displayWelcomeMessage();
  while (true) {
    try {

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
          await inquirer.prompt([
            {
              type: "input",
              name: "continue",
              message: "Press Enter to try again...",
            },
          ]);
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
    } catch (error: any) {
      if (error.isAxiosError) {
        console.log(
          chalk.red(
            "❌ Could not connect to MangaDex API. Please check your internet connection."
          )
        );
      } else {
        console.log(
          chalk.red("❌ An unexpected error occurred during the search: ") +
            (error instanceof Error ? error.message : "Unknown error")
        );
      }
      await inquirer.prompt([
        {
          type: "input",
          name: "continue",
          message: "Press Enter to restart the search...",
        },
      ]);
      searchQuery = ""; // Reset default query on error
    }
  }
}
