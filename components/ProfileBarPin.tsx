"use client";

import { useEffect } from "react";

const MOBILE_QUERY = "(max-width: 767px)";

/**
 * On a phone, mark the fixed contact bar while the section nav is pinned.
 * A sticky box is pinned when its top sits on the sticky offset (0). Scroll
 * jumps can skip a sentinel entirely, so this reads the nav on each scroll.
 */
export default function ProfileBarPin() {
  useEffect(() => {
    const nav = document.querySelector<HTMLElement>(".profile-nav");
    const bar = nav?.closest(".profile")?.querySelector<HTMLElement>(".profile-links");
    if (!nav || !bar) return;

    const mobile = window.matchMedia(MOBILE_QUERY);
    let frame = 0;

    const sync = () => {
      frame = 0;
      const styles = getComputedStyle(nav);
      const offset = Number.parseFloat(styles.top);
      const top = nav.getBoundingClientRect().top;
      const pinned =
        mobile.matches &&
        styles.position === "sticky" &&
        Number.isFinite(offset) &&
        Math.abs(top - offset) <= 1;
      bar.toggleAttribute("data-pinned", pinned);
    };

    const schedule = () => {
      if (!frame) frame = window.requestAnimationFrame(sync);
    };

    window.addEventListener("scroll", schedule, { passive: true });
    window.addEventListener("resize", schedule);
    mobile.addEventListener("change", schedule);
    sync();

    return () => {
      if (frame) window.cancelAnimationFrame(frame);
      window.removeEventListener("scroll", schedule);
      window.removeEventListener("resize", schedule);
      mobile.removeEventListener("change", schedule);
      bar.removeAttribute("data-pinned");
    };
  }, []);

  return null;
}
