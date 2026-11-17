"use client";

import { useCallback, useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { destroyCookie } from "nookies";
import { isAxiosError } from "axios";
import { bancoTalentosEmpresaApi } from "@/services/bancoTalentosEmpresaApi";

interface DadosEmpresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
  representante: string;
  email: string;
  telefone: string;
  cidade: string | null;
  descricao: string | null;
  status: string;
}

interface DadosSessao {
  id: string;
  nome: string;
  email: string;
  empresa: DadosEmpresa;
}

export default function PainelEmpresaPage() {
  const router = useRouter();

  const [sessao, setSessao] = useState<DadosSessao | null>(null);
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  const sair = useCallback(() => {
    destroyCookie(undefined, "@nextauth.empresa.token", {
      path: "/",
    });

    router.replace("/banco-talentos/empresa/acesso");
  }, [router]);

  const carregarSessao = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await bancoTalentosEmpresaApi.get<DadosSessao>(
        "/banco-talentos/empresas/me"
      );

      setSessao(resposta.data);
    } catch (error: unknown) {
      if (isAxiosError(error)) {
        const status = error.response?.status;

        if (status === 401 || status === 403) {
          sair();
          return;
        }

        setErro(
          error.response?.data?.error ||
            "Não foi possível carregar os dados da empresa."
        );
      } else {
        setErro("Ocorreu um erro ao carregar o painel.");
      }
    } finally {
      setCarregando(false);
    }
  }, [sair]);

  useEffect(() => {
    void carregarSessao();
  }, [carregarSessao]);

  const empresa = sessao?.empresa;

  const estiloInformacao =
    "rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60";

  const estiloLabel =
    "mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400";

  const estiloValor =
    "break-words text-sm font-medium text-gray-900 dark:text-white";

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <p className="text-gray-600 dark:text-gray-400">
          Carregando painel empresarial...
        </p>
      </main>
    );
  }

  if (erro) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Não foi possível carregar o painel
          </h1>

          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {erro}
          </p>

          <button
            type="button"
            onClick={() => void carregarSessao()}
            className="mt-5 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Tentar novamente
          </button>

          <button
            type="button"
            onClick={sair}
            className="ml-2 rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Sair
          </button>
        </div>
      </main>
    );
  }

  if (!sessao || !empresa) {
    return null;
  }

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-5xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Banco de Talentos
            </h1>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Painel da empresa empregadora
            </p>
          </div>

          <button
            type="button"
            onClick={sair}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Sair
          </button>
        </header>

        <section className="mb-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bem-vindo(a),
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {sessao.nome}
          </h2>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {sessao.email}
          </p>
        </section>

        <section className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="mb-5 text-xl font-semibold text-gray-900 dark:text-white">
            Dados da empresa
          </h2>

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className={estiloInformacao}>
              <span className={estiloLabel}>Razão social</span>
              <p className={estiloValor}>{empresa.razaoSocial}</p>
            </div>

            <div className={estiloInformacao}>
              <span className={estiloLabel}>Nome fantasia</span>
              <p className={estiloValor}>
                {empresa.nomeFantasia || "Não informado"}
              </p>
            </div>

            <div className={estiloInformacao}>
              <span className={estiloLabel}>CNPJ</span>
              <p className={estiloValor}>{empresa.cnpj}</p>
            </div>

            <div className={estiloInformacao}>
              <span className={estiloLabel}>Representante</span>
              <p className={estiloValor}>{empresa.representante}</p>
            </div>

            <div className={estiloInformacao}>
              <span className={estiloLabel}>E-mail</span>
              <p className={estiloValor}>{empresa.email}</p>
            </div>

            <div className={estiloInformacao}>
              <span className={estiloLabel}>Telefone</span>
              <p className={estiloValor}>{empresa.telefone}</p>
            </div>

            <div className={estiloInformacao}>
              <span className={estiloLabel}>Cidade</span>
              <p className={estiloValor}>
                {empresa.cidade || "Não informada"}
              </p>
            </div>

            <div className={estiloInformacao}>
              <span className={estiloLabel}>Situação cadastral</span>
              <p className={estiloValor}>
                {empresa.status}
              </p>
            </div>
          </div>

          {empresa.descricao && (
            <div className={`${estiloInformacao} mt-4`}>
              <span className={estiloLabel}>Descrição da empresa</span>
              <p className={estiloValor}>{empresa.descricao}</p>
            </div>
          )}
        </section>

        <section className="mt-6 rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
            Área de oportunidades
          </h2>

          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
            O espaço para consultar talentos e publicar oportunidades
            de emprego será disponibilizado nesta área.
          </p>
        </section>

        <footer className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
          GestãoM — Banco de Talentos
        </footer>
      </div>
    </main>
  );
}
