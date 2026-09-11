"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";

// Shared form for both /login and /register. `mode` decides which fields
// and which auth action to run.
export default function AuthForm({ mode, onSubmit }) {
  const isRegister = mode === "register";
  const router = useRouter();

  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  function handleChange(e) {
    setForm({ ...form, [e.target.name]: e.target.value });
  }

  async function handleSubmit(e) {
    e.preventDefault();
    setError("");
    setLoading(true);
    try {
      await onSubmit(form);
      router.push("/books");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto mt-10 w-full max-w-md px-6">
      <div className="card p-8">
        <h1 className="mb-1 text-2xl">
          {isRegister ? "Create an account" : "Log in"}
        </h1>
        <p className="mb-6 text-sm">
          {isRegister
            ? "Sign up to borrow books from the library."
            : "Welcome back. Log in to see your borrowed books."}
        </p>

        <form onSubmit={handleSubmit} className="flex flex-col gap-1">
          {error && (
            <div className="mb-2 rounded-lg border border-danger/30 bg-danger/10 px-3 py-2 text-sm text-danger-dark">
              {error}
            </div>
          )}

          {isRegister && (
            <label className="mb-3 block">
              <span className="mb-1 block text-sm font-medium text-heading">
                Name
              </span>
              <input
                name="name"
                value={form.name}
                onChange={handleChange}
                autoComplete="name"
                required
                className="input"
              />
            </label>
          )}

          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium text-heading">
              Email
            </span>
            <input
              name="email"
              type="email"
              value={form.email}
              onChange={handleChange}
              autoComplete="email"
              required
              className="input"
            />
          </label>

          <label className="mb-3 block">
            <span className="mb-1 block text-sm font-medium text-heading">
              Password
            </span>
            <input
              name="password"
              type="password"
              value={form.password}
              onChange={handleChange}
              autoComplete={isRegister ? "new-password" : "current-password"}
              minLength={isRegister ? 6 : undefined}
              required
              className="input"
            />
          </label>

          <button
            className="btn btn-primary mt-3 w-full"
            type="submit"
            disabled={loading}
          >
            {loading
              ? isRegister
                ? "Creating..."
                : "Logging in..."
              : isRegister
              ? "Sign Up"
              : "Log In"}
          </button>

          <p className="mt-4 text-center text-sm">
            {isRegister ? (
              <>
                Already have an account? <Link href="/login">Log in</Link>
              </>
            ) : (
              <>
                New here? <Link href="/register">Create an account</Link>
              </>
            )}
          </p>
        </form>
      </div>
    </div>
  );
}
