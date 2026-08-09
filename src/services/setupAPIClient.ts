import axios from "axios";
import { parseCookies } from "nookies";

export function setupAPIClient() {
  const { "@nextauth.token": token } = parseCookies();

  const api = axios.create({
    baseURL:
      process.env.NEXT_PUBLIC_API_URL ||
      "http://192.168.15.84:3000",
    withCredentials: true,
  });

  if (token) {
    api.defaults.headers.common["Authorization"] = `Bearer ${token}`;
  }

  return api;
}

export const api = setupAPIClient();