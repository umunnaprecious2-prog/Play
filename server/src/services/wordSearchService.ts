import { AppError } from "../exceptions/AppError";
import { prisma } from "../lib/prisma";
import { applyPlayerReward, awardProgressRewards, logProgress } from "./rewardService";

const POINTS_PER_WORD = 10;
const ALPHABET = "ABCDEFGHIJKLMNOPQRSTUVWXYZ";
const DIRECTIONS = [
  { dx: 1, dy: 0 },
  { dx: -1, dy: 0 },
  { dx: 0, dy: 1 },
  { dx: 0, dy: -1 },
  { dx: 1, dy: 1 },
  { dx: -1, dy: -1 },
  { dx: -1, dy: 1 },
  { dx: 1, dy: -1 },
];

type Cell = { row: number; col: number };

function randomInt(max: number) {
  return Math.floor(Math.random() * max);
}

function generateGrid(words: string[], gridSize: number): { grid: string[][]; placements: Record<string, Cell[]> } {
  const grid: string[][] = Array.from({ length: gridSize }, () => Array.from({ length: gridSize }, () => ""));
  const placements: Record<string, Cell[]> = {};

  const sortedWords = [...words].sort((a, b) => b.length - a.length);

  for (const word of sortedWords) {
    let placed = false;

    for (let attempt = 0; attempt < 200 && !placed; attempt += 1) {
      const direction = DIRECTIONS[randomInt(DIRECTIONS.length)];
      const maxRow = direction.dy >= 0 ? gridSize - (direction.dy ? word.length : 1) : gridSize - 1;
      const minRow = direction.dy < 0 ? word.length - 1 : 0;
      const maxCol = direction.dx >= 0 ? gridSize - (direction.dx ? word.length : 1) : gridSize - 1;
      const minCol = direction.dx < 0 ? word.length - 1 : 0;

      if (maxRow < minRow || maxCol < minCol) continue;

      const startRow = minRow + randomInt(maxRow - minRow + 1);
      const startCol = minCol + randomInt(maxCol - minCol + 1);

      const cells: Cell[] = [];
      let fits = true;

      for (let i = 0; i < word.length; i += 1) {
        const row = startRow + direction.dy * i;
        const col = startCol + direction.dx * i;

        if (row < 0 || row >= gridSize || col < 0 || col >= gridSize) {
          fits = false;
          break;
        }

        const existing = grid[row][col];
        if (existing && existing !== word[i]) {
          fits = false;
          break;
        }

        cells.push({ row, col });
      }

      if (!fits) continue;

      cells.forEach((cell, i) => {
        grid[cell.row][cell.col] = word[i];
      });
      placements[word] = cells;
      placed = true;
    }
  }

  for (let row = 0; row < gridSize; row += 1) {
    for (let col = 0; col < gridSize; col += 1) {
      if (!grid[row][col]) {
        grid[row][col] = ALPHABET[randomInt(ALPHABET.length)];
      }
    }
  }

  return { grid, placements };
}

function cellsEqual(a: Cell[], b: Cell[]) {
  if (a.length !== b.length) return false;
  const forward = a.every((cell, index) => cell.row === b[index].row && cell.col === b[index].col);
  const backward = a.every((cell, index) => {
    const mirrored = b[b.length - 1 - index];
    return cell.row === mirrored.row && cell.col === mirrored.col;
  });
  return forward || backward;
}

// Serves puzzles in increasing difficulty (sortOrder) so the game gets
// naturally harder as a player progresses, instead of a fully random pick
// each time. Once every puzzle has been completed at least once, falls back
// to a random pick so the game never dead-ends.
async function pickNextPuzzle(playerId: string) {
  const allPuzzles = await prisma.wordSearchPuzzle.findMany({
    where: { isActive: true },
    orderBy: { sortOrder: "asc" },
  });

  if (allPuzzles.length === 0) return null;

  const completedSessions = await prisma.gameSession.findMany({
    where: { playerId, gameMode: "word_search", status: "COMPLETED" },
    select: { metadata: true },
  });

  const completedPuzzleIds = new Set(
    completedSessions
      .map((session) => (session.metadata as { puzzleId?: string } | null)?.puzzleId)
      .filter((id): id is string => Boolean(id)),
  );

  const next = allPuzzles.find((puzzle) => !completedPuzzleIds.has(puzzle.id));
  if (next) return next;

  return allPuzzles[randomInt(allPuzzles.length)];
}

