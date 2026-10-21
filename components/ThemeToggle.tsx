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

/** "|" plus the theme toggle, as the last items in a contact-links row. */
export function ContactThemeControl() {
  return (
    <>
      <li aria-hidden="true" className="social-sep">
        |
      </li>
      <li>
        <ThemeToggle />
      </li>
    </>
  );
}

/**
 * Light / dark switch. Follows the OS preference until the visitor picks a theme;
 * the choice is then stored and applied before paint by the layout's inline script.
 */
export default function ThemeToggle() {
  const theme = useSyncExternalStore(subscribe, getTheme, (): Theme => "dark");
  const next: Theme = theme === "dark" ? "light" : "dark";
  const label = `Switch to ${next} mode`;

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
    <span className="icon-tip icon-tip-end">
      <button
        type="button"
        onClick={toggle}
        aria-label={label}
        className="theme-toggle inline-flex size-9 shrink-0 cursor-pointer items-center justify-center rounded-md text-muted transition-colors hover:text-foreground"
      >
        <Icon className="size-[18px]" aria-hidden="true" />
      </button>
      <span className="icon-tip-label" role="tooltip" aria-hidden="true">
        {label}
      </span>
    </span>
  );
}
