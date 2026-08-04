import axios, { AxiosHeaders, type InternalAxiosRequestConfig } from "axios";

const api = axios.create({
  baseURL: process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api",
  headers: {
    Accept: "application/json",
    "Content-Type": "application/json",
  },
});

export const clearAuthTokens = () => {
  localStorage.removeItem("accessToken");
  localStorage.removeItem("refreshToken");
};

export const refreshAccessTokenRequest = async (): Promise<string> => {
  const refreshToken = localStorage.getItem("refreshToken");

  if (!refreshToken) {
    throw new Error("Missing refresh token");
  }

  const response = await axios.post(
    `${process.env.NEXT_PUBLIC_API_URL || "http://localhost:5000/api"}/auth/refresh-token`,
    { refreshToken }
  );

  const accessToken = response.data?.accessToken;

  if (!accessToken) {
    throw new Error("Refresh token response missing accessToken");
  }

  localStorage.setItem("accessToken", accessToken);

  return accessToken;
};

api.interceptors.request.use((config) => {
  if (typeof window !== "undefined") {
    const token = localStorage.getItem("accessToken");

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
  }

  return config;
});

api.interceptors.response.use(
  (response) => response,
  async (error) => {
    const originalRequest = error.config as InternalAxiosRequestConfig & { _retry?: boolean };

    if (error.response?.status === 401 && !originalRequest._retry) {
      originalRequest._retry = true;

      try {
        const newToken = await refreshAccessTokenRequest();
        const headers = AxiosHeaders.from(originalRequest.headers ?? {});
        headers.set("Authorization", `Bearer ${newToken}`);
        originalRequest.headers = headers;

        return api(originalRequest);
      } catch (refreshError) {
        clearAuthTokens();

        if (typeof window !== "undefined") {
          window.dispatchEvent(new Event("auth:logout"));
        }

        return Promise.reject(refreshError);
      }
    }

    return Promise.reject(error);
  }
);

export default api;