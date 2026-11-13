
"use client";

import { useEffect, useState, useCallback } from "react";
import { useSearchParams, useRouter } from "next/navigation";
import { Save, Pencil, Lock } from "lucide-react";
import { toast } from "react-toastify";

import { api } from "@/services/api";
import LinhaPlanejamento from "./LinhaPlanejamento";

interface Planejamento {
  id: string;
  dia: number;
  conteudo: string;
  finalizado: boolean;
  curso_programado?: {
    tema: string;
    data_inicio: string;
  };
}

interface ApiError {
  response?: {
    data?: {
      error?: string;
    };
  };
}

function obterMensagemErro(error: unknown): string | undefined {
  if (
    typeof error === "object" &&
    error !== null &&
    "response" in error
  ) {
    const apiError = error as ApiError;
    return apiError.response?.data?.error;
  }

  return undefined;
}

function obterChaveData(data: string): string | null {
  const valor = data.trim();

  let ano: number;
  let mes: number;
  let dia: number;

  const formatoISO = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (formatoISO) {
    ano = Number(formatoISO[1]);
    mes = Number(formatoISO[2]);
    dia = Number(formatoISO[3]);
  } else {
    const formatoBR = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})$/);

    if (!formatoBR) {
      return null;
    }

    dia = Number(formatoBR[1]);
    mes = Number(formatoBR[2]);
    ano = Number(formatoBR[3]);
  }

  const dataValidada = new Date(Date.UTC(ano, mes - 1, dia));

  if (
    dataValidada.getUTCFullYear() !== ano ||
    dataValidada.getUTCMonth() !== mes - 1 ||
    dataValidada.getUTCDate() !== dia
  ) {
    return null;
  }

  return `${ano}${String(mes).padStart(2, "0")}${String(dia).padStart(2, "0")}`;
}

function obterHojeBrasilia(): string {
  const partes = new Intl.DateTimeFormat("en-US", {
    timeZone: "America/Sao_Paulo",
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  }).formatToParts(new Date());

  const valores = Object.fromEntries(
    partes.map((parte) => [parte.type, parte.value])
  );

  return `${valores.year}${valores.month}${valores.day}`;
}

