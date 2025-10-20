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
exports.fetchChaptersByMangaId = fetchChaptersByMangaId;
const axios_1 = __importDefault(require("axios"));
/**
 * Fetches English chapters for a given manga ID, paginated.
 *
 * @param mangaId - The MangaDex manga ID.
 * @param page - Optional page number (1-based). Default is 1.
 * @returns A Promise resolving to an array of chapter metadata.
 */
function fetchChaptersByMangaId(mangaId_1) {
    return __awaiter(this, arguments, void 0, function* (mangaId, page = 1, language = "en" // Default to English, but UI will guide selection
    ) {
        const limit = 500;
        const offset = (page - 1) * limit;
        // Dynamically build params
        const params = {
            includeFuturePublishAt: 0,
            includeEmptyPages: 0,
            limit,
            offset,
        };
        // If a specific language is chosen (and it's not 'all'), add it to the query
        if (language && language.toLowerCase() !== "all") {
            params.translatedLanguage = [language];
        }
        // If language is 'all' or undefined, the translatedLanguage param is omitted,
        // and the API returns all languages.
        try {
            const response = yield axios_1.default.get(`https://api.mangadex.org/manga/${mangaId}/feed`, {
                params, // Use the dynamically built params
                paramsSerializer: (params) => {
                    // Axios needs help serializing arrays into `translatedLanguage[]=en`
                    const searchParams = new URLSearchParams();
                    for (const key in params) {
                        const value = params[key];
                        if (Array.isArray(value)) {
                            value.forEach((v) => searchParams.append(`${key}[]`, v));
                        }
                        else if (typeof value === "object") {
                            for (const k in value) {
                                searchParams.append(`${key}[${k}]`, value[k]);
                            }
                        }
                        else {
                            searchParams.append(key, value);
                        }
                    }
                    return searchParams.toString();
                },
            });
            const chapters = response.data.data.map((chapter) => ({
                id: chapter.id,
                title: chapter.attributes.title,
                chapter: chapter.attributes.chapter,
                volume: chapter.attributes.volume,
                language: chapter.attributes.translatedLanguage,
                publishAt: chapter.attributes.publishAt,
                externalUrl: chapter.attributes.externalUrl,
            }));
            // Sort chapters by chapter number in descending order.
            // The `chapter` attribute can be a string, so we need to parse it.
            chapters.sort((a, b) => {
                const numA = parseFloat(a.chapter);
                const numB = parseFloat(b.chapter);
                // Handle cases where chapter is not a number (e.g., "extra", "oneshot")
                if (isNaN(numA) && isNaN(numB)) {
                    // If both are not numbers, sort by publish date as a fallback
                    return new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime();
                }
                if (isNaN(numA))
                    return 1; // Push non-numeric 'a' to the end
                if (isNaN(numB))
                    return -1; // Push non-numeric 'b' to the end
                return numB - numA; // Sort descending
            });
            return chapters;
        }
        catch (error) {
            console.error("Failed to fetch chapters:", error);
            throw new Error("Failed to fetch chapters");
        }
    });
}
