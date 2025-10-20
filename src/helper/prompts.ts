import inquirer from "inquirer";
import open from "open";
import { clearTerminal } from "./clear_terminal";
import { fetchChaptersByMangaId } from "../api/manga_chapters";
import { fetchChapterPages } from "../api/chapter_pages";
import { generateHtmlViewer } from "./generate_html_viewerl";
import ora from "ora";
import { searchMangaAPI } from "../api/search_manga";
import { displayMangaDetails } from "./display_manga_details";
import { displayHelp } from "./help";
import chalk from "chalk";

// Helper to map language codes to full names
const languageMap: { [key: string]: string } = {
  en: "English",
  es: "Spanish",
  fr: "French",
  ja: "Japanese",
  ko: "Korean",
  "zh-ro": "Chinese (Romanized)",
  zh: "Chinese",
  "pt-br": "Portuguese (Brazil)",
  pt: "Portuguese",
  ru: "Russian",
  de: "German",
  vi: "Vietnamese",
  id: "Indonesian",
  tr: "Turkish",
  it: "Italian",
  th: "Thai",
  ar: "Arabic",
  pl: "Polish",
  sv: "Swedish",
  nl: "Dutch",
};

const getLanguageName = (code: string) => languageMap[code] || code;

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
      await inquirer.prompt([
        {
          type: "input",
          name: "continue",
          message: "Press Enter to return to chapter selection...",
        },
      ]);
      return;
    }

    const htmlFile = await generateHtmlViewer(
      pages.map((page) => page.url),
      `Chapter ${chapterNumber} – ${chapterTitle}`
    );

    await open(htmlFile);

    console.log("\nChapter opened in browser!");
    await inquirer.prompt([
      {
        type: "input",
        name: "continue",
        message: "Press Enter to return to chapter selection...",
      },
    ]);
  } catch (error: any) {
    spinner.fail();
    if (error.isAxiosError) {
      console.log(
        chalk.red("❌ Could not load chapter pages. Please check your internet connection.")
      );
    } else {
      console.log(
        chalk.red("❌ An unexpected error occurred while loading the chapter: ") +
          (error instanceof Error ? error.message : "Unknown error")
      );
    }
    await inquirer.prompt([
      {
        type: "input",
        name: "continue",
        message: "Press Enter to return to chapter selection...",
      },
    ]);
    return;
  }
}

export async function handleChapterSelection(
  mangaId: string,
  mangaTitle: string,
  language: string
): Promise<{ shouldReturnToManga: boolean }> {
  let chapterPage = 1;
  const languageName = language === 'all' ? 'All Languages' : getLanguageName(language);

  while (true) {
    const spinner = ora(`Fetching chapters for ${mangaTitle} (${languageName})...`).start();
    try {
      const chapters = await fetchChaptersByMangaId(mangaId, chapterPage, language);
      spinner.succeed();
      clearTerminal();
      console.log(`Selected Manga: ${mangaTitle} — Language: ${languageName} — Page ${chapterPage}\n`);

      if (!chapters || !chapters.length) {
        if (chapterPage > 1) {
          chapterPage--;
          await inquirer.prompt([
            {
              type: "list",
              name: "action",
              message: "No chapters found on this page.",
              choices: ["Return to Previous Page"],
            },
          ]);
          continue;
        } else {
          await inquirer.prompt([
            {
              type: "list",
              name: "action",
              message: `No chapters available for this manga in ${languageName}.`,
              choices: ["Return to Manga Details"],
            },
          ]);
          return { shouldReturnToManga: true };
        }
      }

      const chapterChoices = chapters.map((chapter: any, index: number) => {
        const lang = chapter.language ? `(${getLanguageName(chapter.language)})` : '';
        return {
            name: `[${index + 1}] Ch. ${chapter.chapter || "N/A"}: ${chapter.title || "No Title"} ${chalk.gray(lang)}`,
            value: index,
        }
      });

      const { selectedIndex } = await inquirer.prompt([
        {
          type: "list",
          name: "selectedIndex",
          message: "Select a chapter or action",
          choices: [
            ...chapterChoices,
            new inquirer.Separator(),
            { name: "Next Page", value: "next" },
            { name: "Previous Page", value: "back" },
            { name: "Back to Manga", value: "return" },
            { name: "Exit", value: "exit" },
          ],
          pageSize: 20,
          loop: false,
        },
      ]);

      if (selectedIndex === "next") {
        chapterPage++;
      } else if (selectedIndex === "back") {
        if (chapterPage > 1) {
          chapterPage--;
        } else {
          console.log("⚠ Already at the first page of chapters.");
          await inquirer.prompt([
            {
              type: "input",
              name: "continue",
              message: "Press Enter to continue...",
            },
          ]);
        }
      } else if (selectedIndex === "return") {
        return { shouldReturnToManga: true }; // Go back to manga list
      } else if (selectedIndex === "exit") {
        process.exit(0); // Exit completely
      } else {
        let chapterIndex = selectedIndex;

        while (true) {
          const selectedChapter = chapters[chapterIndex];

          await handleChapterViewing(
            selectedChapter.id,
            selectedChapter.title,
            selectedChapter.chapter
          );

          const choices = [];
          // "Next" chapter is at `chapterIndex - 1` due to descending sort
          if (chapterIndex > 0) {
            choices.push({
              name: `Next Chapter (Ch. ${chapters[chapterIndex - 1].chapter})`,
              value: "next",
            });
          }
          // "Previous" chapter is at `chapterIndex + 1`
          if (chapterIndex < chapters.length - 1) {
            choices.push({
              name: `Previous Chapter (Ch. ${chapters[chapterIndex + 1].chapter})`,
              value: "prev",
            });
          }
          choices.push({ name: "Back to Chapter List", value: "back" });

          const { action } = await inquirer.prompt([
            {
              type: "list",
              name: "action",
              message: "What to do next?",
              choices: choices,
            },
          ]);

          if (action === "next") {
            chapterIndex--;
          } else if (action === "prev") {
            chapterIndex++;
          } else {
            break; // Go back to chapter list
          }
        }
      }
        } catch (error: any) {
          spinner.fail();
          if (error.isAxiosError) {
            console.log(
              chalk.red("❌ Could not connect to MangaDex API. Please check your internet connection.")
            );
          } else {
            console.log(
              chalk.red("❌ An unexpected error occurred: ") +
                (error instanceof Error ? error.message : "Unknown error")
            );
          }
          await inquirer.prompt([
            {
              type: "input",
              name: "continue",
              message: "Press Enter to return to manga selection...",
            },
          ]);
          return { shouldReturnToManga: true };
        }
  }
}


