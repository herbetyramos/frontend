
"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import {
  Search,
  FileText,
  RefreshCw,
  ClipboardList,
} from "lucide-react";
import { toast } from "react-toastify";
import { Capacitor } from "@capacitor/core";
import { Browser } from "@capacitor/browser";

interface CronogramaType {
  id: string;
  tema: string;
  data_fim: string;
  professor: {
    nome_professor: string;
  } | null;
  formatura: {
    id: string;
    data_formatura: string;
    local: string;
  } | null;
  lista_presenca_url?: string | null;
  listaPresencaUrl?: string | null;
}

const API_BASE_URL = (
  process.env.NEXT_PUBLIC_API_URL || "http://192.168.15.84:3000"
)
  .replace(/\/api\/?$/, "")
  .replace(/\/$/, "");

function formatarData(data?: string | null): string {
  if (!data) return "—";

  const parteData = data.split("T")[0];
  const iso = parteData.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (iso) {
    return `${iso[3]}/${iso[2]}/${iso[1]}`;
  }

  return parteData;
}

function obterUrlPdf(curso: CronogramaType): string | null {
  const caminho =
    curso.lista_presenca_url || curso.listaPresencaUrl;

  if (!caminho?.trim()) return null;

  if (/^https?:\/\//i.test(caminho)) {
    return caminho;
  }

  return `${API_BASE_URL}/${caminho.replace(/^\/+/, "")}`;
}

