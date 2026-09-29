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

    console.log(
      "📋 Cronograma recebido pela URL:",
      cronogramaIdUrl
    );

    setCronogramaId((atual) => {
      if (atual === cronogramaIdUrl) {
        return atual;
      }

      return cronogramaIdUrl;
    });
  }, [cronogramaIdUrl]);

  // =========================================================
  // SELECIONAR CRONOGRAMA
  // =========================================================

  const selecionarCronograma = useCallback(
    (id: string) => {
      console.log(
        "📋 Cronograma selecionado:",
        id
      );

      // Volta para o modo normal do cronograma.
      setModo("cronograma");

      // Mantém o cronograma selecionado.
      setCronogramaId((atual) => {
        if (atual === id) {
          return atual;
        }

        return id;
      });

      // Ao trocar de cronograma, fecha a conversa aberta.
      setConversaId(null);
    },
    []
  );

  // =========================================================
  // MOSTRAR TODAS AS CONVERSAS
  // =========================================================
  //
  // IMPORTANTE:
  //
  // NÃO apagamos o cronogramaId aqui.
  //
  // O cronograma continua selecionado na coluna 1,
  // mantendo o foco azul.
  //
  // Apenas mudamos o modo da coluna 2 para "conversas".
  // =========================================================

  const mostrarConversas = useCallback(() => {
    console.log(
      "💬 Abrindo todas as conversas"
    );

    setModo("conversas");

    // NÃO fazer:
    // setCronogramaId(null);

    // A conversa anteriormente selecionada deixa de ser
    // automaticamente aberta ao entrar na lista geral.
    setConversaId(null);
  }, []);

  // =========================================================
  // SELECIONAR CONVERSA
  // =========================================================

  const selecionarConversa = useCallback(
    (id: string | null) => {
      console.log(
        "💬 Conversa selecionada:",
        id
      );

      setConversaId(id);
    },
    []
  );

  // =========================================================
  // SOCKET - NOVA MENSAGEM
  // =========================================================

  useEffect(() => {
    function novaMensagem(data: {
      conversaId?: string;
    }) {
      console.log(
        "📩 Nova mensagem recebida pelo atendimento:",
        data
      );

      // A ListaConversas controla a atualização
      // da lista e dos contadores.

      // NÃO alterar conversaId aqui.
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

          /*
           * IMPORTANTE:
           * O cronograma continua sendo passado mesmo quando
           * estamos no modo "conversas".
           *
           * Assim o foco azul permanece.
           */
          cronogramaSelecionado={
            cronogramaId
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
          COLUNA 2 - ALUNOS / TODAS AS CONVERSAS
          ===================================================== */}

      <aside className="h-full w-96 shrink-0 overflow-hidden border-r bg-white">

        <ListaConversas
          /*
           * O cronograma continua sendo informado mesmo
           * no modo "conversas".
           *
           * O ListaConversas usará modoConversas para
           * decidir se deve mostrar alunos ou todas as
           * conversas.
           */
          cronogramaId={
            cronogramaId
          }

          conversaSelecionada={
            conversaId
          }

          onSelecionar={
            selecionarConversa
          }

          modoConversas={
            modo === "conversas"
          }
        />

      </aside>

      {/* =====================================================
          COLUNA 3 - JANELA DO CHAT
          ===================================================== */}

      <main className="h-full min-w-0 flex-1 overflow-hidden bg-white">

        <JanelaChat
          conversaId={
            conversaId
          }
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