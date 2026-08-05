"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import { api } from "@/services/api";
import { socket } from "@/services/socket";

interface Conversa {
  id: string;
  nome?: string;
  telefone: string;
  ultimaMensagem?: string;
  ultimaData?: string;
  naoLidas: number;
}

interface Aluno {
  id: string;
  nome: string;
  telefone: string;
}

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

  const [conversas, setConversas] = useState<Conversa[]>([]);
  const [alunos, setAlunos] = useState<Aluno[]>([]);

  const [loading, setLoading] = useState(false);
  const [busca, setBusca] = useState("");

const carregarConversas = useCallback(async () => {

  try {

    setLoading(true);

    const { data } = await api.get("/chat");

    setConversas(data);

  } finally {

    setLoading(false);

  }

}, []);

const carregarAlunos = useCallback(async () => {

  if (!cronogramaId) return;

  try {

    setLoading(true);

    const { data } = await api.get(
      `/chat/cronograma/${cronogramaId}`
    );

    setAlunos(data.alunos);

  } finally {

    setLoading(false);

  }

}, [cronogramaId]);


  async function selecionarAluno(aluno: Aluno) {

    try {

      const { data } = await api.post("/chat", {

  telefone: aluno.telefone,

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


  return () => {

    socket.off(
      "atualizarConversas",
      carregarConversas
    );

  };


}, [
  cronogramaId,
  carregarAlunos,
  carregarConversas
]);



  const conversasFiltradas = useMemo(() => {

    if (!busca.trim()) return conversas;

    const texto = busca.toLowerCase();

    return conversas.filter((item) => {

      return (
        item.nome?.toLowerCase().includes(texto) ||
        item.telefone.includes(texto)
      );

    });

  }, [busca, conversas]);



  const alunosFiltrados = useMemo(() => {

    if (!busca.trim()) return alunos;

    const texto = busca.toLowerCase();

    return alunos.filter((item) => {

      return (
        item.nome.toLowerCase().includes(texto) ||
        item.telefone.includes(texto)
      );

    });

  }, [busca, alunos]);



  function formatarHora(data?: string) {

    if (!data) return "";

    return new Date(data).toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );

  }



  function avatar(nome?: string) {

    if (!nome) return "?";

    return nome.charAt(0).toUpperCase();

  }



  return (

    <div className="w-80 border-r bg-white flex flex-col">


      <div className="p-4 border-b bg-green-600 text-white">

        <h2 className="text-xl font-bold">

          {cronogramaId
            ? "Alunos"
            : "Conversas"
          }

        </h2>


        <input

          type="text"

          placeholder="Pesquisar..."

          value={busca}

          onChange={(e) =>
            setBusca(e.target.value)
          }

          className="mt-3 w-full rounded-lg border px-3 py-2 text-black outline-none"

        />

      </div>



      <div className="flex-1 overflow-y-auto">


        {loading && (

          <div className="p-6 text-center text-gray-500">

            Carregando...

          </div>

        )}



        {!loading && cronogramaId && alunosFiltrados.length === 0 && (

          <div className="p-6 text-center text-gray-500">

            Nenhum aluno encontrado.

          </div>

        )}



        {!loading && !cronogramaId && conversasFiltradas.length === 0 && (

          <div className="p-6 text-center text-gray-500">

            Nenhuma conversa encontrada.

          </div>

        )}



        {cronogramaId ? (

          alunosFiltrados.map((aluno) => (

            <button

              key={aluno.id}

              onClick={() =>
                selecionarAluno(aluno)
              }

              className="w-full flex items-center gap-3 px-4 py-3 border-b hover:bg-gray-100"

            >

              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">

                {avatar(aluno.nome)}

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

          ))

        ) : (


          conversasFiltradas.map((item) => (

            <button

              key={item.id}

              onClick={() =>
                onSelecionar(item.id)
              }

              className={`w-full flex items-start gap-3 px-4 py-3 border-b hover:bg-gray-100 transition

              ${
                conversaSelecionada === item.id
                  ? "bg-green-50"
                  : ""
              }

              `}

            >

              <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center font-bold text-lg">

                {avatar(item.nome)}

              </div>


              <div className="flex-1 min-w-0">


                <div className="flex justify-between">

                  <div className="font-semibold truncate">

                    {item.nome || item.telefone}

                  </div>


                  <div className="text-xs text-gray-400">

                    {formatarHora(item.ultimaData)}

                  </div>


                </div>


                <div className="text-sm text-gray-500 truncate">

                  {item.ultimaMensagem || "Sem mensagens"}

                </div>


              </div>


            </button>

          ))

        )}


      </div>


    </div>

  );
}