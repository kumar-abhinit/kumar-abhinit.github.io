import type { Metadata, Viewport } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  variable: "--font-inter",
  subsets: ["latin"],
  display: "swap",
});

export const metadata: Metadata = {
  title: "Abhinit Kumar - Full Stack Developer",
  description:
    "Portfolio of Abhinit Kumar, a full stack developer building scalable, intelligent digital products.",
};

export const viewport: Viewport = {
  themeColor: "#0a0a0b",
  colorScheme: "dark",
};

// Marks the document as script-enabled before first paint so CSS can opt in to
// the scroll-driven layout. Without JS the page stays a plain stacked layout.
const enableJs = "document.documentElement.classList.add('js')";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={inter.variable} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: enableJs }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
