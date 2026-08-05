"use client";


import {Material} from "../types";

import MaterialRow from "./MaterialRow";


interface Props{

materiais:Material[];

onDelete:(id:string)=>void;

}



export default function ListaNaoPermanentes({

materiais,
onDelete

}:Props){



return (

<div>


<table className="w-full border">

<tbody>

{
materiais

.filter(
m=>m.propriedade==="NAO_PERMANENTE"
)

.map(m=>(

<MaterialRow

key={m.id}

material={m}

onDelete={onDelete}

/>

))

}



</tbody>

</table>


</div>

);


}