"use client";

import { useEffect, useMemo, useState } from "react";
import { emptyPersonDraft, PersonDraft, PersonGroup, PersonRecord, peopleRepository } from "@/lib/people";

type Filter = "all" | PersonGroup | "favorites";
const Plus = () => <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" /></svg>;
const PersonIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" width="22" height="22" fill="none" stroke="currentColor" strokeWidth="1.7"><circle cx="12" cy="8" r="3.5"/><path d="M5 21c.5-4.7 2.9-7 7-7s6.5 2.3 7 7"/></svg>;
const Star = ({ filled = false }: { filled?: boolean }) => <svg aria-hidden="true" viewBox="0 0 24 24" width="17" height="17" fill={filled ? "currentColor" : "none"} stroke="currentColor" strokeWidth="1.7"><path d="m12 3 2.8 5.7 6.2.9-4.5 4.4 1.1 6.2-5.6-2.9-5.6 2.9 1.1-6.2L3 9.6l6.2-.9z"/></svg>;
const initials = (name: string) => name.split(/\s+/).filter(Boolean).slice(0,2).map((part) => part[0]?.toUpperCase()).join("") || "?";
const birthdayLabel = (birthday: string) => birthday ? new Date(birthday + "T12:00:00").toLocaleDateString(undefined, { month: "long", day: "numeric" }) : "Not added";
const draftOf = (person: PersonRecord): PersonDraft => ({ name: person.name, relationship: person.relationship, group: person.group, email: person.email, phone: person.phone, birthday: person.birthday, notes: person.notes, favorite: person.favorite });

