import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { startVerseMatchSession, completeVerseMatchSession } from "../services/verseMatchService";
import { startFlashCardSession, completeFlashCardSession } from "../services/flashCardService";
import { startScripturePuzzleSession, requestScripturePuzzleHint, submitScripturePuzzleAnswer } from "../services/scripturePuzzleService";
import { startCharacterGuessSession, requestCharacterHint, submitCharacterGuess } from "../services/characterGuessService";
import { startStoryOrderSession, submitStoryOrder } from "../services/storyOrderService";
import { startWordSearchSession, submitFoundWord } from "../services/wordSearchService";
import { getTodayChallenge, submitDailyChallengeAnswer } from "../services/dailyChallengeService";

// Match the Verse
export const postVerseMatchSession = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await startVerseMatchSession(req.body) });
});
export const postVerseMatchComplete = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await completeVerseMatchSession(req.body) });
});

// Flash Cards
export const postFlashCardSession = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await startFlashCardSession(req.body) });
});
export const postFlashCardComplete = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await completeFlashCardSession(req.body) });
});

// Scripture Puzzle
export const postScripturePuzzleSession = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await startScripturePuzzleSession(req.body) });
});
export const postScripturePuzzleHint = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await requestScripturePuzzleHint(req.body) });
});
export const postScripturePuzzleAnswer = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await submitScripturePuzzleAnswer(req.body) });
});

// Character Guessing Game
export const postCharacterGuessSession = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await startCharacterGuessSession(req.body) });
});
export const postCharacterHint = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await requestCharacterHint(req.body) });
});
export const postCharacterGuessAnswer = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await submitCharacterGuess(req.body) });
});

// Bible Story Challenge
export const postStoryOrderSession = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await startStoryOrderSession(req.body) });
});
export const postStoryOrderAnswer = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await submitStoryOrder(req.body) });
});

// Word Search
export const postWordSearchSession = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await startWordSearchSession(req.body) });
});
export const postWordSearchFound = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await submitFoundWord(req.body) });
});

// Daily Bible Challenge
export const getDailyChallenge = asyncHandler(async (req: Request, res: Response) => {
  const playerId = String(req.query.playerId || "");
  res.json({ success: true, data: await getTodayChallenge(playerId) });
});
export const postDailyChallengeAnswer = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await submitDailyChallengeAnswer(req.body) });
});
