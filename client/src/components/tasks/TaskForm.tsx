"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose, DialogTrigger } from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { createTask, updateTask, type Task, type TaskInput } from "@/api/task.api";

type Props = {
  projectId: string;
  users: Array<{ _id?: string; name?: string; email?: string }>;
  editing?: Task | null;
  onSuccess?: (task?: Task) => void;
  trigger?: React.ReactNode;
};

export default function TaskForm({ projectId, users, editing = null, onSuccess, trigger }: Props) {
  const [open, setOpen] = useState(false);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [assignee, setAssignee] = useState("");
  const [status, setStatus] = useState<"todo" | "in-progress" | "done">("todo");
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (editing) {
      setTitle(editing.title || "");
      setDescription(editing.description || "");
      setStatus((editing.status as any) || "todo");
      setAssignee((editing.assignee as any)?._id || "");
      setOpen(true);
    }
  }, [editing]);

  const reset = () => {
    setTitle("");
    setDescription("");
    setAssignee("");
    setStatus("todo");
  };

  const handleSubmit = async () => {
    if (!title || !assignee) return;
    setLoading(true);
    try {
      if (editing) {
        const resp = await updateTask(editing._id, { title, description, assignee, status });
        onSuccess?.(resp.data);
      } else {
        const payload: TaskInput = { title, description, assignee, project: projectId, status };
        const resp = await createTask(payload);
        onSuccess?.(resp.data);
      }
      reset();
      setOpen(false);
    } catch (err) {
      // ignore; parent will reload and surface errors
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      {trigger ? <DialogTrigger asChild>{trigger}</DialogTrigger> : <></>}
      <DialogContent>
        <DialogHeader>
          <DialogTitle>{editing ? "Edit Task" : "Create Task"}</DialogTitle>
        </DialogHeader>

        <div className="grid gap-2">
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
              <select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" value={assignee} onChange={(e) => setAssignee(e.target.value)}>
                <option value="">Choose a user</option>
                {users.map((u) => (
                  <option key={u._id} value={u._id}>{u.name || u.email}</option>
                ))}
              </select>
            </div>

            <div>
              <label className="mb-1 block text-sm text-slate-300">Status</label>
              <select className="w-full rounded-md border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white" value={status} onChange={(e) => setStatus(e.target.value as any)}>
                <option value="todo">To Do</option>
                <option value="in-progress">In Progress</option>
                <option value="done">Done</option>
              </select>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="secondary" onClick={() => setOpen(false)} className="mr-2">Cancel</Button>
          <Button onClick={handleSubmit} disabled={loading || !title || !assignee}>{editing ? "Save" : "Create"}</Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}
