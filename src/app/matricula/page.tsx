"use client";
import { useCallback, useEffect, useState } from "react";
import { api } from "@/services/api";
import { toast } from "react-toastify";
import CronogramaSelect from "./components/CronogramaSelect";
import { useSearchParams } from "next/navigation";
import AlunoForm from "./components/AlunoForm";
import ConfirmacaoMatricula from "./components/ConfirmacaoMatricula";
import ListaMatriculados from "./components/ListaMatriculados";
import {
  CronogramaType,
  MaterialType,
  AlunoType,
  MatriculaType,
  DadosCronogramaType
} from "./types";

export default function MatriculaPage() {

  const [cronogramas, setCronogramas] =
    useState<CronogramaType[]>([]);

  const [cronogramaSelecionado, setCronogramaSelecionado] =
    useState("");

  const [dadosCronograma, setDadosCronograma] =
    useState<DadosCronogramaType | null>(null);

    const [mostrarResumo, setMostrarResumo] = useState(false);


  const [materiais, setMateriais] =
    useState<MaterialType[]>([]);

  const [mostrarMateriais, setMostrarMateriais] =
    useState(false);

  const [matriculas, setMatriculas] =
    useState<MatriculaType[]>([]);

    

  const [aluno, setAluno] =
    useState<AlunoType>({
      CPF: "",
      nome: "",
      celular: "",
      email: "",
      telefone_recado: ""
    });

  const [mostrarDadosAluno, setMostrarDadosAluno] =  useState(false);

  const [confirmacaoCurso, setConfirmacaoCurso] =  useState(false);

  const [confirmacaoFormatura, setConfirmacaoFormatura] =  useState(false);

  const [aprovado, setAprovado] =  useState(false);

  const [justificativa, setJustificativa] =  useState("");

  const [matriculaEditando, setMatriculaEditando] =  useState<MatriculaType | null>(null);
  

  const loadCronogramas = useCallback(async () => {

    try {

      const response =
        await api.get<CronogramaType[]>(
          "/listcronograma"
        );


      setCronogramas(response.data);


    } catch (error) {

      console.error(error);

      toast.error(
        "Erro ao carregar cronogramas"
      );

    }

  }, []);

const searchParams = useSearchParams();

  useEffect(() => {

    loadCronogramas();

  }, [loadCronogramas]);

useEffect(() => {

  const id = searchParams.get("id");

  if (
    id &&
    cronogramas.length > 0 &&
    !cronogramaSelecionado
  ) {

    handleSelecionarCronograma(id);

  }

}, [
  searchParams,
  cronogramas,
  cronogramaSelecionado
]);



useEffect(() => {

  const cpf = aluno.CPF.replace(/\D/g, "");

  if (cpf.length === 11) {

    buscarAlunoCPF(cpf);

  }

}, [aluno.CPF]);


 const handleSelecionarCronograma = async (id: string) => {

  setCronogramaSelecionado(id);

  limparFormulario();

  if (!id) {

    setDadosCronograma(null);
    setMateriais([]);
    setMatriculas([]);

    return;

  }

  try {

    await carregarCronograma(id);

  } catch (error) {

    console.error(error);

    toast.error("Erro ao carregar dados da turma.");

  }

};

 const excluirMatricula = async (id: string) => {

  try {

    await api.delete(`/matricula/${id}`);

    toast.success("Matrícula excluída com sucesso.");

    setMatriculaEditando(null);

    if (cronogramaSelecionado) {

      await carregarCronograma(cronogramaSelecionado);

    }

  } catch (error: any) {

    toast.error(
      error.response?.data?.error ??
      "Erro ao excluir matrícula."
    );

  }

};

  const alterarAluno = (
  campo: keyof AlunoType,
  valor: string
) => {

  setAluno((prev) => ({

    ...prev,

    [campo]: valor

  }));

};

const buscarAlunoCPF = async (cpf: string) => {

  const cpfBusca = (cpf ?? aluno.CPF).replace(/\D/g, "");

  if (cpfBusca.length !== 11) return;

  try {

    const response =
      await api.get<AlunoType>(
        `/aluno/cpf/${cpfBusca}`
      );

    setAluno(response.data);

    setMostrarDadosAluno(false);

    toast.success("Aluno encontrado.");

  } catch {

    setAluno({
      CPF: cpfBusca,
      nome: "",
      celular: "",
      email: "",
      telefone_recado: ""
    });

    setMostrarDadosAluno(true);

    toast.info("Aluno não encontrado. Preencha os dados.");

  }

};
const matricularAluno = async () => {

  if (!cronogramaSelecionado) {

    toast.warning("Selecione um cronograma.");

    return;

  }

  try {

    if (matriculaEditando) {

      await api.put(

        `/matricula/${matriculaEditando.id}`,

        {

          confirmacao_curso: confirmacaoCurso,

          confirmacao_formatura: confirmacaoFormatura,

          aprovado,

          justificativa

        }

      );

      toast.success("Matrícula atualizada com sucesso.");

    } else {

      let idAluno = aluno.id;

      if (!idAluno) {

        const response =
          await api.post<AlunoType>(
            "/aluno",
            aluno
          );

        idAluno = response.data.id;

      }

      await api.post("/matricula", {

        id_cronograma: cronogramaSelecionado,

        id_aluno: idAluno,

        confirmacao_curso: confirmacaoCurso,

        confirmacao_formatura: confirmacaoFormatura,

        aprovado,

        justificativa

      });

      toast.success("Matrícula realizada com sucesso.");

    }

    await carregarCronograma(cronogramaSelecionado);

    limparFormulario();

  } catch (error: any) {

    toast.error(

      error.response?.data?.error ??

      "Erro ao salvar matrícula."

    );

  }

};

const editarMatricula = (matricula: MatriculaType) => {

  setMatriculaEditando(matricula);

  setAluno(matricula.aluno);

  setMostrarDadosAluno(true);

  setConfirmacaoCurso(matricula.confirmacao_curso);

  setConfirmacaoFormatura(matricula.confirmacao_formatura);

  setAprovado(matricula.aprovado);

  setJustificativa(matricula.justificativa || "");

};




const carregarCronograma = async (id: string) => {

  const response =
    await api.get<DadosCronogramaType>(
      `/matricula/cronograma/${id}`
    );

  setDadosCronograma(response.data);
  setMateriais(response.data.materiais);
  setMatriculas(response.data.matriculas);

  return response;
};



const limparFormulario = () => {

  setAluno({
    CPF: "",
    nome: "",
    celular: "",
    email: "",
    telefone_recado: ""
  });

  setMostrarDadosAluno(false);

  setConfirmacaoCurso(false);
  setConfirmacaoFormatura(false);
  setAprovado(false);
  setJustificativa("");

  setMatriculaEditando(null);

};



  return (

    <div className="p-1 space-y-1">


      
      <CronogramaSelect

        cronogramas={cronogramas}

        valorSelecionado={cronogramaSelecionado}

        onChange={handleSelecionarCronograma}

      />


{/* <div className="bg-white px-2 rounded-xl shadow">

  <button
    type="button"
    onClick={() => setMostrarResumo(!mostrarResumo)}
    className="
      w-full
      flex
      justify-between
      items-center
      px-6
      py-4
      font-bold
      text-left
      hover:bg-gray-50
    "
  >
    <span>Dados da Turma</span>

    <span className="text-xl">
      {mostrarResumo ? "▲" : "▼"}
    </span>
  </button>

  {mostrarResumo && (
    <div className="px-6 pb-6">
      <ResumoCronograma
        dados={dadosCronograma}
      />
    </div>
  )}

</div>*/}
      








      



      <AlunoForm
        aluno={aluno}
        onChange={alterarAluno}
        buscarCPF={buscarAlunoCPF}
        mostrarCampos={mostrarDadosAluno}
      />



      <ConfirmacaoMatricula

        confirmacaoCurso={confirmacaoCurso}

        setConfirmacaoCurso={setConfirmacaoCurso}

        confirmacaoFormatura={confirmacaoFormatura}

        setConfirmacaoFormatura={setConfirmacaoFormatura}

        aprovado={aprovado}

        setAprovado={setAprovado}

        justificativa={justificativa}

        setJustificativa={setJustificativa}

      />



     <div className="flex justify-center">

            <button

            
            onClick={matricularAluno}

            className="
            w-full
            bg-blue-600
            text-white
            py-3
            rounded-lg
            font-bold
            "

            >

            {
            matriculaEditando
            ? "SALVAR ALTERAÇÕES"
            : "MATRICULAR"
            }

            </button>

      </div>




{/*
<div className="bg-white rounded-xl shadow">

  <button
    type="button"
    onClick={() =>
      setMostrarMateriais(!mostrarMateriais)
    }
    className="
      w-full
      flex
      justify-between
      items-center
      px-6
      py-4
      font-bold
      text-left
      hover:bg-gray-50
    "
  >

    <span>Materiais do Curso</span>

    <span className="text-xl">
      {mostrarMateriais ? "▲" : "▼"}
    </span>

  </button>

  {mostrarMateriais && (

    <div className="px-6 pb-6">

      <MateriaisCurso
        materiais={materiais}
      />

    </div>





  )}

</div>
*/}




      <ListaMatriculados
          matriculas={matriculas}
          onExcluir={excluirMatricula}
          onEditar={editarMatricula}
      />


    </div>

  );

}