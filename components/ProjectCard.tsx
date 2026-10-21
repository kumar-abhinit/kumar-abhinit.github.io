import { ArrowUpRight } from "lucide-react";
import type { Project } from "@/content/portfolio";
import { TechChipList } from "./TechChip";

const linkClass =
  "inline-flex items-center gap-1 text-sm font-medium text-accent hover:underline underline-offset-4";

export default function ProjectCard({ project }: { project: Project }) {
  return (
    <article className="rounded-lg border border-line p-5 transition-colors hover:border-line-strong sm:p-6">
      <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <h3 className="text-lg font-semibold tracking-tight text-foreground">{project.name}</h3>
        <p className="text-xs tabular-nums text-subtle">{project.period}</p>
      </header>

      <p className="mt-2 text-sm leading-relaxed text-muted">{project.problem}</p>

      <h4 className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
        What I built
      </h4>
      <ul className="bullet-list mt-2 space-y-1.5 text-sm leading-relaxed text-body">
        {project.built.map((item) => (
          <li key={item}>{item}</li>
        ))}
      </ul>

      <h4 className="mt-5 text-xs font-semibold uppercase tracking-[0.14em] text-subtle">
        Key decision
      </h4>
      <p className="mt-2 text-sm leading-relaxed text-body">{project.decisions}</p>

      <div className="mt-5">
        <TechChipList items={project.stack} label={`${project.name} technologies`} />
      </div>

      {project.repoUrl || project.liveUrl ? (
        <footer className="mt-5 flex gap-5">
          {project.repoUrl ? (
            <a href={project.repoUrl} className={linkClass} target="_blank" rel="noopener noreferrer">
              Repository <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          ) : null}
          {project.liveUrl ? (
            <a href={project.liveUrl} className={linkClass} target="_blank" rel="noopener noreferrer">
              Live demo <ArrowUpRight className="size-4" aria-hidden="true" />
            </a>
          ) : null}
        </footer>
      ) : null}
    </article>
  );
}
