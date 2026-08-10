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

// Deliberately no explanation/scriptureReference here -- the API no longer
// sends either before the player answers, since both would reveal the
// correct answer. They're only present on GameAnswerResult, returned once
// the question has actually been answered.
export type QuizQuestion = {
  id: string;
  slug: string;
  prompt: string;
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
  explanation?: string | null;
  scriptureReference?: string | null;
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

// No explanation/scriptureReference here -- the API only ever sends this ONE
// question at a time (never the rest of the level's set), and withholds
// both fields until after it's answered (see LevelAnswerResult).
// hideLevelLabel is true for the rare question where the level's own name
// (e.g. "Song of Solomon") would give the answer away just by being shown
// on screen -- the frontend should display a neutral label instead for
// this one question.
export type LevelQuestion = {
  id: string;
  slug: string;
  prompt: string;
  hideLevelLabel: boolean;
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
  explanation?: string | null;
  scriptureReference?: string | null;
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
  nextLevelSlug?: string | null;
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
  nextLevelSlug?: string | null;
};

// Bible Story Challenge
export type StoryEventCard = { id: string; text: string };
export type StoryOrderResult = {
  isCorrect: boolean;
  pointsEarned: number;
  correctOrderIds: string[];
  isComplete: boolean;
  nextLevelSlug?: string | null;
};

// Word Search
export type WordSearchFoundResult = {
  isCorrect: boolean;
  pointsEarned: number;
  wordsFound: number;
  totalWords: number;
  isComplete: boolean;
  nextLevelSlug?: string | null;
  player?: { xp: number };
};

// Daily Bible Challenge
// No scriptureReference here -- it's only sent after answering, on the
// result below, since it would otherwise reveal the correct answer.
export type DailyChallengeQuestion = {
  id: string;
  prompt: string;
  category: string | null;
  options: Array<{ id: string; text: string }>;
};
export type DailyChallengeAnswerResult = {
  isCorrect: boolean;
  xpAwarded: number;
  correctText: string | null;
  scriptureReference?: string | null;
};