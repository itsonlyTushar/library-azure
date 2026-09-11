// Loan period must match the server (server/src/config.js LOAN_PERIOD_DAYS).
export const LOAN_PERIOD_DAYS = 14;

// Preview the due date shown in the borrow confirmation dialog.
// The server still computes the authoritative value on borrow.
export function previewDueDate() {
  const date = new Date();
  date.setDate(date.getDate() + LOAN_PERIOD_DAYS);
  return date.toISOString().slice(0, 10);
}

// "2026-09-23" -> "23 Sep 2026"
export function formatDate(iso) {
  if (!iso) return "";
  const date = new Date(iso);
  return date.toLocaleDateString("en-GB", {
    day: "numeric",
    month: "short",
    year: "numeric",
  });
}

// Short human label for how a loan is tracking against its due date.
// The server sends `overdue` and `days_remaining`; this just phrases them.
export function dueStatus({ overdue, days_remaining }) {
  if (overdue) return { label: "Overdue", tone: "danger" };
  if (days_remaining === 0) return { label: "Due today", tone: "warn" };
  if (days_remaining === 1) return { label: "1 day left", tone: "warn" };
  if (days_remaining <= 3) return { label: `${days_remaining} days left`, tone: "warn" };
  return { label: `${days_remaining} days left`, tone: "ok" };
}
