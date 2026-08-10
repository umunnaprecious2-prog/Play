"use client";

import { useEffect, useState } from "react";
import { subscribeColdStart } from "../lib/coldStartStatus";

// Mounted once in app/layout.tsx, like BackNav. Shows a friendly banner
// whenever apiFetch() has a request that's taking longer than a few
// seconds -- almost always Render's free-tier backend waking up from an
// idle spin-down (can take up to about a minute), not something broken.
// Framed positively for a kids' app rather than looking like an error.
export function ColdStartBanner() {
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => subscribeColdStart(setIsWaking), []);

  if (!isWaking) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-50 flex items-center justify-center gap-3 bg-royal-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg"
    >
      <span className="animate-spin" aria-hidden>
        ⏳
      </span>
      <span>Waking up the game... this can take up to a minute the first time. Hang tight!</span>
    </div>
  );
}
