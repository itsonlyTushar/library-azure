import {
  listBorrowedBooks,
  listBorrowingHistory,
  borrowBook,
  returnBook,
} from "../services/bookService.js";

export async function getBorrowed(req, res) {
  try {
    res.json({ books: await listBorrowedBooks(req.user.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function getHistory(req, res) {
  try {
    res.json({ books: await listBorrowingHistory(req.user.id) });
  } catch (err) {
    res.status(500).json({ error: err.message });
  }
}

export async function postBorrow(req, res) {
  const bookId = Number(req.body?.book_id);
  if (!bookId) {
    return res.status(400).json({ error: "book_id is required" });
  }
  try {
    const books = await borrowBook(req.user.id, bookId);
    res.status(201).json({ books });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}

export async function postReturn(req, res) {
  const bookId = Number(req.body?.book_id);
  if (!bookId) {
    return res.status(400).json({ error: "book_id is required" });
  }
  try {
    const books = await returnBook(req.user.id, bookId);
    res.json({ books });
  } catch (err) {
    res.status(400).json({ error: err.message });
  }
}
