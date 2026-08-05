"use client";

import { FormEvent, useContext, useState } from "react";
import { AuthContext } from "../../contexts/AuthContext";

export default function Login() {
  const { signIn } = useContext(AuthContext);

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  async function handleLogin(event: FormEvent) {
    event.preventDefault();
    setLoading(true);

    try {
      await signIn({ email, password });  // Agora apenas dispara o login
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-100 to-purple-200 flex items-center justify-center p-4">
      <div className="bg-white shadow-xl rounded-2xl w-full max-w-md p-6 sm:p-8">
        
        <h2 className="text-3xl font-extrabold text-center text-gray-800 mb-6">
          Login e Senha
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">
          
          {/* Email */}
          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>

            <input
              type="email"
              id="email"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Senha */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Senha
            </label>

            <input
              type="password"
              id="password"
              required
              className="w-full px-4 py-3 rounded-lg border border-gray-300 focus:outline-none 
                         focus:ring-2 focus:ring-blue-500 focus:border-transparent transition"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Botão */}
          <button
            
            type="submit"
            disabled={loading}
            className={`w-full font-semibold py-3 rounded-lg shadow-md text-white transition-all duration-200
              ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}
            `}
          >
            {loading ? "Carregando..." : "Logar"}
          </button>

        </form>

      </div>
    </div>
  );
  
}
