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
  const limit = 500;
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

    const chapters = response.data.data.map((chapter: any) => ({
      id: chapter.id,
      title: chapter.attributes.title,
      chapter: chapter.attributes.chapter,
      volume: chapter.attributes.volume,
      language: chapter.attributes.translatedLanguage,
      publishAt: chapter.attributes.publishAt,
      externalUrl: chapter.attributes.externalUrl,
    }));

    // Sort chapters by chapter number in descending order.
    // The `chapter` attribute can be a string, so we need to parse it.
    chapters.sort((a: any, b: any) => {
      const numA = parseFloat(a.chapter);
      const numB = parseFloat(b.chapter);

      // Handle cases where chapter is not a number (e.g., "extra", "oneshot")
      if (isNaN(numA) && isNaN(numB)) {
        // If both are not numbers, sort by publish date as a fallback
        return new Date(b.publishAt).getTime() - new Date(a.publishAt).getTime();
      }
      if (isNaN(numA)) return 1; // Push non-numeric 'a' to the end
      if (isNaN(numB)) return -1; // Push non-numeric 'b' to the end

      return numB - numA; // Sort descending
    });

    return chapters;
  } catch (error) {
    console.error("Failed to fetch chapters:", error);
    throw new Error("Failed to fetch chapters");
  }
}
