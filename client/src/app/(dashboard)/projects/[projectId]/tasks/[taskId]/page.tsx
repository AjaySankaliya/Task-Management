"use client";

import { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { getTaskById, updateTask, deleteTask, type Task } from "@/api/task.api";
import { getUsers } from "@/api/auth.api";

export default function TaskDetailPage() {
  const params = useParams<{ projectId?: string; taskId?: string }>();
  const projectId = params?.projectId;
  const taskId = params?.taskId;
  const router = useRouter();

  const [task, setTask] = useState<Task | null>(null);
  const [users, setUsers] = useState<Array<{ _id?: string; name?: string; email?: string }>>([]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState("todo");
  const [priority, setPriority] = useState("medium");

  useEffect(() => {
    void (async () => {
      if (!taskId) return;
      const resp = await getTaskById(taskId);
      setTask(resp.data || null);
      setTitle(resp.data?.title || "");
      setDescription(resp.data?.description || "");
      setAssignee((resp.data?.assignee as any)?._id || "");
      setStatus(resp.data?.status || "todo");
      setPriority(resp.data?.priority || "medium");

      const usersResp = await getUsers();
      setUsers(usersResp.data || []);
    })();
  }, [taskId]);

  const handleSave = async () => {
    if (!taskId) return;
    try {
      await updateTask(taskId, { title, description, assignee, status: status as any, priority: priority as any });
      router.push(`/projects/${projectId}/kanban`);
    } catch (e) {}
  };

  const handleDelete = async () => {
    if (!taskId) return;
    if (!confirm("Delete task?")) return;
    try {
      await deleteTask(taskId);
      router.push(`/projects/${projectId}/kanban`);
    } catch (e) {}
  };

  if (!task) return <div className="p-6">Loading...</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-2xl p-6">
        <h2 className="text-2xl font-semibold mb-4">Edit Task</h2>

        <div className="space-y-4">
          <div>
            <label className="mb-1 block text-sm text-slate-300">Title</label>
            <Input value={title} onChange={(e) => setTitle(e.target.value)} />
          </div>

          <div>
            <label className="mb-1 block text-sm text-slate-300">Description</label>
            <Textarea value={description} onChange={(e) => setDescription(e.target.value)} />
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Assignee</label>
              <select value={assignee} onChange={(e) => setAssignee(e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white">
                <option value="">Unassigned</option>
                {users.map((u) => (<option key={u._id} value={u._id}>{u.name || u.email}</option>))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">Status</label>
              <select value={status} onChange={(e) => setStatus(e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white">
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2">
            <div>
              <label className="mb-1 block text-sm text-slate-300">Priority</label>
              <select value={priority} onChange={(e) => setPriority(e.target.value)} className="w-full rounded-md border border-slate-700 bg-slate-950 px-2 py-2 text-sm text-white">
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
              </select>
            </div>
          </div>

          <div className="flex gap-2">
            <Button onClick={handleSave} className="ml-auto">Save</Button>
            <Button variant="secondary" onClick={handleDelete}>Delete</Button>
          </div>
        </div>
      </div>
    </div>
  );
}
