"use client";

import { AlunoType } from "../types";

interface Props {
  aluno: AlunoType;

  onChange: (
    campo: keyof AlunoType,
    valor: string
  ) => void;

  buscarCPF: (cpf?: string) => Promise<void>;

  mostrarCampos: boolean;
}

export default function AlunoForm({
  aluno,
  onChange,
  buscarCPF,
  mostrarCampos,
}: Props) {

  const inputClass = `
    w-full
    min-w-0
    rounded-lg
    border border-gray-300
    bg-white
    px-3
    py-2.5
    text-sm
    text-gray-800
    placeholder:text-gray-400
    outline-none
    transition-colors
    focus:border-purple-500
    focus:ring-2
    focus:ring-purple-500/20
    dark:border-gray-700
    dark:bg-gray-800
    dark:text-gray-100
    dark:placeholder:text-gray-500
    dark:focus:border-purple-400
    dark:focus:ring-purple-400/20
  `;

  const labelClass = `
    mb-1.5
    block
    text-sm
    font-medium
    text-gray-700
    dark:text-gray-300
  `;

  return (
    <div className="w-full space-y-3">

      {/* CPF E NOME */}

      <div className="grid grid-cols-1 items-end gap-3 md:grid-cols-2">

        <div className="min-w-0">

          <label className={labelClass}>
            CPF
          </label>

          <input
            value={aluno.CPF}
            onChange={(e) => {
              const cpf = e.target.value;

              onChange("CPF", cpf);

              if (cpf.replace(/\D/g, "").length === 11) {
                buscarCPF(cpf);
              }
            }}
            placeholder="Digite o CPF"
            className={inputClass}
          />

        </div>

        <div className="min-w-0">

          <label className={labelClass}>
            Nome
          </label>

          <input
            value={aluno.nome}
            onChange={(e) =>
              onChange("nome", e.target.value)
            }
            placeholder="Nome completo"
            className={inputClass}
          />

        </div>

      </div>

      {/* CAMPOS ADICIONAIS */}

      {mostrarCampos && (

        <div className="grid grid-cols-1 gap-3 pt-1 md:grid-cols-2">

          <div className="min-w-0">

            <label className={labelClass}>
              Celular
            </label>

            <input
              value={aluno.celular || ""}
              onChange={(e) =>
                onChange("celular", e.target.value)
              }
              placeholder="Celular"
              className={inputClass}
            />

          </div>

          <div className="min-w-0">

            <label className={labelClass}>
              Email
            </label>

            <input
              type="email"
              value={aluno.email || ""}
              onChange={(e) =>
                onChange("email", e.target.value)
              }
              placeholder="Email"
              className={inputClass}
            />

          </div>

          <div className="min-w-0">

            <label className={labelClass}>
              Telefone para recado
            </label>

            <input
              value={aluno.telefone_recado || ""}
              onChange={(e) =>
                onChange("telefone_recado", e.target.value)
              }
              placeholder="Telefone para recado"
              className={inputClass}
            />

          </div>

        </div>

      )}

    </div>
  );
}