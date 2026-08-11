"use client";

import { useEffect, useMemo, useState } from "react";
import { emptyJournalDraft, JournalDraft, JournalEntry, journalRepository } from "@/lib/journal";

type Filter = "all" | "published" | "drafts";
const Plus = () => <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" /></svg>;
const Book = () => <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M4 4.5A2.5 2.5 0 0 1 6.5 2H20v17H6.5A2.5 2.5 0 0 0 4 21.5z"/><path d="M4 4.5v17M8 7h8M8 11h6"/></svg>;
const draftOf = (entry: JournalEntry): JournalDraft => ({ title: entry.title, body: entry.body, date: entry.date, category: entry.category, happiness: entry.happiness, energy: entry.energy, stress: entry.stress, draft: entry.draft });

function Rating({ label, value, onChange, tone }: { label: string; value: number; onChange: (value: number) => void; tone: string }) {
  return <fieldset className="journal-rating"><legend>{label}</legend><div>{[1,2,3,4,5].map((score) => <button key={score} type="button" className={score === value ? `active ${tone}` : ""} onClick={() => onChange(score)} aria-label={`${label}: ${score} of 5`} aria-pressed={score === value}>{score}</button>)}</div></fieldset>;
}

export function JournalWorkspace({ onStatus }: { onStatus: (message: string) => void }) {
  const [entries, setEntries] = useState<JournalEntry[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<JournalDraft>(emptyJournalDraft);
  useEffect(() => setEntries(journalRepository.load()), []);

  const published = entries.filter((entry) => !entry.draft);
  const average = (key: "happiness" | "energy" | "stress") => published.length ? (published.reduce((sum, entry) => sum + entry[key], 0) / published.length).toFixed(1) : "—";
  const categories = Array.from(new Set(entries.map((entry) => entry.category))).sort();
  const visible = useMemo(() => entries.filter((entry) => {
    if (filter === "published" && entry.draft) return false;
    if (filter === "drafts" && !entry.draft) return false;
    const needle = query.trim().toLowerCase();
    return !needle || [entry.title, entry.body, entry.category].some((value) => value.toLowerCase().includes(needle));
  }).sort((a, b) => b.date.localeCompare(a.date) || b.updatedAt.localeCompare(a.updatedAt)), [entries, filter, query]);

  const commit = (next: JournalEntry[], message: string) => { setEntries(next); journalRepository.save(next); onStatus(message); };
  const open = (entry?: JournalEntry) => { setEditing(entry?.id || null); setDraft(entry ? draftOf(entry) : emptyJournalDraft()); setEditor(true); };
  const save = (event: { preventDefault(): void }, asDraft = false) => {
    event.preventDefault();
    const title = draft.title.trim(), body = draft.body.trim();
    if (!title || (!asDraft && !body)) { onStatus(asDraft ? "Add a title before saving this draft." : "Add a title and journal text before publishing."); return; }
    const now = new Date().toISOString();
    const clean = { ...draft, title, body, category: draft.category.trim() || "Reflection", draft: asDraft };
    const next = editing ? entries.map((entry) => entry.id === editing ? { ...entry, ...clean, updatedAt: now } : entry) : [...entries, { ...clean, id: crypto.randomUUID(), createdAt: now, updatedAt: now }];
    commit(next, asDraft ? "Journal draft saved." : editing ? "Journal entry updated." : "Journal entry published.");
    setEditor(false);
  };
  const remove = () => { if (!editing) return; commit(entries.filter((entry) => entry.id !== editing), "Journal entry deleted."); setEditor(false); };

  return <section className="journal-workspace">
    <div className="journal-overview"><div className="journal-intro"><span>Private reflection</span><strong>{published.length} entries</strong><small>Your journal stays inside the same encrypted workspace boundary.</small></div><div><span>Happiness</span><strong className="happiness">{average("happiness")}</strong><small>Average out of 5</small></div><div><span>Energy</span><strong className="energy">{average("energy")}</strong><small>Average out of 5</small></div><div><span>Stress</span><strong className="stress">{average("stress")}</strong><small>Average out of 5</small></div></div>
    <div className="journal-toolbar"><div className="journal-filters">{(["all", "published", "drafts"] as Filter[]).map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value[0].toUpperCase() + value.slice(1)}</button>)}</div><label className="journal-search"><span className="sr-only">Search journal</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search your journal" /></label><button className="primary-button compact" onClick={() => open()}><Plus /> New entry</button></div>
    <div className={editor ? "journal-layout with-editor" : "journal-layout"}><div className="journal-list">
      {visible.length === 0 ? <div className="journal-empty"><Book /><h2>No entries found</h2><p>Change the filter or begin a new reflection.</p><button className="secondary-button" onClick={() => open()}>Write an entry</button></div> : visible.map((entry) => <button className="journal-entry" key={entry.id} onClick={() => open(entry)}><time dateTime={entry.date}><strong>{new Date(entry.date + "T12:00:00").toLocaleDateString(undefined, { day: "2-digit" })}</strong><span>{new Date(entry.date + "T12:00:00").toLocaleDateString(undefined, { month: "short" })}</span></time><span className="journal-entry-copy"><span><strong>{entry.title}</strong>{entry.draft && <i>Draft</i>}</span><p>{entry.body || "This draft is waiting for your words."}</p><small>{entry.category} · Happiness {entry.happiness}/5 · Energy {entry.energy}/5 · Stress {entry.stress}/5</small></span></button>)}
    </div>{editor && <aside className="journal-editor"><div className="editor-heading"><div><span>{editing ? "Editing entry" : "New journal entry"}</span><h2>{editing ? "Continue your reflection" : "Make space to notice"}</h2></div><button className="editor-close" onClick={() => setEditor(false)}>Close</button></div><form onSubmit={(event) => save(event, false)}>
      <label className="field"><span>Title</span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="Give this moment a name" autoFocus /></label>
      <div className="editor-grid"><label className="field"><span>Date</span><input type="date" value={draft.date} onChange={(event) => setDraft({ ...draft, date: event.target.value })} /></label><label className="field"><span>Category</span><input list="journal-categories" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /><datalist id="journal-categories">{categories.map((category) => <option value={category} key={category} />)}</datalist></label></div>
      <label className="field journal-body"><span>Entry</span><textarea rows={10} value={draft.body} onChange={(event) => setDraft({ ...draft, body: event.target.value })} placeholder="Write freely. What happened, and what do you want to remember?" /></label>
      <div className="wellbeing-fields"><Rating label="Happiness" value={draft.happiness} onChange={(value) => setDraft({ ...draft, happiness: value })} tone="happiness" /><Rating label="Energy" value={draft.energy} onChange={(value) => setDraft({ ...draft, energy: value })} tone="energy" /><Rating label="Stress" value={draft.stress} onChange={(value) => setDraft({ ...draft, stress: value })} tone="stress" /></div>
      <div className="editor-actions journal-actions">{editing && <button type="button" className="danger-button" onClick={remove}>Delete</button>}<span /><button type="button" className="secondary-button" onClick={(event) => save(event, true)}>Save draft</button><button className="primary-button" type="submit">Publish entry</button></div>
    </form></aside>}</div>
  </section>;
}
