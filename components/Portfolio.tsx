"use client";

import { useCallback, useEffect, useMemo, useState, useSyncExternalStore } from "react";
import type { Achievement, Experience, Project, SiteData } from "@/lib/types";
import {
  getUnlockedServerSnapshot,
  getUnlockedSnapshot,
  resealAllIds,
  subscribeUnlocked,
  unlockAllIds,
  unlockId,
} from "@/lib/unlocked";
import { isCollection } from "@/lib/tiers";
import Masthead from "./Masthead";
import Hero from "./Hero";
import Achievements from "./Achievements";
import ExperienceSection from "./Experience";
import Connect from "./Connect";
import ConceptStrip from "./ConceptStrip";
import ProjectsSection from "./ProjectsSection";
import Footer from "./Footer";
import dynamic from "next/dynamic";
import type { AdminPanelState } from "./AdminPanel";

// The admin panel only ever mounts after an admin signs in and opens a
// form, so it stays out of the first-load bundle for every visitor.
const AdminPanel = dynamic(() => import("./AdminPanel"), { ssr: false });

export default function Portfolio({
  initialData,
  openLogin = false,
}: {
  initialData: SiteData;
  /** Open the sign-in dialog on mount — used only by the secret /nazar route. */
  openLogin?: boolean;
}) {
  const [data, setData] = useState<SiteData>(initialData);
  const unlockedList = useSyncExternalStore(
    subscribeUnlocked,
    getUnlockedSnapshot,
    getUnlockedServerSnapshot,
  );
  const unlocked = useMemo(() => new Set(unlockedList), [unlockedList]);
  const [swingKey, setSwingKey] = useState(0);
  const [admin, setAdmin] = useState(false);
  const [storage, setStorage] = useState<"file" | "github">("file");
  const [showLogin, setShowLogin] = useState(openLogin);
  const [passcode, setPasscode] = useState("");
  const [loginError, setLoginError] = useState<string | null>(null);
  const [loginBusy, setLoginBusy] = useState(false);
  const [panel, setPanel] = useState<AdminPanelState | null>(null);

  useEffect(() => {
    fetch("/api/admin/session")
      .then((r) => r.json())
      .then((s: { admin?: boolean; storage?: "file" | "github" }) => {
        setAdmin(Boolean(s.admin));
        if (s.admin) setShowLogin(false);
        if (s.storage) setStorage(s.storage);
      })
      .catch(() => undefined);
  }, []);

  const refreshData = useCallback(() => {
    fetch("/api/data")
      .then((r) => r.json())
      .then((d: SiteData) => setData(d))
      .catch(() => undefined);
  }, []);

  const unlock = useCallback((id: string) => {
    unlockId(id);
    setSwingKey((k) => k + 1);
  }, []);

  const unlockAll = useCallback(() => {
    // Collection only — featured projects are never sealed,
    // so there is nothing to lift for them.
    unlockAllIds(data.projects.filter(isCollection).map((p) => p.id));
    setSwingKey((k) => k + 1);
  }, [data.projects]);

  const resealAll = useCallback(() => resealAllIds(), []);

  const stats = useMemo(() => {
    const live = data.projects.filter((p) => p.liveDemo).length;
    const topStars = data.projects.reduce((m, p) => Math.max(m, p.stars), 0);
    return [
      { label: "Projects", value: String(data.projects.length) },
      { label: "Live demos", value: String(live) },
      { label: "Honours", value: String(data.achievements.length) },
      { label: "Top repo stars", value: `★ ${topStars}` },
    ];
  }, [data]);

  const login = async () => {
    setLoginBusy(true);
    setLoginError(null);
    try {
      const res = await fetch("/api/admin/login", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ passcode }),
      });
      if (!res.ok) {
        const body = (await res.json().catch(() => null)) as { error?: string } | null;
        throw new Error(body?.error || "Sign-in failed.");
      }
      setAdmin(true);
      setShowLogin(false);
      setPasscode("");
    } catch (e) {
      setLoginError(e instanceof Error ? e.message : "Sign-in failed.");
    } finally {
      setLoginBusy(false);
    }
  };

  const signOut = async () => {
    await fetch("/api/admin/logout", { method: "POST" }).catch(() => undefined);
    setAdmin(false);
    setPanel(null);
  };

  const removeProject = async (project: Project) => {
    if (!window.confirm(`Remove “${project.name}” from the portfolio?`)) return;
    await fetch(`/api/admin/projects/${project.id}`, { method: "DELETE" });
    refreshData();
  };

  const removeAchievement = async (achievement: Achievement) => {
    if (!window.confirm(`Remove “${achievement.title} — ${achievement.event}”?`)) return;
    await fetch(`/api/admin/achievements/${achievement.id}`, { method: "DELETE" });
    refreshData();
  };

  const removeExperience = async (entry: Experience) => {
    if (!window.confirm(`Remove “${entry.role} — ${entry.company}”?`)) return;
    await fetch(`/api/admin/experience/${entry.id}`, { method: "DELETE" });
    refreshData();
  };

  const onSaved = useCallback(() => {
    setPanel(null);
    refreshData();
  }, [refreshData]);

  return (
    <div id="top" className="flex min-h-screen flex-col">
      <Masthead
        name={data.profile.name}
        admin={admin}
        onSignOut={signOut}
      />
      <main className="flex-1">
        <Hero
          profile={data.profile}
          stats={stats}
          swingKey={swingKey}
          admin={admin}
          onEditProfile={() => setPanel({ kind: "profile" })}
        />
        <ConceptStrip />
        <ProjectsSection
          projects={data.projects}
          unlocked={unlocked}
          onUnlock={unlock}
          onUnlockAll={unlockAll}
          onResealAll={resealAll}
          admin={admin}
          onEditProject={(p) => setPanel({ kind: "project", project: p })}
          onRemoveProject={removeProject}
          onAddProject={() => setPanel({ kind: "project", project: null })}
        />
        <ExperienceSection
          experience={data.experience}
          admin={admin}
          onAdd={() => setPanel({ kind: "experience", experience: null })}
          onEdit={(e) => setPanel({ kind: "experience", experience: e })}
          onRemove={removeExperience}
        />
        <Achievements
          achievements={data.achievements}
          admin={admin}
          onAdd={() => setPanel({ kind: "achievement", achievement: null })}
          onEdit={(a) => setPanel({ kind: "achievement", achievement: a })}
          onRemove={removeAchievement}
        />
        <Connect profile={data.profile} />
      </main>
      <Footer github={data.profile.github} />

      {/* Admin sign-in dialog */}
      {showLogin && (
        <div className="fixed inset-0 z-50 flex items-center justify-center px-4" role="dialog" aria-modal="true" aria-label="Admin sign-in">
          <button
            type="button"
            aria-label="Close sign-in"
            onClick={() => setShowLogin(false)}
            className="absolute inset-0 bg-ink/40"
          />
          <form
            className="relative w-full max-w-sm border border-hairline bg-paper p-6 shadow-xl"
            onSubmit={(e) => {
              e.preventDefault();
              void login();
            }}
          >
            <h2 className="font-display text-xl font-semibold">Admin sign-in</h2>
            <p className="mt-1 text-sm text-muted">
              Enter the admin passcode to add, edit and remove content.
            </p>
            <label className="mt-4 block">
              <span className="mb-1 block font-mono text-[11px] uppercase tracking-[0.18em] text-muted">
                Passcode
              </span>
              <input
                type="password"
                autoFocus
                value={passcode}
                onChange={(e) => setPasscode(e.target.value)}
                className="w-full border border-hairline bg-white px-3 py-2 text-sm outline-none focus:border-accent"
              />
            </label>
            {loginError && <p className="mt-3 text-sm text-red-800">{loginError}</p>}
            <div className="mt-5 flex gap-3">
              <button
                type="submit"
                disabled={loginBusy}
                className="border border-ink bg-ink px-4 py-2 text-sm font-medium text-paper disabled:opacity-60"
              >
                {loginBusy ? "Signing in…" : "Sign in"}
              </button>
              <button
                type="button"
                onClick={() => setShowLogin(false)}
                className="border border-hairline bg-white px-4 py-2 text-sm"
              >
                Cancel
              </button>
            </div>
          </form>
        </div>
      )}

      {panel && (
        <AdminPanel
          panel={panel}
          profile={data.profile}
          storage={storage}
          onClose={() => setPanel(null)}
          onSaved={onSaved}
        />
      )}
    </div>
  );
}
