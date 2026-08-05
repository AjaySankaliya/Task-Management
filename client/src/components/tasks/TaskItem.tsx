"use client";

import { Button } from "@/components/ui/button";
import { Trash2, Edit2 } from "lucide-react";
import { deleteTask, updateTaskStatus, type Task } from "@/api/task.api";

type Props = {
  task: Task;
  onDeleted?: () => void;
  onEdit?: (task: Task) => void;
};

export default function TaskItem({ task, onDeleted, onEdit }: Props) {
  const handleDelete = async () => {
    try {
      await deleteTask(task._id);
      onDeleted?.();
    } catch (err) {
      // ignore for now
    }
  };

  const toggleDone = async () => {
    try {
      const next = task.status === "done" ? "todo" : "done";
      await updateTaskStatus(task._id, next);
      onEdit?.(task);
    } catch (err) {}
  };

  return (
    <div className="flex items-center justify-between gap-3 rounded-md border border-slate-800 bg-slate-950/50 p-3">
      <div>
        <p className="font-medium text-white">{task.title}</p>
        <p className="text-xs text-slate-400">{(task.assignee as any)?.name || "Unassigned"} • {task.status}</p>
      </div>

      <div className="flex items-center gap-2">
        <Button variant="ghost" size="icon" onClick={toggleDone} className="h-8 w-8">
          ✓
        </Button>
        <Button variant="ghost" size="icon" onClick={() => onEdit?.(task)} className="h-8 w-8">
          <Edit2 className="h-4 w-4" />
        </Button>
        <Button variant="ghost" size="icon" onClick={handleDelete} className="h-8 w-8 text-red-400">
          <Trash2 className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}
