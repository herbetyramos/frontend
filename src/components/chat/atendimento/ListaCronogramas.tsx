"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/services/api";

interface Cronograma {
  id: string;
  codigo: number;
  tema: string;

  data_inicio: string;
  data_fim: string;

  bloco_curso?: {
    bloco_Curso?: string;
  };

  localAula?: {
    polo?: string;
  };

  detentoras?: {
    ata?: {
      empresa?: {
        nome_empresa?: string;
      };
    };
  };

  formatura?: {
    data_formatura?: string;
  };

  quantidadeAlunos?: number;
}


interface Props {

  bloco?: string | null;
  polo?: string | null;
  empresa?: string | null;
  data?: string | null;

  cronogramaSelecionado: string | null;

  onSelecionar(id: string): void;

}


export default function ListaCronogramas({

  bloco,
  polo,
  empresa,
  data,

  cronogramaSelecionado,
  onSelecionar,

}: Props) {


  const [cronogramas, setCronogramas] =
    useState<Cronograma[]>([]);

  const [loading, setLoading] =
    useState(false);



  const carregarCronogramas = useCallback(async () => {

    try {

      setLoading(true);


      const { data: resposta } =
        await api.get<Cronograma[]>(
          "/listcronograma"
        );


      let lista = resposta;



      // FILTRO BLOCO
      if (bloco) {

        lista = lista.filter(
          (item) =>
            item.bloco_curso?.bloco_Curso === bloco
        );

      }



      // FILTRO POLO
      if (polo) {

        lista = lista.filter(
          (item) =>
            item.localAula?.polo === polo
        );

      }



      // FILTRO EMPRESA
      if (empresa) {

        lista = lista.filter(
          (item) =>
            item.detentoras?.ata?.empresa?.nome_empresa === empresa
        );

      }



      // FILTRO FORMATURA
      if (data) {

        lista = lista.filter(
          (item) =>
            item.formatura?.data_formatura === data
        );

      }



      setCronogramas(lista);


    } catch(error) {


      console.error(
        "Erro ao carregar cronogramas:",
        error
      );


    } finally {


      setLoading(false);


    }


  }, [
    bloco,
    polo,
    empresa,
    data
  ]);





  useEffect(() => {

    carregarCronogramas();

  }, [
    carregarCronogramas
  ]);





  function formatarData(data?: string) {

    if (!data) return "";


    return new Date(data)
      .toLocaleDateString(
        "pt-BR"
      );

  }





  return (

    <div className="w-80 border-r bg-white flex flex-col">


      <div className="p-4 border-b bg-blue-600 text-white">

        <h2 className="text-xl font-bold">
          Cronogramas
        </h2>

      </div>




      <div className="flex-1 overflow-y-auto">



        {loading && (

          <div className="p-6 text-center text-gray-500">

            Carregando...

          </div>

        )}





        {!loading &&
          cronogramas.length === 0 && (

          <div className="p-6 text-center text-gray-500">

            Nenhum cronograma encontrado.

          </div>

        )}






        {cronogramas.map((item) => (

          <button

            key={item.id}

            onClick={() =>
              onSelecionar(item.id)
            }


            className={`

              w-full
              text-left
              px-4
              py-3
              border-b
              hover:bg-gray-100


              ${
                cronogramaSelecionado === item.id
                  ? "bg-blue-50"
                  : ""
              }

            `}


          >


            <div className="font-semibold">

              {item.tema}

            </div>



            <div className="text-sm text-gray-500">

              📚 {item.bloco_curso?.bloco_Curso}

            </div>



            <div className="text-sm text-gray-500">

              📍 {item.localAula?.polo}

            </div>




            <div className="text-sm text-gray-500">

              📅 {formatarData(item.data_inicio)}

            </div>




            <div className="text-sm text-gray-500">

              👨‍🎓 {item.quantidadeAlunos ?? 0} alunos

            </div>



          </button>

        ))}



      </div>


    </div>

  );

}