"use client";

import { useState } from "react";
import { api } from "@/services/api";
import { toast } from "react-toastify";

interface Props {
  conversaId: string;
}

export default function CampoMensagem({
  conversaId,
}: Props) {

  const [texto, setTexto] = useState("");
  const [enviando, setEnviando] = useState(false);

  async function enviarMensagem() {

    const mensagem = texto.trim();

    if (!mensagem) return;

    try {

      setEnviando(true);

      await api.post("/chat/enviar", {
        conversaId,
        texto: mensagem,
      });

      setTexto("");

    } catch (err) {

      toast.error("Erro ao enviar mensagem.");

    } finally {

      setEnviando(false);

    }

  }

  function handleKeyDown(
    e: React.KeyboardEvent<HTMLInputElement>
  ) {

    if (e.key === "Enter") {
      enviarMensagem();
    }

  }

  return (

    <div className="border-t bg-white p-4 flex gap-2">

      <input
        className="flex-1 border rounded-lg px-4 py-2 outline-none"
        placeholder="Digite sua mensagem..."
        value={texto}
        disabled={enviando}
        onChange={(e) => setTexto(e.target.value)}
        onKeyDown={handleKeyDown}
      />

      <button
        onClick={enviarMensagem}
        disabled={enviando}
        className="bg-green-600 hover:bg-green-700 disabled:bg-gray-400 text-white px-6 rounded-lg"
      >
        Enviar
      </button>

    </div>

  );

}