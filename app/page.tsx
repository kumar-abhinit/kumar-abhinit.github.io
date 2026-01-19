'use client'
import React, { useState, useEffect } from 'react';
import { 
  Github, 
  Linkedin, 
  Mail, 
  ArrowUpRight, 
  Code, 
  Database, 
  Cpu, 
  Terminal, 
  MapPin, 
  Download,
  Briefcase,
  ExternalLink,
  Layers,
  Coffee,
  Globe
} from 'lucide-react';

const Portfolio = () => {
  const [activeTab, setActiveTab] = useState('all');

  // Resume Data
  const profile = {
    name: "Abhinit Kumar",
    role: "Full Stack Developer",
    location: "Ahmedabad, India",
    email: "kumarabhinit.dev@gmail.com",
    status: "Available for Hire",
    social: {
      github: "https://github.com/kumar-abhinit",
      linkedin: "https://www.linkedin.com/in/kumar-abhinit/",
    },
    about: "I engineer scalable web ecosystems. With 3 years of full-stack experience, I bridge the gap between complex backend architectures and responsive, pixel-perfect frontends.",
  };

  const skills = [
    { name: "React.js / Next.js", icon: <Code className="w-4 h-4" />, category: "frontend" },
    { name: "Node.js / NestJS", icon: <Cpu className="w-4 h-4" />, category: "backend" },
    { name: "PostgreSQL / Mongo", icon: <Database className="w-4 h-4" />, category: "db" },
    { name: "TypeScript", icon: <Terminal className="w-4 h-4" />, category: "lang" },
    { name: "Docker / AWS", icon: <Globe className="w-4 h-4" />, category: "ops" },
  ];

  const experience = [
    {
      company: "Techtic Solutions Pvt Ltd",
      role: "Full Stack Developer",
      period: "Feb 2025 - Present",
      desc: "Optimizing Nest.js multi-tenant architectures and enhancing DB read operations."
    },
    {
      company: "Ultroneous Technologies",
      role: "Full Stack Developer",
      period: "2023 - 2025",
      desc: "Built scalable REST APIs with NestJS & React. Optimized queries reducing response time by 30%."
    },
    {
      company: "Skystis Infotech LLP",
      role: "MERN Stack Developer",
      period: "2022 - 2023",
      desc: "Designed expense management apps and admin panels using the MERN stack."
    }
  ];

  const projects = [
    {
      title: "Expense Tracker",
      tech: "MERN Stack • PWA",
      desc: "Mobile-friendly PWA for real-time expense tracking with MongoDB synchronization.",
      color: "bg-purple-500"
    },
    {
      title: "Community Admin",
      tech: "React • Material UI",
      desc: "Comprehensive admin dashboard for platform moderation and user management.",
      color: "bg-blue-500"
    },
    {
      title: "Freelance Portal",
      tech: "Next.js • React",
      desc: "City-specific gig marketplace connecting local freelancers with employers.",
      color: "bg-emerald-500"
    }
  ];

  return (
    <div className="min-h-screen bg-neutral-950 text-neutral-200 font-sans selection:bg-indigo-500/30 selection:text-indigo-200 p-4 md:p-8 lg:p-12">
      
      <div className="max-w-7xl mx-auto grid grid-cols-1 md:grid-cols-4 lg:grid-cols-4 gap-4 md:gap-6 auto-rows-auto">
        
        {/* 1. Profile Hero Card (Spans 2 cols, 2 rows) */}
        <div className="col-span-1 md:col-span-2 row-span-1 md:row-span-2 bg-neutral-900/50 border border-neutral-800 rounded-3xl p-8 flex flex-col justify-between relative overflow-hidden group hover:border-neutral-700 transition-all duration-500">
          <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-600/10 rounded-full blur-3xl -mr-16 -mt-16 transition-all group-hover:bg-indigo-600/20"></div>
          
          <div className="relative z-10">
            <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-emerald-900/30 border border-emerald-800/50 text-emerald-400 text-xs font-medium mb-6">
              <span className="relative flex h-2 w-2">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500"></span>
              </span>
              {profile.status}
            </div>
            <h1 className="text-4xl md:text-5xl lg:text-6xl font-bold text-white tracking-tight mb-4">
              {profile.name}
            </h1>
            <p className="text-xl text-neutral-400 max-w-md">
              {profile.role}
            </p>
            <p className="mt-4 text-neutral-500 text-sm max-w-sm leading-relaxed">
              {profile.about}
            </p>
          </div>

          <div className="mt-8 flex gap-4 relative z-10">
            <a href={`mailto:${profile.email}`} className="flex items-center gap-2 bg-white text-black px-6 py-3 rounded-full font-semibold hover:bg-neutral-200 transition-colors">
              <Mail className="w-4 h-4" /> Contact Me
            </a>
            <div className="flex gap-2">
              <a href={profile.social.github} className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 hover:text-white transition-all"><Github className="w-5 h-5" /></a>
              <a href={profile.social.linkedin} className="p-3 bg-neutral-800 rounded-full hover:bg-neutral-700 hover:text-white transition-all"><Linkedin className="w-5 h-5" /></a>
            </div>
          </div>
        </div>

        {/* 2. Location & Stats Card */}
        <div className="col-span-1 md:col-span-1 bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-between hover:border-neutral-700 transition-colors">
          <div className="flex justify-between items-start">
            <div className="p-2 bg-neutral-800 rounded-lg text-neutral-400">
              <MapPin className="w-6 h-6" />
            </div>
            <span className="text-xs font-mono text-neutral-600">LOC</span>
          </div>
          <div>
            <div className="text-2xl font-bold text-white mt-4">Ahmedabad</div>
            <div className="text-sm text-neutral-500">India (IST)</div>
          </div>
        </div>

        {/* 3. Experience "Commit" History Card */}
        <div className="col-span-1 md:col-span-1 row-span-2 bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 relative overflow-hidden hover:border-neutral-700 transition-colors">
           <div className="flex items-center justify-between mb-6">
              <h3 className="text-lg font-semibold text-white">Experience</h3>
              <Briefcase className="w-5 h-5 text-neutral-600" />
           </div>
           <div className="space-y-6 relative">
             {/* Vertical Line */}
             <div className="absolute left-1.5 top-2 bottom-2 w-0.5 bg-neutral-800"></div>
             
             {experience.map((job, i) => (
               <div key={i} className="relative pl-6 group">
                 <div className="absolute left-0 top-1.5 w-3.5 h-3.5 bg-neutral-900 border-2 border-indigo-500 rounded-full group-hover:bg-indigo-500 transition-colors"></div>
                 <div className="text-xs text-indigo-400 font-mono mb-1">{job.period}</div>
                 <div className="font-medium text-white text-sm">{job.company}</div>
                 <div className="text-xs text-neutral-500 mt-1 leading-snug">{job.desc}</div>
               </div>
             ))}
           </div>
        </div>

        {/* 4. Tech Stack Marquee/Grid */}
        <div className="col-span-1 md:col-span-1 bg-neutral-900/50 border border-neutral-800 rounded-3xl p-6 flex flex-col justify-center hover:border-neutral-700 transition-colors group">
          <h3 className="text-sm font-mono text-neutral-500 mb-4 uppercase tracking-wider">Tech Stack</h3>
          <div className="flex flex-wrap gap-2">
            {skills.map((skill, i) => (
              <span key={i} className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-lg bg-neutral-800 text-xs text-neutral-300 border border-neutral-700 group-hover:border-indigo-500/30 transition-colors">
                {skill.icon} {skill.name.split('/')[0]}
              </span>
            ))}
          </div>
        </div>

        {/* 5. Projects Header (Visual Break) */}
        <div className="col-span-1 md:col-span-4 mt-8 mb-4 flex items-end justify-between border-b border-neutral-800 pb-4">
            <h2 className="text-3xl font-bold text-white">Selected Works</h2>
            <div className="text-sm text-neutral-500 font-mono">2023 — Present</div>
        </div>

        {/* 6. Project Cards */}
        {projects.map((project, index) => (
            <div key={index} className="col-span-1 md:col-span-2 lg:col-span-1.3 bg-neutral-900 border border-neutral-800 rounded-3xl overflow-hidden group hover:border-neutral-600 transition-all duration-300 flex flex-col">
                <div className={`h-32 ${project.color} relative overflow-hidden`}>
                    <div className="absolute inset-0 bg-black/20 group-hover:bg-transparent transition-colors"></div>
                    {/* Abstract shapes */}
                    <div className="absolute -bottom-4 -right-4 w-24 h-24 bg-white/10 rounded-full blur-xl"></div>
                    <div className="absolute top-4 left-4 px-3 py-1 bg-black/30 backdrop-blur-md rounded-full text-xs font-medium text-white border border-white/10">
                        {project.tech.split('•')[0]}
                    </div>
                </div>
                <div className="p-6 flex-1 flex flex-col">
                    <div className="flex justify-between items-start mb-2">
                        <h3 className="text-xl font-bold text-white group-hover:text-indigo-400 transition-colors">{project.title}</h3>
                        <ArrowUpRight className="w-5 h-5 text-neutral-600 group-hover:text-white transition-colors" />
                    </div>
                    <p className="text-sm text-neutral-400 leading-relaxed mb-4 flex-1">
                        {project.desc}
                    </p>
                    <div className="pt-4 border-t border-neutral-800 flex items-center gap-2 text-xs text-neutral-500 font-mono">
                        <Layers className="w-3 h-3" /> {project.tech}
                    </div>
                </div>
            </div>
        ))}

        {/* 7. Education Card */}
        <div className="col-span-1 md:col-span-1 bg-neutral-100 text-neutral-900 rounded-3xl p-6 flex flex-col justify-between group hover:scale-[1.02] transition-transform duration-300">
           <div>
             <div className="w-10 h-10 bg-neutral-900 rounded-full flex items-center justify-center text-white mb-4">
                <Download className="w-5 h-5" />
             </div>
             <div className="font-bold text-lg leading-tight">MCA & BCA Graduate</div>
             <div className="text-sm text-neutral-600 mt-2">Master's in Computer Applications</div>
           </div>
           <div className="mt-4 pt-4 border-t border-neutral-300/50 text-xs font-medium uppercase tracking-wide">
             2020 — Present
           </div>
        </div>

        {/* 8. Contact / Footer CTA */}
        <div className="col-span-1 md:col-span-4 bg-gradient-to-r from-indigo-900/50 to-neutral-900 border border-neutral-800 rounded-3xl p-8 md:p-12 text-center relative overflow-hidden mt-4">
             <div className="absolute inset-0 bg-[url('https://grainy-gradients.vercel.app/noise.svg')] opacity-20"></div>
             <div className="relative z-10">
                <h2 className="text-2xl md:text-3xl font-bold text-white mb-4">Ready to build something scalable?</h2>
                <p className="text-neutral-400 mb-8 max-w-lg mx-auto">
                    Currently specializing in the MERN stack and available for full-time roles or freelance collaborations.
                </p>
                <a href={`mailto:${profile.email}`} className="inline-flex items-center gap-2 px-8 py-4 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-semibold transition-all hover:-translate-y-1 shadow-lg shadow-indigo-900/50">
                    <Coffee className="w-5 h-5" /> Start a Conversation
                </a>
             </div>
        </div>

      </div>
    </div>
  );
};

export default Portfolio;