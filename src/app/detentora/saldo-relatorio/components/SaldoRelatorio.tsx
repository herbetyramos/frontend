"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { FileText, Printer } from "lucide-react";

type SaldoType = {
  id: string;
  empresa: string;
  ata?: string;
  curso: string;
  contratado: number;
  utilizadas: number;
  saldo: number;
};

type EmpresaSaldo = {
  empresa: string;
  cursos: SaldoType[];
  totalContratado: number;
  totalUtilizado: number;
  saldoAtual: number;
};

type RelatorioSaldoResponse = {
  empresas: EmpresaSaldo[];
  totalGeral: {
    contratado: number;
    utilizado: number;
    saldo: number;
  };
};

export default function SaldoRelatorio() {
  const [dados, setDados] = useState<SaldoType[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [erro, setErro] = useState("");

  // =====================================================
  // CARREGAR RELATÓRIO
  // =====================================================

  useEffect(() => {
    const carregar = async () => {
      try {
        setCarregando(true);
        setErro("");

        const response =
          await api.get<RelatorioSaldoResponse>(
            "/detentora/saldo-relatorio"
          );

        const empresas = response.data?.empresas ?? [];

        const registros = empresas.flatMap(
          (empresa) => empresa.cursos ?? []
        );

        setDados(registros);
      } catch (error) {
        console.error(
          "Erro ao carregar relatório de saldo:",
          error
        );

        setErro(
          "Não foi possível carregar o relatório de saldo."
        );
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, []);

  // =====================================================
  // LER EMPRESA PELA URL
  // =====================================================

  useEffect(() => {
    const params = new URLSearchParams(
      window.location.search
    );

    const empresa = params.get("empresa");

    if (empresa) {
      setEmpresaSelecionada(empresa);
    }
  }, []);

  // =====================================================
  // LISTA DE EMPRESAS
  // =====================================================

  const empresas = useMemo(() => {
    return Array.from(
      new Set(
        dados
          .map((item) => item.empresa?.trim())
          .filter(
            (empresa): empresa is string =>
              Boolean(empresa)
          )
      )
    ).sort((a, b) =>
      a.localeCompare(b, "pt-BR")
    );
  }, [dados]);

  // =====================================================
  // FILTRAR POR EMPRESA
  // =====================================================

  const dadosFiltrados = useMemo(() => {
    if (!empresaSelecionada) {
      return dados;
    }

    return dados.filter(
      (item) =>
        item.empresa?.trim() ===
        empresaSelecionada.trim()
    );
  }, [dados, empresaSelecionada]);

  // =====================================================
  // AGRUPAR POR EMPRESA
  // =====================================================

  const grupos = useMemo(() => {
    const resultado: Record<string, SaldoType[]> = {};

    dadosFiltrados.forEach((item) => {
      const empresa =
        item.empresa?.trim() || "SEM EMPRESA";

      if (!resultado[empresa]) {
        resultado[empresa] = [];
      }

      resultado[empresa].push(item);
    });

    return resultado;
  }, [dadosFiltrados]);

  // =====================================================
  // ORDENAR EMPRESAS
  // =====================================================

  const gruposOrdenados = useMemo(() => {
    return Object.entries(grupos).sort(
      ([empresaA], [empresaB]) =>
        empresaA.localeCompare(
          empresaB,
          "pt-BR"
        )
    );
  }, [grupos]);

  // =====================================================
  // TOTAL CONTRATADO
  // =====================================================

  const totalContratado = useMemo(() => {
    return dadosFiltrados.reduce(
      (total, item) =>
        total + Number(item.contratado || 0),
      0
    );
  }, [dadosFiltrados]);

  // =====================================================
  // TOTAL UTILIZADO
  // =====================================================

  const totalUtilizadas = useMemo(() => {
    return dadosFiltrados.reduce(
      (total, item) =>
        total + Number(item.utilizadas || 0),
      0
    );
  }, [dadosFiltrados]);

  // =====================================================
  // TOTAL SALDO
  // =====================================================

  const totalGeral = useMemo(() => {
    return dadosFiltrados.reduce(
      (total, item) =>
        total + Number(item.saldo || 0),
      0
    );
  }, [dadosFiltrados]);

  // =====================================================
  // FORMATAR NÚMERO
  // =====================================================

  const formatarNumero = (valor: number) => {
    return Number(valor || 0).toLocaleString(
      "pt-BR"
    );
  };

  // =====================================================
  // IMPRIMIR
  // =====================================================

  const imprimir = () => {
    window.print();
  };

  // =====================================================
  // CARREGANDO
  // =====================================================

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="bg-white rounded-lg shadow p-8 text-center">
          <FileText
            size={36}
            className="mx-auto mb-3 text-blue-700"
          />

          <span className="text-lg font-semibold text-gray-700">
            Carregando relatório de saldo...
          </span>
        </div>
      </div>
    );
  }

  // =====================================================
  // ERRO
  // =====================================================

  if (erro) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
        <div className="bg-white rounded-lg shadow p-8 text-center max-w-md">
          <FileText
            size={40}
            className="mx-auto mb-4 text-red-600"
          />

          <h2 className="text-xl font-bold text-red-700 mb-2">
            Erro ao carregar relatório
          </h2>

          <p className="text-gray-600">
            {erro}
          </p>
        </div>
      </div>
    );
  }

  // =====================================================
  // TELA
  // =====================================================

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      {/* =================================================
          CABEÇALHO
      ================================================= */}

      <div className="bg-white rounded-lg shadow p-5 mb-5">
        <div className="flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <FileText
              size={28}
              className="text-blue-700"
            />

            <div>
              <h1 className="text-2xl font-bold text-blue-800">
                Relatório de Saldo
              </h1>

              <p className="text-sm text-gray-500">
                Saldo por empresa, ATA e curso
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

        {/* =================================================
            FILTRO EMPRESA
        ================================================= */}

        <div className="mt-5 flex items-center gap-3">
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
            className="border border-gray-300 rounded-md px-3 py-2 bg-white  focus:outline-none focus:ring-2 focus:ring-blue-500"
          >
            <option value="">
              Todas as empresas
            </option>

            {empresas.map((empresa) => (
              <option
                key={empresa}
                value={empresa}
              >
                {empresa}
              </option>
            ))}
          </select>
        </div>
      </div>

      {/* =================================================
          RELATÓRIO
      ================================================= */}

      <div className="bg-white rounded-lg shadow p-6">
        {/* =================================================
            TÍTULO
        ================================================= */}

        <div className="text-center mb-6">
          <h2 className="text-xl font-bold">
            RELATÓRIO DE SALDO
          </h2>

          <p className="text-gray-600 mt-1">
            {empresaSelecionada
              ? empresaSelecionada
              : "TODAS AS EMPRESAS"}
          </p>
        </div>

        {/* =================================================
            SEM REGISTROS
        ================================================= */}

        {gruposOrdenados.length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Nenhum registro de saldo encontrado.
          </div>
        ) : (
          /* =================================================
             EMPRESAS
          ================================================= */

          gruposOrdenados.map(
            ([empresa, registros]) => {
              // -------------------------------------------
              // TOTAL DA EMPRESA
              // -------------------------------------------

              const totalEmpresaContratado =
                registros.reduce(
                  (total, item) =>
                    total +
                    Number(
                      item.contratado || 0
                    ),
                  0
                );

              const totalEmpresaUtilizado =
                registros.reduce(
                  (total, item) =>
                    total +
                    Number(
                      item.utilizadas || 0
                    ),
                  0
                );

              const totalEmpresaSaldo =
                registros.reduce(
                  (total, item) =>
                    total +
                    Number(
                      item.saldo || 0
                    ),
                  0
                );

              return (
                <div
                  key={empresa}
                  className="mb-8 empresa-bloco"
                >
                  {/* =====================================
                      EMPRESA
                  ===================================== */}

                  <div className="bg-blue-700 text-white px-4 py-2 rounded-t-lg font-bold text-lg">
                    EMPRESA: {empresa}
                  </div>

                  {/* =====================================
                      TABELA
                  ===================================== */}

                  <div className="overflow-x-auto">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-200">
                          <th className="border border-gray-300 p-2 text-left">
                            ATA
                          </th>

                          <th className="border border-gray-300 p-2 text-left">
                            CURSO
                          </th>

                          <th className="border border-gray-300 p-2 text-center">
                            CONTRATADO
                          </th>

                          <th className="border border-gray-300 p-2 text-center">
                            UTILIZADO
                          </th>

                          <th className="border border-gray-300 p-2 text-center">
                            SALDO
                          </th>
                        </tr>
                      </thead>

                      <tbody>
                        {registros.map(
                          (item) => {
                            const saldo =
                              Number(
                                item.saldo || 0
                              );

                            return (
                              <tr
                                key={item.id}
                                className="hover:bg-gray-50"
                              >
                                {/* ATA */}

                                <td className="border border-gray-300 p-2">
                                  {item.ata ||
                                    "-"}
                                </td>

                                {/* CURSO */}

                                <td className="border border-gray-300 p-2">
                                  {item.curso?.trim() ||
                                    "-"}
                                </td>

                                {/* CONTRATADO */}

                                <td className="border border-gray-300 p-2 text-center">
                                  {formatarNumero(
                                    Number(
                                      item.contratado ||
                                        0
                                    )
                                  )}
                                </td>

                                {/* UTILIZADO */}

                                <td className="border border-gray-300 p-2 text-center">
                                  {formatarNumero(
                                    Number(
                                      item.utilizadas ||
                                        0
                                    )
                                  )}
                                </td>

                                {/* SALDO */}

                                <td className="border border-gray-300 p-2 text-center">
                                  <span
                                    className={`inline-block px-3 py-1 rounded-full font-bold text-white ${
                                      saldo <=
                                      0
                                        ? "bg-red-600"
                                        : saldo <=
                                          5
                                        ? "bg-yellow-500"
                                        : "bg-green-600"
                                    }`}
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

                      {/* =================================
                          TOTAL EMPRESA
                      ================================= */}

                      <tfoot>
                        <tr className="bg-blue-50 font-bold">
                          <td
                            colSpan={2}
                            className="border border-gray-300 p-2 text-right"
                          >
                            TOTAL {empresa}:
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

                          <td className="border border-gray-300 p-2 text-center text-blue-700">
                            {formatarNumero(
                              totalEmpresaSaldo
                            )}
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

        {/* =================================================
            TOTAIS GERAIS
        ================================================= */}

        <div className="border-t-4 border-blue-700 mt-8 pt-5">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-center">
            {/* TOTAL CONTRATADO */}

            <div className="bg-gray-100 rounded-lg p-4">
              <div className="text-sm text-gray-600">
                TOTAL CONTRATADO
              </div>

              <div className="text-2xl font-bold text-gray-800">
                {formatarNumero(
                  totalContratado
                )}
              </div>
            </div>

            {/* TOTAL UTILIZADO */}

            <div className="bg-gray-100 rounded-lg p-4">
              <div className="text-sm text-gray-600">
                TOTAL UTILIZADO
              </div>

              <div className="text-2xl font-bold text-gray-800">
                {formatarNumero(
                  totalUtilizadas
                )}
              </div>
            </div>

            {/* TOTAL SALDO */}

            <div className="bg-blue-100 rounded-lg p-4">
              <div className="text-sm text-blue-700 font-semibold">
                TOTAL GERAL DO SALDO
              </div>

              <div className="text-3xl font-bold text-blue-800">
                {formatarNumero(totalGeral)}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* =================================================
          IMPRESSÃO
      ================================================= */}

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

          .empresa-bloco {
            page-break-inside: avoid;
            break-inside: avoid;
          }

          table {
            width: 100% !important;
            page-break-inside: auto;
            border-collapse: collapse !important;
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

          th,
          td {
            border: 1px solid #999 !important;
          }

          .bg-gray-100 {
            background: white !important;
          }

          .shadow {
            box-shadow: none !important;
          }

          .overflow-x-auto {
            overflow: visible !important;
          }

          button {
            display: none !important;
          }
        }
      `}</style>
    </div>
  );
}