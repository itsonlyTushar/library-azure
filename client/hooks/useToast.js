"use client";

import { useState, useCallback } from "react";

// Tiny helper so pages don't each re-implement toast state.
export function useToast() {
  const [toast, setToast] = useState({ message: "", type: "info" });

  const showToast = useCallback((message, type = "info") => {
    setToast({ message, type });
  }, []);

  const clearToast = useCallback(() => {
    setToast({ message: "", type: "info" });
  }, []);

  return { toast, showToast, clearToast };
}
