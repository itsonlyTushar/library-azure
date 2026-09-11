import prisma from "../db.js";
import { CATALOG_PAGE_SIZE } from "../config.js";
import {
  fetchWorkDetails,
  downloadCover,
} from "./openLibraryService.js";
import { uploadImage, isStorageConfigured } from "./storageService.js";

// NORMALIZE AN OPEN LIBRARY WORK PATH TO ITS WORK IDENTIFIER.
function blobNameForKey(openLibraryKey) {
  const id = openLibraryKey.split("/").filter(Boolean).pop();
  return `${id}.jpg`;
}

function toApiShape(book) {
  return {
    id: book.id,
    open_library_key: book.openLibraryKey,
    title: book.title,
    author: book.author,
    description: book.description,
    genre: book.genre,
    isbn: book.isbn,
    first_publish_year: book.firstPublishYear,
    cover_url: book.coverBlobUrl,
    created_at: book.createdAt,
  };
}

export async function addBookToCatalog({ openLibraryKey, genre, addedByUserId }) {
  const existing = await prisma.book.findUnique({ where: { openLibraryKey } });
  if (existing) {
    throw new Error("That book is already in the catalog");
  }

  const details = await fetchWorkDetails(openLibraryKey);

  let coverBlobUrl = null;
  if (details.coverId && isStorageConfigured()) {
    const cover = await downloadCover(details.coverId);
    if (cover) {
      coverBlobUrl = await uploadImage(
        blobNameForKey(openLibraryKey),
        cover.data,
        cover.contentType
      );
    }
  }

  const book = await prisma.book.create({
    data: {
      openLibraryKey,
      title: details.title,
      author: details.author,
      description: details.description,
      genre: genre || details.subjects[0] || null,
      firstPublishYear: details.firstPublishYear,
      coverBlobUrl,
      addedByUserId,
    },
  });

  return toApiShape(book);
}

export async function listCatalog({ query = "", genre = "", page = 1 } = {}) {
  const where = {};
  if (query) where.OR = [{ title: { contains: query } }, { author: { contains: query } }];
  if (genre) where.genre = { contains: genre };

  const [total, books] = await Promise.all([
    prisma.book.count({ where }),
    prisma.book.findMany({
      where,
      orderBy: { createdAt: "desc" },
      skip: (page - 1) * CATALOG_PAGE_SIZE,
      take: CATALOG_PAGE_SIZE,
    }),
  ]);

  return {
    books: books.map(toApiShape),
    total,
    page,
    page_size: CATALOG_PAGE_SIZE,
    total_pages: Math.max(1, Math.ceil(total / CATALOG_PAGE_SIZE)),
  };
}

export async function getCatalogBook(id) {
  const book = await prisma.book.findUnique({ where: { id } });
  return book ? toApiShape(book) : null;
}

export async function removeBookFromCatalog(id) {
  const activeLoans = await prisma.borrowing.count({
    where: { bookId: id, status: "BORROWED" },
  });
  if (activeLoans > 0) {
    throw new Error("Cannot remove a book that is currently borrowed");
  }
  // PREVENT DELETION WHEN BORROWING HISTORY EXISTS.
  const anyLoans = await prisma.borrowing.count({ where: { bookId: id } });
  if (anyLoans > 0) {
    throw new Error("Cannot remove a book that has borrowing history");
  }
  await prisma.book.delete({ where: { id } });
}

export { toApiShape as bookToApiShape };
