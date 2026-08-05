"use client";

import { FormEvent, useState, useEffect } from "react";
import { setupAPIClient } from "../../services/api";
import { toast } from "react-toastify";

// TABELA ATA
type AtaProps = {
  id: string;
  numero_ata: string;
};

// TABELA CURSOS
type CursoProps = {
  id: string;
  nome_curso: string;
};

export default function AtaCurso() {

  // IDS QUE SERÃO ENVIADOS PARA O BACKEND
  const [ata_id, setAta_id] = useState("");
  const [cursos_id, setCurso_id] = useState("");

  // LISTAS CARREGADAS DO BACKEND
  const [atas, setAtas] = useState<AtaProps[]>([]);
  const [cursos, setCursos] = useState<CursoProps[]>([]);
  
  const [quantidade_turma, setQuantidadeTurma] = useState<number>(0);

  // -------------------------------------------------------
  // BUSCAR ATAS E CURSOS
  // -------------------------------------------------------
  useEffect(() => {
    async function loadData() {
      try {
        const api = setupAPIClient();

        const responseAtas = await api.get("/ata");
        const responseCursos = await api.get("/cursos");

        setAtas(responseAtas.data || []);
        setCursos(responseCursos.data || []);

      } catch (err) {
        console.log("Erro ao carregar dados:", err);
        toast.error("Erro ao carregar informações");
      }
    }

    loadData();
  }, []);

  // -------------------------------------------------------
  // REGISTRAR DETENTORA DO CURSO
  // -------------------------------------------------------
  async function handleRegister(event: FormEvent) {
    event.preventDefault();

    if (!ata_id || !cursos_id) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const api = setupAPIClient();

      const data = {
        ata_id,
        cursos_id,
        quantidade_turma
      };

      await api.post("/detentora", data);

      toast.success("Cadastrado com sucesso!");

      setAta_id("");
      setCurso_id("");

    } catch (err) {
      console.log("Erro ao cadastrar:", err);
      toast.error("Erro ao cadastrar");
    }
  }

  return (
    <div className="flex items-center justify-center p-16">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-2">
        <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-6">
          Cadastro de Detentora do Curso
        </h2>

        <form onSubmit={handleRegister} className="space-y-5">

          {/* ATA */}
          <div className="relative w-full">
            <span className="absolute left-3 -top-3 bg-white px-1 text-blue-600 text-xs">
              Ata
            </span>

            <select
              value={ata_id}
              onChange={(e) => setAta_id(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-3 
              focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Selecione a Ata</option>

              {atas.map((a) => (
                <option key={a.id} value={a.id}>
                  {a.numero_ata}
                </option>
              ))}

            </select>
          </div>

          {/* CURSO */}
          <div className="relative w-full">
            <span className="absolute left-3 -top-3 bg-white px-1 text-blue-600 text-xs">
              Curso
            </span>

            <select
              value={cursos_id}
              onChange={(e) => setCurso_id(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-3 
              focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
            >
              <option value="">Selecione o curso</option>

              {cursos.map((c) => (
                <option key={c.id} value={c.id}>
                  {c.nome_curso}
                </option>
              ))}

            </select>
          </div>

          <div className="relative w-full">
  <span className="absolute left-3 -top-3 bg-white px-1 text-blue-600 text-xs">
    Quantidade de Turmas
  </span>

  <input
    type="number"
    value={quantidade_turma}
    onChange={(e) => setQuantidadeTurma(Number(e.target.value))}
    min="1"
    required
    className="w-full border border-gray-300 rounded-lg px-3 py-3 
    focus:outline-none focus:ring-2 focus:ring-blue-500 bg-white"
  />
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