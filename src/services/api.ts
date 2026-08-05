// src/services/api.ts
import axios, { AxiosError } from "axios";
import { parseCookies, destroyCookie } from "nookies";
import Router from "next/router"; // aqui pode usar next/router porque api roda no client

import { AuthTokenError } from "./errors/AuthTokenError";

export function signOutGlobal() {
  destroyCookie(undefined, "@nextauth.token");
  Router.push("/"); // força ir para login
}

export function setupAPIClient(ctx = undefined) {
  const cookies = parseCookies(ctx);
 const api = axios.create({
  baseURL: "http://192.168.15.84:3000",
  headers: {
    Authorization: `Bearer ${cookies["@nextauth.token"] || ""}`,
  },
  withCredentials: true,
});

  api.interceptors.response.use(
    (response) => response,
    (error: AxiosError) => {
      if (error.response?.status === 401) {
        if (typeof window !== "undefined") {
          signOutGlobal(); // usa a função global
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
