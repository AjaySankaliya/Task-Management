"use client";

import { useEffect, useState } from "react";
import { Plus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getTasks, type Task } from "@/api/task.api";
import TaskItem from "./TaskItem";
import TaskForm from "./TaskForm";

type Props = {
  projectId: string;
  users: Array<{ _id?: string; name?: string; email?: string }>;
};

export default function TaskList({ projectId, users }: Props) {
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Task | null>(null);

  const load = async () => {
    setLoading(true);
    try {
      const resp = await getTasks({ project: projectId });
      setTasks(resp.data || []);
    } catch (err) {
      setTasks([]);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    void load();
  }, [projectId]);

  return (
    <Card className="mb-6 border-slate-800 bg-slate-900/80">
      <CardHeader className="flex items-center justify-between">
        <CardTitle>Tasks</CardTitle>
        <div className="flex items-center gap-2">
          <TaskForm projectId={projectId} users={users} onSuccess={() => void load()} trigger={
            <Button size="sm" className="gap-2"><Plus className="h-4 w-4"/>New</Button>
          } />
        </div>
      </CardHeader>
      <CardContent className="space-y-3">
        {loading ? (
          <p className="text-sm text-slate-400">Loading tasks...</p>
        ) : tasks.length === 0 ? (
          <p className="text-sm text-slate-400">No tasks for this project.</p>
        ) : (
          tasks.map((task) => (
            <TaskItem key={task._id} task={task} onDeleted={() => void load()} onEdit={() => setEditing(task)} />
          ))
        )}

        {editing ? <TaskForm projectId={projectId} users={users} editing={editing} onSuccess={() => { setEditing(null); void load(); }} /> : null}
      </CardContent>
    </Card>
  );
}
