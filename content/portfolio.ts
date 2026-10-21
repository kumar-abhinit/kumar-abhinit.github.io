/**
 * Portfolio content. Source of truth: the current résumé (Abhinit_Kumar_Resume.pdf)
 * plus the local DevPal README for project details. Presentation lives in /components.
 */

export interface Links {
  email: string;
  github: string;
  leetcode: string;
  linkedin: string;
  resume: string;
}

export interface Profile {
  name: string;
  label: string;
  headline: string;
  role: string;
  tagline: string;
  location: string;
  /** Hero paragraphs, in order. */
  intro: readonly string[];
  /** One-line summary shown in the compact profile panel. */
  summary: string;
  interests: string;
  links: Links;
}

export interface Experience {
  company: string;
  role: string;
  period: string;
  summary: string;
  highlights: readonly string[];
  stack: readonly string[];
}

export interface Project {
  name: string;
  period: string;
  problem: string;
  built: readonly string[];
  decisions: string;
  stack: readonly string[];
  /** Only set when the repository is verified to be public. */
  repoUrl?: string;
  /** Only set when a live demo is verified. */
  liveUrl?: string;
}

export interface SkillGroup {
  title: string;
  items: readonly string[];
}

export interface NavItem {
  id: string;
  label: string;
}

export const links: Links = {
  email: "kumarabhinit.dev@gmail.com",
  github: "https://github.com/kumar-abhinit",
  leetcode: "https://leetcode.com/kumar-abhinit",
  linkedin: "https://www.linkedin.com/in/kumar-abhinit/",
  resume: "/Abhinit_Kumar_Resume.pdf",
};

export const profile: Profile = {
  name: "Abhinit Kumar",
  label: "ABHINIT KUMAR",
  headline: "Hi, I'm Abhinit.",
  role: "Full Stack Developer",
  tagline: "Full Stack Developer building scalable, intelligent digital products.",
  location: "Ahmedabad, India",
  intro: [
    "I build web applications from frontend to backend, combining thoughtful user experiences, robust APIs, efficient databases, and AI-powered capabilities.",
    "Currently, I work on multi-tenant SaaS platforms, data integrations, and AI-assisted workflows, with a focus on clean architecture, performance, and maintainable software.",
    "Away from the keyboard, I enjoy playing chess and travelling.",
  ],
  summary:
    "Four years of building scalable web products, from React interfaces to NestJS and FastAPI backends.",
  interests: "Chess and travelling",
  links,
};

export const navItems: readonly NavItem[] = [
  { id: "about", label: "About" },
  { id: "experience", label: "Experience" },
  { id: "projects", label: "Projects" },
  { id: "skills", label: "Skills" },
];

export const about: readonly string[] = [
  "I'm a full stack developer with four years of experience designing and building scalable web applications. My day-to-day work spans React and Next.js on the frontend, NestJS and FastAPI on the backend, and PostgreSQL or MongoDB underneath.",
  "I started in 2022 as a developer intern and moved into a full-time MERN role based on performance. Since then I've worked on API design, authentication and role-based access control, query optimization, and multi-tenant architectures.",
  "These days a lot of my work sits where product engineering meets AI: data integrations, chat assistants over analytics, and tooling that fits into how developers already work. Outside of work, I play chess and like to travel.",
];

