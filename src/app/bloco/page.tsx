"use client";

import { FormEvent, useState } from "react";
import {setupAPIClient} from '../../services/api'
import {toast} from 'react-toastify'

export default function Bloco(){
  
  const [bloco_Curso, setBloco_Curso] = useState("");
  async function handleRegister(event:FormEvent) {
    event.preventDefault();

    if (bloco_Curso ===""){

      alert("preencha o campo");
      return;

    }
    
    const apiClient = setupAPIClient();
    await apiClient.post('/bloco',{
      bloco_Curso:bloco_Curso});

      toast.success('casdastro realizado'+ bloco_Curso) 

   
    setBloco_Curso('');


  };

  return (
    <div className="flex items-center justify-center p-16">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-2">
        <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-3">
          Cadastro de Bloco
        </h2>

        <form onSubmit = {handleRegister}action="/register" method="POST" className="space-y-5">

          {/* Nome do Segmento */}
          <div>
            <label
              htmlFor="bloco_Curso"
              className="block text-sm font-medium text-gray-700 mb-0"
            >
              Bloco
            </label>
            <input
              id="nomeSegmento"
              type="text"
              required
              value={bloco_Curso}
              onChange={(e) => setBloco_Curso(e.target.value)}
              className="w-full px-4 py-2 rounded-lg border border-gray-300 
                         focus:outline-none focus:ring-2 focus:ring-blue-500 
                         focus:border-transparent transition"
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white 
                       font-semibold py-3 rounded-lg shadow-md transition-all duration-200"
          >
            Salvar
          </button>

        </form>
      </div>
    </div>
  );
}
