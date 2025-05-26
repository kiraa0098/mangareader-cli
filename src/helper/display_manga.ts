export function displayManga(mangas: any[], columns: number): void {
  const maxLengths: number[] = [];

  for (let col = 0; col < columns; col++) {
    let maxLength = 0;
    for (let i = col; i < mangas.length; i += columns) {
      const title = mangas[i].title.en || Object.values(mangas[i].title)[0];
      const label = `[${i + 1}] ${title}`;
      maxLength = Math.max(maxLength, label.length);
    }
    maxLengths.push(maxLength);
  }

  const rows = Math.ceil(mangas.length / columns);
  for (let row = 0; row < rows; row++) {
    let line = "";
    for (let col = 0; col < columns; col++) {
      const index = row + col * rows;
      if (index < mangas.length) {
        const manga = mangas[index];
        const title = manga.title.en || Object.values(manga.title)[0];
        const label = `[${index + 1}] ${title}`;
        line += label.padEnd(maxLengths[col] + 2);
      }
    }
    console.log(line);
  }
}
