"use client";

import { useEffect, useState } from "react";
import Image from "next/image";

import { api } from "@/services/api";

// ======================================================
// TIPAGEM
// ======================================================

type OfertaType = {
  id: string;
  tema: string;
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
    };
  };
};

// ======================================================
// URL BASE DO SITE
// ======================================================

function obterBaseBackend(): string {
  const apiUrl =
    process.env.NEXT_PUBLIC_API_URL ||
    "http://192.168.15.84:3000";

  return apiUrl
    .replace(/\/api\/?$/, "")
    .replace(/\/$/, "");
}

// ======================================================
// MONTAR URL DA IMAGEM
// ======================================================

function montarUrlImagem(imagem?: string | null): string {
  if (!imagem) {
    return "";
  }

  let valor = imagem.trim();

  if (!valor) {
    return "";
  }

  const baseBackend = obterBaseBackend();

  // URLs antigas gravadas no banco
  valor = valor
    .replace("http://localhost:3000", baseBackend)
    .replace("http://192.168.15.84:3000", baseBackend)
    .replace("http://127.0.0.1:3000", baseBackend);

  // URL absoluta
  if (
    valor.startsWith("https://") ||
    valor.startsWith("http://")
  ) {
    return valor;
  }

  // Caminho absoluto
  if (valor.startsWith("/")) {
    return `${baseBackend}${valor}`;
  }

  // Caminho relativo
  if (
    valor.startsWith("files/") ||
    valor.startsWith("uploads/")
  ) {
    return `${baseBackend}/${valor}`;
  }

  // Somente nome do arquivo
  return `${baseBackend}/files/${valor}`;
}

// ======================================================
// FORMATAR DATA
// ======================================================

function formatarData(data?: string): string {
  if (!data) {
    return "";
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(data)) {
    const partes = data.substring(0, 10).split("-");

    const ano = partes[0];
    const mes = partes[1];
    const dia = partes[2];

    return `${dia}/${mes}/${ano}`;
  }

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    return data;
  }

  return data;
}

// ======================================================
// FORMATAR HORA
// ======================================================

function formatarHora(hora?: string): string {
  if (!hora) {
    return "";
  }

  return hora.substring(0, 5);
}

// ======================================================
// PÁGINA
// ======================================================

