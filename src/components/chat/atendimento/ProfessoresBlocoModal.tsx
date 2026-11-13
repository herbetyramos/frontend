
"use client";

import { useEffect, useMemo, useState } from "react";

import { api } from "@/services/api";

interface Professor {
  id: string;
  nome: string;
  telefone: string;
}

interface ResultadoEnvio {
  professorId: string;
  nome: string;
  telefone: string;
  status: "ENVIADO" | "ERRO";
  mensagemErro?: string;
}

interface RespostaProfessores {
  total: number;
  professores: Professor[];
}

interface RespostaEnvio {
  total: number;
  enviados: number;
  falhas: number;
  resultados: ResultadoEnvio[];
}

interface Props {
  cronogramaId: string;
  onFechar: () => void;
}

export default function ProfessoresBlocoModal({
  cronogramaId,
  onFechar,
}: Props) {
  const [professores, setProfessores] = useState<Professor[]>([]);
  const [selecionados, setSelecionados] = useState<string[]>([]);
  const [texto, setTexto] = useState("");
  const [arquivo, setArquivo] = useState<File | null>(null);

  const [carregando, setCarregando] = useState(true);
  const [enviando, setEnviando] = useState(false);

  const [erro, setErro] = useState("");
  const [resultado, setResultado] = useState<RespostaEnvio | null>(null);

  const todosSelecionados = useMemo(
    () =>
      professores.length > 0 &&
      selecionados.length === professores.length,
    [professores, selecionados]
  );

  useEffect(() => {
    let ativo = true;

    async function carregarProfessores() {
      try {
        setCarregando(true);
        setErro("");

        const { data } = await api.get<RespostaProfessores>(
          `/chat/professores/cronograma/${cronogramaId}`
        );

        if (!ativo) return;

        const lista = Array.isArray(data?.professores)
          ? data.professores
          : [];

        setProfessores(lista);

        // Inicialmente, todos ficam selecionados.
        setSelecionados(lista.map((professor) => professor.id));
      } catch (error: unknown) {
        if (!ativo) return;

        console.error("Erro ao carregar professores:", error);

        setErro(
          "Não foi possível carregar os professores deste bloco."
        );
      } finally {
        if (ativo) {
          setCarregando(false);
        }
      }
    }

    carregarProfessores();

    return () => {
      ativo = false;
    };
  }, [cronogramaId]);

  function alternarProfessor(id: string) {
    setSelecionados((atual) =>
      atual.includes(id)
        ? atual.filter((item) => item !== id)
        : [...atual, id]
    );
  }

  function alternarTodos() {
    if (todosSelecionados) {
      setSelecionados([]);
    } else {
      setSelecionados(professores.map((professor) => professor.id));
    }
  }

  async function enviarMensagem() {
    setErro("");
    setResultado(null);

    if (selecionados.length === 0) {
      setErro("Selecione pelo menos um professor.");
      return;
    }

    if (!texto.trim() && !arquivo) {
      setErro("Digite uma mensagem ou selecione um arquivo.");
      return;
    }

    if (arquivo && arquivo.size > 10 * 1024 * 1024) {
      setErro("O arquivo não pode ultrapassar 10 MB.");
      return;
    }

    try {
      setEnviando(true);

      const formData = new FormData();

      formData.append("cronogramaId", cronogramaId);
      formData.append("professoresIds", JSON.stringify(selecionados));
      formData.append("texto", texto);

      if (arquivo) {
        formData.append("arquivo", arquivo);
      }

      const { data } = await api.post<RespostaEnvio>(
        "/chat/professores/enviar",
        formData
      );

      setResultado(data);
    } catch (error: unknown) {
      console.error("Erro ao enviar mensagens:", error);

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const resposta = error.response as {
          data?: { error?: string };
        };

        setErro(
          resposta.data?.error ||
            "Não foi possível enviar as mensagens."
        );
      } else {
        setErro("Não foi possível enviar as mensagens.");
      }
    } finally {
      setEnviando(false);
    }
  }

  return (
    <div className="fixed inset-0 z-100 flex items-center justify-center bg-black/60 p-3">
      <div className="flex max-h-[90vh] w-full max-w-2xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-2xl dark:border-gray-700 dark:bg-gray-900">

        {/* CABEÇALHO */}
        <div className="flex items-center justify-between border-b border-gray-200 bg-blue-600 p-4 text-white dark:border-gray-700">
          <div>
            <h2 className="text-lg font-bold">
              👨‍🏫 Professores do bloco
            </h2>

            <p className="text-sm text-blue-100">
              Envio individual pelo WhatsApp
            </p>
          </div>

          <button
            type="button"
            onClick={onFechar}
            disabled={enviando}
            className="rounded-lg px-3 py-2 text-xl hover:bg-blue-500 disabled:opacity-50"
            title="Fechar"
          >
            ×
          </button>
        </div>

        <div className="flex-1 space-y-4 overflow-y-auto p-4">

          {/* CARREGAMENTO */}
          {carregando && (
            <div className="py-8 text-center text-gray-500 dark:text-gray-400">
              Carregando professores...
            </div>
          )}

          {/* ERRO DE CONSULTA */}
          {!carregando && erro && professores.length === 0 && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {erro}
            </div>
          )}

          {/* LISTA DE PROFESSORES */}
          {!carregando && professores.length > 0 && (
            <div className="overflow-hidden rounded-lg border border-gray-200 dark:border-gray-700">

              <div className="flex items-center justify-between gap-3 border-b border-gray-200 bg-gray-50 p-3 dark:border-gray-700 dark:bg-gray-800">
                <label className="flex cursor-pointer items-center gap-2 text-sm font-semibold text-gray-800 dark:text-gray-100">
                  <input
                    type="checkbox"
                    checked={todosSelecionados}
                    onChange={alternarTodos}
                    className="h-4 w-4 accent-blue-600"
                  />

                  Selecionar todos
                </label>

                <span className="text-xs text-gray-500 dark:text-gray-400">
                  {selecionados.length} de {professores.length}
                </span>
              </div>

              <div className="max-h-52 divide-y divide-gray-100 overflow-y-auto dark:divide-gray-800">
                {professores.map((professor) => (
                  <label
                    key={professor.id}
                    className="flex cursor-pointer items-center gap-3 p-3 transition hover:bg-gray-50 dark:hover:bg-gray-800"
                  >
                    <input
                      type="checkbox"
                      checked={selecionados.includes(professor.id)}
                      onChange={() => alternarProfessor(professor.id)}
                      className="h-4 w-4 accent-blue-600"
                    />

                    <div className="min-w-0 flex-1">
                      <div className="truncate text-sm font-semibold text-gray-800 dark:text-gray-100">
                        {professor.nome}
                      </div>

                      <div className="text-xs text-gray-500 dark:text-gray-400">
                        {professor.telefone || "Telefone não cadastrado"}
                      </div>
                    </div>
                  </label>
                ))}
              </div>
            </div>
          )}

          {!carregando && professores.length === 0 && !erro && (
            <div className="rounded-lg bg-yellow-50 p-4 text-center text-sm text-yellow-800 dark:bg-yellow-950 dark:text-yellow-200">
              Nenhum professor encontrado para este bloco.
            </div>
          )}

          {/* MENSAGEM */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100">
              Mensagem
            </label>

            <textarea
              value={texto}
              onChange={(event) => setTexto(event.target.value)}
              rows={4}
              placeholder="Digite a mensagem que será enviada aos professores..."
              disabled={enviando}
              className="w-full resize-y rounded-lg border border-gray-300 bg-white p-3 text-sm text-gray-900 outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200 disabled:opacity-60 dark:border-gray-700 dark:bg-gray-800 dark:text-gray-100 dark:focus:ring-blue-900"
            />
          </div>

          {/* ARQUIVO */}
          <div>
            <label className="mb-2 block text-sm font-semibold text-gray-800 dark:text-gray-100">
              Arquivo opcional
            </label>

            <input
              type="file"
              disabled={enviando}
              onChange={(event) => {
                const selecionado = event.target.files?.[0] || null;
                setArquivo(selecionado);
              }}
              className="block w-full text-sm text-gray-600 file:mr-3 file:rounded-lg file:border-0 file:bg-blue-600 file:px-4 file:py-2 file:font-semibold file:text-white hover:file:bg-blue-700 dark:text-gray-300"
            />

            {arquivo && (
              <div className="mt-2 flex items-center justify-between gap-2 rounded-lg bg-gray-100 p-2 text-sm dark:bg-gray-800">
                <span className="truncate text-gray-700 dark:text-gray-200">
                  📎 {arquivo.name}
                </span>

                <button
                  type="button"
                  disabled={enviando}
                  onClick={() => setArquivo(null)}
                  className="shrink-0 font-semibold text-red-600 hover:text-red-700"
                >
                  Remover
                </button>
              </div>
            )}

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              Limite de 10 MB. O mesmo arquivo será enviado individualmente a cada professor.
            </p>
          </div>

          {/* ERRO */}
          {erro && (
            <div className="rounded-lg bg-red-50 p-3 text-sm text-red-700 dark:bg-red-950 dark:text-red-300">
              {erro}
            </div>
          )}

          {/* RESULTADO */}
          {resultado && (
            <div className="space-y-3 rounded-lg border border-gray-200 p-3 dark:border-gray-700">
              <h3 className="font-bold text-gray-800 dark:text-gray-100">
                Resultado dos envios
              </h3>

              <div className="flex flex-wrap gap-2 text-sm">
                <span className="rounded-lg bg-gray-100 px-3 py-2 text-gray-800 dark:bg-gray-800 dark:text-gray-200">
                  Total: {resultado.total}
                </span>

                <span className="rounded-lg bg-green-100 px-3 py-2 font-semibold text-green-800 dark:bg-green-950 dark:text-green-300">
                  Enviados: {resultado.enviados}
                </span>

                <span className="rounded-lg bg-red-100 px-3 py-2 font-semibold text-red-800 dark:bg-red-950 dark:text-red-300">
                  Falhas: {resultado.falhas}
                </span>
              </div>

              <div className="max-h-48 space-y-2 overflow-y-auto">
                {resultado.resultados.map((item) => (
                  <div
                    key={item.professorId}
                    className="flex items-start justify-between gap-3 rounded-lg bg-gray-50 p-2 dark:bg-gray-800"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-gray-800 dark:text-gray-100">
                        {item.nome}
                      </p>

                      {item.mensagemErro && (
                        <p className="mt-1 text-xs text-red-600 dark:text-red-400">
                          {item.mensagemErro}
                        </p>
                      )}
                    </div>

                    <span
                      className={`shrink-0 text-xs font-bold ${
                        item.status === "ENVIADO"
                          ? "text-green-600 dark:text-green-400"
                          : "text-red-600 dark:text-red-400"
                      }`}
                    >
                      {item.status === "ENVIADO" ? "✓ Enviado" : "✕ Erro"}
                    </span>
                  </div>
                ))}
              </div>
            </div>
          )}
        </div>

        {/* RODAPÉ */}
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
          <button
            type="button"
            onClick={onFechar}
            disabled={enviando}
            className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700"
          >
            Fechar
          </button>

          <button
            type="button"
            onClick={enviarMensagem}
            disabled={
              carregando ||
              enviando ||
              professores.length === 0 ||
              !!resultado
            }
            className="rounded-lg bg-green-600 px-5 py-2.5 text-sm font-bold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
          >
            {enviando
              ? "Enviando..."
              : `Enviar para ${selecionados.length} professor(es)`}
          </button>
        </div>
      </div>
    </div>
  );
}
