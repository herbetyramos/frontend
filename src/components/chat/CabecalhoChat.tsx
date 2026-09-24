"use client";

import {
  useEffect,
  useState,
} from "react";

import Image from "next/image";

import {
  FiExternalLink,
  FiRefreshCw,
  FiX,
} from "react-icons/fi";

import {
  FaFilePdf,
  FaWhatsapp,
} from "react-icons/fa";

import { api } from "@/services/api";

type StatusConversa =
  | "AGUARDANDO_ATENDIMENTO"
  | "EM_ATENDIMENTO"
  | "FINALIZADO";

interface Props {
  nome?: string;
  telefone: string;
  conversaId: string;
  status: StatusConversa;
  onStatusAlterado(
    status: StatusConversa
  ): void;
}

interface StatusWhatsApp {
  conectado: boolean;
  qrCode: string | null;
}

export default function CabecalhoChat({
  nome,
  telefone,
  conversaId,
  status,
  onStatusAlterado,
}: Props) {
  const [
    modalWhatsAppAberto,
    setModalWhatsAppAberto,
  ] = useState(false);

  const [
    trocandoWhatsApp,
    setTrocandoWhatsApp,
  ] = useState(false);

  const [
    whatsappConectado,
    setWhatsappConectado,
  ] = useState(false);

  const [
    qrCode,
    setQrCode,
  ] = useState<string | null>(null);

  const [
    erroWhatsApp,
    setErroWhatsApp,
  ] = useState<string | null>(null);

  /**
   * =========================================================
   * ALTERAR STATUS DA CONVERSA
   * =========================================================
   */
  async function alterarStatus(
    novoStatus: StatusConversa
  ) {
    /**
     * Não faz nova requisição se o status
     * selecionado já for o atual.
     */
    if (novoStatus === status) {
      return;
    }

    try {
      await api.patch(
        `/chat/${conversaId}/status`,
        {
          status: novoStatus,
        }
      );

      /**
       * Atualiza o estado local somente
       * depois que o backend confirmou.
       */
      onStatusAlterado(novoStatus);
    } catch (error) {
      console.error(
        "Erro ao alterar status da conversa:",
        error
      );
    }
  }

  /**
   * =========================================================
   * ABRIR CONVERSA NO WHATSAPP
   * =========================================================
   */
  function abrirWhatsapp() {
    const numero =
      telefone.replace(/\D/g, "");

    if (!numero) {
      console.error(
        "Número de telefone inválido."
      );

      return;
    }

    window.open(
      `https://wa.me/${numero}`,
      "_blank"
    );
  }

  /**
   * =========================================================
   * CLASSE VISUAL DO STATUS
   * =========================================================
   */
  function obterClasseStatus(): string {
    switch (status) {
      case "AGUARDANDO_ATENDIMENTO":
        return "bg-yellow-100 text-yellow-700 border-yellow-300";

      case "EM_ATENDIMENTO":
        return "bg-blue-100 text-blue-700 border-blue-300";

      case "FINALIZADO":
        return "bg-gray-100 text-gray-600 border-gray-300";

      default:
        return "bg-yellow-100 text-yellow-700 border-yellow-300";
    }
  }

  /**
   * =========================================================
   * CONSULTAR STATUS DO WHATSAPP
   * =========================================================
   */
  async function consultarStatusWhatsApp() {
    try {
      const response =
        await api.get<StatusWhatsApp>(
          "/whatsapp/status"
        );

      setWhatsappConectado(
        response.data.conectado
      );

      setQrCode(
        response.data.qrCode
      );

      return response.data;
    } catch (error) {
      console.error(
        "Erro ao consultar status do WhatsApp:",
        error
      );

      return null;
    }
  }

  /**
   * =========================================================
   * TROCAR WHATSAPP
   * =========================================================
   */
  async function trocarWhatsApp() {
    const confirmar =
      window.confirm(
        "Deseja realmente trocar o WhatsApp conectado?\n\n" +
        "O WhatsApp atual será desconectado e será necessário " +
        "ler um novo QR Code com o telefone que deseja conectar."
      );

    if (!confirmar) {
      return;
    }

    try {
      setErroWhatsApp(null);
      setQrCode(null);
      setWhatsappConectado(false);
      setTrocandoWhatsApp(true);
      setModalWhatsAppAberto(true);

      await api.post(
        "/whatsapp/trocar"
      );

      /**
       * Consulta imediatamente para tentar
       * obter o primeiro QR Code.
       */
      await consultarStatusWhatsApp();
    } catch (error: unknown) {
      console.error(
        "Erro ao trocar WhatsApp:",
        error
      );

      let mensagem =
        "Não foi possível trocar o WhatsApp.";

      /**
       * Trata o erro do Axios sem utilizar any.
       */
      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const erroAxios = error as {
          response?: {
            data?: {
              mensagem?: string;
            };
          };
        };

        mensagem =
          erroAxios.response?.data?.mensagem ||
          mensagem;
      }

      setErroWhatsApp(mensagem);
      setTrocandoWhatsApp(false);
    }
  }

  /**
   * =========================================================
   * MONITORAR CONEXÃO DO NOVO WHATSAPP
   * =========================================================
   */
  useEffect(() => {
    if (!modalWhatsAppAberto) {
      return;
    }

    let ativo = true;

    const intervalo =
      setInterval(async () => {
        if (!ativo) {
          return;
        }

        const resultado =
          await consultarStatusWhatsApp();

        if (
          resultado?.conectado
        ) {
          setTrocandoWhatsApp(false);

          /**
           * Dá um pequeno tempo para o usuário
           * visualizar a confirmação.
           */
          setTimeout(() => {
            if (ativo) {
              setModalWhatsAppAberto(false);
            }
          }, 1200);
        }
      }, 2000);

    return () => {
      ativo = false;
      clearInterval(intervalo);
    };
  }, [modalWhatsAppAberto]);

  /**
   * =========================================================
   * FECHAR MODAL
   * =========================================================
   */
  function fecharModalWhatsApp() {
    /**
     * Não permite fechar enquanto a troca
     * ainda estiver sendo iniciada.
     */
    if (trocandoWhatsApp) {
      return;
    }

    setModalWhatsAppAberto(false);
    setErroWhatsApp(null);
    setQrCode(null);
  }

  return (
    <>
      {/* ===================================================== */}
      {/* CABEÇALHO DA CONVERSA                                */}
      {/* ===================================================== */}

      <div className="h-16 border-b bg-white px-5 flex items-center justify-between">

        {/* =================================================== */}
        {/* IDENTIFICAÇÃO DA CONVERSA                           */}
        {/* =================================================== */}

        <div className="flex items-center gap-3">

          <div className="w-12 h-12 rounded-full bg-green-600 text-white flex items-center justify-center text-lg font-bold">
            {(nome || telefone)
              .charAt(0)
              .toUpperCase()}
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

         {/* ================================================= */}
          {/* TROCAR WHATSAPP                                  */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={trocarWhatsApp}
            className="flex items-center gap-2 px-3 py-2 rounded-lg border border-green-300 text-green-700 hover:bg-green-50 transition"
            title="Trocar WhatsApp conectado"
          >
            <FiRefreshCw
              size={18}
            />

            <span className="hidden xl:inline">
              Trocar WhatsApp
            </span>
          </button>

        {/* =================================================== */}
        {/* AÇÕES DA CONVERSA                                  */}
        {/* =================================================== */}

        <div className="flex items-center gap-2">

          {/* ================================================= */}
          {/* STATUS                                            */}
          {/* ================================================= */}

          <select
            value={status}
            onChange={(e) =>
              alterarStatus(
                e.target.value as StatusConversa
              )
            }
            className={`rounded-lg px-3 py-2 text-sm font-semibold border outline-none cursor-pointer ${obterClasseStatus()}`}
            title="Status do atendimento"
          >
            <option value="AGUARDANDO_ATENDIMENTO">
              Aguardando atendimento
            </option>

            <option value="EM_ATENDIMENTO">
              Em atendimento
            </option>

            <option value="FINALIZADO">
              Finalizado
            </option>
          </select>

         

                 

          {/* ================================================= */}
          {/* ENVIAR CERTIFICADO                               */}
          {/* ================================================= */}

          <button
            type="button"
            className="hover:bg-gray-100 p-2 rounded-lg"
            title="Enviar certificado"
          >
            <FaFilePdf
              size={20}
              className="text-red-600"
            />
          </button>

          {/* ================================================= */}
          {/* ABRIR WHATSAPP                                   */}
          {/* ================================================= */}

          <button
            type="button"
            onClick={abrirWhatsapp}
            className="hover:bg-gray-100 p-2 rounded-lg"
            title="Abrir WhatsApp"
          >
            <FiExternalLink
              size={20}
            />
          </button>

        </div>
      </div>

      {/* ===================================================== */}
      {/* MODAL TROCAR WHATSAPP                                */}
      {/* ===================================================== */}

      {modalWhatsAppAberto && (
        <div className="fixed inset-0 z-9999 bg-black/50 flex items-center justify-center p-4">

          <div className="bg-white rounded-2xl shadow-2xl w-full max-w-md overflow-hidden">

            {/* ================================================= */}
            {/* CABEÇALHO DO MODAL                               */}
            {/* ================================================= */}

            <div className="flex items-center justify-between px-5 py-4 border-b">

              <div className="flex items-center gap-3">

                <div className="w-10 h-10 rounded-full bg-green-100 text-green-600 flex items-center justify-center">

                  <FaWhatsapp
                    size={22}
                  />

                </div>

                <div>

                  <h2 className="font-semibold text-lg">
                    Trocar WhatsApp
                  </h2>

                  <p className="text-xs text-gray-500">
                    Conectar outro telefone
                  </p>

                </div>

              </div>

              {!trocandoWhatsApp && (
                <button
                  type="button"
                  onClick={
                    fecharModalWhatsApp
                  }
                  className="p-2 rounded-lg hover:bg-gray-100"
                  title="Fechar"
                >
                  <FiX
                    size={20}
                  />
                </button>
              )}

            </div>

            {/* ================================================= */}
            {/* CONTEÚDO DO MODAL                                */}
            {/* ================================================= */}

            <div className="p-6">

              {/* ================================================= */}
              {/* ERRO                                             */}
              {/* ================================================= */}

              {erroWhatsApp ? (
                <div className="text-center">

                  <div className="bg-red-50 border border-red-200 text-red-700 rounded-lg p-4 text-sm">
                    {erroWhatsApp}
                  </div>

                  <button
                    type="button"
                    onClick={
                      fecharModalWhatsApp
                    }
                    className="mt-4 px-4 py-2 bg-gray-800 text-white rounded-lg hover:bg-gray-700"
                  >
                    Fechar
                  </button>

                </div>

              ) : whatsappConectado ? (

                /* ================================================= */
                /* CONECTADO                                         */
                /* ================================================= */

                <div className="text-center py-8">

                  <div className="mx-auto mb-4 w-16 h-16 rounded-full bg-green-100 text-green-600 flex items-center justify-center">

                    <FaWhatsapp
                      size={36}
                    />

                  </div>

                  <h3 className="text-xl font-semibold text-green-700">
                    WhatsApp conectado!
                  </h3>

                  <p className="text-gray-500 mt-2">
                    O novo WhatsApp foi conectado
                    com sucesso.
                  </p>

                </div>

              ) : qrCode ? (

                /* ================================================= */
                /* QR CODE                                           */
                /* ================================================= */

                <div className="text-center">

                  <h3 className="font-semibold text-lg">
                    Escaneie o QR Code
                  </h3>

                  <p className="text-sm text-gray-500 mt-1 mb-5">
                    No telefone que deseja conectar,
                    abra o WhatsApp e acesse:
                  </p>

                  <p className="font-medium text-gray-700 mb-4">
                    Configurações → Dispositivos
                    conectados → Conectar dispositivo
                  </p>

                  <div className="flex justify-center">

                    <div className="border rounded-xl p-3 bg-white shadow-sm">

                      <Image
                        src={qrCode}
                        alt="QR Code do WhatsApp"
                        width={256}
                        height={256}
                        className="w-64 h-64"
                        unoptimized
                      />

                    </div>

                  </div>

                  <div className="mt-5 flex items-center justify-center gap-2 text-sm text-gray-500">

                    <span className="w-2 h-2 bg-green-500 rounded-full animate-pulse" />

                    Aguardando leitura do QR Code...

                  </div>

                </div>

              ) : (

                /* ================================================= */
                /* GERANDO QR CODE                                   */
                /* ================================================= */

                <div className="text-center py-8">

                  <FiRefreshCw
                    size={40}
                    className="mx-auto text-green-600 animate-spin"
                  />

                  <h3 className="mt-4 font-semibold text-lg">
                    Preparando novo WhatsApp...
                  </h3>

                  <p className="text-sm text-gray-500 mt-2">
                    Aguarde enquanto o QR Code é
                    gerado.
                  </p>

                </div>

              )}

            </div>

            {/* ================================================= */}
            {/* RODAPÉ                                            */}
            {/* ================================================= */}

            {!trocandoWhatsApp &&
              !whatsappConectado &&
              !erroWhatsApp && (

                <div className="px-5 py-4 border-t bg-gray-50 text-center">

                  <button
                    type="button"
                    onClick={
                      fecharModalWhatsApp
                    }
                    className="px-5 py-2 rounded-lg border border-gray-300 bg-white hover:bg-gray-100 text-gray-700"
                  >
                    Cancelar
                  </button>

                </div>

              )}

          </div>

        </div>
      )}
    </>
  );
}
