"use client";


import { useState } from "react";

import { api } from "@/services/api";



interface Props{

id_curso:string;

onSaved:()=>void;

}



export default function CadastroMaterial({

id_curso,

onSaved

}:Props){



const [nome,setNome]=useState("");

const [qtde,setQtde]=useState("");

const [propriedade,setPropriedade]=useState(
"PERMANENTE"
);




async function salvar(){



if(!id_curso){

alert("Selecione o curso");

return;

}



if(!nome){

alert("Informe o nome do material");

return;

}




await api.post("/material",{


id_curso,


nome_material:nome,


qtde:qtde ? Number(qtde) : undefined,


propriedade


});




setNome("");

setQtde("");

setPropriedade("PERMANENTE");



onSaved();



}





return (

<div className="bg-white p-4 rounded shadow space-y-3">


<h2 className="font-bold text-lg">

Cadastro de Material

</h2>




<input

value={nome}

onChange={
e=>setNome(e.target.value)
}

placeholder="Nome do material"

className="border rounded px-3 py-2 w-full"

/>





<input

type="number"

value={qtde}

onChange={
e=>setQtde(e.target.value)
}

placeholder="Quantidade"

className="border rounded px-3 py-2 w-full"

/>





<select

value={propriedade}

onChange={
e=>setPropriedade(e.target.value)
}

className="border rounded px-3 py-2 w-full"

>


<option value="PERMANENTE">

Permanente

</option>


<option value="NAO_PERMANENTE">

Não Permanente

</option>


</select>





<button

onClick={salvar}

className="bg-blue-600 text-white px-4 py-2 rounded"

>

Salvar

</button>



</div>

);


}