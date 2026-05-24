import axios from "axios";
import { clearToken, getToken } from "../state/authStorage";
import { captureApiFailure } from "./monitoring";

export const api = axios.create({
  baseURL: import.meta.env.VITE_API_BASE_URL ?? "http://localhost:8080"
});

api.interceptors.request.use((config) => {
  const token = getToken();
  if (token) {
    config.headers = config.headers ?? {};
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error?.response?.status === 401) {
      clearToken();
    }
    captureApiFailure(error, {
      method: error?.config?.method,
      url: error?.config?.url,
      status: error?.response?.status
    });
    return Promise.reject(error);
  }
);
