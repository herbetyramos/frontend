
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

    // -------------------------------------------------------
    // YYYY-MM-DD
    // Trata como data LOCAL para não voltar um dia
    // por causa do fuso horário.
    // -------------------------------------------------------

    const somenteData = texto.match(
      /^(\d{4})-(\d{2})-(\d{2})$/
    );

    if (somenteData) {
      const [, ano, mes, dia] = somenteData;

      const dataLocal = new Date(
        Number(ano),
        Number(mes) - 1,
        Number(dia)
      );

      if (!Number.isNaN(dataLocal.getTime())) {
        return dataLocal;
      }
    }

    // -------------------------------------------------------
    // Datas com horário
    // -------------------------------------------------------

    const dataNormal = new Date(texto);

    if (!Number.isNaN(dataNormal.getTime())) {
      return dataNormal;
    }

    return null;
  }

  // =========================================================
  // FORMATAR DATA
  // =========================================================

  function formatarData(
    valor?: string | null
  ): string {
    const data = criarDataSegura(valor);

    if (!data) {
      return "-";
    }

    return data.toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  }

  // =========================================================
  // OBTER HORA DE INÍCIO
 
  // 08:00 -> Manhã
  // 13:00 -> Tarde
  // 18:00 -> Noite
  

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

    // Aceita:
    // 08:00
    // 08:00:00
    // 2026-09-28T08:00:00
    // 2026-09-28 08:00:00

    const horario = texto.match(
      /(?:T|\s|^)(\d{2}):(\d{2})/
    );

    if (!horario) {
      return null;
    }

    const hora = Number(horario[1]);

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
  // IDENTIFICAR PERÍODO
  // =========================================================

  function obterPeriodo(
    horaInicio?: string | null
  ): string {
    const hora = obterHoraInicio(horaInicio);

    if (hora === null) {
      return "-";
    }

    // 08:00 até 12:59
    if (hora >= 8 && hora < 13) {
      return "Manhã";
    }

    // 13:00 até 17:59
    if (hora >= 13 && hora < 18) {
      return "Tarde";
    }

    // 18:00 até 23:59
    if (hora >= 18 && hora < 24) {
      return "Noite";
    }

    return "-";
  }

  // =========================================================
  // RECUPERAR CRONOGRAMA FOCADO
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

  function selecionarCronograma(id: string) {
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
              item.localAula?.polo === polo
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
        // RESTAURAR FOCO
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
  // TELA
  // =========================================================

  return (
    <div className="flex h-full flex-col">

      {/* =====================================================
          CABEÇALHO
          ===================================================== */}

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
          ===================================================== */}

      <div className="flex-1 overflow-y-auto">

        {carregando && (
          <div className="p-4 text-center text-sm text-gray-500">
            Carregando cronogramas...
          </div>
        )}

        {!carregando &&
          cronogramas.length === 0 && (
            <div className="p-4 text-center text-sm text-gray-500">
              Nenhum cronograma encontrado.
            </div>
          )}

        {!carregando &&
          cronogramas.map((item) => {

            const selecionado =
              cronogramaSelecionado ===
              item.id;

            // =================================================
            // PERÍODO BASEADO NO hora_inicio
            // =================================================

            const periodo =
              obterPeriodo(
                item.hora_inicio
              );

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

                {/* =================================================
                    TEMA
                    ================================================= */}

                <div className="font-semibold text-gray-800">
                  📚 {item.tema}
                </div>

                {/* =================================================
                    BLOCO
                    ================================================= */}

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

                {/* =================================================
                    POLO
                    ================================================= */}

                {item.localAula?.polo && (
                  <div className="text-sm text-gray-600">
                    📍{" "}
                    {item.localAula.polo}
                  </div>
                )}

                {/* =================================================
                    EMPRESA
                    ================================================= */}

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

                {/* =================================================
                    DATA + PERÍODO + ALUNOS
                    ================================================= */}

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

                  {periodo !== "-" && (
                    <span className="font-bold ">
                     - {periodo}
                    </span>
                  )}

                  {/* ALUNOS */}
 

                  <span className="font-medium">
                    {" "}
                    {typeof item.quantidadeAlunos ===
                    "number"
                      ? item.quantidadeAlunos
                      : 0}{" "}
                    {item.quantidadeAlunos ===
                    1
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