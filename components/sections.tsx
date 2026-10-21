import type { CSSProperties } from "react";
import { about, experience, profile, projects, skills } from "@/content/portfolio";
import HoverInterest from "./HoverInterest";
import ProjectCard from "./ProjectCard";
import SectionHeading from "./SectionHeading";
import { TechChipList } from "./TechChip";

function delay(ms: number): CSSProperties {
  return { ["--reveal-delay" as string]: `${ms}ms` };
}

export function AboutSection() {
  return (
    <section id="about" aria-labelledby="about-title" className="section">
      <SectionHeading id="about-title">About</SectionHeading>
      <div className="max-w-xl space-y-4 text-[0.9375rem] leading-[1.7] text-body">
        {about.map((paragraph, index) => (
          <p key={paragraph} className="reveal" style={delay(80 + index * 90)}>
            {paragraph}
          </p>
        ))}
      </div>
      <p className="reveal mt-6 text-sm text-muted" style={delay(360)}>
        <span className="text-subtle">Away from work: </span>
        <HoverInterest
          label="chess"
          imageSrc="/interests/chess.jpg"
          imageAlt="Two chess pieces on a board"
        />{" "}
        and{" "}
        <HoverInterest
          label="travelling"
          imageSrc="/interests/travel.jpg"
          imageAlt="Airplane flying through the sky"
        />
      </p>
    </section>
  );
}

export function ExperienceSection() {
  return (
    <section id="experience" aria-labelledby="experience-title" className="section">
      <SectionHeading id="experience-title">Experience</SectionHeading>
      <ol className="space-y-12">
        {experience.map((job, index) => (
          <li key={job.company} className="reveal" style={delay(index * 100)}>
            <article>
              <header className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
                <h3 className="text-base font-semibold text-foreground">
                  {job.role}
                  <span className="font-normal text-muted"> · {job.company}</span>
                </h3>
                <p className="text-xs tabular-nums text-subtle">{job.period}</p>
              </header>
              <p className="mt-2 text-sm leading-relaxed text-muted">{job.summary}</p>
              <ul className="bullet-list mt-4 space-y-2 text-sm leading-relaxed text-body">
                {job.highlights.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
              <div className="mt-4">
                <TechChipList items={job.stack} label={`${job.company} technologies`} />
              </div>
            </article>
          </li>
        ))}
      </ol>
    </section>
  );
}

export function ProjectsSection() {
  return (
    <section id="projects" aria-labelledby="projects-title" className="section">
      <SectionHeading id="projects-title">Projects</SectionHeading>
      <div className="space-y-5">
        {projects.map((project, index) => (
          <div key={project.name} className="reveal" style={delay(index * 110)}>
            <ProjectCard project={project} />
          </div>
        ))}
      </div>
    </section>
  );
}

export function SkillsSection() {
  return (
    <section id="skills" aria-labelledby="skills-title" className="section pb-12">
      <SectionHeading id="skills-title">Skills</SectionHeading>
      <div className="grid gap-x-8 gap-y-7 sm:grid-cols-2">
        {skills.map((group, index) => (
          <div key={group.title} className="reveal" style={delay(index * 70)}>
            <h3 className="mb-3 text-sm font-semibold text-foreground">{group.title}</h3>
            <TechChipList items={group.items} label={`${group.title} skills`} />
          </div>
        ))}
      </div>
      <p className="reveal mt-16 text-xs text-subtle" style={delay(200)}>
        © {new Date().getFullYear()} {profile.name}
      </p>
    </section>
  );
}