export function PeopleWorkspace({ onStatus }: { onStatus: (message: string) => void }) {
  const [people, setPeople] = useState<PersonRecord[]>([]);
  const [filter, setFilter] = useState<Filter>("all");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<PersonDraft>(emptyPersonDraft);
  useEffect(() => setPeople(peopleRepository.load()), []);
  const visible = useMemo(() => people.filter((person) => {
    if (filter === "favorites" && !person.favorite) return false;
    if (filter !== "all" && filter !== "favorites" && person.group !== filter) return false;
    const needle = query.trim().toLowerCase();
    return !needle || [person.name, person.relationship, person.email, person.phone, person.notes].some((value) => value.toLowerCase().includes(needle));
  }).sort((a,b) => Number(b.favorite) - Number(a.favorite) || a.name.localeCompare(b.name)), [people, filter, query]);
  const upcomingBirthdays = people.filter((person) => person.birthday).sort((a,b) => a.birthday.slice(5).localeCompare(b.birthday.slice(5))).slice(0,3);
  const commit = (next: PersonRecord[], message: string) => { setPeople(next); peopleRepository.save(next); onStatus(message); };
  const open = (person?: PersonRecord) => { setEditing(person?.id || null); setDraft(person ? draftOf(person) : emptyPersonDraft()); setEditor(true); };
  const save = (event: { preventDefault(): void }) => { event.preventDefault(); const name = draft.name.trim(); if (!name) { onStatus("Add a name before saving this person."); return; } const now = new Date().toISOString(); const clean = { ...draft, name, relationship: draft.relationship.trim(), email: draft.email.trim(), phone: draft.phone.trim(), notes: draft.notes.trim() }; const next = editing ? people.map((person) => person.id === editing ? { ...person, ...clean, updatedAt: now } : person) : [...people, { ...clean, id: crypto.randomUUID(), createdAt: now, updatedAt: now }]; commit(next, editing ? "Person updated." : "Person added."); setEditor(false); };
  const remove = () => { if (!editing) return; commit(people.filter((person) => person.id !== editing), "Person removed."); setEditor(false); };
  const toggleFavorite = (person: PersonRecord) => commit(people.map((item) => item.id === person.id ? { ...item, favorite: !item.favorite, updatedAt: new Date().toISOString() } : item), person.favorite ? "Removed from close people." : "Added to close people.");

  return <section className="people-workspace">
    <div className="people-overview"><div><span>People</span><strong>{people.length}</strong><small>Across family, friends, and trusted contacts</small></div><div><span>Close people</span><strong>{people.filter((person) => person.favorite).length}</strong><small>Kept near the top</small></div><div className="birthday-overview"><span>Important dates</span><p>{upcomingBirthdays.length ? upcomingBirthdays.map((person) => <span key={person.id}><strong>{person.name}</strong><small>{birthdayLabel(person.birthday)}</small></span>) : <small>No birthdays added yet</small>}</p></div></div>
    <div className="people-toolbar"><div className="people-filters">{(["all", "favorites", "family", "friends", "professional", "other"] as Filter[]).map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "favorites" ? "Close people" : value[0].toUpperCase() + value.slice(1)}</button>)}</div><label className="people-search"><span className="sr-only">Search people</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search people" /></label><button className="primary-button compact" onClick={() => open()}><Plus /> Add person</button></div>
    <div className={editor ? "people-layout with-editor" : "people-layout"}><div className="people-list">
      <div className="people-list-head"><span>Person</span><span>Group</span><span>Contact</span><span className="sr-only">Favorite</span></div>
      {visible.length === 0 ? <div className="people-empty"><PersonIcon/><h2>No people found</h2><p>Change the filter or add someone important.</p><button className="secondary-button" onClick={() => open()}>Add a person</button></div> : visible.map((person) => <div className="person-row" key={person.id}><button className="person-main" onClick={() => open(person)}><span className={`person-avatar ${person.group}`}>{initials(person.name)}</span><span><strong>{person.name}</strong><small>{person.relationship || "Relationship not added"}</small></span></button><span className={`person-group ${person.group}`}>{person.group}</span><button className="person-contact" onClick={() => open(person)}><strong>{person.email || person.phone || "No contact details"}</strong><small>{person.birthday ? `Birthday · ${birthdayLabel(person.birthday)}` : "Birthday not added"}</small></button><button className={person.favorite ? "favorite-button active" : "favorite-button"} onClick={() => toggleFavorite(person)} aria-label={person.favorite ? `Remove ${person.name} from close people` : `Add ${person.name} to close people`}><Star filled={person.favorite}/></button></div>)}
    </div>{editor && <aside className="people-editor"><div className="editor-heading"><div><span>{editing ? "Editing person" : "New person"}</span><h2>{editing ? "Update their details" : "Keep someone close"}</h2></div><button className="editor-close" onClick={() => setEditor(false)}>Close</button></div><form onSubmit={save}>
      <label className="field"><span>Name</span><input value={draft.name} onChange={(event) => setDraft({ ...draft, name: event.target.value })} placeholder="Full name" autoFocus /></label>
      <div className="editor-grid"><label className="field"><span>Relationship</span><input value={draft.relationship} onChange={(event) => setDraft({ ...draft, relationship: event.target.value })} placeholder="e.g. Sister" /></label><label className="field"><span>Group</span><select value={draft.group} onChange={(event) => setDraft({ ...draft, group: event.target.value as PersonGroup })}><option value="family">Family</option><option value="friends">Friends</option><option value="professional">Professional</option><option value="other">Other</option></select></label></div>
      <label className="field"><span>Email</span><input type="email" value={draft.email} onChange={(event) => setDraft({ ...draft, email: event.target.value })} placeholder="Optional" /></label><label className="field"><span>Phone</span><input type="tel" value={draft.phone} onChange={(event) => setDraft({ ...draft, phone: event.target.value })} placeholder="Optional" /></label><label className="field"><span>Birthday</span><input type="date" value={draft.birthday} onChange={(event) => setDraft({ ...draft, birthday: event.target.value })} /></label>
      <label className="field"><span>Notes</span><textarea rows={5} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Useful context, preferences, or something worth remembering" /></label>
      <label className="close-person"><input type="checkbox" checked={draft.favorite} onChange={(event) => setDraft({ ...draft, favorite: event.target.checked })}/><Star filled={draft.favorite}/><span><strong>Keep in close people</strong><small>Shows this person first in your list.</small></span></label>
      <div className="editor-actions">{editing && <button type="button" className="danger-button" onClick={remove}>Delete</button>}<span/><button type="button" className="secondary-button" onClick={() => setEditor(false)}>Cancel</button><button type="submit" className="primary-button">{editing ? "Save changes" : "Add person"}</button></div>
    </form></aside>}</div>
  </section>;
}
