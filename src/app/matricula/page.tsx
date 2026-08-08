
"use client";

import {
  Suspense,
  useCallback,
  useEffect,
  useState,
} from "react";

import { api } from "@/services/api";
import { toast } from "react-toastify";
import axios from "axios";
import { useSearchParams } from "next/navigation";

import CronogramaSelect from "./components/CronogramaSelect";
import AlunoForm from "./components/AlunoForm";
import ConfirmacaoMatricula from "./components/ConfirmacaoMatricula";
import ListaMatriculados from "./components/ListaMatriculados";

import {
  CronogramaType,
  AlunoType,
  MatriculaType,
} from "./types";

// =====================================================
// CONTEÚDO DA PÁGINA
// =====================================================

function MatriculaContent() {
  const searchParams = useSearchParams();

  const [cronogramas, setCronogramas] =
    useState<CronogramaType[]>([]);

  const [cronogramaSelecionado, setCronogramaSelecionado] =
    useState("");

  const [matriculas, setMatriculas] =
    useState<MatriculaType[]>([]);

  const [aluno, setAluno] = useState<AlunoType>({
    id: "",
    CPF: "",
    nome: "",
    celular: "",
    email: "",
    telefone_recado: "",
  });

  const [mostrarDadosAluno, setMostrarDadosAluno] =
    useState(false);

  const [confirmacaoCurso, setConfirmacaoCurso] =
    useState(false);

  const [confirmacaoFormatura, setConfirmacaoFormatura] =
    useState(false);

  const [aprovado, setAprovado] =
    useState(false);

  const [justificativa, setJustificativa] =
    useState("");

  const [matriculaEditando, setMatriculaEditando] =
    useState<MatriculaType | null>(null);

  // =====================================================
  // LIMPAR FORMULÁRIO
  // =====================================================

  const limparFormulario = useCallback(() => {
    setAluno({
      id: "",
      CPF: "",
      nome: "",
      celular: "",
      email: "",
      telefone_recado: "",
    });

    setMostrarDadosAluno(false);
    setConfirmacaoCurso(false);
    setConfirmacaoFormatura(false);
    setAprovado(false);
    setJustificativa("");
    setMatriculaEditando(null);
  }, []);

  // =====================================================
  // CARREGAR CRONOGRAMA
  // =====================================================

  const carregarCronograma = useCallback(
    async (id: string) => {
      const response = await api.get(
        `/matricula/cronograma/${id}`
      );

      setMatriculas(
        response.data.matriculas ?? []
      );
    },
    []
  );

  // =====================================================
  // LISTAR CRONOGRAMAS
  // =====================================================

  const loadCronogramas = useCallback(
    async () => {
      try {
        const response =
          await api.get<CronogramaType[]>(
            "/listcronograma"
          );

        setCronogramas(response.data);
      } catch (error: unknown) {
        console.error(error);

        toast.error(
          "Erro ao carregar cronogramas"
        );
      }
    },
    []
  );

  useEffect(() => {
    loadCronogramas();
  }, [loadCronogramas]);

  // =====================================================
  // SELECIONAR CRONOGRAMA
  // =====================================================

  const handleSelecionarCronograma =
    useCallback(
      async (id: string) => {
        setCronogramaSelecionado(id);

        limparFormulario();

        if (!id) {
          setMatriculas([]);
          return;
        }

        try {
          await carregarCronograma(id);
        } catch (error: unknown) {
          console.error(error);

          toast.error(
            "Erro ao carregar turma."
          );
        }
      },
      [
        limparFormulario,
        carregarCronograma,
      ]
    );

  // =====================================================
  // ABRIR PELO LINK
  // =====================================================

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
    cronogramaSelecionado,
    handleSelecionarCronograma,
  ]);

  // =====================================================
  // EXCLUIR MATRÍCULA
  // =====================================================

  const excluirMatricula =
    useCallback(
      async (id: string) => {
        try {
          await api.delete(
            `/matricula/${id}`
          );

          toast.success(
            "Matrícula excluída."
          );

          if (cronogramaSelecionado) {
            await carregarCronograma(
              cronogramaSelecionado
            );
          }
        } catch (error: unknown) {
          if (
            axios.isAxiosError(error)
          ) {
            toast.error(
              error.response?.data
                ?.error ??
                "Erro ao excluir."
            );
          } else {
            toast.error(
              "Erro inesperado."
            );
          }
        }
      },
      [
        cronogramaSelecionado,
        carregarCronograma,
      ]
    );

  // =====================================================
  // ALTERAR ALUNO
  // =====================================================

  function alterarAluno(
    campo: keyof AlunoType,
    valor: string
  ) {
    setAluno((prev) => ({
      ...prev,
      [campo]: valor,
    }));
  }

  // =====================================================
  // BUSCAR CPF
  // =====================================================

  async function buscarAlunoCPF(
    cpf?: string
  ) {
    const cpfBusca = (
      cpf ?? aluno.CPF
    ).replace(/\D/g, "");

    if (cpfBusca.length !== 11) {
      return;
    }

    try {
      const response = await api.get(
        `/aluno/cpf/${cpfBusca}`
      );

      setAluno(response.data);
      setMostrarDadosAluno(false);

      toast.success(
        "Aluno encontrado."
      );
    } catch {
      setAluno({
        id: "",
        CPF: cpfBusca,
        nome: "",
        celular: "",
        email: "",
        telefone_recado: "",
      });

      setMostrarDadosAluno(true);

      toast.info(
        "Aluno não encontrado."
      );
    }
  }

  // =====================================================
  // SALVAR MATRÍCULA
  // =====================================================

  async function matricularAluno() {
    if (!cronogramaSelecionado) {
      toast.warning(
        "Selecione um cronograma."
      );

      return;
    }

    try {
      if (matriculaEditando) {
        await api.put(
          `/matricula/${matriculaEditando.id}`,
          {
            confirmacao_curso:
              confirmacaoCurso,

            confirmacao_formatura:
              confirmacaoFormatura,

            aprovado,

            justificativa,
          }
        );

        toast.success(
          "Matrícula atualizada."
        );
      } else {
        let idAluno = aluno.id;

        if (!idAluno) {
          const response =
            await api.post(
              "/aluno",
              aluno
            );

          idAluno =
            response.data.id;
        }

        await api.post(
          "/matricula",
          {
            id_cronograma:
              cronogramaSelecionado,

            id_aluno: idAluno,

            confirmacao_curso:
              confirmacaoCurso,

            confirmacao_formatura:
              confirmacaoFormatura,

            aprovado,

            justificativa,
          }
        );

        toast.success(
          "Matrícula realizada."
        );
      }

      await carregarCronograma(
        cronogramaSelecionado
      );

      limparFormulario();
    } catch (error: unknown) {
      if (
        axios.isAxiosError(error)
      ) {
        toast.error(
          error.response?.data
            ?.error ??
            "Erro ao salvar matrícula."
        );
      } else {
        toast.error(
          "Erro inesperado."
        );
      }
    }
  }

  // =====================================================
  // EDITAR MATRÍCULA
  // =====================================================

  function editarMatricula(
    matricula: MatriculaType
  ) {
    setMatriculaEditando(
      matricula
    );

    if (matricula.aluno) {
      setAluno({
        ...matricula.aluno,
        id: matricula.aluno.id ?? "",
      });
    }

    setMostrarDadosAluno(true);

    setConfirmacaoCurso(
      matricula.confirmacao_curso ??
        false
    );

    setConfirmacaoFormatura(
      matricula.confirmacao_formatura ??
        false
    );

    setAprovado(
      matricula.aprovado ??
        false
    );

    setJustificativa(
      matricula.justificativa ??
        ""
    );
  }

  // =====================================================
  // RENDER
  // =====================================================

  return (
    <>
      <CronogramaSelect
        cronogramas={cronogramas}
        valorSelecionado={
          cronogramaSelecionado
        }
        onChange={
          handleSelecionarCronograma
        }
      />

      <AlunoForm
        aluno={aluno}
        onChange={alterarAluno}
        buscarCPF={buscarAlunoCPF}
        mostrarCampos={
          mostrarDadosAluno
        }
      />

      <ConfirmacaoMatricula
        confirmacaoCurso={
          confirmacaoCurso
        }
        setConfirmacaoCurso={
          setConfirmacaoCurso
        }
        confirmacaoFormatura={
          confirmacaoFormatura
        }
        setConfirmacaoFormatura={
          setConfirmacaoFormatura
        }
        aprovado={aprovado}
        setAprovado={setAprovado}
        justificativa={
          justificativa
        }
        setJustificativa={
          setJustificativa
        }
      />

      <button
        type="button"
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
        {matriculaEditando
          ? "SALVAR ALTERAÇÕES"
          : "MATRICULAR"}
      </button>

      <ListaMatriculados
        matriculas={matriculas}
        onExcluir={
          excluirMatricula
        }
        onEditar={
          editarMatricula
        }
      />
    </>
  );
}

// =====================================================
// PÁGINA
// =====================================================

export default function MatriculaPage() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-500">
            Carregando matrícula...
          </p>
        </div>
      }
    >
      <MatriculaContent />
    </Suspense>
  );
}

