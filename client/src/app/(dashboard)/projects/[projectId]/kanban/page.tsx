"use client";

import { useEffect, useMemo, useState, type ReactNode } from "react";
import Link from "next/link";
import { useParams, useRouter } from "next/navigation";
import { DndContext, DragEndEvent, DragStartEvent, DragOverlay, PointerSensor, useDraggable, useDroppable, useSensor, useSensors } from "@dnd-kit/core";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { DashboardHeader } from "@/components/dashboard/DashboardHeader";
import { getProjectById, getProjectMembers, type Project } from "@/api/project.api";
import { getTasks, updateTaskStatus, type Task, type TaskQueryParams } from "@/api/task.api";

const STATUS_COLUMNS = ["todo", "in-progress", "done"] as const;

type TaskStatus = (typeof STATUS_COLUMNS)[number];

type Member = {
  _id?: string;
  name?: string;
  email?: string;
};

function DroppableColumn({ id, title, count, children }: { id: TaskStatus; title: string; count: number; children: ReactNode }) {
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
  const [members, setMembers] = useState<Member[]>([]);
  const [tasks, setTasks] = useState<Task[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeTaskId, setActiveTaskId] = useState<string | null>(null);
  const [search, setSearch] = useState("");
  const [statusFilter, setStatusFilter] = useState<"" | TaskStatus>("");
  const [priorityFilter, setPriorityFilter] = useState<"" | "low" | "medium" | "high">("");
  const [assigneeFilter, setAssigneeFilter] = useState<string>("");
  const [error, setError] = useState("");
  const [dragError, setDragError] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState(search);

  useEffect(() => {
    const timer = window.setTimeout(() => setDebouncedSearch(search), 300);
    return () => window.clearTimeout(timer);
  }, [search]);

  useEffect(() => {
    const loadProject = async () => {
      if (!projectId) return;
      setLoading(true);
      try {
        const projectResponse = await getProjectById(projectId);
        const membersResponse = await getProjectMembers(projectId);
        setProject(projectResponse.data || null);
        setMembers(membersResponse.data || []);
      } catch {
        setError("Unable to load project details.");
      } finally {
        setLoading(false);
      }
    };

    void loadProject();
  }, [projectId]);

  useEffect(() => {
    const loadTasks = async () => {
      if (!projectId) return;
      setLoading(true);
      setError("");
      try {
        const params: TaskQueryParams = {
          project: projectId,
          search: debouncedSearch || undefined,
          status: statusFilter || undefined,
          priority: priorityFilter || undefined,
          assignee: assigneeFilter || undefined,
        };
        const resp = await getTasks(params);
        setTasks(resp.data || []);
      } catch {
        setError("Unable to load tasks. Please try again.");
        setTasks([]);
      } finally {
        setLoading(false);
      }
    };

    void loadTasks();
  }, [projectId, debouncedSearch, statusFilter, priorityFilter, assigneeFilter]);

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

  const handleResetFilters = () => {
    setSearch("");
    setStatusFilter("");
    setPriorityFilter("");
    setAssigneeFilter("");
    setError("");
  };

  const activeTask = activeTaskId ? tasks.find((task) => task._id === activeTaskId) : null;

  if (!projectId) return <div className="p-6">Project id missing</div>;

  return (
    <div className="min-h-screen bg-slate-950 text-slate-50">
      <DashboardHeader />
      <div className="mx-auto max-w-7xl p-6">
        <div className="mb-6 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">{project?.title || "Project"}</h2>
            <p className="text-sm text-slate-400">Search and filter tasks within this board.</p>
          </div>

          <div className="flex flex-wrap items-center gap-2">
            <Link href={`/projects/${projectId}/tasks/new`}>
              <Button>Add Task</Button>
            </Link>
            <Button variant="secondary" onClick={() => router.back()}>
              Back
            </Button>
          </div>
        </div>

        <Card className="mb-6 border-slate-800 bg-slate-900/80">
          <CardHeader className="flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
            <div>
              <CardTitle>Search & filters</CardTitle>
              <p className="text-sm text-slate-400">Search by title or description, then refine by status, priority, or assignee.</p>
            </div>
            <Button variant="secondary" onClick={handleResetFilters}>
              Reset filters
            </Button>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid gap-4 lg:grid-cols-[1.5fr_0.8fr]">
              <div className="space-y-2">
                <Label htmlFor="task-search">Search tasks</Label>
                <Input
                  id="task-search"
                  value={search}
                  onChange={(event) => setSearch(event.target.value)}
                  placeholder="Search title or description"
                />
              </div>
              <div className="grid gap-4 sm:grid-cols-3">
                <div className="space-y-2">
                  <Label htmlFor="status-filter">Status</Label>
                  <select
                    id="status-filter"
                    value={statusFilter}
                    onChange={(event) => setStatusFilter(event.target.value as "" | TaskStatus)}
                    className="flex h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 shadow-inner shadow-slate-950/40 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                  >
                    <option value="">All</option>
                    <option value="todo">To Do</option>
                    <option value="in-progress">In Progress</option>
                    <option value="done">Done</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="priority-filter">Priority</Label>
                  <select
                    id="priority-filter"
                    value={priorityFilter}
                    onChange={(event) => setPriorityFilter(event.target.value as "" | "low" | "medium" | "high")}
                    className="flex h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 shadow-inner shadow-slate-950/40 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                  >
                    <option value="">All</option>
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignee-filter">Assignee</Label>
                  <select
                    id="assignee-filter"
                    value={assigneeFilter}
                    onChange={(event) => setAssigneeFilter(event.target.value)}
                    className="flex h-11 w-full rounded-xl border border-slate-700 bg-slate-950/70 px-3 py-2 text-sm text-slate-50 shadow-inner shadow-slate-950/40 outline-none focus-visible:ring-2 focus-visible:ring-sky-500/30"
                  >
                    <option value="">All</option>
                    {members.map((member) => (
                      <option key={member._id} value={member._id}>
                        {member.name || member.email || "Unknown"}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {error ? (
          <div className="mb-4 rounded-xl border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </div>
        ) : null}

        {dragError ? (
          <div className="mb-4 rounded-xl border border-orange-500/30 bg-orange-500/10 px-4 py-3 text-sm text-orange-200">
            {dragError}
          </div>
        ) : null}

        {!loading && tasks.length === 0 ? (
          <Card className="mb-6 border-dashed border-slate-700 bg-slate-900/70">
            <CardContent className="text-center text-slate-300">
              <p className="text-lg font-semibold text-white">No matching tasks</p>
              <p className="mt-2 text-sm text-slate-400">Try adjusting your search or filters to find tasks.</p>
            </CardContent>
          </Card>
        ) : null}

        <DndContext sensors={sensors} onDragStart={handleDragStart} onDragEnd={handleDragEnd}>
          <div className="grid gap-4 md:grid-cols-3">
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
