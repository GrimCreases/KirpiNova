import { notifyDataChanged } from "@/lib/data-events";
export type AppPreferences = {
  displayName: string;
  workspaceName: string;
  geminiApiKey: string;
  remindersEnabled: boolean;
  reminderHour: string;
  weekStartsMonday: boolean;
  reportCurrency: "TRY" | "EUR" | "USD" | "GBP";
};

const STORAGE_KEY = "kirpinova-preview-preferences-v1";
export const defaultPreferences: AppPreferences = { displayName: "Yunus", workspaceName: "Personal workspace", geminiApiKey: "", remindersEnabled: true, reminderHour: "09:00", weekStartsMonday: true, reportCurrency: "TRY" };
export const preferencesRepository = {
  load(): AppPreferences {
    try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? { ...defaultPreferences, ...JSON.parse(raw) } : defaultPreferences; }
    catch { return defaultPreferences; }
  },
  save(value: AppPreferences) { localStorage.setItem(STORAGE_KEY, JSON.stringify(value)); notifyDataChanged(); },
};

export const previewStorageKeys = [
  "kirpinova-preview-tasks-v1", "kirpinova-preview-calendar-v1", "kirpinova-preview-finance-v1",
  "kirpinova-preview-finance-subscriptions-v1",
  "kirpinova-preview-documents-v1", "kirpinova-preview-journal-v1", "kirpinova-preview-people-v1",
  STORAGE_KEY, "kirpinova-theme",
];
