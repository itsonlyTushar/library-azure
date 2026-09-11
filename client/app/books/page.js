"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { api } from "@/services/api";
import { useAuth } from "@/services/AuthContext";
import { useBorrowedBooks } from "@/hooks/useBorrowedBooks";
import { useToast } from "@/hooks/useToast";
import { previewDueDate, formatDate } from "@/services/dates";
import BookCard from "@/components/BookCard";
import BookCardSkeleton from "@/components/BookCardSkeleton";
import EmptyState from "@/components/EmptyState";
import Toast from "@/components/Toast";
import Modal from "@/components/Modal";
import Icon from "@/components/Icon";

const GENRES = [
  "Fiction",
  "Fantasy",
  "Science",
  "History",
  "Biography",
  "Programming",
];

export default function BooksPage() {
  const { user } = useAuth();
  const router = useRouter();
  const { borrowedIds, borrow } = useBorrowedBooks();
  const { toast, showToast, clearToast } = useToast();

  const [query, setQuery] = useState("");
  const [search, setSearch] = useState("");
  const [genre, setGenre] = useState("");
  const [books, setBooks] = useState([]);
  const [loading, setLoading] = useState(true);

  const [pendingBook, setPendingBook] = useState(null);
  const [confirming, setConfirming] = useState(false);

  // Load the catalog (from our own DB) whenever the search or genre changes.
  useEffect(() => {
    let cancelled = false;
    async function loadBooks() {
      setLoading(true);
      try {
        const { books } = await api.getBooks({ q: search, genre });
        if (!cancelled) setBooks(books);
      } catch (err) {
        if (!cancelled) showToast(err.message, "error");
      } finally {
        if (!cancelled) setLoading(false);
      }
    }
    loadBooks();
    return () => {
      cancelled = true;
    };
  }, [search, genre, showToast]);

  function handleSearch(e) {
    e.preventDefault();
    setSearch(query.trim());
  }

  function handleChip(g) {
    setGenre((current) => (current === g ? "" : g));
  }

  function requestBorrow(book) {
    if (!user) {
      router.push("/login");
      return;
    }
    setPendingBook(book);
  }

  async function confirmBorrow() {
    setConfirming(true);
    try {
      await borrow(pendingBook.id);
      showToast(`"${pendingBook.title}" borrowed - due ${previewDueDate()}`);
      setPendingBook(null);
    } catch (err) {
      showToast(err.message, "error");
    } finally {
      setConfirming(false);
    }
  }

  return (
    <div className="mx-auto my-6 max-w-6xl px-6">
      <div className="card p-8">
        <div className="mb-6 flex items-start justify-between gap-4">
          <div>
            <h1 className="mb-1 text-2xl">Browse Books</h1>
            <p className="text-sm">
              Search the library catalog and borrow a book with one click.
            </p>
          </div>
          {user?.role === "ADMIN" && (
            <Link href="/admin/books" className="btn btn-secondary btn-sm">
              <Icon name="bookmark" size={14} />
              Manage catalog
            </Link>
          )}
        </div>

        <form onSubmit={handleSearch} className="mb-3.5 flex gap-2">
          <div className="relative flex-1">
            <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-body">
              <Icon name="search" size={16} />
            </span>
            <input
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              placeholder="Search by title or author"
              aria-label="Search books"
              className="input pl-9"
            />
          </div>
          <button className="btn btn-primary" type="submit">
            Search
          </button>
        </form>

        <div className="mb-6 flex flex-wrap gap-2">
          {GENRES.map((g) => (
            <button
              key={g}
              onClick={() => handleChip(g)}
              className={`rounded-full border px-3 py-1.5 text-xs transition-colors ${
                genre === g
                  ? "border-primary bg-primary text-white"
                  : "border-border bg-surface hover:bg-background"
              }`}
            >
              {g}
            </button>
          ))}
        </div>

        {loading ? (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-5">
            {Array.from({ length: 12 }).map((_, i) => (
              <BookCardSkeleton key={i} />
            ))}
          </div>
        ) : books.length === 0 ? (
          <EmptyState icon="search" title="No books in the catalog">
            {search || genre
              ? "Try a different search."
              : user?.role === "ADMIN"
                ? "Add books from the Manage catalog page."
                : "Check back soon - the library is still stocking its shelves."}
          </EmptyState>
        ) : (
          <div className="grid grid-cols-[repeat(auto-fill,minmax(190px,1fr))] gap-5">
            {books.map((book) => (
              <BookCard
                key={book.id}
                book={book}
                onBorrow={requestBorrow}
                borrowed={borrowedIds.includes(book.id)}
              />
            ))}
          </div>
        )}
      </div>

      <Modal
        open={!!pendingBook}
        onClose={() => !confirming && setPendingBook(null)}
        title="Confirm borrow"
      >
        {pendingBook && (
          <>
            <p className="mb-4 text-sm">
              You are about to borrow{" "}
              <strong className="text-heading">{pendingBook.title}</strong> by{" "}
              {pendingBook.author || "Unknown author"}.
            </p>

            <div className="mb-5 flex items-center gap-3 rounded-lg border border-border bg-background p-3">
              <span className="text-primary">
                <Icon name="bookmark" size={18} />
              </span>
              <div>
                <p className="text-xs text-body">Return by</p>
                <p className="text-sm font-semibold text-heading">
                  {formatDate(previewDueDate())}
                </p>
              </div>
            </div>

            <div className="flex justify-end gap-2">
              <button
                className="btn btn-secondary btn-sm"
                onClick={() => setPendingBook(null)}
                disabled={confirming}
              >
                Cancel
              </button>
              <button
                className="btn btn-primary btn-sm"
                onClick={confirmBorrow}
                disabled={confirming}
              >
                {confirming ? "Borrowing..." : "Confirm Borrow"}
              </button>
            </div>
          </>
        )}
      </Modal>

      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </div>
  );
}
