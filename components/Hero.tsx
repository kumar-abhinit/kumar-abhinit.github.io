import { profile } from "@/content/portfolio";
import HoverInterest from "./HoverInterest";
import SocialLinks from "./SocialLinks";
import TensionText from "./TensionText";

export default function Hero() {
  const [lead, current] = profile.intro;

  return (
    <section aria-labelledby="hero-title" className="hero">
      <p className="mb-5 text-xs font-medium uppercase tracking-[0.08em] text-subtle">
        {profile.label}
      </p>
      <TensionText
        as="h1"
        id="hero-title"
        className="hero-title text-foreground"
        mode="exit"
      >
        {profile.headline}
      </TensionText>
      <TensionText as="p" className="hero-tagline mt-4" mode="exit">
        {profile.tagline}
      </TensionText>
      <div className="mt-6 space-y-4">
        <p className="hero-copy">{lead}</p>
        <p className="hero-copy">{current}</p>
        <p className="hero-copy">
          Away from the keyboard, I enjoy playing{" "}
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
          .
        </p>
      </div>
      <div className="mt-6">
        <SocialLinks links={profile.links} />
      </div>
    </section>
  );
}
