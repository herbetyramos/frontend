"use client";

import { CronogramaType } from "../types";


interface Props {

  cronogramas: CronogramaType[];

  valorSelecionado: string;

  onChange: (id: string) => void;

}


export default function CronogramaSelect({

  cronogramas,

  valorSelecionado,

  onChange

}: Props) {


  return (

    <div className="bg-white rounded-xl shadow p-6">


      <label className="block font-semibold mb-0">

        Curso

      </label>



      <select

        value={valorSelecionado}

        onChange={(e)=>

          onChange(e.target.value)

        }

        className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          bg-white
        "

      >


        <option value="">

          Selecione uma turma

        </option>



        {cronogramas.map((item)=>(


          <option

            key={item.id}

            value={item.id}

          >

            {item.tema}

            {" - "}

            {item.data_inicio}


          </option>


        ))}



      </select>


    </div>

  );

}