export async function startWordSearchSession(input: { playerId: string; puzzleSlug?: string }) {
  const player = await prisma.playerProfile.findUnique({ where: { id: input.playerId } });
  if (!player) throw AppError.notFound("Player profile not found");

  const puzzle = input.puzzleSlug
    ? await prisma.wordSearchPuzzle.findUnique({ where: { slug: input.puzzleSlug } })
    : await pickNextPuzzle(player.id);

  if (!puzzle || !puzzle.isActive) {
    throw AppError.notFound("No word search puzzles available yet");
  }

  const { grid, placements } = generateGrid(puzzle.words, puzzle.gridSize);

  const session = await prisma.gameSession.create({
    data: {
      playerId: player.id,
      gameMode: "word_search",
      totalQuestions: puzzle.words.length,
      metadata: { puzzleId: puzzle.id, placements, foundWords: [] },
    },
  });

  return {
    session: { id: session.id, totalQuestions: session.totalQuestions },
    puzzle: { id: puzzle.id, title: puzzle.title, gridSize: puzzle.gridSize, words: puzzle.words },
    grid,
  };
}

export async function submitFoundWord(input: { sessionId: string; word: string; path: Cell[] }) {
  const session = await prisma.gameSession.findUnique({ where: { id: input.sessionId }, include: { player: true } });
  if (!session || session.gameMode !== "word_search") throw AppError.notFound("Word search session not found");
  if (session.status !== "ACTIVE") throw AppError.badRequest("This session has already ended");

  const metadata = (session.metadata ?? {}) as { placements?: Record<string, Cell[]>; foundWords?: string[] };
  const placements = metadata.placements ?? {};
  const foundWords = metadata.foundWords ?? [];

  const targetWord = input.word.toUpperCase();
  const expectedCells = placements[targetWord];

  if (!expectedCells) {
    throw AppError.badRequest("That word isn't part of this puzzle");
  }

  if (foundWords.includes(targetWord)) {
    throw AppError.badRequest("Already found that word");
  }

  const isCorrect = cellsEqual(expectedCells, input.path);
  const pointsEarned = isCorrect ? POINTS_PER_WORD : 0;

  if (!isCorrect) {
    return { isCorrect: false, pointsEarned: 0, wordsFound: foundWords.length, totalWords: session.totalQuestions, isComplete: false };
  }

  const nextFoundWords = [...foundWords, targetWord];
  const isComplete = nextFoundWords.length >= session.totalQuestions;
  const starsAwarded = isComplete ? 1 : 0;

  const updatedPlayer = await applyPlayerReward(session.playerId, {
    xpDelta: pointsEarned,
    starsDelta: starsAwarded,
    isCorrect: true,
    countsAsGamePlayed: isComplete,
  });

  const completedSession = await prisma.gameSession.update({
    where: { id: session.id },
    data: {
      metadata: { ...metadata, foundWords: nextFoundWords },
      correctCount: nextFoundWords.length,
      currentQuestion: nextFoundWords.length,
      xpEarned: session.xpEarned + pointsEarned,
      starsEarned: session.starsEarned + starsAwarded,
      score: session.score + pointsEarned,
      status: isComplete ? "COMPLETED" : "ACTIVE",
      completedAt: isComplete ? new Date() : null,
    },
  });

  const rewards = isComplete ? await awardProgressRewards(updatedPlayer.id) : { badgesUnlocked: [], avatarsUnlocked: [] };

  if (isComplete) {
    await logProgress({
      playerId: updatedPlayer.id,
      actionType: "WORD_SEARCH_COMPLETE",
      xpDelta: pointsEarned,
      starsDelta: starsAwarded,
      streakDelta: 1,
      metadata: { sessionId: completedSession.id },
    });
  }

  return {
    isCorrect: true,
    pointsEarned,
    wordsFound: nextFoundWords.length,
    totalWords: session.totalQuestions,
    isComplete,
    player: updatedPlayer,
    rewards,
  };
}
