
"use client";

interface LinhaPlanejamentoProps {
  dia: number;
  value?: string | null;
  onChange: (value: string) => void;
  bloqueado: boolean;
}

export default function LinhaPlanejamento({
  dia,
  value,
  onChange,
  bloqueado,
}: LinhaPlanejamentoProps) {
  return (
    <tr>
      <td
        className="
          w-20
          border border-gray-300
          py-3
          text-center
          align-top
          font-bold
          dark:border-gray-700
        "
      >
        {dia}
      </td>

      <td className="border border-gray-300 p-2 dark:border-gray-700">
        <textarea
          value={value ?? ""}
          disabled={bloqueado}
          onChange={(e) => onChange(e.target.value)}
          rows={4}
          className="
            w-full
            resize-none
            rounded-md
            border border-gray-300
            bg-white
            p-2
            text-gray-900
            outline-none
            focus:border-blue-500
            disabled:bg-gray-100
            disabled:text-gray-600
            dark:border-gray-600
            dark:bg-gray-900
            dark:text-gray-100
            dark:disabled:bg-gray-800
            dark:disabled:text-gray-400
          "
        />
      </td>
    </tr>
  );
}
