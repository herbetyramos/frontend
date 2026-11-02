
"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { FileText, Printer } from "lucide-react";

type CursoSaldo = {
  id: string;
  empresa: string;
  curso: string;
  contratado: number;
  utilizadas: number;
  saldo: number;
  valorUnitario: number;
  valorContratado: number;
  valorUtilizado: number;
  valorSaldo: number;
};

type EmpresaSaldo = {
  empresa: string;
  cursos: CursoSaldo[];
  totalContratado: number;
  totalUtilizado: number;
  saldoAtual: number;
  totalValorContratado: number;
  totalValorUtilizado: number;
  totalValorSaldo: number;
};

type SaldoRelatorioResponse = {
  empresas: EmpresaSaldo[];
  totalGeral: {
    contratado: number;
    utilizado: number;
    saldo: number;
    valorContratado: number;
    valorUtilizado: number;
    valorSaldo: number;
  };
};

export default function SaldoRelatorio() {
  const [dados, setDados] =
    useState<SaldoRelatorioResponse | null>(null);

  const [empresaSelecionada, setEmpresaSelecionada] =
    useState("");

  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // CARREGAR RELATÓRIO
  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true);
        setErro("");

        const response = await api.get<SaldoRelatorioResponse>(
          "/detentora/saldo-relatorio"
        );

        console.log("RETORNO SALDO RELATÓRIO:", response.data);

        setDados(response.data);
      } catch (error: unknown) {
        console.error(
          "Erro ao carregar relatório de saldo:",
          error
        );

        let mensagem =
          "Não foi possível carregar o relatório de saldo.";

        if (
          typeof error === "object" &&
          error !== null &&
          "response" in error
        ) {
          const response = (
            error as {
              response?: {
                data?: {
                  message?: string;
                  error?: string;
                };
              };
            }
          ).response;

          mensagem =
            response?.data?.message ||
            response?.data?.error ||
            mensagem;
        }

        setErro(mensagem);
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, []);

  // RECUPERAR FILTRO DA URL
  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const empresa = params.get("empresa");

    if (empresa) {
      setEmpresaSelecionada(empresa);
    }
  }, []);

  // LISTA DE EMPRESAS
  const empresas = useMemo(() => {
    if (!dados?.empresas) {
      return [];
    }

    return [...dados.empresas]
      .map((item) => item.empresa?.trim() || "SEM EMPRESA")
      .sort((a, b) => a.localeCompare(b));
  }, [dados]);

  // EMPRESAS FILTRADAS
  const empresasFiltradas = useMemo(() => {
    if (!dados?.empresas) {
      return [];
    }

    if (!empresaSelecionada) {
      return dados.empresas;
    }

    return dados.empresas.filter(
      (empresa) =>
        empresa.empresa.trim() === empresaSelecionada.trim()
    );
  }, [dados, empresaSelecionada]);

  // TOTAL DE TURMAS
  const totais = useMemo(() => {
    return empresasFiltradas.reduce(
      (total, empresa) => ({
        contratado:
          total.contratado +
          Number(empresa.totalContratado || 0),

        utilizado:
          total.utilizado +
          Number(empresa.totalUtilizado || 0),

        saldo:
          total.saldo +
          Number(empresa.saldoAtual || 0),
      }),
      {
        contratado: 0,
        utilizado: 0,
        saldo: 0,
      }
    );
  }, [empresasFiltradas]);

  // TOTAL FINANCEIRO
  const totaisFinanceiros = useMemo(() => {
    return empresasFiltradas.reduce(
      (total, empresa) => ({
        valorContratado:
          total.valorContratado +
          Number(empresa.totalValorContratado || 0),

        valorUtilizado:
          total.valorUtilizado +
          Number(empresa.totalValorUtilizado || 0),

        valorSaldo:
          total.valorSaldo +
          Number(empresa.totalValorSaldo || 0),
      }),
      {
        valorContratado: 0,
        valorUtilizado: 0,
        valorSaldo: 0,
      }
    );
  }, [empresasFiltradas]);

  // FORMATAÇÃO DE QUANTIDADES
  const formatarNumero = (valor: number) => {
    return Number(valor || 0).toLocaleString("pt-BR");
  };

  // FORMATAÇÃO DE MOEDA
  const formatarMoeda = (valor: number) => {
    return Number(valor || 0).toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  // IMPRIMIR
  const imprimir = () => {
    window.print();
  };

  // COR DO SALDO
  const obterClasseSaldo = (saldo: number) => {
    if (saldo <= 0) {
      return "bg-red-600";
    }

    if (saldo <= 5) {
      return "bg-yellow-500";
    }

    return "bg-green-600";
  };

  // CARREGANDO
  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-8">
          <span className="text-lg font-semibold text-gray-700 dark:text-gray-200">
            Carregando relatório de saldo...
          </span>
        </div>
      </div>
    );
  }

  // ERRO
  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 dark:bg-gray-950 p-4">
        <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-lg p-8 max-w-lg w-full text-center">
          <div className="text-red-600 dark:text-red-400 font-bold text-lg mb-3">
            Erro ao carregar relatório
          </div>

          <p className="text-gray-600 dark:text-gray-300 mb-5">
            {erro}
          </p>

          <button
            type="button"
            onClick={() => window.location.reload()}
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold transition"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 dark:bg-gray-950 p-3 sm:p-6 transition-colors">

      {/* CABEÇALHO */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-md p-4 sm:p-5 mb-5">

        <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">

          <div className="flex items-center gap-3">
            <FileText
              size={30}
              className="text-blue-700 dark:text-blue-400 shrink-0"
            />

            <div>
              <h1 className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-400">
                Relatório de Saldo
              </h1>

              <p className="text-sm text-gray-500 dark:text-gray-400">
                Saldo financeiro por empresa e curso
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={imprimir}
            className="no-print flex items-center justify-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition w-full sm:w-auto"
          >
            <Printer size={18} />
            Imprimir / PDF
          </button>
        </div>

        {/* FILTRO */}
        <div className="no-print mt-5 flex flex-col sm:flex-row sm:items-center gap-3">

          <label
            htmlFor="empresa"
            className="font-semibold text-gray-700 dark:text-gray-300"
          >
            Empresa:
          </label>

          <select
            id="empresa"
            value={empresaSelecionada}
            onChange={(e) =>
              setEmpresaSelecionada(e.target.value)
            }
            className="border border-gray-300 dark:border-gray-700 rounded-lg px-3 py-2 bg-white dark:bg-gray-800 text-gray-900 dark:text-gray-100 min-w-0 sm:min-w-[320px] outline-none focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="">
              Todas as empresas
            </option>

            {empresas.map((empresa) => (
              <option key={empresa} value={empresa}>
                {empresa}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* RELATÓRIO */}
      <div className="bg-white dark:bg-gray-900 border border-gray-200 dark:border-gray-800 rounded-xl shadow-md p-3 sm:p-6">

        {/* TÍTULO */}
        <div className="text-center mb-6">
          <h2 className="text-xl font-bold text-gray-800 dark:text-gray-100">
            RELATÓRIO DE SALDO
          </h2>

          <p className="text-gray-600 dark:text-gray-400 mt-1">
            {empresaSelecionada
              ? empresaSelecionada
              : "TODAS AS EMPRESAS"}
          </p>
        </div>

        {empresasFiltradas.length === 0 ? (
          <div className="text-center py-10 text-gray-500 dark:text-gray-400">
            Nenhum registro de saldo encontrado.
          </div>
        ) : (
          empresasFiltradas.map((empresa) => {

            const totalEmpresaContratado =
              Number(empresa.totalContratado || 0);

            const totalEmpresaUtilizado =
              Number(empresa.totalUtilizado || 0);

            const totalEmpresaSaldo =
              Number(empresa.saldoAtual || 0);

            const totalValorContratado =
              Number(empresa.totalValorContratado || 0);

            const totalValorUtilizado =
              Number(empresa.totalValorUtilizado || 0);

            const totalValorSaldo =
              Number(empresa.totalValorSaldo || 0);

            return (
              <div
                key={empresa.empresa}
                className="mb-8"
              >

                {/* NOME DA EMPRESA */}
                <div className="bg-blue-700 dark:bg-blue-800 text-white px-4 py-3 rounded-t-lg font-bold text-base sm:text-lg">
                  EMPRESA: {empresa.empresa.trim()}
                </div>

                {/* TABELA */}
                <div className="overflow-x-auto rounded-b-lg border border-gray-300 dark:border-gray-700">

                  <table className="w-full min-w-1050px border-collapse text-sm">

                    <thead>
                      <tr className="bg-gray-200 dark:bg-gray-800 text-gray-800 dark:text-gray-100">

                        <th className="border border-gray-300 dark:border-gray-700 p-2 text-left">
                          CURSO
                        </th>

                        <th className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                          CONTRATADO
                        </th>

                        <th className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                          UTILIZADO
                        </th>

                        <th className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                          SALDO
                        </th>

                        <th className="border border-gray-300 dark:border-gray-700 p-2 text-right">
                          VALOR UNITÁRIO
                        </th>

                        <th className="border border-gray-300 dark:border-gray-700 p-2 text-right">
                          VALOR CONTRATADO
                        </th>

                        <th className="border border-gray-300 dark:border-gray-700 p-2 text-right">
                          VALOR USADO
                        </th>

                        <th className="border border-gray-300 dark:border-gray-700 p-2 text-right">
                          VALOR SALDO
                        </th>

                      </tr>
                    </thead>

                    <tbody>
                      {empresa.cursos.map((curso) => {

                        const saldo = Number(curso.saldo || 0);

                        return (
                          <tr
                            key={curso.id}
                            className="bg-white dark:bg-gray-900 hover:bg-gray-50 dark:hover:bg-gray-800 text-gray-800 dark:text-gray-200 transition-colors"
                          >

                            <td className="border border-gray-300 dark:border-gray-700 p-2 font-medium">
                              {curso.curso?.trim() || "SEM CURSO"}
                            </td>

                            <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                              {formatarNumero(
                                Number(curso.contratado || 0)
                              )}
                            </td>

                            <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                              {formatarNumero(
                                Number(curso.utilizadas || 0)
                              )}
                            </td>

                            <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                              <span
                                className={`inline-block min-w-42px px-3 py-1 rounded-full font-bold text-white ${obterClasseSaldo(
                                  saldo
                                )}`}
                              >
                                {formatarNumero(saldo)}
                              </span>
                            </td>

                            <td className="border border-gray-300 dark:border-gray-700 p-2 text-right whitespace-nowrap">
                              {formatarMoeda(
                                Number(curso.valorUnitario || 0)
                              )}
                            </td>

                            <td className="border border-gray-300 dark:border-gray-700 p-2 text-right whitespace-nowrap">
                              {formatarMoeda(
                                Number(curso.valorContratado || 0)
                              )}
                            </td>

                            <td className="border border-gray-300 dark:border-gray-700 p-2 text-right whitespace-nowrap">
                              {formatarMoeda(
                                Number(curso.valorUtilizado || 0)
                              )}
                            </td>

                            <td className="border border-gray-300 dark:border-gray-700 p-2 text-right whitespace-nowrap font-semibold text-gray-900 dark:text-gray-100">
                              {formatarMoeda(
                                Number(curso.valorSaldo || 0)
                              )}
                            </td>

                          </tr>
                        );
                      })}
                    </tbody>

                    {/* TOTAL DA EMPRESA */}
                    <tfoot>
                      <tr className="bg-blue-50 dark:bg-blue-950 font-bold text-gray-900 dark:text-gray-100">

                        <td className="border border-gray-300 dark:border-gray-700 p-2 text-right">
                          TOTAL DA EMPRESA:
                        </td>

                        <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                          {formatarNumero(totalEmpresaContratado)}
                        </td>

                        <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                          {formatarNumero(totalEmpresaUtilizado)}
                        </td>

                        <td className="border border-gray-300 dark:border-gray-700 p-2 text-center">
                          {formatarNumero(totalEmpresaSaldo)}
                        </td>

                        <td className="border border-gray-300 dark:border-gray-700 p-2 text-right">
                          —
                        </td>

                        <td className="border border-gray-300 dark:border-gray-700 p-2 text-right whitespace-nowrap">
                          {formatarMoeda(totalValorContratado)}
                        </td>

                        <td className="border border-gray-300 dark:border-gray-700 p-2 text-right whitespace-nowrap">
                          {formatarMoeda(totalValorUtilizado)}
                        </td>

                        <td className="border border-gray-300 dark:border-gray-700 p-2 text-right whitespace-nowrap text-blue-700 dark:text-blue-300">
                          {formatarMoeda(totalValorSaldo)}
                        </td>

                      </tr>
                    </tfoot>

                  </table>
                </div>
              </div>
            );
          })
        )}

        {/* TOTAL GERAL */}
        {empresasFiltradas.length > 0 && (
          <div className="border-t-4 border-blue-700 dark:border-blue-500 mt-8 pt-5">

            <h3 className="text-lg font-bold text-gray-800 dark:text-gray-100 mb-4 text-center">
              RESUMO GERAL
            </h3>

            {/* TOTAIS DE TURMAS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center mb-5">

              <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  TOTAL CONTRATADO
                </div>

                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                  {formatarNumero(totais.contratado)}
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  TOTAL UTILIZADO
                </div>

                <div className="text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                  {formatarNumero(totais.utilizado)}
                </div>
              </div>

              <div className="bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
                  TOTAL DE TURMAS EM SALDO
                </div>

                <div className="text-3xl font-bold text-blue-800 dark:text-blue-200 mt-1">
                  {formatarNumero(totais.saldo)}
                </div>
              </div>

            </div>

            {/* TOTAIS FINANCEIROS */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 text-center">

              <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  VALOR TOTAL CONTRATADO
                </div>

                <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                  {formatarMoeda(
                    totaisFinanceiros.valorContratado
                  )}
                </div>
              </div>

              <div className="bg-gray-100 dark:bg-gray-800 border border-gray-200 dark:border-gray-700 rounded-lg p-4">
                <div className="text-sm text-gray-600 dark:text-gray-400 font-semibold">
                  VALOR TOTAL UTILIZADO
                </div>

                <div className="text-xl sm:text-2xl font-bold text-gray-800 dark:text-gray-100 mt-1">
                  {formatarMoeda(
                    totaisFinanceiros.valorUtilizado
                  )}
                </div>
              </div>

              <div className="bg-blue-100 dark:bg-blue-950 border border-blue-200 dark:border-blue-800 rounded-lg p-4">
                <div className="text-sm text-blue-700 dark:text-blue-300 font-semibold">
                  VALOR TOTAL DO SALDO
                </div>

                <div className="text-xl sm:text-2xl font-bold text-blue-800 dark:text-blue-200 mt-1">
                  {formatarMoeda(
                    totaisFinanceiros.valorSaldo
                  )}
                </div>
              </div>

            </div>
          </div>
        )}
      </div>

      {/* IMPRESSÃO */}
      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 8mm;
          }

          html,
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
            color: black !important;
          }

          .no-print {
            display: none !important;
          }

          body {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }

          table {
            width: 100% !important;
            min-width: 0 !important;
            font-size: 8px !important;
            page-break-inside: auto;
          }

          th,
          td {
            padding: 4px !important;
            white-space: normal !important;
          }

          thead {
            display: table-header-group;
          }

          tfoot {
            display: table-row-group;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          .shadow-md,
          .shadow-lg {
            box-shadow: none !important;
          }

          .overflow-x-auto {
            overflow: visible !important;
          }

          .rounded-xl,
          .rounded-lg {
            border-radius: 0 !important;
          }

          .mb-8 {
            margin-bottom: 20px !important;
          }

          /* IMPRESSÃO SEM FUNDO ESCURO */
          .dark\\:bg-gray-950,
          .dark\\:bg-gray-900,
          .dark\\:bg-gray-800 {
            background: white !important;
          }

          .dark\\:text-gray-100,
          .dark\\:text-gray-200,
          .dark\\:text-gray-300,
          .dark\\:text-gray-400 {
            color: black !important;
          }

          /* MANTER CABEÇALHO E TOTAIS COLORIDOS */
          * {
            -webkit-print-color-adjust: exact !important;
            print-color-adjust: exact !important;
          }
        }
      `}</style>
    </div>
  );
}
