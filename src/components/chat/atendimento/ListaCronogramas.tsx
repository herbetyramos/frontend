"use client";

import { useEffect, useState } from "react";

import { api } from "@/services/api";

interface Cronograma {
  id: string;
  codigo: number;
  tema: string;

  data_inicio: string;
  data_fim: string;

  hora_inicio?: string | null;
  hora_fim?: string | null;

  bloco_curso?: {
    bloco_Curso?: string;
  };

  localAula?: {
    polo?: string;
  };

  empresa?: {
    nome_empresa?: string;
  };

  quantidadeAlunos?: number;

  // Mantido como compatibilidade caso alguma resposta antiga ainda utilize este nome.
  quantidade_aluno?: number;
}

interface Props {
  bloco?: string | null;
  polo?: string | null;
  empresa?: string | null;
  data?: string | null;

  cronogramaSelecionado: string | null;

  onSelecionar(id: string): void;

  onMostrarConversas(): void;

  modoConversas: boolean;
}

const STORAGE_KEY = "cronogramaSelecionadoChat";

export default function ListaCronogramas({
  bloco,
  polo,
  empresa,
  data,
  cronogramaSelecionado,
  onSelecionar,
  onMostrarConversas,
  modoConversas,
}: Props) {
  const [cronogramas, setCronogramas] = useState<Cronograma[]>([]);
  const [carregando, setCarregando] = useState(false);

  // =========================================================
  // CRIAR DATA SEGURA
  // =========================================================

  function criarDataSegura(
    valor?: string | null
  ): Date | null {
    if (!valor) {
      return null;
    }

    const texto = String(valor).trim();

    if (!texto) {
      return null;
    }

    // =======================================================
    // FORMATO BRASILEIRO
    // DD/MM/YYYY
    // =======================================================

    const formatoBrasileiro = texto.match(
      /^(\d{2})\/(\d{2})\/(\d{4})$/
    );

    if (formatoBrasileiro) {
      const [, dia, mes, ano] = formatoBrasileiro;

      const dataLocal = new Date(
        Number(ano),
        Number(mes) - 1,
        Number(dia)
      );

      if (!Number.isNaN(dataLocal.getTime())) {
        return dataLocal;
      }
    }

    // =======================================================
    // FORMATO ISO
    //
    // YYYY-MM-DD
    // YYYY-MM-DDTHH:mm:ss
    // YYYY-MM-DDTHH:mm:ss.sssZ
    // YYYY-MM-DD HH:mm:ss
    // =======================================================

    const formatoISO = texto.match(
      /^(\d{4})-(\d{2})-(\d{2})/
    );

    if (formatoISO) {
      const [, ano, mes, dia] = formatoISO;

      const dataLocal = new Date(
        Number(ano),
        Number(mes) - 1,
        Number(dia)
      );

      if (!Number.isNaN(dataLocal.getTime())) {
        return dataLocal;
      }
    }

    // =======================================================
    // TENTATIVA FINAL
    // =======================================================

    const dataNormal = new Date(texto);

    if (!Number.isNaN(dataNormal.getTime())) {
      return dataNormal;
    }

    return null;
  }

  // =========================================================
  // FORMATAR DATA
  // DD/MM/YYYY
  // =========================================================

  function formatarData(
    valor?: string | null
  ): string {
    const data = criarDataSegura(valor);

    if (!data) {
      return "-";
    }

    const dia = String(
      data.getDate()
    ).padStart(2, "0");

    const mes = String(
      data.getMonth() + 1
    ).padStart(2, "0");

    const ano = data.getFullYear();

    return `${dia}/${mes}/${ano}`;
  }

  // =========================================================
  // OBTER HORA DE INÍCIO
  // =========================================================

  function obterHoraInicio(
    valor?: string | null
  ): number | null {
    if (!valor) {
      return null;
    }

    const texto = String(valor).trim();

    if (!texto) {
      return null;
    }

    const partes = texto.split(":");

    const hora = Number(partes[0]);

    if (
      Number.isNaN(hora) ||
      hora < 0 ||
      hora > 23
    ) {
      return null;
    }

    return hora;
  }

  // =========================================================
  // OBTER PERÍODO
  // =========================================================

  function obterPeriodo(
    hora?: string | null
  ): string | null {
    const horaInicio = obterHoraInicio(hora);

    if (horaInicio === null) {
      return null;
    }

    if (horaInicio < 12) {
      return "MANHÃ";
    }

    if (horaInicio < 18) {
      return "TARDE";
    }

    return "NOITE";
  }

  // =========================================================
  // RESTAURAR CRONOGRAMA SELECIONADO
  // =========================================================

  useEffect(() => {
    if (cronogramaSelecionado) {
      sessionStorage.setItem(
        STORAGE_KEY,
        cronogramaSelecionado
      );

      return;
    }

    const salvo =
      sessionStorage.getItem(STORAGE_KEY);

    if (salvo) {
      onSelecionar(salvo);
    }
  }, [
    cronogramaSelecionado,
    onSelecionar,
  ]);

  // =========================================================
  // SELECIONAR CRONOGRAMA
  // =========================================================

  function selecionarCronograma(
    id: string
  ) {
    sessionStorage.setItem(
      STORAGE_KEY,
      id
    );

    onSelecionar(id);
  }

  // =========================================================
  // CARREGAR CRONOGRAMAS
  // =========================================================

  useEffect(() => {
    async function carregarCronogramas() {
      try {
        setCarregando(true);

        const { data: resposta } =
          await api.get("/listcronograma");

        const lista: Cronograma[] =
          Array.isArray(resposta)
            ? resposta
            : Array.isArray(
                resposta?.cronogramas
              )
              ? resposta.cronogramas
              : [];

        let filtrados = lista;

        // =====================================================
        // FILTRO BLOCO
        // =====================================================

        if (bloco) {
          filtrados = filtrados.filter(
            (item) =>
              item.bloco_curso?.bloco_Curso ===
              bloco
          );
        }

        // =====================================================
        // FILTRO POLO
        // =====================================================

        if (polo) {
          filtrados = filtrados.filter(
            (item) =>
              item.localAula?.polo ===
              polo
          );
        }

        // =====================================================
        // FILTRO EMPRESA
        // =====================================================

        if (empresa) {
          filtrados = filtrados.filter(
            (item) =>
              item.empresa?.nome_empresa ===
              empresa
          );
        }

        // =====================================================
        // FILTRO DATA
        // =====================================================

        if (data) {
          filtrados = filtrados.filter(
            (item) => {
              if (!item.data_fim) {
                return false;
              }

              const dataObj =
                criarDataSegura(
                  item.data_fim
                );

              if (!dataObj) {
                return false;
              }

              const ano =
                dataObj.getFullYear();

              const mes = String(
                dataObj.getMonth() + 1
              ).padStart(2, "0");

              const dia = String(
                dataObj.getDate()
              ).padStart(2, "0");

              const dataItem =
                `${ano}-${mes}-${dia}`;

              return dataItem === data;
            }
          );
        }

        setCronogramas(filtrados);

        // =====================================================
        // RESTAURAR SELEÇÃO
        // =====================================================

        const salvo =
          sessionStorage.getItem(
            STORAGE_KEY
          );

        if (
          salvo &&
          filtrados.some(
            (item) => item.id === salvo
          )
        ) {
          onSelecionar(salvo);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar cronogramas:",
          error
        );

        setCronogramas([]);
      } finally {
        setCarregando(false);
      }
    }

    carregarCronogramas();
  }, [
    bloco,
    polo,
    empresa,
    data,
    onSelecionar,
  ]);

  // =========================================================
  // RENDER
  // =========================================================

  return (
    <div className="flex h-full flex-col">
      {/* =====================================================
          CABEÇALHO
      ====================================================== */}

      <div className="border-b bg-blue-600 p-3 text-white">
        <div className="flex items-center justify-between gap-2">
          <h2 className="text-lg font-bold">
            Cronogramas
          </h2>

          <button
            type="button"
            onClick={onMostrarConversas}
            className={`rounded-lg px-3 py-2 text-xs font-semibold transition ${
              modoConversas
                ? "bg-white text-blue-700"
                : "bg-blue-500 text-white hover:bg-blue-400"
            }`}
            title="Visualizar conversas iniciadas"
          >
            💬 Conversas
          </button>
        </div>
      </div>

      {/* =====================================================
          LISTA
      ====================================================== */}

      <div className="flex-1 overflow-y-auto">
        {/* ===================================================
            CARREGANDO
        ==================================================== */}

        {carregando && (
          <div className="p-4 text-center text-sm text-gray-500">
            Carregando cronogramas...
          </div>
        )}

        {/* ===================================================
            VAZIO
        ==================================================== */}

        {!carregando &&
          cronogramas.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              Nenhum cronograma encontrado.
            </div>
          )}

        {/* ===================================================
            CRONOGRAMAS
        ==================================================== */}

        {!carregando &&
          cronogramas.map((item) => {
            const selecionado =
              cronogramaSelecionado ===
              item.id;

            const periodo =
              obterPeriodo(
                item.hora_inicio
              );

            const quantidadeAlunos =
              typeof item.quantidadeAlunos ===
              "number"
                ? item.quantidadeAlunos
                : typeof item.quantidade_aluno ===
                    "number"
                  ? item.quantidade_aluno
                  : 0;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  selecionarCronograma(
                    item.id
                  )
                }
                className={`w-full border-b px-4 py-3 text-left transition hover:bg-gray-100 ${
                  selecionado
                    ? "bg-blue-50 ring-2 ring-inset ring-blue-500"
                    : "bg-white"
                }`}
              >
                {/* =========================================
                    TEMA
                ========================================== */}

                <div className="font-semibold text-gray-800">
                  📚 {item.tema}
                </div>

                {/* =========================================
                    BLOCO
                ========================================== */}

                {item.bloco_curso
                  ?.bloco_Curso && (
                  <div className="mt-1 text-sm text-gray-600">
                    🏢{" "}
                    {
                      item.bloco_curso
                        .bloco_Curso
                    }
                  </div>
                )}

                {/* =========================================
                    POLO
                ========================================== */}

                {item.localAula?.polo && (
                  <div className="text-sm text-gray-600">
                    📍{" "}
                    {item.localAula.polo}
                  </div>
                )}

                {/* =========================================
                    EMPRESA
                ========================================== */}

                {item.empresa
                  ?.nome_empresa && (
                  <div className="text-sm text-gray-600">
                    🏭{" "}
                    {
                      item.empresa
                        .nome_empresa
                    }
                  </div>
                )}

                {/* =========================================
                    DATA / PERÍODO / ALUNOS
                ========================================== */}

                <div className="mt-1 flex flex-wrap items-center gap-x-3 gap-y-1 text-sm text-gray-600">
                  {/* DATA */}

                  <span>
                    📅{" "}
                    {formatarData(
                      item.data_inicio
                    )}
                    {" até "}
                    {formatarData(
                      item.data_fim
                    )}
                  </span>

                  {/* PERÍODO */}

                  {periodo && (
                    <span className="font-medium">
                      🕐 {periodo}
                    </span>
                  )}

                  {/* ALUNOS */}

                  <span className="font-medium">
                    👥{" "}
                    {quantidadeAlunos}{" "}
                    {quantidadeAlunos === 1
                      ? "aluno"
                      : "alunos"}
                  </span>
                </div>
              </button>
            );
          })}
      </div>
    </div>
  );
}