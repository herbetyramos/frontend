interface Props{

curso:string;

}


export default function HeaderSolicitacao({
curso
}:Props){


return (

<div className="bg-white shadow rounded-lg p-4 mb-5">


<h1 className="text-2xl font-bold">

Solicitação de Material

</h1>


<p className="text-gray-600 mt-1">

Curso selecionado: {curso}

</p>


</div>

)

}