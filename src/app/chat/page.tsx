"use client";

import { useEffect, useState } from "react";
import { useSearchParams } from "next/navigation";

import ListaCronogramas from "@/components/chat/atendimento/ListaCronogramas";
import ListaConversas from "@/components/chat/ListaConversas";
import JanelaChat from "@/components/chat/JanelaChat";


export default function AtendimentoPage() {

  const searchParams = useSearchParams();


  const [cronogramaId, setCronogramaId] = useState<string | null>(null);

  const [conversaSelecionada, setConversaSelecionada] =
    useState<string | null>(null);



  useEffect(() => {

    const id = searchParams.get("cronograma");

    if (id) {

      setCronogramaId(id);

    }

  }, [searchParams]);



  function selecionarCronograma(id: string) {

    setCronogramaId(id);

    // limpa conversa quando troca de turma
    setConversaSelecionada(null);

  }



  return (

    <div className="flex h-screen bg-gray-100">


      <ListaCronogramas

        cronogramaSelecionado={cronogramaId}

        onSelecionar={selecionarCronograma}

      />



      <ListaConversas

        cronogramaId={cronogramaId}

        conversaSelecionada={conversaSelecionada}

        onSelecionar={setConversaSelecionada}

      />



      <JanelaChat

        conversaId={conversaSelecionada}

      />


    </div>

  );

}