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
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#eef3fb" },
    { media: "(prefers-color-scheme: dark)", color: "#0a0a0b" },
  ],
  colorScheme: "dark light",
};

// Runs before first paint: marks the document as script-enabled so CSS can opt in
// to the scroll-driven layout (without JS the page stays a plain stacked layout),
// and applies a theme the visitor chose earlier. With no stored choice, CSS
// follows the OS preference via prefers-color-scheme.
const enableJs = `(function(){var d=document.documentElement;d.classList.add('js');try{var t=localStorage.getItem('theme');if(t==='light'||t==='dark')d.dataset.theme=t;}catch(e){}})();`;

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
