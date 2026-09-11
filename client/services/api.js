const API_URL = process.env.NEXT_PUBLIC_API_URL || "http://localhost:4000/api";

const TOKEN_KEY = "library_token";

export function getToken() {
  if (typeof window === "undefined") return null;
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function clearToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// Small wrapper around fetch that adds the auth header and parses JSON.
async function request(path, { method = "GET", body, auth = false } = {}) {
  const headers = { "Content-Type": "application/json" };
  if (auth) {
    const token = getToken();
    if (token) headers.Authorization = `Bearer ${token}`;
  }

  const res = await fetch(`${API_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const data = await res.json().catch(() => ({}));
  if (!res.ok) {
    throw new Error(data.error || "Something went wrong");
  }
  return data;
}

export const api = {
  register: (payload) => request("/auth/register", { method: "POST", body: payload }),
  login: (payload) => request("/auth/login", { method: "POST", body: payload }),
  me: () => request("/auth/me", { auth: true }),

  // Catalog (our own DB)
  getBooks: ({ q = "", genre = "", page = 1 } = {}) => {
    const params = new URLSearchParams();
    if (q) params.set("q", q);
    if (genre) params.set("genre", genre);
    if (page > 1) params.set("page", String(page));
    const qs = params.toString();
    return request(`/books${qs ? `?${qs}` : ""}`);
  },
  getBook: (id) => request(`/books/${id}`),

  // Borrowing
  getBorrowed: () => request("/books/borrowed", { auth: true }),
  getHistory: () => request("/books/history", { auth: true }),
  borrowBook: (bookId) =>
    request("/books/borrow", { method: "POST", body: { book_id: bookId }, auth: true }),
  returnBook: (bookId) =>
    request("/books/return", { method: "POST", body: { book_id: bookId }, auth: true }),

  // Admin catalog management
  searchExternal: (q) =>
    request(`/books/search?q=${encodeURIComponent(q)}`, { auth: true }),
  addCatalogBook: (openLibraryKey, genre) =>
    request("/books/catalog", {
      method: "POST",
      body: { open_library_key: openLibraryKey, genre },
      auth: true,
    }),
  deleteCatalogBook: (id) =>
    request(`/books/${id}`, { method: "DELETE", auth: true }),
};
