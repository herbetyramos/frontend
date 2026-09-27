"use client";

import {
  Suspense,
  useEffect,
  useState,
} from "react";

import { useSearchParams } from "next/navigation";

import ListaCronogramas from "@/components/chat/atendimento/ListaCronogramas";
import ListaConversas from "@/components/chat/ListaConversas";
import JanelaChat from "@/components/chat/JanelaChat";

import { socket } from "@/services/socket";

type ModoChat = "cronograma" | "conversas";

function AtendimentoContent() {
  const searchParams = useSearchParams();

  // =========================================================
  // PARÂMETROS DA URL
  // =========================================================

  const cronogramaIdUrl =
    searchParams.get("cronogramaId");

  const bloco = searchParams.get("bloco");
  const polo = searchParams.get("polo");
  const empresa = searchParams.get("empresa");
  const data = searchParams.get("data");

  // =========================================================
  // ESTADOS
  // =========================================================

  const [cronogramaId, setCronogramaId] =
    useState<string | null>(cronogramaIdUrl);

  const [conversaId, setConversaId] =
    useState<string | null>(null);

  const [modo, setModo] =
    useState<ModoChat>(
      cronogramaIdUrl
        ? "cronograma"
        : "conversas"
    );

  // =========================================================
  // CRONOGRAMA RECEBIDO PELA URL
  // =========================================================

  useEffect(() => {
    if (!cronogramaIdUrl) {
      return;
    }

    if (modo === "conversas") {
      return;
    }

    console.log(
      "📋 Cronograma recebido pela URL:",
      cronogramaIdUrl
    );

    setCronogramaId(cronogramaIdUrl);
    setConversaId(null);
  }, [cronogramaIdUrl, modo]);

  // =========================================================
  // SELECIONAR CRONOGRAMA
  // =========================================================

  function selecionarCronograma(id: string) {
    console.log(
      "📋 Cronograma selecionado:",
      id
    );

    setModo("cronograma");
    setCronogramaId(id);
    setConversaId(null);
  }

  // =========================================================
  // MOSTRAR CONVERSAS
  // =========================================================

  function mostrarConversas() {
    console.log(
      "💬 Abrindo conversas iniciadas"
    );

    setModo("conversas");
    setCronogramaId(null);
    setConversaId(null);
  }

  // =========================================================
  // SOCKET - NOVA MENSAGEM
  // =========================================================

  useEffect(() => {
    function novaMensagem(data: {
      conversaId?: string;
    }) {
      console.log(
        "📩 Nova mensagem recebida:",
        data
      );

      if (data?.conversaId) {
        setConversaId(data.conversaId);
      }
    }

    socket.on(
      "novaMensagem",
      novaMensagem
    );

    return () => {
      socket.off(
        "novaMensagem",
        novaMensagem
      );
    };
  }, []);

  // =========================================================
  // LAYOUT
  // =========================================================

  return (
    <div className="flex h-screen w-full overflow-hidden bg-gray-100">

      {/* =====================================================
          COLUNA 1 - CRONOGRAMAS
          ===================================================== */}

      <aside className="h-full w-80 shrink-0 overflow-hidden border-r bg-white">

        <ListaCronogramas
          bloco={bloco}
          polo={polo}
          empresa={empresa}
          data={data}
          cronogramaSelecionado={
            modo === "cronograma"
              ? cronogramaId
              : null
          }
          onSelecionar={
            selecionarCronograma
          }
          onMostrarConversas={
            mostrarConversas
          }
          modoConversas={
            modo === "conversas"
          }
        />

      </aside>

      {/* =====================================================
          COLUNA 2 - ALUNOS / CONVERSAS
          ===================================================== */}

      <aside className="h-full w-96 shrink-0 overflow-hidden border-r bg-white">

        <ListaConversas
          cronogramaId={
            modo === "cronograma"
              ? cronogramaId
              : null
          }
          conversaSelecionada={
            conversaId
          }
          onSelecionar={
            setConversaId
          }
        />

      </aside>

      {/* =====================================================
          COLUNA 3 - JANELA DO CHAT
          ===================================================== */}

      <main className="h-full min-w-0 flex-1 overflow-hidden bg-white">

        <JanelaChat
          conversaId={conversaId}
        />

      </main>

    </div>
  );
}

// =============================================================
// PÁGINA
// =============================================================

export default function AtendimentoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex h-screen w-full items-center justify-center bg-gray-100">
          <div className="text-gray-500">
            Carregando atendimento...
          </div>
        </div>
      }
    >
      <AtendimentoContent />
    </Suspense>
  );
}