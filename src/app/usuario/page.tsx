"use client";

import { FormEvent, useState, useContext} from "react";
import {AuthContext} from '../../contexts/AuthContext';
import {toast} from "react-toastify"

export default function Usuario() {
  const {signUp} = useContext(AuthContext);

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");

  async function handleSignUp(event: FormEvent) {
    event.preventDefault();

    if (name === "" || email === "" || password === "") {
      toast.error("Preencha todos os campos!");
      return;
    }

    // Aqui você pode fazer o POST para seu backend ou API
    const data = { name, email, password };
    console.log("Dados enviados:", data);

    

    await signUp(data)
    // Exemplo de alerta de sucesso
    
    toast.success("Cadastro realizado com sucesso!");
   
    

    // Limpa os campos
    setName("");
    setEmail("");
    setPassword("");
  }

  return (
    <div className="bg-gradient-to-br from-orange-50 to-purple-200 p-16 flex items-center justify-center min-h-screen">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-6">
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Cadastro de Usuário
        </h2>

        <form
          onSubmit={handleSignUp}
          className="space-y-5"
        >
          {/* Nome */}
          <div>
            <label
              htmlFor="name"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Nome completo
            </label>
            <input
              type="text"
              id="name"
              name="name"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2
              focus:ring-blue-500 focus:border-transparent transition"
              value={name}
              onChange={(e) => setName(e.target.value)}
            />
          </div>

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Email
            </label>
            <input
              type="email"
              id="email"
              name="email"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2
              focus:ring-blue-500 focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Senha */}
          <div>
            <label
              htmlFor="password"
              className="block text-sm font-medium text-gray-700 mb-1"
            >
              Senha
            </label>
            <input
              type="password"
              id="password"
              name="password"
              required
              className="w-full px-4 py-2 rounded-lg border border-gray-300 focus:outline-none 
              focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Termos */}
          <div className="flex items-center text-sm">
            <input
              type="checkbox"
              id="terms"
              required
              className="w-4 h-4 mr-2 text-blue-600 rounded focus:ring-0"
            />
            <label htmlFor="terms" className="text-gray-600">
              Eu concordo com os{" "}
              <a href="#" className="text-blue-600 underline">
                termos e condições
              </a>
            </label>
          </div>

          {/* Botão */}
          <button
            type="submit"
            className="w-full bg-blue-600 hover:bg-blue-700 text-white 
            font-semibold py-3 rounded-lg shadow-md transition-all duration-200"
          >
            Registrar
          </button>

          {/* Link login */}
          <p className="text-center text-sm text-gray-600 mt-4">
            Já tenho cadastro{" "}
            <a
              href="/login"
              className="text-blue-600 font-medium hover:underline"
            >
              Login
            </a>
          </p>
        </form>
      </div>
    </div>
  );
}

