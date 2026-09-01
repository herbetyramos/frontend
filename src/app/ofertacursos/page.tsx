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

// ======================================================
// URL BASE DO SITE
// ======================================================

const SITE_URL = "https://gestaom.com";

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

// ====================================================
// CORRIGIR URLs ANTIGAS
// ====================================================

valor = valor
.replace("http://localhost:3000", SITE_URL)
.replace("http://192.168.15.84:3000", SITE_URL)
.replace("http://127.0.0.1:3000", SITE_URL);

// ====================================================
// URL HTTPS
// ====================================================

if (valor.startsWith("https://")) {
return valor;
}

// ====================================================
// URL HTTP
// ====================================================

if (valor.startsWith("http://")) {
  return valor.replace(/^http:\/\//, "https://");
}

// ====================================================
// CAMINHO ABSOLUTO
//
// Exemplos:
// /files/imagem.jpg
// /uploads/cronogramas/imagem.jpg
// ====================================================

if (valor.startsWith("/")) {
return `${SITE_URL}${valor}`;
}

// ====================================================
// CAMINHO RELATIVO
// ====================================================

if (valor.startsWith("files/") || valor.startsWith("uploads/")) {
return `${SITE_URL}/${valor}`;
}

// ====================================================
// SOMENTE NOME DO ARQUIVO
//
// Assume que está em /files/
// ====================================================

return `${SITE_URL}/files/${valor}`;
}

// ======================================================
// FORMATAR DATA
// ======================================================

function formatarData(data?: string): string {
if (!data) {
return "";
}

// ====================================================
// YYYY-MM-DD
// ====================================================

if (/^\d{4}-\d{2}-\d{2}/.test(data)) {
const partes = data.substring(0, 10).split("-");

const ano = partes[0];
const mes = partes[1];
const dia = partes[2];

return `${dia}/${mes}/${ano}`;


}

// ====================================================
// DD/MM/YYYY
// ====================================================

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

// ====================================================
// CARREGAR OFERTAS
// ====================================================

useEffect(() => {
const carregar = async () => {
try {
const resposta = await api.get<OfertaType[]>("/ofertacursos");


    console.log("OFERTAS API:", resposta.data);

    setOfertas(
      Array.isArray(resposta.data) ? resposta.data : []
    );
  } catch (error) {
    console.error("Erro ao carregar ofertas:", error);

    setOfertas([]);
  } finally {
    setLoading(false);
  }
};

carregar();


}, []);

// ====================================================
// CARREGANDO
// ====================================================

if (loading) {
return ( <main className="min-h-screen bg-gray-50 p-6"> <div className="flex items-center justify-center py-20"> <p className="text-gray-500 text-lg">
Carregando ofertas... </p> </div> </main>
);
}

// ====================================================
// PÁGINA
// ====================================================

return ( <main className="min-h-screen bg-gray-50 p-6">
{/* ==================================================
TÍTULO
================================================== */}


  <h1 className="text-2xl font-bold mb-6">
    Ofertas de Cursos
  </h1>

  {/* ==================================================
      NENHUMA OFERTA
  ================================================== */}

  {ofertas.length === 0 && (
    <p className="text-gray-500">
      Nenhuma oferta encontrada.
    </p>
  )}

  {/* ==================================================
      GRID
  ================================================== */}

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
      // ==================================================
      // IMAGEM DO CRONOGRAMA
      // ==================================================

      const imagemCronograma = montarUrlImagem(
        o.imagem_url
      );

      // ==================================================
      // BANNER DO CURSO
      // ==================================================

      const imagemBanner = montarUrlImagem(
        o.detentoras?.curso?.banner
      );

      // ==================================================
      // IMAGEM FINAL
      //
      // 1º imagem_url
      // 2º banner
      // ==================================================

      const imagemFinal =
        imagemCronograma || imagemBanner;

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
            hover:-translate-y-1
          "
        >
          {/* ==================================================
              IMAGEM QUADRADA
          ================================================== */}

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
                  o.detentoras?.curso?.nome_curso ||
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
                NOME DO CURSO
            ================================================== */}

            {o.detentoras?.curso?.nome_curso && (
              <p
                className="
                  text-xs
                  font-semibold
                  text-blue-600
                  uppercase
                  mb-1
                "
              >
                {o.detentoras.curso.nome_curso}
              </p>
            )}

            {/* ==================================================
                TEMA
            ================================================== */}

            <h2
              className="
                text-lg
                font-bold
                text-gray-800
                line-clamp-2
              "
            >
              {o.tema}
            </h2>

            {/* ==================================================
                ESPECIFICAÇÃO
            ================================================== */}

            <div className="mt-3">
              <p
                className="
                  text-xs
                  font-bold
                  text-gray-700
                  uppercase
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
                  line-clamp-3
                "
              >
                {o.especificacao?.trim()
                  ? o.especificacao
                  : "Nenhuma especificação informada."}
              </p>
            </div>

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
                  w-full
                  inline-flex
                  items-center
                  justify-center
                  bg-green-600
                  text-white
                  py-2
                  px-4
                  rounded-lg
                  font-semibold
                  text-sm
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
