"use client";

import { useEffect } from "react";

// Registers the offline-caching service worker. Production only -- doing
// this in dev would fight with Next's own hot-reload caching and cause
// confusing "why isn't my change showing up" bugs.
export function ServiceWorkerRegistration() {
  useEffect(() => {
    if (process.env.NODE_ENV !== "production") return;
    if (typeof window === "undefined" || !("serviceWorker" in navigator)) return;

    navigator.serviceWorker.register("/sw.js").catch(() => {
      // Offline support is a progressive enhancement, not a requirement --
      // a failed registration (unsupported browser, blocked by the host,
      // etc.) shouldn't affect anything else about the app.
    });
  }, []);

  return null;
}
