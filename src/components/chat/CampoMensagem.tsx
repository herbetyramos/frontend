"use client";

import {
  ChangeEvent,
  KeyboardEvent,
  useRef,
  useState,
} from "react";

import { api } from "@/services/api";
import { toast } from "react-toastify";

interface Props {
  conversaId: string;
}

export default function CampoMensagem({
  conversaId,
}: Props) {
  const [texto, setTexto] = useState("");
  const [arquivo, setArquivo] =
    useState<File | null>(null);
  const [enviando, setEnviando] =
    useState(false);

  const inputArquivoRef =
    useRef<HTMLInputElement>(null);

  function selecionarArquivo(
    e: ChangeEvent<HTMLInputElement>
  ) {
    const file =
      e.target.files?.[0];

    if (!file) {
      return;
    }

    /*
     * Limite de 10 MB.
     */
    const limite =
      10 * 1024 * 1024;

    if (file.size > limite) {
      toast.error(
        "O arquivo não pode ter mais de 10 MB."
      );

      e.target.value = "";

      return;
    }

    setArquivo(file);
  }

  function removerArquivo() {
    setArquivo(null);

    if (inputArquivoRef.current) {
      inputArquivoRef.current.value =
        "";
    }
  }

  async function enviarMensagem() {
    const mensagem =
      texto.trim();

    /*
     * Não permite envio completamente vazio.
     */
    if (
      !mensagem &&
      !arquivo
    ) {
      return;
    }

    try {
      setEnviando(true);

      /*
       * Sempre usamos FormData.
       *
       * Isso permite continuar enviando
       * texto normalmente e também arquivos.
       */
      const formData =
        new FormData();

      formData.append(
        "conversaId",
        conversaId
      );

      if (mensagem) {
        formData.append(
          "texto",
          mensagem
        );
      }

      if (arquivo) {
        formData.append(
          "arquivo",
          arquivo
        );
      }

      await api.post(
        "/chat/enviar",
        formData
      );

      /*
       * Limpa o campo após o envio.
       */
      setTexto("");

      setArquivo(null);

      if (inputArquivoRef.current) {
        inputArquivoRef.current.value =
          "";
      }
    } catch (error) {
      console.error(
        "Erro ao enviar mensagem:",
        error
      );

      toast.error(
        "Erro ao enviar mensagem."
      );
    } finally {
      setEnviando(false);
    }
  }

  function handleKeyDown(
    e: KeyboardEvent<HTMLInputElement>
  ) {
    if (
      e.key === "Enter" &&
      !e.shiftKey
    ) {
      e.preventDefault();

      enviarMensagem();
    }
  }

  return (
    <div className="border-t bg-white p-4">
      {arquivo && (
        <div className="mb-3 flex items-center justify-between rounded-lg border bg-gray-50 px-3 py-2">
          <div className="flex min-w-0 items-center gap-2">
            <span className="text-xl">
              📎
            </span>

            <div className="min-w-0">
              <p className="truncate text-sm font-medium text-gray-700">
                {arquivo.name}
              </p>

              <p className="text-xs text-gray-500">
                {(
                  arquivo.size /
                  1024 /
                  1024
                ).toFixed(2)}{" "}
                MB
              </p>
            </div>
          </div>

          <button
            type="button"
            onClick={
              removerArquivo
            }
            disabled={enviando}
            className="ml-3 rounded px-2 py-1 text-red-600 hover:bg-red-100 disabled:text-gray-400"
          >
            ✕
          </button>
        </div>
      )}

      <div className="flex gap-2">
        <input
          ref={inputArquivoRef}
          type="file"
          className="hidden"
          onChange={
            selecionarArquivo
          }
          disabled={enviando}
        />

        <button
          type="button"
          onClick={() =>
            inputArquivoRef.current?.click()
          }
          disabled={enviando}
          title="Anexar arquivo"
          className="rounded-lg border px-4 py-2 text-xl hover:bg-gray-100 disabled:bg-gray-200"
        >
          📎
        </button>

        <input
          className="flex-1 rounded-lg border px-4 py-2 outline-none focus:border-green-500"
          placeholder={
            arquivo
              ? "Digite uma legenda..."
              : "Digite sua mensagem..."
          }
          value={texto}
          disabled={enviando}
          onChange={(e) =>
            setTexto(e.target.value)
          }
          onKeyDown={
            handleKeyDown
          }
        />

        <button
          type="button"
          onClick={
            enviarMensagem
          }
          disabled={
            enviando ||
            (!texto.trim() &&
              !arquivo)
          }
          className="rounded-lg bg-green-600 px-6 text-white hover:bg-green-700 disabled:bg-gray-400"
        >
          {enviando
            ? "Enviando..."
            : "Enviar"}
        </button>
      </div>
    </div>
  );
}