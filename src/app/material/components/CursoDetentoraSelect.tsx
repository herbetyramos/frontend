"use client";

import { useEffect,useState } from "react";
import { api } from "@/services/api";

import {Curso} from "../types";


interface Props{

value:string;
onChange:(id:string)=>void;

}



export default function CursoDetentoraSelect({
value,
onChange

}:Props){


const [cursos,setCursos]=useState<Curso[]>([]);



useEffect(()=>{

async function load(){

const response = await api.get("/cursos");

setCursos(response.data);

}

load();


},[]);



return (

<select

value={value}

onChange={(e)=>onChange(e.target.value)}

className="w-full border rounded px-3 py-2"

>

<option value="">
Selecione o curso
</option>


{
cursos.map((curso)=>(

<option
key={curso.id}
value={curso.id}
>

{curso.nome}

</option>

))
}


</select>


);


}