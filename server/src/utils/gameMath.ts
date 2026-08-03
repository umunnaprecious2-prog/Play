export function calculateLevel(xp: number): number {
  return Math.max(1, Math.floor(xp / 100) + 1);
}

export function calculateStars(correctAnswers: number): number {
  if (correctAnswers >= 10) return 3;
  if (correctAnswers >= 6) return 2;
  if (correctAnswers >= 3) return 1;
  return 0;
}

export function updateStreak(lastActiveAt: Date | null | undefined, currentStreak: number, now = new Date()) {
  if (!lastActiveAt) {
    return 1;
  }

  const diffDays = Math.floor((now.getTime() - lastActiveAt.getTime()) / (24 * 60 * 60 * 1000));

  if (diffDays === 0) {
    return currentStreak;
  }

  if (diffDays === 1) {
    return currentStreak + 1;
  }

  return 1;
}