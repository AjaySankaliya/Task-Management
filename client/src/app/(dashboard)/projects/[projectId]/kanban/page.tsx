"use client";

import { useEffect, useMemo, useState } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { getProjectById, type Project } from "@/api/project.api";
import { getTasks, updateTaskStatus, type Task } from "@/api/task.api";

const STATUS_COLUMNS = ["todo", "in-progress", "done"] as const;

type TaskStatus = (typeof STATUS_COLUMNS)[number];

function DroppableColumn({ id, title, count, children }: { id: TaskStatus; title: string; count: number; children: React.ReactNode }) {
  const { setNodeRef, isOver } = useDroppable({ id });
  return (
    <Card ref={setNodeRef} className={`border-slate-800 bg-slate-900/80 ${isOver ? "border-sky-500/60 bg-slate-900/95" : ""}`}>
      <CardHeader>
        <CardTitle className="flex items-center justify-between">
          <span>{title}</span>
          <span className="text-sm text-slate-400">{count}</span>
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3 min-h-45">{children}</CardContent>
    </Card>
  );
}

function DraggableTaskCard({ task, onClick }: { task: Task; onClick: () => void }) {
  const { attributes, listeners, setNodeRef, transform, isDragging } = useDraggable({ id: task._id });
  const style = transform ? { transform: `translate3d(${transform.x}px, ${transform.y}px, 0)` } : undefined;

  return (
    <div ref={setNodeRef} style={style} {...attributes} {...listeners} className={`cursor-grab rounded-md border border-slate-800 bg-slate-950/50 p-3 shadow-sm transition hover:border-sky-500/40 ${isDragging ? "opacity-80" : ""}`} onClick={onClick}>
      <div className="flex items-center justify-between gap-3">
        <h3 className="truncate text-sm font-medium text-white">{task.title}</h3>
        <span className="rounded-full bg-slate-800 px-2 py-0.5 text-xs text-slate-300">{task.priority || "medium"}</span>
      </div>
      <div className="mt-2 flex items-center justify-between text-xs text-slate-400">
        <span>{((task.assignee as { name?: string })?.name) || "Unassigned"}</span>
        <span>{task.dueDate ? new Date(task.dueDate).toLocaleDateString() : ""}</span>
      </div>
    </div>
  );
}

export default function ProjectKanbanPage() {
  const params = useParams<{ projectId?: string }>();
  const projectId = params?.projectId;
  const router = useRouter();

  const [project, setProject] = useState<Project | null>(null);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [dragError, setDragError] = useState("");

  useEffect(() => {
    const load = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const p = await getProjectById(projectId);
        setProject(p.data || null);
        const t = await getTasks({ project: projectId });
        setTasks(t.data || []);
      } catch {
        // ignore
      } finally {
        setLoading(false);
      }
    };

    void load();
  }, [projectId]);

  const sensors = useSensors(useSensor(PointerSensor, { activationConstraint: { distance: 5 } }));

  const columns = useMemo(
    () => ({
      todo: tasks.filter((t) => t.status === "todo"),
      "in-progress": tasks.filter((t) => t.status === "in-progress"),
      done: tasks.filter((t) => t.status === "done"),
    }),
    [tasks],
  );

  const handleDragStart = ({ active }: DragStartEvent) => {
    setActiveTaskId(active.id as string);
  };

  const handleDragEnd = async ({ active, over }: DragEndEvent) => {
    setActiveTaskId(null);
    if (!over || !projectId) return;

    const activeTask = tasks.find((t) => t._id === active.id);
    const destinationStatus = over.id as TaskStatus;
    if (!activeTask || activeTask.status === destinationStatus) return;

    const previousTasks = tasks;
    const updatedTasks = tasks.map((task) =>
      task._id === activeTask._id ? { ...task, status: destinationStatus } : task,
    );

    setTasks(updatedTasks);
    setDragError("");

    try {
      await updateTaskStatus(activeTask._id, destinationStatus);
    } catch {
      setTasks(previousTasks);
      setDragError("Could not update task status. Reverting.");
    }
  };

  const activeTask = activeTaskId ? tasks.find((task) => task._id === activeTaskId) : null;

  if (!projectId) return <div className="p-6">Project id missing</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex items-center justify-between gap-4">
          <div>
            <h2 className="text-2xl font-semibold">{project?.title || "Project"}</h2>
            <p className="text-sm text-slate-400">Drag tasks across your board to update status.</p>
          </div>

          <div className="flex items-center gap-2">
            <Link href={`/projects/${projectId}/tasks/new`}>
              <Button>Add Task</Button>
            </Link>
            <Button variant="secondary" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </div>

        {dragError ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {dragError}
          </div>
        ) : null}

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid gap-4 grid-cols-3">
            {STATUS_COLUMNS.map((col) => (
              <DroppableColumn key={col} id={col} title={col.replace("-", " ")} count={columns[col].length}>
                {loading ? (
                  <p className="text-sm text-slate-400">Loading...</p>
                ) : columns[col].length === 0 ? (
                  <p className="text-sm text-slate-400">No tasks</p>
                ) : (
                  columns[col].map((task) => (
                    <DraggableTaskCard
                      key={task._id}
                      task={task}
                      onClick={() => router.push(`/projects/${projectId}/tasks/${task._id}`)}
                    />
                  ))
                )}
              </DroppableColumn>
            ))}
          </div>

          <DragOverlay>{activeTask ? <DraggableTaskCard task={activeTask} onClick={() => {}} /> : null}</DragOverlay>
        </DndContext>
      </div>
    </div>
  );
}
