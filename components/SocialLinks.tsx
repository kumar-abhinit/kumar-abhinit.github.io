import { FileText, Github, Linkedin, Mail } from "lucide-react";
import type { Links } from "@/content/portfolio";

const linkClass =
  "inline-flex size-9 items-center justify-center rounded-md text-muted transition-colors hover:text-foreground";

/** Lucide has no LeetCode glyph; Simple Icons path, sized like the other brand icons. */
function LeetCodeIcon({ className }: { className?: string }) {
  return (
    <svg viewBox="0 0 24 24" fill="currentColor" className={className} aria-hidden="true">
      <path d="M16.102 17.93l-2.697 2.607c-.466.467-1.111.662-1.823.662s-1.357-.195-1.824-.662l-4.332-4.363c-.467-.467-.702-1.15-.702-1.823s.235-1.357.702-1.824l4.319-4.38c.467-.467 1.111-.663 1.824-.663s1.357.195 1.823.662l2.697 2.606c.514.515 1.365.497 1.9-.038.535-.536.553-1.387.039-1.901l-2.609-2.636a5.055 5.055 0 0 0-2.445-1.337l2.467-2.503c.516-.514.498-1.366-.037-1.901-.535-.535-1.387-.552-1.902-.038l-10.1 10.101c-.981.982-1.494 2.337-1.494 3.835 0 1.498.513 2.895 1.494 3.875l4.347 4.332c.982.981 2.337 1.494 3.834 1.494 1.498 0 2.853-.513 3.835-1.494l2.609-2.637c.514-.514.496-1.365-.039-1.9s-1.386-.553-1.899-.039zM20.811 13.01H10.666c-.702 0-1.27.604-1.27 1.346s.568 1.346 1.27 1.346h10.145c.701 0 1.27-.604 1.27-1.346s-.569-1.346-1.27-1.346z" />
    </svg>
  );
}

/** Icon row: GitHub, LeetCode, LinkedIn, email, résumé. */
export default function SocialLinks({ links }: { links: Links }) {
  return (
    <ul className="-ml-2 flex items-center gap-1" aria-label="Contact links">
      <li>
        <a
          href={links.github}
          className={linkClass}
          aria-label="GitHub profile"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Github className="size-5" aria-hidden="true" />
        </a>
      </li>
      <li>
        <a
          href={links.leetcode}
          className={linkClass}
          aria-label="LeetCode profile"
          target="_blank"
          rel="noopener noreferrer"
        >
          <LeetCodeIcon className="size-5" />
        </a>
      </li>
      <li>
        <a
          href={links.linkedin}
          className={linkClass}
          aria-label="LinkedIn profile"
          target="_blank"
          rel="noopener noreferrer"
        >
          <Linkedin className="size-5" aria-hidden="true" />
        </a>
      </li>
      <li>
        <a href={`mailto:${links.email}`} className={linkClass} aria-label="Send an email">
          <Mail className="size-5" aria-hidden="true" />
        </a>
      </li>
      <li>
        <a
          href={links.resume}
          className={linkClass}
          aria-label="Résumé (PDF)"
          target="_blank"
          rel="noopener noreferrer"
        >
          <FileText className="size-5" aria-hidden="true" />
        </a>
      </li>
    </ul>
  );
}
