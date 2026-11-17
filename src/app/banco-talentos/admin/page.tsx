
"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";

type Aluno = {
  id: string;
  nome: string;
  CPF: string;
  email: string | null;
  celular: string;
  acessoAtivado: boolean;
  perfilProfissional: { ativo: boolean } | null;
};

type Empresa = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
  representante: string;
  email: string;
  telefone: string;
  cidade: string | null;
  status: "PENDENTE" | "APROVADA" | "REPROVADA" | "SUSPENSA";
};

type StatusCandidatura =
  | "EM_ANALISE"
  | "CONTATADO"
  | "SELECIONADO"
  | "RECUSADO";

type RelatorioCandidatura = {
  id: string;
  alunoId: string;
  aluno: string;
  oportunidadeId: string;
  oportunidade: string;
  dataCandidatura: string;
  ultimaAtualizacao: string;
  status: StatusCandidatura;
};

type GrupoEmpresa = {
  empresaId: string;
  empresa: {
    id: string;
    razaoSocial: string;
    nomeFantasia: string | null;
    cnpj: string;
  };
  totalCandidaturas: number;
  candidaturas: RelatorioCandidatura[];
};

type RelatorioInteracoesResponse = {
  totalEmpresas: number;
  totalCandidaturas: number;
  empresas: GrupoEmpresa[];
};

const STATUS_LABEL: Record<StatusCandidatura, string> = {
  EM_ANALISE: "Em análise",
  CONTATADO: "Contatado",
  SELECIONADO: "Selecionado",
  RECUSADO: "Recusado",
};

function formatarData(data: string) {
  if (!data) return "-";

  const dataObj = new Date(data);

  if (Number.isNaN(dataObj.getTime())) return "-";

  return dataObj.toLocaleString("pt-BR", {
    dateStyle: "short",
    timeStyle: "short",
  });
}

function nomeEmpresa(empresa: GrupoEmpresa["empresa"]) {
  return empresa.nomeFantasia || empresa.razaoSocial;
}

function obterClasseStatus(status: StatusCandidatura) {
  switch (status) {
    case "EM_ANALISE":
      return "bg-amber-100 text-amber-800 dark:bg-amber-950/50 dark:text-amber-300";

    case "CONTATADO":
      return "bg-blue-100 text-blue-800 dark:bg-blue-950/50 dark:text-blue-300";

    case "SELECIONADO":
      return "bg-emerald-100 text-emerald-800 dark:bg-emerald-950/50 dark:text-emerald-300";

    case "RECUSADO":
      return "bg-red-100 text-red-800 dark:bg-red-950/50 dark:text-red-300";
  }
}

