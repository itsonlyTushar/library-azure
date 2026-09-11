import { searchOpenLibrary } from "../services/openLibraryService.js";
import {
  addBookToCatalog,
  listCatalog,
  getCatalogBook,
  removeBookFromCatalog,
} from "../services/catalogService.js";
import prisma from "../db.js";

// GET /api/books - BROWSE THE PUBLIC CATALOG.
export async function getCatalog(req, res) {
  try {
    const result = await listCatalog({
      query: (req.query.q || "").toString(),
      genre: (req.query.genre || "").toString(),
      page: Number(req.query.page) || 1,
    });
    res.json(result);
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/books/:id - RETURN ONE PUBLIC CATALOG BOOK.
export async function getCatalogBookById(req, res) {
  try {
    const book = await getCatalogBook(Number(req.params.id));
    if (!book) return res.status(404).json({ error: "Book not found" });
    res.json({ book });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

// GET /api/books/search - SEARCH OPEN LIBRARY FOR ADMIN CATALOG UPDATES.
export async function searchExternal(req, res) {
  const query = (req.query.q || "").toString();
  if (!query.trim()) {
    return res.status(400).json({ error: "A search term is required" });
  }
  try {
    const results = await searchOpenLibrary(query, Number(req.query.page) || 1);

    // MARK RESULTS THAT ALREADY EXIST IN THE CATALOG.
    const keys = results.map((r) => r.open_library_key);
    const owned = await prisma.book.findMany({
      where: { openLibraryKey: { in: keys } },
      select: { openLibraryKey: true },
    });
    const ownedSet = new Set(owned.map((b) => b.openLibraryKey));

    res.json({
      results: results.map((r) => ({
        ...r,
        in_catalog: ownedSet.has(r.open_library_key),
      })),
    });
  } catch (err) {
    res.status(502).json({ error: err.message });
  }
}

// POST /api/books/catalog - ADD AN OPEN LIBRARY BOOK TO THE CATALOG.
export async function postCatalogBook(req, res) {
  const { open_library_key: openLibraryKey, genre } = req.body || {};
  if (!openLibraryKey || !/^\/works\/OL\w+/.test(openLibraryKey)) {
    return res
      .status(400)
      .json({ error: "A valid Open Library work key is required" });
  }
  try {
    const book = await addBookToCatalog({
      openLibraryKey,
      genre,
      addedByUserId: req.user.id,
    });
    res.status(201).json({ book });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

// DELETE /api/books/:id - REMOVE A CATALOG BOOK.
export async function deleteCatalogBook(req, res) {
  try {
    await removeBookFromCatalog(Number(req.params.id));
    res.json({ ok: true });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
