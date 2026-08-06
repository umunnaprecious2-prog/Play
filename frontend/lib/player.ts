const PLAYER_ID_KEY = "play.playerId";
const NICKNAME_KEY = "play.nickname";

export function getStoredPlayerId(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(PLAYER_ID_KEY);
}

export function setStoredPlayerId(id: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PLAYER_ID_KEY, id);
}

export function getStoredNickname(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(NICKNAME_KEY);
}

export function setStoredNickname(nickname: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(NICKNAME_KEY, nickname);
}

const TRIVIA_ROUND_KEY = "play.triviaRound";
const MAX_TRIVIA_ROUND = 20;

// Bible Trivia has no per-puzzle identity to track server-side (it draws
// randomly from the shared question pool), so round progress — used to ramp
// difficulty over 20 rounds — is tracked locally, the same way player
// identity itself is.
export function getNextTriviaRound(): number {
  if (typeof window === "undefined") {
    return 1;
  }

  const stored = Number(window.localStorage.getItem(TRIVIA_ROUND_KEY) ?? "0");
  const current = Number.isFinite(stored) && stored > 0 ? stored : 0;
  const next = Math.min(current + 1, MAX_TRIVIA_ROUND);
  window.localStorage.setItem(TRIVIA_ROUND_KEY, String(next));
  return next;
}

export function triviaDifficultyForRound(round: number): "easy" | "medium" | "hard" {
  if (round <= 7) return "easy";
  if (round <= 14) return "medium";
  return "hard";
}
