import axios from "axios";

export const searchMangaAPI = async (title: string, page: number) => {
  const limit = 100;
  const offset = (page - 1) * limit;

  try {
    const response = await axios.get("https://api.mangadex.org/manga", {
      params: {
        title,
        limit: limit,
        offset: offset,
        includes: ["author", "artist", "cover_art"],
      },
    });

    const mangas = response.data.data;
    const total_count = response.data.total;

    const total_pages = Math.ceil(total_count / limit);
    const detailed_results = await Promise.all(
      mangas.map(async (manga: any) => {
        const attrs = manga.attributes;
        const cover_rel = manga.relationships.find(
          (rel: any) => rel.type === "cover_art"
        );

        let cover_file_name = null;
        if (cover_rel) {
          const cover_id = cover_rel.id;

          const cover_response = await axios.get(
            `https://api.mangadex.org/cover/${cover_id}`
          );
          cover_file_name = cover_response.data.data.attributes.fileName;
        }

        const cover_url = cover_file_name
          ? `https://uploads.mangadex.org/covers/${manga.id}/${cover_file_name}.512.jpg`
          : null;

        return {
          id: manga.id,
          title: attrs.title,
          alt_titles: attrs.altTitles,
          description: attrs.description,
          status: attrs.status,
          year: attrs.year,
          original_language: attrs.originalLanguage,
          last_volume: attrs.lastVolume,
          last_chapter: attrs.lastChapter,
          demographic: attrs.publicationDemographic,
          content_rating: attrs.contentRating,
          tags: attrs.tags.map((tag: any) => tag.attributes.name.en),
          links: attrs.links,
          created_at: attrs.createdAt,
          updated_at: attrs.updatedAt,
          available_translated_languages: attrs.availableTranslatedLanguages,
          latest_uploaded_chapter: attrs.latestUploadedChapter,
          cover_url,
        };
      })
    );

    return { mangas: detailed_results, total_pages };
  } catch (error) {
    console.error("MangaDex API error:", error);
    throw new Error("Failed to fetch manga data from MangaDex API");
  }
};
