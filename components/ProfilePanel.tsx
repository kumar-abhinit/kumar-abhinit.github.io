import { navItems, profile } from "@/content/portfolio";
import ProfileBarPin from "./ProfileBarPin";
import SectionNav from "./SectionNav";
import SocialLinks from "./SocialLinks";

/** Compact profile + navigation. Sticky beside the content on wider screens. */
export default function ProfilePanel() {
  return (
    <aside aria-label="Profile" className="profile">
      <div className="profile-identity">
        <p className="text-xl font-semibold tracking-tight text-foreground">{profile.name}</p>
        <p className="mt-1 text-sm font-medium text-body">{profile.role}</p>
        <p className="profile-summary mt-4 max-w-xs text-sm leading-relaxed text-muted">
          {profile.summary}
        </p>
        <p className="mt-3 text-xs text-subtle">{profile.location}</p>
      </div>
      <ProfileBarPin />
      <div className="profile-nav py-6">
        <SectionNav items={navItems} />
      </div>
      <div className="profile-links pb-2">
        <SocialLinks links={profile.links} />
      </div>
    </aside>
  );
}
