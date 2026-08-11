import { notifyDataChanged } from "@/lib/data-events";
export type PersonGroup = "family" | "friends" | "professional" | "other";
export type PersonRecord = {
  id: string;
  name: string;
  relationship: string;
  group: PersonGroup;
  email: string;
  phone: string;
  birthday: string;
  notes: string;
  favorite: boolean;
  createdAt: string;
  updatedAt: string;
};
export type PersonDraft = Omit<PersonRecord, "id" | "createdAt" | "updatedAt">;
const STORAGE_KEY = "kirpinova-preview-people-v1";

export const emptyPersonDraft = (): PersonDraft => ({ name: "", relationship: "", group: "family", email: "", phone: "", birthday: "", notes: "", favorite: false });
export const previewPeople: PersonRecord[] = [
  { id: "mila", name: "Mila", relationship: "Daughter", group: "family", email: "", phone: "", birthday: "2017-04-18", notes: "Loves drawing, long walks, and choosing the weekend route.", favorite: true, createdAt: "2026-07-01T09:00:00Z", updatedAt: "2026-08-08T17:00:00Z" },
  { id: "lillian", name: "Lillian", relationship: "Family", group: "family", email: "lillian@example.com", phone: "+40 700 000 000", birthday: "1992-11-06", notes: "School payment records are filed under Documents.", favorite: true, createdAt: "2026-07-02T10:00:00Z", updatedAt: "2026-08-04T11:00:00Z" },
  { id: "andrei", name: "Andrei Pop", relationship: "Friend", group: "friends", email: "andrei@example.com", phone: "", birthday: "1989-09-02", notes: "Catch up before the end of August.", favorite: false, createdAt: "2026-07-10T13:00:00Z", updatedAt: "2026-07-10T13:00:00Z" },
  { id: "dr-ionescu", name: "Dr. Ionescu", relationship: "Family doctor", group: "professional", email: "", phone: "+40 700 000 001", birthday: "", notes: "Morning appointments are usually easiest.", favorite: false, createdAt: "2026-07-15T08:30:00Z", updatedAt: "2026-08-01T08:30:00Z" },
];

function normalize(value: Partial<PersonRecord>): PersonRecord | null {
  if (!value.id || typeof value.name !== "string") return null;
  const now = new Date().toISOString();
  const group: PersonGroup = value.group === "friends" || value.group === "professional" || value.group === "other" ? value.group : "family";
  return { id: value.id, name: value.name, relationship: typeof value.relationship === "string" ? value.relationship : "", group, email: typeof value.email === "string" ? value.email : "", phone: typeof value.phone === "string" ? value.phone : "", birthday: typeof value.birthday === "string" ? value.birthday : "", notes: typeof value.notes === "string" ? value.notes : "", favorite: Boolean(value.favorite), createdAt: typeof value.createdAt === "string" ? value.createdAt : now, updatedAt: typeof value.updatedAt === "string" ? value.updatedAt : now };
}
export const peopleRepository = {
  load(): PersonRecord[] { try { const raw = localStorage.getItem(STORAGE_KEY); if (!raw) return previewPeople; const value = JSON.parse(raw); return Array.isArray(value) ? value.map(normalize).filter((item): item is PersonRecord => item !== null) : previewPeople; } catch { return previewPeople; } },
  save(items: PersonRecord[]) { localStorage.setItem(STORAGE_KEY, JSON.stringify(items)); notifyDataChanged(); },
};
