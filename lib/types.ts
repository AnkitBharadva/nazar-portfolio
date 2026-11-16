export interface ProjectMetric {
  label: string;
  value: string;
  /** How the number is sourced. Shown next to the metric so nothing reads as independently verified. */
  source: "per README" | "verified in repo" | "repo docs";
}

export interface Project {
  id: string;
  name: string;
  /** Distinct product name from the repo, when it has one. */
  displayTitle: string;
  tagline: string;
  description: string;
  repo: string;
  liveDemo: string | null;
  language: string | null;
  updated: string;
  files: number;
  stars: number;
  stack: string[];
  metrics: ProjectMetric[];
  fork: boolean;
  /** Credit / provenance note for forks and derived work. Null when not applicable. */
  forkCredit: string | null;
  /** True when the repo has no README — shown as sealed / "no details published". */
  sealed: boolean;
  /** True when the repo is verified empty. */
  empty: boolean;
  /** Featured projects are always on show — never sealed, on the card
      or the case study. Only a few projects should ever carry this. */
  featured: boolean;
  /** True when the work is template-based (disclosed, not presented as original design). */
  template: boolean;
  /** True when the data behind the project is synthetic (e.g. PaySim). */
  synthetic: boolean;
  /** Honesty notes, shown verbatim on the card. */
  notes: string | null;
}

export interface Profile {
  name: string;
  fullName: string;
  bio: string;
  interests: string[];
  github: string;
  photo: string;
  /** Public contact details, shown in the Connect section and on /resume. */
  email: string;
  phone: string;
  kaggle: string;
  huggingface: string;
  linkedin: string;
  /** Optional admin-uploaded custom resume PDF. When set, the download
      buttons link straight to this file instead of the generated /resume
      page. Null until the admin uploads one. */
  resumeUrl: string | null;
  resumeName: string | null;
}

export interface Achievement {
  id: string;
  title: string;
  event: string;
  year: number;
  description: string;
  certificateUrl: string | null;
  certificateName: string | null;
}

export interface Experience {
  id: string;
  company: string;
  companyUrl: string;
  role: string;
  location: string;
  period: string;
  duration: string;
  description: string;
}

export interface SiteData {
  profile: Profile;
  projects: Project[];
  achievements: Achievement[];
  experience: Experience[];
}
