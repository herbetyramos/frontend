"use client";

import { FiPaperclip, FiExternalLink } from "react-icons/fi";
import { FaFilePdf } from "react-icons/fa";

interface Props {
  nome?: string;
  telefone: string;
}

export default function CabecalhoChat({
  nome,
  telefone,
}: Props) {

  function abrirWhatsapp() {
    window.open(
      `https://wa.me/${telefone}`,
      "_blank"
    );
  }

  return (
    <div className="h-16 border-b bg-white px-5 flex items-center justify-between">

      <div className="flex items-center gap-3">

        <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-lg font-bold">
          {(nome || telefone).charAt(0).toUpperCase()}
        </div>

        <div>

          <div className="font-semibold text-lg">
            {nome || telefone}
          </div>

          <div className="text-sm text-gray-500">
            {telefone}
          </div>

        </div>

      </div>

      <div className="flex gap-3">

        <button
          className="hover:bg-gray-100 p-2 rounded-lg"
          title="Enviar arquivo"
        >
          <FiPaperclip size={20} />
        </button>

        <button
          className="hover:bg-gray-100 p-2 rounded-lg"
          title="Enviar certificado"
        >
          <FaFilePdf
            size={20}
            className="text-red-600"
          />
        </button>

        <button
          onClick={abrirWhatsapp}
          className="hover:bg-gray-100 p-2 rounded-lg"
          title="Abrir WhatsApp"
        >
          <FiExternalLink size={20} />
        </button>

      </div>

    </div>
  );
}