import api from "@/lib/axios";

export type RegisterInput = {
  name: string;
  email: string;
  password: string;
};

export type LoginInput = {
  email: string;
  password: string;
};

export type User = {
  id: string;
  name: string;
  email: string;
};

export type AuthResponse = {
  success: boolean;
  message?: string;
  accessToken?: string;
  refreshToken?: string;
  user?: User;
};

export const registerUser = async (data: RegisterInput) => {
  const { data: response } = await api.post("/auth/register", data);
  return response;
};

export const loginUser = async (data: LoginInput): Promise<AuthResponse> => {
  const { data: response } = await api.post<AuthResponse>("/auth/login", data);
  return response;
};

export const getMe = async () => {
  const { data } = await api.get("/auth/me");
  return data;
};

export const logoutUser = async () => {
  const { data } = await api.post("/auth/logout");
  return data;
};

export const getUsers = async () => {
  const { data } = await api.get("/auth");
  return data;
};