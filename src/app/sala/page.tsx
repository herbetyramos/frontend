"use client";

import { FormEvent, useState, useEffect } from "react";
import { setupAPIClient } from "../../services/api";
import { toast } from "react-toastify";

        
type itemProps = {
  id: string;
  polo: string;
};

export default function Sala() {
  const [numero_sala, setNumero_sala] = useState("");
  const [tipo_uso, setTipo_uso] = useState("");

  const [local_id, setLocal_id] = useState("");
  const [locais, setLocais] = useState<itemProps[]>([]);
   

  useEffect(() => {
    async function loadLocais() {
      try {
        const apiClient = setupAPIClient();
        const response = await apiClient.get("/local");

        setLocais(response.data); // agora o type bate corretamente
       
      } catch (err) {
        console.log("Erro ao buscar locais:", err);
        toast.error("Erro ao carregar locais");
      }
    }

    loadLocais();
  }, []);

  // -----------------------------  
  // Enviar formulário
  // -----------------------------
  async function handleRegister(event: FormEvent) {
    event.preventDefault();

    if (numero_sala === "" || tipo_uso === "" || local_id === "") {
      toast.error("Preencha todos os campos");
      return;
    }

    try {
      const apiClient = setupAPIClient();

      const data = {
        numero_sala,
        tipo_uso,
        local_id,
      };

      await apiClient.post("/sala", data);

      toast.success("Sala cadastrada com sucesso!");

      setTipo_uso("");
      setNumero_sala("");
      setLocal_id("");

    } catch (err) {
      console.log(err);
      toast.error("Erro ao cadastrar!");
    }
  }

  return (
    <div className="flex items-center justify-center p-16">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-2">
        <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-6">
          Cadastro de Sala 
        </h2>

        <form onSubmit={handleRegister} className="space-y-5">

          {/* Tipo de Uso */}
          <div className="relative w-full">
            <input
              type="text"
              id="tipoUso"
              value={tipo_uso}
              onChange={(e) => setTipo_uso(e.target.value)}
              placeholder=" "
              required
              className="peer w-full border border-gray-300 rounded-lg px-3 pt-5 pb-2
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <span className="absolute left-3 top-2 text-gray-500 text-sm transition-all duration-200
              peer-placeholder-shown:top-5 peer-placeholder-shown:text-base
              peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
              Tipo de Uso
            </span>
          </div>

          {/* Número da sala */}
          <div className="relative w-full">
            <input
              type="text"
              id="numeroSala"
              placeholder=" "
              value={numero_sala}
              onChange={(e) => setNumero_sala(e.target.value)}
              required
              className="peer w-full border border-gray-300 rounded-lg px-3 pt-5 pb-2
              focus:outline-none focus:ring-2 focus:ring-blue-500 transition"
            />
            <span className="absolute left-3 top-2 text-gray-500 text-sm transition-all duration-200
              peer-placeholder-shown:top-5 peer-placeholder-shown:text-base
              peer-focus:top-2 peer-focus:text-sm peer-focus:text-blue-500">
              Número da sala
            </span>
          </div>

          {/* SELECT local_id vindo da API */}
          <div className="relative w-full">
            <select
              value={local_id}
              onChange={(e) => setLocal_id(e.target.value)}
              required
              className="w-full border border-gray-300 rounded-lg px-3 py-3 focus:outline-none 
              focus:ring-2 focus:ring-blue-500 transition bg-white"
            >
              <option value="">Selecione um local</option>

              {locais.map((loc) => (
                <option key={loc.id} value={loc.id}>
                  {loc.polo}
                </option>
              ))}
            </select>

            <span className="absolute left-3 -top-3 bg-white px-1 text-blue-600 text-xs">
              Local
            </span>
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white 
            font-semibold py-3 rounded-lg shadow-md transition-all duration-200 transform hover:-translate-y-0.5"
          >
            Salvar
          </button>
        </form>
      </div>
    </div>
  );
}
