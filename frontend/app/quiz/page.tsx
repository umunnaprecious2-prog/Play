import { QuizPreview } from "../../components/QuizPreview";
import { apiFetch } from "../../lib/api";
import { createGuestNickname } from "../../lib/guest";
import type { QuizQuestion } from "../../lib/types";

async function loadQuestions(): Promise<QuizQuestion[]> {
  const playerResponse = await apiFetch<{ success: boolean; data: { id: string } }>("/games/players", {
    method: "POST",
    body: JSON.stringify({ nickname: createGuestNickname("guest-quiz"), avatarSlug: "sunbeam-lion" }),
  });

  const quizResponse = await apiFetch<{ success: boolean; data: { questions: QuizQuestion[] } }>("/games/quiz/sessions", {
    method: "POST",
    body: JSON.stringify({ playerId: playerResponse.data.id, questionCount: 5 }),
  });

  return quizResponse.data.questions;
}

export default async function QuizPage() {
  const questions = await loadQuestions().catch(() => []);

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-5xl flex-col gap-6">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <p className="text-sm font-semibold uppercase tracking-[0.2em] text-sunrise-600">Bible Quiz</p>
          <h1 className="mt-2 text-4xl font-black text-slate-900">A bright first game loop</h1>
          <p className="mt-3 max-w-2xl text-base leading-7 text-slate-600">
            This page is wired to the backend quiz session API so kids can start with a player profile, answer questions, and build progress.
          </p>
        </header>

        {questions.length > 0 ? (
          <QuizPreview questions={questions} />
        ) : (
          <section className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft">
            <h2 className="text-2xl font-black text-slate-900">No quiz questions available yet</h2>
            <p className="mt-2 text-sm leading-6 text-slate-600">
              Seed the server database first, then this page will load live quiz sessions.
            </p>
          </section>
        )}
      </div>
    </main>
  );
}