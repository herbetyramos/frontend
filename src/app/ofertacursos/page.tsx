"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api"; // ← ajuste importante

// Tipagem do retorno da API
type OfertaType = {
  id: string;
  tema: string;
  descricao?: string;
  data_inicio: string;
  data_fim: string;
  hora_inicio: string;
  hora_fim: string;
  localAula: { polo: string } | null;
  link_inscricao?: string;

  detentoras?: {
    curso?: {
      banner?: string;
      nome_curso?: string;
    };
  };
};

export default function OfertaCursoPage() {
  const [ofertas, setOfertas] = useState<OfertaType[]>([]);
  const [loading, setLoading] = useState(true);

  const carregar = async () => {
    try {
      const resposta = await api.get("/ofertacursos");

      console.log("API:", resposta.data);

      setOfertas(resposta.data); // precisa ser ARRAY
    } catch (error) {
      console.error("Erro ao carregar ofertas:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    carregar();
  }, []);

  if (loading) return <p>Carregando ofertas...</p>;

 return (
  <div className="p-6 max-w-5xl mx-auto">
    <h1 className="text-3xl font-bold mb-6">Ofertas de Cursos</h1>

    {ofertas.length === 0 && (
      <p className="text-gray-500">Nenhuma oferta encontrada.</p>
    )}

    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      {ofertas.map((o) => (
        <div
          key={o.id}
          className="bg-white shadow-lg rounded-xl overflow-hidden transition hover:shadow-2xl hover:-translate-y-1 duration-300 border border-gray-200"
        >
          {/* Banner */}
          {o.detentoras?.curso?.banner && (
            <img
              src={`http://localhost:3000/files/${o.detentoras.curso.banner}`}
              alt="Banner do curso"
              className="w-full h-48 object-cover"
            />
          )}

          <div className="p-5">
            {/* Título */}
            <h2 className="text-xl font-bold">{o.tema}</h2>

            {/* Descrição */}
            <p className="text-sm text-gray-600 mt-1">
              {o.descricao || "Sem descrição disponível"}
            </p>

            {/* Datas */}
            <div className="mt-4 space-y-1 text-sm">
              <p>
                <span className="font-semibold text-gray-700">Período:</span>{" "}
                {o.data_inicio} • {o.data_fim}
              </p>

              <p>
                <span className="font-semibold text-gray-700">Harário:</span>{" "}
                {o.hora_inicio} • {o.hora_fim}
              </p>

              <p>
                <span className="font-semibold text-gray-700">Local:</span>{" "}
                {o.localAula?.polo}
              </p>
            </div>

            {/* Botão */}
            <a
              href={o.link_inscricao}
               target="_blank"
               rel="noopener noreferrer"
               className="mt-4 w-full inline-block text-center bg-green-600 text-white py-2 rounded-lg hover:bg-green-700"
              >
                Fazer Inscrição
                </a>
          </div>
        </div>
      ))}
    </div>
  </div>
);}