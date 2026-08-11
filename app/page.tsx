"use client";

import { useEffect, useState } from "react";
import { TaskWorkspace } from "@/components/task-workspace";
import { CalendarWorkspace } from "@/components/calendar-workspace";
import { FinanceWorkspace } from "@/components/finance-workspace";
import { DocumentWorkspace } from "@/components/document-workspace";
import { JournalWorkspace } from "@/components/journal-workspace";
import { PeopleWorkspace } from "@/components/people-workspace";
import { SettingsWorkspace } from "@/components/secure-settings-workspace";
import { DashboardWorkspace } from "@/components/dashboard-workspace";
import { AuthScreen } from "@/components/auth-screen";
import { VaultGate } from "@/components/vault-gate";
import { VaultSync } from "@/components/vault-sync";
import { ReminderCenter } from "@/components/reminder-center";
import type { CloudVaultKey } from "@/lib/cloud-vault";

type IconName =
  | "home" | "task" | "calendar" | "finance" | "document" | "journal"
  | "people" | "settings" | "search" | "bell" | "sun" | "moon"
  | "plus" | "arrow" | "lock" | "eye" | "eyeOff" | "check" | "clock" | "more";

const paths: Record<IconName, React.ReactNode> = {
  home: <><path d="M3 11.5 12 4l9 7.5"/><path d="M5.5 10v10h13V10"/><path d="M9 20v-6h6v6"/></>,
  task: <><path d="M9 6h11M9 12h11M9 18h11"/><path d="m3.5 6 1.2 1.2L7 4.8M3.5 12l1.2 1.2L7 10.8M3.5 18l1.2 1.2L7 16.8"/></>,
  calendar: <><rect x="3" y="5" width="18" height="16" rx="2"/><path d="M8 3v4M16 3v4M3 10h18"/></>,
  finance: <><path d="M4 19V9M10 19V5M16 19v-7M22 19H2"/></>,
  document: <><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></>,
  journal: <><path d="M5 3h14v18H5zM9 3v18M12 8h4M12 12h4"/></>,
  people: <><circle cx="9" cy="8" r="3"/><circle cx="17" cy="9" r="2.5"/><path d="M3 20c.5-4 2.5-6 6-6s5.5 2 6 6M14 15c3.8-.5 6 1.2 6.5 5"/></>,
  settings: <><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.7 1.7 0 0 0 .3 1.9l.1.1-2.8 2.8-.1-.1a1.7 1.7 0 0 0-1.9-.3 1.7 1.7 0 0 0-1 1.6v.2h-4V21a1.7 1.7 0 0 0-1-1.6 1.7 1.7 0 0 0-1.9.3l-.1.1L4.2 17l.1-.1a1.7 1.7 0 0 0 .3-1.9A1.7 1.7 0 0 0 3 14H2.8v-4H3a1.7 1.7 0 0 0 1.6-1 1.7 1.7 0 0 0-.3-1.9L4.2 7 7 4.2l.1.1A1.7 1.7 0 0 0 9 4.6 1.7 1.7 0 0 0 10 3V2.8h4V3a1.7 1.7 0 0 0 1 1.6 1.7 1.7 0 0 0 1.9-.3l.1-.1L19.8 7l-.1.1a1.7 1.7 0 0 0-.3 1.9 1.7 1.7 0 0 0 1.6 1h.2v4H21a1.7 1.7 0 0 0-1.6 1Z"/></>,
  search: <><circle cx="11" cy="11" r="7"/><path d="m20 20-4-4"/></>,
  bell: <><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></>,
  sun: <><circle cx="12" cy="12" r="4"/><path d="M12 2v2M12 20v2M4.9 4.9l1.4 1.4M17.7 17.7l1.4 1.4M2 12h2M20 12h2M4.9 19.1l1.4-1.4M17.7 6.3l1.4-1.4"/></>,
  moon: <path d="M20 15.2A8.5 8.5 0 0 1 8.8 4 8.5 8.5 0 1 0 20 15.2Z"/>,
  plus: <path d="M12 5v14M5 12h14"/>,
  arrow: <><path d="M5 12h14M14 7l5 5-5 5"/></>,
  lock: <><rect x="5" y="10" width="14" height="11" rx="2"/><path d="M8 10V7a4 4 0 0 1 8 0v3"/></>,
  eye: <><path d="M2.5 12s3.5-6 9.5-6 9.5 6 9.5 6-3.5 6-9.5 6-9.5-6-9.5-6Z"/><circle cx="12" cy="12" r="2.5"/></>,
  eyeOff: <><path d="m3 3 18 18M10.7 6.2A9.8 9.8 0 0 1 12 6c6 0 9.5 6 9.5 6a16 16 0 0 1-2.1 2.7M6.2 6.2C3.8 8 2.5 12 2.5 12s3.5 6 9.5 6c1 0 2-.2 2.8-.5M9.9 9.9a3 3 0 0 0 4.2 4.2"/></>,
  check: <path d="m5 12 4 4L19 6"/>,
  clock: <><circle cx="12" cy="12" r="9"/><path d="M12 7v5l3 2"/></>,
  more: <><circle cx="5" cy="12" r="1"/><circle cx="12" cy="12" r="1"/><circle cx="19" cy="12" r="1"/></>,
};

