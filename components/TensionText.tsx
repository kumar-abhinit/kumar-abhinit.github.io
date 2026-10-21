"use client";

import { useGSAP } from "@gsap/react";
import gsap from "gsap";
import { ScrollTrigger } from "gsap/ScrollTrigger";
import { useRef, type ReactNode, type Ref } from "react";

gsap.registerPlugin(useGSAP, ScrollTrigger);

type TensionMode = "exit" | "enter";
type TensionTag = "h1" | "h2" | "p" | "span";
type BrushMode = "load" | "scroll";

interface TensionTextProps {
  as?: TensionTag;
  id?: string;
  className?: string;
  children: string;
  /** exit = scrub out with the hero; enter = settle in as the heading approaches. */
  mode?: TensionMode;
  /** Final letter-spacing when the enter animation settles (e.g. "0.18em" for caps). */
  settleTracking?: string;
  /**
   * Paint an accent brush stroke under the last word.
   * "load" draws on a timer; "scroll" is scrubbed by scroll position.
   */
  brush?: BrushMode;
}

/** Hand-painted stroke: tapered ends, ragged bristle edge, one dry streak. */
function BrushStroke({ mode }: { mode: BrushMode }) {
  // Sizes are in em so the stroke scales with whatever text it sits under.
  const small = mode === "scroll";
  return (
    <svg
      className={small ? "brush-stroke brush-scroll" : "brush-stroke"}
      viewBox="0 0 240 26"
      preserveAspectRatio="none"
      aria-hidden="true"
      focusable="false"
      // Geometry and colour are inline so the stroke can never balloon to the
      // heading width if the stylesheet is stale. Colour = cursor-glow accent.
      style={{
        position: "absolute",
        left: "-0.04em",
        bottom: small ? "-0.34em" : "-0.06em",
        width: "calc(100% + 0.1em)",
        height: small ? "0.5em" : "0.2em",
        maxWidth: "none",
        color: "rgb(var(--accent-rgb))",
        pointerEvents: "none",
      }}
    >
      <path
        fill="currentColor"
        d="M3 15C6 10 28 8 62 7.2 104 6.2 150 6.6 190 8 214 8.8 232 10.4 237 13.2 238.6 14.2 237.2 15.2 234.6 15.6 226 16.6 214 17 200 17.6L196 19.4 186 18.4 170 20 156 18.8 128 21 112 19.4 84 20.6 70 19 44 20.4 30 18.6 14 19.2 8 18.6C4.6 18.2 2 16.8 3 15Z"
      />
      <path
        d="M12 22.6C60 20.2 120 22.4 168 20.8 190 20.2 206 20.8 218 19.6"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.6"
        strokeLinecap="round"
        opacity="0.55"
      />
    </svg>
  );
}

function WordTokens({ text, brush }: { text: string; brush?: BrushMode }): ReactNode {
  const tokens = text.split(/(\s+)/);
  let lastWord = -1;
  tokens.forEach((token, index) => {
    if (!/^\s+$/.test(token) && token !== "") lastWord = index;
  });

  return tokens.map((token, index) => {
    if (/^\s+$/.test(token)) {
      return <span key={`s-${index}`}>{token}</span>;
    }
    const word = (
      <span key={`w-${index}`} className="tension-word">
        <span className="tension-inner">{token}</span>
      </span>
    );
    if (brush && index === lastWord) {
      // The stroke sits outside the word mask so it is never clipped.
      return (
        <span key={`b-${index}`} className="brush-target">
          {word}
          <BrushStroke mode={brush} />
        </span>
      );
    }
    return word;
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
  brush,
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

      // Scroll-driven brush: the stroke is painted in as the heading travels up the viewport.
      if (brush === "scroll") {
        const stroke = root.querySelector<SVGElement>(".brush-stroke");
        if (stroke) {
          gsap.fromTo(
            stroke,
            { clipPath: "inset(0 100% 0 0)" },
            {
              clipPath: "inset(0 0% 0 0)",
              ease: "none",
              scrollTrigger: {
                trigger: root,
                start: "top 82%",
                end: "top 34%",
                scrub: 0.7,
                invalidateOnRefresh: true,
              },
            },
          );
        }
      }

      // Sticky hero / font load can shift metrics after first paint.
      const refresh = () => ScrollTrigger.refresh();
      requestAnimationFrame(refresh);
      document.fonts?.ready.then(refresh).catch(() => {});
    },
    { dependencies: [children, mode, settleTracking, brush], revertOnUpdate: true },
  );

  const content = <WordTokens text={children} brush={brush} />;

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
