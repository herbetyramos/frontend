"use client";

import { useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { FileText, Printer } from "lucide-react";

type SaldoType = {
  id: string;
  empresa: string;
  ata: string;
  curso: string;
  contratado: number;
  utilizadas: number;
  saldo: number;
};

export default function SaldoRelatorio() {
  const [dados, setDados] = useState<SaldoType[]>([]);
  const [empresaSelecionada, setEmpresaSelecionada] = useState("");
  const [carregando, setCarregando] = useState(true);

  useEffect(() => {
    const carregar = async () => {
      try {
        const response = await api.get<SaldoType[]>("/detentora/saldo-relatorio");
        setDados(response.data);
      } catch (error) {
        console.error("Erro ao carregar relatório de saldo:", error);
      } finally {
        setCarregando(false);
      }
    };

    carregar();
  }, []);

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const empresa = params.get("empresa");

    if (empresa) {
      setEmpresaSelecionada(empresa);
    }
  }, []);

  const empresas = useMemo(() => {
    return Array.from(
      new Set(
        dados
          .map((item) => item.empresa)
          .filter((empresa) => empresa.trim() !== "")
      )
    ).sort((a, b) => a.localeCompare(b));
  }, [dados]);

  const dadosFiltrados = useMemo(() => {
    if (!empresaSelecionada) {
      return dados;
    }

    return dados.filter(
      (item) => item.empresa === empresaSelecionada
    );
  }, [dados, empresaSelecionada]);

  const grupos = useMemo(() => {
    const resultado: Record<string, SaldoType[]> = {};

    dadosFiltrados.forEach((item) => {
      const empresa = item.empresa.trim() || "SEM EMPRESA";

      if (!resultado[empresa]) {
        resultado[empresa] = [];
      }

      resultado[empresa].push(item);
    });

    return resultado;
  }, [dadosFiltrados]);

  const totalContratado = useMemo(() => {
    return dadosFiltrados.reduce(
      (total, item) => total + Number(item.contratado),
      0
    );
  }, [dadosFiltrados]);

  const totalUtilizadas = useMemo(() => {
    return dadosFiltrados.reduce(
      (total, item) => total + Number(item.utilizadas),
      0
    );
  }, [dadosFiltrados]);

  const totalGeral = useMemo(() => {
    return dadosFiltrados.reduce(
      (total, item) => total + Number(item.saldo),
      0
    );
  }, [dadosFiltrados]);

  const formatarNumero = (valor: number) => {
    return valor.toLocaleString("pt-BR");
  };

  const imprimir = () => {
    window.print();
  };

  if (carregando) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <span className="text-lg font-semibold">
          Carregando relatório de saldo...
        </span>
      </div>
    );
  }

  return (
    <div className="p-6 bg-gray-100 min-h-screen">
      <div className="bg-white rounded-lg shadow p-5 mb-5">
        <div className="flex items-center justify-between">
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
            className="no-print flex items-center gap-2 bg-blue-600 hover:bg-blue-700 text-white px-4 py-2 rounded-lg font-semibold"
          >
            <Printer size={18} />
            Imprimir / PDF
          </button>
        </div>

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
              setEmpresaSelecionada(e.target.value)
            }
            className="border rounded-md px-3 py-2  bg-white"
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

      <div className="bg-white rounded-lg shadow p-6">
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

        {Object.keys(grupos).length === 0 ? (
          <div className="text-center py-10 text-gray-500">
            Nenhum registro de saldo encontrado.
          </div>
        ) : (
          Object.entries(grupos).map(
            ([empresa, registros]) => {
              const totalEmpresaContratado =
                registros.reduce(
                  (total, item) =>
                    total + Number(item.contratado),
                  0
                );

              const totalEmpresaUtilizado =
                registros.reduce(
                  (total, item) =>
                    total + Number(item.utilizadas),
                  0
                );

              const totalEmpresaSaldo =
                registros.reduce(
                  (total, item) =>
                    total + Number(item.saldo),
                  0
                );

              return (
                <div
                  key={empresa}
                  className="mb-8"
                >
                  <div className="bg-blue-700 text-white px-4 py-2 rounded-t-lg font-bold text-lg">
                    EMPRESA: {empresa}
                  </div>

                  <table className="w-full border-collapse">
                    <thead>
                      <tr className="bg-gray-200">
                        <th className="border p-2 text-left">
                          ATA
                        </th>

                        <th className="border p-2 text-left">
                          CURSO
                        </th>

                        <th className="border p-2 text-center">
                          CONTRATADO
                        </th>

                        <th className="border p-2 text-center">
                          UTILIZADO
                        </th>

                        <th className="border p-2 text-center">
                          SALDO
                        </th>
                      </tr>
                    </thead>

                    <tbody>
                      {registros.map((item) => (
                        <tr key={item.id}>
                          <td className="border p-2">
                            {item.ata}
                          </td>

                          <td className="border p-2">
                            {item.curso}
                          </td>

                          <td className="border p-2 text-center">
                            {formatarNumero(
                              Number(item.contratado)
                            )}
                          </td>

                          <td className="border p-2 text-center">
                            {formatarNumero(
                              Number(item.utilizadas)
                            )}
                          </td>

                          <td className="border p-2 text-center">
                            <span
                              className={`inline-block px-3 py-1 rounded-full font-bold text-white ${
                                Number(item.saldo) <= 0
                                  ? "bg-red-600"
                                  : Number(item.saldo) <= 5
                                  ? "bg-yellow-500"
                                  : "bg-green-600"
                              }`}
                            >
                              {formatarNumero(
                                Number(item.saldo)
                              )}
                            </span>
                          </td>
                        </tr>
                      ))}
                    </tbody>

                    <tfoot>
                      <tr className="bg-blue-50 font-bold">
                        <td
                          colSpan={2}
                          className="border p-2 text-right"
                        >
                          TOTAL {empresa}:
                        </td>

                        <td className="border p-2 text-center">
                          {formatarNumero(
                            totalEmpresaContratado
                          )}
                        </td>

                        <td className="border p-2 text-center">
                          {formatarNumero(
                            totalEmpresaUtilizado
                          )}
                        </td>

                        <td className="border p-2 text-center text-blue-700">
                          {formatarNumero(
                            totalEmpresaSaldo
                          )}
                        </td>
                      </tr>
                    </tfoot>
                  </table>
                </div>
              );
            }
          )
        )}

        <div className="border-t-4 border-blue-700 mt-8 pt-5">
          <div className="grid grid-cols-3 gap-4 text-center">
            <div className="bg-gray-100 rounded-lg p-4">
              <div className="text-sm text-gray-600">
                TOTAL CONTRATADO
              </div>

              <div className="text-2xl font-bold">
                {formatarNumero(totalContratado)}
              </div>
            </div>

            <div className="bg-gray-100 rounded-lg p-4">
              <div className="text-sm text-gray-600">
                TOTAL UTILIZADO
              </div>

              <div className="text-2xl font-bold">
                {formatarNumero(totalUtilizadas)}
              </div>
            </div>

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

      <style jsx global>{`
        @media print {
          @page {
            size: A4 landscape;
            margin: 10mm;
          }

          body {
            background: white !important;
          }

          .no-print {
            display: none !important;
          }

          table {
            page-break-inside: auto;
          }

          tr {
            page-break-inside: avoid;
            page-break-after: auto;
          }

          .bg-gray-100 {
            background: white !important;
          }

          .shadow {
            box-shadow: none !important;
          }
        }
      `}</style>
    </div>
  );
}