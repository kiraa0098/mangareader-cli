import chalk from 'chalk';

export function displayMangaDetails(manga: any): void {
  const title = manga.title.en || Object.values(manga.title)[0] || "Unknown Title";
  console.log(chalk.bold.yellow(`\n--- ${title} ---`));

  if (manga.description?.en) {
    console.log(chalk.cyan('\nDescription:'));
    console.log(manga.description.en.split('\n').map((line: string) => `  ${line}`).join('\n'));
  }

  console.log(chalk.cyan('\nDetails:'));
  console.log(`  - ID: ${manga.id}`);
  console.log(`  - Status: ${manga.status}`);
  console.log(`  - Year: ${manga.year}`);
  console.log(`  - Content Rating: ${manga.content_rating}`);
  
  if (manga.tags?.length > 0) {
    console.log(chalk.cyan('\nTags:'));
    console.log(`  ${manga.tags.join(', ')}`);
  }
  console.log('\n');
}
