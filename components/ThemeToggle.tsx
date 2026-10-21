"use client";

import { Moon, Sun } from "lucide-react";
import { useSyncExternalStore } from "react";

export type Theme = "light" | "dark";

/** localStorage key; also read by the inline script in app/layout.tsx. */
export const THEME_STORAGE_KEY = "theme";

const LIGHT_QUERY = "(prefers-color-scheme: light)";

/** The theme currently in effect: a forced `data-theme`, else the OS preference. */
function getTheme(): Theme {
  const forced = document.documentElement.dataset.theme;
  if (forced === "light" || forced === "dark") return forced;
  return window.matchMedia(LIGHT_QUERY).matches ? "light" : "dark";
}

function subscribe(onChange: () => void) {
  const query = window.matchMedia(LIGHT_QUERY);
  query.addEventListener("change", onChange);
  const observer = new MutationObserver(onChange);
  observer.observe(document.documentElement, {
    attributes: true,
    attributeFilter: ["data-theme"],
  });
  return () => {
    query.removeEventListener("change", onChange);
    observer.disconnect();
  };
}

/**
 * Light / dark switch. Follows the OS preference until the visitor picks a theme;
 * the choice is then stored and applied before paint by the layout's inline script.
 */
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, (): Theme => "dark");
  const next: Theme = theme === "dark" ? "light" : "dark";

  const toggle = () => {
    document.documentElement.dataset.theme = next;
    try {
      localStorage.setItem(THEME_STORAGE_KEY, next);
    } catch {
      // Storage can be blocked; the choice then lasts for this visit only.
    }
  };

  const Icon = theme === "dark" ? Sun : Moon;

  return (
    <button
      type="button"
      onClick={toggle}
      aria-label={`Switch to ${next} mode`}
      title={`Switch to ${next} mode`}
      className="theme-toggle fixed bottom-4 right-4 z-50 inline-flex size-9 items-center justify-center rounded-md border border-line bg-background/70 text-muted backdrop-blur transition-colors hover:border-line-strong hover:text-foreground"
    >
      <Icon className="size-[18px]" aria-hidden="true" />
    </button>
  );
}
