"use client";

import { FormEvent, useState } from "react";
import {setupAPIClient} from '../../services/api'
import {toast} from 'react-toastify'

export default function Segmento(){
  
  const [name, setName] = useState("");
  async function handleRegister(event:FormEvent) {
    event.preventDefault();

    if (name ===""){

      alert("preencha o campo");
      return;

    }
    
    const apiClient = setupAPIClient();
    await apiClient.post('/segmento',{
      name:name});

      toast.success('casdastro realizado') 

    alert ("Dados enviados:" + name)
    setName('');


  };

  return (
    <div className="flex items-center justify-center p-16">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-2">
        <h2 className="text-2xl font-extrabold text-center text-gray-800 mb-3">
          Cadastro de Segmento
        </h2>

        <form onSubmit = {handleRegister}action="/register" method="POST" className="space-y-5">

          {/* Nome do Segmento */}
          <div>
            <label
              htmlFor="nomeSegmento"
              className="block text-sm font-medium text-gray-700 mb-0"
            >
              Nome do Segmento
            </label>
            <input
              id="nomeSegmento"
              type="text"
              required
              value={name}
              onChange={(e) => setName(e.target.value)}
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