export default function OfertaCursoPage() {
  const [ofertas, setOfertas] = useState<OfertaType[]>([]);
  const [loading, setLoading] = useState(true);
  const [localSelecionado, setLocalSelecionado] =
    useState("TODOS");

  // ====================================================
  // CARREGAR OFERTAS
  // ====================================================

  useEffect(() => {
    const carregar = async () => {
      try {
        const resposta =
          await api.get<OfertaType[]>("/ofertacursos");

        console.log("OFERTAS API:", resposta.data);

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

  // ====================================================
  // LOCAIS DISPONÍVEIS
  // ====================================================

  const locais = Array.from(
    new Set(
      ofertas
        .map((oferta) =>
          oferta.localAula?.polo?.trim()
        )
        .filter(
          (local): local is string =>
            Boolean(local)
        )
    )
  ).sort((a, b) =>
    a.localeCompare(b, "pt-BR")
  );

  // ====================================================
  // FILTRAR POR LOCAL
  // ====================================================

  const ofertasFiltradas =
    localSelecionado === "TODOS"
      ? ofertas
      : ofertas.filter(
          (oferta) =>
            oferta.localAula?.polo?.trim() ===
            localSelecionado
        );

  // ====================================================
  // CARREGANDO
  // ====================================================

  if (loading) {
    return (
      <main className="min-h-screen bg-gray-50 p-6">
        <div className="flex items-center justify-center py-20">
          <p className="text-lg text-gray-500">
            Carregando ofertas...
          </p>
        </div>
      </main>
    );
  }

  // ====================================================
  // PÁGINA
  // ====================================================

  return (
    <main className="min-h-screen bg-gray-50 p-6">
      {/* ==================================================
          TÍTULO E FILTRO
      ================================================== */}

      <div className="mb-6 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
       
       <div className="w-full sm:w-72">
          <label
            htmlFor="filtro-local"
            className="mb-1 block text-sm font-semibold text-gray-700"
          >
            Onde quer fazer o curso?
          </label>

          <select
            id="filtro-local"
            value={localSelecionado}
            onChange={(event) =>
              setLocalSelecionado(event.target.value)
            }
            className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-sm text-gray-700 shadow-sm outline-none focus:border-blue-500 focus:ring-2 focus:ring-blue-200"
          >
            <option value="TODOS">
              Todos os locais
            </option>

            {locais.map((local) => (
              <option
                key={local}
                value={local}
              >
                {local}
              </option>
            ))}
          </select>
        </div>
       
        <div>  
          <p className="mt-1 text-sm text-gray-500">
            {ofertasFiltradas.length} oferta
            {ofertasFiltradas.length === 1
              ? ""
              : "s"}{" "}
            encontrada
            {ofertasFiltradas.length === 1
              ? ""
              : "s"}
          </p>
        </div>

        
      </div>

      {/* ==================================================
          NENHUMA OFERTA
      ================================================== */}

      {ofertasFiltradas.length === 0 && (
        <p className="text-gray-500">
          {ofertas.length === 0
            ? "Nenhuma oferta encontrada."
            : "Nenhuma oferta encontrada para o local selecionado."}
        </p>
      )}

      {/* ==================================================
          GRID
      ================================================== */}

      <div
        className="
          grid
          grid-cols-1
          gap-5
          sm:grid-cols-2
          lg:grid-cols-3
          xl:grid-cols-4
        "
      >
        {ofertasFiltradas.map((o) => {
          // ==================================================
          // IMAGEM DO CRONOGRAMA
          // ==================================================

          const imagemCronograma =
            montarUrlImagem(o.imagem_url);

          // ==================================================
          // BANNER DO CURSO
          // ==================================================

          const imagemBanner =
            montarUrlImagem(
              o.detentoras?.curso?.banner
            );

          // ==================================================
          // IMAGEM FINAL
          // ==================================================

          const imagemFinal =
            imagemCronograma || imagemBanner;

          return (
            <div
              key={o.id}
              className="
                overflow-hidden
                rounded-xl
                border
                border-gray-200
                bg-white
                shadow-md
                transition-all
                duration-300
                hover:-translate-y-1
                hover:shadow-xl
              "
            >
              {/* ==================================================
                  IMAGEM
              ================================================== */}

              <div
                className="
                  relative
                  aspect-square
                  w-full
                  bg-gray-100
                "
              >
                {imagemFinal ? (
                  <Image
                    src={imagemFinal}
                    alt={
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
                    className="object-cover"
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

              {/* ==================================================
                  CONTEÚDO
              ================================================== */}

              <div className="p-4">
                {/* ==================================================
                    TEMA
                ================================================== */}

                <h2
                  className="
                    text-center
                    text-lg
                    font-bold
                    uppercase
                    leading-tight
                    text-gray-800
                  "
                >
                  {o.tema}
                </h2>

                {/* ==================================================
                    INFORMAÇÕES
                ================================================== */}

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
                      Período:
                    </span>{" "}
                    {formatarData(o.data_inicio)} •{" "}
                    {formatarData(o.data_fim)}
                  </p>

                  {/* HORÁRIO */}

                  <p>
                    <span className="font-semibold text-gray-700">
                      Horário:
                    </span>{" "}
                    {formatarHora(o.hora_inicio)} •{" "}
                    {formatarHora(o.hora_fim)}
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

                {/* ==================================================
                    BOTÃO DE INSCRIÇÃO
                ================================================== */}

                {o.link_inscricao && (
                  <a
                    href={o.link_inscricao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="
                      mt-4
                      inline-flex
                      w-full
                      items-center
                      justify-center
                      rounded-lg
                      bg-green-600
                      px-4
                      py-2
                      text-sm
                      font-semibold
                      text-white
                      transition
                      hover:bg-green-700
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
