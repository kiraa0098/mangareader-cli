import axios from "axios";

export const fetch_maganda_details_by_id_API = async (manga_id: string) => {
  try {
    // Fetch the main manga data
    const response = await axios.get(
      `https://api.mangadex.org/manga/${manga_id}`,
      {
        params: {
          includes: ["author", "artist", "cover_art"],
        },
      }
    );

    const manga = response.data.data;
    const attrs = manga.attributes;

    const coverRel = manga.relationships.find(
      (rel: any) => rel.type === "cover_art"
    );

    let coverFileName = null;
    if (coverRel) {
      const coverId = coverRel.id;
      const coverResponse = await axios.get(
        `https://api.mangadex.org/cover/${coverId}`
      );
      coverFileName = coverResponse.data.data.attributes.fileName;
    }

    const coverUrl = coverFileName
      ? `https://uploads.mangadex.org/covers/${manga.id}/${coverFileName}.512.jpg`
      : null;

    return {
      id: manga.id,
      title: attrs.title,
      altTitles: attrs.altTitles,
      description: attrs.description,
      status: attrs.status,
      year: attrs.year,
      originalLanguage: attrs.originalLanguage,
      lastVolume: attrs.lastVolume,
      lastChapter: attrs.lastChapter,
      demographic: attrs.publicationDemographic,
      contentRating: attrs.contentRating,
      tags: attrs.tags.map((tag: any) => tag.attributes.name.en),
      links: attrs.links,
      createdAt: attrs.createdAt,
      updatedAt: attrs.updatedAt,
      availableTranslatedLanguages: attrs.availableTranslatedLanguages,
      latestUploadedChapter: attrs.latestUploadedChapter,
      coverUrl,
    };
  } catch (error) {
    console.error("Failed to fetch manga by ID:", error);
    throw new Error("Manga fetch error");
  }
};