function Icon({ name, size = 20 }: { name: IconName; size?: number }) {
  return <svg aria-hidden="true" viewBox="0 0 24 24" width={size} height={size} fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">{paths[name]}</svg>;
}

const navItems: Array<{ label: string; icon: IconName }> = [
  { label: "Dashboard", icon: "home" },
  { label: "Tasks", icon: "task" },
  { label: "Calendar", icon: "calendar" },
  { label: "Finance", icon: "finance" },
  { label: "Documents", icon: "document" },
  { label: "Journal", icon: "journal" },
  { label: "People", icon: "people" },
];

const schedule = [
  { time: "09:30", title: "Weekly family planning", meta: "Kitchen table · 30 min", tone: "teal" },
  { time: "12:00", title: "Submit insurance documents", meta: "Due today · Documents", tone: "blue" },
  { time: "16:30", title: "Pick up Mila", meta: "School · Shared", tone: "violet" },
];

const initialTasks = [
  { id: 1, text: "Review August household budget", meta: "Finance", done: false },
  { id: 2, text: "Book annual health check", meta: "Personal", done: false },
  { id: 3, text: "Water balcony plants", meta: "Home", done: true },
  { id: 4, text: "Prepare documents for Friday", meta: "2 of 4 subtasks", done: false },
];

function BrandMark() {
  return <span className="brand-mark" aria-hidden="true">K</span>;
}

