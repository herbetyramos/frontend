import MaterialItem from "./MaterialItem";

interface Material {
  id: string;
  nome_material: string;
  propriedade: string;
  qtde: number | null;
}

interface Props {
  titulo: string;
  materiais: Material[];
  quantidades: Record<string, number>;
  alterarQuantidade: (id: string, valor: number) => void;
}



export default function GrupoMateriais({

titulo,
materiais,
quantidades,
alterarQuantidade

}:Props){


return (

<div className="mb-6">


<h2 className="text-xl font-bold mb-3">

{titulo}

</h2>



<div className="space-y-2">


{
materiais.map(material=>(

<MaterialItem

key={material.id}

material={material}

quantidade={
quantidades[material.id] || 0
}

alterarQuantidade={
alterarQuantidade
}

/>

))

}


</div>


</div>


)

}