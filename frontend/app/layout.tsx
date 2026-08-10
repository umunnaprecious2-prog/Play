import type { Metadata, Viewport } from "next";
import "./globals.css";
import { ServiceWorkerRegistration } from "../components/ServiceWorkerRegistration";
import { BackNav } from "../components/BackNav";
import { ColdStartBanner } from "../components/ColdStartBanner";

export const metadata: Metadata = {
  title: "Play - Bible Adventure for Kids & Adults",
  description: "A bright, welcoming Bible learning app with quiz and memory verse games, built for kids and adults alike.",
  manifest: "/manifest.webmanifest",
  appleWebApp: {
    capable: true,
    statusBarStyle: "black-translucent",
    title: "Play",
  },
};

export const viewport: Viewport = {
  themeColor: "#341577",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>
        <ColdStartBanner />
        <BackNav />
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}