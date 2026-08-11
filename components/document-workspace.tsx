"use client";

import { ChangeEvent, FormEvent, useEffect, useMemo, useState } from "react";
import { DocumentDraft, DocumentRecord, DocumentStatus, documentRepository, emptyDocumentDraft } from "@/lib/documents";

const today = "2026-08-10";
const Plus = () => <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14" /></svg>;
const FileIcon = () => <svg aria-hidden="true" viewBox="0 0 24 24" width="20" height="20" fill="none" stroke="currentColor" strokeWidth="1.7"><path d="M6 2h8l4 4v16H6z"/><path d="M14 2v5h5M9 12h6M9 16h6"/></svg>;

function dueLabel(item: DocumentRecord) {
  if (!item.dueDate) return { text: "No due date", tone: "neutral" };
  const days = Math.round((new Date(item.dueDate + "T12:00:00").getTime() - new Date(today + "T12:00:00").getTime()) / 86400000);
  if (item.status !== "active") return { text: new Date(item.dueDate + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }), tone: "neutral" };
  if (days < 0) return { text: `${Math.abs(days)}d overdue`, tone: "danger" };
  if (days === 0) return { text: "Due today", tone: "danger" };
  if (days <= item.reminderDays) return { text: `Due in ${days}d`, tone: "warning" };
  return { text: new Date(item.dueDate + "T12:00:00").toLocaleDateString(undefined, { month: "short", day: "numeric" }), tone: "neutral" };
}