export default function PlanejamentoPage() {
  const params = useSearchParams();
  const router = useRouter();

  const planeja_id = params.get("id");

  const [lista, setLista] = useState<Planejamento[]>([]);
  const [loading, setLoading] = useState(false);
  const [editando, setEditando] = useState(false);
  const [temaCurso, setTemaCurso] = useState("");

  const carregar = useCallback(async () => {
    if (!planeja_id) return;

    try {
      let response = await api.get(`/planejamento/${planeja_id}`);

      // Se ainda não existe planejamento, cria automaticamente.
      if (response.data.length === 0) {
        await api.post(`/planejamento/gerar/${planeja_id}`);

        response = await api.get(`/planejamento/${planeja_id}`);
      }

      const dados = response.data as Planejamento[];

      setLista(dados);

      if (dados.length > 0) {
        setTemaCurso(dados[0].curso_programado?.tema ?? "");

        // Planejamento salvo abre em modo de visualização.
        // Planejamento ainda não salvo abre liberado para preenchimento.
        setEditando(!dados.every((item) => item.finalizado));
      }
    } catch (error: unknown) {
      console.error("ERRO AO CARREGAR PLANEJAMENTO:", error);

      toast.error(
        obterMensagemErro(error) ?? "Erro ao carregar planejamento"
      );
    }
  }, [planeja_id]);

  useEffect(() => {
    void carregar();
  }, [carregar]);

  function alterar(index: number, valor: string) {
    setLista((anterior) =>
      anterior.map((item, i) =>
        i === index
          ? {
              ...item,
              conteudo: valor,
            }
          : item
      )
    );
  }

  const planejamentoSalvo =
    lista.length > 0 &&
    lista.every((item) => item.finalizado);

  const dataInicio = lista[0]?.curso_programado?.data_inicio;

  const dataInicioKey = dataInicio
    ? obterChaveData(dataInicio)
    : null;

  const hojeKey = obterHojeBrasilia();

  // O dia de início do curso já fica bloqueado.
  const podeEditar =
    dataInicioKey !== null &&
    hojeKey < dataInicioKey;

  const bloqueado = !podeEditar || !editando;

  async function salvarTudo() {
    if (!podeEditar) {
      toast.error(
        "O prazo para edição do planejamento terminou."
      );
      return;
    }

    if (!editando) return;

    try {
      setLoading(true);

      await api.put("/planejamento/salvar-tudo", {
        planejamentos: lista.map((item) => ({
          id: item.id,
          conteudo: item.conteudo,
        })),
      });

      toast.success(
        planejamentoSalvo
          ? "Alterações salvas com sucesso!"
          : "Planejamento salvo com sucesso!"
      );

      setEditando(false);

      await carregar();
    } catch (error: unknown) {
      console.error("ERRO AO SALVAR PLANEJAMENTO:", error);

      toast.error(
        obterMensagemErro(error) ?? "Erro ao salvar planejamento"
      );
    } finally {
      setLoading(false);
    }
  }

  return (
    <div className="mx-auto max-w-5xl bg-white p-4 text-gray-900 dark:bg-gray-950 dark:text-gray-100">

      <div className="mb-5 flex flex-col border-b border-gray-200 pb-3 dark:border-gray-700 md:flex-row md:justify-between">

        <h1 className="text-2xl font-bold">
          Planejamento das Aulas
        </h1>

        <div>
          <span className="font-semibold">
            Tema:
          </span>

          <span className="ml-2 font-semibold text-blue-700 dark:text-blue-400">
            {temaCurso || "-"}
          </span>
        </div>

      </div>

      {planejamentoSalvo && (
        <div className="mb-4 rounded border border-blue-300 bg-blue-50 p-3 text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-300">
          Planejamento salvo.
        </div>
      )}

      {lista.length > 0 && !podeEditar && (
        <div className="mb-4 flex items-center gap-2 rounded border border-amber-300 bg-amber-50 p-3 text-amber-800 dark:border-amber-800 dark:bg-amber-950 dark:text-amber-300">
          <Lock size={20} />

          <span>
            {dataInicioKey === null
              ? "Não foi possível identificar a data de início do curso. A edição está bloqueada."
              : "O prazo para edição terminou. O planejamento está bloqueado a partir da data de início do curso."}
          </span>
        </div>
      )}

      <div className="overflow-x-auto rounded border border-gray-300 dark:border-gray-700">

        <table className="w-full">

          <thead className="bg-blue-600 text-white">

            <tr>
              <th className="w-20 p-3">
                Dia
              </th>

              <th className="p-3">
                Aula Planejada
              </th>
            </tr>

          </thead>

          <tbody>

            {lista.map((item, index) => (
              <LinhaPlanejamento
                key={item.id}
                dia={item.dia}
                value={item.conteudo}
                bloqueado={bloqueado}
                onChange={(texto) => alterar(index, texto)}
              />
            ))}

          </tbody>

        </table>

      </div>

      <div className="mt-6 flex flex-wrap justify-end gap-3">

        {podeEditar && planejamentoSalvo && !editando && (
          <button
            onClick={() => setEditando(true)}
            className="flex items-center gap-2 rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700"
          >
            <Pencil size={18} />
            Editar Planejamento
          </button>
        )}

        {podeEditar && editando && (
          <button
            onClick={salvarTudo}
            disabled={loading}
            className="flex items-center gap-2 rounded bg-blue-600 px-5 py-2 text-white hover:bg-blue-700 disabled:bg-gray-400"
          >
            <Save size={18} />

            {loading
              ? "Salvando..."
              : planejamentoSalvo
                ? "Salvar Alterações"
                : "Salvar Planejamento"}
          </button>
        )}

        {planejamentoSalvo && (
          <button
            onClick={() =>
              router.push(`/materiais-solicitacao/${planeja_id}`)
            }
            className="rounded bg-green-600 px-6 py-3 font-semibold text-white hover:bg-green-700"
          >
            Solicitar Materiais
          </button>
        )}

      </div>

    </div>
  );
}
