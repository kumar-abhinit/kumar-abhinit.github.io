"use client";

import { useEffect, useState } from "react";
import type { NavItem } from "@/content/portfolio";

/** In-page navigation with scroll-spy. Links work without JS; the highlight is an enhancement. */
export default function SectionNav({ items }: { items: readonly NavItem[] }) {
  const [active, setActive] = useState<string | null>(null);

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const lastId = elements[elements.length - 1].id;
    const atBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    const observer = new IntersectionObserver(
      (entries) => {
        if (atBottom()) {
          setActive(lastId);
          return;
        }
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]) setActive(visible[0].target.id);
      },
      // A section counts as active while it crosses the upper-middle band of the viewport.
      { rootMargin: "-25% 0px -60% 0px" },
    );

    elements.forEach((element) => observer.observe(element));

    // The last section may never reach the upper band; pin it once the page bottom is reached.
    const onScroll = () => {
      if (atBottom()) setActive(lastId);
    };
    window.addEventListener("scroll", onScroll, { passive: true });

    return () => {
      observer.disconnect();
      window.removeEventListener("scroll", onScroll);
    };
  }, [items]);

  return (
    <nav aria-label="Sections">
      <ul className="flex flex-wrap gap-x-5 gap-y-2 md:flex-col md:gap-y-1">
        {items.map((item) => {
          const isActive = active === item.id;
          return (
            <li key={item.id}>
              <a
                href={`#${item.id}`}
                aria-current={isActive ? "location" : undefined}
                className={`group flex items-center gap-3 py-1 text-sm transition-colors ${
                  isActive ? "text-accent" : "text-muted hover:text-foreground"
                }`}
              >
                <span
                  aria-hidden="true"
                  className={`hidden h-px transition-all duration-300 md:block ${
                    isActive
                      ? "w-10 bg-accent"
                      : "w-5 bg-subtle group-hover:w-8 group-hover:bg-foreground"
                  }`}
                />
                {item.label}
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
