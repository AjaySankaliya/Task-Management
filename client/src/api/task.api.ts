import api from "@/lib/axios";

export type TaskInput = {
  title: string;
  description?: string;
  status?: "todo" | "in-progress" | "done";
  priority?: "low" | "medium" | "high";
  dueDate?: string | null;
  project: string;
  assignee: string;
};

export type Task = {
  _id: string;
  title: string;
  description?: string;
  status?: string;
  priority?: string;
  dueDate?: string | null;
  project?: { _id?: string; title?: string } | string;
  assignee?: { _id?: string; name?: string; email?: string } | string;
  createdAt?: string;
  updatedAt?: string;
};

export const createTask = async (data: TaskInput) => {
  const { data: response } = await api.post(`/tasks`, data);
  return response;
};

export const getTasks = async (params?: Record<string, any>) => {
  const { data } = await api.get(`/tasks`, { params });
  return data;
};

export const getTaskById = async (taskId: string) => {
  const { data } = await api.get(`/tasks/${taskId}`);
  return data;
};

export const updateTask = async (taskId: string, data: Partial<TaskInput>) => {
  const { data: response } = await api.put(`/tasks/${taskId}`, data);
  return response;
};

export const deleteTask = async (taskId: string) => {
  const { data } = await api.delete(`/tasks/${taskId}`);
  return data;
};

export const updateTaskStatus = async (taskId: string, status: string) => {
  const { data } = await api.patch(`/tasks/${taskId}/status`, { status });
  return data;
};