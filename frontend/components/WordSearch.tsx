"use client";

import { useEffect, useState } from "react";
import { apiFetch } from "../lib/api";
import { useGuestPlayer } from "../hooks/useGuestPlayer";
import { LevelCompleteScreen } from "./LevelCompleteScreen";
import type { WordSearchFoundResult } from "../lib/types";

type Cell = { row: number; col: number };
type FoundPath = { word: string; path: Cell[]; color: string };

const HIGHLIGHT_COLORS = ["#f97316", "#3b82f6", "#22c55e", "#f5a524", "#6c37f0", "#ec4899", "#14b8a6", "#ef4444"];

function straightLine(start: Cell, end: Cell): Cell[] | null {
  const dRow = end.row - start.row;
  const dCol = end.col - start.col;
  const steps = Math.max(Math.abs(dRow), Math.abs(dCol));
  if (steps === 0) return [start];

  const stepRow = Math.sign(dRow);
  const stepCol = Math.sign(dCol);
  if (dRow !== 0 && dCol !== 0 && Math.abs(dRow) !== Math.abs(dCol)) return null;

  const cells: Cell[] = [];
  for (let i = 0; i <= steps; i += 1) {
    cells.push({ row: start.row + stepRow * i, col: start.col + stepCol * i });
  }
  return cells;
}

