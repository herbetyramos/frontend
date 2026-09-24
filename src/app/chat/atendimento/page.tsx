
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

// =====================================================
// CONTEÚDO DA PÁGINA
// =====================================================

function AtendimentoContent() {
  const searchParams = useSearchParams();

  // =====================================================
  // FILTROS RECEBIDOS PELA URL
  // =====================================================

  const bloco = searchParams.get("bloco");
  const polo = searchParams.get("polo");
  const empresa = searchParams.get("empresa");
  const data = searchParams.get("data");

  // =====================================================
  // ESTADOS
  // =====================================================

  const [cronogramaId, setCronogramaId] =
    useState<string | null>(null);

  const [conversaId, setConversaId] =
    useState<string | null>(null);

  // =====================================================
  // RECEBER NOVA MENSAGEM
  // =====================================================

  useEffect(() => {
    function novaMensagem(data: {
      conversaId?: string;
    }) {
      if (!data?.conversaId) {
        return;
      }

      console.log(
        "📩 Nova mensagem recebida. Selecionando conversa:",
        data.conversaId
      );

      setConversaId(data.conversaId);
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

  // =====================================================
  // SELECIONAR CRONOGRAMA
  // =====================================================

  function selecionarCronograma(id: string) {
    setCronogramaId(id);

    // Quando trocar de turma,
    // limpa a conversa selecionada.
    setConversaId(null);
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <div className="flex h-screen bg-gray-100">
      {/* =================================================
          LISTA DE CRONOGRAMAS
      ================================================= */}

      <ListaCronogramas
        bloco={bloco}
        polo={polo}
        empresa={empresa}
        data={data}
        cronogramaSelecionado={
          cronogramaId
        }
        onSelecionar={
          selecionarCronograma
        }
      />

      {/* =================================================
          LISTA DE CONVERSAS
      ================================================= */}

      <ListaConversas
        cronogramaId={cronogramaId}
        conversaSelecionada={
          conversaId
        }
        onSelecionar={
          setConversaId
        }
      />

      {/* =================================================
          JANELA DO CHAT
      ================================================= */}

      <JanelaChat
        conversaId={conversaId}
      />
    </div>
  );
}

// =====================================================
// PÁGINA
// =====================================================

export default function AtendimentoPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-500">
            Carregando atendimento...
          </p>
        </div>
      }
    >
      <AtendimentoContent />
    </Suspense>
  );
}

