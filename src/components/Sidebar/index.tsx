"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { ChevronDown, ChevronRight } from "lucide-react";
import { useState } from "react";

interface SidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

const links = [
  { href: "/", label: "🏠 Home" },
  { href: "/listcronograma", label: "📅 Cronograma" },
  { href: "/relatorios", label: "📊 Relatórios" },
  { href: "/usuario", label: "👤 Usuário" },

  {
    href: "/cadastro",
    label: "📋 Cadastro",
    children: [
      { href: "/cronograma", label: "📅 Cronograma" },
      { href: "/ofertacursos", label: "Oferta" },
      { href: "/ata", label: "ARP" },
      { href: "/bloco", label: "Bloco" },
      { href: "/cursos", label: "Curso" },
      { href: "/detentora", label: "Detentora" },
      { href: "/formatura", label: "Formatura" },
      { href: "/licitacao", label: "Licitação" },
      { href: "/local", label: "Polo" },
      { href: "/professor", label: "Professor" },
      { href: "/segmento", label: "Segmento" },
      { href: "/sala", label: "Sala" },
      { href: "/empresa", label: "Empresa" },
    ],
  },
];

export default function Sidebar({
  isOpen,
  onClose,
}: SidebarProps) {
  const pathname = usePathname();

  const [openMenus, setOpenMenus] = useState<{
    [key: string]: boolean;
  }>({});

  const toggleMenu = (menu: string) => {
    setOpenMenus((prev) => ({
      ...prev,
      [menu]: !prev[menu],
    }));
  };

  if (!isOpen) return null;

  return (
    <>
      {/* Fundo escuro */}
      <div
        className="fixed inset-0 bg-black/40 dark:bg-black/70 z-40"
        onClick={onClose}
      />

      {/* Menu */}
      <div
        className="
          fixed
          top-12
          left-2
          w-72
          max-h-[85vh]
          overflow-y-auto
          bg-white
          dark:bg-gray-900
          text-gray-900
          dark:text-gray-100
          border
          border-gray-200
          dark:border-gray-700
          rounded-xl
          shadow-xl
          dark:shadow-black/40
          z-50
          p-3
        "
      >
        <nav className="space-y-2">
          {links.map(({ href, label, children }) => {
            const active =
              pathname === href ||
              (href !== "/" && pathname.startsWith(`${href}/`));

            if (children) {
              return (
                <div key={href}>
                  <button
                    onClick={() => toggleMenu(href)}
                    className="
                      w-full
                      flex
                      justify-between
                      items-center
                      px-3
                      py-2
                      rounded-lg
                      text-gray-800
                      dark:text-gray-100
                      hover:bg-gray-100
                      dark:hover:bg-gray-800
                      transition-colors
                    "
                  >
                    <span>{label}</span>

                    {openMenus[href] ? (
                      <ChevronDown size={16} />
                    ) : (
                      <ChevronRight size={16} />
                    )}
                  </button>

                  {openMenus[href] && (
                    <div
                      className="
                        ml-4
                        mt-1
                        space-y-1
                        border-l
                        border-gray-200
                        dark:border-gray-700
                        pl-2
                      "
                    >
                      {children.map((item) => {
                        const childActive =
                          pathname === item.href ||
                          pathname.startsWith(`${item.href}/`);

                        return (
                          <Link
                            key={item.href}
                            href={item.href}
                            onClick={onClose}
                            className={`
                              block
                              px-3
                              py-2
                              rounded-md
                              transition-colors
                              ${
                                childActive
                                  ? "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-300 font-semibold"
                                  : "text-gray-700 dark:text-gray-300 hover:bg-gray-100 dark:hover:bg-gray-800"
                              }
                            `}
                          >
                            {item.label}
                          </Link>
                        );
                      })}
                    </div>
                  )}
                </div>
              );
            }

            return (
              <Link
                key={href}
                href={href}
                onClick={onClose}
                className={`
                  block
                  px-3
                  py-2
                  rounded-lg
                  transition-colors
                  ${
                    active
                      ? "bg-fuchsia-100 text-fuchsia-800 dark:bg-fuchsia-900/40 dark:text-fuchsia-300 font-semibold"
                      : "text-gray-800 dark:text-gray-200 hover:bg-gray-100 dark:hover:bg-gray-800"
                  }
                `}
              >
                {label}
              </Link>
            );
          })}
        </nav>
      </div>
    </>
  );
}