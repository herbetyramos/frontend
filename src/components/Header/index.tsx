"use client";

import {
  Menu,
  X,
  LogIn,
  LogOut,
  ClipboardList,
} from "lucide-react";
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
        shadow-md
        dark:shadow-black/30
      "
      style={{
        backgroundImage: "linear-gradient(to right, #e12afb, #9333ea)",
      }}
    >
      <div className="h-full flex items-center gap-1 px-2">

        {/* Menu e navegação */}
        <div className="flex shrink-0 items-center gap-1">

          {/* Botão menu lateral */}
          <button
            type="button"
            onClick={toggleSidebar}
            aria-label={isOpen ? "Fechar menu" : "Abrir menu"}
            className="
              shrink-0
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
            title="Cadastro de cursos"
            className="
              shrink-0
              text-white
              text-xs
              sm:text-sm
              font-medium
              hover:bg-white/20
              px-2
              sm:px-3
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
            title="Cronogramas"
            className="
              shrink-0
              text-white
              text-xs
              sm:text-sm
              font-medium
              hover:bg-white/20
              px-2
              sm:px-3
              py-1
              rounded-md
              transition
            "
          >
            ☰ Cronogramas
          </Link>

          {/* Link Lista de Presença */}
          <Link
            href="/lista-presenca"
            title="Lista de Presença"
            aria-label="Lista de Presença"
            className="
              shrink-0
              flex
              items-center
              justify-center
              gap-1
              text-white
              text-xs
              sm:text-sm
              font-medium
              hover:bg-white/20
              px-2
              sm:px-3
              py-1
              rounded-md
              transition
            "
          >
            <ClipboardList size={19} />
            <span className="hidden sm:inline">
              Lista
            </span>
          </Link>

        </div>

        {/* Título: oculto em telas pequenas */}
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

        {/* Usuário e autenticação */}
        <div className="ml-auto flex shrink-0 items-center">

          <span className="hidden md:block text-white text-xs mr-2">
            👤 {user?.name || "VISITANTE"}
          </span>

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
