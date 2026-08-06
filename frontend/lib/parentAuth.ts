const PARENT_TOKEN_KEY = "play.parentToken";

export function getParentToken(): string | null {
  if (typeof window === "undefined") {
    return null;
  }

  return window.localStorage.getItem(PARENT_TOKEN_KEY);
}

export function setParentToken(token: string) {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.setItem(PARENT_TOKEN_KEY, token);
}

export function clearParentToken() {
  if (typeof window === "undefined") {
    return;
  }

  window.localStorage.removeItem(PARENT_TOKEN_KEY);
}