export function DocumentWorkspace({ onStatus }: { onStatus: (message: string) => void }) {
  const [items, setItems] = useState<DocumentRecord[]>([]);
  const [filter, setFilter] = useState<"all" | DocumentStatus | "due">("all");
  const [query, setQuery] = useState("");
  const [editor, setEditor] = useState(false);
  const [editing, setEditing] = useState<string | null>(null);
  const [draft, setDraft] = useState<DocumentDraft>(emptyDocumentDraft);
  const [previewUrl, setPreviewUrl] = useState("");

  useEffect(() => setItems(documentRepository.load()), []);
  useEffect(() => () => { if (previewUrl) URL.revokeObjectURL(previewUrl); }, [previewUrl]);

  const categories = Array.from(new Set(items.map((item) => item.category))).sort();
  const dueSoon = items.filter((item) => item.status === "active" && item.dueDate && dueLabel(item).tone !== "neutral").length;
  const visible = useMemo(() => items.filter((item) => {
    const matchesFilter = filter === "all" || (filter === "due" ? item.status === "active" && item.dueDate && dueLabel(item).tone !== "neutral" : item.status === filter);
    const needle = query.trim().toLowerCase();
    return matchesFilter && (!needle || [item.title, item.category, item.notes, item.attachmentName].some((value) => value.toLowerCase().includes(needle)));
  }).sort((a, b) => (a.dueDate || "9999").localeCompare(b.dueDate || "9999")), [items, filter, query]);

  const commit = (next: DocumentRecord[], message: string) => { setItems(next); documentRepository.save(next); onStatus(message); };
  const open = (item?: DocumentRecord) => {
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setPreviewUrl("");
    setEditing(item?.id || null);
    setDraft(item ? { title: item.title, category: item.category, dueDate: item.dueDate, reminderDays: item.reminderDays, status: item.status, notes: item.notes, attachmentName: item.attachmentName, attachmentType: item.attachmentType } : emptyDocumentDraft());
    setEditor(true);
  };
  const pickAttachment = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    if (previewUrl) URL.revokeObjectURL(previewUrl);
    setDraft({ ...draft, attachmentName: file.name, attachmentType: file.type });
    setPreviewUrl(URL.createObjectURL(file));
  };
  const save = (event: FormEvent) => {
    event.preventDefault();
    const title = draft.title.trim(), category = draft.category.trim();
    if (!title || !category) { onStatus("Add a document title and category."); return; }
    const clean = { ...draft, title, category, reminderDays: Math.max(0, draft.reminderDays) };
    const next = editing ? items.map((item) => item.id === editing ? { ...item, ...clean } : item) : [...items, { ...clean, id: crypto.randomUUID(), createdAt: new Date().toISOString() }];
    commit(next, editing ? "Document updated." : "Document added.");
    setEditor(false);
  };
  const remove = () => { if (!editing) return; commit(items.filter((item) => item.id !== editing), "Document deleted."); setEditor(false); };

  return <section className="document-workspace">
    <div className="document-summary" aria-label="Document overview">
      <div><span>Due soon</span><strong>{dueSoon}</strong><small>Needs attention</small></div>
      <div><span>Active records</span><strong>{items.filter((item) => item.status === "active").length}</strong><small>In your workspace</small></div>
      <div><span>Completed</span><strong>{items.filter((item) => item.status === "completed").length}</strong><small>Ready to archive</small></div>
    </div>
    <div className="document-toolbar">
      <div className="document-filters">{(["all", "due", "active", "completed", "archived"] as const).map((value) => <button key={value} className={filter === value ? "active" : ""} onClick={() => setFilter(value)}>{value === "due" ? "Due soon" : value[0].toUpperCase() + value.slice(1)}</button>)}</div>
      <label className="document-search"><span className="sr-only">Search documents</span><input value={query} onChange={(event) => setQuery(event.target.value)} placeholder="Search records" /></label>
      <button className="primary-button compact" onClick={() => open()}><Plus /> Add document</button>
    </div>
    <div className={editor ? "document-layout with-editor" : "document-layout"}>
      <div className="document-list">
        <div className="document-list-head"><span>Record</span><span>Due</span><span>Status</span></div>
        {visible.length === 0 ? <div className="document-empty"><h2>No documents found</h2><p>Change the filters or add a record to this workspace.</p><button className="secondary-button" onClick={() => open()}>Add document</button></div> : visible.map((item) => {
          const due = dueLabel(item);
          return <button className="document-row" key={item.id} onClick={() => open(item)}>
            <span className="document-record"><i><FileIcon /></i><span><strong>{item.title}</strong><small>{item.category}{item.attachmentName ? ` · ${item.attachmentName}` : ""}</small></span></span>
            <span className={`due-label ${due.tone}`}>{due.text}</span><span className={`status-label ${item.status}`}>{item.status}</span>
          </button>;
        })}
      </div>
      {editor && <aside className="document-editor">
        <div className="editor-heading"><div><span>{editing ? "Editing document" : "New document"}</span><h2>{editing ? "Update the record" : "Keep a record close"}</h2></div><button className="editor-close" onClick={() => setEditor(false)}>Close</button></div>
        <form onSubmit={save}>
          <label className="field"><span>Title</span><input value={draft.title} onChange={(event) => setDraft({ ...draft, title: event.target.value })} placeholder="e.g. Insurance renewal" autoFocus /></label>
          <label className="field"><span>Category</span><input list="document-categories" value={draft.category} onChange={(event) => setDraft({ ...draft, category: event.target.value })} /><datalist id="document-categories">{categories.map((category) => <option value={category} key={category} />)}</datalist></label>
          <div className="editor-grid"><label className="field"><span>Due date</span><input type="date" value={draft.dueDate} onChange={(event) => setDraft({ ...draft, dueDate: event.target.value })} /></label><label className="field"><span>Remind before</span><span className="number-suffix"><input type="number" min="0" max="365" value={draft.reminderDays} onChange={(event) => setDraft({ ...draft, reminderDays: Number(event.target.value) })} /><i>days</i></span></label></div>
          <label className="field"><span>Status</span><select value={draft.status} onChange={(event) => setDraft({ ...draft, status: event.target.value as DocumentStatus })}><option value="active">Active</option><option value="completed">Completed</option><option value="archived">Archived</option></select></label>
          <label className="field"><span>Notes</span><textarea rows={4} value={draft.notes} onChange={(event) => setDraft({ ...draft, notes: event.target.value })} placeholder="Useful context, renewal details, or where the original is kept" /></label>
          <label className="attachment-picker"><input type="file" accept="image/jpeg,image/png,image/webp,application/pdf" onChange={pickAttachment} /><FileIcon /><span><strong>{draft.attachmentName || "Attach an image or PDF"}</strong><small>{draft.attachmentName ? "Choose again to replace it" : "Stored in this browser session for now"}</small></span></label>
          {previewUrl && draft.attachmentType.startsWith("image/") && <a className="attachment-preview" href={previewUrl} target="_blank" rel="noreferrer"><img src={previewUrl} alt={`Preview of ${draft.attachmentName}`} /><span>Open full-size preview</span></a>}
          <div className="editor-actions">{editing && <button type="button" className="danger-button" onClick={remove}>Delete</button>}<span /><button type="button" className="secondary-button" onClick={() => setEditor(false)}>Cancel</button><button className="primary-button" type="submit">{editing ? "Save changes" : "Add document"}</button></div>
        </form>
      </aside>}
    </div>
  </section>;
}