export default function Home() {
  const [theme, setTheme] = useState<"light" | "dark">("light");
  const [signedIn, setSignedIn] = useState(false);
  const [cloudSession, setCloudSession] = useState(false);
  const [vaultSession, setVaultSession] = useState<{ key: CloudVaultKey; revision: number } | null>(null);
  const [syncStatus, setSyncStatus] = useState<"synced" | "syncing" | "conflict" | "offline">("synced");
  const [showPassword, setShowPassword] = useState(false);
  const [active, setActive] = useState("Dashboard");
  const [tasks, setTasks] = useState(initialTasks);
  const [toast, setToast] = useState("");

  useEffect(() => {
    const stored = window.localStorage.getItem("kirpinova-theme");
    const next = stored === "dark" || stored === "light" ? stored : window.matchMedia("(prefers-color-scheme: dark)").matches ? "dark" : "light";
    setTheme(next);
    document.documentElement.dataset.theme = next;
  }, []);


  useEffect(() => {
    fetch("/api/auth/session", { cache: "no-store" })
      .then((response) => response.json())
      .then((value) => { if (value.authenticated) { setCloudSession(true); setSignedIn(true); } })
      .catch(() => undefined);
  }, []);
  useEffect(() => {
    const receive = (event: Event) => setSyncStatus((event as CustomEvent).detail);
    window.addEventListener("kirpinova:sync-status", receive);
    return () => window.removeEventListener("kirpinova:sync-status", receive);
  }, []);
  function toggleTheme() {
    changeTheme(theme === "light" ? "dark" : "light");
  }

  function changeTheme(next: "light" | "dark") {
    setTheme(next);
    document.documentElement.dataset.theme = next;
    window.localStorage.setItem("kirpinova-theme", next);
    window.dispatchEvent(new Event("kirpinova:data-changed"));
  }

  async function signOut() {
    await fetch("/api/auth/logout", { method: "POST" }).catch(() => undefined);
    setVaultSession(null);
    setCloudSession(false);
    setSignedIn(false);
  }

  function announce(message: string) {
    setToast(message);
    window.setTimeout(() => setToast(""), 2800);
  }

  if (!signedIn) return <AuthScreen theme={theme} onToggleTheme={toggleTheme} onAuthenticated={() => { setCloudSession(true); setSignedIn(true); }} onPreview={() => { setCloudSession(false); setSignedIn(true); }} />;
  if (cloudSession && !vaultSession) return <VaultGate onUnlocked={(key, revision) => setVaultSession({ key, revision })} onSignOut={signOut} />;

  return (
    <div className="app-shell">
      {vaultSession && <VaultSync vaultKey={vaultSession.key} initialRevision={vaultSession.revision} />}
      <aside className="sidebar">
        <div className="brand-lockup"><BrandMark /><span>KirpiNova</span></div>
        <nav aria-label="Primary navigation">
          {navItems.map((item) => <button key={item.label} className={active === item.label ? "nav-item active" : "nav-item"} onClick={() => setActive(item.label)}><Icon name={item.icon} /><span>{item.label}</span></button>)}
        </nav>
        <div className="sidebar-bottom">
          <button className="nav-item" onClick={() => setActive("Settings")}><Icon name="settings" /><span>Settings</span></button>
          <div className="profile-chip"><span className="avatar">YL</span><span><strong>Yunus</strong><small>Personal workspace</small></span><button aria-label="Sign out" title="Sign out" onClick={signOut}><Icon name="lock" size={18} /></button></div>
        </div>
      </aside>

      <main className="workspace">
        <header className="topbar">
          <div className="mobile-brand"><BrandMark /><span>KirpiNova</span></div>
          <label className="search-field"><Icon name="search" size={18} /><span className="sr-only">Search KirpiNova</span><input placeholder="Search your workspace" /></label>
          <div className="top-actions">
            <span className={`sync-state ${syncStatus}`}><i /> {cloudSession ? syncStatus === "syncing" ? "Encrypting changes…" : syncStatus === "conflict" ? "Sync needs attention" : syncStatus === "offline" ? "Saved locally · offline" : "Encrypted & synced" : "Local preview"}</span>
            <ReminderCenter onNavigate={setActive} />
            <button className="icon-button" onClick={toggleTheme} aria-label={theme === "light" ? "Use dark theme" : "Use light theme"}><Icon name={theme === "light" ? "moon" : "sun"} /></button>
          </div>
        </header>

        <div className="page">
          <header className="page-heading">
            <div><p>Monday, 10 August</p><h1>{active === "Dashboard" ? "Good morning, Yunus." : active}</h1><span>{active === "Dashboard" ? "Here is what deserves your attention today." : "This area will be migrated in a later milestone."}</span></div>
            <button className="primary-button compact" onClick={() => announce("Quick add will connect to each migrated module.")}><Icon name="plus" /> Quick add</button>
          </header>

          {active === "Settings" ? (
            <SettingsWorkspace theme={theme} onThemeChange={changeTheme} onStatus={announce} />
          ) : active === "People" ? (
            <PeopleWorkspace onStatus={announce} />
          ) : active === "Journal" ? (
            <JournalWorkspace onStatus={announce} />
          ) : active === "Documents" ? (
            <DocumentWorkspace onStatus={announce} vaultKey={vaultSession?.key} />
          ) : active === "Finance" ? (
            <FinanceWorkspace onStatus={announce} />
          ) : active === "Calendar" ? (
            <CalendarWorkspace onStatus={announce} />
          ) : active === "Tasks" ? (
            <TaskWorkspace onStatus={announce} />
          ) : active !== "Dashboard" ? (
            <section className="placeholder-view">
              <Icon name={navItems.find((item) => item.label === active)?.icon || "settings"} size={30} />
              <h2>{active} is ready for migration</h2>
              <p>The responsive shell, navigation, themes, and shared component language are established. Existing {active.toLowerCase()} behavior will be ported in its dedicated milestone.</p>
              <button className="secondary-button" onClick={() => setActive("Dashboard")}>Return to dashboard</button>
            </section>
          ) : (
            <DashboardWorkspace onNavigate={setActive} onStatus={announce} />
          )}
        </div>
      </main>

      <nav className="mobile-nav" aria-label="Mobile navigation">
        {navItems.slice(0, 4).map((item) => <button key={item.label} className={active === item.label ? "active" : ""} onClick={() => setActive(item.label)}><Icon name={item.icon} /><span>{item.label}</span></button>)}
        <button onClick={() => setActive("Settings")}><Icon name="settings" /><span>More</span></button>
      </nav>
      <div className={toast ? "toast visible" : "toast"} role="status">{toast}</div>
    </div>
  );
}
