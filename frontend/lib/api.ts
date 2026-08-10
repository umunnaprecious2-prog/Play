import { markSlowRequestEnded, markSlowRequestStarted } from "./coldStartStatus";

export const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "http://localhost:5000/api";

// Render's free tier spins the backend down after inactivity, so the first
// request after idle time can take 50+ seconds to come back. Rather than let
// every game screen sit on its own generic "Loading..." for that whole time
// (which reads as broken, not busy), any request slower than this threshold
// flips on a shared "waking up the game" banner (see ColdStartBanner.tsx) so
// kids and parents get an honest, friendly explanation instead of a stuck
// screen -- normal fast requests never trigger it.
const SLOW_REQUEST_THRESHOLD_MS = 3000;

type RequestOptions = RequestInit & {
  authToken?: string;
};

export async function apiFetch<T>(path: string, options: RequestOptions = {}): Promise<T> {
  let flaggedSlow = false;
  const slowTimer = setTimeout(() => {
    flaggedSlow = true;
    markSlowRequestStarted();
  }, SLOW_REQUEST_THRESHOLD_MS);

  try {
    const response = await fetch(`${API_BASE_URL}${path}`, {
      ...options,
      headers: {
        "Content-Type": "application/json",
        ...(options.authToken ? { Authorization: `Bearer ${options.authToken}` } : {}),
        ...(options.headers || {}),
      },
    });

    if (!response.ok) {
      const body = await response.json().catch(() => null);
      throw new Error(body?.message || `Request failed with status ${response.status}`);
    }

    return (await response.json()) as T;
  } finally {
    clearTimeout(slowTimer);
    if (flaggedSlow) markSlowRequestEnded();
  }
}