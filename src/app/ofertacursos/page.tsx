"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { api } from "@/services/api";

// ===============================
// TIPAGEM DO RETORNO DA API
// ===============================

type OfertaType = {
  id: string;
  tema: string;

  especificacao?: string | null;

  data_inicio: string;
  data_fim: string;

  hora_inicio: string;
  hora_fim: string;

  imagem_url?: string | null;

  localAula: {
    polo: string;
  } | null;

  link_inscricao?: string | null;

  detentoras?: {
    curso?: {
      banner?: string | null;
      nome_curso?: string | null;
    };
  };
};

// ===============================
// URL BASE DAS IMAGENS
// ===============================

const URL_BASE = "https://gestaom.com";

// ===============================
// MONTAR URL DA IMAGEM
// ===============================

function montarUrlImagem(
  imagem?: string | null
): string {
  if (!imagem) {
    return "";
  }

  let valor = imagem.trim();

  if (!valor) {
    return "";
  }

  // Remove aspas caso tenham sido salvas junto com o caminho
  valor = valor.replace(/^["']|["']$/g, "");

  // =====================================================
  // CORRIGIR URLs ANTIGAS COM LOCALHOST
  // =====================================================

  if (valor.startsWith("http://localhost:3000")) {
    valor = valor.replace(
      "http://localhost:3000",
      URL_BASE
    );
  }

  if (valor.startsWith("http://192.168.15.84:3000")) {
    valor = valor.replace(
      "http://192.168.15.84:3000",
      URL_BASE
    );
  }

  // =====================================================
  // URL HTTPS COMPLETA
  // =====================================================

  if (valor.startsWith("https://")) {
    return valor;
  }

  // =====================================================
  // URL HTTP
  // Converte para HTTPS
  // =====================================================

  if (valor.startsWith("http://")) {
    return valor.replace(
      /^http:\/\//,
      "https://"
    );
  }

  // =====================================================
  // CAMINHO RELATIVO
  // Exemplo:
  // /uploads/cronogramas/imagem.jpg
  // =====================================================

  if (valor.startsWith("/")) {
    return `${URL_BASE}${valor}`;
  }

  // =====================================================
  // CAMINHO SEM /
  // Exemplo:
  // uploads/cronogramas/imagem.jpg
  // =====================================================

  return `${URL_BASE}/${valor}`;
}

// ===============================
// FORMATAR DATA
// ===============================

function formatarData(
  data?: string
): string {
  if (!data) {
    return "";
  }

  const valor = data.trim();

  // ===============================
  // YYYY-MM-DD
  // ===============================

  if (
    /^\d{4}-\d{2}-\d{2}/.test(valor)
  ) {
    const [ano, mes, dia] =
      valor
        .substring(0, 10)
        .split("-");

    return `${dia}/${mes}/${ano}`;
  }

  // ===============================
  // DD/MM/YYYY
  // ===============================

  if (
    /^\d{2}\/\d{2}\/\d{4}$/.test(valor)
  ) {
    return valor;
  }

  return valor;
}

// ===============================
// FORMATAR HORA
// ===============================

function formatarHora(
  hora?: string
): string {
  if (!hora) {
    return "";
  }

  return hora.substring(0, 5);
}

// ===============================
// PÁGINA
// ===============================

export default function OfertaCursoPage() {
  const [ofertas, setOfertas] =
    useState<OfertaType[]>([]);

  const [loading, setLoading] =
    useState(true);

  // ===============================
  // CARREGAR OFERTAS
  // ===============================

  useEffect(() => {
    const carregar = async () => {
      try {
        const resposta =
          await api.get<OfertaType[]>(
            "/ofertacursos"
          );

        console.log(
          "OFERTAS API:",
          resposta.data
        );

        setOfertas(
          Array.isArray(resposta.data)
            ? resposta.data
            : []
        );
      } catch (error) {
        console.error(
          "Erro ao carregar ofertas:",
          error
        );

        setOfertas([]);
      } finally {
        setLoading(false);
      }
    };

    carregar();
  }, []);

  // ===============================
  // CARREGANDO
  // ===============================

  if (loading) {
    return (
      <div className="flex justify-center items-center py-20">
        <p className="text-gray-600">
          Carregando ofertas...
        </p>
      </div>
    );
  }

  // ===============================
  // PÁGINA
  // ===============================

  return (
    <main className="container mx-auto px-4 py-8">
      {/* ===============================
          TÍTULO
      =============================== */}

      <h1 className="text-2xl font-bold mb-6">
        Ofertas de Cursos
      </h1>

      {/* ===============================
          NENHUMA OFERTA
      =============================== */}

      {ofertas.length === 0 && (
        <p className="text-gray-500">
          Nenhuma oferta encontrada.
        </p>
      )}

      {/* ===============================
          GRID
      =============================== */}

      <div
        className="
          grid
          grid-cols-1
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
          gap-5
        "
      >
        {ofertas.map((o) => {
          // ===============================
          // IMAGEM DO CRONOGRAMA
          // ===============================

          const imagemCronograma =
            montarUrlImagem(
              o.imagem_url
            );

          // ===============================
          // BANNER DO CURSO
          // ===============================

          const imagemBannerCurso =
            montarUrlImagem(
              o.detentoras?.curso?.banner
            );

          // ===============================
          // PRIORIDADE DA IMAGEM
          //
          // 1 - imagem_url do cronograma
          // 2 - banner do curso
          // ===============================

          const imagemFinal =
            imagemCronograma ||
            imagemBannerCurso;

          return (
            <div
              key={o.id}
              className="
                bg-white
                border
                border-gray-200
                rounded-xl
                overflow-hidden
                shadow-md
                hover:shadow-xl
                transition-all
                duration-300
                flex
                flex-col
              "
            >
              {/* ===============================
                  IMAGEM
              =============================== */}

              <div
                className="
                  relative
                  w-full
                  aspect-square
                  bg-gray-100
                "
              >
                {imagemFinal ? (
                  <Image
                    src={imagemFinal}
                    alt={
                      o.detentoras?.curso
                        ?.nome_curso ||
                      o.tema ||
                      "Imagem do curso"
                    }
                    fill
                    sizes="
                      (max-width: 640px) 100vw,
                      (max-width: 1024px) 50vw,
                      (max-width: 1280px) 33vw,
                      25vw
                    "
                    className="
                      object-cover
                    "
                    unoptimized
                  />
                ) : (
                  <div
                    className="
                      absolute
                      inset-0
                      flex
                      items-center
                      justify-center
                      bg-gray-200
                    "
                  >
                    <span className="text-sm text-gray-500">
                      Sem imagem disponível
                    </span>
                  </div>
                )}
              </div>

              {/* ===============================
                  CONTEÚDO
              =============================== */}

              <div className="p-4 flex flex-col flex-1">
                {/* ===============================
                    NOME DO CURSO
                =============================== */}

                {o.detentoras?.curso
                  ?.nome_curso && (
                  <p
                    className="
                      text-xs
                      font-bold
                      text-blue-600
                      uppercase
                      mb-1
                    "
                  >
                    {
                      o.detentoras.curso
                        .nome_curso
                    }
                  </p>
                )}

                {/* ===============================
                    TEMA
                =============================== */}

                <h2
                  className="
                    text-lg
                    font-bold
                    text-gray-800
                    leading-tight
                  "
                >
                  {o.tema}
                </h2>

                {/* ===============================
                    ESPECIFICAÇÃO
                =============================== */}

                {o.especificacao?.trim() && (
                  <div className="mt-3">
                    <p
                      className="
                        text-xs
                        font-semibold
                        text-gray-700
                        mb-1
                      "
                    >
                      Especificação
                    </p>

                    <p
                      className="
                        text-sm
                        text-gray-600
                        whitespace-pre-line
                        line-clamp-4
                      "
                    >
                      {o.especificacao}
                    </p>
                  </div>
                )}

                {/* ===============================
                    INFORMAÇÕES
                =============================== */}

                <div
                  className="
                    mt-4
                    space-y-1.5
                    text-sm
                    text-gray-600
                  "
                >
                  {/* DATA */}

                  <p>
                    <span className="font-semibold text-gray-700">
                      Data:
                    </span>{" "}
                    {formatarData(
                      o.data_inicio
                    )}{" "}
                    até{" "}
                    {formatarData(
                      o.data_fim
                    )}
                  </p>

                  {/* HORÁRIO */}

                  <p>
                    <span className="font-semibold text-gray-700">
                      Horário:
                    </span>{" "}
                    {formatarHora(
                      o.hora_inicio
                    )}{" "}
                    às{" "}
                    {formatarHora(
                      o.hora_fim
                    )}
                  </p>

                  {/* LOCAL */}

                  <p>
                    <span className="font-semibold text-gray-700">
                      Local:
                    </span>{" "}
                    {o.localAula?.polo ||
                      "Local não informado"}
                  </p>
                </div>

                {/* ===============================
                    BOTÃO
                =============================== */}

                {o.link_inscricao && (
                  <a
                    href={
                      o.link_inscricao
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      mt-auto
                      pt-4
                    "
                  >
                    <span
                      className="
                        block
                        w-full
                        text-center
                        bg-green-600
                        text-white
                        py-2.5
                        rounded-lg
                        font-semibold
                        hover:bg-green-700
                        transition
                      "
                    >
                      Fazer Inscrição
                    </span>
                  </a>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </main>
  );
}