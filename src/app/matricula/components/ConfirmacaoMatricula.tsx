"use client";

interface Props {
  confirmacaoCurso: boolean;

  setConfirmacaoCurso: (
    valor: boolean
  ) => void;

  confirmacaoFormatura: boolean;

  setConfirmacaoFormatura: (
    valor: boolean
  ) => void;

  aprovado: boolean;

  setAprovado: (
    valor: boolean
  ) => void;

  justificativa: string;

  setJustificativa: (
    valor: string
  ) => void;
}

export default function ConfirmacaoMatricula({
  confirmacaoCurso,
  setConfirmacaoCurso,
  confirmacaoFormatura,
  setConfirmacaoFormatura,
  aprovado,
  setAprovado,
  justificativa,
  setJustificativa,
}: Props) {

  return (

    <div className="grid grid-cols-3 md:grid-cols-2 xl:grid-cols-2 gap-2 mt-3">

      <div className="grid grid-cols-1 md:grid-cols-3 gap-1">

        <div className="border-0 rounded-lg p-4">

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">

            <input
              type="checkbox"
              checked={confirmacaoCurso}
              onChange={(e) =>
                setConfirmacaoCurso(
                  e.target.checked
                )
              }
              className="accent-purple-600"
            />

            Curso confirmado

          </label>

        </div>

        <div className="border-0 rounded-lg p-4">

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">

            <input
              type="checkbox"
              checked={aprovado}
              onChange={(e) =>
                setAprovado(
                  e.target.checked
                )
              }
              className="accent-purple-600"
            />

            Aprovado no curso

          </label>

        </div>

        <div className="border-0 rounded-lg p-4">

          <label className="flex items-center gap-2 text-sm text-gray-700 dark:text-gray-200">

            <input
              type="checkbox"
              checked={confirmacaoFormatura}
              onChange={(e) =>
                setConfirmacaoFormatura(
                  e.target.checked
                )
              }
              className="accent-purple-600"
            />

            Presença na formatura

          </label>

        </div>

      </div>

      <div>

        <textarea
          value={justificativa}
          onChange={(e) =>
            setJustificativa(
              e.target.value
            )
          }
          rows={1}
          placeholder="Digite uma observação..."
          className="
            w-full
            border
            border-gray-300
            rounded-lg
            p-3
            bg-white
            text-gray-800
            placeholder:text-gray-400
            outline-none
            focus:border-purple-500
            focus:ring-1
            focus:ring-purple-500
            dark:border-gray-700
            dark:bg-gray-800
            dark:text-gray-100
            dark:placeholder:text-gray-500
            dark:focus:border-purple-400
          "
        />

      </div>

    </div>

  );
}