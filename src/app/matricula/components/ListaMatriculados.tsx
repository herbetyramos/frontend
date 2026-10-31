"use client";

import { MatriculaType } from "../types";

interface Props {
  matriculas: MatriculaType[];
  onExcluir: (id: string) => void;
  onEditar: (item: MatriculaType) => void;
}

export default function ListaMatriculados({
  matriculas,
  onExcluir,
  onEditar,
}: Props) {

  const renderStatus = (valor: boolean | undefined) => {
    if (valor === true) {
      return (
        <span className="inline-flex rounded-full bg-green-100 px-2 py-1 text-xs font-semibold text-green-700 dark:bg-green-900/40 dark:text-green-300">
          Sim
        </span>
      );
    }

    if (valor === false) {
      return (
        <span className="inline-flex rounded-full bg-red-100 px-2 py-1 text-xs font-semibold text-red-700 dark:bg-red-900/40 dark:text-red-300">
          Não
        </span>
      );
    }

    return (
      <span className="inline-flex rounded-full bg-gray-100 px-2 py-1 text-xs font-medium text-gray-600 dark:bg-gray-700 dark:text-gray-300">
        Não informado
      </span>
    );
  };

  return (
    <div className="rounded-lg border border-gray-200 bg-white p-2 shadow dark:border-gray-700 dark:bg-gray-900">

      {matriculas.length === 0 ? (

        <p className="py-3 text-sm text-gray-500 dark:text-gray-400">
          Nenhum aluno matriculado.
        </p>

      ) : (

        <div className="overflow-x-auto">

          <table className="w-full border-collapse">

            <thead>

              <tr className="border-b border-gray-200 bg-gray-50 dark:border-gray-700 dark:bg-gray-800">

                <th className="whitespace-nowrap px-3 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Nome
                </th>

                <th className="whitespace-nowrap px-3 py-2 text-left text-sm font-semibold text-gray-700 dark:text-gray-200">
                  CPF
                </th>

                <th className="whitespace-nowrap px-3 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Curso confirmado
                </th>

                <th className="whitespace-nowrap px-3 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Aprovado no curso
                </th>

                <th className="whitespace-nowrap px-3 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Confirmado na formatura
                </th>

                <th className="whitespace-nowrap px-3 py-2 text-center text-sm font-semibold text-gray-700 dark:text-gray-200">
                  Ação
                </th>

              </tr>

            </thead>

            <tbody>

              {matriculas.map((item) => (

                <tr
                  key={item.id}
                  className="border-b border-gray-200 transition-colors hover:bg-gray-50 dark:border-gray-700 dark:hover:bg-gray-800/70"
                >

                  <td className="px-3 py-2 text-sm text-gray-800 dark:text-gray-200">
                    {item.aluno?.nome || "Aluno não informado"}
                  </td>

                  <td className="whitespace-nowrap px-3 py-2 text-sm text-gray-600 dark:text-gray-300">
                    {item.aluno?.CPF || "Falta CPF"}
                  </td>

                  <td className="px-3 py-2 text-center">
                    {renderStatus(item.confirmacao_curso)}
                  </td>

                  <td className="px-3 py-2 text-center">
                    {renderStatus(item.aprovado)}
                  </td>

                  <td className="px-3 py-2 text-center">
                    {renderStatus(item.confirmacao_formatura)}
                  </td>

                  {/* AÇÃO NA ÚLTIMA COLUNA */}

                  <td className="px-3 py-2 text-center">

                    <div className="flex justify-center gap-2">

                      <button
                        type="button"
                        onClick={() => onEditar(item)}
                        className="rounded-lg bg-yellow-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-yellow-600"
                      >
                        Editar
                      </button>

                      <button
                        type="button"
                        onClick={() => onExcluir(item.id)}
                        className="rounded-lg bg-red-500 px-3 py-1.5 text-xs font-medium text-white transition hover:bg-red-600"
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

      )}

    </div>
  );
}