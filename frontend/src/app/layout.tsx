import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Duolingo - The world's best way to learn a language",
  description: "Learn Spanish in just 5 minutes a day with game-like lessons. Bite-sized, 100% free, and gamified.",
  icons: {
    icon: "/favicon.ico",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="h-full antialiased font-sans">
      <head>
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1" />
      </head>
      <body className="min-h-full flex flex-col bg-white text-gray-900 selection:bg-[#58cc02]/30">
        {children}
      </body>
    </html>
  );
}
