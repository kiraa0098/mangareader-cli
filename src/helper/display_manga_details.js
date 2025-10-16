"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.displayMangaDetails = displayMangaDetails;
const chalk_1 = __importDefault(require("chalk"));
function displayMangaDetails(manga) {
    var _a, _b;
    const title = manga.title.en || Object.values(manga.title)[0] || "Unknown Title";
    console.log(chalk_1.default.bold.yellow(`\n--- ${title} ---`));
    if ((_a = manga.description) === null || _a === void 0 ? void 0 : _a.en) {
        console.log(chalk_1.default.cyan('\nDescription:'));
        console.log(manga.description.en.split('\n').map((line) => `  ${line}`).join('\n'));
    }
    console.log(chalk_1.default.cyan('\nDetails:'));
    console.log(`  - Status: ${manga.status}`);
    console.log(`  - Year: ${manga.year}`);
    console.log(`  - Content Rating: ${manga.content_rating}`);
    if (((_b = manga.tags) === null || _b === void 0 ? void 0 : _b.length) > 0) {
        console.log(chalk_1.default.cyan('\nTags:'));
        console.log(`  ${manga.tags.join(', ')}`);
    }
    console.log('\n');
}
