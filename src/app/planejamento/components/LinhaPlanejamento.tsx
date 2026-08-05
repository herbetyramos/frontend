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
      border
      text-center
      font-bold
      align-top
      py-3
      w-20
      "
      >

        {dia}

      </td>


      <td
      className="
      border
      p-2
      "
      >

        <textarea

        value={value ?? ""}

        disabled={bloqueado}

        onChange={
          (e)=>
          onChange(
            e.target.value
          )
        }

        rows={4}

        className="
        w-full
        border
        rounded-md
        p-2
        resize-none
        disabled:bg-gray-100
        disabled:text-gray-600
        "

        />

      </td>


    </tr>

  );

}