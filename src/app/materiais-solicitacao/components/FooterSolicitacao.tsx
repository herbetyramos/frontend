interface Props{

enviar:()=>void;

}


export default function FooterSolicitacao({

enviar

}:Props){


return (

<div className="mt-6 flex justify-end">


<button

onClick={enviar}

className="bg-blue-600 text-white px-6 py-2 rounded-lg"

>

Enviar Solicitação

</button>


</div>

)

}