export async function handleMangaSelection(query: string): Promise<boolean> {
  let page = 1;

  while (true) {
    const spinner = ora(`Searching for "${query}"...`).start();
    try {
      const searchResult = await searchMangaAPI(query, page);
      spinner.succeed();

      const mangas = searchResult?.mangas || [];

      if (!mangas || !mangas.length) {
        if (page > 1) {
          page--;
          await inquirer.prompt([
            {
              type: "list",
              name: "action",
              message: "No results found on this page.",
              choices: ["Return to Previous Page"],
            },
          ]);
          continue; // Continue outer loop to re-fetch previous page
        } else {
          await inquirer.prompt([
            {
              type: "list",
              name: "action",
              message: "No results found for this search.",
              choices: ["Return to New Search"],
            },
          ]);
          return false;
        }
      }

      // Inner loop for UI interaction on the current page
      while (true) {
        clearTerminal();
        console.log(`Search: ${query} — Page ${page}\n`);

        const mangaChoices = mangas.map((manga: any, index: number) => {
          const title =
            manga.title.en ||
            Object.values(manga.title)[0] ||
            "Unknown Title";

          const year = manga.year ? `(${manga.year})` : "";
          const status = manga.status
            ? `- ${manga.status.charAt(0).toUpperCase() + manga.status.slice(1)}`
            : "";

          const coloredTitle = chalk.cyan(title);
          const details = chalk.gray(`${year} ${status}`.trim());

          return {
            name: `[${index + 1}] ${coloredTitle} ${details}`,
            value: index,
          };
        });

        const { selectedIndex } = await inquirer.prompt([
          {
            type: "list",
            name: "selectedIndex",
            message: "Select a manga or action",
            choices: [
              ...mangaChoices,
              new inquirer.Separator(),
              { name: "Next Page", value: "next" },
              { name: "Previous Page", value: "back" },
              { name: "New Search", value: "search" },
              { name: "Help", value: "help" },
              { name: "Exit", value: "exit" },
            ],
            pageSize: 15,
            loop: false,
          },
        ]);

        if (selectedIndex === "next") {
          page++;
          break; // Break inner loop to fetch next page
        } else if (selectedIndex === "back") {
          if (page > 1) {
            page--;
            break; // Break inner loop to fetch previous page
          }
          console.log("⚠ Already at the first page.");
          await inquirer.prompt([
            {
              type: "input",
              name: "continue",
              message: "Press Enter to continue...",
            },
          ]);
          continue; // Re-show prompt for the same page
        } else if (selectedIndex === "search") {
          return false;
        } else if (selectedIndex === "help") {
          displayHelp();
          await inquirer.prompt([
            {
              type: "input",
              name: "continue",
              message: "Press Enter to return to the manga list...",
            },
          ]);
          continue; // Re-show prompt for the same page
        } else if (selectedIndex === "exit") {
          process.exit(0);
        } else {
          const selected = mangas[selectedIndex];

          let inMangaDetailView = true;
          while (inMangaDetailView) {
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

              // ** NEW: Language Selection Logic **
              const availableLanguages =
                selected.available_translated_languages || [];
              if (availableLanguages.length === 0) {
                console.log(
                  "No translated chapters available for this manga."
                );
                await inquirer.prompt([
                  {
                    type: "input",
                    name: "continue",
                    message: "Press Enter to continue...",
                  },
                ]);
                continue;
              }

              const languageChoices = [
                { name: "All Languages", value: "all" },
                new inquirer.Separator(),
                ...availableLanguages.sort().map((lang: string) => ({
                  name: getLanguageName(lang),
                  value: lang,
                })),
              ];

              const { selectedLanguage } = await inquirer.prompt([
                {
                  type: "list",
                  name: "selectedLanguage",
                  message: "Select a language for chapters",
                  choices: languageChoices,
                },
              ]);

              await handleChapterSelection(
                selected.id,
                title,
                selectedLanguage
              );
              // After returning, re-show the same manga list instantly
              continue; // Continue the inner loop
            } else {
              inMangaDetailView = false;
            }
          }
          continue;
      }
    } catch (error: any) {
      spinner.fail();
      if (error.isAxiosError) {
        console.log(
          chalk.red("❌ Could not connect to MangaDex API. Please check your internet connection.")
        );
      } else {
        console.log(
          chalk.red("❌ An unexpected error occurred: ") +
            (error instanceof Error ? error.message : "Unknown error")
        );
      }
      await inquirer.prompt([
        {
          type: "input",
          name: "continue",
          message: "Press Enter to return to a new search...",
        },
      ]);
      return false;
    }
  }
}