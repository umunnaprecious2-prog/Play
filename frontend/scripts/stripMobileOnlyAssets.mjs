// Runs after the CAPACITOR_BUILD static export (`npm run build:mobile`), before
// `npx cap sync` copies `out/` into the native Android/iOS projects as the
// app's bundled web assets.
//
// `frontend/public/downloads/play.apk` (the installable APK linked from the
// website's own /download page) lives under `public/`, so Next's static
// export copies it into `out/downloads/play.apk` like any other public
// asset. Left in place, Capacitor would then bundle that file *inside* the
// very APK being built -- the app packaging a copy of itself. Every
// subsequent build would re-embed whatever the previous build produced,
// growing without bound (this is exactly why the APK grew from ~11.5MB to
// ~17.2MB to ~22.8MB across three builds before this fix, roughly +5-6MB of
// pure self-inclusion each time, on top of real size changes).
//
// The website itself is unaffected: this only strips the file from the
// *mobile* export (`out/`) right before Capacitor reads it, never from
// `public/downloads/play.apk` itself or from the real `next build` used by
// the Render web deploy, so the /download page keeps working exactly as
// before.
import { rmSync, existsSync } from "node:fs";

const target = "out/downloads";

if (existsSync(target)) {
  rmSync(target, { recursive: true, force: true });
  console.log(`[stripMobileOnlyAssets] removed ${target} from the mobile export`);
} else {
  console.log(`[stripMobileOnlyAssets] ${target} not present, nothing to strip`);
}
