"use client";

import { DadosCronogramaType } from "../types";


interface Props {

  dados: DadosCronogramaType | null;

}


export default function ResumoCronograma({

  dados

}: Props) {


  if (!dados) {

    return null;

  }


  const {

    cronograma

  } = dados;



  return (

    <div className="bg-white rounded-lg shadow p-2">


      <h2 className="text-xl font-bold mb-4 text-gray-800">

        Dados da Turma

      </h2>



      <div className="
        grid
        md:grid-cols-2
        gap-4
      ">



        <div>

          <span className="font-semibold">

            Tema:

          </span>


          <p>

            {cronograma.tema}

          </p>


        </div>





        <div>

          <span className="font-semibold">

            Curso:

          </span>


          <p>

            {
              cronograma
             .detentoras
             ?.curso
            ?.nome_curso || "-"
            }

          </p>


        </div>





        <div>

          <span className="font-semibold">

            Professor:

          </span>


          <p>

            {
              cronograma.professor?.nome_professor || "-"
            }

          </p>


        </div>





        <div>

          <span className="font-semibold">

            Sala:

          </span>


          <p>

            {
              cronograma.salaAula?.tipo_uso || "-"
            }

          </p>


        </div>





        <div>

          <span className="font-semibold">

            Local:

          </span>


          <p>

            {
              cronograma
              .localAula
              ?.polo || "-"
            }

          </p>


        </div>





        <div>

          <span className="font-semibold">

            Formatura:

          </span>


          <p>

            {
              cronograma
              .formatura
              ?.data_formatura || "-"
            }

          </p>


        </div>





        <div>

          <span className="font-semibold">

            Período:

          </span>


          <p>

            {cronograma.data_inicio}

            {" até "}

            {cronograma.data_fim}


          </p>


        </div>





        <div>

          <span className="font-semibold">

            Horário:

          </span>


          <p>

            {cronograma.hora_inicio}

            {" às "}

            {cronograma.hora_fim}


          </p>


        </div>



      </div>


    </div>

  );

}