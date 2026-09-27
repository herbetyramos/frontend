"use client";

import { useEffect, useState } from "react";

import { api } from "@/services/api";

interface Cronograma {
  id: string;
  codigo: number;
  tema: string;

  data_inicio: string;
  data_fim: string;

  bloco_curso?: {
    bloco_Curso?: string;
  };

  localAula?: {
    polo?: string;
  };

  empresa?: {
    nome_empresa?: string;
  };

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
  // CARREGAR CRONOGRAMAS
  // =========================================================

  useEffect(() => {
    async function carregarCronogramas() {
      try {
        setCarregando(true);

        const { data: resposta } = await api.get(
          "/listcronograma"
        );

        const lista: Cronograma[] = Array.isArray(resposta)
          ? resposta
          : Array.isArray(resposta?.cronogramas)
            ? resposta.cronogramas
            : [];

        let filtrados = lista;

        // -----------------------------------------------------
        // FILTRO BLOCO
        // -----------------------------------------------------

        if (bloco) {
          filtrados = filtrados.filter(
            (item) =>
              item.bloco_curso?.bloco_Curso === bloco
          );
        }

        // -----------------------------------------------------
        // FILTRO POLO
        // -----------------------------------------------------

        if (polo) {
          filtrados = filtrados.filter(
            (item) =>
              item.localAula?.polo === polo
          );
        }

        // -----------------------------------------------------
        // FILTRO EMPRESA
        // -----------------------------------------------------

        if (empresa) {
          filtrados = filtrados.filter(
            (item) =>
              item.empresa?.nome_empresa === empresa
          );
        }

        // -----------------------------------------------------
        // FILTRO DATA
        // -----------------------------------------------------

        if (data) {
          filtrados = filtrados.filter((item) => {
            if (!item.data_fim) {
              return false;
            }

            const dataItem = new Date(item.data_fim)
              .toISOString()
              .split("T")[0];

            return dataItem === data;
          });
        }

        setCronogramas(filtrados);
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
  }, [bloco, polo, empresa, data]);

  // =========================================================
  // FORMATAR DATA
  // =========================================================

  function formatarData(valor?: string) {
    if (!valor) {
      return "-";
    }

    try {
      return new Date(valor).toLocaleDateString(
        "pt-BR"
      );
    } catch {
      return "-";
    }
  }

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
              cronogramaSelecionado === item.id;

            return (
              <button
                key={item.id}
                type="button"
                onClick={() =>
                  onSelecionar(item.id)
                }
                className={`w-full border-b px-4 py-3 text-left transition hover:bg-gray-100 ${
                  selecionado
                    ? "bg-blue-50"
                    : "bg-white"
                }`}
              >

                {/* Tema */}

                <div className="font-semibold text-gray-800">
                  📚 {item.tema}
                </div>

                {/* Bloco */}

                {item.bloco_curso?.bloco_Curso && (
                  <div className="mt-1 text-sm text-gray-600">
                    🏢{" "}
                    {item.bloco_curso.bloco_Curso}
                  </div>
                )}

                {/* Polo */}

                {item.localAula?.polo && (
                  <div className="text-sm text-gray-600">
                    📍 {item.localAula.polo}
                  </div>
                )}

                {/* Empresa */}

                {item.empresa?.nome_empresa && (
                  <div className="text-sm text-gray-600">
                    🏭{" "}
                    {item.empresa.nome_empresa}
                  </div>
                )}

                {/* Data */}

                <div className="mt-1 text-sm text-gray-600">
                  📅{" "}
                  {formatarData(item.data_inicio)}
                  {" até "}
                  {formatarData(item.data_fim)}
                </div>

                {/* Quantidade de alunos */}

                {typeof item.quantidade_aluno ===
                  "number" && (
                  <div className="mt-1 text-sm font-medium text-gray-600">
                    👥{" "}
                    {item.quantidade_aluno}{" "}
                    {item.quantidade_aluno === 1
                      ? "aluno"
                      : "alunos"}
                  </div>
                )}

              </button>
            );
          })}

      </div>

    </div>
  );
}