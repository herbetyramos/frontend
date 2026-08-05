"use client";

import { useCallback, useEffect, useState } from "react";
import { useParams } from "next/navigation";
import { api } from "@/services/api";
import { toast } from "react-toastify";


type MaterialType = {
    id: string;
    nome_material: string;
    qtde: number;
    propriedade: "PERMANENTE" | "NAO_PERMANENTE";
};


type SelecionadoType = {
    id_material: string;
    nome_material: string;
    quantidade: number;
};

type CronogramaType = {
    id: string;
    tema: string;
    data_inicio: string;
    data_fim: string;
    detentoras?: {
        empresa?: {
            nome_empresa: string;
        };
    };
};



export default function SolicitacaoMaterialPage(){


   const params = useParams();

    const idCronograma =
    params.id_cronograma as string;



    const [materiais,setMateriais] =
        useState<MaterialType[]>([]);

    const [cronograma,setCronograma] =
    useState<CronogramaType | null>(null);    



    const [selecionados,setSelecionados] =
        useState<SelecionadoType[]>([]);



    const [observacao,setObservacao] =
        useState("");



    const [loading,setLoading] =
        useState(false);





    const carregarMateriais = useCallback(async () => {

    if (!idCronograma) return;

    try {

        const response = await api.get(
            "/solicitacao-material/materiais",
            {
                params: {
                    id: idCronograma
                }
            }
        );

      

console.log(
    "Não permanentes:",
    materiais.filter(
        m => m.propriedade === "NAO_PERMANENTE"
    )
);

        const dados = response.data;

        if (Array.isArray(dados)) {

            setMateriais(dados);

        } else if (Array.isArray(dados.materiais)) {

            setMateriais(dados.materiais);

        } else {

            setMateriais([]);

        }

    } catch (error: any) {

        console.log(error.response?.data);

                setMateriais([]);

                toast.error("Erro ao carregar materiais");

            }

            }, [idCronograma]);

    const carregarCronograma = useCallback(async () => {

    if (!idCronograma) return;

    try {

        const response = await api.get(
            `/cronograma/${idCronograma}`
        );

        setCronograma(response.data);

    } catch (error) {

        console.log(error);

    }

}, [idCronograma]);




    useEffect(() => {

    carregarCronograma();

            carregarMateriais();

        }, [
            carregarCronograma,
            carregarMateriais
        ]);





    function selecionarMaterial(
        material:MaterialType
    ){


        const existe =
            selecionados.some(
                item =>
                item.id_material === material.id
            );



        if(existe){


            setSelecionados(
                anterior =>
                anterior.filter(
                    item =>
                    item.id_material !== material.id
                )
            );


            return;

        }



        setSelecionados(
            anterior => [
                ...anterior,
                {
                    id_material:material.id,
                    nome_material:material.nome_material,
                    quantidade:1
                }
            ]
        );


    }





    function alterarQuantidade(
        id_material:string,
        quantidade:number
    ){


        setSelecionados(
            anterior =>
            anterior.map(item =>
                item.id_material === id_material
                ?
                {
                    ...item,
                    quantidade
                }
                :
                item
            )
        );


    }

        function cancelarMaterial(
        id_material:string
    ){

        setSelecionados(
            anterior =>
            anterior.filter(
                item =>
                item.id_material !== id_material
            )
        );

    }







    async function salvarSolicitacao(){


        if(selecionados.length === 0){


            toast.warning(
                "Selecione pelo menos um material"
            );


            return;

        }



        try{


            setLoading(true);



           await api.post("/solicitacao-material", {

    id_cronograma: idCronograma,

    observacao,

    itens: selecionados.map(item => ({

        id_material: item.id_material,

        quantidade: item.quantidade

    }))

});



            toast.success(
                "Solicitação de materiais enviada!"
            );

            setSelecionados([]);

            setObservacao("");



        }catch(error:any){


            console.log(
                error.response?.data
            );


            toast.error(
                "Erro ao salvar solicitação"
            );


        }finally{


            setLoading(false);


        }


    }







    const materiaisPermanentes =
    (materiais ?? []).filter(
        material =>
            material.propriedade === "PERMANENTE"
    );



    const materiaisNaoPermanentes =
    (materiais ?? []).filter(
        material =>
            material.propriedade === "NAO_PERMANENTE"
    );




    function MaterialLinha({

        material

    }:{
        material:MaterialType;

    }){


        const selecionado =
            selecionados.find(
                item =>
                item.id_material === material.id
            );



        return (

            <tr
            key={material.id}
            className="border-b"
            >


                <td
                className="
                p-3
                text-center
                "
                >


                    <input

                    type="checkbox"

                    checked={
                        !!selecionado
                    }


                    onChange={()=>
                        selecionarMaterial(
                            material
                        )
                    }

                    />


                </td>





                <td
                className="p-3"
                >

                    {material.nome_material}

                </td>





                <td
                className="
                p-3
                text-center
                "
                >

                    {material.qtde ?? 0}

                </td>





                <td
                className="
                p-3
                text-center
                "
                >


                {
                    selecionado && (

                        <input

                        type="number"

                        min="1"

                        className="
                        border
                        rounded
                        w-20
                        p-1
                        text-center
                        "

                        value={
                            selecionado.quantidade
                        }


                        onChange={
                            e =>
                            alterarQuantidade(
                                material.id,
                                Number(
                                    e.target.value
                                )
                            )
                        }


                        />

                    )
                }


                </td>





                <td
                className="
                p-3
                text-center
                "
                >


                {
                    selecionado && (

                        <button

                        onClick={()=>
                            cancelarMaterial(
                                material.id
                            )
                        }


                        className="
                        bg-red-600
                        text-white
                        px-3
                        py-1
                        rounded
                        "

                        >

                            Cancelar

                        </button>

                    )
                }


                </td>


            </tr>

        );


    }

        function GrupoMateriais({

        titulo,

        lista

    }:{
        titulo:string;
        lista:MaterialType[];

    }){


        return (

            <div
            className="
            mb-8
            "
            >


                <h2
                className="
                text-xl
                font-bold
                mb-3
                text-blue-700
                "
                >

                    {titulo}

                </h2>




                <div
                className="
                border
                rounded
                overflow-hidden
                "
                >


                    <table
                    className="
                    w-full
                    "
                    >


                        <thead
                        className="
                        bg-gray-100
                        "
                        >

                            <tr>


                                <th
                                className="p-3"
                                >

                                    Escolher

                                </th>


                                <th
                                className="p-3 text-left"
                                >

                                    Material

                                </th>


                                <th
                                className="p-3"
                                >

                                    Disponível

                                </th>


                                <th
                                className="p-3"
                                >

                                    Quantidade

                                </th>


                                <th
                                className="p-3"
                                >

                                    Ação

                                </th>


                            </tr>


                        </thead>



                        <tbody>


                        {
                            lista.map(material=>(

                                <MaterialLinha

                                key={material.id}

                                material={material}

                                />

                            ))
                        }


                        </tbody>


                    </table>


                </div>


            </div>

        );

    }








    return (

        <div
        className="
        p-6
        max-w-6xl
        mx-auto
        "
        >


            <h1
            className="
            text-3xl
            font-bold
            mb-2
            "
            >

                Solicitação de Materiais

            </h1>

            {cronograma && (

    <div className="mb-6 rounded border bg-blue-50 p-4">

        <p>

            <strong>Curso:</strong>

            {" "}

            {cronograma.tema}

        </p>

        <p>

            <strong>Período:</strong>

            {" "}

            {new Date(
                cronograma.data_inicio
            ).toLocaleDateString("pt-BR")}

            {" até "}

            {new Date(
                cronograma.data_fim
            ).toLocaleDateString("pt-BR")}

        </p>

        {cronograma.detentoras?.empresa && (

            <p>

                <strong>Detentora:</strong>

                {" "}

                {cronograma.detentoras.empresa.nome_empresa}

            </p>

        )}

    </div>

)}



            <p
            className="
            text-gray-600
            mb-6
            "
            >

                Cronograma: {idCronograma}

            </p>





            <GrupoMateriais

            titulo="Materiais Permanentes"

            lista={materiaisPermanentes}

            />





            <GrupoMateriais

            titulo="Materiais Não Permanentes"

            lista={materiaisNaoPermanentes}

            />







            <div
            className="
            mt-8
            "
            >


                <label
                className="
                block
                font-semibold
                mb-2
                "
                >

                    Observação do Professor

                </label>



                <textarea

                className="
                border
                rounded
                w-full
                p-3
                "

                rows={4}


                value={observacao}


                onChange={
                    e =>
                    setObservacao(
                        e.target.value
                    )
                }


                placeholder="
                Informe alguma observação para o almoxarifado
                "

                />


            </div>







            <div
            className="
            mt-8
            border
            rounded
            p-4
            "
            >


                <h2
                className="
                font-bold
                mb-3
                "
                >

                    Materiais Selecionados

                </h2>




                {
                    selecionados.length === 0

                    ?

                    <p>
                        Nenhum material selecionado.
                    </p>

                    :

                    <ul>

                    {
                        selecionados.map(item=>(

                            <li
                            key={item.id_material}
                            className="
                            flex
                            justify-between
                            border-b
                            py-2
                            "
                            >

                                <span>

                                    {item.nome_material}

                                </span>


                                <span>

                                    Quantidade:
                                    {" "}
                                    {item.quantidade}

                                </span>


                            </li>

                        ))
                    }

                    </ul>

                }


            </div>







            <button

            onClick={
                salvarSolicitacao
            }


            disabled={loading}


            className="
            mt-8
            bg-green-600
            hover:bg-green-700
            disabled:bg-gray-400
            text-white
            px-6
            py-3
            rounded
            font-bold
            "

            >


                {
                    loading

                    ?

                    "Salvando..."

                    :

                    "Salvar Solicitação"

                }


            </button>


        </div>

    );

}