"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/services/AuthContext";
import { useBorrowedBooks } from "@/hooks/useBorrowedBooks";
import { useToast } from "@/hooks/useToast";
import { formatDate, dueStatus } from "@/services/dates";
import EmptyState from "@/components/EmptyState";
import Toast from "@/components/Toast";

const TONE_CLASS = {
  danger: "border-danger bg-danger/10 text-danger",
  warn: "border-warning bg-warning/10 text-warning",
  ok: "border-border text-body",
};

export default function ProfilePage() {
  const { user, loading: authLoading } = useAuth();
  const router = useRouter();
  const { borrowed, history, loading, returnBook } = useBorrowedBooks();
  const { toast, showToast, clearToast } = useToast();
  const [tab, setTab] = useState("active");

  useEffect(() => {
    if (!authLoading && !user) {
      router.push("/login");
    }
  }, [authLoading, user, router]);

  async function handleReturn(loan) {
    try {
      await returnBook(loan.book_id);
      showToast(`"${loan.book?.title || "Book"}" returned`);
    } catch (err) {
      showToast(err.message, "error");
    }
  }

  if (authLoading || !user) {
    return (
      <div className="mx-auto my-6 max-w-6xl px-6">
        <div className="card p-8 text-sm">Loading...</div>
      </div>
    );
  }

  const returnedHistory = history.filter((b) => b.status === "RETURNED");
  const overdueCount = borrowed.filter((b) => b.overdue).length;

  return (
    <div className="mx-auto my-6 max-w-6xl px-6">
      <div className="card p-8">
        <h1 className="mb-1 text-2xl">My Profile</h1>
        <p className="mb-6 text-sm">Your account and borrowing activity.</p>

        <div className="flex items-center gap-5 rounded-xl border border-border bg-background p-5">
          <div className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-primary text-xl font-bold text-white">
            {user.name.charAt(0).toUpperCase()}
          </div>
          <div>
            <p className="font-heading text-lg font-semibold text-heading">
              {user.name}
              {user.role === "ADMIN" && (
                <span className="ml-2 rounded bg-primary px-1.5 py-0.5 text-xs font-semibold text-white">
                  Admin
                </span>
              )}
            </p>
            <p className="text-sm">{user.email}</p>
            <p className="text-sm">
              {borrowed.length} active loan{borrowed.length === 1 ? "" : "s"}
              {overdueCount > 0 && (
                <span className="ml-2 font-semibold text-danger">
                  {overdueCount} overdue
                </span>
              )}
            </p>
          </div>
        </div>

        <div className="mb-4 mt-7 flex gap-2 border-b border-border">
          <button
            onClick={() => setTab("active")}
            className={`-mb-px border-b-2 px-1 pb-2 text-sm ${
              tab === "active"
                ? "border-primary font-semibold text-heading"
                : "border-transparent text-body"
            }`}
          >
            Currently Borrowed ({borrowed.length})
          </button>
          <button
            onClick={() => setTab("history")}
            className={`-mb-px border-b-2 px-1 pb-2 text-sm ${
              tab === "history"
                ? "border-primary font-semibold text-heading"
                : "border-transparent text-body"
            }`}
          >
            History ({returnedHistory.length})
          </button>
        </div>

        {loading ? (
          <p className="text-sm">Loading...</p>
        ) : tab === "active" ? (
          borrowed.length === 0 ? (
            <EmptyState title="No books borrowed yet">
              Head to the <Link href="/books">Books page</Link> to borrow one.
            </EmptyState>
          ) : (
            <div className="flex flex-col gap-3">
              {borrowed.map((loan) => {
                const status = dueStatus(loan);
                return (
                  <div
                    key={loan.id}
                    className="flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-3"
                  >
                    <Cover book={loan.book} />
                    <div className="flex-1">
                      <p className="font-semibold text-heading">
                        {loan.book?.title || "Unknown title"}
                      </p>
                      <p className="text-sm">
                        {loan.book?.author || "Unknown author"}
                      </p>
                      <div className="mt-1 flex flex-wrap items-center gap-2 text-xs">
                        <span className="text-body">
                          Borrowed {formatDate(loan.borrowed_at)}
                        </span>
                        <span className="text-body">·</span>
                        <span className="text-body">
                          Due {formatDate(loan.due_date)}
                        </span>
                        <span
                          className={`rounded border px-1.5 py-0.5 font-medium ${
                            TONE_CLASS[status.tone]
                          }`}
                        >
                          {status.label}
                        </span>
                      </div>
                    </div>
                    <button
                      className="btn btn-danger btn-sm"
                      onClick={() => handleReturn(loan)}
                    >
                      Return Book
                    </button>
                  </div>
                );
              })}
            </div>
          )
        ) : returnedHistory.length === 0 ? (
          <EmptyState title="No returned books yet">
            Books you return will show up here.
          </EmptyState>
        ) : (
          <div className="flex flex-col gap-3">
            {returnedHistory.map((loan) => (
              <div
                key={loan.id}
                className="flex items-center gap-4 rounded-xl border border-border bg-background px-4 py-3 opacity-80"
              >
                <Cover book={loan.book} />
                <div className="flex-1">
                  <p className="font-semibold text-heading">
                    {loan.book?.title || "Unknown title"}
                  </p>
                  <p className="text-sm">
                    {loan.book?.author || "Unknown author"}
                  </p>
                  <p className="mt-1 text-xs text-body">
                    Borrowed {formatDate(loan.borrowed_at)} · Returned{" "}
                    {formatDate(loan.returned_at)}
                  </p>
                </div>
                <span className="rounded border border-border px-1.5 py-0.5 text-xs text-body">
                  Returned
                </span>
              </div>
            ))}
          </div>
        )}
      </div>

      <Toast message={toast.message} type={toast.type} onClose={clearToast} />
    </div>
  );
}

function Cover({ book }) {
  if (!book?.cover_url) {
    return <div className="h-16 w-11 flex-shrink-0 rounded bg-border" />;
  }
  return (
    // eslint-disable-next-line @next/next/no-img-element
    <img
      src={book.cover_url}
      alt={book.title}
      className="h-16 w-11 flex-shrink-0 rounded bg-border object-cover"
    />
  );
}
