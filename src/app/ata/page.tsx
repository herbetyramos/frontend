"use client";

import { FormEvent, useState, useEffect } from "react";
import { setupAPIClient } from "../../services/api";
import { toast } from "react-toastify";

type LicitacaoProps = {
  id: string;
  numero_licitacao: string;
};

type EmpresaProps = {
  id: string;
  nome_empresa: string;
};

export default function Ata() {
  const [numero_ata, setNumero_ata] = useState("");
  const [id_empresa, setId_empresa] = useState("");
  const [licitacao_id, setLicitacao_id] = useState("");
  const [licitacoes, setLicitacoes] = useState<LicitacaoProps[]>([]);
  const [detentoras, setDetentoras] = useState<EmpresaProps[]>([]);

  // -------------------------------------------------------
  // BUSCAR LICITAÇÕES E EMPRESAS DETENTORAS
  // -------------------------------------------------------
  useEffect(() => {
    async function loadData() {
      try {
        const api = setupAPIClient();

        const responseLicitacao = await api.get("/licitacao");
        const responseDetentora = await api.get("/empresa");

        setLicitacoes(responseLicitacao.data || []);
        setDetentoras(responseDetentora.data || []);

      } catch (err) {
        console.log("Erro ao carregar dados:", err);
        toast.error("Erro ao carregar informações");
      }
    }

    loadData();
  }, []);

  // -------------------------------------------------------
  // REGISTRAR A ATA
  // -------------------------------------------------------
  async function handleRegister(event: FormEvent) {
    event.preventDefault();

    if (!numero_ata || !licitacao_id || !id_empresa) {
      toast.error("Preencha todos os campos obrigatórios");
      return;
    }

    try {
      const api = setupAPIClient();

      const data = {
        numero_ata,
        licitacao_id,
        id_empresa
      };

      await api.post("/ata", data);

      toast.success("Ata cadastrada com sucesso!");

      setNumero_ata("");
      setId_empresa("");
      setLicitacao_id("");

    } catch (err) {
      console.log("Erro ao cadastrar:", err);
      toast.error("Erro ao cadastrar a ata");
    }
  }

  return (
    <div className="flex items-center justify-center p-16">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-2">
        <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-6">
          Cadastro de Ata
        </h2>

        <form onSubmit={handleRegister} className="space-y-5">
          
          {/* Número da Ata */}
          <div className="relative w-full">
            <input
              type="text"
              value={numero_ata}
              onChange={(e) => setNumero_ata(e.target.value)}
              placeholder=" "
              required
              className="peer w-full border border-gray-300 rounded-lg px-3 pt-5 pb-2
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <span className="absolute left-3 top-2 text-gray-500 text-sm">
              Número da Ata
            </span>
          </div>

          {/* Empresa Detentora */}
          <div className="relative w-full">
            <span className="absolute left-3 -top-3 bg-white px-1 text-blue-600 text-xs">
              Detentora
            </span>

            <select
              value={id_empresa}
              onChange={(e) => setId_empresa(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none 
                focus:ring-2 focus:ring-blue-500 transition bg-white"
            >
              <option value="">Selecione a empresa</option>

              {detentoras.map((d) => (
                <option key={d.id} value={d.id}>
                  {d.nome_empresa}
                </option>
                
              ))}
            </select>
          </div>

          {/* Licitação */}
          <div className="relative w-full">
            <span className="absolute left-3 -top-3 bg-white px-1 text-blue-600 text-xs">
              Licitação
            </span>
              
            <select
            
              value={licitacao_id}
              onChange={(e) => setLicitacao_id(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none 
                focus:ring-2 focus:ring-blue-500 transition bg-white"
            >
              
              <option value="">Selecione a licitação</option>

              {licitacoes.map((l) => (
                <option key={l.id} value={l.id}>
                  {l.numero_licitacao}
                </option>
                
              ))}
            </select>
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white 
            font-semibold py-3 rounded-lg shadow-md transition-all duration-200 
            transform hover:-translate-y-0.5"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}