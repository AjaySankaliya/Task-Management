import api from "@/lib/axios";

export type TaskInput = {
  title: string;
  description?: string;
  status?: "todo" | "in-progress" | "done";
  project?: string;
  assignee?: string;
};

export const createTask = async (data: TaskInput) => {
  const { data: response } = await api.post("/tasks", data);
  return response;
};

export const getTasks = async () => {
  const { data } = await api.get("/tasks");
  return data;
};

export const getTaskById = async (taskId: string) => {
  const { data } = await api.get(`/tasks/${taskId}`);
  return data;
};

export const updateTask = async (taskId: string, data: TaskInput) => {
  const { data: response } = await api.put(`/tasks/${taskId}`, data);
  return response;
};

export const deleteTask = async (taskId: string) => {
  const { data } = await api.delete(`/tasks/${taskId}`);
  return data;
};