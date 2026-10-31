"use client";

import { CronogramaType } from "../types";

interface Props {
  cronogramas: CronogramaType[];
  valorSelecionado: string;
  onChange: (id: string) => void;
}

export default function CronogramaSelect({
  cronogramas,
  valorSelecionado,
  onChange,
}: Props) {

  return (
    <div className="w-full min-w-0 rounded-xl border border-gray-200 bg-white p-2 shadow dark:border-gray-700 dark:bg-gray-900">

      <label className="mb-1 block text-sm font-semibold text-gray-700 dark:text-gray-200">
        Curso
      </label>

      <select
        value={valorSelecionado}
        onChange={(e) => onChange(e.target.value)}
        className="
          w-full
          min-w-0
          rounded-lg
          border
          border-gray-300
          bg-white
          px-3
          py-2.5
          text-sm
          text-gray-800
          outline-none
          transition-colors
          focus:border-purple-500
          focus:ring-1
          focus:ring-purple-500
          dark:border-gray-700
          dark:bg-gray-800
          dark:text-gray-100
          dark:focus:border-purple-400
        "
      >

        <option value="">
          Selecione uma turma
        </option>

        {cronogramas.map((item) => (
          <option
            key={item.id}
            value={item.id}
          >
            {item.tema} - {item.data_inicio}
          </option>
        ))}

      </select>

    </div>
  );
}