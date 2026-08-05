"use client";

import {
  createContext,
  ReactNode,
  useState,
  useEffect,
  useCallback,
} from "react";
import { setCookie, destroyCookie, parseCookies } from "nookies";
import { useRouter } from "next/navigation";
import { api } from "../services/setupAPIClient";

type UserProps = {
  id: string;
  name: string;
  email: string;
};

type SignInProps = {
  email: string;
  password: string;
};

type SignUpProps = {
  name: string;
  email: string;
  password: string;
};

type AuthContextData = {
  user: UserProps | null;
  isAuthenticated: boolean;
  signIn: (data: SignInProps) => Promise<void>;
  signUp: (data: SignUpProps) => Promise<void>;
  signOut: () => void;
};

type AuthProviderProps = {
  children: ReactNode;
};

export const AuthContext = createContext({} as AuthContextData);

export function AuthProvider({ children }: AuthProviderProps) {
  const [user, setUser] = useState<UserProps | null>(null);
  const isAuthenticated = !!user;
  const router = useRouter();

  // 🔹 Logout
  const signOut = useCallback(() => {
    destroyCookie(undefined, "@nextauth.token");
    setUser(null);
    router.push("/login");
  }, [router]);

  // 🔹 Carregar usuário se já tem token
  useEffect(() => {
    const { "@nextauth.token": token } = parseCookies();

    if (token) {
      api
        .get("/me")
        .then((response) => {
          const { id, name, email } = response.data;
          setUser({ id, name, email });
        })
        .catch(() => signOut());
    }
  }, [signOut]);

  // 🔹 Login
  async function signIn({ email, password }: SignInProps) {
    try {
      const response = await api.post("/session", { email, password });

      const { token, id, name, email: userEmail } = response.data;

      setCookie(undefined, "@nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      setUser({
        id,
        name,
        email: userEmail,
      });

      router.push("/");
      router.refresh();

    } catch (err) {
      console.log("Erro ao logar:", err);
    }
  }

  // 🔹 CADASTRO
  async function signUp({ name, email, password }: SignUpProps) {
    try {
      const response = await api.post("/users", {
        name,
        email,
        password,
      });

      // Backend retorna o token? Se sim, segue abaixo
      const { token, id, email: userEmail } = response.data;

      setCookie(undefined, "@nextauth.token", token, {
        maxAge: 60 * 60 * 24 * 30,
        path: "/",
      });

      setUser({
        id,
        name,
        email: userEmail,
      });

      router.push("/");
      router.refresh();

    } catch (err) {
      console.log("Erro ao cadastrar:", err);
    }
  }

  return (
    <AuthContext.Provider value={{ user, isAuthenticated, signIn, signUp, signOut }}>
      {children}
    </AuthContext.Provider>
  );
}
