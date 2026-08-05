import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";



// Componentes globais
import LayoutClient from "../components/LayoutClient";
import { ToastProvider } from "../components/ToastProvider"; // sem CSS aqui

// Contexto de autenticação
import { AuthProvider } from "../contexts/AuthContext";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Cursos da Secretaria da Mulher",
  description: "Sistema de cursos",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="pt-BR">
      <body className={`${geistSans.variable} ${geistMono.variable} antialiased bg-gray-100`}>
        <AuthProvider>

          {/* Toast global funcionando */}
          <ToastProvider />

          {/* Layout principal */}
          <LayoutClient>
             {children}
          </LayoutClient>

        </AuthProvider>
      </body>
    </html>
  );
}
