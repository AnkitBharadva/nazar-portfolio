"use client";

import { useState } from "react";
import type { Achievement, Experience, Profile, Project, ProjectMetric } from "@/lib/types";

export type AdminPanelState =
  | { kind: "profile" }
  | { kind: "project"; project: Project | null }
  | { kind: "achievement"; achievement: Achievement | null }
  | { kind: "experience"; experience: Experience | null };

const METRIC_SOURCES: ProjectMetric["source"][] = [
  "per README",
  "verified in repo",
  "repo docs",
];

function Field({
  label,
  children,
  hint,
}: {
  label: string;
  children: React.ReactNode;
  hint?: string;
}) {
  return (
    <label className="block">
      <span className="mb-1 block font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
        {label}
      </span>
      {children}
      {hint && <span className="mt-1 block text-xs text-muted">{hint}</span>}
    </label>
  );
}

const inputCls =
  "w-full border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-accent";

function Check({
  label,
  checked,
  onChange,
}: {
  label: string;
  checked: boolean;
  onChange: (v: boolean) => void;
}) {
  return (
    <label className="flex cursor-pointer items-center gap-2 text-sm text-ink-soft">
      <input
        type="checkbox"
        checked={checked}
        onChange={(e) => onChange(e.target.checked)}
        className="h-4 w-4 accent-[#1e40af]"
      />
      {label}
    </label>
  );
}

async function api(path: string, method: string, body?: unknown): Promise<void> {
  const res = await fetch(path, {
    method,
    headers: body !== undefined ? { "Content-Type": "application/json" } : undefined,
    body: body !== undefined ? JSON.stringify(body) : undefined,
  });
  if (!res.ok) {
    const data = (await res.json().catch(() => null)) as { error?: string } | null;
    throw new Error(data?.error || `Request failed (${res.status}).`);
  }
}

/* ---------------- Profile form ---------------- */

function ProfileForm({
  profile,
  onSaved,
}: {
  profile: Profile;
  onSaved: () => void;
}) {
  const [name, setName] = useState(profile.name);
  const [fullName, setFullName] = useState(profile.fullName);
  const [bio, setBio] = useState(profile.bio);
  const [interests, setInterests] = useState(profile.interests.join(", "));
  const [github, setGithub] = useState(profile.github);
  // Contact fields may be absent in profile data written before they
  // existed (e.g. an older GitHub-mode copy) — default to empty.
  const [email, setEmail] = useState(profile.email ?? "");
  const [phone, setPhone] = useState(profile.phone ?? "");
  const [kaggle, setKaggle] = useState(profile.kaggle ?? "");
  const [huggingface, setHuggingface] = useState(profile.huggingface ?? "");
  const [linkedin, setLinkedin] = useState(profile.linkedin ?? "");
  const [resumeUrl, setResumeUrl] = useState(profile.resumeUrl ?? "");
  const [resumeName, setResumeName] = useState(profile.resumeName ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const uploadResume = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; name?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed.");
      setResumeUrl(data.url);
      setResumeName(data.name ?? file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      await api("/api/admin/profile", "PUT", {
        name,
        fullName,
        bio,
        interests: interests.split(",").map((s) => s.trim()).filter(Boolean),
        github,
        email,
        phone,
        kaggle,
        huggingface,
        linkedin,
        resumeUrl: resumeUrl || null,
        resumeName: resumeName || null,
      });
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label="Display name">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Full name">
        <input className={inputCls} value={fullName} onChange={(e) => setFullName(e.target.value)} />
      </Field>
      <Field label="Bio" hint="Keep it additive: do not restate the interest list.">
        <textarea className={inputCls} rows={4} value={bio} onChange={(e) => setBio(e.target.value)} />
      </Field>
      <Field label="Interests" hint="Comma-separated.">
        <input className={inputCls} value={interests} onChange={(e) => setInterests(e.target.value)} />
      </Field>
      <Field label="GitHub URL">
        <input className={inputCls} value={github} onChange={(e) => setGithub(e.target.value)} />
      </Field>
      <Field label="Email">
        <input
          type="email"
          className={inputCls}
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
      </Field>
      <Field label="Phone">
        <input className={inputCls} value={phone} onChange={(e) => setPhone(e.target.value)} />
      </Field>
      <Field label="Kaggle URL">
        <input className={inputCls} value={kaggle} onChange={(e) => setKaggle(e.target.value)} />
      </Field>
      <Field label="Hugging Face URL">
        <input className={inputCls} value={huggingface} onChange={(e) => setHuggingface(e.target.value)} />
      </Field>
      <Field label="LinkedIn URL">
        <input className={inputCls} value={linkedin} onChange={(e) => setLinkedin(e.target.value)} />
      </Field>
      <Field
        label="Custom resume PDF (optional)"
        hint="When set, the Resume / Download resume buttons link straight to this file instead of the generated /resume page. PDF only, max 10 MB. Leave empty to use the generated page."
      >
        {resumeUrl ? (
          <div className="flex items-center gap-3 border border-hairline bg-white px-3 py-2">
            <a
              href={resumeUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 truncate font-mono text-xs text-accent underline underline-offset-2"
            >
              {resumeName || resumeUrl}
            </a>
            <button
              type="button"
              onClick={() => {
                setResumeUrl("");
                setResumeName("");
              }}
              className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-red-800 underline underline-offset-2"
            >
              Remove
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept=".pdf"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void uploadResume(file);
            }}
            className="w-full border border-hairline bg-white px-3 py-2 text-sm"
          />
        )}
        {uploading && <span className="mt-1 block text-xs text-muted">Uploading…</span>}
      </Field>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
      >
        {saving ? "Saving…" : "Save profile"}
      </button>
    </div>
  );
}

