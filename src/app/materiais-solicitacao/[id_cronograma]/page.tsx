"use client";

import {
  useCallback,
  useEffect,
  useState,
} from "react";

import {
  useParams,
} from "next/navigation";

import {
  api,
} from "@/services/api";

import {
  toast,
} from "react-toastify";

import axios from "axios";


// ==============================
// TIPOS
// ==============================

type MaterialType = {

  id: string;

  nome_material: string;

  qtde: number | null;

  propriedade:
    | "PERMANENTE"
    | "NAO_PERMANENTE";

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

    ata?: {

      empresa?: {

        nome_empresa: string;

      } | null;

    } | null;

  } | null;

};




// ==============================
// ERRO AXIOS
// ==============================

function getMensagemErro(
  error: unknown
){

  if(
    axios.isAxiosError(error)
  ){

    return (
      error.response?.data?.error ??
      "Erro na comunicação com servidor"
    );

  }


  return "Erro inesperado";

}




// ==============================
// COMPONENTE
// ==============================


export default function SolicitacaoMaterialPage(){


const params =
useParams();


const idCronograma =
params.id_cronograma as string;



const [
  materiais,
  setMateriais
] =
useState<MaterialType[]>([]);



const [
  cronograma,
  setCronograma
] =
useState<CronogramaType | null>(null);



const [
  selecionados,
  setSelecionados
] =
useState<SelecionadoType[]>([]);



const [
  observacao,
  setObservacao
] =
useState("");



const [
 loading,
 setLoading
] =
useState(false);




// ==============================
// CARREGAR MATERIAIS
// ==============================


const carregarMateriais =
useCallback(async()=>{


if(!idCronograma)
return;



try{


const response =
await api.get(
"/solicitacao-material/materiais",
{

params:{
id:idCronograma
}

}
);



const dados =
response.data;



if(
Array.isArray(dados)
){

setMateriais(dados);


}else if(
Array.isArray(dados.materiais)
){

setMateriais(
dados.materiais
);


}else{


setMateriais([]);


}



}catch(error:unknown){


console.error(
getMensagemErro(error)
);


setMateriais([]);


toast.error(
"Erro ao carregar materiais"
);


}



},[
idCronograma
]);




// ==============================
// CARREGAR CRONOGRAMA
// ==============================


const carregarCronograma =
useCallback(async()=>{


if(!idCronograma)
return;



try{


const response =
await api.get(
`/cronograma/${idCronograma}`
);



setCronograma(
response.data
);



}catch(error:unknown){


console.error(
getMensagemErro(error)
);


toast.error(
"Erro ao carregar cronograma"
);


}



},[
idCronograma
]);





useEffect(()=>{


carregarCronograma();

carregarMateriais();


},[
carregarCronograma,
carregarMateriais
]);






// ==============================
// SELECIONAR MATERIAL
// ==============================


function selecionarMaterial(
material: MaterialType
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

id_material:
material.id,

nome_material:
material.nome_material,

quantidade:
1

}

]

);


}




async function salvarSolicitacao(){


if(
selecionados.length === 0
){


toast.warning(
"Selecione pelo menos um material"
);


return;


}



try{


setLoading(true);



await api.post(
"/solicitacao-material",
{

id_cronograma:
idCronograma,


observacao,


itens:

selecionados.map(
item =>

({

id_material:
item.id_material,

quantidade:
item.quantidade

})

)

}

);



toast.success(
"Solicitação enviada com sucesso!"
);



setSelecionados([]);

setObservacao("");



}catch(error:unknown){


console.error(
getMensagemErro(error)
);


toast.error(
"Erro ao salvar solicitação"
);



}finally{


setLoading(false);


}


}





// ==============================
// TELA
// ==============================


return (

<div className="p-6 space-y-6">


<h1 className="text-2xl font-bold">

Solicitação de Materiais

</h1>



{
cronograma && (

<div className="bg-gray-100 p-4 rounded-lg">

<p>
<strong>Curso:</strong>{" "}
{cronograma.tema}
</p>

<p>
<strong>Período:</strong>{" "}
{cronograma.data_inicio}
{" até "}
{cronograma.data_fim}
</p>

</div>

)

}




<div className="grid grid-cols-2 gap-4">


{
materiais.map(
material => (

<div
key={material.id}
className="
border
rounded-lg
p-4
flex
justify-between
items-center
"
>


<div>


<p className="font-semibold">

{material.nome_material}

</p>


<p className="text-sm text-gray-500">

{
material.propriedade === "PERMANENTE"
?
"Permanente"
:
"Não Permanente"
}

</p>


</div>



<button

type="button"

onClick={()=>
selecionarMaterial(material)
}

className="
bg-blue-600
text-white
px-3
py-2
rounded
"

>


{

selecionados.some(
item =>
item.id_material === material.id
)

?

"Selecionado"

:

"Adicionar"

}


</button>



</div>

)

)

}


</div>





<textarea

value={observacao}

onChange={
e =>
setObservacao(
e.target.value
)
}

placeholder="Observação"

rows={4}

className="
w-full
border
rounded-lg
p-3
"

/>






<button

type="button"

disabled={loading}

onClick={
salvarSolicitacao
}

className="
w-full
bg-green-600
text-white
py-3
rounded-lg
font-bold
"

>


{
loading
?
"Salvando..."
:
"Enviar Solicitação"
}


</button>



</div>

);


}