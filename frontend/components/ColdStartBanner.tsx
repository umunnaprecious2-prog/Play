"use client";

import { useEffect, useState } from "react";
import { subscribeColdStart } from "../lib/coldStartStatus";

// Mounted once in app/layout.tsx, like BackNav. Shows a friendly banner
// whenever apiFetch() has a request that's taking longer than a few
// seconds -- almost always Render's free-tier backend waking up from an
// idle spin-down (can take up to about a minute), not something broken.
// Framed positively for a kids' app rather than looking like an error.
//
// Both this and BackNav are pinned to top-0 (fixed vs sticky respectively)
// with no coordination between them -- on any page that has a Back button,
// BackNav renders after this in the DOM and, at matching z-50, paints over
// it. The banner's message is long enough to wrap onto 2-3 lines at
// mobile widths, and BackNav's bar was covering the first two, leaving only
// a fragment of the last line ("tight!") visible below it -- confirmed via
// direct measurement, not just visually. z-[60] here (above BackNav's
// z-50) makes the banner fully readable whenever it's active, at the cost
// of temporarily covering the Back button for the few seconds the banner
// is showing -- an acceptable trade since an illegible status message is
// worse than a briefly-hidden nav button.
export function ColdStartBanner() {
  const [isWaking, setIsWaking] = useState(false);

  useEffect(() => subscribeColdStart(setIsWaking), []);

  if (!isWaking) return null;

  return (
    <div
      role="status"
      className="fixed inset-x-0 top-0 z-[60] flex items-center justify-center gap-3 bg-royal-900 px-4 py-3 text-center text-sm font-semibold text-white shadow-lg"
    >
      <span className="animate-spin" aria-hidden>
        ⏳
      </span>
      <span>Waking up the game... this can take up to a minute the first time. Hang tight!</span>
    </div>
  );
}
