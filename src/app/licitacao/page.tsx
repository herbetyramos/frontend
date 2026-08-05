"use client";

import { FormEvent, useState } from "react";
import { setupAPIClient } from "../../services/api";
import { toast } from "react-toastify";

export default function Licitacao() {
  const [objeto, setObjeto] = useState("");
  const [numero_licitacao, setNumero_licitacao] = useState("");

  async function handleRegister(event: FormEvent) {
    event.preventDefault();

    if (objeto === "" || numero_licitacao === "") {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const apiClient = setupAPIClient();

      const data = {
        objeto,
        numero_licitacao,
      };

      await apiClient.post("/licitacao", data);

      toast.success("Licitação cadastrada com sucesso!");

      // limpar campos
      setObjeto("");
      setNumero_licitacao("");
    } catch (err) {
      console.log(err);
      toast.error("Erro ao cadastrar!");
    }
  }

  return (
    <div className="flex items-center justify-center p-16">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-2">
        <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-6">
          Cadastro de Licitação
        </h2>

        <form onSubmit={handleRegister} className="space-y-5">

          {/* Nome do Objeto */}
          <div className="relative w-full">
            <input
              type="text"
              id="nomeObjeto"
              value={objeto}
              onChange={(e) => setObjeto(e.target.value)}
              placeholder=" "
              required
              className="peer w-full border border-gray-300 rounded-lg px-3 pt-5 pb-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <span
              className="absolute left-3 top-2 text-gray-500 text-sm
                         transition-all duration-200
                         peer-placeholder-shown:top-5
                         peer-placeholder-shown:text-gray-400
                         peer-placeholder-shown:text-base
                         peer-focus:top-2
                         peer-focus:text-sm
                         peer-focus:text-blue-500"
            >
              Nome do Objeto
            </span>
          </div>

          {/* Número / Ano da Licitação */}
          <div className="relative w-full">
            <input
              type="text"
              id="numeroLic"
              placeholder=" "
              value={numero_licitacao}
              onChange={(e) => setNumero_licitacao(e.target.value)}
              required
              className="peer w-full border border-gray-300 rounded-lg px-3 pt-5 pb-2
                         focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <span
              className="absolute left-3 top-2 text-gray-500 text-sm
                         transition-all duration-200
                         peer-placeholder-shown:top-5
                         peer-placeholder-shown:text-gray-400
                         peer-placeholder-shown:text-base
                         peer-focus:top-2
                         peer-focus:text-sm
                         peer-focus:text-blue-500"
            >
              Número / Ano da Licitação
            </span>
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white 
                       font-semibold py-3 rounded-lg shadow-md transition-all duration-200
                       transform hover:-translate-y-0.5 z-50"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
