"use client";


import {Material} from "../types";


interface Props{

material:Material;

onDelete:(id:string)=>void;

}



export default function MaterialRow({
material,
onDelete

}:Props){



return (

<tr>  


<td className="border px-3 py-2">

{material.nome_material}

</td>


<td className="border px-3 py-2">

{material.qtde ?? 0}

</td>





<td className="border px-3 py-2">


<button

onClick={()=>onDelete(material.id)}

className="text-red-600"

>

Excluir

</button>


</td>


</tr>

);


}