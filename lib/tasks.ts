export type Subtask = { id: string; text: string; done: boolean };
export type Task = {
  id: string; title: string; notes: string; dueDate: string; reminderAt: string;
  category: string; priority: "low" | "medium" | "high"; done: boolean;
  subtasks: Subtask[]; createdAt: string;
};
export type TaskDraft = Omit<Task, "id" | "createdAt">;
const STORAGE_KEY = "kirpinova-preview-tasks-v1";
export const emptyTaskDraft = (): TaskDraft => ({ title: "", notes: "", dueDate: "", reminderAt: "", category: "Personal", priority: "medium", done: false, subtasks: [] });
export const previewTasks: Task[] = [
  { id:"budget", title:"Review August household budget", notes:"Check subscriptions and the school payment.", dueDate:"2026-08-10", reminderAt:"2026-08-10T18:00", category:"Finance", priority:"high", done:false, createdAt:"2026-08-08T09:00:00Z", subtasks:[{id:"b1",text:"Review subscriptions",done:true},{id:"b2",text:"Confirm school payment",done:false},{id:"b3",text:"Set September target",done:false}] },
  { id:"health", title:"Book annual health check", notes:"Choose a morning appointment.", dueDate:"2026-08-12", reminderAt:"2026-08-11T09:00", category:"Personal", priority:"medium", done:false, createdAt:"2026-08-09T11:00:00Z", subtasks:[] },
  { id:"documents", title:"Prepare documents for Friday", notes:"Keep the signed form with its records.", dueDate:"2026-08-14", reminderAt:"", category:"Documents", priority:"medium", done:false, createdAt:"2026-08-07T15:30:00Z", subtasks:[{id:"d1",text:"Print insurance form",done:true},{id:"d2",text:"Add identification copy",done:true},{id:"d3",text:"Request signature",done:false}] },
  { id:"plants", title:"Water balcony plants", notes:"", dueDate:"2026-08-10", reminderAt:"", category:"Home", priority:"low", done:true, createdAt:"2026-08-10T07:00:00Z", subtasks:[] }
];
function normalize(value: Partial<Task>): Task | null {
  if (!value.id || typeof value.title !== "string") return null;
  return { id:value.id, title:value.title, notes:typeof value.notes==="string"?value.notes:"", dueDate:typeof value.dueDate==="string"?value.dueDate:"", reminderAt:typeof value.reminderAt==="string"?value.reminderAt:"", category:typeof value.category==="string"&&value.category?value.category:"Personal", priority:value.priority==="low"||value.priority==="high"?value.priority:"medium", done:Boolean(value.done), subtasks:Array.isArray(value.subtasks)?value.subtasks.filter((x):x is Subtask=>Boolean(x?.id&&typeof x.text==="string")).map(x=>({...x,done:Boolean(x.done)})):[], createdAt:typeof value.createdAt==="string"?value.createdAt:new Date().toISOString() };
}
export const taskRepository = {
  load(): Task[] { try { const raw=localStorage.getItem(STORAGE_KEY); if(!raw)return previewTasks; const value=JSON.parse(raw); return Array.isArray(value)?value.map(normalize).filter((x):x is Task=>x!==null):previewTasks; } catch { return previewTasks; } },
  save(tasks: Task[]) { localStorage.setItem(STORAGE_KEY,JSON.stringify(tasks)); }
};
