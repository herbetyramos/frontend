"use client";

import { Menu, X, LogIn, LogOut } from "lucide-react";
import { useContext } from "react";
import { AuthContext } from "../../contexts/AuthContext";
import { useRouter } from "next/navigation";
import Link from "next/link";

interface HeaderProps {
  isOpen: boolean;
  toggleSidebar: () => void;
}

export default function Header({
  isOpen,
  toggleSidebar,
}: HeaderProps) {
  const { user, signOut } = useContext(AuthContext);
  const router = useRouter();

  function handleAuthAction() {
    if (user) {
      signOut();
    } else {
      router.push("/login");
    }
  }

  return (
    <header
      className="
        fixed
        top-[env(safe-area-inset-top,0px)]
        left-0
        right-0
        z-50
        h-12
        .bg-gradient-to-r {
        --tw-gradient-position: to right in oklab;
        background-image: linear-gradient(var(--tw-gradient-stops));
        }
        from-fuchsia-500
        to-purple-600
        dark:from-slate-800
        dark:to-purple-950
        shadow-md
        dark:shadow-black/30
      "
    >
      <div className="h-full flex items-center justify-between px-3">
        {/* Menu e navegação */}
        <div className="flex items-center gap-3">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            className="
              p-2
              rounded-md
              text-white
              hover:bg-white/20
              transition
            "
          >
            {isOpen ? (
              <X size={20} />
            ) : (
              <Menu size={20} />
            )}
          </button>

          {/* Link Cadastro de cursos */}
          <Link
            href="/cronograma"
            className="
              text-white
              text-sm
              font-medium
              hover:bg-white/20
              px-3
              py-1
              rounded-md
              transition
            "
          >
            ➕ Curso
          </Link>

          {/* Link Cronogramas */}
          <Link
            href="/listcronograma"
            className="
              text-white
              text-sm
              font-medium
              hover:bg-white/20
              px-3
              py-1
              rounded-md
              transition
            "
          >
            ☰ Cronogramas
          </Link>
        </div>

        {/* Título */}
        <h1
          className="
            text-white
            font-bold
            text-sm
            md:text-base
            whitespace-nowrap
          "
        >
          Cursos da SMMF
        </h1>

        {/* Usuário e autenticação */}
        <div className="flex items-center gap-3">
          <span className="hidden md:block text-white text-xs">
            👤 {user?.name || "VISITANTE"}
          </span>

          <button
            type="button"
            onClick={handleAuthAction}
            aria-label={user ? "Sair da conta" : "Entrar"}
            className="
              flex
              items-center
              gap-1
              text-white
              text-xs
              hover:opacity-80
              transition
            "
          >
            {user ? (
              <>
                <LogOut size={16} />
                SAIR
              </>
            ) : (
              <>
                <LogIn size={16} />
                LOGIN
              </>
            )}
          </button>
        </div>
      </div>
    </header>
  );
}
