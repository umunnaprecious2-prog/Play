"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { apiFetch } from "../../lib/api";
import { AVATAR_OPTIONS, avatarEmoji } from "../../lib/avatars";
import { clearParentToken, getParentToken, setParentToken } from "../../lib/parentAuth";
import { getStoredPlayerId, setStoredNickname, setStoredPlayerId } from "../../lib/player";
import type { ChildProfile, ParentAuthResponse, ParentMeResponse } from "../../lib/types";

export default function AccountPage() {
  const router = useRouter();
  const [status, setStatus] = useState<"loading" | "auth" | "dashboard">("loading");
  const [authMode, setAuthMode] = useState<"login" | "signup">("login");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isPasswordVisible, setIsPasswordVisible] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const [parentEmail, setParentEmail] = useState<string | null>(null);
  const [children, setChildren] = useState<ChildProfile[]>([]);

  const [newNickname, setNewNickname] = useState("");
  const [newAvatarSlug, setNewAvatarSlug] = useState(AVATAR_OPTIONS[0].slug);
  const [isAddingChild, setIsAddingChild] = useState(false);
  const [addChildError, setAddChildError] = useState<string | null>(null);

  async function loadDashboard() {
    const token = getParentToken();

    if (!token) {
      setStatus("auth");
      return;
    }

    try {
      const response = await apiFetch<{ success: boolean; data: ParentMeResponse }>("/parents/me", { authToken: token });
      setParentEmail(response.data.parent.email);
      setChildren(response.data.children);
      setStatus("dashboard");
    } catch {
      clearParentToken();
      setStatus("auth");
    }
  }

  useEffect(() => {
    void loadDashboard();
  }, []);

  async function handleAuthSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setIsSubmitting(true);
    setError(null);

    try {
      const path = authMode === "signup" ? "/parents/signup" : "/parents/login";
      const body: Record<string, string> = { email, password };

      // If this browser already has a guest player with real progress, link
      // it to the new account automatically instead of starting from zero.
      if (authMode === "signup") {
        const existingGuestId = getStoredPlayerId();
        if (existingGuestId) body.claimPlayerId = existingGuestId;
      }

      const response = await apiFetch<{ success: boolean; data: ParentAuthResponse }>(path, {
        method: "POST",
        body: JSON.stringify(body),
      });

      setParentToken(response.data.token);
      setEmail("");
      setPassword("");
      await loadDashboard();
    } catch (submitError) {
      setError(submitError instanceof Error ? submitError.message : "Something went wrong");
    } finally {
      setIsSubmitting(false);
    }
  }

  async function handleAddChild(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const token = getParentToken();
    if (!token || newNickname.trim().length < 2) {
      setAddChildError("Nicknames need at least 2 letters.");
      return;
    }

    setIsAddingChild(true);
    setAddChildError(null);

    try {
      await apiFetch<{ success: boolean; data: ChildProfile }>("/parents/children", {
        method: "POST",
        authToken: token,
        body: JSON.stringify({ nickname: newNickname.trim(), avatarSlug: newAvatarSlug }),
      });
      setNewNickname("");
      await loadDashboard();
    } catch (addError) {
      setAddChildError(addError instanceof Error ? addError.message : "Could not add child");
    } finally {
      setIsAddingChild(false);
    }
  }

  function playAs(child: ChildProfile) {
    setStoredPlayerId(child.id);
    setStoredNickname(child.nickname);
    router.push("/games");
  }

  function handleSignOut() {
    // Revoke the session server-side (best-effort) so the token can't still
    // be used if it ever leaked, instead of only forgetting it locally --
    // previously this cleared localStorage only, leaving the token valid on
    // the server for up to PARENT_SESSION_TTL_DAYS regardless of "signing out".
    const token = getParentToken();
    if (token) {
      void apiFetch("/parents/logout", { method: "POST", authToken: token }).catch(() => {
        // Sign-out should never get the user stuck signed in locally just
        // because the revoke call failed (offline, cold-starting API, etc.)
      });
    }

    clearParentToken();
    setParentEmail(null);
    setChildren([]);
    setAuthMode("login");
    setEmail("");
    setPassword("");
    setStatus("auth");
  }

  if (status === "loading") {
    return (
      <main className="flex min-h-screen items-center justify-center px-4 py-6">
        <p className="text-sm font-semibold text-slate-500">Loading...</p>
      </main>
    );
  }

  if (status === "auth") {
    return (
      <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
        <div className="mx-auto flex max-w-md flex-col gap-6 py-10">
          <form onSubmit={handleAuthSubmit} className="grid gap-5 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur sm:p-8">
            <div className="text-center">
              <span className="text-sm font-bold uppercase tracking-[0.2em] text-royal-500">Account</span>
              <h1 className="mt-2 text-2xl font-black text-slate-900 sm:text-3xl">
                {authMode === "signup" ? "Create your account" : "Welcome back"}
              </h1>
              <p className="mx-auto mt-2 max-w-sm text-sm leading-6 text-slate-600">
                {authMode === "signup"
                  ? "One account, multiple player profiles. Add a profile for each kid, and progress syncs across devices."
                  : "Sign in to see your profiles and progress."}
              </p>
            </div>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Email</span>
              <input
                type="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
                placeholder="parent@example.com"
                required
                className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-royal-400 focus:ring-4 focus:ring-royal-100"
              />
            </label>

            <label className="grid gap-2">
              <span className="text-sm font-semibold text-slate-700">Password</span>
              <div className="relative">
                <input
                  type={isPasswordVisible ? "text" : "password"}
                  value={password}
                  onChange={(event) => setPassword(event.target.value)}
                  placeholder="At least 8 characters"
                  minLength={8}
                  required
                  className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 pr-12 text-base outline-none transition focus:border-royal-400 focus:ring-4 focus:ring-royal-100"
                />
                <button
                  type="button"
                  onClick={() => setIsPasswordVisible((visible) => !visible)}
                  aria-label={isPasswordVisible ? "Hide password" : "Show password"}
                  aria-pressed={isPasswordVisible}
                  className="absolute inset-y-0 right-0 flex items-center px-4 text-slate-400 transition hover:text-slate-600"
                >
                  {isPasswordVisible ? (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M17.94 17.94A10.94 10.94 0 0 1 12 20c-7 0-10-8-10-8a18.6 18.6 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 10 8 10 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                      <line x1="1" y1="1" x2="23" y2="23" />
                    </svg>
                  ) : (
                    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="h-5 w-5">
                      <path d="M1 12s3-8 11-8 11 8 11 8-3 8-11 8-11-8-11-8Z" />
                      <circle cx="12" cy="12" r="3" />
                    </svg>
                  )}
                </button>
              </div>
            </label>

            {error ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-center text-sm font-medium text-red-700">{error}</p> : null}

            <button
              type="submit"
              disabled={isSubmitting}
              className="rounded-full bg-royal-600 px-6 py-3 text-base font-bold text-white transition hover:bg-royal-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {isSubmitting ? "Please wait..." : authMode === "signup" ? "Create Account" : "Sign In"}
            </button>

            <button
              type="button"
              onClick={() => {
                setAuthMode(authMode === "signup" ? "login" : "signup");
                setError(null);
              }}
              className="text-center text-sm font-semibold text-royal-600 hover:underline"
            >
              {authMode === "signup" ? "Already have an account? Sign in" : "New here? Create an account"}
            </button>
          </form>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 py-10">
        <div className="flex flex-wrap items-center justify-between gap-3 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <div>
            <span className="text-sm font-bold uppercase tracking-[0.2em] text-royal-500">Account</span>
            <h1 className="mt-1 text-2xl font-black text-slate-900">{parentEmail}</h1>
          </div>
          <button
            type="button"
            onClick={handleSignOut}
            className="rounded-full border border-slate-200 px-5 py-2 text-sm font-bold text-slate-600 transition hover:bg-slate-50"
          >
            Sign Out
          </button>
        </div>

        <section className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <h2 className="text-xl font-black text-slate-900">Your Players</h2>

          {children.length === 0 ? (
            <p className="text-sm text-slate-600">No player profiles yet. Add one below to get started.</p>
          ) : (
            <div className="grid gap-3 sm:grid-cols-2">
              {children.map((child) => (
                <div key={child.id} className="flex items-center gap-4 rounded-2xl border border-slate-200 bg-white p-4">
                  <span className="flex h-12 w-12 shrink-0 items-center justify-center rounded-full bg-slate-100 text-2xl" aria-hidden>
                    {avatarEmoji(child.avatarSlug)}
                  </span>
                  <div className="min-w-0 flex-1">
                    <p className="truncate font-bold text-slate-900">{child.nickname}</p>
                    <p className="text-xs text-slate-500">
                      Level {child.level} · {child.xp} XP · {child.streakDays} day streak
                    </p>
                  </div>
                  <button
                    type="button"
                    onClick={() => playAs(child)}
                    className="shrink-0 rounded-full bg-sunrise-500 px-4 py-2 text-sm font-bold text-white transition hover:bg-sunrise-600"
                  >
                    Play
                  </button>
                </div>
              ))}
            </div>
          )}
        </section>

        <form onSubmit={handleAddChild} className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur">
          <h2 className="text-xl font-black text-slate-900">Add a Player</h2>

          <div className="flex justify-center gap-4">
            {AVATAR_OPTIONS.map((option) => (
              <button
                key={option.slug}
                type="button"
                onClick={() => setNewAvatarSlug(option.slug)}
                aria-pressed={newAvatarSlug === option.slug}
                className={`grid justify-items-center gap-2 rounded-2xl border-2 px-6 py-3 transition ${
                  newAvatarSlug === option.slug ? `border-transparent ring-4 ${option.ring}` : "border-slate-200 bg-white hover:border-slate-300"
                }`}
              >
                <span className="text-3xl" aria-hidden>
                  {option.emoji}
                </span>
                <span className="text-xs font-bold text-slate-700">{option.label}</span>
              </button>
            ))}
          </div>

          <label className="grid gap-2">
            <span className="text-sm font-semibold text-slate-700">Nickname</span>
            <input
              value={newNickname}
              onChange={(event) => setNewNickname(event.target.value)}
              placeholder="Little Lamp"
              maxLength={40}
              className="rounded-2xl border border-slate-200 bg-white px-4 py-3 text-base outline-none transition focus:border-sunrise-400 focus:ring-4 focus:ring-sunrise-100"
            />
          </label>

          {addChildError ? <p className="rounded-2xl bg-red-50 px-4 py-3 text-sm font-medium text-red-700">{addChildError}</p> : null}

          <button
            type="submit"
            disabled={isAddingChild}
            className="mx-auto rounded-full bg-royal-600 px-6 py-3 text-sm font-bold text-white transition hover:bg-royal-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isAddingChild ? "Adding..." : "+ Add Player"}
          </button>
        </form>
      </div>
    </main>
  );
}
