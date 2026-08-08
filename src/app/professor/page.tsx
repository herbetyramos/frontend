"use client";

import { FormEvent, useState } from "react";
import { setupAPIClient } from "../../services/api";
import { toast } from "react-toastify";
import axios from "axios";


export default function Professor() {

  const [nome_professor, setNome] = useState("");

  const [telefone, setTelefone] = useState("");

  const [endereco, setEndereco] = useState("");

  const [bairro, setBairro] = useState("");

  const [numero, setNumero] = useState("");

  const [cpf, setCpf] = useState("");

  const [especialidade, setEspecialidade] = useState("");

  const [contato, setContato] = useState("");

  const [foto, setFoto] =
    useState<File | null>(null);



  async function handleRegister(
    event: FormEvent
  ) {

    event.preventDefault();


    if (
      !nome_professor ||
      !endereco ||
      !bairro ||
      !numero ||
      !telefone ||
      !cpf ||
      !especialidade ||
      !contato
    ) {

      toast.error(
        "Preencha todos os campos"
      );

      return;

    }



    try {


      const apiClient =
        setupAPIClient();



      const data =
        new FormData();



      data.append(
        "nome_professor",
        nome_professor
      );


      data.append(
        "telefone",
        telefone
      );


      data.append(
        "Endereco",
        endereco
      );


      data.append(
        "bairro",
        bairro
      );


      data.append(
        "Numero",
        numero
      );


      data.append(
        "contato",
        contato
      );


      data.append(
        "CPF",
        cpf
      );


      data.append(
        "especialidade",
        especialidade
      );



      if (foto) {

        data.append(
          "file",
          foto
        );

      }



      await apiClient.post(
        "/professor",
        data
      );



      toast.success(
        "Professor cadastrado com sucesso!"
      );



      limparFormulario();



    } catch (error: unknown) {


      if (
        axios.isAxiosError(error)
      ) {


        toast.error(

          error.response
            ?.data
            ?.error ??

          error.response
            ?.data
            ?.message ??

          "Erro ao cadastrar!"

        );


      } else {


        toast.error(
          "Erro inesperado ao cadastrar!"
        );


      }

    }

  }



  function limparFormulario() {

    setNome("");

    setTelefone("");

    setEndereco("");

    setBairro("");

    setNumero("");

    setCpf("");

    setEspecialidade("");

    setContato("");

    setFoto(null);

  }



  return (

    <div
      className="
      max-w-xl
      mx-auto
      p-6
      "
    >


      <h1
        className="
        text-2xl
        font-bold
        mb-6
        text-center
        "
      >

        Cadastro de Professor

      </h1>



      <form
        onSubmit={handleRegister}
        className="space-y-4"
      >


        <input
          value={nome_professor}
          onChange={(e)=>
            setNome(e.target.value)
          }
          placeholder="Nome do professor"
          className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          "
        />



        <input
          value={endereco}
          onChange={(e)=>
            setEndereco(e.target.value)
          }
          placeholder="Endereço"
          className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          "
        />



        <input
          value={numero}
          onChange={(e)=>
            setNumero(e.target.value)
          }
          placeholder="Número"
          className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          "
        />



        <input
          value={bairro}
          onChange={(e)=>
            setBairro(e.target.value)
          }
          placeholder="Bairro"
          className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          "
        />



        <input
          value={telefone}
          onChange={(e)=>
            setTelefone(e.target.value)
          }
          placeholder="Telefone"
          className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          "
        />



        <input
          value={cpf}
          onChange={(e)=>
            setCpf(e.target.value)
          }
          placeholder="CPF"
          className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          "
        />



        <input
          value={especialidade}
          onChange={(e)=>
            setEspecialidade(e.target.value)
          }
          placeholder="Especialidade"
          className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          "
        />



        <input
          value={contato}
          onChange={(e)=>
            setContato(e.target.value)
          }
          placeholder="Contato"
          className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          "
        />



        <input
          type="file"
          accept="image/*"
          onChange={(e)=>
            setFoto(
              e.target.files?.[0] ?? null
            )
          }
          className="
          w-full
          border
          rounded-lg
          px-3
          py-2
          "
        />



        <button
          type="submit"
          className="
          w-full
          bg-blue-600
          hover:bg-blue-700
          text-white
          py-2
          rounded-lg
          "
        >

          Salvar

        </button>


      </form>


    </div>

  );

}