export default function BancoTalentosAdminPage() {
  const [aba, setAba] = useState<
    "alunos" | "empresas" | "relatorio"
  >("alunos");

  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);

  const [buscaCPF, setBuscaCPF] = useState("");
  const [buscaEmpresa, setBuscaEmpresa] = useState("");

  const [codigoGerado, setCodigoGerado] = useState<{
    nome: string;
    codigo: string;
    validadeHoras: number;
  } | null>(null);

  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);

  // Relatório de interações
  const [relatorio, setRelatorio] =
    useState<RelatorioInteracoesResponse | null>(null);

  const [carregandoRelatorio, setCarregandoRelatorio] =
    useState(false);

  const [erroRelatorio, setErroRelatorio] = useState("");

  const [filtroEmpresa, setFiltroEmpresa] = useState("");
  const [filtroAluno, setFiltroAluno] = useState("");
  const [filtroStatus, setFiltroStatus] = useState<
    "" | StatusCandidatura
  >("");
  const [filtroDataInicio, setFiltroDataInicio] = useState("");
  const [filtroDataFim, setFiltroDataFim] = useState("");

  async function carregar() {
    setCarregando(true);

    try {
      const [alunosResponse, empresasResponse] = await Promise.all([
        api.get<Aluno[]>("/banco-talentos/admin/alunos-elegiveis"),
        api.get<Empresa[]>("/banco-talentos/admin/empresas"),
      ]);

      setAlunos(alunosResponse.data);
      setEmpresas(empresasResponse.data);
      setMensagem("");
    } catch {
      setMensagem(
        "Não foi possível carregar os dados. Verifique seu acesso administrativo."
      );
    } finally {
      setCarregando(false);
    }
  }

  async function carregarRelatorio() {
    setCarregandoRelatorio(true);
    setErroRelatorio("");

    try {
      const response =
        await api.get<RelatorioInteracoesResponse>(
          "/banco-talentos/admin/relatorio-interacoes",
          {
            params: {
              empresaId: filtroEmpresa || undefined,
              aluno: filtroAluno.trim() || undefined,
              status: filtroStatus || undefined,
              dataInicio: filtroDataInicio || undefined,
              dataFim: filtroDataFim || undefined,
            },
          }
        );

      setRelatorio(response.data);
    } catch {
      setErroRelatorio(
        "Não foi possível carregar o relatório. Verifique seu acesso administrativo."
      );
    } finally {
      setCarregandoRelatorio(false);
    }
  }

  useEffect(() => {
    void carregar();
  }, []);

  // Pesquisa de alunos por CPF
  const alunosFiltrados = useMemo(() => {
    const cpfPesquisa = buscaCPF.replace(/\D/g, "");

    if (!cpfPesquisa) {
      return alunos;
    }

    return alunos.filter((aluno) =>
      aluno.CPF.replace(/\D/g, "").includes(cpfPesquisa)
    );
  }, [alunos, buscaCPF]);

  // Pesquisa de empresas por nome fantasia ou razão social
  const empresasFiltradas = useMemo(() => {
    const pesquisa = buscaEmpresa.trim().toLocaleLowerCase("pt-BR");

    if (!pesquisa) {
      return empresas;
    }

    return empresas.filter((empresa) => {
      const nomeFantasia = (empresa.nomeFantasia || "")
        .toLocaleLowerCase("pt-BR");

      const razaoSocial = empresa.razaoSocial
        .toLocaleLowerCase("pt-BR");

      return (
        nomeFantasia.includes(pesquisa) ||
        razaoSocial.includes(pesquisa)
      );
    });
  }, [empresas, buscaEmpresa]);

  async function gerarCodigo(aluno: Aluno) {
    setCodigoGerado(null);
    setMensagem("");

    try {
      const response = await api.post(
        `/banco-talentos/admin/alunos/${aluno.id}/codigo-ativacao`
      );

      setCodigoGerado({
        nome: response.data.aluno,
        codigo: response.data.codigo,
        validadeHoras: response.data.validadeHoras,
      });

      await carregar();
    } catch {
      setMensagem("Não foi possível gerar o código de ativação.");
    }
  }

  async function alterarStatus(
    empresa: Empresa,
    status: Empresa["status"]
  ) {
    const motivoStatus =
      status === "REPROVADA" || status === "SUSPENSA"
        ? window.prompt("Informe o motivo (opcional):") || ""
        : "";

    setMensagem("");

    try {
      await api.patch(
        `/banco-talentos/admin/empresas/${empresa.id}/status`,
        { status, motivoStatus }
      );

      await carregar();
    } catch {
      setMensagem("Não foi possível atualizar o status da empresa.");
    }
  }

  function limparFiltrosRelatorio() {
    setFiltroEmpresa("");
    setFiltroAluno("");
    setFiltroStatus("");
    setFiltroDataInicio("");
    setFiltroDataFim("");
  }

  function exportarExcel() {
    if (!relatorio || relatorio.totalCandidaturas === 0) {
      return;
    }

    const linhas: string[][] = [
      [
        "EMPRESA",
        "CNPJ",
        "ALUNO",
        "OPORTUNIDADE",
        "DATA DA CANDIDATURA",
        "ÚLTIMA ATUALIZAÇÃO",
        "STATUS",
      ],
    ];

    for (const grupo of relatorio.empresas) {
      for (const candidatura of grupo.candidaturas) {
        linhas.push([
          nomeEmpresa(grupo.empresa),
          grupo.empresa.cnpj,
          candidatura.aluno,
          candidatura.oportunidade,
          formatarData(candidatura.dataCandidatura),
          formatarData(candidatura.ultimaAtualizacao),
          STATUS_LABEL[candidatura.status],
        ]);
      }
    }

    const csv = linhas
      .map((linha) =>
        linha
          .map((valor) => `"${String(valor).replace(/"/g, '""')}"`)
          .join(";")
      )
      .join("\r\n");

    const arquivo = new Blob(["\uFEFF", csv], {
      type: "text/csv;charset=utf-8;",
    });

    const url = URL.createObjectURL(arquivo);
    const link = document.createElement("a");

    link.href = url;
    link.download = "relatorio-interacoes-banco-de-talentos.csv";

    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);

    URL.revokeObjectURL(url);
  }

  function imprimirRelatorio() {
    window.print();
  }

  const totalPorStatus = useMemo(() => {
    const totais: Record<StatusCandidatura, number> = {
      EM_ANALISE: 0,
      CONTATADO: 0,
      SELECIONADO: 0,
      RECUSADO: 0,
    };

    for (const grupo of relatorio?.empresas || []) {
      for (const candidatura of grupo.candidaturas) {
        totais[candidatura.status] += 1;
      }
    }

    return totais;
  }, [relatorio]);

  return (
    <div className="mx-auto max-w-6xl space-y-5 py-4">
      <style jsx global>{`
        @media print {
          @page {
            size: landscape;
            margin: 12mm;
          }

          body * {
            visibility: hidden !important;
          }

          #relatorio-impressao,
          #relatorio-impressao * {
            visibility: visible !important;
          }

          #relatorio-impressao {
            position: absolute !important;
            left: 0 !important;
            top: 0 !important;
            width: 100% !important;
            max-width: none !important;
            color: #000 !important;
            background: #fff !important;
          }

          #relatorio-impressao table {
            width: 100% !important;
            border-collapse: collapse !important;
          }

          #relatorio-impressao th,
          #relatorio-impressao td {
            color: #000 !important;
            background: #fff !important;
            border: 1px solid #999 !important;
            padding: 6px !important;
          }

          #relatorio-impressao h2,
          #relatorio-impressao h3,
          #relatorio-impressao p {
            color: #000 !important;
          }

          .nao-imprimir {
            display: none !important;
          }

          #relatorio-impressao article {
            break-inside: avoid;
            border: none !important;
            background: #fff !important;
          }
        }
      `}</style>

      {/* Cabeçalho */}
      <div className="nao-imprimir">
        <p className="text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-300">
          GESTÃO ADMINISTRATIVA
        </p>

        <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
          Banco de Oportunidades
        </h1>

        <p className="text-sm text-gray-600 dark:text-gray-400">
          Gerencie a elegibilidade dos alunos, as empresas empregadoras
          parceiras e acompanhe as interações e candidaturas.
        </p>
      </div>

      {/* Abas */}
      <div className="nao-imprimir flex flex-wrap gap-2 border-b border-gray-200 dark:border-gray-700">
        <button
          type="button"
          onClick={() => setAba("alunos")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold ${
            aba === "alunos"
              ? "border-fuchsia-600 text-fuchsia-700 dark:text-fuchsia-300"
              : "border-transparent text-gray-600 dark:text-gray-300"
          }`}
        >
          Alunos elegíveis ({alunos.length})
        </button>

        <button
          type="button"
          onClick={() => setAba("empresas")}
          className={`border-b-2 px-4 py-3 text-sm font-semibold ${
            aba === "empresas"
              ? "border-fuchsia-600 text-fuchsia-700 dark:text-fuchsia-300"
              : "border-transparent text-gray-600 dark:text-gray-300"
          }`}
        >
          Empresas empregadoras ({empresas.length})
        </button>

        <button
          type="button"
          onClick={() => {
            setAba("relatorio");
            void carregarRelatorio();
          }}
          className={`border-b-2 px-4 py-3 text-sm font-semibold ${
            aba === "relatorio"
              ? "border-fuchsia-600 text-fuchsia-700 dark:text-fuchsia-300"
              : "border-transparent text-gray-600 dark:text-gray-300"
          }`}
        >
          Relatório de interações
        </button>
      </div>

      {/* Mensagens */}
      {mensagem && (
        <p
          role="status"
          className="nao-imprimir rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200"
        >
          {mensagem}
        </p>
      )}

      {/* Código gerado */}
      {codigoGerado && (
        <div className="nao-imprimir rounded-xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30">
          <p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">
            Código para {codigoGerado.nome}
          </p>

          <div className="my-2 flex flex-wrap items-center gap-3">
            <span className="font-mono text-2xl font-bold tracking-[0.25em] text-emerald-950 dark:text-emerald-100">
              {codigoGerado.codigo}
            </span>

            <button
              type="button"
              onClick={() => {
                void navigator.clipboard.writeText(codigoGerado.codigo);
              }}
              className="rounded-lg border border-emerald-400 px-3 py-1.5 text-sm font-semibold text-emerald-900 dark:text-emerald-200"
            >
              Copiar código
            </button>
          </div>

          <p className="text-xs text-emerald-800 dark:text-emerald-300">
            Válido por {codigoGerado.validadeHoras} horas. O código só aparece
            nesta tela agora; entregue diretamente ao aluno.
          </p>
        </div>
      )}

      {/* Carregamento geral */}
      {carregando && aba !== "relatorio" ? (
        <p className="py-8 text-center text-gray-600 dark:text-gray-300">
          Carregando...
        </p>
      ) : aba === "alunos" ? (
        /* ABA DE ALUNOS */
        <section className="space-y-4">
          <div className="max-w-md">
            <label
              htmlFor="buscaCPF"
              className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              Buscar aluno por CPF
            </label>

            <div className="relative">
              <input
                id="buscaCPF"
                type="text"
                inputMode="numeric"
                maxLength={14}
                placeholder="Digite o CPF do aluno..."
                value={buscaCPF}
                onChange={(event) => setBuscaCPF(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-900 outline-none transition focus:border-fuchsia-600 focus:ring-2 focus:ring-fuchsia-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-fuchsia-400 dark:focus:ring-fuchsia-900"
              />

              {buscaCPF && (
                <button
                  type="button"
                  onClick={() => setBuscaCPF("")}
                  aria-label="Limpar pesquisa"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-fuchsia-600 dark:text-gray-400 dark:hover:text-fuchsia-300"
                >
                  ✕
                </button>
              )}
            </div>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {alunosFiltrados.length} de {alunos.length} alunos encontrados.
            </p>
          </div>

          <div className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900">
            <div className="overflow-x-auto">
              <table className="w-full min-w-760px text-left text-sm">
                <thead className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  <tr>
                    <th className="p-3">Aluno</th>
                    <th className="p-3">CPF</th>
                    <th className="p-3">Contato</th>
                    <th className="p-3">Acesso</th>
                    <th className="p-3">Perfil</th>
                    <th className="p-3">Ação</th>
                  </tr>
                </thead>

                <tbody>
                  {alunosFiltrados.map((aluno) => (
                    <tr
                      key={aluno.id}
                      className="border-t border-gray-200 dark:border-gray-700"
                    >
                      <td className="p-3 font-medium text-gray-900 dark:text-gray-100">
                        {aluno.nome}
                      </td>

                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {aluno.CPF}
                      </td>

                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {aluno.email || aluno.celular}
                      </td>

                      <td className="p-3">
                        {aluno.acessoAtivado ? (
                          <span className="text-emerald-700 dark:text-emerald-300">
                            Ativado
                          </span>
                        ) : (
                          <span className="text-amber-700 dark:text-amber-300">
                            Não ativado
                          </span>
                        )}
                      </td>

                      <td className="p-3 text-gray-700 dark:text-gray-300">
                        {aluno.perfilProfissional?.ativo
                          ? "Publicado"
                          : "Não publicado"}
                      </td>

                      <td className="p-3">
                        <button
                          type="button"
                          disabled={aluno.acessoAtivado}
                          onClick={() => void gerarCodigo(aluno)}
                          className="rounded-lg bg-fuchsia-700 px-3 py-2 text-xs font-semibold text-white hover:bg-fuchsia-800 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          {aluno.acessoAtivado
                            ? "Acesso ativado"
                            : "Gerar código"}
                        </button>
                      </td>
                    </tr>
                  ))}

                  {alunosFiltrados.length === 0 && (
                    <tr>
                      <td
                        colSpan={6}
                        className="p-8 text-center text-sm text-gray-500 dark:text-gray-400"
                      >
                        {buscaCPF
                          ? "Nenhum aluno encontrado com esse CPF."
                          : "Nenhum aluno aprovado disponível no Banco de Oportunidades."}
                      </td>
                    </tr>
                  )}
                </tbody>
              </table>
            </div>
          </div>
        </section>
      ) : aba === "empresas" ? (
        /* ABA DE EMPRESAS */
        <section className="space-y-3">
          <h2 className="text-lg font-bold text-gray-900 dark:text-white">
            Empresas cadastradas
          </h2>

          <div className="max-w-md">
            <label
              htmlFor="buscaEmpresa"
              className="mb-2 block text-sm font-semibold text-gray-700 dark:text-gray-200"
            >
              Buscar empresa pelo nome
            </label>

            <div className="relative">
              <input
                id="buscaEmpresa"
                type="text"
                placeholder="Digite o nome da empresa..."
                value={buscaEmpresa}
                onChange={(event) => setBuscaEmpresa(event.target.value)}
                className="w-full rounded-lg border border-gray-300 bg-white px-4 py-3 pr-10 text-sm text-gray-900 outline-none transition focus:border-fuchsia-600 focus:ring-2 focus:ring-fuchsia-200 dark:border-gray-600 dark:bg-gray-900 dark:text-white dark:placeholder-gray-500 dark:focus:border-fuchsia-400 dark:focus:ring-fuchsia-900"
              />

              {buscaEmpresa && (
                <button
                  type="button"
                  onClick={() => setBuscaEmpresa("")}
                  aria-label="Limpar pesquisa"
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-500 hover:text-fuchsia-600 dark:text-gray-400 dark:hover:text-fuchsia-300"
                >
                  ✕
                </button>
              )}
            </div>

            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
              {empresasFiltradas.length} de {empresas.length} empresas encontradas.
            </p>
          </div>

          {empresasFiltradas.map((empresa) => (
            <article
              key={empresa.id}
              className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"
            >
              <div className="flex flex-wrap items-start justify-between gap-2">
                <div>
                  <h3 className="font-semibold text-gray-900 dark:text-white">
                    {empresa.nomeFantasia || empresa.razaoSocial}
                  </h3>

                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    {empresa.cnpj} · {empresa.cidade || "Cidade não informada"}
                  </p>

                  <p className="mt-1 text-sm text-gray-600 dark:text-gray-300">
                    {empresa.representante} · {empresa.email}
                  </p>

                  <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                    Telefone: {empresa.telefone}
                  </p>
                </div>

                <span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                  {empresa.status}
                </span>
              </div>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  type="button"
                  disabled={empresa.status === "APROVADA"}
                  onClick={() => void alterarStatus(empresa, "APROVADA")}
                  className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Aprovar
                </button>

                <button
                  type="button"
                  disabled={empresa.status === "REPROVADA"}
                  onClick={() => void alterarStatus(empresa, "REPROVADA")}
                  className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Reprovar
                </button>

                <button
                  type="button"
                  disabled={empresa.status === "SUSPENSA"}
                  onClick={() => void alterarStatus(empresa, "SUSPENSA")}
                  className="rounded-md bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Suspender
                </button>
              </div>
            </article>
          ))}

          {empresasFiltradas.length === 0 && (
            <p className="rounded-xl border border-gray-200 bg-white p-6 text-center text-sm text-gray-500 dark:border-gray-700 dark:bg-gray-900 dark:text-gray-400">
              {buscaEmpresa
                ? "Nenhuma empresa encontrada com esse nome."
                : "Nenhuma empresa cadastrada."}
            </p>
          )}
        </section>
      ) : (
        /* ABA DE RELATÓRIO */
        <section id="relatorio-impressao" className="space-y-5">
          <div>
            <p className="text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-300">
              GESTÃO ADMINISTRATIVA
            </p>

            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Relatório de interações 
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Acompanhamento das candidaturas dos alunos junto às empresas
              empregadoras.
            </p>
          </div>

          {/* Filtros */}
          <div className="nao-imprimir rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
            <h3 className="mb-3 font-semibold text-gray-900 dark:text-white">
              Filtros do relatório
            </h3>

            <div className="grid grid-cols-1 gap-3 md:grid-cols-2 lg:grid-cols-3">
              <div>
                <label
                  htmlFor="filtroEmpresa"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Empresa empregadora
                </label>

                <select
                  id="filtroEmpresa"
                  value={filtroEmpresa}
                  onChange={(event) => setFiltroEmpresa(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Todas as empresas</option>

                  {empresas.map((empresa) => (
                    <option key={empresa.id} value={empresa.id}>
                      {empresa.nomeFantasia || empresa.razaoSocial}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label
                  htmlFor="filtroAluno"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Nome do aluno
                </label>

                <input
                  id="filtroAluno"
                  type="text"
                  placeholder="Digite o nome do aluno..."
                  value={filtroAluno}
                  onChange={(event) => setFiltroAluno(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="filtroStatus"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Status da candidatura
                </label>

                <select
                  id="filtroStatus"
                  value={filtroStatus}
                  onChange={(event) =>
                    setFiltroStatus(
                      event.target.value as "" | StatusCandidatura
                    )
                  }
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                >
                  <option value="">Todos os status</option>
                  <option value="EM_ANALISE">Em análise</option>
                  <option value="CONTATADO">Contatado</option>
                  <option value="SELECIONADO">Selecionado</option>
                  <option value="RECUSADO">Recusado</option>
                </select>
              </div>

              <div>
                <label
                  htmlFor="filtroDataInicio"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Data inicial
                </label>

                <input
                  id="filtroDataInicio"
                  type="date"
                  value={filtroDataInicio}
                  onChange={(event) => setFiltroDataInicio(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>

              <div>
                <label
                  htmlFor="filtroDataFim"
                  className="mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300"
                >
                  Data final
                </label>

                <input
                  id="filtroDataFim"
                  type="date"
                  value={filtroDataFim}
                  onChange={(event) => setFiltroDataFim(event.target.value)}
                  className="w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-sm text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white"
                />
              </div>
            </div>

            <div className="mt-4 flex flex-wrap gap-2">
              <button
                type="button"
                disabled={carregandoRelatorio}
                onClick={() => void carregarRelatorio()}
                className="rounded-lg bg-fuchsia-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-fuchsia-800 disabled:opacity-50"
              >
                {carregandoRelatorio ? "Consultando..." : "Aplicar filtros"}
              </button>

              <button
                type="button"
                onClick={() => {
                  limparFiltrosRelatorio();
                  setTimeout(() => {
                    void api.get<RelatorioInteracoesResponse>(
                      "/banco-talentos/admin/relatorio-interacoes"
                    ).then((response) => {
                      setRelatorio(response.data);
                      setErroRelatorio("");
                    }).catch(() => {
                      setErroRelatorio("Não foi possível carregar o relatório.");
                    });
                  }, 0);
                }}
                className="rounded-lg border border-gray-300 px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
              >
                Limpar filtros
              </button>
            </div>
          </div>

          {/* Erro */}
          {erroRelatorio && (
            <p
              role="alert"
              className="rounded-lg border border-red-200 bg-red-50 p-3 text-sm text-red-800 dark:border-red-900 dark:bg-red-950/30 dark:text-red-200"
            >
              {erroRelatorio}
            </p>
          )}

          {/* Carregamento do relatório */}
          {carregandoRelatorio ? (
            <p className="py-8 text-center text-gray-600 dark:text-gray-300">
              Consultando interações...
            </p>
          ) : relatorio ? (
            <>
              {/* Indicadores */}
              <div className="grid grid-cols-2 gap-3 md:grid-cols-3">
                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Empresas
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {relatorio.totalEmpresas}
                  </p>
                </div>

                <div className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Candidaturas
                  </p>
                  <p className="mt-1 text-2xl font-bold text-gray-900 dark:text-white">
                    {relatorio.totalCandidaturas}
                  </p>
                </div>

                <div className="col-span-2 rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900 md:col-span-1">
                  <p className="text-xs font-medium text-gray-500 dark:text-gray-400">
                    Selecionados
                  </p>
                  <p className="mt-1 text-2xl font-bold text-emerald-700 dark:text-emerald-300">
                    {totalPorStatus.SELECIONADO}
                  </p>
                </div>
              </div>

              {/* Resumo por status */}
              <div className="flex flex-wrap gap-2">
                {(
                  Object.keys(STATUS_LABEL) as StatusCandidatura[]
                ).map((status) => (
                  <span
                    key={status}
                    className={`rounded-full px-3 py-1.5 text-xs font-semibold ${obterClasseStatus(status)}`}
                  >
                    {STATUS_LABEL[status]}: {totalPorStatus[status]}
                  </span>
                ))}
              </div>

              {/* Ações */}
              <div className="nao-imprimir flex flex-wrap gap-2">
                <button
                  type="button"
                  onClick={imprimirRelatorio}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Imprimir relatório
                </button>

                <button
                  type="button"
                  onClick={exportarExcel}
                  disabled={relatorio.totalCandidaturas === 0}
                  className="rounded-lg bg-emerald-700 px-4 py-2.5 text-sm font-semibold text-white hover:bg-emerald-800 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Exportar Excel
                </button>

                <button
                  type="button"
                  onClick={() => void carregarRelatorio()}
                  className="rounded-lg border border-gray-300 bg-white px-4 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-200 dark:hover:bg-gray-800"
                >
                  Atualizar
                </button>
              </div>

              {/* Relatório agrupado por empresa */}
              {relatorio.empresas.length > 0 ? (
                <div className="space-y-5">
                  {relatorio.empresas.map((grupo) => (
                    <article
                      key={grupo.empresaId}
                      className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"
                    >
                      <div className="border-b border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <h3 className="font-bold text-gray-900 dark:text-white">
                              {nomeEmpresa(grupo.empresa)}
                            </h3>

                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Razão social: {grupo.empresa.razaoSocial}
                            </p>

                            <p className="text-xs text-gray-500 dark:text-gray-400">
                              CNPJ: {grupo.empresa.cnpj}
                            </p>
                          </div>

                          <span className="rounded-full bg-fuchsia-100 px-3 py-1.5 text-xs font-bold text-fuchsia-800 dark:bg-fuchsia-950/50 dark:text-fuchsia-300">
                            {grupo.totalCandidaturas}{" "}
                            {grupo.totalCandidaturas === 1
                              ? "candidatura"
                              : "candidaturas"}
                          </span>
                        </div>
                      </div>

                      <div className="overflow-x-auto">
                        <table className="w-full min-w-850px text-left text-sm">
                          <thead className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200">
                            <tr>
                              <th className="p-3">Aluno</th>
                              <th className="p-3">Oportunidade</th>
                              <th className="p-3">Data da candidatura</th>
                              <th className="p-3">Última atualização</th>
                              <th className="p-3">Status</th>
                            </tr>
                          </thead>

                          <tbody>
                            {grupo.candidaturas.map((candidatura) => (
                              <tr
                                key={candidatura.id}
                                className="border-t border-gray-200 dark:border-gray-700"
                              >
                                <td className="p-3 font-medium text-gray-900 dark:text-gray-100">
                                  {candidatura.aluno}
                                </td>

                                <td className="p-3 text-gray-700 dark:text-gray-300">
                                  {candidatura.oportunidade}
                                </td>

                                <td className="p-3 text-gray-700 dark:text-gray-300">
                                  {formatarData(candidatura.dataCandidatura)}
                                </td>

                                <td className="p-3 text-gray-700 dark:text-gray-300">
                                  {formatarData(candidatura.ultimaAtualizacao)}
                                </td>

                                <td className="p-3">
                                  <span
                                    className={`inline-block rounded-full px-2.5 py-1 text-xs font-semibold ${obterClasseStatus(candidatura.status)}`}
                                  >
                                    {STATUS_LABEL[candidatura.status]}
                                  </span>
                                </td>
                              </tr>
                            ))}
                          </tbody>
                        </table>
                      </div>
                    </article>
                  ))}
                </div>
              ) : (
                <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
                  <p className="font-semibold text-gray-800 dark:text-gray-200">
                    Nenhuma interação encontrada.
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Não existem candidaturas para os filtros informados.
                  </p>
                </div>
              )}
            </>
          ) : (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
              <p className="text-sm text-gray-500 dark:text-gray-400">
                Clique em Aplicar filtros para consultar as interações.
              </p>
            </div>
          )}
        </section>
      )}
    </div>
  );
}
