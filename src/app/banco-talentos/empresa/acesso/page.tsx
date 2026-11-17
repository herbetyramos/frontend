
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { setCookie } from "nookies";
import { isAxiosError } from "axios";
import { bancoTalentosEmpresaApi } from "@/services/bancoTalentosEmpresaApi";

interface RespostaLogin {
  token: string;
  usuario: {
    id: string;
    nome: string;
    email: string;
  };
  empresa: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    status: string;
  };
}

export default function AcessoEmpresaPage() {
  const router = useRouter();

  const [email, setEmail] = useState("");
  const [senha, setSenha] = useState("");
  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");

  async function entrar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setCarregando(true);

    try {
      const resposta = await bancoTalentosEmpresaApi.post<RespostaLogin>(
        "/banco-talentos/empresas/login",
        {
          email: email.trim().toLowerCase(),
          senha,
        }
      );

      const dados = resposta.data;

      setCookie(
        undefined,
        "@nextauth.empresa.token",
        dados.token,
        {
          maxAge: 12 * 60 * 60,
          path: "/",
          sameSite: "lax",
          secure: process.env.NODE_ENV === "production",
        }
      );

      router.replace("/banco-talentos/empresa/painel");
    } catch (error: unknown) {
      let mensagem = "Não foi possível realizar o acesso.";

      if (isAxiosError<{ error?: string }>(error)) {
        mensagem = error.response?.data?.error || mensagem;
      }

      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  const estiloCampo =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  const estiloLabel =
    "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 py-10 dark:bg-gray-950">
      <div className="w-full max-w-md">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Banco de Talentos
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Acesso empresarial — GestãoM
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-8">
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Entrar na área empresarial
          </h2>

          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Informe o e-mail e a senha cadastrados pela empresa.
          </p>

          <form onSubmit={entrar} className="space-y-5">
            <div>
              <label className={estiloLabel}>
                E-mail
              </label>

              <input
                type="email"
                className={estiloCampo}
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="empresa@exemplo.com"
                autoComplete="username"
                required
              />
            </div>

            <div>
              <label className={estiloLabel}>
                Senha
              </label>

              <input
                type="password"
                className={estiloCampo}
                value={senha}
                onChange={(e) => setSenha(e.target.value)}
                autoComplete="current-password"
                required
              />
            </div>

            {erro && (
              <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                {erro}
              </div>
            )}

            <button
              type="submit"
              disabled={carregando}
              className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {carregando ? "Entrando..." : "Entrar"}
            </button>
          </form>

          <div className="mt-6 border-t border-gray-200 pt-5 text-center dark:border-gray-800">
            <p className="text-sm text-gray-600 dark:text-gray-400">
              Sua empresa ainda não possui cadastro?
            </p>

            <Link
              href="/banco-talentos/empresa/cadastro"
              className="mt-2 inline-block font-semibold text-blue-700 hover:underline dark:text-blue-400"
            >
              Cadastrar empresa
            </Link>
          </div>

          <div className="mt-5 text-center">
            <Link
              href="/banco-talentos"
              className="text-sm text-gray-500 hover:underline dark:text-gray-400"
            >
              Voltar ao Banco de Talentos
            </Link>
          </div>
        </div>
      </div>
    </main>
  );
}
