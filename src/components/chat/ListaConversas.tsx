"use client";

import {
  useCallback,
  useEffect,
  useMemo,
  useState,
} from "react";

import { api } from "@/services/api";
import { socket } from "@/services/socket";

interface Conversa {
  id: string;
  nome?: string;
  telefone: string;
  aluno_id?: string;
  ultimaMensagem?: string;
  ultimaData?: string;
  status:
    | "AGUARDANDO_ATENDIMENTO"
    | "EM_ATENDIMENTO"
    | "FINALIZADO";
  naoLidas: number;
}

interface Aluno {
  id: string;
  nome: string;
  telefone: string;
}

interface RespostaCriarConversa {
  id?: string;
  conversa?: {
    id?: string;
  } | null;
  data?: {
    id?: string;
  } | null;
}

type FiltroStatus =
  | "TODAS"
  | "AGUARDANDO_ATENDIMENTO"
  | "EM_ATENDIMENTO"
  | "FINALIZADO";

interface Props {
  cronogramaId: string | null;
  conversaSelecionada: string | null;
  onSelecionar(id: string): void;
}

export default function ListaConversas({
  cronogramaId,
  conversaSelecionada,
  onSelecionar,
}: Props) {
  const [conversas, setConversas] =
    useState<Conversa[]>([]);

  const [alunos, setAlunos] =
    useState<Aluno[]>([]);

  const [loading, setLoading] =
    useState(false);

  const [busca, setBusca] =
    useState("");

  const [filtroStatus, setFiltroStatus] =
    useState<FiltroStatus>("TODAS");

  // =====================================================
  // CARREGAR CONVERSAS
  // =====================================================

  const carregarConversas =
    useCallback(async () => {
      try {
        const { data } =
          await api.get("/chat");

        const lista: Conversa[] =
          Array.isArray(data)
            ? data
            : [];

        setConversas(lista);
      } catch (error) {
        console.error(
          "Erro ao carregar conversas:",
          error
        );
      }
    }, []);

  // =====================================================
  // CARREGAR ALUNOS DO CRONOGRAMA
  // =====================================================

  const carregarAlunos =
    useCallback(async () => {
      if (!cronogramaId) {
        setAlunos([]);
        return;
      }

      try {
        setLoading(true);

        console.log(
          "📚 Carregando alunos do cronograma:",
          cronogramaId
        );

        const { data } =
          await api.get(
            `/chat/cronograma/${cronogramaId}`
          );

        console.log(
          "👨‍🎓 Alunos recebidos:",
          data
        );

        setAlunos(
          Array.isArray(data?.alunos)
            ? data.alunos
            : []
        );
      } catch (error) {
        console.error(
          "Erro ao carregar alunos:",
          error
        );

        setAlunos([]);
      } finally {
        setLoading(false);
      }
    }, [cronogramaId]);

  // =====================================================
  // RECARREGAR CONVERSAS PELO SOCKET
  // =====================================================

  const recarregarConversasPorSocket =
    useCallback(() => {
      console.log(
        "🔄 ListaConversas: atualizando conversas pelo Socket.IO"
      );

      void carregarConversas();
    }, [carregarConversas]);

  // =====================================================
  // CARREGAMENTO INICIAL
  // =====================================================

  useEffect(() => {
    void carregarConversas();
  }, [carregarConversas]);

  useEffect(() => {
    void carregarAlunos();
  }, [carregarAlunos]);

  // =====================================================
  // SOCKET
  // =====================================================

  useEffect(() => {
    socket.on(
      "atualizarConversas",
      recarregarConversasPorSocket
    );

    socket.on(
      "conversaAtualizada",
      recarregarConversasPorSocket
    );

    socket.on(
      "novaMensagem",
      recarregarConversasPorSocket
    );

    socket.on(
      "mensagemAtualizada",
      recarregarConversasPorSocket
    );

    socket.on(
      "statusConversaAtualizado",
      recarregarConversasPorSocket
    );

    return () => {
      socket.off(
        "atualizarConversas",
        recarregarConversasPorSocket
      );

      socket.off(
        "conversaAtualizada",
        recarregarConversasPorSocket
      );

      socket.off(
        "novaMensagem",
        recarregarConversasPorSocket
      );

      socket.off(
        "mensagemAtualizada",
        recarregarConversasPorSocket
      );

      socket.off(
        "statusConversaAtualizado",
        recarregarConversasPorSocket
      );
    };
  }, [
    recarregarConversasPorSocket,
  ]);

  // =====================================================
  // SELECIONAR ALUNO
  // =====================================================

  async function selecionarAluno(
    aluno: Aluno
  ) {
    try {
      setLoading(true);

      console.log(
        "👤 Aluno selecionado:",
        aluno
      );

      const { data } =
        await api.post<RespostaCriarConversa>(
          "/chat",
          {
            telefone: aluno.telefone,
            nome: aluno.nome,
            aluno_id: aluno.id,
          }
        );

      console.log(
        "💬 Resposta do POST /chat:",
        data
      );

      const idConversa =
        data.id ??
        data.conversa?.id ??
        data.data?.id;

      if (!idConversa) {
        console.error(
          "❌ O backend não retornou o ID da conversa:",
          data
        );

        alert(
          "Não foi possível abrir a conversa. O servidor não retornou o ID da conversa."
        );

        return;
      }

      console.log(
        "✅ Conversa selecionada:",
        idConversa
      );

      await carregarConversas();

      onSelecionar(idConversa);
    } catch (error: unknown) {
      console.error(
        "❌ Erro ao abrir conversa:",
        error
      );

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const erroComResposta =
          error as {
            response?: {
              data?: {
                message?: string;
              };
            };
          };

        console.error(
          "Resposta do servidor:",
          erroComResposta.response?.data
        );

        alert(
          erroComResposta.response?.data
            ?.message ||
            "Não foi possível abrir a conversa."
        );

        return;
      }

      alert(
        "Não foi possível abrir a conversa."
      );
    } finally {
      setLoading(false);
    }
  }

  // =====================================================
  // NORMALIZAR TELEFONE
  // =====================================================

  const normalizarTelefone =
    useCallback(
      (telefone: string) => {
        return telefone.replace(
          /\D/g,
          ""
        );
      },
      []
    );

  // =====================================================
  // ENCONTRAR CONVERSA DO ALUNO
  // =====================================================

  const obterConversaDoAluno =
    useCallback(
      (
        aluno: Aluno
      ): Conversa | undefined => {
        const telefoneAluno =
          normalizarTelefone(
            aluno.telefone
          );

        return conversas.find(
          (conversa) => {
            if (
              conversa.aluno_id &&
              conversa.aluno_id ===
                aluno.id
            ) {
              return true;
            }

            if (!conversa.telefone) {
              return false;
            }

            return (
              normalizarTelefone(
                conversa.telefone
              ) === telefoneAluno
            );
          }
        );
      },
      [
        conversas,
        normalizarTelefone,
      ]
    );

  // =====================================================
  // QUANTIDADE POR STATUS
  // =====================================================

  const quantidadeAguardando =
    useMemo(() => {
      return conversas.filter(
        (item) =>
          item.status ===
          "AGUARDANDO_ATENDIMENTO"
      ).length;
    }, [conversas]);

  const quantidadeEmAtendimento =
    useMemo(() => {
      return conversas.filter(
        (item) =>
          item.status ===
          "EM_ATENDIMENTO"
      ).length;
    }, [conversas]);

  const quantidadeFinalizado =
    useMemo(() => {
      return conversas.filter(
        (item) =>
          item.status ===
          "FINALIZADO"
      ).length;
    }, [conversas]);

  // =====================================================
  // FILTRAR CONVERSAS
  // =====================================================

  const conversasFiltradas =
    useMemo(() => {
      let resultado =
        conversas;

      if (
        filtroStatus !== "TODAS"
      ) {
        resultado =
          resultado.filter(
            (item) =>
              item.status ===
              filtroStatus
          );
      }

      if (!busca.trim()) {
        return resultado;
      }

      const texto =
        busca
          .toLowerCase()
          .trim();

      return resultado.filter(
        (item) => {
          return (
            item.nome
              ?.toLowerCase()
              .includes(texto) ||
            item.telefone.includes(
              texto
            )
          );
        }
      );
    }, [
      busca,
      conversas,
      filtroStatus,
    ]);

  // =====================================================
  // FILTRAR ALUNOS
  // =====================================================

  const alunosFiltrados =
    useMemo(() => {
      if (!busca.trim()) {
        return alunos;
      }

      const texto =
        busca
          .toLowerCase()
          .trim();

      return alunos.filter(
        (item) => {
          return (
            item.nome
              .toLowerCase()
              .includes(texto) ||
            item.telefone.includes(
              texto
            )
          );
        }
      );
    }, [busca, alunos]);

  // =====================================================
  // FORMATAR HORA
  // =====================================================

  function formatarHora(
    data?: string
  ) {
    if (!data) {
      return "";
    }

    const dataFormatada =
      new Date(data);

    if (
      Number.isNaN(
        dataFormatada.getTime()
      )
    ) {
      return "";
    }

    return dataFormatada.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  // =====================================================
  // AVATAR
  // =====================================================

  function avatar(
    nome?: string
  ) {
    if (!nome) {
      return "?";
    }

    return nome
      .charAt(0)
      .toUpperCase();
  }

  // =====================================================
  // STATUS
  // =====================================================

  function obterStatus(
    status: Conversa["status"]
  ) {
    switch (status) {
      case "AGUARDANDO_ATENDIMENTO":
        return {
          texto:
            "Aguardando atendimento",
          classe:
            "text-yellow-600",
        };

      case "EM_ATENDIMENTO":
        return {
          texto:
            "Em atendimento",
          classe:
            "text-blue-600",
        };

      case "FINALIZADO":
        return {
          texto:
            "Finalizado",
          classe:
            "text-gray-500",
        };

      default:
        return {
          texto:
            "Aguardando atendimento",
          classe:
            "text-yellow-600",
        };
    }
  }

  // =====================================================
  // BOTÃO DE FILTRO
  // =====================================================

  function botaoFiltro(
    filtro: FiltroStatus,
    texto: string,
    quantidade: number
  ) {
    const ativo =
      filtroStatus === filtro;

    return (
      <button
        type="button"
        onClick={() =>
          setFiltroStatus(filtro)
        }
        className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold transition ${
          ativo
            ? "bg-green-600 text-white"
            : "bg-gray-100 text-gray-600 hover:bg-gray-200"
        }`}
      >
        <div>{texto}</div>

        <div
          className={`mt-0.5 text-[11px] ${
            ativo
              ? "text-white"
              : "text-gray-400"
          }`}
        >
          {quantidade}
        </div>
      </button>
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="w-80 border-r bg-white flex flex-col">

      {/* =================================================
          CABEÇALHO VERDE
      ================================================= */}

      <div className="p-4 border-b bg-green-600 text-white">

        <h2 className="text-xl font-bold">
          {cronogramaId
            ? "Alunos"
            : "Conversas"}
        </h2>

        <input
          type="text"
          placeholder="Pesquisar..."
          value={busca}
          onChange={(e) =>
            setBusca(e.target.value)
          }
          className="mt-3 w-full rounded-lg border px-3 py-2 text-black outline-none"
        />

        {!cronogramaId && (
          <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-white p-1">

            {botaoFiltro(
              "TODAS",
              "Todas",
              conversas.length
            )}

            {botaoFiltro(
              "AGUARDANDO_ATENDIMENTO",
              "Aguardando",
              quantidadeAguardando
            )}

            {botaoFiltro(
              "EM_ATENDIMENTO",
              "Em atendimento",
              quantidadeEmAtendimento
            )}

            {botaoFiltro(
              "FINALIZADO",
              "Finalizadas",
              quantidadeFinalizado
            )}

          </div>
        )}
      </div>

      {/* =================================================
          LISTA
      ================================================= */}

      <div className="flex-1 overflow-y-auto">

        {loading && (
          <div className="p-6 text-center text-gray-500">
            Carregando...
          </div>
        )}

        {!loading &&
          cronogramaId &&
          alunosFiltrados.length ===
            0 && (
            <div className="p-6 text-center text-gray-500">
              Nenhum aluno encontrado.
            </div>
          )}

        {!loading &&
          !cronogramaId &&
          conversasFiltradas.length ===
            0 && (
            <div className="p-6 text-center text-gray-500">
              Nenhuma conversa encontrada.
            </div>
          )}

        {/* =================================================
            ALUNOS DO CRONOGRAMA
        ================================================= */}

        {cronogramaId ? (
          alunosFiltrados.map(
            (aluno) => {
              const conversa =
                obterConversaDoAluno(
                  aluno
                );

              const selecionado =
                conversa?.id ===
                conversaSelecionada;

              const naoLidas =
                conversa?.naoLidas ?? 0;

              return (
                <button
                  key={aluno.id}
                  type="button"
                  onClick={() =>
                    selecionarAluno(
                      aluno
                    )
                  }
                  disabled={loading}
                  className={`w-full flex items-center gap-3 px-4 py-3 border-b hover:bg-gray-100 disabled:opacity-50 disabled:cursor-wait ${
                    selecionado
                      ? "bg-green-50"
                      : ""
                  }`}
                >

                  <div className="relative w-12 h-12 shrink-0 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">

                    {avatar(
                      aluno.nome
                    )}

                    {naoLidas > 0 && (
                      <span className="absolute -right-1 -top-1 min-w-5 h-5 px-1 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center border-2 border-white">
                        {naoLidas > 99
                          ? "99+"
                          : naoLidas}
                      </span>
                    )}

                  </div>

                  <div className="flex-1 min-w-0 text-left">

                    <div className="flex justify-between gap-2">

                      <div
                        className={`truncate ${
                          naoLidas > 0
                            ? "font-bold text-gray-900"
                            : "font-semibold"
                        }`}
                      >
                        {aluno.nome}
                      </div>

                      {conversa?.ultimaData && (
                        <div className="text-xs text-gray-400 whitespace-nowrap">
                          {formatarHora(
                            conversa.ultimaData
                          )}
                        </div>
                      )}

                    </div>

                    <div
                      className={`text-sm truncate ${
                        naoLidas > 0
                          ? "font-semibold text-gray-700"
                          : "text-gray-500"
                      }`}
                    >
                      {conversa?.ultimaMensagem ||
                        aluno.telefone}
                    </div>

                  </div>

                </button>
              );
            }
          )
        ) : (

          /* =================================================
             CONVERSAS
          ================================================= */

          conversasFiltradas.map(
            (item) => {
              const status =
                obterStatus(
                  item.status
                );

              return (
                <button
                  key={item.id}
                  type="button"
                  onClick={() =>
                    onSelecionar(
                      item.id
                    )
                  }
                  className={`w-full flex items-start gap-3 px-4 py-3 border-b hover:bg-gray-100 transition ${
                    conversaSelecionada ===
                    item.id
                      ? "bg-green-50"
                      : ""
                  }`}
                >

                  <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
                    {avatar(
                      item.nome
                    )}
                  </div>

                  <div className="flex-1 min-w-0">

                    <div className="flex justify-between gap-2">

                      <div
                        className={`truncate ${
                          item.naoLidas >
                          0
                            ? "font-bold text-gray-900"
                            : "font-semibold"
                        }`}
                      >
                        {item.nome ||
                          item.telefone}
                      </div>

                      <div className="text-xs text-gray-400 whitespace-nowrap">
                        {formatarHora(
                          item.ultimaData
                        )}
                      </div>

                    </div>

                    <div
                      className={`text-xs font-medium ${status.classe}`}
                    >
                      {status.texto}
                    </div>

                    <div className="flex items-center justify-between gap-2">

                      <div
                        className={`text-sm truncate ${
                          item.naoLidas >
                          0
                            ? "font-semibold text-gray-700"
                            : "text-gray-500"
                        }`}
                      >
                        {item.ultimaMensagem ||
                          "Sem mensagens"}
                      </div>

                      {item.naoLidas >
                        0 && (
                        <span className="min-w-5 h-5 px-1 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
                          {item.naoLidas >
                          99
                            ? "99+"
                            : item.naoLidas}
                        </span>
                      )}

                    </div>

                  </div>

                </button>
              );
            }
          )
        )}

      </div>
    </div>
  );
}