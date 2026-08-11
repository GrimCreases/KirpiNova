"use client";
import { FormEvent, useEffect, useMemo, useState } from "react";
import { emptyTaskDraft, Task, TaskDraft, taskRepository } from "@/lib/tasks";

type Filter = "all"|"today"|"upcoming"|"completed";
const today=()=>new Date().toISOString().slice(0,10);
const id=()=>crypto.randomUUID();
const Check=()=> <svg aria-hidden="true" viewBox="0 0 24 24" width="16" height="16" fill="none" stroke="currentColor" strokeWidth="2"><path d="m5 12 4 4L19 6"/></svg>;
const Plus=()=> <svg aria-hidden="true" viewBox="0 0 24 24" width="18" height="18" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M12 5v14M5 12h14"/></svg>;
const Bell=()=> <svg aria-hidden="true" viewBox="0 0 24 24" width="14" height="14" fill="none" stroke="currentColor" strokeWidth="1.8"><path d="M18 8a6 6 0 0 0-12 0c0 7-3 7-3 9h18c0-2-3-2-3-9M10 21h4"/></svg>;
const draftOf=(task:Task):TaskDraft=>({title:task.title,notes:task.notes,dueDate:task.dueDate,reminderAt:task.reminderAt,category:task.category,priority:task.priority,done:task.done,subtasks:task.subtasks.map(x=>({...x}))});

