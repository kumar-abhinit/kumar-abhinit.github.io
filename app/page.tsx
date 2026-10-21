import CustomCursor from "@/components/CustomCursor";
import GridCanvas from "@/components/grid/GridCanvas";
import Hero from "@/components/Hero";
import ProfilePanel from "@/components/ProfilePanel";
import RevealOnScroll from "@/components/RevealOnScroll";
import ScrollStage from "@/components/ScrollStage";
import {
  AboutSection,
  ExperienceSection,
  ProjectsSection,
  SkillsSection,
} from "@/components/sections";

export default function Home() {
  return (
    <>
      <GridCanvas />
      <CustomCursor />
      <RevealOnScroll />
      <a href="#main" className="skip-link">
        Skip to content
      </a>
      <ScrollStage>
        <div className="frame">
          <main id="main">
            <div className="hero-pane">
              <Hero />
            </div>
            <div className="workspace">
              <ProfilePanel />
              <div className="workspace-content">
                <AboutSection />
                <ExperienceSection />
                <ProjectsSection />
                <SkillsSection />
              </div>
            </div>
          </main>
        </div>
      </ScrollStage>
    </>
  );
}
