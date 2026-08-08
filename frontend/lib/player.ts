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

// Bible Trivia's round number is now server-authoritative (derived from
// completed trivia sessions, see gameService.ts's getTriviaLevelMap) rather
// than tracked here in localStorage -- kept only as the difficulty-mapping
// helper, since that's a pure function with no state of its own.
export function triviaDifficultyForRound(round: number): "easy" | "medium" | "hard" {
  if (round <= 7) return "easy";
  if (round <= 14) return "medium";
  return "hard";
}