export function TaskWorkspace({onStatus}:{onStatus:(message:string)=>void}) {
  const [tasks,setTasks]=useState<Task[]>([]);
  const [filter,setFilter]=useState<Filter>("all");
  const [query,setQuery]=useState("");
  const [editing,setEditing]=useState<string|null>(null);
  const [draft,setDraft]=useState<TaskDraft>(emptyTaskDraft);
  const [step,setStep]=useState("");
  const [editor,setEditor]=useState(false);
  useEffect(()=>setTasks(taskRepository.load()),[]);
  const commit=(next:Task[],message:string)=>{setTasks(next);taskRepository.save(next);onStatus(message);};
  const visible=useMemo(()=>tasks.filter(task=>{
    if(filter==="today"&&(task.dueDate!==today()||task.done))return false;
    if(filter==="upcoming"&&(!(task.dueDate>today())||task.done))return false;
    if(filter==="completed"&&!task.done)return false;
    const q=query.trim().toLowerCase();
    return !q||[task.title,task.notes,task.category].some(x=>x.toLowerCase().includes(q));
  }).sort((a,b)=>Number(a.done)-Number(b.done)||(a.dueDate||"9999").localeCompare(b.dueDate||"9999")),[tasks,filter,query]);
  const open=(task?:Task)=>{setEditing(task?.id||null);setDraft(task?draftOf(task):emptyTaskDraft());setStep("");setEditor(true);};
  const save=(event:FormEvent)=>{event.preventDefault();const title=draft.title.trim();if(!title){onStatus("Add a task title before saving.");return;}const next=editing?tasks.map(x=>x.id===editing?{...x,...draft,title}:x):[...tasks,{...draft,title,id:id(),createdAt:new Date().toISOString()}];commit(next,editing?"Task updated.":"Task added.");setEditor(false);};
  const toggle=(task:Task)=>commit(tasks.map(x=>x.id===task.id?{...x,done:!x.done}:x),task.done?"Task reopened.":"Task completed.");
  const toggleStep=(taskId:string,stepId:string)=>commit(tasks.map(task=>task.id===taskId?{...task,subtasks:task.subtasks.map(x=>x.id===stepId?{...x,done:!x.done}:x)}:task),"Subtask updated.");
  const addStep=()=>{const text=step.trim();if(!text)return;setDraft({...draft,subtasks:[...draft.subtasks,{id:id(),text,done:false}]});setStep("");};
  const remove=()=>{if(!editing)return;commit(tasks.filter(x=>x.id!==editing),"Task deleted.");setEditor(false);};
  return <section className="task-workspace">
    <div className="task-summary"><div><strong>{tasks.filter(x=>!x.done).length}</strong><span>Open tasks</span></div><div><strong>{tasks.filter(x=>!x.done&&x.dueDate===today()).length}</strong><span>Due today</span></div><div><strong>{tasks.filter(x=>x.done).length}</strong><span>Completed</span></div><button className="primary-button compact" onClick={()=>open()}><Plus/> New task</button></div>
    <div className="task-toolbar"><div className="task-filters">{(["all","today","upcoming","completed"] as Filter[]).map(value=><button key={value} className={filter===value?"active":""} onClick={()=>setFilter(value)}>{value[0].toUpperCase()+value.slice(1)}</button>)}</div><label className="task-search"><span className="sr-only">Search tasks</span><input value={query} onChange={e=>setQuery(e.target.value)} placeholder="Search tasks"/></label></div>
    <div className={editor?"task-content with-editor":"task-content"}><div className="task-records">
      {visible.length===0?<div className="task-empty"><Check/><h2>No tasks here</h2><p>Change the filter or create a task for this view.</p><button className="secondary-button" onClick={()=>open()}>Create a task</button></div>:visible.map(task=>{const done=task.subtasks.filter(x=>x.done).length;return <article className={task.done?"task-record done":"task-record"} key={task.id}>
        <button className="record-check" onClick={()=>toggle(task)} aria-label={task.done?`Reopen ${task.title}`:`Complete ${task.title}`}><Check/></button>
        <button className="record-main" onClick={()=>open(task)}><span className="record-title"><strong>{task.title}</strong><i className={"priority "+task.priority}>{task.priority}</i></span><span className="record-meta"><span>{task.category}</span>{task.dueDate&&<time>{task.dueDate===today()?"Today":new Date(task.dueDate+"T12:00:00").toLocaleDateString(undefined,{month:"short",day:"numeric"})}</time>}{task.reminderAt&&<span className="reminder"><Bell/> Reminder</span>}</span>{task.subtasks.length>0&&<span className="subtask-progress"><i style={{width:`${Math.round(done/task.subtasks.length*100)}%`}}/><small>{done} of {task.subtasks.length} subtasks</small></span>}</button>
        {task.subtasks.length>0&&<div className="inline-subtasks">{task.subtasks.slice(0,3).map(sub=><label key={sub.id}><input type="checkbox" checked={sub.done} onChange={()=>toggleStep(task.id,sub.id)}/><span>{sub.text}</span></label>)}</div>}
      </article>})}
    </div>{editor&&<aside className="task-editor"><div className="editor-heading"><div><span>{editing?"Editing task":"New task"}</span><h2>{editing?"Update the details":"What needs doing?"}</h2></div><button className="editor-close" onClick={()=>setEditor(false)} aria-label="Close task editor">Close</button></div><form onSubmit={save}>
      <label className="field"><span>Task title</span><input value={draft.title} onChange={e=>setDraft({...draft,title:e.target.value})} autoFocus placeholder="Write a clear next action"/></label>
      <div className="editor-grid"><label className="field"><span>Due date</span><input type="date" value={draft.dueDate} onChange={e=>setDraft({...draft,dueDate:e.target.value})}/></label><label className="field"><span>Priority</span><select value={draft.priority} onChange={e=>setDraft({...draft,priority:e.target.value as TaskDraft["priority"]})}><option value="low">Low</option><option value="medium">Medium</option><option value="high">High</option></select></label></div>
      <label className="field"><span>Category</span><input list="task-categories" value={draft.category} onChange={e=>setDraft({...draft,category:e.target.value})}/><datalist id="task-categories"><option value="Personal"/><option value="Family"/><option value="Home"/><option value="Finance"/><option value="Documents"/></datalist></label>
      <label className="field"><span>Reminder</span><input type="datetime-local" value={draft.reminderAt} onChange={e=>setDraft({...draft,reminderAt:e.target.value})}/><small>Notification delivery arrives with the cloud reminders milestone.</small></label>
      <label className="field"><span>Notes</span><textarea value={draft.notes} onChange={e=>setDraft({...draft,notes:e.target.value})} rows={3} placeholder="Optional context"/></label>
      <fieldset className="subtask-editor"><legend>Subtasks</legend>{draft.subtasks.map(sub=><label key={sub.id}><input type="checkbox" checked={sub.done} onChange={()=>setDraft({...draft,subtasks:draft.subtasks.map(x=>x.id===sub.id?{...x,done:!x.done}:x)})}/><span>{sub.text}</span><button type="button" onClick={()=>setDraft({...draft,subtasks:draft.subtasks.filter(x=>x.id!==sub.id)})}>Remove</button></label>)}<div><input value={step} onChange={e=>setStep(e.target.value)} onKeyDown={e=>{if(e.key==="Enter"){e.preventDefault();addStep();}}} placeholder="Add a smaller step"/><button type="button" onClick={addStep}><Plus/> Add</button></div></fieldset>
      <div className="editor-actions">{editing&&<button className="danger-button" type="button" onClick={remove}>Delete</button>}<span/><button className="secondary-button" type="button" onClick={()=>setEditor(false)}>Cancel</button><button className="primary-button" type="submit">{editing?"Save changes":"Add task"}</button></div>
    </form></aside>}</div>
  </section>;
}
