const LAST_UPDATED = "August 7, 2026";

export default function PrivacyPolicyPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-3xl flex-col gap-6 py-10">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur sm:p-8">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-royal-500">Legal</span>
          <h1 className="mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Privacy Policy</h1>
          <p className="mt-2 text-sm text-slate-500">Last updated: {LAST_UPDATED}</p>
        </header>

        <div className="grid gap-6 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur sm:p-8">
          <Section title="Overview">
            <p>
              Play is a Bible learning game app for kids and adults. This page explains what information Play
              collects, how it&apos;s used, and the choices you have. We keep this simple on purpose: Play doesn&apos;t
              run ads, doesn&apos;t use third-party analytics or trackers, and doesn&apos;t sell data to anyone.
            </p>
          </Section>

          <Section title="Playing without an account">
            <p>
              You can play every game in Play without creating an account. When you pick a game for the first
              time, you choose a nickname and an avatar. That information, along with your progress (XP, levels,
              stars, streaks, and scores), is saved on Play&apos;s servers and linked to a random identifier stored
              in your browser or device&apos;s local storage &mdash; not a cookie, and not tied to your name, email,
              or any other personal information.
            </p>
          </Section>

          <Section title="Creating an account">
            <p>
              If you choose to create an account, we collect an email address and a password. Your password is
              never stored in plain text &mdash; it&apos;s hashed using a one-way cryptographic function before it
              touches our database, so we can&apos;t see or recover it ourselves. Once signed in, you can add player
              profiles for your kids (a nickname and an avatar each), the same information used by guest play.
              Kids don&apos;t need to provide a real name, email, or any other personal information of their own
              &mdash; the account itself belongs to the parent.
            </p>
          </Section>

          <Section title="What we don't collect">
            <p>
              We don&apos;t collect real names, birthdates, addresses, phone numbers, or precise location. We don&apos;t
              use advertising SDKs, third-party analytics, or tracking pixels of any kind. We don&apos;t sell,
              rent, or share your data with advertisers or data brokers.
            </p>
          </Section>

          <Section title="Where your data is stored">
            <p>
              Play&apos;s data is stored in a PostgreSQL database hosted by Render (render.com), a third-party
              infrastructure provider. Render hosts the servers Play runs on; it doesn&apos;t have its own access to
              use your data beyond providing that hosting.
            </p>
          </Section>

          <Section title="Children's privacy">
            <p>
              Play is built to be safe for kids to use alongside a parent or guardian. A child&apos;s player profile never
              collects a real name, email, or other personal information &mdash; only a nickname and an avatar
              choice, both freely made up. The only real personal information Play collects (an email address) is
              provided by the parent or guardian who creates the account, not by a child.
            </p>
          </Section>

          <Section title="Your choices">
            <p>
              You can stop using Play at any time; guest progress simply stays in your browser&apos;s local storage
              until you clear it. If you&apos;d like your account or a child&apos;s profile data deleted, contact us
              using the email below and we&apos;ll take care of it.
            </p>
          </Section>

          <Section title="Changes to this policy">
            <p>
              If this policy changes, we&apos;ll update the date at the top of this page. Continued use of Play
              after a change means you accept the updated policy.
            </p>
          </Section>

          <Section title="Contact us">
            <p>
              Questions about this policy or your data? Email us at{" "}
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
