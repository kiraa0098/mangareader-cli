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
exports.searchManga = searchManga;
const inquirer_1 = __importDefault(require("inquirer"));
const open_1 = __importDefault(require("open"));
const clear_terminal_1 = require("../helper/clear_terminal");
const search_manga_1 = require("../api/search_manga");
const manga_chapters_1 = require("../api/manga_chapters");
const display_manga_1 = require("../helper/display_manga");
const display_chapters_1 = require("../helper/display_chapters");
const chapter_pages_1 = require("../api/chapter_pages");
const generate_html_viewerl_1 = require("../helper/generate_html_viewerl");
const display_manga_details_1 = require("../helper/display_manga_details");
const ora_1 = __importDefault(require("ora"));
const COLUMNS = 3;
const DELAY_MS = 3000;
function handleChapterViewing(chapterId, chapterTitle, chapterNumber) {
    return __awaiter(this, void 0, void 0, function* () {
        const spinner = (0, ora_1.default)(`Loading Chapter ${chapterNumber} - ${chapterTitle}...`).start();
        try {
            const pages = yield (0, chapter_pages_1.fetchChapterPages)(chapterId);
            spinner.succeed();
            if (!pages || !pages.length) {
                console.log("❌ No pages found for this chapter.");
                yield new Promise((r) => setTimeout(r, DELAY_MS));
                return;
            }
            const htmlFile = yield (0, generate_html_viewerl_1.generateHtmlViewer)(pages.map((page) => page.url), `Chapter ${chapterNumber} – ${chapterTitle}`);
            yield (0, open_1.default)(htmlFile);
            console.log("\nChapter opened in browser!");
            console.log("Returning to chapter selection in 3 seconds...");
            yield new Promise((r) => setTimeout(r, DELAY_MS));
        }
        catch (error) {
            spinner.fail();
            console.log(`❌ Error loading chapter: ${error instanceof Error ? error.message : "Unknown error"}`);
            console.log("🔄 Returning to chapter selection...");
            yield new Promise((r) => setTimeout(r, DELAY_MS));
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
                        yield new Promise((r) => setTimeout(r, DELAY_MS));
                        continue;
                    }
                    else {
                        console.log("❌ No chapters available for this manga.");
                        console.log("🔄 Returning to manga selection...");
                        yield new Promise((r) => setTimeout(r, DELAY_MS));
                        return { shouldReturnToManga: true };
                    }
                }
                console.log(`\nAvailable Chapters:\n`);
                (0, display_chapters_1.displayChapters)(chapters, COLUMNS);
                console.log(`\nType a number to select chapter, "next", "back", "return" (to manga list), or "exit"`);
                const { chapterInput } = yield inquirer_1.default.prompt([
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
                }
                else if (command === "back") {
                    if (chapterPage > 1) {
                        chapterPage--;
                    }
                    else {
                        console.log("⚠ Already at the first page of chapters.");
                        yield new Promise((r) => setTimeout(r, DELAY_MS));
                    }
                }
                else if (command === "return") {
                    return { shouldReturnToManga: true }; // Go back to manga list
                }
                else if (command === "exit") {
                    process.exit(0); // Exit completely
                }
                else {
                    // Try to parse as number
                    const num = parseInt(chapterInput.trim());
                    if (!isNaN(num) && num >= 1 && num <= chapters.length) {
                        let chapterIndex = num - 1;
                        while (true) {
                            const selectedChapter = chapters[chapterIndex];
                            yield handleChapterViewing(selectedChapter.id, selectedChapter.title, selectedChapter.chapter);
                            // After viewing, ask about the next chapter.
                            // The "next" chapter is at `chapterIndex - 1` because of descending sort.
                            if (chapterIndex > 0) {
                                const { readNext } = yield inquirer_1.default.prompt([
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
                    }
                    else {
                        (0, clear_terminal_1.clearTerminal)();
                        console.log(`❌ Invalid input: "${chapterInput}"`);
                        console.log(`Valid options: number (1-${chapters.length}), "next", "back", "return", or "exit"`);
                        console.log("🔄 Invalid input, retrying again...");
                        // Clear any pending input and wait
                        process.stdin.pause();
                        yield new Promise((r) => setTimeout(r, DELAY_MS));
                        process.stdin.resume();
                        continue; // Continue the loop to ask again
                    }
                }
            }
            catch (error) {
                spinner.fail();
                console.log(`❌ Error in chapter selection: ${error instanceof Error ? error.message : "Unknown error"}`);
                console.log("🔄 Returning to manga selection...");
                yield new Promise((r) => setTimeout(r, DELAY_MS));
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
                        yield new Promise((r) => setTimeout(r, DELAY_MS));
                        continue;
                    }
                    else {
                        console.log("❌ No results found for this search.");
                        console.log("🔄 Returning to search...");
                        yield new Promise((r) => setTimeout(r, DELAY_MS));
                        return false;
                    }
                }
                (0, display_manga_1.displayManga)(mangas, COLUMNS);
                console.log(`\nType a number to select, "next", "back", "search" (new search), or "exit"`);
                const { input } = yield inquirer_1.default.prompt([
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
                }
                else if (command === "back") {
                    if (page > 1) {
                        page--;
                    }
                    else {
                        console.log("⚠ Already at the first page.");
                        yield new Promise((r) => setTimeout(r, DELAY_MS));
                    }
                }
                else if (command === "search") {
                    return false;
                }
                else if (command === "exit") {
                    process.exit(0);
                }
                else {
                    const num = parseInt(input.trim());
                    if (!isNaN(num) && num >= 1 && num <= mangas.length) {
                        const index = num - 1;
                        const selected = mangas[index];
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
                    else {
                        (0, clear_terminal_1.clearTerminal)();
                        console.log(`❌ Invalid input: "${input}"`);
                        console.log(`Valid options: number (1-${mangas.length}), "next", "back", "search", or "exit"`);
                        console.log("🔄 Invalid input, retrying again...");
                        process.stdin.pause();
                        yield new Promise((r) => setTimeout(r, DELAY_MS));
                        process.stdin.resume();
                        continue;
                    }
                }
            }
            catch (error) {
                spinner.fail();
                console.log(`❌ Error in manga selection: ${error instanceof Error ? error.message : "Unknown error"}`);
                console.log("🔄 Returning to search...");
                yield new Promise((r) => setTimeout(r, DELAY_MS));
                return false;
            }
        }
    });
}
function searchManga() {
    return __awaiter(this, arguments, void 0, function* (defaultQuery = "") {
        let searchQuery = defaultQuery;
        while (true) {
            try {
                (0, clear_terminal_1.clearTerminal)();
                if (!searchQuery) {
                    const { query } = yield inquirer_1.default.prompt([
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
                        yield new Promise((r) => setTimeout(r, DELAY_MS));
                        continue;
                    }
                }
                const shouldContinueSearch = yield handleMangaSelection(searchQuery);
                if (!shouldContinueSearch) {
                    // User wants a new search, so clear the query to trigger the prompt
                    searchQuery = "";
                    continue;
                }
                // If we reach here, user wants to exit
                break;
            }
            catch (error) {
                console.log(`❌ Error in search: ${error instanceof Error ? error.message : "Unknown error"}`);
                console.log("🔄 Restarting search...");
                yield new Promise((r) => setTimeout(r, DELAY_MS));
                searchQuery = ""; // Reset default query on error
            }
        }
    });
}