export const experience: readonly Experience[] = [
  {
    company: "Techtic Solutions Inc.",
    role: "AI Full Stack Developer",
    period: "Jan 2025 – Present",
    summary:
      "Building and hardening multi-tenant products across analytics, health tracking, parenting, and enterprise training.",
    highlights: [
      "Built a multi-tenant marketing analytics SaaS with Next.js, TypeScript, FastAPI, and PostgreSQL, unifying GA4, Search Console, Shopify, Ads, and SEO data, with an OpenAI and MCP chat assistant for querying channel metrics in plain language.",
      "Optimized a multi-tenant Next.js application, improving database read operations through proper indexing while keeping tenant data consistent with the master database.",
      "Delivered a height and growth tracking backend with FastAPI, MongoDB, Celery, and Redis, improving API performance, reminder scheduling, and Firebase push delivery.",
      "Strengthened a parenting app on NestJS, TypeScript, and MongoDB with timezone-aware FCM alerts, plus admin tools for coaching, moderation, and campaigns.",
      "Hardened an employee training platform on NestJS, TypeORM, and PostgreSQL, improving campaign progress tracking, course delivery, and Azure SSO.",
    ],
    stack: [
      "Next.js",
      "TypeScript",
      "FastAPI",
      "NestJS",
      "PostgreSQL",
      "MongoDB",
      "Redis",
      "Celery",
      "OpenAI",
      "MCP",
    ],
  },
  {
    company: "Ultroneous Technologies LLP",
    role: "Full Stack Developer",
    period: "Sep 2023 – Jan 2025",
    summary:
      "Full stack delivery with React on the frontend and NestJS on the backend.",
    highlights: [
      "Developed and maintained responsive front-end components with React.js, Material UI, and Redux Toolkit.",
      "Built scalable RESTful APIs with NestJS, TypeScript, and PostgreSQL while keeping the application architecture clean.",
      "Integrated authentication and role-based access control using JWT and OAuth with NestJS.",
      "Improved query efficiency with PostgreSQL indexes and query optimization, and reduced API response time by 40%.",
    ],
    stack: [
      "React.js",
      "Material UI",
      "Redux Toolkit",
      "NestJS",
      "TypeScript",
      "PostgreSQL",
      "JWT",
      "OAuth",
    ],
  },
  {
    company: "Skystis Infotech LLP",
    role: "MERN Stack Developer",
    period: "Jun 2022 – Sep 2023",
    summary:
      "Started as a developer intern and was converted to a full-time MERN developer based on performance.",
    highlights: [
      "Designed and implemented an expense management application on the MERN stack, reducing processing time by 40%.",
      "Developed the admin panel and job application modules of a community web application with React.js and Material UI.",
      "Built and deployed a portfolio website backend with Node.js, Express.js, and MongoDB through Mongoose.",
      "Implemented efficient API endpoints, reducing server load by 25% through optimized query handling.",
    ],
    stack: [
      "MongoDB",
      "Express.js",
      "React.js",
      "Node.js",
      "Mongoose",
      "Material UI",
    ],
  },
];

export const projects: readonly Project[] = [
  {
    name: "AI Marketing Analytics SaaS",
    period: "Aug 2026 – Present",
    problem:
      "Marketing performance lives in separate tools, which makes SEO, revenue, and channel results hard to read together.",
    built: [
      "A multi-tenant analytics platform that unifies GA4, Search Console, Ahrefs, Shopify, and paid channels.",
      "Secure tenant authentication, data-source integrations, and interactive dashboards.",
      "AI-powered insights for SEO, revenue, and channel performance.",
    ],
    decisions:
      "Multi-tenant from the start, with per-tenant authentication and integrations feeding shared dashboards.",
    stack: [
      "Next.js",
      "TypeScript",
      "FastAPI",
      "PostgreSQL",
      "OpenAI",
      "MCP",
      "GA4",
      "Search Console",
      "Ahrefs",
      "Shopify",
    ],
  },
  {
    name: "DevPal",
    period: "Aug 2026",
    problem:
      "Developers work across several repositories, but managers want a clear daily narrative rather than raw commit logs.",
    built: [
      "A Next.js and TypeScript app with MCP and CLI tooling that generates daily engineering status reports from Git commit history and uncommitted work.",
      "Repository-to-project mapping, SQLite persistence, and scheduled email delivery of manager-ready reports.",
    ],
    decisions:
      "Local-first: reports are written from Git evidence through MCP tools, stored in SQLite, and emailed on a schedule.",
    stack: [
      "Next.js",
      "TypeScript",
      "MCP",
      "CLI",
      "Prisma",
      "SQLite",
      "Tailwind CSS",
    ],
  },
  {
    name: "Expense Management Application",
    period: "2022 – 2023",
    problem: "Expense processing needed to be faster and easier to manage.",
    built: [
      "A MERN application for expense processing and management, delivered while at Skystis Infotech.",
      "Reduced processing time by 40%.",
    ],
    decisions:
      "Built end to end on the MERN stack, from the React interface to Express APIs and MongoDB storage.",
    stack: ["MongoDB", "Express.js", "React.js", "Node.js"],
  },
];

export const skills: readonly SkillGroup[] = [
  {
    title: "Frontend",
    items: ["React.js", "Next.js", "TypeScript", "Material UI", "Redux Toolkit"],
  },
  {
    title: "Backend",
    items: [
      "Node.js",
      "Express.js",
      "NestJS",
      "FastAPI",
      "TypeORM",
      "Sequelize",
      "Celery",
    ],
  },
  {
    title: "Databases",
    items: ["PostgreSQL", "MySQL", "MongoDB", "Redis", "SQLite"],
  },
  {
    title: "AI & Integrations",
    items: [
      "OpenAI",
      "MCP",
      "GA4",
      "Search Console",
      "Shopify",
      "Ahrefs",
      "Firebase FCM",
      "Azure SSO",
      "JWT",
      "OAuth",
    ],
  },
  {
    title: "Testing",
    items: ["Jest", "React Testing Library", "Unit testing", "Integration testing"],
  },
  {
    title: "DevOps",
    items: ["Docker", "Git", "CI/CD", "GitHub Actions", "AWS"],
  },
];
