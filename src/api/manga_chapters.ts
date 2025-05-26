import axios from "axios";

/**
 * Fetches English chapters for a given manga ID, paginated.
 *
 * @param mangaId - The MangaDex manga ID.
 * @param page - Optional page number (1-based). Default is 1.
 * @returns A Promise resolving to an array of chapter metadata.
 */
export async function fetchChaptersByMangaId(
  mangaId: string,
  page: number = 1
) {
  const limit = 100;
  const offset = (page - 1) * limit;

  try {
    const response = await axios.get(
      `https://api.mangadex.org/manga/${mangaId}/feed`,
      {
        params: {
          includeFuturePublishAt: 0,
          includeEmptyPages: 0,
          translatedLanguage: ["en"], // ✅ Filter by English only
          limit,
          offset,
          order: {
            chapter: "desc",
          },
        },
        paramsSerializer: (params) => {
          // Axios needs help serializing arrays into `translatedLanguage[]=en`
          const searchParams = new URLSearchParams();
          for (const key in params) {
            const value = params[key];
            if (Array.isArray(value)) {
              value.forEach((v) => searchParams.append(`${key}[]`, v));
            } else if (typeof value === "object") {
              for (const k in value) {
                searchParams.append(`${key}[${k}]`, value[k]);
              }
            } else {
              searchParams.append(key, value);
            }
          }
          return searchParams.toString();
        },
      }
    );

    return response.data.data.map((chapter: any) => ({
      id: chapter.id,
      title: chapter.attributes.title,
      chapter: chapter.attributes.chapter,
      volume: chapter.attributes.volume,
      language: chapter.attributes.translatedLanguage,
      publishAt: chapter.attributes.publishAt,
      externalUrl: chapter.attributes.externalUrl,
    }));
  } catch (error) {
    console.error("Failed to fetch chapters:", error);
    throw new Error("Failed to fetch chapters");
  }
}
