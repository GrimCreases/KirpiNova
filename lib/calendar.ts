import { notifyDataChanged } from "@/lib/data-events";
export type CalendarEvent = { id:string; title:string; date:string; startTime:string; endTime:string; kind:"schedule"|"blockout"; category:string; notes:string };
const KEY="kirpinova-preview-events-v1";
export const previewEvents:CalendarEvent[]=[
  {id:"family-plan",title:"Weekly family planning",date:"2026-08-10",startTime:"09:30",endTime:"10:00",kind:"schedule",category:"Family",notes:"Review the week together."},
  {id:"school-pickup",title:"Pick up Mila",date:"2026-08-10",startTime:"16:30",endTime:"17:00",kind:"schedule",category:"Family",notes:""},
  {id:"focus-block",title:"Quiet planning time",date:"2026-08-12",startTime:"14:00",endTime:"15:30",kind:"blockout",category:"Personal",notes:"No meetings."}
];
export const calendarRepository={
  load():CalendarEvent[]{try{const raw=localStorage.getItem(KEY);if(!raw)return previewEvents;const value=JSON.parse(raw);return Array.isArray(value)?value:previewEvents}catch{return previewEvents}},
  save(events:CalendarEvent[]){localStorage.setItem(KEY,JSON.stringify(events));notifyDataChanged()}
};
