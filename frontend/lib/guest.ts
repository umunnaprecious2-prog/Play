// Uses the standard Web Crypto API (available in both browsers and Node 19+)
// instead of `node:crypto` so this also works when called from client components.
export function createGuestNickname(prefix: string) {
  return `${prefix}-${crypto.randomUUID().slice(0, 8)}`;
}