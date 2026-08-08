
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
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  hora_inicio: string;
  hora_fim: string;

  localAula: {
    polo: string;
  } | null;

  link_inscricao?: string;

  detentoras?: {
    curso?: {
      banner?: string;
      nome_curso?: string;
    };
  };
};

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
          "API:",
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
      <div className="flex justify-center items-center ">
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
      <h1 className="text-2xl font-bold mb-6">
        Ofertas de Cursos
      </h1>

      {ofertas.length === 0 && (
        <p className="text-gray-500">
          Nenhuma oferta encontrada.
        </p>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {ofertas.map((o) => {
          const banner =
            o.detentoras?.curso?.banner;

          return (
            <div
              key={o.id}
              className="bg-white shadow-lg rounded-xl overflow-hidden transition hover:shadow-2xl hover:-translate-y-1 duration-300 border border-gray-200"
            >
              {/* ===============================
                  BANNER
              =============================== */}

              {banner ? (
                <Image
                  src={`http://localhost:3000/files/${banner}`}
                  alt={
                    o.detentoras?.curso
                      ?.nome_curso ??
                    "Banner do curso"
                  }
                  width={800}
                  height={192}
                  className="w-full h-48 object-cover"
                />
              ) : (
                <div className="w-full h-48 bg-gray-200 flex items-center justify-center">
                  <span className="text-gray-500">
                    Sem banner disponível
                  </span>
                </div>
              )}

              {/* ===============================
                  CONTEÚDO
              =============================== */}

              <div className="p-5">
                {/* Título */}
                <h2 className="text-xl font-bold">
                  {o.tema}
                </h2>

                {/* Descrição */}
                <p className="text-sm text-gray-600 mt-1">
                  {o.descricao ||
                    "Sem descrição disponível"}
                </p>

                {/* Datas */}
                <div className="mt-4 space-y-1 text-sm">
                  <p>
                    <span className="font-semibold text-gray-700">
                      Período:
                    </span>{" "}
                    {o.data_inicio} •{" "}
                    {o.data_fim}
                  </p>

                  <p>
                    <span className="font-semibold text-gray-700">
                      Horário:
                    </span>{" "}
                    {o.hora_inicio} •{" "}
                    {o.hora_fim}
                  </p>

                  <p>
                    <span className="font-semibold text-gray-700">
                      Local:
                    </span>{" "}
                    {o.localAula?.polo ??
                      "Local não informado"}
                  </p>
                </div>

                {/* Botão */}
                {o.link_inscricao && (
                  <a
                    href={o.link_inscricao}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-4 w-full inline-block text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
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

