export type DocumentStatus = "active" | "completed" | "archived";

export type DocumentRecord = {
  id: string;
  title: string;
  category: string;
  dueDate: string;
  reminderDays: number;
  status: DocumentStatus;
  notes: string;
  attachmentName: string;
  attachmentType: string;
  createdAt: string;
};

export type DocumentDraft = Omit<DocumentRecord, "id" | "createdAt">;

const STORAGE_KEY = "kirpinova-preview-documents-v1";

export const emptyDocumentDraft = (): DocumentDraft => ({
  title: "",
  category: "Personal",
  dueDate: "",
  reminderDays: 3,
  status: "active",
  notes: "",
  attachmentName: "",
  attachmentType: "",
});

export const previewDocuments: DocumentRecord[] = [
  { id: "insurance", title: "Home insurance renewal", category: "Home", dueDate: "2026-08-14", reminderDays: 3, status: "active", notes: "Compare the renewal quote before approving.", attachmentName: "insurance-renewal.pdf", attachmentType: "application/pdf", createdAt: "2026-08-02T09:00:00Z" },
  { id: "school", title: "School payment receipt", category: "Family", dueDate: "2026-08-15", reminderDays: 1, status: "completed", notes: "Keep with the August family records.", attachmentName: "", attachmentType: "", createdAt: "2026-08-05T10:30:00Z" },
  { id: "passport", title: "Previous passport copy", category: "Identity", dueDate: "", reminderDays: 7, status: "archived", notes: "Archived after the renewal was completed.", attachmentName: "passport-copy.jpg", attachmentType: "image/jpeg", createdAt: "2026-07-21T13:00:00Z" },
];

function normalize(value: Partial<DocumentRecord>): DocumentRecord | null {
  if (!value.id || typeof value.title !== "string") return null;
  const status: DocumentStatus = value.status === "completed" || value.status === "archived" ? value.status : "active";
  return {
    id: value.id,
    title: value.title,
    category: typeof value.category === "string" && value.category ? value.category : "Personal",
    dueDate: typeof value.dueDate === "string" ? value.dueDate : "",
    reminderDays: Number.isFinite(value.reminderDays) ? Math.max(0, Number(value.reminderDays)) : 3,
    status,
    notes: typeof value.notes === "string" ? value.notes : "",
    attachmentName: typeof value.attachmentName === "string" ? value.attachmentName : "",
    attachmentType: typeof value.attachmentType === "string" ? value.attachmentType : "",
    createdAt: typeof value.createdAt === "string" ? value.createdAt : new Date().toISOString(),
  };
}

export const documentRepository = {
  load(): DocumentRecord[] {
    try {
      const raw = localStorage.getItem(STORAGE_KEY);
      if (!raw) return previewDocuments;
      const value = JSON.parse(raw);
      return Array.isArray(value) ? value.map(normalize).filter((item): item is DocumentRecord => item !== null) : previewDocuments;
    } catch {
      return previewDocuments;
    }
  },
  save(items: DocumentRecord[]) {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(items));
  },
};
