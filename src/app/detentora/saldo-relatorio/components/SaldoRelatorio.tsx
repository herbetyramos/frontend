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
};

type EmpresaSaldo = {
  empresa: string;
  cursos: CursoSaldo[];
  totalContratado: number;
  totalUtilizado: number;
  saldoAtual: number;
};

type SaldoRelatorioResponse = {
  empresas: EmpresaSaldo[];
  totalGeral: {
    contratado: number;
    utilizado: number;
    saldo: number;
  };
};

export default function SaldoRelatorio() {
  const [dados, setDados] =
    useState<SaldoRelatorioResponse | null>(null);

  const [empresaSelecionada, setEmpresaSelecionada] =
    useState("");

  const [carregando, setCarregando] =
    useState(true);

  const [erro, setErro] =
    useState("");

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true);
        setErro("");

        const response =
          await api.get<SaldoRelatorioResponse>(
            "/detentora/saldo-relatorio"
          );

        console.log(
          "RETORNO SALDO RELATÓRIO:",
          response.data
        );

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

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const empresa = params.get("empresa");

    if (empresa) {
      setEmpresaSelecionada(empresa);
    }
  }, []);

  const empresas = useMemo(() => {
    if (!dados?.empresas) {
      return [];
    }

    return [...dados.empresas]
      .map(
        (item) =>
          item.empresa?.trim() || "SEM EMPRESA"
      )
      .sort((a, b) =>
        a.localeCompare(b)
      );
  }, [dados]);

  const empresasFiltradas = useMemo(() => {
    if (!dados?.empresas) {
      return [];
    }

    if (!empresaSelecionada) {
      return dados.empresas;
    }

    return dados.empresas.filter(
      (empresa) =>
        empresa.empresa.trim() ===
        empresaSelecionada.trim()
    );
  }, [
    dados,
    empresaSelecionada,
  ]);

  const totalContratado = useMemo(() => {
    return empresasFiltradas.reduce(
      (total, empresa) =>
        total +
        Number(
          empresa.totalContratado || 0
        ),
      0
    );
  }, [empresasFiltradas]);

  const totalUtilizado = useMemo(() => {
    return empresasFiltradas.reduce(
      (total, empresa) =>
        total +
        Number(
          empresa.totalUtilizado || 0
        ),
      0
    );
  }, [empresasFiltradas]);

  const totalSaldo = useMemo(() => {
    return empresasFiltradas.reduce(
      (total, empresa) =>
        total +
        Number(
          empresa.saldoAtual || 0
        ),
      0
    );
  }, [empresasFiltradas]);

  const formatarNumero = (
    valor: number
  ) => {
    return Number(
      valor || 0
    ).toLocaleString("pt-BR");
  };

  const formatarCurso = (
    curso: string
  ) => {
    return (
      curso?.trim() || "SEM CURSO"
    ).toLocaleUpperCase("pt-BR");
  };

  const imprimir = () => {
    window.print();
  };

  const obterClasseSaldo = (
    saldo: number
  ) => {
    if (saldo <= 0) {
      return "bg-red-600";
    }

    if (saldo <= 5) {
      return "bg-yellow-500";
    }

    return "bg-green-600";
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow p-8">
          <span className="text-lg font-semibold text-gray-700">
            Carregando relatório de saldo...
          </span>
        </div>
      </div>
    );
  }

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white rounded-lg shadow p-8 max-w-lg w-full text-center">
          <div className="text-red-600 font-bold text-lg mb-3">
            Erro ao carregar relatório
          </div>

          <p className="text-gray-600 mb-5">
            {erro}
          </p>

          <button
            type="button"
            onClick={() =>
              window.location.reload()
            }
            className="bg-blue-600 hover:bg-blue-700 text-white px-5 py-2 rounded-lg font-semibold"
          >
            Tentar novamente
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-100 p-6">

      {/* CABEÇALHO */}
      <div className="bg-white rounded-lg shadow p-5 mb-5">

        <div className="flex items-center justify-between gap-4">

          <div className="flex items-center gap-3">

            <FileText
              size={30}
              className="text-blue-700"
            />

            <div>

              <h1 className="text-2xl font-bold text-blue-800">
                Relatório de Saldo
              </h1>

              <p className="text-sm text-gray-500">
                Saldo por empresa e curso
              </p>

            </div>

          </div>

          <button
            type="button"
            onClick={imprimir}
            className="no-print flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold transition"
          >
            <Printer size={18} />

            Imprimir / PDF
          </button>

        </div>

        {/* FILTRO */}
        <div className="no-print mt-5 flex items-center gap-3">

          <label
            htmlFor="empresa"
            className="font-semibold text-gray-700"
          >
            Empresa:
          </label>

          <select
            id="empresa"
            value={empresaSelecionada}
            onChange={(e) =>
              setEmpresaSelecionada(
                e.target.value
              )
            }
            className="border border-gray-300 rounded-md px-3 py-2 bg-white min-w-[320px] outline-none focus:ring-2 focus:ring-blue-500"
          >

            <option value="">
              Todas as empresas
            </option>

            {empresas.map(
              (empresa) => (
                <option
                  key={empresa}
                  value={empresa}
                >
                  {empresa}
                </option>
              )
            )}

          </select>

        </div>

      </div>

      {/* RELATÓRIO */}
      <div className="bg-white rounded-lg shadow p-6">

        <div className="text-center mb-6">

          <h2 className="text-xl font-bold text-gray-800">
            RELATÓRIO DE SALDO
          </h2>

          <p className="text-gray-600 mt-1">
            {empresaSelecionada
              ? empresaSelecionada
              : "TODAS AS EMPRESAS"}
          </p>

        </div>

        {empresasFiltradas.length === 0 ? (

          <div className="text-center py-10 text-gray-500">
            Nenhum registro de saldo encontrado.
          </div>

        ) : (

          empresasFiltradas.map(
            (empresa) => {

              const totalEmpresaContratado =
                Number(
                  empresa.totalContratado || 0
                );

              const totalEmpresaUtilizado =
                Number(
                  empresa.totalUtilizado || 0
                );

              const totalEmpresaSaldo =
                Number(
                  empresa.saldoAtual || 0
                );

              return (
                <div
                  key={empresa.empresa}
                  className="mb-8"
                >

                  {/* EMPRESA */}
                  <div className="bg-blue-700 text-white px-4 py-3 rounded-t-lg font-bold text-lg">
                    EMPRESA:{" "}
                    {empresa.empresa.trim()}
                  </div>

                  {/* TABELA */}
                  <div className="overflow-x-auto">

                    <table className="w-full border-collapse">

                      <thead>

                        <tr className="bg-gray-200">

                          <th className="border border-gray-300 p-2 text-left">
                            CURSO
                          </th>

                          <th className="border border-gray-300 p-2 text-center w-32">
                            CONTRATADO
                          </th>

                          <th className="border border-gray-300 p-2 text-center w-32">
                            UTILIZADO
                          </th>

                          <th className="border border-gray-300 p-2 text-center w-32">
                            SALDO
                          </th>

                        </tr>

                      </thead>

                      <tbody>

                        {empresa.cursos.map(
                          (curso) => {

                            const saldo =
                              Number(
                                curso.saldo || 0
                              );

                            return (
                              <tr
                                key={curso.id}
                                className="hover:bg-gray-50"
                              >

                                {/* CURSO EM MAIÚSCULAS */}
                                <td className="border border-gray-300 p-2 font-medium">
                                  {formatarCurso(
                                    curso.curso
                                  )}
                                </td>

                                <td className="border border-gray-300 p-2 text-center">
                                  {formatarNumero(
                                    Number(
                                      curso.contratado || 0
                                    )
                                  )}
                                </td>

                                <td className="border border-gray-300 p-2 text-center">
                                  {formatarNumero(
                                    Number(
                                      curso.utilizadas || 0
                                    )
                                  )}
                                </td>

                                <td className="border border-gray-300 p-2 text-center">

                                  <span
                                    className={`inline-block px-3 py-1 rounded-full font-bold text-white ${obterClasseSaldo(
                                      saldo
                                    )}`}
                                  >
                                    {formatarNumero(
                                      saldo
                                    )}
                                  </span>

                                </td>

                              </tr>
                            );
                          }
                        )}

                      </tbody>

                      {/* TOTAL EMPRESA */}
                      <tfoot>

                        <tr className="bg-blue-50 font-bold">

                          <td className="border border-gray-300 p-2 text-right">
                            TOTAL{" "}
                            {empresa.empresa.trim()}:
                          </td>

                          <td className="border border-gray-300 p-2 text-center">
                            {formatarNumero(
                              totalEmpresaContratado
                            )}
                          </td>

                          <td className="border border-gray-300 p-2 text-center">
                            {formatarNumero(
                              totalEmpresaUtilizado
                            )}
                          </td>

                          <td className="border border-gray-300 p-2 text-center">

                            <span className="font-bold text-blue-700">
                              {formatarNumero(
                                totalEmpresaSaldo
                              )}
                            </span>

                          </td>

                        </tr>

                      </tfoot>

                    </table>

                  </div>

                </div>
              );
            }
          )
        )}

        {/* TOTAL GERAL */}
        <div className="border-t-4 border-blue-700 mt-8 pt-5">

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">

            {/* CONTRATADO */}
            <div className="bg-gray-100 rounded-lg p-4">

              <div className="text-sm text-gray-600 font-semibold">
                TOTAL CONTRATADO
              </div>

              <div className="text-2xl font-bold text-gray-800 mt-1">
                {formatarNumero(
                  totalContratado
                )}
              </div>

            </div>

            {/* UTILIZADO */}
            <div className="bg-gray-100 rounded-lg p-4">

              <div className="text-sm text-gray-600 font-semibold">
                TOTAL UTILIZADO
              </div>

              <div className="text-2xl font-bold text-gray-800 mt-1">
                {formatarNumero(
                  totalUtilizado
                )}
              </div>

            </div>

            {/* SALDO */}
            <div className="bg-blue-100 rounded-lg p-4">

              <div className="text-sm text-blue-700 font-semibold">
                TOTAL GERAL DO SALDO
              </div>

              <div className="text-3xl font-bold text-blue-800 mt-1">
                {formatarNumero(
                  totalSaldo
                )}
              </div>

            </div>

          </div>

        </div>

      </div>

      {/* IMPRESSÃO */}
      <style jsx global>{`

        @media print {

          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          html,
          body {
            background: white !important;
            margin: 0 !important;
            padding: 0 !important;
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
            page-break-inside: auto;
          }

          thead {
            display: table-header-group;
          }

          tfoot {
            display: table-footer-group;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          .shadow {
            box-shadow: none !important;
          }

          .bg-gray-100 {
            background: white !important;
          }

          .bg-white {
            background: white !important;
          }

          .rounded-lg {
            border-radius: 0 !important;
          }

          .mb-8 {
            margin-bottom: 20px !important;
          }

        }

      `}</style>

    </div>
  );
}