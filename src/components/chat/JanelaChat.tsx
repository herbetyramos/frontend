"use client";

import Image from "next/image";

import {
  useCallback,
  useEffect,
  useRef,
  useState,
} from "react";

import { api } from "@/services/api";

import { socket } from "@/services/socket";

import CampoMensagem from "./CampoMensagem";

import CabecalhoChat from "./CabecalhoChat";

type StatusConversa =
  | "AGUARDANDO_ATENDIMENTO"
  | "EM_ATENDIMENTO"
  | "FINALIZADO";

interface Mensagem {
  id: string;
  conversaId: string;
  texto: string;
  enviado: boolean;
  lida: boolean;
  editada?: boolean;
  apagada?: boolean;
  created_at: string;
  whatsappId?: string | null;
  status?: string | null;
  tipo?: string | null;
  nomeArquivo?: string | null;
  mimeType?: string | null;
  tamanho?: number | null;
  arquivoUrl?: string | null;
}

interface Conversa {
  id: string;
  nome?: string;
  telefone: string;
  status: StatusConversa;
}

interface RespostaConversa {
  conversa?: Conversa | null;
  mensagens?: Mensagem[];
}

interface Props {
  conversaId: string | null;
}

export default function JanelaChat({
  conversaId,
}: Props) {
  const [mensagens, setMensagens] =
    useState<Mensagem[]>([]);

  const [conversa, setConversa] =
    useState<Conversa | null>(null);

  const [loading, setLoading] =
    useState(false);

  const [mensagemEditando, setMensagemEditando] =
    useState<string | null>(null);

  const [textoEdicao, setTextoEdicao] =
    useState("");

  const [processandoMensagem, setProcessandoMensagem] =
    useState<string | null>(null);

  const fimMensagensRef =
    useRef<HTMLDivElement>(null);

  const rolarParaFim = useCallback(() => {
    setTimeout(() => {
      fimMensagensRef.current?.scrollIntoView({
        behavior: "smooth",
        block: "end",
      });
    }, 100);
  }, []);

  const carregar = useCallback(async () => {
    if (!conversaId) {
      return;
    }

    try {
      setLoading(true);

      const { data } = await api.get(
        `/chat/${conversaId}`
      );

      if (Array.isArray(data)) {
        setMensagens(data);
        setConversa(null);
        rolarParaFim();
        return;
      }

      const resposta =
        data as RespostaConversa;

      setMensagens(
        Array.isArray(
          resposta.mensagens
        )
          ? resposta.mensagens
          : []
      );

      setConversa(
        resposta.conversa ?? null
      );

      rolarParaFim();
    } catch (error) {
      console.error(
        "Erro ao carregar conversa:",
        error
      );

      setMensagens([]);
      setConversa(null);
    } finally {
      setLoading(false);
    }
  }, [
    conversaId,
    rolarParaFim,
  ]);

  useEffect(() => {
    if (!conversaId) {
      setMensagens([]);
      setConversa(null);
      setLoading(false);
      setMensagemEditando(null);
      setTextoEdicao("");
      return;
    }

    setMensagens([]);
    setConversa(null);
    setMensagemEditando(null);
    setTextoEdicao("");

    carregar();

    socket.emit(
      "join",
      conversaId
    );

    return () => {
      socket.emit(
        "leave",
        conversaId
      );
    };
  }, [
    conversaId,
    carregar,
  ]);

  /**
   * Nova mensagem recebida.
   */
  useEffect(() => {
    function novaMensagem(
      msg: Mensagem
    ) {
      if (
        !conversaId ||
        msg.conversaId !== conversaId
      ) {
        return;
      }

      setMensagens(
        (anteriores) => {
          const existe =
            anteriores.some(
              (mensagem) =>
                mensagem.id === msg.id
            );

          if (existe) {
            return anteriores;
          }

          return [
            ...anteriores,
            msg,
          ];
        }
      );

      rolarParaFim();
    }

    socket.on(
      "novaMensagem",
      novaMensagem
    );

    return () => {
      socket.off(
        "novaMensagem",
        novaMensagem
      );
    };
  }, [
    conversaId,
    rolarParaFim,
  ]);

  /**
   * Atualização da mensagem.
   *
   * Usado para:
   * - status de envio
   * - edição
   * - exclusão
   */
  useEffect(() => {
    function mensagemAtualizada(
      msg: Mensagem
    ) {
      if (
        !conversaId ||
        msg.conversaId !== conversaId
      ) {
        return;
      }

      setMensagens(
        (anteriores) =>
          anteriores.map(
            (mensagem) => {
              if (
                mensagem.id === msg.id
              ) {
                return {
                  ...mensagem,
                  ...msg,
                };
              }

              if (
                msg.whatsappId &&
                mensagem.whatsappId ===
                  msg.whatsappId
              ) {
                return {
                  ...mensagem,
                  ...msg,
                };
              }

              return mensagem;
            }
          )
      );
    }

    socket.on(
      "mensagemAtualizada",
      mensagemAtualizada
    );

    return () => {
      socket.off(
        "mensagemAtualizada",
        mensagemAtualizada
      );
    };
  }, [conversaId]);

  /**
   * Atualização do status da conversa.
   */
  useEffect(() => {
    function statusConversaAtualizado(
      data: {
        conversaId: string;
        status: StatusConversa;
      }
    ) {
      if (
        !conversaId ||
        data.conversaId !== conversaId
      ) {
        return;
      }

      setConversa(
        (atual) =>
          atual
            ? {
                ...atual,
                status: data.status,
              }
            : atual
      );
    }

    socket.on(
      "statusConversaAtualizado",
      statusConversaAtualizado
    );

    return () => {
      socket.off(
        "statusConversaAtualizado",
        statusConversaAtualizado
      );
    };
  }, [conversaId]);

  /**
   * Inicia edição da mensagem.
   */
  function iniciarEdicao(
    msg: Mensagem
  ) {
    if (msg.apagada) {
      return;
    }

    if (!msg.enviado) {
      return;
    }

    if (!msg.whatsappId) {
      return;
    }

    if (
      msg.tipo &&
      msg.tipo !== "TEXTO"
    ) {
      return;
    }

    setMensagemEditando(
      msg.id
    );

    setTextoEdicao(
      msg.texto
    );
  }

  /**
   * Cancela a edição.
   */
  function cancelarEdicao() {
    setMensagemEditando(null);
    setTextoEdicao("");
  }

  /**
   * Salva a edição da mensagem.
   */
  async function editarMensagem(
    msg: Mensagem
  ) {
    const novoTexto =
      textoEdicao.trim();

    if (!novoTexto) {
      alert(
        "O texto da mensagem não pode ser vazio."
      );
      return;
    }

    if (!msg.whatsappId) {
      alert(
        "A mensagem ainda não possui ID do WhatsApp."
      );
      return;
    }

    try {
      setProcessandoMensagem(
        msg.id
      );

      const { data } =
        await api.patch(
          `/chat/mensagem/${msg.id}`,
          {
            texto: novoTexto,
          }
        );

      setMensagens(
        (anteriores) =>
          anteriores.map(
            (mensagem) =>
              mensagem.id === msg.id
                ? {
                    ...mensagem,
                    ...data,
                  }
                : mensagem
          )
      );

      setMensagemEditando(null);
      setTextoEdicao("");
    } catch (error) {
      console.error(
        "Erro ao editar mensagem:",
        error
      );

      alert(
        "Não foi possível editar a mensagem."
      );
    } finally {
      setProcessandoMensagem(
        null
      );
    }
  }

  /**
   * Apaga a mensagem.
   */
  async function apagarMensagem(
    msg: Mensagem
  ) {
    if (!msg.whatsappId) {
      alert(
        "A mensagem ainda não possui ID do WhatsApp."
      );
      return;
    }

    const confirmar =
      window.confirm(
        "Deseja realmente apagar esta mensagem?"
      );

    if (!confirmar) {
      return;
    }

    try {
      setProcessandoMensagem(
        msg.id
      );

      const { data } =
        await api.delete(
          `/chat/mensagem/${msg.id}`
        );

      setMensagens(
        (anteriores) =>
          anteriores.map(
            (mensagem) =>
              mensagem.id === msg.id
                ? {
                    ...mensagem,
                    ...data,
                  }
                : mensagem
          )
      );
    } catch (error) {
      console.error(
        "Erro ao apagar mensagem:",
        error
      );

      alert(
        "Não foi possível apagar a mensagem."
      );
    } finally {
      setProcessandoMensagem(
        null
      );
    }
  }

  /**
   * Formata a hora.
   */
  function formatarHora(
    data: string
  ) {
    if (!data) {
      return "";
    }

    const dataMensagem =
      new Date(data);

    if (
      Number.isNaN(
        dataMensagem.getTime()
      )
    ) {
      return "";
    }

    return dataMensagem.toLocaleTimeString(
      "pt-BR",
      {
        hour: "2-digit",
        minute: "2-digit",
      }
    );
  }

  /**
   * Formata o tamanho do arquivo.
   */
  function formatarTamanho(
    tamanho?: number | null
  ) {
    if (
      !tamanho ||
      tamanho <= 0
    ) {
      return "";
    }

    if (tamanho < 1024) {
      return `${tamanho} B`;
    }

    if (
      tamanho <
      1024 * 1024
    ) {
      return `${(
        tamanho / 1024
      ).toFixed(1)} KB`;
    }

    return `${(
      tamanho /
      1024 /
      1024
    ).toFixed(1)} MB`;
  }

  /**
   * Monta a URL pública do arquivo.
   */
  function obterUrlArquivo(
    arquivoUrl?: string | null
  ) {
    if (!arquivoUrl) {
      return "";
    }

    if (
      arquivoUrl.startsWith(
        "http://"
      ) ||
      arquivoUrl.startsWith(
        "https://"
      )
    ) {
      return arquivoUrl;
    }

    const baseUrl =
      api.defaults.baseURL;

    if (baseUrl) {
      return `${baseUrl.replace(
        /\/$/,
        ""
      )}${arquivoUrl}`;
    }

    return arquivoUrl;
  }

  /**
   * Status visual da mensagem.
   */
  function renderStatus(
    msg: Mensagem
  ) {
    if (!msg.enviado) {
      return null;
    }

    if (
      msg.status === "READ" ||
      msg.lida === true
    ) {
      return (
        <span
          className="ml-1 font-bold"
          style={{
            color: "#53bdeb",
          }}
          title="Lida"
        >
          ✓✓
        </span>
      );
    }

    if (
      msg.status ===
      "DELIVERED"
    ) {
      return (
        <span
          className="ml-1 text-green-100 font-bold"
          title="Entregue"
        >
          ✓✓
        </span>
      );
    }

    if (
      msg.status === "SENT"
    ) {
      return (
        <span
          className="ml-1 text-green-100"
          title="Enviada"
        >
          ✓
        </span>
      );
    }

    if (
      msg.status === "FAILED"
    ) {
      return (
        <span
          className="ml-1 text-red-200 font-bold"
          title="Falha no envio"
        >
          !
        </span>
      );
    }

    return (
      <span
        className="ml-1 text-green-100"
        title="Enviando"
      >
        ✓
      </span>
    );
  }

  /**
   * Exibe o arquivo da mensagem.
   */
  function renderArquivo(
    msg: Mensagem
  ) {
    if (!msg.arquivoUrl) {
      return null;
    }

    const url =
      obterUrlArquivo(
        msg.arquivoUrl
      );

    const mime =
      msg.mimeType?.toLowerCase() ||
      "";

    const tipo =
      msg.tipo?.toUpperCase() ||
      "";

    /**
     * IMAGEM
     */
    if (
      tipo === "IMAGEM" ||
      mime.startsWith("image/")
    ) {
      return (
        <a
          href={url}
          target="_blank"
          rel="noopener noreferrer"
          className="block"
        >
          <Image
            src={url}
            alt={
              msg.nomeArquivo ||
              "Imagem"
            }
            width={500}
            height={500}
            unoptimized
            className="max-w-full max-h-80 w-auto h-auto rounded-lg object-contain"
          />
        </a>
      );
    }

    /**
     * VÍDEO
     */
    if (
      tipo === "VIDEO" ||
      mime.startsWith("video/")
    ) {
      return (
        <video
          src={url}
          controls
          preload="metadata"
          className="max-w-full max-h-80 rounded-lg"
        >
          Seu navegador não suporta
          reprodução de vídeo.
        </video>
      );
    }

    /**
     * ÁUDIO
     */
    if (
      tipo === "AUDIO" ||
      mime.startsWith("audio/")
    ) {
      return (
        <div className="min-w-60">
          <audio
            src={url}
            controls
            preload="metadata"
            className="w-full"
          />
        </div>
      );
    }

    /**
     * DOCUMENTO
     */
    return (
      <a
        href={url}
        target="_blank"
        rel="noopener noreferrer"
        className={`flex items-center gap-3 rounded-lg p-3 ${
          msg.enviado
            ? "bg-green-700 hover:bg-green-800"
            : "bg-gray-100 hover:bg-gray-200"
        }`}
      >
        <span className="text-2xl">
          📄
        </span>

        <div className="min-w-0">
          <div className="truncate font-medium">
            {msg.nomeArquivo ||
              "Documento"}
          </div>

          {msg.tamanho && (
            <div
              className={`text-xs ${
                msg.enviado
                  ? "text-green-100"
                  : "text-gray-500"
              }`}
            >
              {formatarTamanho(
                msg.tamanho
              )}
            </div>
          )}
        </div>
      </a>
    );
  }

  /**
   * Renderiza uma mensagem.
   */
  function renderMensagem(
    msg: Mensagem
  ) {
    const enviada =
      msg.enviado === true;

    const possuiArquivo =
      !!msg.arquivoUrl;

    const editando =
      mensagemEditando ===
      msg.id;

    const processando =
      processandoMensagem ===
      msg.id;

    const mensagemApagada =
      msg.apagada === true;

    return (
      <div
        key={msg.id}
        className={`mb-3 flex ${
          enviada
            ? "justify-end"
            : "justify-start"
        }`}
      >
        <div
          className={`rounded-lg px-4 py-2 max-w-md shadow ${
            enviada
              ? "bg-green-600 text-white"
              : "bg-white border text-gray-800"
          }`}
        >
          {mensagemApagada ? (
            <div
              className={`italic ${
                enviada
                  ? "text-green-100"
                  : "text-gray-500"
              }`}
            >
              🚫 Mensagem apagada
            </div>
          ) : editando ? (
            <div className="min-w-70">
              <textarea
                value={textoEdicao}
                onChange={(e) =>
                  setTextoEdicao(
                    e.target.value
                  )
                }
                rows={3}
                autoFocus
                className="w-full rounded-lg border border-gray-300 bg-white text-gray-800 p-2 outline-none focus:ring-2 focus:ring-green-500"
              />

              <div className="flex justify-end gap-2 mt-2">
                <button
                  type="button"
                  onClick={
                    cancelarEdicao
                  }
                  disabled={
                    processando
                  }
                  className="px-3 py-1 rounded-md bg-gray-200 text-gray-700 text-xs hover:bg-gray-300 disabled:opacity-50"
                >
                  Cancelar
                </button>

                <button
                  type="button"
                  onClick={() =>
                    editarMensagem(
                      msg
                    )
                  }
                  disabled={
                    processando ||
                    !textoEdicao.trim()
                  }
                  className="px-3 py-1 rounded-md bg-green-700 text-white text-xs hover:bg-green-800 disabled:opacity-50"
                >
                  {processando
                    ? "Salvando..."
                    : "Salvar"}
                </button>
              </div>
            </div>
          ) : (
            <>
              {possuiArquivo && (
                <div className="mb-2">
                  {renderArquivo(
                    msg
                  )}
                </div>
              )}

              {msg.texto && (
                <div className="whitespace-pre-wrap wrap-break-word">
                  {msg.texto}
                </div>
              )}

              {msg.editada && (
                <div
                  className={`text-[10px] italic mt-1 ${
                    enviada
                      ? "text-green-100"
                      : "text-gray-400"
                  }`}
                >
                  editada
                </div>
              )}
            </>
          )}

          <div
            className={`text-[11px] mt-1 flex items-center justify-end ${
              enviada
                ? "text-green-100"
                : "text-gray-500"
            }`}
          >
            <span>
              {formatarHora(
                msg.created_at
              )}
            </span>

            {renderStatus(msg)}

            {enviada &&
              !mensagemApagada &&
              !editando && (
                <div className="ml-2 flex items-center gap-1">
                  {(!msg.tipo ||
                    msg.tipo ===
                      "TEXTO") &&
                    msg.whatsappId && (
                      <button
                        type="button"
                        onClick={() =>
                          iniciarEdicao(
                            msg
                          )
                        }
                        disabled={
                          processando
                        }
                        title="Editar mensagem"
                        className="px-1.5 py-0.5 rounded hover:bg-green-700 transition disabled:opacity-50"
                      >
                        ✏️
                      </button>
                    )}

                  {msg.whatsappId && (
                    <button
                      type="button"
                      onClick={() =>
                        apagarMensagem(
                          msg
                        )
                      }
                      disabled={
                        processando
                      }
                      title="Apagar mensagem"
                      className="px-1.5 py-0.5 rounded hover:bg-green-700 transition disabled:opacity-50"
                    >
                      🗑️
                    </button>
                  )}
                </div>
              )}
          </div>
        </div>
      </div>
    );
  }

  function atualizarStatus(
    status: StatusConversa
  ) {
    setConversa(
      (atual) =>
        atual
          ? {
              ...atual,
              status,
            }
          : atual
    );
  }

  if (!conversaId) {
    return (
      <div className="flex-1 flex items-center justify-center text-gray-500 bg-gray-100">
        Selecione um aluno
      </div>
    );
  }

  return (
    <div className="flex flex-col flex-1 bg-gray-100 min-w-0">
      {conversa && (
        <CabecalhoChat
          nome={conversa.nome}
          telefone={
            conversa.telefone
          }
          conversaId={
            conversa.id
          }
          status={
            conversa.status
          }
          onStatusAlterado={
            atualizarStatus
          }
        />
      )}

      <div className="flex-1 overflow-y-auto p-5">
        {loading && (
          <div className="flex items-center justify-center py-4 text-sm text-gray-500">
            Carregando...
          </div>
        )}

        {!loading &&
          mensagens.length ===
            0 && (
            <div className="text-center text-gray-500 mt-10">
              Nenhuma mensagem nesta
              conversa.
            </div>
          )}

        {mensagens.map(
          renderMensagem
        )}

        <div
          ref={
            fimMensagensRef
          }
        />
      </div>

      <div className="pb-20">
        <CampoMensagem
          conversaId={conversaId}
        />
      </div>
    </div>
  );
}