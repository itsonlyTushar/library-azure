"use client";

import Icon from "@/components/Icon";

export default function BookCard({ book, onBorrow, borrowed }) {
  return (
    <div className="card flex flex-col p-3.5 transition-shadow hover:shadow-md">
      <div className="relative mb-3">
        {book.cover_url ? (
          // eslint-disable-next-line @next/next/no-img-element
          <img
            src={book.cover_url}
            alt={book.title}
            className="h-56 w-full rounded-lg bg-background object-contain"
          />
        ) : (
          <div className="flex h-56 w-full items-center justify-center rounded-lg bg-background p-2 text-center text-xs text-body">
            No cover available
          </div>
        )}
        <span
          className={`absolute right-2 top-2 rounded-full px-2 py-0.5 text-[11px] font-semibold text-white ${
            borrowed ? "bg-body" : "bg-success"
          }`}
        >
          {borrowed ? "Borrowed" : "Available"}
        </span>
      </div>

      <p className="mb-1 text-sm font-semibold leading-snug text-heading">
        {book.title}
      </p>
      <p className="text-xs text-body">{book.author || "Unknown author"}</p>
      {book.genre && (
        <p className="mt-0.5 text-xs text-body">{book.genre}</p>
      )}
      {book.first_publish_year && (
        <p className="text-xs text-body">
          First published {book.first_publish_year}
        </p>
      )}

      {borrowed ? (
        <button className="btn btn-secondary mt-3" disabled>
          <Icon name="check" size={14} />
          Already borrowed
        </button>
      ) : (
        <button className="btn btn-primary mt-3" onClick={() => onBorrow(book)}>
          <Icon name="bookmark" size={14} />
          Borrow
        </button>
      )}
    </div>
  );
}
