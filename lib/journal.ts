export type JournalEntry = {
  id: string;
  title: string;
  body: string;
  date: string;
  category: string;
  happiness: number;
  energy: number;
  stress: number;
  draft: boolean;
  createdAt: string;
  updatedAt: string;
};

export type JournalDraft = Omit<JournalEntry, "id" | "createdAt" | "updatedAt">;
const STORAGE_KEY = "kirpinova-preview-journal-v1";

export const emptyJournalDraft = (): JournalDraft => ({
  title: "",
  body: "",
  date: new Date().toISOString().slice(0, 10),
  category: "Reflection",
  happiness: 3,
  energy: 3,
  stress: 3,
  draft: false,
});

export const previewJournalEntries: JournalEntry[] = [
  { id: "quiet-monday", title: "A quieter start to the week", body: "The morning felt less hurried after planning together last night. I want to protect that slower first hour and keep the important work visible.", date: "2026-08-10", category: "Reflection", happiness: 4, energy: 3, stress: 2, draft: false, createdAt: "2026-08-10T07:40:00Z", updatedAt: "2026-08-10T07:40:00Z" },
  { id: "family-weekend", title: "Weekend with the family", body: "We spent most of Saturday outside. Mila chose the route and kept everyone moving. A simple day, but one worth remembering.", date: "2026-08-08", category: "Family", happiness: 5, energy: 4, stress: 1, draft: false, createdAt: "2026-08-08T20:10:00Z", updatedAt: "2026-08-08T20:10:00Z" },
  { id: "august-intention", title: "What I want from August", body: "Finish writing the list of intentions and decide which one deserves attention first.", date: "2026-08-04", category: "Personal", happiness: 3, energy: 3, stress: 3, draft: true, createdAt: "2026-08-04T18:00:00Z", updatedAt: "2026-08-05T08:20:00Z" },
];

const rating = (value: unknown) => Math.min(5, Math.max(1, Number.isFinite(value) ? Number(value) : 3));
function normalize(value: Partial<JournalEntry>): JournalEntry | null {
  if (!value.id || typeof value.title !== "string") return null;
  const now = new Date().toISOString();
  return {
    id: value.id,
    title: value.title,
    body: typeof value.body === "string" ? value.body : "",
    date: typeof value.date === "string" ? value.date : now.slice(0, 10),
    category: typeof value.category === "string" && value.category ? value.category : "Reflection",
    happiness: rating(value.happiness), energy: rating(value.energy), stress: rating(value.stress),
    draft: Boolean(value.draft),
    createdAt: typeof value.createdAt === "string" ? value.createdAt : now,
    updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : now,
  };
}

export const journalRepository = {
  load(): JournalEntry[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return previewJournalEntries;
      const value = JSON.parse(raw);
      return Array.isArray(value) ? value.map(normalize).filter((item): item is JournalEntry => item !== null) : previewJournalEntries;
    } catch { return previewJournalEntries; }
  },
  save(entries: JournalEntry[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(entries)); },
};
