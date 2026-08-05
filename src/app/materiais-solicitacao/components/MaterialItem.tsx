interface Props {

    material:{
        id:string;
        nome_material:string;
        propriedade:string;
        qtde:number | null;
    };

    quantidade:number;

    alterarQuantidade:(id:string, valor:number)=>void;

}


export default function MaterialItem({

    material,
    quantidade,
    alterarQuantidade

}:Props){


return (

<div className="border rounded-lg p-3 flex justify-between items-center">


<div>

<h3 className="font-semibold">
{material.nome_material}
</h3>


<p className="text-sm text-gray-500">
{material.propriedade}
</p>


</div>



<input

type="number"

min="0"

value={quantidade}

onChange={(e)=>
alterarQuantidade(
material.id,
Number(e.target.value)
)
}

className="border rounded px-2 w-20"

/>


</div>

)


}