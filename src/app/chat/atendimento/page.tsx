"use client";

import { useSearchParams } from "next/navigation";
import { useState } from "react";

import ListaCronogramas from "@/components/chat/atendimento/ListaCronogramas";
import ListaConversas from "@/components/chat/ListaConversas";
import JanelaChat from "@/components/chat/JanelaChat";


export default function AtendimentoPage() {

  const searchParams = useSearchParams();


  const bloco = searchParams.get("bloco");
  const polo = searchParams.get("polo");
  const empresa = searchParams.get("empresa");
  const data = searchParams.get("data");


  const [cronogramaId,setCronogramaId] =
    useState<string | null>(null);


  const [conversaId,setConversaId] =
    useState<string | null>(null);



  return (

    <div className="flex h-screen">


      <ListaCronogramas

        bloco={bloco}

        polo={polo}

        empresa={empresa}

        data={data}

        cronogramaSelecionado={cronogramaId}

        onSelecionar={(id)=>{

          setCronogramaId(id);

          setConversaId(null);

        }}

      />


      <ListaConversas

        cronogramaId={cronogramaId}

        conversaSelecionada={conversaId}

        onSelecionar={setConversaId}

      />


      <JanelaChat

        conversaId={conversaId}

      />


    </div>

  );
}