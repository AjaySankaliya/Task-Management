import api from "@/lib/axios";

export type ProjectInput = {
  name: string;
  description?: string;
};

export const createProject = async (data: ProjectInput) => {
  const { data: response } = await api.post("/projects", data);
  return response;
};

export const getProjects = async () => {
  const { data } = await api.get("/projects");
  return data;
};

export const getProjectById = async (projectId: string) => {
  const { data } = await api.get(`/projects/${projectId}`);
  return data;
};

export const updateProject = async (projectId: string, data: ProjectInput) => {
  const { data: response } = await api.put(`/projects/${projectId}`, data);
  return response;
};

export const deleteProject = async (projectId: string) => {
  const { data } = await api.delete(`/projects/${projectId}`);
  return data;
};