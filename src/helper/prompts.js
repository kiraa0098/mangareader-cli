"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.handleChapterSelection = handleChapterSelection;
exports.handleMangaSelection = handleMangaSelection;
const inquirer_1 = __importDefault(require("inquirer"));
const open_1 = __importDefault(require("open"));
const clear_terminal_1 = require("./clear_terminal");
const manga_chapters_1 = require("../api/manga_chapters");
const chapter_pages_1 = require("../api/chapter_pages");
const generate_html_viewerl_1 = require("./generate_html_viewerl");
const ora_1 = __importDefault(require("ora"));
const search_manga_1 = require("../api/search_manga");
const display_manga_details_1 = require("./display_manga_details");
const help_1 = require("./help");
const chalk_1 = __importDefault(require("chalk"));
function handleChapterViewing(chapterId, chapterTitle, chapterNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const spinner = (0, ora_1.default)(`Loading Chapter ${chapterNumber} - ${chapterTitle}...`).start();
        try {
            const pages = yield (0, chapter_pages_1.fetchChapterPages)(chapterId);
            spinner.succeed();
            if (!pages || !pages.length) {
                console.log("❌ No pages found for this chapter.");
                yield inquirer_1.default.prompt([
                    {
                        type: "input",
                        name: "continue",
                        message: "Press Enter to return to chapter selection...",
                    },
                ]);
                return;
            }
            const htmlFile = yield (0, generate_html_viewerl_1.generateHtmlViewer)(pages.map((page) => page.url), `Chapter ${chapterNumber} – ${chapterTitle}`);
            yield (0, open_1.default)(htmlFile);
            console.log("\nChapter opened in browser!");
            yield inquirer_1.default.prompt([
                {
                    type: "input",
                    name: "continue",
                    message: "Press Enter to return to chapter selection...",
                },
            ]);
        }
        catch (error) {
            spinner.fail();
            if (error.isAxiosError) {
                console.log(chalk_1.default.red("❌ Could not load chapter pages. Please check your internet connection."));
            }
            else {
                console.log(chalk_1.default.red("❌ An unexpected error occurred while loading the chapter: ") +
                    (error instanceof Error ? error.message : "Unknown error"));
            }
            yield inquirer_1.default.prompt([
                {
                    type: "input",
                    name: "continue",
                    message: "Press Enter to return to chapter selection...",
                },
            ]);
            return;
        }
    });
}
function handleChapterSelection(mangaId, mangaTitle) {
    return __awaiter(this, void 0, void 0, function* () {
        let chapterPage = 1;
        while (true) {
            const spinner = (0, ora_1.default)(`Fetching chapters for ${mangaTitle}...`).start();
            try {
                const chapters = yield (0, manga_chapters_1.fetchChaptersByMangaId)(mangaId, chapterPage);
                spinner.succeed();
                (0, clear_terminal_1.clearTerminal)();
                console.log(`Selected Manga: ${mangaTitle} — Page ${chapterPage}\n`);
                if (!chapters || !chapters.length) {
                    console.log("⚠ No chapters found on this page.");
                    if (chapterPage > 1) {
                        chapterPage--;
                        console.log("🔄 Returning to previous page...");
                        yield inquirer_1.default.prompt([
                            {
                                type: "input",
                                name: "continue",
                                message: "Press Enter to continue...",
                            },
                        ]);
                        continue;
                    }
                    else {
                        console.log("❌ No chapters available for this manga.");
                        yield inquirer_1.default.prompt([
                            {
                                type: "input",
                                name: "continue",
                                message: "Press Enter to return to manga selection...",
                            },
                        ]);
                        return { shouldReturnToManga: true };
                    }
                }
                const chapterChoices = chapters.map((chapter, index) => ({
                    name: `[${index + 1}] Ch. ${chapter.chapter || "N/A"}: ${chapter.title || "No Title"}`,
                    value: index,
                }));
                const { selectedIndex } = yield inquirer_1.default.prompt([
                    {
                        type: "list",
                        name: "selectedIndex",
                        message: "Select a chapter or action",
                        choices: [
                            ...chapterChoices,
                            new inquirer_1.default.Separator(),
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
                }
                else if (selectedIndex === "back") {
                    if (chapterPage > 1) {
                        chapterPage--;
                    }
                    else {
                        console.log("⚠ Already at the first page of chapters.");
                        yield inquirer_1.default.prompt([
                            {
                                type: "input",
                                name: "continue",
                                message: "Press Enter to continue...",
                            },
                        ]);
                    }
                }
                else if (selectedIndex === "return") {
                    return { shouldReturnToManga: true }; // Go back to manga list
                }
                else if (selectedIndex === "exit") {
                    process.exit(0); // Exit completely
                }
                else {
                    let chapterIndex = selectedIndex;
                    while (true) {
                        const selectedChapter = chapters[chapterIndex];
                        yield handleChapterViewing(selectedChapter.id, selectedChapter.title, selectedChapter.chapter);
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
                        const { action } = yield inquirer_1.default.prompt([
                            {
                                type: "list",
                                name: "action",
                                message: "What to do next?",
                                choices: choices,
                            },
                        ]);
                        if (action === "next") {
                            chapterIndex--;
                        }
                        else if (action === "prev") {
                            chapterIndex++;
                        }
                        else {
                            break; // Go back to chapter list
                        }
                    }
                }
            }
            catch (error) {
                spinner.fail();
                if (error.isAxiosError) {
                    console.log(chalk_1.default.red("❌ Could not connect to MangaDex API. Please check your internet connection."));
                }
                else {
                    console.log(chalk_1.default.red("❌ An unexpected error occurred: ") +
                        (error instanceof Error ? error.message : "Unknown error"));
                }
                yield inquirer_1.default.prompt([
                    {
                        type: "input",
                        name: "continue",
                        message: "Press Enter to return to manga selection...",
                    },
                ]);
                return { shouldReturnToManga: true };
            }
        }
    });
}
function handleMangaSelection(query) {
    return __awaiter(this, void 0, void 0, function* () {
        var _a;
        let page = 1;
        while (true) {
            const spinner = (0, ora_1.default)(`Searching for "${query}"...`).start();
            try {
                const searchResult = yield (0, search_manga_1.searchMangaAPI)(query, page);
                spinner.succeed();
                (0, clear_terminal_1.clearTerminal)();
                console.log(`Search: ${query} — Page ${page}\n`);
                const mangas = (searchResult === null || searchResult === void 0 ? void 0 : searchResult.mangas) || [];
                if (!mangas || !mangas.length) {
                    console.log("⚠ No results found on this page.");
                    if (page > 1) {
                        page--;
                        console.log("🔄 Returning to previous page...");
                        yield inquirer_1.default.prompt([
                            {
                                type: "input",
                                name: "continue",
                                message: "Press Enter to continue...",
                            },
                        ]);
                        continue;
                    }
                    else {
                        console.log("❌ No results found for this search.");
                        yield inquirer_1.default.prompt([
                            {
                                type: "input",
                                name: "continue",
                                message: "Press Enter to return to a new search...",
                            },
                        ]);
                        return false;
                    }
                }
                const mangaChoices = mangas.map((manga, index) => {
                    const title = manga.title.en ||
                        Object.values(manga.title)[0] ||
                        "Unknown Title";
                    const year = manga.year ? `(${manga.year})` : "";
                    const status = manga.status
                        ? `- ${manga.status.charAt(0).toUpperCase() + manga.status.slice(1)}`
                        : "";
                    const coloredTitle = chalk_1.default.cyan(title);
                    const details = chalk_1.default.gray(`${year} ${status}`.trim());
                    return {
                        name: `[${index + 1}] ${coloredTitle} ${details}`,
                        value: index,
                    };
                });
                const { selectedIndex } = yield inquirer_1.default.prompt([
                    {
                        type: "list",
                        name: "selectedIndex",
                        message: "Select a manga or action",
                        choices: [
                            ...mangaChoices,
                            new inquirer_1.default.Separator(),
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
                }
                else if (selectedIndex === "back") {
                    if (page > 1) {
                        page--;
                    }
                    else {
                        console.log("⚠ Already at the first page.");
                        yield inquirer_1.default.prompt([
                            {
                                type: "input",
                                name: "continue",
                                message: "Press Enter to continue...",
                            },
                        ]);
                    }
                }
                else if (selectedIndex === "search") {
                    return false;
                }
                else if (selectedIndex === "help") {
                    (0, help_1.displayHelp)();
                    yield inquirer_1.default.prompt([
                        {
                            type: "input",
                            name: "continue",
                            message: "Press Enter to return to the manga list...",
                        },
                    ]);
                    continue;
                }
                else if (selectedIndex === "exit") {
                    process.exit(0);
                }
                else {
                    const selected = mangas[selectedIndex];
                    (0, clear_terminal_1.clearTerminal)();
                    (0, display_manga_details_1.displayMangaDetails)(selected);
                    const { action } = yield inquirer_1.default.prompt([
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
                        const title = ((_a = selected === null || selected === void 0 ? void 0 : selected.title) === null || _a === void 0 ? void 0 : _a.en) ||
                            ((selected === null || selected === void 0 ? void 0 : selected.title) && Object.values(selected.title)[0]) ||
                            "Unknown Title";
                        yield handleChapterSelection(selected.id, title);
                        continue;
                    }
                    else {
                        continue;
                    }
                }
            }
            catch (error) {
                spinner.fail();
                if (error.isAxiosError) {
                    console.log(chalk_1.default.red("❌ Could not connect to MangaDex API. Please check your internet connection."));
                }
                else {
                    console.log(chalk_1.default.red("❌ An unexpected error occurred: ") +
                        (error instanceof Error ? error.message : "Unknown error"));
                }
                yield inquirer_1.default.prompt([
                    {
                        type: "input",
                        name: "continue",
                        message: "Press Enter to return to a new search...",
                    },
                ]);
                return false;
            }
        }
    });
}
