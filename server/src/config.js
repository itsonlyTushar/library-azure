export const LOAN_PERIOD_DAYS = 14;

export const OPEN_LIBRARY = {
  searchUrl: "https://openlibrary.org/search.json",
  workUrl: (key) => `https://openlibrary.org${key}.json`,
  coverUrl: (id, size = "L") =>
    `https://covers.openlibrary.org/b/id/${id}-${size}.jpg`,
  pageSize: 24,
};

export const STORAGE = {
  connectionString: process.env.AZURE_STORAGE_CONNECTION_STRING || "",
  container: process.env.AZURE_STORAGE_CONTAINER || "book-covers",
};

export const CATALOG_PAGE_SIZE = 24;
