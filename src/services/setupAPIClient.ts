import axios from "axios";
import { parseCookies } from "nookies";

export function setupAPIClient() {
  const  { "@nextauth.token": token } = parseCookies();

  const api = axios.create({
    baseURL: "http://localhost:3000",
  });

  if (token) {
    api.defaults.headers["authorization"] = `Bearer ${token}`;
  }

  return api;
}

export const api = setupAPIClient();
