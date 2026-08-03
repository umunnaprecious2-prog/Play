import { randomUUID } from "node:crypto";

export function createGuestNickname(prefix: string) {
  return `${prefix}-${randomUUID().slice(0, 8)}`;
}