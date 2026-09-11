import Link from "next/link";
import Icon from "@/components/Icon";

const FEATURES = [
  {
    icon: "book",
    title: "Browse the Catalog",
    text: "Search thousands of books by title, author, or subject, with data from the Open Library API.",
  },
  {
    icon: "bookmark",
    title: "Borrow in One Click",
    text: "Borrow any available book. Each loan comes with a 14-day due date.",
  },
  {
    icon: "user",
    title: "Track Your Books",
    text: "Your profile shows every book you have borrowed and lets you return them anytime.",
  },
];

export default function HomePage() {
  return (
    <>
      {/* Full-height hero: viewport minus navbar (65px) and footer (49px). */}
      <section className="flex min-h-[calc(100vh-114px)] items-center justify-center px-6">
        <div className="mx-auto max-w-2xl text-center">
          <span className="mb-4 inline-flex items-center gap-2 rounded-full border border-border bg-surface px-3 py-1 text-xs font-medium text-primary">
            <Icon name="book" size={14} />
            Online Library Management System
          </span>
          <h1 className="mb-4 font-heading text-4xl leading-tight sm:text-5xl">
            Welcome to Open Library
          </h1>
          <p className="mx-auto mb-8 max-w-xl text-base sm:text-lg">
            A simple online library management system. Create an account to
            browse the catalog, borrow books, and keep track of what you have
            borrowed.
          </p>
          <div className="flex flex-wrap justify-center gap-3">
            <Link href="/books" className="btn btn-primary">
              Browse Books
              <Icon name="arrowRight" size={16} />
            </Link>
            <Link href="/register" className="btn btn-secondary">
              Sign Up
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}
