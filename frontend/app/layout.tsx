import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Play - Bible Adventure for Kids",
  description: "A bright, child-friendly Bible learning app with quiz and memory verse games.",
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}