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

// Parent accounts & child profiles
export type ChildProfile = {
  id: string;
  nickname: string;
  avatarSlug: string | null;
  xp: number;
  level: number;
  stars: number;
  streakDays: number;
};

export type ParentSummary = { id: string; email: string };
export type ParentAuthResponse = { token: string; expiresAt: string; parent: ParentSummary };
export type ParentMeResponse = { parent: ParentSummary; children: ChildProfile[] };

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

// Shared shape returned by both /games/quiz/answers and /games/memory-verse/answers.
export type GameAnswerResult = {
  isCorrect: boolean;
  xpAwarded: number;
  starsAwarded: number;
  correctText: string | null;
  isComplete: boolean;
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

export type Level = {
  id: string;
  slug: string;
  name: string;
  description?: string | null;
  levelNumber: number;
  totalQuestions: number;
  isReady: boolean;
  isUnlocked: boolean;
  isCompleted: boolean;
  bestScore: number;
  attempts: number;
};

export type LevelQuestion = {
  id: string;
  slug: string;
  prompt: string;
  explanation?: string | null;
  scriptureReference?: string | null;
  options: Array<{ id: string; text: string }>;
};

export type LevelHintResult = {
  hintNumber: number;
  eliminatedOptionId: string;
  eliminatedOptionText: string;
  hintsRemaining: number;
  maxPointsIfCorrect: number;
};

export type LevelAnswerResult = {
  isCorrect: boolean;
  pointsEarned: number;
  hintsUsed: number;
  starsAwarded: number;
  correctText: string | null;
  isComplete: boolean;
  nextLevelSlug: string | null;
};

// Match the Verse
export type VerseMatchCard = { cardId: string; verseId: string; type: "reference" | "text"; content: string };

// Flash Cards
export type FlashCard = { id: string; reference: string; text: string; memoryHint: string | null };

// Scripture Puzzle
export type ScripturePuzzleHintResult = {
  hintNumber: number;
  revealedPosition: number;
  revealedWord: string | null;
  hintsRemaining: number;
  maxPointsIfCorrect: number;
};
export type ScripturePuzzleAnswerResult = {
  isCorrect: boolean;
  pointsEarned: number;
  hintsUsed: number;
  correctText: string | null;
  isComplete: boolean;
};

// Character Guessing Game
export type CharacterRound = { characterId: string; firstClue: string; imageUrl: string | null };
export type CharacterHintResult = {
  hintNumber: number;
  clue: string | null;
  hintsRemaining: number;
  maxPointsIfCorrect: number;
};
export type CharacterGuessResult = {
  isCorrect: boolean;
  pointsEarned: number;
  hintsUsed: number;
  correctName: string;
  isComplete: boolean;
};

// Bible Story Challenge
export type StoryEventCard = { id: string; text: string };
export type StoryOrderResult = { isCorrect: boolean; pointsEarned: number; correctOrderIds: string[]; isComplete: boolean };

// Word Search
export type WordSearchFoundResult = {
  isCorrect: boolean;
  pointsEarned: number;
  wordsFound: number;
  totalWords: number;
  isComplete: boolean;
  player?: { xp: number };
};

// Daily Bible Challenge
export type DailyChallengeQuestion = {
  id: string;
  prompt: string;
  scriptureReference?: string | null;
  category: string | null;
  options: Array<{ id: string; text: string }>;
};
export type DailyChallengeAnswerResult = { isCorrect: boolean; xpAwarded: number; correctText: string | null };