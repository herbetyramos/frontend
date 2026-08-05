interface Props{

valor:string;

alterar:(valor:string)=>void;

}


export default function MaterialExtra({

valor,
alterar

}:Props){



return (

<div className="mt-5">


<label className="font-semibold">

Observação / Material adicional

</label>


<textarea

value={valor}

onChange={(e)=>
alterar(e.target.value)
}

className="border rounded w-full p-2 mt-2"

rows={4}

placeholder="Digite algum material adicional..."



/>


</div>

)


}