"use client";

import Image from "next/image";
import { useId, useState } from "react";

interface HoverInterestProps {
  label: string;
  imageSrc: string;
  imageAlt: string;
}

/**
 * Underlined word that reveals a floating preview image on hover (desktop)
 * or focus (keyboard). Disabled for coarse pointers and reduced motion.
 */
export default function HoverInterest({ label, imageSrc, imageAlt }: HoverInterestProps) {
  const id = useId();
  const [open, setOpen] = useState(false);

  return (
    <span
      className="interest-word relative inline-block"
      onMouseEnter={() => setOpen(true)}
      onMouseLeave={() => setOpen(false)}
      onFocus={() => setOpen(true)}
      onBlur={() => setOpen(false)}
    >
      <button
        type="button"
        className="interest-trigger cursor-default border-0 bg-transparent p-0 font-inherit text-inherit underline decoration-dotted decoration-subtle underline-offset-[0.22em] transition-colors hover:text-foreground hover:decoration-accent focus-visible:text-foreground"
        aria-describedby={open ? id : undefined}
      >
        {label}
      </button>
      <span
        id={id}
        role="tooltip"
        className={`interest-preview pointer-events-none absolute bottom-[calc(100%+0.65rem)] left-1/2 z-30 w-36 -translate-x-1/2 overflow-hidden rounded-lg border border-line bg-background shadow-[0_12px_40px_rgba(0,0,0,0.55)] transition-[opacity,transform] duration-200 ease-out sm:w-44 ${
          open
            ? "translate-y-0 opacity-100"
            : "translate-y-1 opacity-0"
        }`}
      >
        <Image
          src={imageSrc}
          alt={imageAlt}
          width={176}
          height={176}
          className="aspect-square h-auto w-full object-cover"
        />
      </span>
    </span>
  );
}
