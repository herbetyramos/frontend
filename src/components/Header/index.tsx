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
    top-0
    left-0
    right-0
    z-50
    h-12
    shadow-md
  "
  style={{
    backgroundImage: "linear-gradient(to right, #e12afb, #9333ea)",
  }}
>
      <div className="h-full flex items-center gap-1 px-2">
        {/* Menu e navegação */}
        <div className="flex shrink-0 items-center gap-1">
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            className="shrink-0 p-2 rounded-md text-white hover:bg-white/20 transition"
          >
            {isOpen ? <X size={20} /> : <Menu size={20} />}
          </button>

          <Link
            href="/cronograma"
            className="shrink-0 text-white text-xs sm:text-sm font-medium hover:bg-white/20 px-2 py-1 rounded-md transition"
          >
            ➕ Curso
          </Link>

          <Link
            href="/listcronograma"
            className="shrink-0 text-white text-xs sm:text-sm font-medium hover:bg-white/20 px-2 py-1 rounded-md transition"
          >
            ☰ Cronogramas
          </Link>
        </div>

        {/* Título: usa o espaço disponível */}
        <h1
          className="
            hidden
            sm:block
            flex-1
            min-w-0
            truncate
            text-center
            text-white
            font-bold
            text-sm
            md:text-base
          "
        >
          Cursos da SMMF
        </h1>

        {/* Login/Sair: sempre visível à direita */}
        <div className="ml-auto flex shrink-0 items-center">
          <button
            type="button"
            onClick={handleAuthAction}
            aria-label={user ? "Sair da conta" : "Entrar"}
            className="
              flex
              shrink-0
              items-center
              justify-center
              gap-1
              whitespace-nowrap
              rounded-md
              px-2
              py-2
              text-white
              text-xs
              font-medium
              hover:bg-white/20
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
