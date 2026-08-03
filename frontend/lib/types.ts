export type PlayerProfile = {
  id: string;
  nickname: string;
  avatarSlug: string | null;
  xp: number;
  level: number;
  stars: number;
  streakDays: number;
  totalGamesPlayed: number;
  totalCorrect: number;
  totalIncorrect: number;
};

export type QuizQuestion = {
  id: string;
  slug: string;
  prompt: string;
  explanation?: string | null;
  scriptureReference?: string | null;
  imageUrl?: string | null;
  imageAlt?: string | null;
  xpReward: number;
  options: Array<{ id: string; text: string }>;
};

export type VerseItem = {
  id: string;
  slug: string;
  reference: string;
  text: string;
  translation?: string | null;
  memoryHint?: string | null;
  xpReward: number;
};