export default function ListaPresencaPage() {
  const [cursos, setCursos] = useState<CronogramaType[]>([]);
  const [busca, setBusca] = useState("");
  const [filtroFormatura, setFiltroFormatura] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState(false);

  const carregarCursos = useCallback(async () => {
    setCarregando(true);
    setErro(false);

    try {
      const resposta = await api.get<CronogramaType[]>(
        "/listcronograma"
      );

      setCursos(resposta.data);
    } catch (error) {
      console.error("Erro ao carregar cursos:", error);
      setErro(true);
      toast.error("Não foi possível carregar os cursos.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarCursos();
  }, [carregarCursos]);

  const formaturas = useMemo(() => {
    const datas = cursos
      .map((curso) => curso.formatura?.data_formatura)
      .filter((data): data is string => Boolean(data));

    return [...new Set(datas)].sort();
  }, [cursos]);

  const cursosFiltrados = useMemo(() => {
    const texto = busca.trim().toLocaleLowerCase("pt-BR");

    return cursos
      .filter((curso) => {
        if (
          filtroFormatura &&
          curso.formatura?.data_formatura !== filtroFormatura
        ) {
          return false;
        }

        if (!texto) return true;

        const tema =
          curso.tema?.toLocaleLowerCase("pt-BR") ?? "";

        const professor =
          curso.professor?.nome_professor?.toLocaleLowerCase("pt-BR") ?? "";

        return (
          tema.includes(texto) ||
          professor.includes(texto)
        );
      })
      .sort((a, b) =>
        a.tema.localeCompare(b.tema, "pt-BR")
      );
  }, [cursos, busca, filtroFormatura]);

  // ABRIR PDF - DESKTOP E CAPACITOR
  const abrirPdf = async (curso: CronogramaType) => {
    const url = obterUrlPdf(curso);

    if (!url) {
      toast.info(
        "Este curso ainda não possui lista de presença."
      );
      return;
    }

    try {
      if (Capacitor.isNativePlatform()) {
        await Browser.open({
          url,
        });
      } else {
        window.open(
          url,
          "_blank",
          "noopener,noreferrer"
        );
      }
    } catch (error) {
      console.error("Erro ao abrir PDF:", error);
      toast.error("Não foi possível abrir o PDF.");
    }
  };

  return (
    <main className="min-h-screen w-full overflow-x-hidden bg-white p-3 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:p-5">

      <div className="mx-auto w-full max-w-7xl space-y-5">

        {/* CABEÇALHO */}
        <header className="flex flex-wrap items-center justify-between gap-3">

          <div className="flex items-center gap-3">

            <div className="flex h-11 w-11 items-center justify-center rounded-xl bg-green-100 text-green-700 dark:bg-green-950 dark:text-green-300">
              <ClipboardList size={25} />
            </div>

            <div>
              <h1 className="text-xl font-bold sm:text-2xl">
                Cursos e listas de presença
              </h1>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Consulte os cursos e visualize os PDFs.
              </p>
            </div>

          </div>

          <button
            type="button"
            onClick={() => void carregarCursos()}
            disabled={carregando}
            className="flex items-center gap-2 rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-50 dark:border-gray-700 dark:hover:bg-gray-800"
          >
            <RefreshCw
              size={16}
              className={carregando ? "animate-spin" : ""}
            />
            Atualizar
          </button>

        </header>

        {/* FILTROS */}
        <section className="grid grid-cols-1 gap-3 sm:grid-cols-2">

          <div className="min-w-0">

            <label
              htmlFor="filtro-formatura"
              className="mb-1 block text-sm font-semibold"
            >
              Formatura
            </label>

            <select
              id="filtro-formatura"
              value={filtroFormatura}
              onChange={(event) =>
                setFiltroFormatura(event.target.value)
              }
              className="h-11 w-full rounded-lg border border-gray-300 bg-white px-3 text-sm text-gray-900 outline-none focus:border-green-600 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100"
            >
              <option value="">
                Todas as formaturas
              </option>

              {formaturas.map((data) => (
                <option key={data} value={data}>
                  {formatarData(data)}
                </option>
              ))}

            </select>

          </div>

          <div className="min-w-0">

            <label
              htmlFor="busca-curso"
              className="mb-1 block text-sm font-semibold"
            >
              Buscar tema ou professor
            </label>

            <div className="flex h-11 items-center gap-2 rounded-lg border border-gray-300 bg-white px-3 focus-within:border-green-600 dark:border-gray-700 dark:bg-gray-800">

              <Search
                size={18}
                className="shrink-0 text-gray-500 dark:text-gray-400"
              />

              <input
                id="busca-curso"
                type="search"
                value={busca}
                onChange={(event) =>
                  setBusca(event.target.value)
                }
                placeholder="Digite o tema ou professor..."
                className="w-full min-w-0 bg-transparent text-sm text-gray-900 outline-none placeholder:text-gray-500 dark:text-gray-100 dark:placeholder:text-gray-400"
              />

            </div>

          </div>

        </section>

        {/* LISTAGEM */}
        <section className="overflow-hidden rounded-xl border border-gray-200 dark:border-gray-800">

          <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 px-4 py-3 dark:border-gray-800 dark:bg-gray-900">

            <h2 className="font-semibold">
              Cursos encontrados
            </h2>

            <span className="rounded-full bg-green-100 px-3 py-1 text-sm font-bold text-green-800 dark:bg-green-950 dark:text-green-300">
              {cursosFiltrados.length}
            </span>

          </div>

          {carregando ? (

            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              Carregando cursos...
            </div>

          ) : erro ? (

            <div className="space-y-3 p-8 text-center">

              <p className="text-red-600 dark:text-red-400">
                Erro ao carregar a lista de cursos.
              </p>

              <button
                type="button"
                onClick={() => void carregarCursos()}
                className="rounded-lg bg-green-600 px-4 py-2 text-white hover:bg-green-700"
              >
                Tentar novamente
              </button>

            </div>

          ) : cursosFiltrados.length === 0 ? (

            <div className="p-8 text-center text-gray-600 dark:text-gray-400">
              Nenhum curso encontrado com os filtros selecionados.
            </div>

          ) : (

            <>
              {/* DESKTOP */}
              <div className="hidden w-full overflow-x-auto sm:block">

                <table className="w-full min-w-650px table-fixed text-left text-sm">

                  <thead className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">

                    <tr>
                      <th className="w-[38%] px-4 py-3 font-semibold">
                        Tema
                      </th>

                      <th className="w-[30%] px-4 py-3 font-semibold">
                        Professor
                      </th>

                      <th className="w-[20%] px-4 py-3 font-semibold">
                        Data fim
                      </th>

                      <th className="w-[12%] px-4 py-3 text-center font-semibold">
                        Lista
                      </th>
                    </tr>

                  </thead>

                  <tbody className="divide-y divide-gray-200 dark:divide-gray-800">

                    {cursosFiltrados.map((curso) => {

                      const pdfDisponivel = Boolean(
                        obterUrlPdf(curso)
                      );

                      return (
                        <tr
                          key={curso.id}
                          className="hover:bg-gray-50 dark:hover:bg-gray-900"
                        >

                          <td className=".break-words {overflow-wrap: break-word;} px-4 py-3 font-medium uppercase">
                            {curso.tema || "Sem tema"}
                          </td>

                          <td className=".break-words {overflow-wrap: break-word;} px-4 py-3">
                            {curso.professor?.nome_professor || "Não informado"}
                          </td>

                          <td className="whitespace-nowrap px-4 py-3">
                            {formatarData(curso.data_fim)}
                          </td>

                          <td className="px-4 py-3 text-center">

                            <button
                              type="button"
                              onClick={() => void abrirPdf(curso)}
                              disabled={!pdfDisponivel}
                              title="Visualizar lista de presença em PDF"
                              aria-label={`Visualizar lista de presença: ${curso.tema}`}
                              className={`inline-flex rounded-lg p-2 transition-colors ${
                                pdfDisponivel
                                  ? "text-green-700 hover:bg-green-100 dark:text-green-400 dark:hover:bg-green-950"
                                  : "cursor-not-allowed text-gray-400 dark:text-gray-600"
                              }`}
                            >
                              <FileText size={21} />
                            </button>

                          </td>

                        </tr>
                      );

                    })}

                  </tbody>

                </table>

              </div>

              {/* CELULAR */}
              <div className="space-y-2 p-2 sm:hidden">

                {cursosFiltrados.map((curso) => {

                  const pdfDisponivel = Boolean(
                    obterUrlPdf(curso)
                  );

                  return (
                    <article
                      key={curso.id}
                      className="rounded-lg border border-gray-200 bg-white px-3 py-2 shadow-sm dark:border-gray-800 dark:bg-gray-900"
                    >

                      {/* TEMA */}
                      <h3 className=".break-words {overflow-wrap: break-word;} text-sm font-bold uppercase leading-snug text-gray-900 dark:text-gray-100">
                        {curso.tema || "Sem tema"}
                      </h3>

                      {/* PROFESSOR, DATA E PDF */}
                      <div className="mt-1.5 grid grid-cols-2 items-start gap-2">

                        <p className="min-w-0 .break-words {overflow-wrap: break-word;} text-xs text-gray-700 dark:text-gray-300">
                          {curso.professor?.nome_professor || "Não informado"}
                        </p>

                        <div className="text-center">

                          <p className="text-xs text-gray-700 dark:text-gray-300">
                            {formatarData(curso.data_fim)}
                          </p>

                          {/* ÍCONE PDF ABAIXO DA DATA */}
                          <button
                            type="button"
                            onClick={() => void abrirPdf(curso)}
                            disabled={!pdfDisponivel}
                            title={
                              pdfDisponivel
                                ? "Visualizar lista de presença"
                                : "Lista de presença não cadastrada"
                            }
                            aria-label={`Visualizar lista de presença: ${curso.tema}`}
                            className={`mt-1 inline-flex items-center justify-center rounded-md p-1.5 transition-colors ${
                              pdfDisponivel
                                ? "bg-green-50 text-green-700 active:bg-green-100 dark:bg-green-950 dark:text-green-400 dark:active:bg-green-900"
                                : "cursor-not-allowed text-gray-400 dark:text-gray-600"
                            }`}
                          >
                            <FileText size={19} />
                          </button>

                        </div>

                      </div>

                    </article>
                  );

                })}

              </div>
            </>

          )}

        </section>

      </div>

    </main>
  );
}
