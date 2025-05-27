import fs from "fs/promises";
import path from "path";
import os from "os";

export async function generateHtmlViewer(
  imageUrls: string[],
  title: string
): Promise<string> {
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

  const tmpDir = await fs.mkdtemp(path.join(os.tmpdir(), "manga-chapter-"));
  const filePath = path.join(tmpDir, "chapter.html");
  await fs.writeFile(filePath, htmlContent, "utf-8");

  return filePath;
}
