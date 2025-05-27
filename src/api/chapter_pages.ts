import axios from "axios";

interface ChapterPage {
  page: number;
  url: string;
}

export async function fetchChapterPages(
  chapterId: string
): Promise<ChapterPage[]> {
  try {
    const response = await axios.get(
      `https://api.mangadex.org/at-home/server/${chapterId}`
    );
    const { baseUrl, chapter } = response.data;

    const pages: ChapterPage[] = chapter.data.map(
      (filename: string, index: number) => ({
        page: index + 1,
        url: `${baseUrl}/data/${chapter.hash}/${filename}`,
      })
    );

    return pages;
  } catch (error) {
    console.error("Failed to fetch chapter pages:", error);
    throw new Error("Failed to load chapter images");
  }
}
