"use client";

import { useState, useEffect, useCallback } from "react";
import { api } from "@/services/api";
import { useAuth } from "@/services/AuthContext";

// Loads the current user's active loans (and full history) and exposes
// borrow/return actions. Used by the Books page (to disable already-borrowed
// titles) and the Profile page.
export function useBorrowedBooks() {
  const { user } = useAuth();
  const [borrowed, setBorrowed] = useState([]);
  const [history, setHistory] = useState([]);
  const [loading, setLoading] = useState(true);

  const refresh = useCallback(async () => {
    if (!user) {
      setBorrowed([]);
      setHistory([]);
      setLoading(false);
      return;
    }
    try {
      const [active, past] = await Promise.all([
        api.getBorrowed(),
        api.getHistory(),
      ]);
      setBorrowed(active.books);
      setHistory(past.books);
    } catch {
      setBorrowed([]);
      setHistory([]);
    } finally {
      setLoading(false);
    }
  }, [user]);

  useEffect(() => {
    refresh();
  }, [refresh]);

  const borrow = useCallback(
    async (bookId) => {
      const { books } = await api.borrowBook(bookId);
      setBorrowed(books);
      refresh();
    },
    [refresh]
  );

  const returnBook = useCallback(
    async (bookId) => {
      const { books } = await api.returnBook(bookId);
      setBorrowed(books);
      refresh();
    },
    [refresh]
  );

  // Book ids the user currently has out.
  const borrowedIds = borrowed.map((b) => b.book_id);

  return {
    borrowed,
    history,
    borrowedIds,
    loading,
    borrow,
    returnBook,
    refresh,
  };
}
