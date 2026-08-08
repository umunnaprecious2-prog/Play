import type { Request, Response } from "express";
import { asyncHandler } from "../utils/asyncHandler";
import { getVerseMatchLevelMap, startVerseMatchSession, completeVerseMatchSession } from "../services/verseMatchService";
import { getFlashCardLevelMap, startFlashCardSession, completeFlashCardSession } from "../services/flashCardService";
import {
  listScripturePuzzleLevels,
  startScripturePuzzleSession,
  requestScripturePuzzleHint,
  submitScripturePuzzleAnswer,
} from "../services/scripturePuzzleService";
import {
  listCharacterGuessLevels,
  startCharacterGuessSession,
  requestCharacterHint,
  submitCharacterGuess,
} from "../services/characterGuessService";
import { listStoryOrderLevels, startStoryOrderSession, submitStoryOrder } from "../services/storyOrderService";
import { listWordSearchLevels, startWordSearchSession, submitFoundWord } from "../services/wordSearchService";
import { getTodayChallenge, submitDailyChallengeAnswer } from "../services/dailyChallengeService";

// Match the Verse
export const getVerseMatchLevelMapController = asyncHandler(async (req: Request, res: Response) => {
  const playerId = String(req.query.playerId || "");
  res.json({ success: true, data: await getVerseMatchLevelMap(playerId) });
});
export const postVerseMatchSession = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await startVerseMatchSession(req.body) });
});
export const postVerseMatchComplete = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await completeVerseMatchSession(req.body) });
});

// Flash Cards
export const getFlashCardLevelMapController = asyncHandler(async (req: Request, res: Response) => {
  const playerId = String(req.query.playerId || "");
  res.json({ success: true, data: await getFlashCardLevelMap(playerId) });
});
export const postFlashCardSession = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await startFlashCardSession(req.body) });
});
export const postFlashCardComplete = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await completeFlashCardSession(req.body) });
});

// Scripture Puzzle
export const getScripturePuzzleLevels = asyncHandler(async (req: Request, res: Response) => {
  const playerId = String(req.query.playerId || "");
  res.json({ success: true, data: await listScripturePuzzleLevels(playerId) });
});
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
export const getCharacterGuessLevels = asyncHandler(async (req: Request, res: Response) => {
  const playerId = String(req.query.playerId || "");
  res.json({ success: true, data: await listCharacterGuessLevels(playerId) });
});
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
export const getStoryOrderLevels = asyncHandler(async (req: Request, res: Response) => {
  const playerId = String(req.query.playerId || "");
  res.json({ success: true, data: await listStoryOrderLevels(playerId) });
});
export const postStoryOrderSession = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await startStoryOrderSession(req.body) });
});
export const postStoryOrderAnswer = asyncHandler(async (req: Request, res: Response) => {
  res.status(201).json({ success: true, data: await submitStoryOrder(req.body) });
});

// Word Search
export const getWordSearchLevels = asyncHandler(async (req: Request, res: Response) => {
  const playerId = String(req.query.playerId || "");
  res.json({ success: true, data: await listWordSearchLevels(playerId) });
});
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
