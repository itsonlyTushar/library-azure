"use client";

import Link from "next/link";
import { usePathname, useRouter } from "next/navigation";
import { useAuth } from "@/services/AuthContext";
import Icon from "@/components/Icon";

export default function Navbar() {
  const { user, logout } = useAuth();
  const router = useRouter();
  const pathname = usePathname();

  function handleLogout() {
    logout();
    router.push("/login");
  }

  const navLink = (href) =>
    `pb-0.5 text-sm border-b-2 transition-colors hover:no-underline ${
      pathname === href
        ? "border-primary text-primary"
        : "border-transparent text-heading hover:border-primary"
    }`;

  return (
    <header className="border-b border-border bg-surface">
      <nav className="mx-auto flex max-w-6xl items-center gap-8 px-6 py-4">
        <Link
          href="/"
          className="flex items-center gap-2 font-heading text-lg font-bold text-heading hover:no-underline"
        >
          <span className="rounded-md bg-primary px-2 py-0.5 text-white">
            OPEN
          </span>
          LIBRARY
        </Link>

        <div className="flex flex-1 gap-6">
          <Link href="/books" className={navLink("/books")}>
            Browse
          </Link>
          {user && (
            <Link href="/profile" className={navLink("/profile")}>
              My Books
            </Link>
          )}
          {user?.role === "ADMIN" && (
            <Link href="/admin/books" className={navLink("/admin/books")}>
              Manage Catalog
            </Link>
          )}
        </div>

        <div className="flex items-center gap-3">
          {user ? (
            <>
              <span className="text-sm text-body">Hi, {user.name}</span>
              <button className="btn btn-secondary btn-sm" onClick={handleLogout}>
                <Icon name="logout" size={14} />
                Log Out
              </button>
            </>
          ) : (
            <>
              <Link href="/login" className="btn btn-secondary btn-sm">
                Log In
              </Link>
              <Link href="/register" className="btn btn-primary btn-sm">
                Sign Up
              </Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}