/* ---------------- Project form ---------------- */

function ProjectForm({
  project,
  onSaved,
}: {
  project: Project | null;
  onSaved: () => void;
}) {
  const [name, setName] = useState(project?.name ?? "");
  const [displayTitle, setDisplayTitle] = useState(project?.displayTitle ?? "");
  const [tagline, setTagline] = useState(project?.tagline ?? "");
  const [description, setDescription] = useState(project?.description ?? "");
  const [repo, setRepo] = useState(project?.repo ?? "");
  const [liveDemo, setLiveDemo] = useState(project?.liveDemo ?? "");
  const [language, setLanguage] = useState(project?.language ?? "");
  const [updated, setUpdated] = useState(
    project?.updated ?? new Date().toISOString().slice(0, 10),
  );
  const [files, setFiles] = useState(String(project?.files ?? 0));
  const [stars, setStars] = useState(String(project?.stars ?? 0));
  const [stack, setStack] = useState((project?.stack ?? []).join(", "));
  const [metrics, setMetrics] = useState<ProjectMetric[]>(project?.metrics ?? []);
  const [fork, setFork] = useState(project?.fork ?? false);
  const [forkCredit, setForkCredit] = useState(project?.forkCredit ?? "");
  const [featured, setFeatured] = useState(project?.featured ?? false);
  const [sealed, setSealed] = useState(project?.sealed ?? false);
  const [empty, setEmpty] = useState(project?.empty ?? false);
  const [template, setTemplate] = useState(project?.template ?? false);
  const [synthetic, setSynthetic] = useState(project?.synthetic ?? false);
  const [notes, setNotes] = useState(project?.notes ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        name,
        displayTitle,
        tagline,
        description,
        repo,
        liveDemo: liveDemo || null,
        language: language || null,
        updated,
        files: Number(files) || 0,
        stars: Number(stars) || 0,
        stack: stack.split(",").map((s) => s.trim()).filter(Boolean),
        metrics,
        fork,
        forkCredit: forkCredit || null,
        featured,
        sealed,
        empty,
        template,
        synthetic,
        notes: notes || null,
      };
      if (project) {
        await api(`/api/admin/projects/${project.id}`, "PATCH", body);
      } else {
        await api("/api/admin/projects", "POST", body);
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  const updateMetric = (i: number, patch: Partial<ProjectMetric>) => {
    setMetrics((ms) => ms.map((m, j) => (j === i ? { ...m, ...patch } : m)));
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label="Repo name">
        <input className={inputCls} value={name} onChange={(e) => setName(e.target.value)} />
      </Field>
      <Field label="Display title">
        <input className={inputCls} value={displayTitle} onChange={(e) => setDisplayTitle(e.target.value)} />
      </Field>
      <Field label="Tagline">
        <input className={inputCls} value={tagline} onChange={(e) => setTagline(e.target.value)} />
      </Field>
      <Field label="Description">
        <textarea className={inputCls} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Repo URL">
          <input className={inputCls} value={repo} onChange={(e) => setRepo(e.target.value)} />
        </Field>
        <Field label="Live demo URL">
          <input className={inputCls} value={liveDemo} onChange={(e) => setLiveDemo(e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Language">
          <input className={inputCls} value={language} onChange={(e) => setLanguage(e.target.value)} />
        </Field>
        <Field label="Last updated">
          <input type="date" className={inputCls} value={updated} onChange={(e) => setUpdated(e.target.value)} />
        </Field>
      </div>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="File count">
          <input type="number" min={0} className={inputCls} value={files} onChange={(e) => setFiles(e.target.value)} />
        </Field>
        <Field label="Stars">
          <input type="number" min={0} className={inputCls} value={stars} onChange={(e) => setStars(e.target.value)} />
        </Field>
      </div>
      <Field label="Stack" hint="Comma-separated.">
        <input className={inputCls} value={stack} onChange={(e) => setStack(e.target.value)} />
      </Field>

      <fieldset className="border border-hairline p-3">
        <legend className="px-1 font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
          Metrics (each labelled with its source)
        </legend>
        <div className="flex flex-col gap-3">
          {metrics.map((m, i) => (
            <div key={i} className="flex flex-col gap-2 border-b border-dashed border-hairline pb-3 last:border-0 last:pb-0">
              <input
                className={inputCls}
                placeholder="Label, e.g. mAP@50"
                value={m.label}
                onChange={(e) => updateMetric(i, { label: e.target.value })}
              />
              <input
                className={inputCls}
                placeholder="Value, e.g. 96.5%"
                value={m.value}
                onChange={(e) => updateMetric(i, { value: e.target.value })}
              />
              <div className="flex gap-2">
                <select
                  className={inputCls}
                  value={m.source}
                  onChange={(e) =>
                    updateMetric(i, { source: e.target.value as ProjectMetric["source"] })
                  }
                >
                  {METRIC_SOURCES.map((s) => (
                    <option key={s} value={s}>
                      {s}
                    </option>
                  ))}
                </select>
                <button
                  type="button"
                  onClick={() => setMetrics((ms) => ms.filter((_, j) => j !== i))}
                  className="shrink-0 border border-hairline px-3 text-sm text-red-800"
                >
                  Remove
                </button>
              </div>
            </div>
          ))}
          <button
            type="button"
            onClick={() =>
              setMetrics((ms) => [...ms, { label: "", value: "", source: "per README" }])
            }
            className="self-start border border-hairline px-3 py-1.5 font-mono text-xs uppercase tracking-widest"
          >
            + Add metric
          </button>
        </div>
      </fieldset>

      <div className="flex flex-col gap-2 border border-hairline p-3">
        <Check label="Featured — always on show, never sealed" checked={featured} onChange={setFeatured} />
        <Check label="Fork (labelled as a fork on the card)" checked={fork} onChange={setFork} />
        <Check label="Sealed — no README in the repo" checked={sealed} onChange={setSealed} />
        <Check label="Verified empty repo" checked={empty} onChange={setEmpty} />
        <Check label="Template-based (disclosed)" checked={template} onChange={setTemplate} />
        <Check label="Built on synthetic data" checked={synthetic} onChange={setSynthetic} />
      </div>
      <Field label="Fork credit / provenance note">
        <input className={inputCls} value={forkCredit} onChange={(e) => setForkCredit(e.target.value)} />
      </Field>
      <Field label="Honesty notes (shown on the card)">
        <textarea className={inputCls} rows={2} value={notes} onChange={(e) => setNotes(e.target.value)} />
      </Field>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
      >
        {saving ? "Saving…" : project ? "Save project" : "Add project"}
      </button>
    </div>
  );
}

/* ---------------- Achievement form ---------------- */

function AchievementForm({
  achievement,
  onSaved,
}: {
  achievement: Achievement | null;
  onSaved: () => void;
}) {
  const [title, setTitle] = useState(achievement?.title ?? "");
  const [event, setEvent] = useState(achievement?.event ?? "");
  const [year, setYear] = useState(String(achievement?.year ?? new Date().getFullYear()));
  const [description, setDescription] = useState(achievement?.description ?? "");
  const [certificateUrl, setCertificateUrl] = useState(achievement?.certificateUrl ?? "");
  const [certificateName, setCertificateName] = useState(achievement?.certificateName ?? "");
  const [uploading, setUploading] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const upload = async (file: File) => {
    setUploading(true);
    setError(null);
    try {
      const form = new FormData();
      form.append("file", file);
      const res = await fetch("/api/admin/upload", { method: "POST", body: form });
      const data = (await res.json()) as { url?: string; name?: string; error?: string };
      if (!res.ok || !data.url) throw new Error(data.error || "Upload failed.");
      setCertificateUrl(data.url);
      setCertificateName(data.name ?? file.name);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Upload failed.");
    } finally {
      setUploading(false);
    }
  };

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        title,
        event,
        year: Number(year),
        description,
        certificateUrl: certificateUrl || null,
        certificateName: certificateName || null,
      };
      if (achievement) {
        await api(`/api/admin/achievements/${achievement.id}`, "PATCH", body);
      } else {
        await api("/api/admin/achievements", "POST", body);
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label="Title (e.g. Finalist)">
        <input className={inputCls} value={title} onChange={(e) => setTitle(e.target.value)} />
      </Field>
      <Field label="Event (e.g. Smart India Hackathon)">
        <input className={inputCls} value={event} onChange={(e) => setEvent(e.target.value)} />
      </Field>
      <Field label="Year">
        <input type="number" className={inputCls} value={year} onChange={(e) => setYear(e.target.value)} />
      </Field>
      <Field label="Description (optional — only what you know)">
        <textarea className={inputCls} rows={3} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      <Field label="Certificate" hint="JPG, PNG, WebP, GIF or PDF, max 10 MB. Leave empty until you have the real file.">
        {certificateUrl ? (
          <div className="flex items-center gap-3 border border-hairline bg-white px-3 py-2">
            <a
              href={certificateUrl}
              target="_blank"
              rel="noreferrer"
              className="min-w-0 flex-1 truncate font-mono text-xs text-accent underline underline-offset-2"
            >
              {certificateName || certificateUrl}
            </a>
            <button
              type="button"
              onClick={() => {
                setCertificateUrl("");
                setCertificateName("");
              }}
              className="shrink-0 font-mono text-[11px] uppercase tracking-widest text-red-800 underline underline-offset-2"
            >
              Remove
            </button>
          </div>
        ) : (
          <input
            type="file"
            accept=".jpg,.jpeg,.png,.webp,.gif,.pdf"
            disabled={uploading}
            onChange={(e) => {
              const file = e.target.files?.[0];
              if (file) void upload(file);
            }}
            className="w-full border border-hairline bg-white px-3 py-2 text-sm"
          />
        )}
        {uploading && <span className="mt-1 block text-xs text-muted">Uploading…</span>}
      </Field>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
      >
        {saving ? "Saving…" : achievement ? "Save achievement" : "Add achievement"}
      </button>
    </div>
  );
}

/* ---------------- Experience form ---------------- */

function ExperienceForm({
  experience,
  onSaved,
}: {
  experience: Experience | null;
  onSaved: () => void;
}) {
  const [company, setCompany] = useState(experience?.company ?? "");
  const [companyUrl, setCompanyUrl] = useState(experience?.companyUrl ?? "");
  const [role, setRole] = useState(experience?.role ?? "");
  const [location, setLocation] = useState(experience?.location ?? "");
  const [period, setPeriod] = useState(experience?.period ?? "");
  const [duration, setDuration] = useState(experience?.duration ?? "");
  const [description, setDescription] = useState(experience?.description ?? "");
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const save = async () => {
    setSaving(true);
    setError(null);
    try {
      const body = {
        company,
        companyUrl: companyUrl || "",
        role,
        location,
        period,
        duration,
        description,
      };
      if (experience) {
        await api(`/api/admin/experience/${experience.id}`, "PATCH", body);
      } else {
        await api("/api/admin/experience", "POST", body);
      }
      onSaved();
    } catch (e) {
      setError(e instanceof Error ? e.message : "Could not save.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <Field label="Company">
        <input className={inputCls} value={company} onChange={(e) => setCompany(e.target.value)} />
      </Field>
      <Field label="Company URL">
        <input className={inputCls} value={companyUrl} onChange={(e) => setCompanyUrl(e.target.value)} />
      </Field>
      <Field label="Role (e.g. Software Engineer Intern)">
        <input className={inputCls} value={role} onChange={(e) => setRole(e.target.value)} />
      </Field>
      <Field label="Location (e.g. Ahmedabad, Gujarat, India)">
        <input className={inputCls} value={location} onChange={(e) => setLocation(e.target.value)} />
      </Field>
      <div className="grid grid-cols-1 gap-3 sm:grid-cols-2">
        <Field label="Period (e.g. September 2026)">
          <input className={inputCls} value={period} onChange={(e) => setPeriod(e.target.value)} />
        </Field>
        <Field label="Duration (e.g. 1 month)">
          <input className={inputCls} value={duration} onChange={(e) => setDuration(e.target.value)} />
        </Field>
      </div>
      <Field label="Description (only what you actually did)">
        <textarea className={inputCls} rows={5} value={description} onChange={(e) => setDescription(e.target.value)} />
      </Field>
      {error && <p className="text-sm text-red-800">{error}</p>}
      <button
        type="button"
        onClick={save}
        disabled={saving}
        className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
      >
        {saving ? "Saving…" : experience ? "Save experience" : "Add experience"}
      </button>
    </div>
  );
}

/* ---------------- Panel shell ---------------- */

export default function AdminPanel({
  panel,
  profile,
  storage,
  onClose,
  onSaved,
}: {
  panel: AdminPanelState;
  profile: Profile;
  storage: "file" | "github";
  onClose: () => void;
  onSaved: () => void;
}) {
  const title =
    panel.kind === "profile"
      ? "Edit about"
      : panel.kind === "project"
        ? panel.project
          ? `Edit project — ${panel.project.name}`
          : "Add project"
        : panel.kind === "achievement"
          ? panel.achievement
            ? `Edit achievement — ${panel.achievement.event}`
            : "Add achievement"
          : panel.experience
            ? `Edit experience — ${panel.experience.company}`
            : "Add experience";

  const key =
    panel.kind === "profile"
      ? "profile"
      : panel.kind === "project"
        ? `project-${panel.project?.id ?? "new"}`
        : panel.kind === "achievement"
          ? `achievement-${panel.achievement?.id ?? "new"}`
          : `experience-${panel.experience?.id ?? "new"}`;

  return (
    <div className="fixed inset-0 z-50 flex justify-end" role="dialog" aria-modal="true" aria-label={title}>
      <button
        type="button"
        aria-label="Close admin panel"
        onClick={onClose}
        className="absolute inset-0 bg-ink/40"
      />
      <div className="admin-scroll relative flex h-full w-full max-w-md flex-col overflow-y-auto border-l border-hairline bg-paper shadow-xl">
        <div className="sticky top-0 z-10 border-b border-hairline bg-paper px-5 py-4">
          <div className="flex items-start justify-between gap-3">
            <h2 className="font-display text-xl font-semibold">{title}</h2>
            <button
              type="button"
              onClick={onClose}
              className="border border-hairline bg-white px-2.5 py-1 font-mono text-xs"
              aria-label="Close"
            >
              ✕
            </button>
          </div>
          <p className="mt-1 font-mono text-[11px] text-muted">
            {storage === "github"
              ? "GitHub mode — saves commit to the repo and go live after the redeploy."
              : "File mode — saves to the server's JSON files."}
          </p>
        </div>
        <div key={key} className="px-5 py-5">
          {panel.kind === "profile" && <ProfileForm profile={profile} onSaved={onSaved} />}
          {panel.kind === "project" && <ProjectForm project={panel.project} onSaved={onSaved} />}
          {panel.kind === "achievement" && (
            <AchievementForm achievement={panel.achievement} onSaved={onSaved} />
          )}
          {panel.kind === "experience" && (
            <ExperienceForm experience={panel.experience} onSaved={onSaved} />
          )}
        </div>
      </div>
    </div>
  );
}
