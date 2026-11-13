import axios from "axios";
import { parseCookies } from "nookies";

export function setupBancoTalentosApi() {
  const baseURL = process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined" ? "/api" : "http://localhost:3000");
  const client = axios.create({ baseURL, withCredentials: true });
  client.interceptors.request.use((config) => {
    const cookies = parseCookies();
    const token = cookies["@nextauth.aluno.token"];
    if (token) config.headers.Authorization = `Bearer ${token}`;
    return config;
  });
  return client;
}

export const bancoTalentosApi = setupBancoTalentosApi();
