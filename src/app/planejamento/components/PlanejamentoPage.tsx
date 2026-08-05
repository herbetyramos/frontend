"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Save } from "lucide-react";
import { toast } from "react-toastify";

import { api } from "@/services/api";
import LinhaPlanejamento from "./LinhaPlanejamento";


interface Planejamento {

    id:string;
    dia:number;
    conteudo:string;
    finalizado:boolean;

    curso_programado?:{
        tema:string;
    };

}



export default function PlanejamentoPage(){


    const params = useSearchParams();

    const router = useRouter();


    const planeja_id =
        params.get("id");



    const [lista,setLista] =
        useState<Planejamento[]>([]);



    const [loading,setLoading] =
        useState(false);



    const [temaCurso,setTemaCurso] =
        useState("");



    const [planejamentoSalvo,setPlanejamentoSalvo] =
        useState(false);





 const carregar = useCallback(async () => {

  if (!planeja_id) return;

  try {

    let response = await api.get(`/planejamento/${planeja_id}`);

    // Se ainda não existe planejamento, cria automaticamente
    if (response.data.length === 0) {

      await api.post(`/planejamento/gerar/${planeja_id}`);

      response = await api.get(`/planejamento/${planeja_id}`);
    }

    setLista(response.data);

    if (response.data.length > 0) {
      setTemaCurso(
        response.data[0].curso_programado?.tema ?? ""
      );
    }

  } catch (error: any) {

    console.log("ERRO:", error.response?.data);

    toast.error(
      error.response?.data?.error ??
      "Erro ao carregar planejamento"
    );
  }

}, [planeja_id]);






    useEffect(()=>{


        carregar();


    },[carregar]);







    function alterar(
        index:number,
        valor:string
    ){


        setLista(
            anterior =>

            anterior.map(
                (item,i)=>

                i === index

                ?

                {
                    ...item,
                    conteudo:valor
                }

                :

                item

            )
        );


    }









    async function salvarTudo(){


        try{


            setLoading(true);



            await api.put(

                "/planejamento/salvar-tudo",

                {

                    planejamentos:lista

                }

            );



            toast.success(
                "Planejamento salvo com sucesso!"
            );



            setPlanejamentoSalvo(true);



            await carregar();



        }catch(error:any){


            console.log(
                "ERRO SALVAR:",
                error.response?.data
            );


            toast.error(
                error.response?.data?.error ??
                "Erro ao salvar planejamento"
            );


        }finally{


            setLoading(false);


        }


    }







    const bloqueado =

        lista.length > 0 &&

        lista.every(
            item =>
            item.finalizado
        );









    return (

        <div
        className="
        max-w-5xl
        mx-auto
        p-4
        "
        >



            <div
            className="
            flex
            flex-col
            md:flex-row
            md:justify-between
            mb-5
            border-b
            pb-3
            "
            >


                <h1
                className="
                text-2xl
                font-bold
                "
                >

                    Planejamento das Aulas

                </h1>



                <div>

                    <span
                    className="
                    font-semibold
                    "
                    >

                        Tema:

                    </span>


                    <span
                    className="
                    text-blue-700
                    font-semibold
                    ml-2
                    "
                    >

                        {temaCurso || "-"}

                    </span>


                </div>


            </div>





            {
                bloqueado &&

                <div
                className="
                mb-4
                rounded
                border
                border-green-300
                bg-green-100
                p-3
                text-green-800
                "
                >

                    ✅ Planejamento finalizado.

                </div>

            }







            <div
            className="
            overflow-x-auto
            border
            rounded
            "
            >


                <table
                className="
                w-full
                "
                >


                    <thead
                    className="
                    bg-blue-600
                    text-white
                    "
                    >

                        <tr>

                            <th
                            className="p-3 w-20"
                            >
                                Dia
                            </th>


                            <th
                            className="p-3"
                            >
                                Aula Planejada
                            </th>

                        </tr>


                    </thead>



                    <tbody>


                    {
                        lista.map(
                            (item,index)=>(

                            <LinhaPlanejamento

                            key={item.id}

                            dia={item.dia}

                            value={item.conteudo}

                            bloqueado={bloqueado}

                            onChange={
                                texto =>
                                alterar(
                                    index,
                                    texto
                                )
                            }

                            />

                        ))
                    }


                    </tbody>


                </table>


            </div>








            <div
            className="
            mt-6
            flex
            justify-end
            "
            >



                {
                    !planejamentoSalvo &&

                    <button

                    onClick={salvarTudo}

                    disabled={
                        bloqueado ||
                        loading
                    }

                    className="
                    flex
                    items-center
                    gap-2
                    bg-blue-600
                    text-white
                    px-5
                    py-2
                    rounded
                    disabled:bg-gray-400
                    "

                    >

                        <Save size={18}/>

                        {
                            loading
                            ?
                            "Salvando..."
                            :
                            "Salvar Planejamento"
                        }

                    </button>

                }



                {
                    planejamentoSalvo &&

                    <button

                    onClick={()=>


                        router.push(

                            `/materiais-solicitacao/${planeja_id}`

                        )


                    }


                    className="
                    bg-green-600
                    text-white
                    px-6
                    py-3
                    rounded
                    font-semibold
                    "

                    >

                        Solicitar Materiais

                    </button>


                }



            </div>



        </div>

    );

}