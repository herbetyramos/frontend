"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { api } from "@/services/api";
import { socket } from "@/services/socket";

import CampoMensagem from "./CampoMensagem";
import CabecalhoChat from "./CabecalhoChat";


interface Mensagem {
  id: string;
  conversaId: string;
  texto: string;
  enviado: boolean;
  lida: boolean;
  created_at: string;
}


interface Conversa {
  id: string;
  nome?: string;
  telefone: string;
}


interface Props {
  conversaId: string | null;
}


export default function JanelaChat({
  conversaId,
}: Props) {


  const [mensagens, setMensagens] =
    useState<Mensagem[]>([]);

  const [conversa, setConversa] =
    useState<Conversa | null>(null);

  const [loading, setLoading] =
    useState(false);


  const fimMensagensRef =
    useRef<HTMLDivElement>(null);



  function rolarParaFim() {

    setTimeout(() => {

      fimMensagensRef.current?.scrollIntoView({
        behavior: "smooth",
      });

    }, 100);

  }



  const carregar = useCallback(async () => {


    if (!conversaId) return;


    try {

      setLoading(true);


      const { data } = await api.get(
        `/chat/${conversaId}`
      );


      if (Array.isArray(data)) {

        setMensagens(data);

        return;

      }


      setMensagens(
        data.mensagens ?? []
      );


      setConversa(
        data.conversa ?? null
      );


      rolarParaFim();


    } catch (error) {

      console.error(
        "Erro ao carregar conversa:",
        error
      );


    } finally {

      setLoading(false);

    }


  }, [conversaId]);





  useEffect(() => {


    if (!conversaId) {

      setMensagens([]);
      setConversa(null);

      return;

    }


    carregar();


    socket.emit(
      "join",
      conversaId
    );



    return () => {

      socket.emit(
        "leave",
        conversaId
      );

    };


  }, [
    conversaId,
    carregar
  ]);






  useEffect(() => {


    function novaMensagem(
      msg: Mensagem
    ) {


      if (
        msg.conversaId !== conversaId
      ) {
        return;
      }


      setMensagens((anteriores) => {


        const existe =
          anteriores.some(
            (m) => m.id === msg.id
          );


        if (existe) {

          return anteriores;

        }


        return [
          ...anteriores,
          msg
        ];


      });


      rolarParaFim();


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


  }, [conversaId]);






  function formatarHora(data: string) {

    return new Date(data)
      .toLocaleTimeString(
        "pt-BR",
        {
          hour: "2-digit",
          minute: "2-digit",
        }
      );

  }






  if (!conversaId) {

    return (

      <div
        className="
          flex-1
          flex
          items-center
          justify-center
          text-gray-500
          bg-gray-100
        "
      >

        Selecione um aluno

      </div>

    );

  }





  return (

    <div
      className="
        flex
        flex-col
        flex-1
        bg-gray-100
      "
    >



      {conversa && (

        <CabecalhoChat

          nome={conversa.nome}

          telefone={conversa.telefone}

        />

      )}






      <div
        className="
          flex-1
          overflow-y-auto
          p-5
        "
      >



        {loading && (

          <div className="text-center text-gray-500">

            Carregando mensagens...

          </div>

        )}






        {!loading &&
          mensagens.length === 0 && (

          <div
            className="
              text-center
              text-gray-500
              mt-10
            "
          >

            Nenhuma mensagem nesta conversa.

          </div>

        )}






        {mensagens.map((msg) => (

          <div

            key={msg.id}

            className={`
              mb-3
              flex
              ${
                msg.enviado
                ? "justify-end"
                : "justify-start"
              }
            `}

          >



            <div

              className={`
                rounded-lg
                px-4
                py-2
                max-w-md
                shadow

                ${
                  msg.enviado
                  ? "bg-green-600 text-white"
                  : "bg-white border"
                }
              `}

            >


              <div>

                {msg.texto}

              </div>


              <div

                className={`
                  text-[11px]
                  mt-1
                  text-right

                  ${
                    msg.enviado
                    ? "text-green-100"
                    : "text-gray-500"
                  }
                `}

              >

                {formatarHora(
                  msg.created_at
                )}

              </div>


            </div>


          </div>

        ))}



        <div ref={fimMensagensRef} />


      </div>






      <CampoMensagem

        conversaId={conversaId}

      />


    </div>

  );

}