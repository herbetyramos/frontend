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
      await signIn({ email, password });
    } finally {
      setLoading(false);
    }
  }

  return (
    <div
      className="
        min-h-screen
        flex
        items-center
        justify-center
        p-4
        .bg-gradient-to-br {
        --tw-gradient-position: to bottom right in oklab;
        background-image: linear-gradient(var(--tw-gradient-stops));
        }
        from-blue-100
        to-purple-200
        dark:from-gray-950
        dark:via-gray-900
        dark:to-slate-950
        transition-colors
        duration-300
      "
    >
      <div
        className="
          bg-white
          dark:bg-gray-900
          border
          border-gray-200
          dark:border-gray-700
          shadow-xl
          dark:shadow-black/40
          rounded-2xl
          w-full
          max-w-md
          p-6
          sm:p-8
          transition-colors
          duration-300
        "
      >
        <h2
          className="
            text-3xl
            font-extrabold
            text-center
            text-gray-800
            dark:text-gray-100
            mb-6
          "
        >
          Login e Senha
        </h2>

        <form onSubmit={handleLogin} className="space-y-5">

          {/* Email */}
          <div>
            <label
              htmlFor="email"
              className="
                block
                text-sm
                font-medium
                text-gray-700
                dark:text-gray-300
                mb-1
              "
            >
              Email
            </label>

            <input
              type="email"
              id="email"
              required
              autoComplete="username"
              className="
                w-full
                px-4
                py-3
                rounded-lg
                border
                border-gray-300
                dark:border-gray-600
                bg-white
                dark:bg-gray-800
                text-gray-900
                dark:text-gray-100
                placeholder-gray-400
                dark:placeholder-gray-500
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:border-transparent
                transition
              "
              value={email}
              onChange={(e) => setEmail(e.target.value)}
            />
          </div>

          {/* Senha */}
          <div>
            <label
              htmlFor="password"
              className="
                block
                text-sm
                font-medium
                text-gray-700
                dark:text-gray-300
                mb-1
              "
            >
              Senha
            </label>

            <input
              type="password"
              id="password"
              required
              autoComplete="current-password"
              className="
                w-full
                px-4
                py-3
                rounded-lg
                border
                border-gray-300
                dark:border-gray-600
                bg-white
                dark:bg-gray-800
                text-gray-900
                dark:text-gray-100
                placeholder-gray-400
                dark:placeholder-gray-500
                focus:outline-none
                focus:ring-2
                focus:ring-blue-500
                focus:border-transparent
                transition
              "
              value={password}
              onChange={(e) => setPassword(e.target.value)}
            />
          </div>

          {/* Botão */}
          <button
            type="submit"
            disabled={loading}
            className={`
              w-full
              font-semibold
              py-3
              rounded-lg
              shadow-md
              text-white
              transition-all
              duration-200
              ${
                loading
                  ? "bg-gray-400 dark:bg-gray-600 cursor-not-allowed"
                  : "bg-blue-600 hover:bg-blue-700 dark:bg-blue-700 dark:hover:bg-blue-600"
              }
            `}
          >
            {loading ? "Carregando..." : "Logar"}
          </button>

        </form>
      </div>
    </div>
  );
}