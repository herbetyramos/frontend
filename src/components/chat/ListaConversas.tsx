"use client";

import {
useCallback,
useEffect,
useMemo,
useState,
} from "react";

import { api } from "@/services/api";
import { socket } from "@/services/socket";

interface Conversa {
id: string;
nome?: string;
telefone: string;
ultimaMensagem?: string;
ultimaData?: string;
status:
| "AGUARDANDO_ATENDIMENTO"
| "EM_ATENDIMENTO"
| "FINALIZADO";
naoLidas: number;
}

interface Aluno {
id: string;
nome: string;
telefone: string;
}

type FiltroStatus =
| "TODAS"
| "AGUARDANDO_ATENDIMENTO"
| "EM_ATENDIMENTO"
| "FINALIZADO";

interface Props {
cronogramaId: string | null;
conversaSelecionada: string | null;
onSelecionar(id: string): void;
}

export default function ListaConversas({
cronogramaId,
conversaSelecionada,
onSelecionar,
}: Props) {
const [conversas, setConversas] =
useState<Conversa[]>([]);

const [alunos, setAlunos] =
useState<Aluno[]>([]);

const [loading, setLoading] =
useState(false);

const [busca, setBusca] =
useState("");

const [filtroStatus, setFiltroStatus] =
useState<FiltroStatus>("TODAS");

const carregarConversas =
useCallback(async () => {
try {
setLoading(true);


    const { data } =
      await api.get("/chat");

    setConversas(
      Array.isArray(data)
        ? data
        : []
    );
  } catch (error) {
    console.error(
      "Erro ao carregar conversas:",
      error
    );
  } finally {
    setLoading(false);
  }
}, []);


const carregarAlunos =
useCallback(async () => {
if (!cronogramaId) {
return;
}


  try {
    setLoading(true);

    const { data } =
      await api.get(
        `/chat/cronograma/${cronogramaId}`
      );

    setAlunos(
      Array.isArray(data?.alunos)
        ? data.alunos
        : []
    );
  } catch (error) {
    console.error(
      "Erro ao carregar alunos:",
      error
    );
  } finally {
    setLoading(false);
  }
}, [cronogramaId]);


async function selecionarAluno(
aluno: Aluno
) {
try {
const { data } =
await api.post("/chat", {
telefone:
aluno.telefone,
nome: aluno.nome,
aluno_id: aluno.id,
});


  onSelecionar(data.id);
} catch (error) {
  console.error(
    "Erro ao abrir conversa",
    error
  );
}


}

useEffect(() => {
if (cronogramaId) {
carregarAlunos();
return;
}


carregarConversas();

socket.on(
  "atualizarConversas",
  carregarConversas
);

socket.on(
  "conversaAtualizada",
  carregarConversas
);

return () => {
  socket.off(
    "atualizarConversas",
    carregarConversas
  );

  socket.off(
    "conversaAtualizada",
    carregarConversas
  );
};


}, [
cronogramaId,
carregarAlunos,
carregarConversas,
]);

const quantidadeAguardando =
useMemo(() => {
return conversas.filter(
(item) =>
item.status ===
"AGUARDANDO_ATENDIMENTO"
).length;
}, [conversas]);

const quantidadeEmAtendimento =
useMemo(() => {
return conversas.filter(
(item) =>
item.status ===
"EM_ATENDIMENTO"
).length;
}, [conversas]);

const quantidadeFinalizado =
useMemo(() => {
return conversas.filter(
(item) =>
item.status ===
"FINALIZADO"
).length;
}, [conversas]);

const conversasFiltradas =
useMemo(() => {
let resultado =
conversas;


  if (
    filtroStatus !== "TODAS"
  ) {
    resultado =
      resultado.filter(
        (item) =>
          item.status ===
          filtroStatus
      );
  }

  if (!busca.trim()) {
    return resultado;
  }

  const texto =
    busca
      .toLowerCase()
      .trim();

  return resultado.filter(
    (item) => {
      return (
        item.nome
          ?.toLowerCase()
          .includes(texto) ||
        item.telefone.includes(
          texto
        )
      );
    }
  );
}, [
  busca,
  conversas,
  filtroStatus,
]);


const alunosFiltrados =
useMemo(() => {
if (!busca.trim()) {
return alunos;
}


  const texto =
    busca
      .toLowerCase()
      .trim();

  return alunos.filter(
    (item) => {
      return (
        item.nome
          .toLowerCase()
          .includes(texto) ||
        item.telefone.includes(
          texto
        )
      );
    }
  );
}, [busca, alunos]);


function formatarHora(
data?: string
) {
if (!data) {
return "";
}


const dataFormatada =
  new Date(data);

if (
  Number.isNaN(
    dataFormatada.getTime()
  )
) {
  return "";
}

return dataFormatada.toLocaleTimeString(
  "pt-BR",
  {
    hour: "2-digit",
    minute: "2-digit",
  }
);


}

function avatar(
nome?: string
) {
if (!nome) {
return "?";
}


return nome
  .charAt(0)
  .toUpperCase();


}

function obterStatus(
status: Conversa["status"]
) {
switch (status) {
case "AGUARDANDO_ATENDIMENTO":
return {
texto:
"Aguardando atendimento",
classe:
"text-yellow-600",
};


  case "EM_ATENDIMENTO":
    return {
      texto:
        "Em atendimento",
      classe:
        "text-blue-600",
    };

  case "FINALIZADO":
    return {
      texto:
        "Finalizado",
      classe:
        "text-gray-500",
    };

  default:
    return {
      texto:
        "Aguardando atendimento",
      classe:
        "text-yellow-600",
    };
}


}

function botaoFiltro(
filtro: FiltroStatus,
texto: string,
quantidade: number
) {
const ativo =
filtroStatus === filtro;


return (
  <button
    type="button"
    onClick={() =>
      setFiltroStatus(filtro)
    }
    className={`flex-1 rounded-md px-2 py-2 text-xs font-semibold transition ${
      ativo
        ? "bg-green-600 text-white"
        : "bg-gray-100 text-gray-600 hover:bg-gray-200"
    }`}
  >
    <div>{texto}</div>

    <div
      className={`mt-0.5 text-[11px] ${
        ativo
          ? "text-white"
          : "text-gray-400"
      }`}
    >
      {quantidade}
    </div>
  </button>
);


}

return ( <div className="w-80 border-r bg-white flex flex-col"> <div className="p-4 border-b bg-green-600 text-white"> <h2 className="text-xl font-bold">
{cronogramaId
? "Alunos"
: "Conversas"} </h2>


    <input
      type="text"
      placeholder="Pesquisar..."
      value={busca}
      onChange={(e) =>
        setBusca(e.target.value)
      }
      className="mt-3 w-full rounded-lg border px-3 py-2 text-black outline-none"
    />

    {!cronogramaId && (
      <div className="mt-3 grid grid-cols-2 gap-1 rounded-lg bg-white p-1">
        {botaoFiltro(
          "TODAS",
          "Todas",
          conversas.length
        )}

        {botaoFiltro(
          "AGUARDANDO_ATENDIMENTO",
          "Aguardando",
          quantidadeAguardando
        )}

        {botaoFiltro(
          "EM_ATENDIMENTO",
          "Em atendimento",
          quantidadeEmAtendimento
        )}

        {botaoFiltro(
          "FINALIZADO",
          "Finalizadas",
          quantidadeFinalizado
        )}
      </div>
    )}
  </div>

  <div className="flex-1 overflow-y-auto">
    {loading && (
      <div className="p-6 text-center text-gray-500">
        Carregando...
      </div>
    )}

    {!loading &&
      cronogramaId &&
      alunosFiltrados.length ===
        0 && (
        <div className="p-6 text-center text-gray-500">
          Nenhum aluno encontrado.
        </div>
      )}

    {!loading &&
      !cronogramaId &&
      conversasFiltradas.length ===
        0 && (
        <div className="p-6 text-center text-gray-500">
          Nenhuma conversa encontrada.
        </div>
      )}

    {cronogramaId ? (
      alunosFiltrados.map(
        (aluno) => (
          <button
            key={aluno.id}
            onClick={() =>
              selecionarAluno(
                aluno
              )
            }
            className="w-full flex items-center gap-3 px-4 py-3 border-b hover:bg-gray-100"
          >
            <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
              {avatar(
                aluno.nome
              )}
            </div>

            <div className="text-left">
              <div className="font-semibold">
                {aluno.nome}
              </div>

              <div className="text-sm text-gray-500">
                {aluno.telefone}
              </div>
            </div>
          </button>
        )
      )
    ) : (
      conversasFiltradas.map(
        (item) => {
          const status =
            obterStatus(
              item.status
            );

          return (
            <button
              key={item.id}
              onClick={() =>
                onSelecionar(
                  item.id
                )
              }
              className={`w-full flex items-start gap-3 px-4 py-3 border-b hover:bg-gray-100 transition ${
                conversaSelecionada ===
                item.id
                  ? "bg-green-50"
                  : ""
              }`}
            >
              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">
                {avatar(
                  item.nome
                )}
              </div>

              <div className="flex-1 min-w-0">
                <div className="flex justify-between gap-2">
                  <div
                    className={`truncate ${
                      item.naoLidas >
                      0
                        ? "font-bold text-gray-900"
                        : "font-semibold"
                    }`}
                  >
                    {item.nome ||
                      item.telefone}
                  </div>

                  <div className="text-xs text-gray-400 whitespace-nowrap">
                    {formatarHora(
                      item.ultimaData
                    )}
                  </div>
                </div>

                <div
                  className={`text-xs font-medium ${status.classe}`}
                >
                  {status.texto}
                </div>

                <div className="flex items-center justify-between gap-2">
                  <div
                    className={`text-sm truncate ${
                      item.naoLidas >
                      0
                        ? "font-semibold text-gray-700"
                        : "text-gray-500"
                    }`}
                  >
                    {item.ultimaMensagem ||
                      "Sem mensagens"}
                  </div>

                  {item.naoLidas >
                    0 && (
                    <span className="min-w-5 h-5 px-1 rounded-full bg-green-600 text-white text-xs font-bold flex items-center justify-center">
                      {item.naoLidas >
                      99
                        ? "99+"
                        : item.naoLidas}
                    </span>
                  )}
                </div>
              </div>
            </button>
          );
        }
      )
    )}
  </div>
</div>


);
}
