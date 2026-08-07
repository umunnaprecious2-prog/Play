import Link from "next/link";

export default function DownloadPage() {
  return (
    <main className="min-h-screen px-4 py-6 sm:px-6 lg:px-10">
      <div className="mx-auto flex max-w-2xl flex-col gap-6 py-10">
        <header className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 text-center shadow-soft backdrop-blur sm:p-8">
          <span className="text-sm font-bold uppercase tracking-[0.2em] text-royal-500">Android App</span>
          <h1 className="mx-auto mt-2 text-3xl font-black text-slate-900 sm:text-4xl">Get Play on Android</h1>
          <p className="mx-auto mt-3 max-w-lg text-base leading-7 text-slate-600">
            Play isn&apos;t on the Google Play Store yet, so this is a direct download &mdash; the exact same app,
            installed with a home screen icon like any other. It&apos;s free and safe; Android just shows a warning
            for anything installed outside its store, which the steps below walk you through.
          </p>

          <a
            href="/downloads/play.apk"
            download
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-royal-600 px-8 py-4 text-lg font-bold text-white shadow-lg transition hover:-translate-y-0.5 hover:bg-royal-700"
          >
            ⬇ Download for Android
          </a>
        </header>

        <div className="grid gap-4 rounded-[1.75rem] border border-white/70 bg-white/80 p-6 shadow-soft backdrop-blur sm:p-8">
          <h2 className="text-xl font-black text-slate-900">How to install it</h2>
          <ol className="grid gap-4">
            <Step number={1} title="Tap the download button above">
              Your phone downloads a file called <code className="rounded bg-slate-100 px-1.5 py-0.5 text-xs">play.apk</code>.
            </Step>
            <Step number={2} title="Allow this install">
              Android will likely warn that it doesn&apos;t recognize the source, since this isn&apos;t from the Play
              Store. Tap <strong>Settings</strong> in that prompt, then turn on <strong>Allow from this source</strong>
              &nbsp;for your browser, and go back to install.
            </Step>
            <Step number={3} title="Open the downloaded file and tap Install">
              Find it in your notifications or Downloads folder if it doesn&apos;t open automatically.
            </Step>
            <Step number={4} title="Open Play and start playing">
              You&apos;ll see it on your home screen and app drawer like any other app from here on.
            </Step>
          </ol>
        </div>

        <div className="rounded-[1.75rem] border border-white/70 bg-white/80 p-6 text-center shadow-soft backdrop-blur sm:p-8">
          <p className="text-sm leading-6 text-slate-600">
            Prefer not to install anything? Play works great directly in your browser too &mdash; on Android,
            iPhone, tablets, and desktop alike.
          </p>
          <Link
            href="/account"
            className="mt-3 inline-flex items-center gap-1 font-semibold text-royal-600 hover:underline"
          >
            Sign in to play in your browser instead →
          </Link>
        </div>
      </div>
    </main>
  );
}

function Step({ number, title, children }: { number: number; title: string; children: React.ReactNode }) {
  return (
    <li className="flex gap-4">
      <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-royal-100 text-sm font-black text-royal-700">
        {number}
      </span>
      <div>
        <p className="font-bold text-slate-900">{title}</p>
        <p className="mt-1 text-sm leading-6 text-slate-600">{children}</p>
      </div>
    </li>
  );
}
