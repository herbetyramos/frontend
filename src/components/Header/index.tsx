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
        bg-linear-to-r
        from-fuchsia-500
        to-purple-600
        shadow-md
      "
    >
      <div className="h-full flex items-center justify-between px-3">

        {/* Botão Menu */}
       <div className="flex items-center gap-3">
            {/* Botão Menu */}
            <button
              onClick={toggleSidebar}
              className="
                p-2
                rounded-md
                hover:bg-white/20
                transition
              "
            >
              {isOpen ? (
                <X size={20} className="text-white" />
              ) : (
                <Menu size={20} className="text-white" />
              )}
            </button>

            {/* Link Cronogramas */}
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
        <h1 className="text-white font-bold text-sm md:text-base">
          Cursos da SMMF
        </h1>

        {/* Usuário */}
        <div className="flex items-center gap-3">

          <span className="hidden md:block text-white text-xs">
            👤 {user?.name || "VISITANTE"}
          </span>

          <button
            onClick={handleAuthAction}
            className="
              flex
              items-center
              gap-1
              text-white
              text-xs
              hover:opacity-80
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