import { OPEN_LIBRARY } from "../config.js";

const SEARCH_TTL_MS = 5 * 60 * 1000;
const searchCache = new Map();

export async function searchOpenLibrary(query = "programming", page = 1) {
  const cacheKey = `${query.toLowerCase()}::${page}`;
  const hit = searchCache.get(cacheKey);
  if (hit && Date.now() - hit.at < SEARCH_TTL_MS) return hit.data;

  const params = new URLSearchParams({
    q: query,
    page: String(page),
    limit: String(OPEN_LIBRARY.pageSize),
    fields:
      "key,title,author_name,first_publish_year,cover_i,edition_count,isbn",
  });

  const res = await fetch(`${OPEN_LIBRARY.searchUrl}?${params.toString()}`);
  if (!res.ok) throw new Error("Failed to search Open Library");

  const data = await res.json();
  const results = (data.docs || []).map((doc) => ({
    open_library_key: doc.key,
    title: doc.title,
    author: doc.author_name ? doc.author_name[0] : "Unknown",
    first_publish_year: doc.first_publish_year || null,
    isbn: doc.isbn ? doc.isbn[0] : null,
    cover_id: doc.cover_i || null,
    edition_count: doc.edition_count || 0,
  }));

  searchCache.set(cacheKey, { at: Date.now(), data: results });
  return results;
}

// NORMALIZE OPEN LIBRARY DESCRIPTIONS THAT MAY BE STRINGS OR VALUE OBJECTS.
function normaliseDescription(desc) {
  if (!desc) return null;
  if (typeof desc === "string") return desc;
  if (typeof desc === "object" && desc.value) return desc.value;
  return null;
}

export async function fetchWorkDetails(openLibraryKey) {
  const res = await fetch(OPEN_LIBRARY.workUrl(openLibraryKey));
  if (!res.ok) {
    throw new Error(`Open Library work ${openLibraryKey} not found`);
  }
  const work = await res.json();

  // FETCH THE AUTHOR SEPARATELY BECAUSE WORKS STORE AUTHOR KEYS ONLY.
  let author = null;
  const authorKey = work.authors?.[0]?.author?.key;
  if (authorKey) {
    try {
      const aRes = await fetch(`https://openlibrary.org${authorKey}.json`);
      if (aRes.ok) author = (await aRes.json()).name || null;
    } catch {
      // AUTHOR LOOKUP FAILURE DOES NOT INVALIDATE THE WORK.
    }
  }

  const coverId = Array.isArray(work.covers) ? work.covers[0] : null;

  return {
    title: work.title,
    author,
    description: normaliseDescription(work.description),
    firstPublishYear: work.first_publish_date
      ? parseInt(String(work.first_publish_date).match(/\d{4}/)?.[0], 10) || null
      : null,
    subjects: Array.isArray(work.subjects) ? work.subjects.slice(0, 5) : [],
    coverId,
  };
}

export async function downloadCover(coverId) {
  if (!coverId) return null;
  const res = await fetch(OPEN_LIBRARY.coverUrl(coverId, "L"));
  if (!res.ok) return null;

  const contentType = res.headers.get("content-type") || "image/jpeg";
  const buf = Buffer.from(await res.arrayBuffer());
  // REJECT OPEN LIBRARY'S TINY PLACEHOLDER IMAGE WHEN NO COVER EXISTS.
  if (buf.length < 1000) return null;

  return { data: buf, contentType };
}
