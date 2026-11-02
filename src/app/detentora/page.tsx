
"use client";

import { FormEvent, useState, useEffect } from "react";
import { setupAPIClient } from "../../services/api";
import { toast } from "react-toastify";
import { Pencil, X, Save, Plus, Building2 } from "lucide-react";

// TABELA ATA
type AtaProps = {
  id: string;
  numero_ata: string;
  empresa?: {
    nome_empresa: string;
  } | null;
};

// TABELA CURSOS
type CursoProps = {
  id: string;
  nome_curso: string;
};

// DETENTORA

type DetentoraProps = {
  id: string;
  ata_id: string | null;
  cursos_id: string;
  quantidade_turma: number | null;
  valor_curso: string | number;
  ativo: boolean;
  curso: {
    id: string;
    nome_curso: string;
  };
  ata: {
    id: string;
    numero_ata: string;
    empresa: {
      nome_empresa: string;
    } | null;
  } | null;
};


export default function AtaCurso() {
  // DADOS DO FORMULÁRIO
  const [ata_id, setAta_id] = useState("");
  const [cursos_id, setCurso_id] = useState("");
  const [quantidade_turma, setQuantidadeTurma] = useState<number>(1);
  const [valorCurso, setValorCurso] = useState("0,00");
  const [ativo, setAtivo] = useState(true);

  // LISTAS
  const [atas, setAtas] = useState<AtaProps[]>([]);
  const [cursos, setCursos] = useState<CursoProps[]>([]);
  const [detentoras, setDetentoras] = useState<DetentoraProps[]>([]);

  // EDIÇÃO
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [salvando, setSalvando] = useState(false);

  // -------------------------------------------------------
  // CARREGAR DADOS
  // -------------------------------------------------------

  async function loadData() {
    try {
      const api = setupAPIClient();

      const [responseAtas, responseCursos, responseDetentoras] =
        await Promise.all([
          api.get("/ata"),
          api.get("/cursos"),
          api.get("/detentora"),
        ]);

      setAtas(responseAtas.data || []);
      setCursos(responseCursos.data || []);
      setDetentoras(responseDetentoras.data || []);
    } catch (err) {
      console.log("Erro ao carregar dados:", err);
      toast.error("Erro ao carregar informações");
    }
  }

  useEffect(() => {
    loadData();
  }, []);

  // -------------------------------------------------------
  // LIMPAR FORMULÁRIO
  // -------------------------------------------------------

  function limparFormulario() {
    setAta_id("");
    setCurso_id("");
    setQuantidadeTurma(1);
    setValorCurso("0,00");
    setAtivo(true);
    setEditandoId(null);
  }

  // -------------------------------------------------------
  // FORMATAR MOEDA
  // -------------------------------------------------------

  function formatarMoeda(valor: string | number) {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  }

  // -------------------------------------------------------
  // EDITAR DETENTORA
  // -------------------------------------------------------

  function handleEdit(detentora: DetentoraProps) {
    setEditandoId(detentora.id);

    setAta_id(detentora.ata_id || "");
    setCurso_id(detentora.cursos_id);

    setQuantidadeTurma(detentora.quantidade_turma ?? 1);

    setValorCurso(
      String(detentora.valor_curso ?? 0).replace(".", ",")
    );

    setAtivo(detentora.ativo);

    window.scrollTo({
      top: 0,
      behavior: "smooth",
    });
  }

  // -------------------------------------------------------
  // CADASTRAR OU ATUALIZAR DETENTORA
  // -------------------------------------------------------

  async function handleRegister(event: FormEvent) {
    event.preventDefault();

    if (!ata_id || !cursos_id) {
      toast.error("Selecione a ATA e o curso");
      return;
    }

    if (quantidade_turma < 1) {
      toast.error("Informe uma quantidade válida de turmas");
      return;
    }

    const valorConvertido = Number(
      valorCurso.replace(",", ".")
    );

    if (!Number.isFinite(valorConvertido) || valorConvertido < 0) {
      toast.error("Informe um valor válido para o curso");
      return;
    }

    try {
      setSalvando(true);

      const api = setupAPIClient();

      const data = {
        ata_id,
        cursos_id,
        quantidade_turma,
        valor_curso: valorConvertido,
        ativo,
      };

      if (editandoId) {
        await api.put(`/detentora/${editandoId}`, data);

        toast.success("Detentora atualizada com sucesso!");
      } else {
        await api.post("/detentora", data);

        toast.success("Detentora cadastrada com sucesso!");
      }

      limparFormulario();

      await loadData();

    } catch (err) {
      console.log("Erro ao salvar detentora:", err);

      toast.error(
        editandoId
          ? "Erro ao atualizar detentora"
          : "Erro ao cadastrar detentora"
      );
    } finally {
      setSalvando(false);
    }
  }

  // -------------------------------------------------------
  // INTERFACE
  // -------------------------------------------------------

  return (
    <div className="w-full min-h-screen p-3 sm:p-6 lg:p-10">

      <div className="max-w-3xl mx-auto space-y-6">

        {/* FORMULÁRIO */}

        <div className="
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-800
          shadow-xl rounded-2xl
          w-full p-5 sm:p-7
        ">

          <div className="flex items-center justify-center gap-2 mb-6">

            <Building2 className="text-blue-600" size={26} />

            <h2 className="
              text-xl sm:text-2xl font-extrabold
              text-gray-800 dark:text-white
              text-center
            ">
              {editandoId
                ? "Editar Detentora"
                : "Cadastro de Detentora do Curso"}
            </h2>

          </div>

          <form onSubmit={handleRegister} className="space-y-5">

            {/* ATA */}

            <div className="w-full">

              <label className="
                block mb-2 text-sm font-semibold
                text-gray-700 dark:text-gray-300
              ">
                ATA
              </label>

              <select
              value={ata_id}
              onChange={(e) => setAta_id(e.target.value)}
              className="w-full rounded-lg border border-gray-300 bg-white p-3 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
            >
              <option value="">Selecione a ATA</option>

              {atas.map((ata) => (
                <option key={ata.id} value={ata.id}>
                  {ata.numero_ata}
                  {ata.empresa?.nome_empresa
                    ? ` — ${ata.empresa.nome_empresa}`
                    : ""}
                </option>
              ))}
            </select>

            </div>

            {/* CURSO */}

            <div className="w-full">

              <label className="
                block mb-2 text-sm font-semibold
                text-gray-700 dark:text-gray-300
              ">
                Curso
              </label>

              <select
                value={cursos_id}
                onChange={(e) => setCurso_id(e.target.value)}
                required
                className="
                  w-full border border-gray-300 dark:border-gray-700
                  rounded-lg px-3 py-3
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2
                  focus:ring-blue-500
                "
              >
                <option value="">Selecione o curso</option>

                {cursos.map((c) => (
                  <option key={c.id} value={c.id}>
                    {c.nome_curso}
                  </option>
                ))}

              </select>

            </div>

            {/* QUANTIDADE E VALOR */}

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">

              <div>

                <label className="
                  block mb-2 text-sm font-semibold
                  text-gray-700 dark:text-gray-300
                ">
                  Quantidade de Turmas
                </label>

                <input
                  type="number"
                  value={quantidade_turma}
                  onChange={(e) =>
                    setQuantidadeTurma(Number(e.target.value))
                  }
                  min="1"
                  required
                  className="
                    w-full border border-gray-300 dark:border-gray-700
                    rounded-lg px-3 py-3
                    bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2
                    focus:ring-blue-500
                  "
                />

              </div>

              <div>

                <label className="
                  block mb-2 text-sm font-semibold
                  text-gray-700 dark:text-gray-300
                ">
                  Valor do Curso (R$)
                </label>

                <input
                  type="text"
                  inputMode="decimal"
                  value={valorCurso}
                  onChange={(e) => setValorCurso(e.target.value)}
                  placeholder="0,00"
                  required
                  className="
                    w-full border border-gray-300 dark:border-gray-700
                    rounded-lg px-3 py-3
                    bg-white dark:bg-gray-800
                    text-gray-900 dark:text-white
                    focus:outline-none focus:ring-2
                    focus:ring-blue-500
                  "
                />

              </div>

            </div>

            {/* STATUS */}

            <div>

              <label className="
                block mb-2 text-sm font-semibold
                text-gray-700 dark:text-gray-300
              ">
                Situação da Detentora
              </label>

              <select
                value={ativo ? "true" : "false"}
                onChange={(e) => setAtivo(e.target.value === "true")}
                className="
                  w-full border border-gray-300 dark:border-gray-700
                  rounded-lg px-3 py-3
                  bg-white dark:bg-gray-800
                  text-gray-900 dark:text-white
                  focus:outline-none focus:ring-2
                  focus:ring-blue-500
                "
              >
                <option value="true">Ativo</option>
                <option value="false">Inativo</option>

              </select>

            </div>

            {/* BOTÕES */}

            <div className="flex flex-col sm:flex-row gap-3 pt-2">

              <button
                type="submit"
                disabled={salvando}
                className="
                  flex-1 flex items-center justify-center gap-2
                  bg-blue-600 hover:bg-blue-700
                  disabled:opacity-50
                  text-white font-semibold
                  py-3 rounded-lg shadow-md transition-all
                "
              >
                {editandoId ? (
                  <>
                    <Save size={19} />
                    {salvando ? "Salvando..." : "Salvar Alterações"}
                  </>
                ) : (
                  <>
                    <Plus size={19} />
                    {salvando ? "Cadastrando..." : "Cadastrar Detentora"}
                  </>
                )}

              </button>

              {editandoId && (
                <button
                  type="button"
                  onClick={limparFormulario}
                  className="
                    flex items-center justify-center gap-2
                    bg-gray-200 hover:bg-gray-300
                    dark:bg-gray-700 dark:hover:bg-gray-600
                    text-gray-800 dark:text-white
                    font-semibold px-5 py-3 rounded-lg
                    transition-all
                  "
                >
                  <X size={19} />
                  Cancelar
                </button>
              )}

            </div>

          </form>

        </div>

        {/* LISTAGEM */}

        <div className="
          bg-white dark:bg-gray-900
          border border-gray-200 dark:border-gray-800
          shadow-xl rounded-2xl
          p-5 sm:p-7
        ">

          <div className="
            flex flex-col sm:flex-row
            justify-between items-start sm:items-center
            gap-2 mb-5
          ">

            <h2 className="
              text-xl font-bold
              text-gray-800 dark:text-white
            ">
              Detentoras Cadastradas
            </h2>

            <span className="
              text-sm font-medium
              text-gray-500 dark:text-gray-400
            ">
              {detentoras.length} registro(s)
            </span>

          </div>

          {detentoras.length === 0 ? (

            <div className="
              text-center py-8
              text-gray-500 dark:text-gray-400
            ">
              Nenhuma detentora cadastrada.
            </div>

          ) : (

            <div className="space-y-3">

              {detentoras.map((d) => (

                <div
                  key={d.id}
                  className="
                    border border-gray-200 dark:border-gray-700
                    rounded-xl p-4
                    bg-gray-50 dark:bg-gray-800
                    flex flex-col sm:flex-row
                    justify-between gap-4
                  "
                >

                  <div className="flex-1 min-w-0 space-y-2">

                    <h3 className="
                      font-bold text-gray-800 dark:text-white
                      .break-words {overflow-wrap: break-word;}
                    ">
                      {d.curso?.nome_curso || "Curso não informado"}
                    </h3>

                                            <p className="
                          text-sm text-gray-600 dark:text-gray-400
                        ">
                          ATA: {d.ata?.numero_ata || "Não informada"}

                          {d.ata?.empresa?.nome_empresa && (
                            <span className="
                              font-semibold text-gray-800 dark:text-gray-200
                            ">
                              {" — "}
                              {d.ata.empresa.nome_empresa}
                            </span>
                          )}
                        </p>

                    <div className="
                      flex flex-wrap gap-x-4 gap-y-2
                      text-sm text-gray-600 dark:text-gray-400
                    ">
                      <span>
                        Turmas: {d.quantidade_turma ?? 0}
                      </span>

                      <span className="
                        font-bold text-gray-800 dark:text-gray-200
                      ">
                        {formatarMoeda(d.valor_curso)}
                      </span>
                    </div>

                    <span
                      className={`
                        inline-flex items-center
                        px-3 py-1 rounded-full
                        text-xs font-bold
                        ${
                          d.ativo
                            ? "bg-green-100 text-green-700 dark:bg-green-900/40 dark:text-green-300"
                            : "bg-red-100 text-red-700 dark:bg-red-900/40 dark:text-red-300"
                        }
                      `}
                    >
                      {d.ativo ? "ATIVO" : "INATIVO"}
                    </span>

                  </div>

                  <div className="flex items-center sm:justify-center">

                    <button
                      type="button"
                      onClick={() => handleEdit(d)}
                      className="
                        flex items-center justify-center gap-2
                        w-full sm:w-auto
                        px-4 py-2 rounded-lg
                        bg-blue-600 hover:bg-blue-700
                        text-white font-semibold text-sm
                        transition-all
                      "
                    >
                      <Pencil size={16} />
                      Editar
                    </button>

                  </div>

                </div>

              ))}

            </div>

          )}

        </div>

      </div>

    </div>
  );
}
