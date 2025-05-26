export function displayChapters(chapters: any[], columns: number): void {
  const maxLengths: number[] = [];

  for (let col = 0; col < columns; col++) {
    let maxLength = 0;
    for (let i = col; i < chapters.length; i += columns) {
      const chapterNum = chapters[i].chapter || "N/A";
      const chapterTitle = chapters[i].title || "No Title";
      const label = `[${i + 1}] Ch. ${chapterNum}: ${chapterTitle}`;
      maxLength = Math.max(maxLength, label.length);
    }
    maxLengths.push(maxLength);
  }

  const rows = Math.ceil(chapters.length / columns);
  for (let row = 0; row < rows; row++) {
    let line = "";
    for (let col = 0; col < columns; col++) {
      const index = row + col * rows;
      if (index < chapters.length) {
        const chapter = chapters[index];
        const chapterNum = chapter.chapter || "N/A";
        const chapterTitle = chapter.title || "No Title";
        const label = `[${index + 1}] Ch. ${chapterNum}: ${chapterTitle}`;
        line += label.padEnd(maxLengths[col] + 2);
      }
    }
    console.log(line);
  }
}
