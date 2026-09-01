
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

  // Campo de especificação do cronograma
  especificacao?: string | null;

  data_inicio: string;
  data_fim: string;
  hora_inicio: string;
  hora_fim: string;

  // Imagem cadastrada no cronograma
  imagem_url?: string | null;

  localAula: {
    polo: string;
  } | null;

  link_inscricao?: string | null;

  detentoras?: {
    curso?: {
      banner?: string;
      nome_curso?: string;
    };
  };
};

// ===============================
// FUNÇÃO PARA MONTAR URL DA IMAGEM
// ===============================

function montarUrlImagem(imagem?: string | null) {
  if (!imagem) {
    return "";
  }

  // Remove espaços
  const valor = imagem.trim();

  if (!valor) {
    return "";
  }

  // Se já for uma URL completa
  if (
    valor.startsWith("http://") ||
    valor.startsWith("https://")
  ) {
    return valor;
  }

  // Se já começar com /files/
  if (valor.startsWith("/files/")) {
    return `http://localhost:3000${valor}`;
  }

  // Se começar com /uploads/
  if (valor.startsWith("/uploads/")) {
    return `http://localhost:3000${valor}`;
  }

  // Caso o backend tenha retornado apenas o nome do arquivo
  return `http://localhost:3000/files/${valor}`;
}

// ===============================
// FORMATAR DATA
// ===============================

function formatarData(data?: string) {
  if (!data) {
    return "";
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(data)) {
    const [ano, mes, dia] =
      data.substring(0, 10).split("-");

    return `${dia}/${mes}/${ano}`;
  }

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    return data;
  }

  return data;
}

// ===============================
// FORMATAR HORA
// ===============================

function formatarHora(hora?: string) {
  if (!hora) {
    return "";
  }

  return hora.substring(0, 5);
}

// ===============================
// PÁGINA
// ===============================

export default function OfertaCursoPage() {
  const [ofertas, setOfertas] = useState<
    OfertaType[]
  >([]);

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

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ofertas.map((o) => {
          // ===============================
          // IMAGEM
          // ===============================

          const imagem = montarUrlImagem(
            o.imagem_url
          );

          // ===============================
          // BANNER ANTIGO
          // Usado somente como fallback
          // ===============================

          const bannerCurso =
            o.detentoras?.curso?.banner;

          const imagemBannerCurso =
            bannerCurso
              ? montarUrlImagem(
                  bannerCurso
                )
              : "";

          // ===============================
          // IMAGEM FINAL
          // Prioridade:
          // 1 - imagem_url do cronograma
          // 2 - banner do curso
          // ===============================

          const imagemFinal =
            imagem || imagemBannerCurso;

          return (
            <div
              key={o.id}
              className="
                bg-white
                shadow-lg
                rounded-xl
                overflow-hidden
                transition
                hover:shadow-2xl
                hover:-translate-y-1
                duration-300
                border
                border-gray-200
              "
            >
              {/* ===============================
                  IMAGEM DO CURSO
              =============================== */}

              {imagemFinal ? (
                <div className="relative w-full h-64 bg-gray-100">
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
                      (max-width: 768px) 100vw,
                      50vw
                    "
                    className="object-cover"
                    unoptimized
                  />
                </div>
              ) : (
                <div
                  className="
                    w-full
                    h-64
                    bg-gray-200
                    flex
                    items-center
                    justify-center
                  "
                >
                  <span className="text-gray-500">
                    Sem imagem disponível
                  </span>
                </div>
              )}

              {/* ===============================
                  CONTEÚDO
              =============================== */}

              <div className="p-5">

                {/* ===============================
                    NOME DO CURSO
                =============================== */}

                {o.detentoras?.curso
                  ?.nome_curso && (
                  <p
                    className="
                      text-sm
                      font-semibold
                      text-blue-600
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
                    text-xl
                    font-bold
                    text-gray-800
                  "
                >
                  {o.tema}
                </h2>

                {/* ===============================
                    ESPECIFICAÇÃO
                =============================== */}

                <div className="mt-3">
                  <p
                    className="
                      text-sm
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
                    "
                  >
                    {o.especificacao?.trim()
                      ? o.especificacao
                      : "Nenhuma especificação informada."}
                  </p>
                </div>

                {/* ===============================
                    DATAS
                =============================== */}

                <div className="mt-4 space-y-2 text-sm">

                  <p>
                    <span
                      className="
                        font-semibold
                        text-gray-700
                      "
                    >
                      Período:
                    </span>{" "}
                    {formatarData(
                      o.data_inicio
                    )}{" "}
                    •{" "}
                    {formatarData(
                      o.data_fim
                    )}
                  </p>

                  {/* ===============================
                      HORÁRIO
                  =============================== */}

                  <p>
                    <span
                      className="
                        font-semibold
                        text-gray-700
                      "
                    >
                      Horário:
                    </span>{" "}
                    {formatarHora(
                      o.hora_inicio
                    )}{" "}
                    •{" "}
                    {formatarHora(
                      o.hora_fim
                    )}
                  </p>

                  {/* ===============================
                      LOCAL
                  =============================== */}

                  <p>
                    <span
                      className="
                        font-semibold
                        text-gray-700
                      "
                    >
                      Local:
                    </span>{" "}
                    {o.localAula?.polo ??
                      "Local não informado"}
                  </p>

                </div>

                {/* ===============================
                    BOTÃO INSCRIÇÃO
                =============================== */}

                {o.link_inscricao && (
                  <a
                    href={
                      o.link_inscricao
                    }
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      mt-5
                      w-full
                      inline-block
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

