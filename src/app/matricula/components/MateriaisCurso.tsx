"use client";

import { MaterialType } from "../types";


interface Props {

  materiais: MaterialType[];

}



export default function MateriaisCurso({

  materiais

}: Props) {



  return (

    <div className="bg-white rounded-lg shadow p-2">


      <h2 className="text-xl font-bold mb-4 text-gray-800">

        Materiais do Curso

      </h2>




      {materiais.length === 0 ? (


        <p className="text-gray-500">

          Nenhum material cadastrado para este curso.

        </p>


      ) : (



        <div className="overflow-x-auto">


          <table className="
            w-full
            border-collapse
          ">


            <thead>


              <tr className="
                border-b
                text-left
              ">


                <th className="p-3">

                  Material

                </th>



                <th className="p-3">

                  Quantidade

                </th>



                <th className="p-3">

                  Propriedade

                </th>


              </tr>


            </thead>




            <tbody>



              {materiais.map((material)=>(



                <tr

                  key={material.id}

                  className="
                    border-b
                    hover:bg-gray-50
                  "

                >



                  <td className="p-3">

                    {material.nome_material}

                  </td>




                  <td className="p-3">

                    {material.qtde}

                  </td>




                  <td className="p-3">


                    <span

                      className={`
                        px-3
                        py-1
                        rounded-full
                        text-sm
                        ${
                          material.propriedade
                          === "PERMANENTE"

                          ? 
                          "bg-green-100 text-green-700"

                          :

                          "bg-yellow-100 text-yellow-700"
                        }
                      `}

                    >


                      {material.propriedade}



                    </span>


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