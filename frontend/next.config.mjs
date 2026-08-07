/** @type {import('next').NextConfig} */
const isCapacitorBuild = process.env.CAPACITOR_BUILD === "1";

const nextConfig = {
  experimental: {
    typedRoutes: true
  },
  // The website (Render) keeps the normal server build untouched. The mobile
  // app bundle is a separate, static-exported build (see `npm run
  // build:mobile`) so the Capacitor shell can ship the whole UI locally and
  // only hit the network for actual game data.
  ...(isCapacitorBuild
    ? {
        output: "export",
        images: { unoptimized: true },
      }
    : {}),
};

export default nextConfig;
