"use client";

import { useEffect } from "react";
import Icon from "@/components/Icon";

// Small auto-dismissing notification shown at the bottom of the screen.
export default function Toast({ message, type = "info", onClose }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(onClose, 3000);
    return () => clearTimeout(timer);
  }, [message, onClose]);

  if (!message) return null;

  return (
    <div
      role="status"
      className={`fixed bottom-6 left-1/2 z-50 flex -translate-x-1/2 items-center gap-2 rounded-lg px-4 py-3 text-sm text-white shadow-lg ${
        type === "error" ? "bg-danger" : "bg-heading"
      }`}
    >
      <Icon name={type === "error" ? "inbox" : "check"} size={16} />
      {message}
    </div>
  );
}
