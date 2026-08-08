"use client";

import { MatriculaType } from "../types";


interface Props {

  matriculas: MatriculaType[];

  onExcluir:(id:string)=>void;

  onEditar:(item:MatriculaType)=>void;

}



export default function ListaMatriculados({
  matriculas,
  onExcluir,
  onEditar
}: Props) {



  return (


    <div className="bg-white rounded-lg shadow p-2">



      {matriculas.length === 0 ? (



        <p className="text-gray-500">

          Nenhum aluno matriculado.

        </p>



      ) : (




        <div className="overflow-x-auto">


          <table className="
            w-full
            border-collapse
          ">



            <thead>


              <tr className="border-b">


                <th className="px-2 py-1 text-left text-sm">

                  Nome

                </th>



                <th className="px-2 py-1 text-left text-sm">

                  CPF

                </th>



                <th className="px-2 py-1 text-left text-sm">

                  Ação

                </th>



              </tr>


            </thead>





            <tbody>


              {matriculas.map((item)=>(



                <tr

                  key={item.id}

                  className="
                    border-b
                    hover:bg-gray-50
                  "

                >



                  <td className="px-2 py-1 text-sm">

                    {item.aluno?.nome || "Aluno não informado"}

                  </td>





                  <td className="px-2 py-1 text-sm">

                    {item.aluno?.CPF || "Falta CPF"}

                  </td>





                  <td className="
                      px-2
                      py-1
                      text-center
                      text-sm
                    ">

                

                  <div className="flex justify-center gap-2">

                  <button

                    onClick={() => onEditar(item)}

                    className="
                    bg-yellow-500
                    text-white
                    px-3
                    py-1
                    rounded-lg
                    "

                    >
                    Editar
                    </button>

                    <button
                      onClick={() => onExcluir(item.id)}
                      className="
                        bg-red-500
                        hover:bg-red-600
                        text-white
                        px-2
                        py-1
                        rounded-md
                        text-xs
                      "
                    >
                      Excluir
                    </button>

                  </div>

                </td>



                  



                </tr>


              ))}



            </tbody>


          </table>


        </div>



      )}



    </div>


  );

}