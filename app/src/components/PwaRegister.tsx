"use client";

/**
 * Înregistrează service worker-ul (Etapa 11 — PWA instalabilă).
 * Doar în producție: în dev, SW-ul ar servi pagini vechi peste HMR.
 */
import { useEffect } from "react";

export function PwaRegister() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if ("serviceWorker" in navigator) {
      navigator.serviceWorker.register("/sw.js").catch(() => {});
    }
  }, []);
  return null;
}
