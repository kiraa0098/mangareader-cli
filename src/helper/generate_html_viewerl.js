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
exports.generateHtmlViewer = generateHtmlViewer;
const promises_1 = __importDefault(require("fs/promises"));
const path_1 = __importDefault(require("path"));
const os_1 = __importDefault(require("os"));
function generateHtmlViewer(imageUrls, title) {
    return __awaiter(this, void 0, void 0, function* () {
        const htmlContent = `
      <!DOCTYPE html>
      <html lang="en">
      <head>
        <meta charset="UTF-8">
        <title>${title}</title>
        <style>
          body {
            margin: 0;
            background: #000;
            color: #fff;
            font-family: sans-serif;
            text-align: center;
          }
          img {
            width: 100%;
            max-width: 1000px;
            margin: 0 auto;
            display: block;
            margin-bottom: 16px;
          }
        </style>
      </head>
      <body>
        <h1>${title}</h1>
        ${imageUrls
            .map((url) => `<img src="${url}" loading="lazy" />`)
            .join("\n")}
      </body>
      </html>
    `;
        const tmpDir = yield promises_1.default.mkdtemp(path_1.default.join(os_1.default.tmpdir(), "manga-chapter-"));
        const filePath = path_1.default.join(tmpDir, "chapter.html");
        yield promises_1.default.writeFile(filePath, htmlContent, "utf-8");
        return filePath;
    });
}
