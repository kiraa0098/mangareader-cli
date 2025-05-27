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
exports.fetchChapterPages = fetchChapterPages;
const axios_1 = __importDefault(require("axios"));
function fetchChapterPages(chapterId) {
    return __awaiter(this, void 0, void 0, function* () {
        try {
            const response = yield axios_1.default.get(`https://api.mangadex.org/at-home/server/${chapterId}`);
            const { baseUrl, chapter } = response.data;
            const pages = chapter.data.map((filename, index) => ({
                page: index + 1,
                url: `${baseUrl}/data/${chapter.hash}/${filename}`,
            }));
            return pages;
        }
        catch (error) {
            console.error("Failed to fetch chapter pages:", error);
            throw new Error("Failed to load chapter images");
        }
    });
}
