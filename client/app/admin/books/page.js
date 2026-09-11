"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { useAuth } from "@/services/AuthContext";
import { useToast } from "@/hooks/useToast";
import EmptyState from "@/components/EmptyState";
import Toast from "@/components/Toast";
import Icon from "@/components/Icon";

export default function AdminBooksPage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { toast, showToast, clearToast } = useToast();

  const [catalog, setCatalog] = useState([]);
  const [loadingCatalog, setLoadingCatalog] = useState(true);

  const [query, setQuery] = useState("");
  const [results, setResults] = useState(null);
  const [searching, setSearching] = useState(false);
  const [addingKey, setAddingKey] = useState(null);

  // Gate: admins only.
  useEffect(() => {
    if (!authLoading && (!user || user.role !== "ADMIN")) {
      router.replace(user ? "/books" : "/login");
    }
  }, [authLoading, user, router]);

  const loadCatalog = useCallback(async () => {
    setLoadingCatalog(true);
    try {
      const { books } = await api.getBooks({ page: 1 });
      setCatalog(books);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setLoadingCatalog(false);
    }
  }, [showToast]);

  useEffect(() => {
    if (user?.role === "ADMIN") loadCatalog();
  }, [user, loadCatalog]);

  async function handleSearch(e) {
    e.preventDefault();
    if (!query.trim()) return;
    setSearching(true);
    setResults(null);
    try {
      const { results } = await api.searchExternal(query.trim());
      setResults(results);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setSearching(false);
    }
  }

  async function handleAdd(result) {
    setAddingKey(result.open_library_key);
    try {
      await api.addCatalogBook(result.open_library_key);
      showToast(`"${result.title}" added to the catalog`);
      setResults((prev) =>
        prev.map((r) =>
          r.open_library_key === result.open_library_key
            ? { ...r, in_catalog: true }
            : r
        )
      );
      loadCatalog();
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setAddingKey(null);
    }
  }

  async function handleRemove(book) {
    if (!confirm(`Remove "${book.title}" from the catalog?`)) return;
    try {
      await api.deleteCatalogBook(book.id);
      showToast(`"${book.title}" removed`);
      loadCatalog();
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  if (authLoading || !user || user.role !== "ADMIN") {
    return (
      <div className="mx-auto my-6 max-w-6xl px-6">
        <div className="card p-8 text-sm">Loading...</div>
      </div>
    );
  }

  return (
    <div className="mx-auto my-6 max-w-6xl px-6">
      <div className="card p-8">
        <h1 className="mb-1 text-2xl">Manage Catalog</h1>
        <p className="mb-6 text-sm">
          Search the Open Library, then add a book. The cover image is downloaded
          and stored in the library&apos;s own Azure Blob Storage.
        </p>

        <form onSubmit={handleSearch} className="mb-4 flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body">
              <Icon name="search" size={16} />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search Open Library by title, author, ISBN"
              aria-label="Search Open Library"
              className="input pl-9"
            />
          </div>
          <button className="btn btn-primary" type="submit" disabled={searching}>
            {searching ? "Searching..." : "Search"}
          </button>
        </form>

        {results && (
          <div className="mb-8 overflow-hidden rounded-xl border border-border">
            {results.length === 0 ? (
              <p className="p-4 text-sm text-body">No results.</p>
            ) : (
              results.map((r) => (
                <div
                  key={r.open_library_key}
                  className="flex items-center gap-4 border-b border-border px-4 py-3 last:border-b-0"
                >
                  <div className="flex-1">
                    <p className="text-sm font-semibold text-heading">
                      {r.title}
                    </p>
                    <p className="text-xs text-body">
                      {r.author}
                      {r.first_publish_year ? ` · ${r.first_publish_year}` : ""}
                    </p>
                  </div>
                  {r.in_catalog ? (
                    <span className="text-xs font-medium text-success">
                      In catalog
                    </span>
                  ) : (
                    <button
                      className="btn btn-primary btn-sm"
                      onClick={() => handleAdd(r)}
                      disabled={addingKey === r.open_library_key}
                    >
                      {addingKey === r.open_library_key ? "Adding..." : "Add"}
                    </button>
                  )}
                </div>
              ))
            )}
          </div>
        )}

        <h2 className="mb-3.5 border-b border-border pb-2 text-lg">
          Catalog ({catalog.length})
        </h2>

        {loadingCatalog ? (
          <p className="text-sm">Loading...</p>
        ) : catalog.length === 0 ? (
          <EmptyState title="Catalog is empty">
            Search above and add your first book.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-3">
            {catalog.map((book) => (
              <div
                key={book.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-3"
              >
                {book.cover_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={book.cover_url}
                    alt={book.title}
                    className="h-16 w-11 flex-shrink-0 rounded bg-border object-cover"
                  />
                ) : (
                  <div className="h-16 w-11 flex-shrink-0 rounded bg-border" />
                )}
                <div className="flex-1">
                  <p className="font-semibold text-heading">{book.title}</p>
                  <p className="text-sm">{book.author || "Unknown author"}</p>
                  <p className="mt-0.5 text-xs text-body">
                    {book.genre || "Uncategorised"}
                    {book.cover_url ? " · cover stored" : " · no cover"}
                  </p>
                </div>
                <button
                  className="btn btn-danger btn-sm"
                  onClick={() => handleRemove(book)}
                >
                  Remove
                </button>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </div>
  );
}
