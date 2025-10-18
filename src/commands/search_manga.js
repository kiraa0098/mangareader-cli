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
const prompts_1 = require("../helper/prompts");
const welcome_1 = require("../helper/welcome");
const chalk_1 = __importDefault(require("chalk"));
function searchManga() {
    return __awaiter(this, arguments, void 0, function* (defaultQuery = "") {
        let searchQuery = defaultQuery;
        (0, welcome_1.displayWelcomeMessage)();
        while (true) {
            try {
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
                        yield inquirer_1.default.prompt([
                            {
                                type: "input",
                                name: "continue",
                                message: "Press Enter to try again...",
                            },
                        ]);
                        continue;
                    }
                }
                const shouldContinueSearch = yield (0, prompts_1.handleMangaSelection)(searchQuery);
                if (!shouldContinueSearch) {
                    // User wants a new search, so clear the query to trigger the prompt
                    searchQuery = "";
                    continue;
                }
                // If we reach here, user wants to exit
                break;
            }
            catch (error) {
                if (error.isAxiosError) {
                    console.log(chalk_1.default.red("❌ Could not connect to MangaDex API. Please check your internet connection."));
                }
                else {
                    console.log(chalk_1.default.red("❌ An unexpected error occurred during the search: ") +
                        (error instanceof Error ? error.message : "Unknown error"));
                }
                yield inquirer_1.default.prompt([
                    {
                        type: "input",
                        name: "continue",
                        message: "Press Enter to restart the search...",
                    },
                ]);
                searchQuery = ""; // Reset default query on error
            }
        }
    });
}
