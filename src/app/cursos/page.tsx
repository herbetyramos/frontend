"use client";

import { useEffect, useState, FormEvent } from "react";
import { setupAPIClient } from "../../services/api";
import { toast } from "react-toastify";


// TIPOS
type SegmentoProps = {
  id: string;
  name: string;
};


  

export default function Curso() {
  // STATES DO FORM
  const [nome_curso, setNome_curso] = useState("");
  const [quantidade, setQuantidade] = useState("");
  const [descricao, setDescricao] = useState("");
  const [banner, setBanner] = useState<File | null>(null);
  const [segmento_id, setSegmento_id] = useState("");

  // LISTA DE SEGMENTOS
  const [segmentos, setSegmentos] = useState<SegmentoProps[]>([]);

  // 🔵 CARREGAR SEGMENTOS AO INICIAR
  useEffect(() => {
    async function loadSegmentos() {
      try {
        const api = setupAPIClient();
        const response = await api.get("/segmento");
        setSegmentos(response.data || []);
      } catch (err) {
        console.log("Erro ao carregar segmentos:", err);
        toast.error("Erro ao carregar segmentos");
      }
    }

    loadSegmentos();
  }, []);

  // 🔵 SUBMIT DO FORMULÁRIO
  async function handleRegister(event: FormEvent) {
    event.preventDefault();

    if (!nome_curso || !quantidade || !descricao || !banner || !segmento_id) {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const api = setupAPIClient();

      const data = new FormData();
      data.append("nome_curso", nome_curso);
      data.append("price", quantidade);
      data.append("description", descricao);
      data.append("file", banner);
      data.append("segmento_id", segmento_id);

      await api.post("/cursos", data);

      toast.success("Curso cadastrado com sucesso!");

      // limpar campos
      setNome_curso("");
      setQuantidade("");
      setDescricao("");
      setBanner(null);
      setSegmento_id("");
    } catch (err) {
      console.log("Erro ao cadastrar curso:", err);
      toast.error("Erro ao cadastrar curso");
    }
  }

  return (
    <div className="flex items-center justify-center p-16">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-2">
        <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-6">
          Cadastro de Cursos
        </h2>

        <form onSubmit={handleRegister} className="space-y-5">

          {/* Nome */}
          <div className="relative w-full">
            <input
              type="text"
              value={nome_curso}
              onChange={(e) => setNome_curso(e.target.value)}
              placeholder=" "
              required
              className="peer w-full border border-gray-300 rounded-lg px-3 pt-5 pb-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-0 text-gray-500 text-sm transition-all
                             peer-placeholder-shown:top-2 peer-focus:top-0 peer-focus:text-blue-500">
              Nome do curso
            </span>
          </div>

          {/* Quantidade */}
          <div className="relative w-full">
            <input
              type="number"
              value={quantidade}
              onChange={(e) => setQuantidade(e.target.value)}
              placeholder=" "
              required
              className="peer w-full border border-gray-300 rounded-lg px-3 pt-5 pb-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 top-0 text-gray-500 text-sm transition-all
                             peer-placeholder-shown:top-5 peer-focus:top-0 peer-focus:text-blue-500">
              Quantidade
            </span>
          </div>

          {/* Descrição */}
          <div className="relative w-full">
            <textarea
              value={descricao}
              onChange={(e) => setDescricao(e.target.value)}
              placeholder=" "
              required
              className="peer w-full border border-gray-300 rounded-lg px-3 pt-5 pb-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
            />
            <span className="absolute left-3 top-0 text-gray-500 text-sm transition-all
                             peer-placeholder-shown:top-5 peer-focus:top-0 peer-focus:text-blue-500">
              Descrição
            </span>
          </div>

          {/* Banner */}
          <div className="relative w-full">
            <input
              type="file"
              onChange={(e) => setBanner(e.target.files?.[0] ?? null)}
              accept="image/*"
              required
              className="peer w-full border border-gray-300 rounded-lg px-3 py-3
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            />
            <span className="absolute left-3 -top-3 bg-white px-1 text-blue-600 text-xs">
              Banner
            </span>
          </div>

          {/* Segmento - SELECT */}
          <div className="relative w-full">
            <select
              value={segmento_id}
              onChange={(e) => setSegmento_id(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-3 
                         focus:outline-none focus:ring-2 focus:ring-blue-500"
            >
              <option value="">Selecione um segmento</option>

              {segmentos.map((seg) => (
                <option key={seg.id} value={seg.id}>
                  {seg.name}
                </option>
              ))}
            </select>

            <span className="absolute left-3 -top-3 bg-white px-1 text-blue-600 text-xs">
              Segmento
            </span>
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white 
                       font-semibold py-3 rounded-lg shadow-md transition-all"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}