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
exports.searchMangaAPI = void 0;
const axios_1 = __importDefault(require("axios"));
const searchMangaAPI = (title, page) => __awaiter(void 0, void 0, void 0, function* () {
    const limit = 100;
    const offset = (page - 1) * limit;
    try {
        const response = yield axios_1.default.get("https://api.mangadex.org/manga", {
            params: {
                title,
                limit: limit,
                offset: offset,
                includes: ["author", "artist", "cover_art"],
            },
        });
        const mangas = response.data.data;
        const total_count = response.data.total;
        const total_pages = Math.ceil(total_count / limit);
        const detailed_results = yield Promise.all(mangas.map((manga) => __awaiter(void 0, void 0, void 0, function* () {
            const attrs = manga.attributes;
            const cover_rel = manga.relationships.find((rel) => rel.type === "cover_art");
            let cover_file_name = null;
            if (cover_rel) {
                const cover_id = cover_rel.id;
                const cover_response = yield axios_1.default.get(`https://api.mangadex.org/cover/${cover_id}`);
                cover_file_name = cover_response.data.data.attributes.fileName;
            }
            const cover_url = cover_file_name
                ? `https://uploads.mangadex.org/covers/${manga.id}/${cover_file_name}.512.jpg`
                : null;
            return {
                id: manga.id,
                title: attrs.title,
                alt_titles: attrs.altTitles,
                description: attrs.description,
                status: attrs.status,
                year: attrs.year,
                original_language: attrs.originalLanguage,
                last_volume: attrs.lastVolume,
                last_chapter: attrs.lastChapter,
                demographic: attrs.publicationDemographic,
                content_rating: attrs.contentRating,
                tags: attrs.tags.map((tag) => tag.attributes.name.en),
                links: attrs.links,
                created_at: attrs.createdAt,
                updated_at: attrs.updatedAt,
                available_translated_languages: attrs.availableTranslatedLanguages,
                latest_uploaded_chapter: attrs.latestUploadedChapter,
                cover_url,
            };
        })));
        return { mangas: detailed_results, total_pages };
    }
    catch (error) {
        console.error("MangaDex API error:", error);
        throw new Error("Failed to fetch manga data from MangaDex API");
    }
});
exports.searchMangaAPI = searchMangaAPI;
