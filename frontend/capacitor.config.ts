import type { CapacitorConfig } from "@capacitor/cli";

const config: CapacitorConfig = {
  appId: "com.playbible.app",
  appName: "Play",
  // Static export output (see package.json's "build:mobile" script). The app
  // ships the whole UI locally and only hits the network for real game data,
  // via NEXT_PUBLIC_API_BASE_URL baked into that build.
  webDir: "out",
};

export default config;
