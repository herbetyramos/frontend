
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import ListaCronogramas from "@/components/chat/atendimento/ListaCronogramas";
import ListaConversas from "@/components/chat/ListaConversas";
import JanelaChat from "@/components/chat/JanelaChat";
import ProfessoresBlocoModal from "@/components/chat/atendimento/ProfessoresBlocoModal";

import { socket } from "@/services/socket";

type ModoChat = "cronograma" | "conversas";

function AtendimentoContent() {
  const searchParams = useSearchParams();

  const cronogramaIdUrl = searchParams.get("cronogramaId");

  const bloco = searchParams.get("bloco");
  const polo = searchParams.get("polo");
  const empresa = searchParams.get("empresa");
  const data = searchParams.get("data");

  const [cronogramaId, setCronogramaId] =
    useState<string | null>(cronogramaIdUrl);

  const [conversaId, setConversaId] =
    useState<string | null>(null);

  const [modo, setModo] =
    useState<ModoChat>(
      cronogramaIdUrl ? "cronograma" : "conversas"
    );

  const [mostrarProfessores, setMostrarProfessores] =
    useState(false);

  useEffect(() => {
    if (!cronogramaIdUrl) {
      return;
    }

    setCronogramaId((atual) =>
      atual === cronogramaIdUrl
        ? atual
        : cronogramaIdUrl
    );
  }, [cronogramaIdUrl]);

  const selecionarCronograma = useCallback(
    (id: string) => {
      setModo("cronograma");

      setCronogramaId((atual) =>
        atual === id ? atual : id
      );

      setConversaId(null);
    },
    []
  );

  const mostrarConversasGeral = useCallback(() => {
    setModo("conversas");
    setConversaId(null);
  }, []);

  const selecionarConversa = useCallback(
    (id: string | null) => {
      setConversaId(id);
    },
    []
  );

  const abrirProfessores = useCallback(() => {
    if (!cronogramaId) {
      return;
    }

    setMostrarProfessores(true);
  }, [cronogramaId]);

  const fecharProfessores = useCallback(() => {
    setMostrarProfessores(false);
  }, []);

  useEffect(() => {
    function novaMensagem(data: {
      conversaId?: string;
    }) {
      console.log(
        "Nova mensagem recebida pelo atendimento:",
        data
      );
    }

    socket.on("novaMensagem", novaMensagem);

    return () => {
      socket.off("novaMensagem", novaMensagem);
    };
  }, []);

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100 dark:bg-gray-950">

      {/* COLUNA 1 - CRONOGRAMAS */}

      <aside className="h-full w-80 shrink-0 overflow-hidden border-r bg-white dark:border-gray-800 dark:bg-gray-900">
        <ListaCronogramas
          bloco={bloco}
          polo={polo}
          empresa={empresa}
          data={data}
          cronogramaSelecionado={cronogramaId}
          onSelecionar={selecionarCronograma}
          onMostrarConversas={mostrarConversasGeral}
          onMostrarProfessores={abrirProfessores}
          modoConversas={modo === "conversas"}
        />
      </aside>

      {/* COLUNA 2 - ALUNOS / CONVERSAS */}

      <aside className="h-full w-96 shrink-0 overflow-hidden border-r bg-white dark:border-gray-800 dark:bg-gray-900">
        <ListaConversas
          cronogramaId={cronogramaId}
          conversaSelecionada={conversaId}
          onSelecionar={selecionarConversa}
          modoConversas={modo === "conversas"}
        />
      </aside>

      {/* COLUNA 3 - JANELA DE CHAT */}

      <main className="h-full min-w-0 flex-1 overflow-hidden bg-white dark:bg-gray-950">
        <JanelaChat
          conversaId={conversaId}
        />
      </main>

      {/* MODAL DE PROFESSORES */}

      {mostrarProfessores && cronogramaId && (
        <ProfessoresBlocoModal
          cronogramaId={cronogramaId}
          onFechar={fecharProfessores}
        />
      )}
    </div>
  );
}

export default function AtendimentoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-100 dark:bg-gray-950">
          <div className="text-gray-500 dark:text-gray-400">
            Carregando atendimento...
          </div>
        </div>
      }
    >
      <AtendimentoContent />
    </Suspense>
  );
}
