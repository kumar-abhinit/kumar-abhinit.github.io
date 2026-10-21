"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useEffect, useRef, useState } from "react";
import type { NavItem } from "@/content/portfolio";
import { BrushStroke, SCROLL_BRUSH } from "./TensionText";

gsap.registerPlugin(useGSAP, ScrollTrigger);

const MOBILE_QUERY = "(max-width: 767px)";

/** In-page navigation with scroll-spy. Links work without JS; the highlight is an enhancement. */
export default function SectionNav({ items }: { items: readonly NavItem[] }) {
  const [active, setActive] = useState<string | null>(null);
  const navRef = useRef<HTMLElement>(null);

  useEffect(() => {
    const elements = items
      .map((item) => document.getElementById(item.id))
      .filter((element): element is HTMLElement => element !== null);
    if (elements.length === 0) return;

    const headings = items.map((item) => document.getElementById(`${item.id}-title`));
    const lastId = elements[elements.length - 1].id;
    const mobileQuery = window.matchMedia(MOBILE_QUERY);
    const atBottom = () =>
      window.innerHeight + window.scrollY >= document.documentElement.scrollHeight - 4;

    let observer: IntersectionObserver | null = null;

    const setIfChanged = (id: string | null) => {
      setActive((current) => (current === id ? current : id));
    };

    // On a phone the active label switches at the same line the heading brush starts,
    // so the nav stroke and the section stroke paint together.
    const syncMobile = () => {
      if (atBottom()) {
        setIfChanged(lastId);
        return;
      }
      const line = window.innerHeight * SCROLL_BRUSH.startLine;
      let index = 0;
      headings.forEach((heading, i) => {
        if (heading && heading.getBoundingClientRect().top <= line) index = i;
      });
      setIfChanged(items[index]?.id ?? null);
    };

    const onScroll = () => {
      if (atBottom()) setIfChanged(lastId);
    };

    const bind = () => {
      observer?.disconnect();
      observer = null;
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", syncMobile);
      window.removeEventListener("resize", syncMobile);

      if (mobileQuery.matches) {
        syncMobile();
        window.addEventListener("scroll", syncMobile, { passive: true });
        window.addEventListener("resize", syncMobile);
        return;
      }

      observer = new IntersectionObserver(
        (entries) => {
          if (atBottom()) {
            setIfChanged(lastId);
            return;
          }
          const visible = entries
            .filter((entry) => entry.isIntersecting)
            .sort((a, b) => a.boundingClientRect.top - b.boundingClientRect.top);
          if (visible[0]) setIfChanged(visible[0].target.id);
        },
        // A section counts as active while it crosses the upper-middle band of the viewport.
        { rootMargin: "-25% 0px -60% 0px" },
      );

      elements.forEach((element) => observer?.observe(element));

      // The last section may never reach the upper band; pin it once the page bottom is reached.
      window.addEventListener("scroll", onScroll, { passive: true });
    };

    bind();
    mobileQuery.addEventListener("change", bind);

    return () => {
      mobileQuery.removeEventListener("change", bind);
      observer?.disconnect();
      window.removeEventListener("scroll", onScroll);
      window.removeEventListener("scroll", syncMobile);
      window.removeEventListener("resize", syncMobile);
    };
  }, [items]);

  useGSAP(
    () => {
      const mm = gsap.matchMedia();
      mm.add(`${MOBILE_QUERY} and (prefers-reduced-motion: no-preference)`, () => {
        const nav = navRef.current;
        if (!nav) return;

        items.forEach((item) => {
          const stroke = nav.querySelector<SVGElement>(`[data-nav="${item.id}"] .brush-stroke`);
          const trigger = document.getElementById(`${item.id}-title`);
          if (!stroke || !trigger) return;

          gsap.fromTo(
            stroke,
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              ease: "none",
              scrollTrigger: {
                trigger,
                start: SCROLL_BRUSH.start,
                end: SCROLL_BRUSH.end,
                scrub: SCROLL_BRUSH.scrub,
                invalidateOnRefresh: true,
              },
            },
          );
        });
      });

      return () => mm.revert();
    },
    { dependencies: [items] },
  );

  return (
    <nav ref={navRef} aria-label="Sections">
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
                <span className="brush-target" data-nav={item.id}>
                  {item.label}
                  <BrushStroke mode="scroll" />
                </span>
              </a>
            </li>
          );
        })}
      </ul>
    </nav>
  );
}
