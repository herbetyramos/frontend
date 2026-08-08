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
  return (
    <div>
      {/* CPF sempre visível */}
      <div className="grid md:grid-cols-2 gap-4 items-end">
        <div>
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
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>

        <div>
          <input
            value={aluno.nome}
            onChange={(e) =>
              onChange("nome", e.target.value)
            }
            placeholder="Nome"
            className="w-full border rounded-lg px-3 py-2"
          />
        </div>
      </div>

      {/* Campos aparecem somente quando necessário */}
      {mostrarCampos && (
        <div className="grid md:grid-cols-2 gap-4 mt-2">
          <div>
            <label className="block mb-1 font-medium">
              Celular
            </label>

            <input
              value={aluno.celular || ""}
              onChange={(e) =>
                onChange("celular", e.target.value)
              }
              placeholder="Celular"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Email
            </label>

            <input
              value={aluno.email || ""}
              onChange={(e) =>
                onChange("email", e.target.value)
              }
              placeholder="Email"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>

          <div>
            <label className="block mb-1 font-medium">
              Telefone Recado
            </label>

            <input
              value={aluno.telefone_recado || ""}
              onChange={(e) =>
                onChange("telefone_recado", e.target.value)
              }
              placeholder="Telefone para recado"
              className="w-full border rounded-lg px-3 py-2"
            />
          </div>
        </div>
      )}
    </div>
  );
}