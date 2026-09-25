import axios, { AxiosError } from "axios";
import { parseCookies, destroyCookie } from "nookies";
import { AuthTokenError } from "./errors/AuthTokenError";

export function signOutGlobal() {
  destroyCookie(undefined, "@nextauth.token");

  if (typeof window !== "undefined") {
    window.location.href = "/";
  }
}

export function setupAPIClient(
  ctx?: Parameters<typeof parseCookies>[0]
) {
  /**
   * Em produção:
   *   usa /api através do Nginx
   *
   * Em desenvolvimento:
   *   usa NEXT_PUBLIC_API_URL, se definida
   *   caso contrário, usa localhost:3000
   */
  const baseURL =
    process.env.NEXT_PUBLIC_API_URL ||
    (typeof window !== "undefined"
      ? "/api"
      : "http://localhost:3000");

  const api = axios.create({
    baseURL,
    withCredentials: true,
  });

  api.interceptors.request.use((config) => {
    const cookies = parseCookies(ctx);
    const token = cookies["@nextauth.token"];

    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }

    return config;
  });

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (typeof window !== "undefined") {
          signOutGlobal();
        } else {
          return Promise.reject(new AuthTokenError());
        }
      }

      return Promise.reject(error);
    }
  );

  return api;
}

export const api = setupAPIClient();
