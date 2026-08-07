const LAST_UPDATED = "August 7, 2026";

export default function TermsOfServicePage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 py-10">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur sm:p-8">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-royal-500">Legal</span>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Terms of Service</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="grid gap-6 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur sm:p-8">
          <Section title="Agreement">
            <p>
              These terms govern your use of Play, a Bible learning game app. By using Play, you agree to these
              terms. If you&apos;re creating an account on behalf of a child, you&apos;re confirming that you&apos;re an
              adult and responsible for that child&apos;s use of the app.
            </p>
          </Section>

          <Section title="The service">
            <p>
              Play offers ten Bible-centered games covering Scripture memory, trivia, and word games, built around
              the King James Version of the Bible, quoted exactly as written. Play is provided free of charge.
              Some features (like creating an account) are optional and not required to play.
            </p>
          </Section>

          <Section title="Accounts">
            <p>
              You&apos;re responsible for keeping your account password secure and for all activity under your
              account. Player profiles created for kids under your account are managed by the account
              holder. You can have as many player profiles under one account as you&apos;d like.
            </p>
          </Section>

          <Section title="Acceptable use">
            <p>
              Play is meant to be a safe, encouraging space for kids and adults alike. Please choose appropriate nicknames, and
              don&apos;t attempt to disrupt the service, access other users&apos; accounts, or use Play for anything
              other than its intended purpose.
            </p>
          </Section>

          <Section title="Content and ownership">
            <p>
              Scripture quoted in Play (King James Version) is in the public domain. The games, design, code, and
              other original content that make up Play belong to its developer. You&apos;re welcome to use Play for
              personal, non-commercial enjoyment; you may not copy, redistribute, or reverse-engineer the app
              itself.
            </p>
          </Section>

          <Section title="No warranty">
            <p>
              Play is provided &quot;as is,&quot; without warranties of any kind. We work to keep it running smoothly and
              accurately, but we don&apos;t guarantee uninterrupted availability or that it will always be free of
              errors.
            </p>
          </Section>

          <Section title="Limitation of liability">
            <p>
              To the fullest extent permitted by law, Play and its developer aren&apos;t liable for any indirect,
              incidental, or consequential damages arising from your use of the app.
            </p>
          </Section>

          <Section title="Changes to these terms">
            <p>
              If these terms change, we&apos;ll update the date at the top of this page. Continued use of Play after
              a change means you accept the updated terms.
            </p>
          </Section>

          <Section title="Contact us">
            <p>
              Questions about these terms? Email us at{" "}
              <a href="mailto:findurgently@gmail.com" className="font-semibold text-royal-600 hover:underline">
                findurgently@gmail.com
              </a>
              .
            </p>
          </Section>
        </div>
      </div>
    </main>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="grid gap-2">
      <h2 className="text-lg font-black text-slate-900">{title}</h2>
      <div className="text-sm leading-7 text-slate-700">{children}</div>
    </section>
  );
}
