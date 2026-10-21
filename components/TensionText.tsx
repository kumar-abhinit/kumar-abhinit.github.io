"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode, type Ref } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type TensionMode = "exit" | "enter";
type TensionTag = "h1" | "h2" | "p" | "span";

interface TensionTextProps {
  as?: TensionTag;
  id?: string;
  className?: string;
  children: string;
  /** exit = scrub out with the hero; enter = settle in as the heading approaches. */
  mode?: TensionMode;
  /** Final letter-spacing when the enter animation settles (e.g. "0.18em" for caps). */
  settleTracking?: string;
}

function WordTokens({ text }: { text: string }): ReactNode {
  return text.split(/(\s+)/).map((token, index) => {
    if (/^\s+$/.test(token)) {
      return <span key={`s-${index}`}>{token}</span>;
    }
    return (
      <span key={`w-${index}`} className="tension-word">
        <span className="tension-inner">{token}</span>
      </span>
    );
  });
}

/**
 * Word-level scroll tension: letter-spacing, skew and vertical pull scrubbed to
 * scroll — inspired by scroll typography demos, without hijacking the page.
 */
export default function TensionText({
  as = "span",
  id,
  className,
  children,
  mode = "enter",
  settleTracking = "0em",
}: TensionTextProps) {
  const rootRef = useRef<HTMLElement | null>(null);
  const mergedClass = className ? `tension-text ${className}` : "tension-text";
  // Concrete tags want narrower ref types; one HTMLElement ref is enough for GSAP.
  const ref = rootRef as Ref<HTMLElement>;

  useGSAP(
    () => {
      const root = rootRef.current;
      if (!root) return;

      const reduce = window.matchMedia("(prefers-reduced-motion: reduce)");
      if (reduce.matches) return;

      const inners = root.querySelectorAll<HTMLElement>(".tension-inner");
      if (inners.length === 0) return;

      if (mode === "exit") {
        const trigger = root.closest<HTMLElement>(".hero-pane") ?? root;
        gsap.to(inners, {
          yPercent: -42,
          opacity: 0,
          skewY: 5,
          letterSpacing: "0.12em",
          scaleY: 1.12,
          stagger: { each: 0.045, from: "start" },
          ease: "none",
          scrollTrigger: {
            trigger,
            start: "top top",
            end: "+=70%",
            scrub: 0.65,
            invalidateOnRefresh: true,
          },
        });
      } else {
        gsap.fromTo(
          inners,
          {
            yPercent: 55,
            opacity: 0,
            skewY: -7,
            letterSpacing: "0.42em",
            scaleY: 1.2,
          },
          {
            yPercent: 0,
            opacity: 1,
            skewY: 0,
            letterSpacing: settleTracking,
            scaleY: 1,
            stagger: { each: 0.05, from: "start" },
            ease: "none",
            scrollTrigger: {
              trigger: root,
              start: "top 92%",
              end: "top 48%",
              scrub: 0.55,
              invalidateOnRefresh: true,
            },
          },
        );
      }

      // Sticky hero / font load can shift metrics after first paint.
      const refresh = () => ScrollTrigger.refresh();
      requestAnimationFrame(refresh);
      document.fonts?.ready.then(refresh).catch(() => {});
    },
    { dependencies: [children, mode, settleTracking], revertOnUpdate: true },
  );

  const content = <WordTokens text={children} />;

  if (as === "h1") {
    return (
      <h1 ref={ref as Ref<HTMLHeadingElement>} id={id} className={mergedClass}>
        {content}
      </h1>
    );
  }
  if (as === "h2") {
    return (
      <h2 ref={ref as Ref<HTMLHeadingElement>} id={id} className={mergedClass}>
        {content}
      </h2>
    );
  }
  if (as === "p") {
    return (
      <p ref={ref as Ref<HTMLParagraphElement>} id={id} className={mergedClass}>
        {content}
      </p>
    );
  }
  return (
    <span ref={ref as Ref<HTMLSpanElement>} id={id} className={mergedClass}>
      {content}
    </span>
  );
}