export function WordSearch() {
  const { playerId, isLoading: isPlayerLoading, error: playerError } = useGuestPlayer();
  const [sessionId, setSessionId] = useState<string | null>(null);
  const [title, setTitle] = useState<string | null>(null);
  const [words, setWords] = useState<string[]>([]);
  const [grid, setGrid] = useState<string[][] | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [selectionStart, setSelectionStart] = useState<Cell | null>(null);
  const [foundPaths, setFoundPaths] = useState<FoundPath[]>([]);
  const [message, setMessage] = useState<string | null>(null);
  const [isComplete, setIsComplete] = useState(false);
  const [sessionScore, setSessionScore] = useState(0);
  const [totalXp, setTotalXp] = useState(0);

  useEffect(() => {
    if (!playerId) return;

    let cancelled = false;
    setIsLoading(true);

    apiFetch<{ success: boolean; data: { session: { id: string }; puzzle: { title: string; words: string[] }; grid: string[][] } }>(
      "/games/word-search/sessions",
      { method: "POST", body: JSON.stringify({ playerId }) },
    )
      .then((response) => {
        if (!cancelled) {
          setSessionId(response.data.session.id);
          setTitle(response.data.puzzle.title);
          setWords(response.data.puzzle.words);
          setGrid(response.data.grid);
        }
      })
      .catch((fetchError: unknown) => {
        if (!cancelled) setError(fetchError instanceof Error ? fetchError.message : "Could not start Word Search");
      })
      .finally(() => {
        if (!cancelled) setIsLoading(false);
      });

    return () => {
      cancelled = true;
    };
  }, [playerId]);

  async function handleCellClick(cell: Cell) {
    if (!selectionStart) {
      setSelectionStart(cell);
      return;
    }

    const path = straightLine(selectionStart, cell);
    setSelectionStart(null);

    if (!path || !grid || !sessionId) {
      setMessage("Pick two cells in a straight line.");
      return;
    }

    const word = path.map(({ row, col }) => grid[row][col]).join("");

    try {
      const response = await apiFetch<{ success: boolean; data: WordSearchFoundResult }>("/games/word-search/found", {
        method: "POST",
        body: JSON.stringify({ sessionId, word, path }),
      });

      if (response.data.isCorrect) {
        setFoundPaths((previous) => [
          ...previous,
          { word: word.toUpperCase(), path, color: HIGHLIGHT_COLORS[previous.length % HIGHLIGHT_COLORS.length] },
        ]);
        setMessage(`Found "${word}"! +${response.data.pointsEarned} points`);
        setSessionScore((value) => value + response.data.pointsEarned);
        if (response.data.isComplete) {
          if (response.data.player) setTotalXp(response.data.player.xp);
          setIsComplete(true);
        }
      } else {
        setMessage("Not a word in this puzzle. Try again.");
      }
    } catch {
      setMessage("Not a word in this puzzle. Try again.");
    }
  }

  if (isPlayerLoading || isLoading) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
        <h2 className="text-2xl font-black text-slate-900">Loading Word Search...</h2>
      </section>
    );
  }

  if (playerError || error || !grid) {
    return (
      <section className="grid gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
        <h2 className="text-2xl font-black text-slate-900">Word Search isn&apos;t ready yet</h2>
        <p className="text-sm text-slate-600">{playerError || error}</p>
      </section>
    );
  }

  if (isComplete) {
    return (
      <LevelCompleteScreen
        label={`${(title ?? "PUZZLE").toUpperCase()} COMPLETE`}
        passed
        stars={3}
        levelScore={sessionScore}
        xpEarned={sessionScore}
        totalScore={totalXp}
        continueLabel="Next Puzzle"
        onContinue={() => window.location.reload()}
      />
    );
  }

  const rows = grid.length;
  const cols = grid[0].length;
  const foundWordSet = new Set(foundPaths.map((entry) => entry.word));

  return (
    <section className="grid gap-5 rounded-[1.75rem] border border-white/80 bg-white/80 p-6 shadow-soft backdrop-blur">
      <div className="flex items-center justify-between">
        <h2 className="text-2xl font-black text-slate-900">{title}</h2>
        <span className="rounded-full bg-sky-50 px-4 py-2 text-sm font-semibold text-sky-700">
          {foundPaths.length}/{words.length} found
        </span>
      </div>

      <p className="text-sm text-slate-500">Tap the first letter, then the last letter, of a word to select it.</p>

      <div className="relative overflow-x-auto">
        <div
          className="relative grid gap-1"
          style={{ gridTemplateColumns: `repeat(${cols}, minmax(28px, 1fr))` }}
        >
          {grid.map((row, rowIndex) =>
            row.map((letter, colIndex) => {
              const isSelected = selectionStart?.row === rowIndex && selectionStart?.col === colIndex;
              return (
                <button
                  key={`${rowIndex}-${colIndex}`}
                  type="button"
                  onClick={() => handleCellClick({ row: rowIndex, col: colIndex })}
                  className={`relative z-10 aspect-square rounded-md text-xs font-bold transition sm:text-sm ${
                    isSelected ? "bg-royal-600 text-white" : "bg-slate-100 text-slate-700 hover:bg-royal-100"
                  }`}
                >
                  {letter}
                </button>
              );
            }),
          )}

          {/* A hand-drawn-style oval circled around each found word, the way you'd
              mark one with a pen, not a line struck through it. */}
          <svg
            className="pointer-events-none absolute inset-0 h-full w-full"
            viewBox={`0 0 ${cols} ${rows}`}
            preserveAspectRatio="none"
            aria-hidden
          >
            {foundPaths.map((entry) => {
              const first = entry.path[0];
              const last = entry.path[entry.path.length - 1];
              const dRow = last.row - first.row;
              const dCol = last.col - first.col;
              const midX = (first.col + last.col) / 2 + 0.5;
              const midY = (first.row + last.row) / 2 + 0.5;
              const angle = (Math.atan2(dRow, dCol) * 180) / Math.PI;
              const wordLength = Math.hypot(dRow, dCol);
              const capsuleLength = wordLength + 0.75;
              const capsuleThickness = 0.85;

              return (
                <rect
                  key={entry.word}
                  x={midX - capsuleLength / 2}
                  y={midY - capsuleThickness / 2}
                  width={capsuleLength}
                  height={capsuleThickness}
                  rx={capsuleThickness / 2}
                  transform={`rotate(${angle} ${midX} ${midY})`}
                  fill="none"
                  stroke={entry.color}
                  strokeWidth={0.1}
                  strokeLinejoin="round"
                />
              );
            })}
          </svg>
        </div>
      </div>

      {message ? <p className="text-center text-sm font-semibold text-royal-700">{message}</p> : null}

      <div className="flex flex-wrap gap-2">
        {words.map((word) => (
          <span
            key={word}
            className={`rounded-full px-3 py-1 text-sm font-semibold ${
              foundWordSet.has(word) ? "bg-meadow-100 text-meadow-700 line-through" : "bg-slate-100 text-slate-600"
            }`}
          >
            {word}
          </span>
        ))}
      </div>
    </section>
  );
}
