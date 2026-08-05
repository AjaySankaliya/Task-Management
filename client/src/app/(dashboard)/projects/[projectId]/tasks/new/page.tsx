"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getUsers } from "@/api/auth.api";
import { createTask, type TaskInput } from "@/api/task.api";

export default function NewTaskPage() {
  const params = useParams<{ projectId?: string }>();
  const projectId = params?.projectId;
  const router = useRouter();

  const [users, setUsers] = useState<Array<{ _id?: string; name?: string; email?: string }>>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");
  const [dueDate, setDueDate] = useState<string>("");
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    void (async () => {
      const resp = await getUsers();
      setUsers(resp.data || []);
    })();
  }, []);

  const handleSubmit = async () => {
    if (!title.trim()) {
      setError("Task title is required.");
      return;
    }
    if (!projectId) return;

    const payload: TaskInput = { title, description, assignee, project: projectId, status: status as any, priority: priority as any, dueDate: dueDate || undefined };
    try {
      setSaving(true);
      setError("");
      await createTask(payload);
      router.push(`/projects/${projectId}/kanban`);
    } catch (e) {
      setError("Unable to create task.");
    } finally {
      setSaving(false);
    }
  };

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-3xl px-4 py-10 sm:px-6 lg:px-8">
        <div className="rounded-[2rem] border border-slate-800 bg-slate-900/80 p-8 shadow-2xl shadow-slate-950/20">
          <div className="mb-8">
            <p className="text-xs uppercase tracking-[0.35em] text-sky-300/70">New task</p>
            <h1 className="mt-3 text-4xl font-semibold text-white">Create a task</h1>
            <p className="mt-3 max-w-2xl text-sm leading-6 text-slate-400">
              Add a new task to this project, assign it to a teammate, and set priority so your board stays focused.
            </p>
          </div>

          {error ? (
            <div className="mb-6 rounded-3xl border border-red-500/20 bg-red-500/10 px-5 py-4 text-sm text-red-200">
              {error}
            </div>
          ) : null}

          <div className="space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Title</label>
              <Input value={title} onChange={(e) => setTitle(e.target.value)} placeholder="Design new landing page" className="bg-slate-950/80 border-slate-700" />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-slate-200">Description</label>
              <Textarea value={description} onChange={(e) => setDescription(e.target.value)} placeholder="Add context for the task" className="bg-slate-950/80 border-slate-700" />
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Status</label>
                <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
                  <option value="todo">To Do</option>
                  <option value="in-progress">In Progress</option>
                  <option value="done">Done</option>
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Priority</label>
                <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Assignee</label>
                <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="w-full rounded-2xl border border-slate-700 bg-slate-950/80 px-4 py-3 text-sm text-slate-100 outline-none transition focus:border-sky-500 focus:ring-2 focus:ring-sky-500/20">
                  <option value="">Unassigned</option>
                  {users.map((u) => (
                    <option key={u._id} value={u._id}>{u.name || u.email}</option>
                  ))}
                </select>
              </div>

              <div className="space-y-2">
                <label className="text-sm font-medium text-slate-200">Due date</label>
                <Input type="date" value={dueDate} onChange={(e) => setDueDate(e.target.value)} className="bg-slate-950/80 border-slate-700" />
              </div>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-end">
              <Button variant="secondary" onClick={() => router.back()} className="w-full sm:w-auto">
                Cancel
              </Button>
              <Button onClick={handleSubmit} disabled={saving} className="w-full sm:w-auto">
                {saving ? "Creating task..." : "Create task"}
              </Button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
