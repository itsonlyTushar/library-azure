import prisma from "../db.js";
import { LOAN_PERIOD_DAYS } from "../config.js";
import { bookToApiShape } from "./catalogService.js";

const DAY_MS = 24 * 60 * 60 * 1000;

// MAP A BORROWING RECORD TO THE CLIENT RESPONSE SHAPE WITH CURRENT DUE-DATE STATUS.
function toApiShape(row) {
  const now = Date.now();
  const due = row.dueDate.getTime();
  const isActive = row.status === "BORROWED";

  return {
    id: row.id,
    book_id: row.bookId,
    status: row.status,
    borrowed_at: row.borrowedAt,
    due_date: row.dueDate,
    returned_at: row.returnedAt,
    overdue: isActive && due < now,
    days_remaining: isActive ? Math.ceil((due - now) / DAY_MS) : null,
    book: row.book ? bookToApiShape(row.book) : null,
  };
}

export async function listBorrowedBooks(userId) {
  const rows = await prisma.borrowing.findMany({
    where: { userId, status: "BORROWED" },
    orderBy: { borrowedAt: "desc" },
    include: { book: true },
  });
  return rows.map(toApiShape);
}

export async function listBorrowingHistory(userId) {
  const rows = await prisma.borrowing.findMany({
    where: { userId },
    orderBy: { borrowedAt: "desc" },
    include: { book: true },
  });
  return rows.map(toApiShape);
}

export async function borrowBook(userId, bookId) {
  const book = await prisma.book.findUnique({ where: { id: bookId } });
  if (!book) {
    throw new Error("Book not found in catalog");
  }

  const active = await prisma.borrowing.findFirst({
    where: { userId, bookId, status: "BORROWED" },
  });
  if (active) {
    throw new Error("You have already borrowed this book");
  }

  const dueDate = new Date();
  dueDate.setDate(dueDate.getDate() + LOAN_PERIOD_DAYS);

  await prisma.borrowing.create({
    data: { userId, bookId, dueDate, status: "BORROWED" },
  });

  return listBorrowedBooks(userId);
}

export async function returnBook(userId, bookId) {
  const active = await prisma.borrowing.findFirst({
    where: { userId, bookId, status: "BORROWED" },
  });
  if (!active) {
    throw new Error("That book is not in your borrowed list");
  }

  await prisma.borrowing.update({
    where: { id: active.id },
    data: { status: "RETURNED", returnedAt: new Date() },
  });

  return listBorrowedBooks(userId);
}
