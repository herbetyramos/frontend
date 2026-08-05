"use client";

import { useCallback, useEffect, useState } from "react";
import { api } from "@/services/api";
import { toast } from "react-toastify";

interface Aluno {
  id: string;
  nome: string;
  email?: string | null;
  celular: string;
  Telefone_recado?: string | null;
  CPF: string;
}

interface AlunoForm {
  id?: string;
  nome: string;
  email: string;
  celular: string;
  Telefone_recado: string;
  CPF: string;
}

export default function AlunoPage() {

  const [alunos, setAlunos] = useState<Aluno[]>([]);

  const [form, setForm] = useState<AlunoForm>({
    nome: "",
    email: "",
    celular: "",
    Telefone_recado: "",
    CPF: ""
  });

  const [busca, setBusca] = useState("");

  const [editando, setEditando] = useState(false);

  const [loading, setLoading] = useState(false);


  const carregarAlunos = useCallback(async () => {

    try {

      setLoading(true);

      const response = await api.get("/aluno");

      setAlunos(response.data);

    } catch (error) {

      console.error(error);

      toast.error("Erro ao carregar alunos");

    } finally {

      setLoading(false);

    }

  }, []);



  useEffect(() => {

    carregarAlunos();

  }, [carregarAlunos]);



  function alterarCampo(
    campo: keyof AlunoForm,
    valor: string
  ) {

    setForm((prev) => ({
      ...prev,
      [campo]: valor
    }));

  }



  function limparFormulario(){

    setForm({
      nome:"",
      email:"",
      celular:"",
      Telefone_recado:"",
      CPF:""
    });

    setEditando(false);

  }



  async function salvarAluno(){

    try {

      if(!form.nome){

        toast.warning("Informe o nome do aluno");
        return;

      }


      if(!form.CPF){

        toast.warning("Informe o CPF");
        return;

      }


      if(!form.celular){

        toast.warning("Informe o celular");
        return;

      }



      if(editando){

        await api.put("/aluno", form);

        toast.success("Aluno atualizado com sucesso");

      }else{

        await api.post("/aluno", form);

        toast.success("Aluno cadastrado com sucesso");

      }



      limparFormulario();

      carregarAlunos();



    } catch(error){

      console.error(error);

      toast.error("Erro ao salvar aluno");

    }

  }




  function editarAluno(aluno:Aluno){

    setForm({

      id: aluno.id,

      nome: aluno.nome,

      email: aluno.email ?? "",

      celular: aluno.celular,

      Telefone_recado:
        aluno.Telefone_recado ?? "",

      CPF: aluno.CPF

    });


    setEditando(true);

  }




  async function excluirAluno(id:string){

    const confirmar = window.confirm(
      "Deseja realmente excluir este aluno?"
    );


    if(!confirmar){
      return;
    }


    try {

      await api.delete(`/aluno/${id}`);


      toast.success(
        "Aluno excluído com sucesso"
      );


      carregarAlunos();


    }catch(error){

      console.error(error);

      toast.error(
        "Erro ao excluir aluno"
      );

    }

  }



    const alunosFiltrados = alunos.filter((aluno)=>

    aluno.nome
      .toLowerCase()
      .includes(busca.toLowerCase())

    ||

    aluno.CPF.includes(busca)

    ||

    aluno.celular.includes(busca)

  );


  return (

    <div className="p-6 space-y-6">


      <div className="bg-white rounded-xl shadow p-6">


        <div className="flex justify-between items-center mb-6">

          <h1 className="text-2xl font-bold text-gray-700">
            Cadastro de Alunos
          </h1>


          <button

            onClick={limparFormulario}

            className="
              px-4 py-2
              rounded-lg
              bg-gray-600
              text-white
              hover:bg-gray-700
            "

          >

            Novo

          </button>


        </div>



        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">


          <div>

            <label className="text-sm text-gray-600">
              Nome *
            </label>


            <input

              value={form.nome}

              onChange={(e)=>
                alterarCampo(
                  "nome",
                  e.target.value
                )
              }

              className="
                w-full
                border
                rounded-lg
                px-3
                py-2
              "

              placeholder="Nome do aluno"

            />


          </div>



          <div>

            <label className="text-sm text-gray-600">
              CPF *
            </label>


            <input

              value={form.CPF}

              onChange={(e)=>
                alterarCampo(
                  "CPF",
                  e.target.value
                )
              }

              className="
                w-full
                border
                rounded-lg
                px-3
                py-2
              "

              placeholder="CPF"

            />


          </div>



          <div>

            <label className="text-sm text-gray-600">
              Celular *
            </label>


            <input

              value={form.celular}

              onChange={(e)=>
                alterarCampo(
                  "celular",
                  e.target.value
                )
              }

              className="
                w-full
                border
                rounded-lg
                px-3
                py-2
              "

              placeholder="Celular"

            />


          </div>



          <div>

            <label className="text-sm text-gray-600">
              Telefone de recado
            </label>


            <input

              value={form.Telefone_recado}

              onChange={(e)=>
                alterarCampo(
                  "Telefone_recado",
                  e.target.value
                )
              }

              className="
                w-full
                border
                rounded-lg
                px-3
                py-2
              "

              placeholder="Telefone"

            />


          </div>



          <div className="md:col-span-2">


            <label className="text-sm text-gray-600">
              Email
            </label>


            <input

              value={form.email}

              onChange={(e)=>
                alterarCampo(
                  "email",
                  e.target.value
                )
              }

              className="
                w-full
                border
                rounded-lg
                px-3
                py-2
              "

              placeholder="Email"

              type="email"

            />


          </div>


        </div>



        <div className="flex gap-3 mt-6">


          <button

            onClick={salvarAluno}

            className="
              px-5
              py-2
              rounded-lg
              bg-blue-600
              text-white
              hover:bg-blue-700
            "

          >

            {editando ? "Atualizar" : "Salvar"}

          </button>



          <button

            onClick={limparFormulario}

            className="
              px-5
              py-2
              rounded-lg
              bg-gray-300
              hover:bg-gray-400
            "

          >

            Cancelar

          </button>


        </div>


      </div>

      
      <div className="bg-white rounded-xl shadow p-6">


        <div className="mb-4">


          <input

            value={busca}

            onChange={(e)=>
              setBusca(e.target.value)
            }

            className="
              w-full
              border
              rounded-lg
              px-4
              py-2
            "

            placeholder="
              Pesquisar por nome, CPF ou celular...
            "

          />


        </div>



        <div className="overflow-x-auto">


          <table className="w-full border-collapse">


            <thead>


              <tr className="bg-gray-100">


                <th className="border px-3 py-2 text-left">
                  Nome
                </th>


                <th className="border px-3 py-2 text-left">
                  CPF
                </th>


                <th className="border px-3 py-2 text-left">
                  Celular
                </th>


                <th className="border px-3 py-2 text-left">
                  Email
                </th>


                <th className="border px-3 py-2 text-center">
                  Ações
                </th>


              </tr>


            </thead>



            <tbody>


              {loading && (

                <tr>

                  <td

                    colSpan={5}

                    className="
                      text-center
                      py-5
                    "

                  >

                    Carregando...

                  </td>

                </tr>

              )}



              {!loading &&
                alunosFiltrados.length === 0 && (

                <tr>

                  <td

                    colSpan={5}

                    className="
                      text-center
                      py-5
                      text-gray-500
                    "

                  >

                    Nenhum aluno encontrado.

                  </td>

                </tr>

              )}





              {!loading &&
                alunosFiltrados.map((aluno)=>(


                <tr

                  key={aluno.id}

                  className="
                    hover:bg-gray-50
                  "

                >


                  <td className="border px-3 py-2">

                    {aluno.nome}

                  </td>



                  <td className="border px-3 py-2">

                    {aluno.CPF}

                  </td>



                  <td className="border px-3 py-2">

                    {aluno.celular}

                  </td>



                  <td className="border px-3 py-2">

                    {aluno.email || "-"}

                  </td>



                  <td className="border px-3 py-2">


                    <div className="flex justify-center gap-2">


                      <button

                        onClick={()=>
                          editarAluno(aluno)
                        }

                        className="
                          px-3
                          py-1
                          rounded
                          bg-yellow-500
                          text-white
                          hover:bg-yellow-600
                        "

                      >

                        Editar

                      </button>



                      <button

                        onClick={()=>
                          excluirAluno(aluno.id)
                        }

                        className="
                          px-3
                          py-1
                          rounded
                          bg-red-600
                          text-white
                          hover:bg-red-700
                        "

                      >

                        Excluir

                      </button>


                    </div>


                  </td>


                </tr>


              ))}



            </tbody>


          </table>


        </div>


      </div>


    </div>

  );


}