
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/services/api";
import { toast } from "react-toastify";
import axios from "axios";

// ==============================
// TIPOS
// ==============================

interface LocalType {
  id: string;
  polo: string;
}

interface SalaType {
  id: string;
  numero_sala: string;
  tipo_uso: string;
  local_id: string;
}

interface ProfessorType {
  id: string;
  nome_professor: string;
}

interface FormaturaType {
  id: string;
  data_formatura: string;
}

interface BlocoType {
  id: string;
  bloco_Curso: string;
}

interface DetentoraType {
  id: string;
  ata_id: string;
  cursos_id: string;

  curso?: {
    id: string;
    nome_curso: string;
  };

  ata?: {
    id: string;
    numero_ata: string;
  };
}

interface SaldoDetentora {
  id: string;
  empresa: string;
  ata: string;
  curso: string;
  contratado: number;
  utilizadas: number;
  saldo: number;
}

// ==============================
// TIPO DO CRONOGRAMA
// ==============================

interface CronogramaType {
  codigo?: string | number;

  bloco_id?: string | null;
  detentoras_id?: string | null;
  professor_id?: string | null;
  local_id?: string | null;
  sala_id?: string | null;
  formatura_id?: string | null;

  data_inicio?: string | null;
  data_fim?: string | null;

  hora_inicio?: string | null;
  hora_fim?: string | null;

  tema?: string | null;

  is_status?: string | null;
  status?: string | null;

  especificacao?: string | null;

  publicar?: boolean | null;
  draft?: boolean | null;

  link_inscricao?: string | null;
  imagem_url?: string | null;
}

// ==============================
// COMPONENTE
// ==============================

export default function CronogramaEditar() {
  const params = useParams();
  const router = useRouter();

  const id = Array.isArray(params?.id)
    ? params.id[0]
    : params?.id;

  // ==============================
  // LISTAS
  // ==============================

  const [locaisList, setLocaisList] =
    useState<LocalType[]>([]);

  const [blocoCurso, setBlocos] =
    useState<BlocoType[]>([]);

  const [salas, setSalas] =
    useState<SalaType[]>([]);

  const [professores, setProfessores] =
    useState<ProfessorType[]>([]);

  const [detentoras, setDetentoras] =
    useState<DetentoraType[]>([]);

  const [formaturas, setFormaturas] =
    useState<FormaturaType[]>([]);

  // ==============================
  // FORMULÁRIO
  // ==============================

  const [detentoras_id, setDetentoras_id] =
    useState("");

  const [local_id, setLocal] =
    useState("");

  const [bloco_id, setBloco] =
    useState("");

  const [tema, setTema] =
    useState("");

  const [data_inicio, setDataInicio] =
    useState("");

  const [data_fim, setDataFim] =
    useState("");

  const [hora_inicio, setHorario] =
    useState("");

  const [hora_fim, setHorarioFim] =
    useState("");

  const [sala_id, setSala] =
    useState("");

  const [professor_id, setProfessor] =
    useState("");

  const [formatura_id, setFormatura] =
    useState("");

  const [especificacao, setObservacao] =
    useState("");

  const [publicar, setPublicar] =
    useState(false);

  const [draft, setDraft] =
    useState(false);

  const [periodo, setPeriodo] =
    useState("");

  const [link_inscricao, setLink_inscricao] =
    useState("");

  const [imagemUrl, setImagemUrl] =
    useState("");

  const [imagemValida, setImagemValida] =
    useState(true);

  // ==============================
  // STATUS
  // ==============================

  const [is_status, setIsStatus] =
    useState("ativo");

  // ==============================
  // SALDO
  // ==============================

  const [saldoDetentora, setSaldoDetentora] =
    useState<SaldoDetentora | null>(null);

  const [loadingSaldo, setLoadingSaldo] =
    useState(false);

  const [mostrarSaldo, setMostrarSaldo] =
    useState(false);

  // ==============================
  // LOADING
  // ==============================

  const [loading, setLoading] =
    useState(true);

  const [salvando, setSalvando] =
    useState(false);

  // ==============================
  // PERÍODO
  // ==============================

  function handlePeriodo(value: string) {
    setPeriodo(value);

    if (value === "manha") {
      setHorario("08:00");
      setHorarioFim("12:00");
    }

    if (value === "tarde") {
      setHorario("13:00");
      setHorarioFim("17:00");
    }

    if (value === "noite") {
      setHorario("18:00");
      setHorarioFim("22:00");
    }
  }

  // ==============================
  // CONVERTER DATA PARA INPUT
  // ==============================

  function converterDataParaInput(
    data: string | null | undefined
  ): string {
    if (!data) {
      return "";
    }

    // Já está no formato YYYY-MM-DD
    if (
      /^\d{4}-\d{2}-\d{2}$/.test(data)
    ) {
      return data;
    }

    // Caso venha como ISO
    if (data.includes("T")) {
      return data.substring(0, 10);
    }

    // Caso venha DD/MM/YYYY
    const partes = data.split("/");

    if (partes.length === 3) {
      const [dia, mes, ano] = partes;

      return `${ano}-${mes.padStart(
        2,
        "0"
      )}-${dia.padStart(2, "0")}`;
    }

    return data;
  }

  // ==============================
  // FORMATAR DATA PARA BACKEND
  // ==============================

  function formatarData(
    data: string
  ): string {
    if (!data) {
      return "";
    }

    if (data.includes("/")) {
      return data;
    }

    const partes = data.split("-");

    if (partes.length !== 3) {
      return data;
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
  }

  // ==============================
  // CARREGAR SALDO
  // ==============================

  async function carregarSaldoDetentora(
    idDetentora: string
  ) {
    if (!idDetentora) {
      setSaldoDetentora(null);
      return;
    }

    try {
      setLoadingSaldo(true);

      const response =
        await api.get<SaldoDetentora>(
          "/detentora/saldo",
          {
            params: {
              id: idDetentora,
            },
          }
        );

      setSaldoDetentora(response.data);
    } catch (error) {
      console.error(
        "Erro ao buscar saldo:",
        error
      );

      setSaldoDetentora(null);
    } finally {
      setLoadingSaldo(false);
    }
  }

  // ==============================
  // CARREGAR LISTAS + CRONOGRAMA
  // ==============================

  useEffect(() => {
    if (!id) {
      return;
    }

    async function loadData() {
      try {
        setLoading(true);

        const [
          locaisRes,
          blocoRes,
          salasRes,
          profRes,
          formRes,
          detRes,
          cronogramaRes,
        ] = await Promise.all([
          api.get<LocalType[]>("/local"),

          api.get<BlocoType[]>("/bloco"),

          api.get<SalaType[]>("/sala"),

          api.get<ProfessorType[]>(
            "/professor"
          ),

          api.get<FormaturaType[]>(
            "/formatura"
          ),

          api.get<DetentoraType[]>(
            "/detentora"
          ),

          api.get<CronogramaType>(
            `/cronograma/${id}`
          ),
        ]);

        // ==============================
        // LISTAS
        // ==============================

        setLocaisList(
          locaisRes.data
        );

        setBlocos(
          blocoRes.data
        );

        setSalas(
          salasRes.data
        );

        setProfessores(
          profRes.data
        );

        setFormaturas(
          formRes.data
        );

        setDetentoras(
          detRes.data
        );

        // ==============================
        // CRONOGRAMA
        // ==============================

        const cronograma =
          cronogramaRes.data;

        setBloco(
          cronograma.bloco_id ?? ""
        );

        setDetentoras_id(
          cronograma.detentoras_id ?? ""
        );

        setProfessor(
          cronograma.professor_id ?? ""
        );

        setLocal(
          cronograma.local_id ?? ""
        );

        setSala(
          cronograma.sala_id ?? ""
        );

        setFormatura(
          cronograma.formatura_id ?? ""
        );

        setTema(
          cronograma.tema ?? ""
        );

        setDataInicio(
          converterDataParaInput(
            cronograma.data_inicio
          )
        );

        setDataFim(
          converterDataParaInput(
            cronograma.data_fim
          )
        );

        setHorario(
          cronograma.hora_inicio ?? ""
        );

        setHorarioFim(
          cronograma.hora_fim ?? ""
        );

        setObservacao(
          cronograma.especificacao ?? ""
        );

        setPublicar(
          Boolean(cronograma.publicar)
        );

        setDraft(
          Boolean(cronograma.draft)
        );

        setLink_inscricao(
          cronograma.link_inscricao ?? ""
        );

        setImagemUrl(
          cronograma.imagem_url ?? ""
        );

        // ==============================
        // STATUS
        // ==============================

        setIsStatus(
          cronograma.is_status ??
            cronograma.status ??
            "ativo"
        );

        // ==============================
        // SALDO
        // ==============================

        if (cronograma.detentoras_id) {
          carregarSaldoDetentora(
            cronograma.detentoras_id
          );
        }
      } catch (error: unknown) {
        console.error(
          "Erro ao carregar cronograma:",
          error
        );

        if (
          axios.isAxiosError(error)
        ) {
          console.error(
            "STATUS:",
            error.response?.status
          );

          console.error(
            "RESPOSTA:",
            error.response?.data
          );
        }

        toast.error(
          "Erro ao carregar o cronograma."
        );
      } finally {
        setLoading(false);
      }
    }

    loadData();
  }, [id]);

  // ==============================
  // SALAS FILTRADAS
  // ==============================

  const salasFiltradas =
    salas.filter(
      (sala) =>
        sala.local_id ===
        local_id
    );

  // ==============================
  // ATUALIZAR CRONOGRAMA
  // ==============================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    if (!id) {
      toast.error(
        "ID do cronograma não encontrado."
      );

      return;
    }

    if (!detentoras_id) {
      toast.error(
        "Selecione o curso da ata."
      );

      return;
    }

    // ==============================
    // PAYLOAD
    // ==============================

    const payload = {
      bloco_id:
        bloco_id || null,

      detentoras_id:
        detentoras_id || null,

      professor_id:
        professor_id || null,

      local_id:
        local_id || null,

      sala_id:
        sala_id || null,

      formatura_id:
        formatura_id || null,

      data_inicio:
        formatarData(data_inicio),

      data_fim:
        formatarData(data_fim),

      hora_inicio,

      hora_fim,

      tema: tema.trim(),

      // ==============================
      // STATUS
      // ==============================

      is_status,

      especificacao:
        especificacao.trim(),

      publicar,

      draft,

      link_inscricao:
        link_inscricao.trim() !== ""
          ? link_inscricao.trim()
          : null,

      imagem_url:
        imagemUrl.trim() !== ""
          ? imagemUrl.trim()
          : null,
    };

    console.log(
      "================================="
    );

    console.log(
      "ATUALIZANDO CRONOGRAMA:",
      id
    );

    console.log(
      "PAYLOAD:",
      payload
    );

    console.log(
      "STATUS:",
      is_status
    );

    console.log(
      "================================="
    );

    try {
      setSalvando(true);

      const response =
        await api.put(
          `/cronograma/${id}`,
          payload
        );

      console.log(
        "Cronograma atualizado:",
        response.data
      );

      toast.success(
        "Cronograma atualizado com sucesso!"
      );

      // Atualiza saldo
      await carregarSaldoDetentora(
        detentoras_id
      );

      // Volta para a listagem
      setTimeout(() => {
        router.push(
          "/cronograma"
        );
      }, 800);
    } catch (error: unknown) {
      console.error(
        "Erro ao atualizar cronograma:",
        error
      );

      if (
        axios.isAxiosError(error)
      ) {
        console.error(
          "STATUS:",
          error.response?.status
        );

        console.error(
          "RESPOSTA DO BACKEND:",
          error.response?.data
        );

        toast.error(
          error.response?.data
            ?.message ||
            "Erro ao atualizar cronograma."
        );
      } else {
        toast.error(
          "Erro ao atualizar cronograma."
        );
      }
    } finally {
      setSalvando(false);
    }
  }

  // ==============================
  // LOADING
  // ==============================

  if (loading) {
    return (
      <div className="max-w-6xl mx-auto p-6">
        <div className="flex justify-center items-center py-20">
          <div className="text-gray-600 text-lg">
            Carregando cronograma...
          </div>
        </div>
      </div>
    );
  }

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="max-w-6xl mx-auto p-6">

      {/* ==============================
          TÍTULO
      ============================== */}

      <div className="mb-6">

        <h2
          className="
            text-2xl
            font-semibold
            text-center
          "
        >
          Editar Cronograma
        </h2>

        <p
          className="
            text-center
            text-sm
            text-gray-500
            mt-1
          "
        >
          Código: {id}
        </p>

      </div>

      <form
        onSubmit={handleSubmit}
        className="
          grid
          grid-cols-2
          gap-4
        "
      >

        {/* ==============================
            BLOCO
        ============================== */}

        <div>
          <label className="block text-sm font-medium mb-1">
            Bloco
          </label>

          <select
            value={bloco_id}
            onChange={(e) =>
              setBloco(e.target.value)
            }
            className="
              w-full
              px-3
              py-2
              border
              rounded-lg
              bg-white
            "
          >
            <option value="">
              Selecione o bloco
            </option>

            {blocoCurso.map(
              (bloco) => (
                <option
                  key={bloco.id}
                  value={bloco.id}
                >
                  {bloco.bloco_Curso}
                </option>
              )
            )}
          </select>
        </div>

        {/* ==============================
            STATUS
        ============================== */}

        <div>
          <label
            htmlFor="is_status"
            className="
              block
              text-sm
              font-semibold
              mb-1
            "
          >
            Status
          </label>

          <select
            id="is_status"
            value={is_status}
            onChange={(e) =>
              setIsStatus(
                e.target.value
              )
            }
            className="
              w-full
              px-3
              py-2
              border-2
              border-blue-500
              rounded-lg
              bg-white
              font-semibold
              focus:outline-none
              focus:ring-2
              focus:ring-blue-300
            "
          >
            <option value="ativo">
              ATIVO
            </option>

            <option value="inativo">
              INATIVO
            </option>

            <option value="cancelado">
              CANCELADO
            </option>

            <option value="concluido">
              CONCLUÍDO
            </option>
          </select>

          <div className="mt-1">
            {is_status === "ativo" && (
              <span
                className="
                  inline-block
                  px-2
                  py-1
                  text-xs
                  font-bold
                  rounded-full
                  bg-green-100
                  text-green-700
                "
              >
                ATIVO
              </span>
            )}

            {is_status === "inativo" && (
              <span
                className="
                  inline-block
                  px-2
                  py-1
                  text-xs
                  font-bold
                  rounded-full
                  bg-gray-200
                  text-gray-700
                "
              >
                INATIVO
              </span>
            )}

            {is_status === "cancelado" && (
              <span
                className="
                  inline-block
                  px-2
                  py-1
                  text-xs
                  font-bold
                  rounded-full
                  bg-red-100
                  text-red-700
                "
              >
                CANCELADO
              </span>
            )}

            {is_status === "concluido" && (
              <span
                className="
                  inline-block
                  px-2
                  py-1
                  text-xs
                  font-bold
                  rounded-full
                  bg-blue-100
                  text-blue-700
                "
              >
                CONCLUÍDO
              </span>
            )}
          </div>
        </div>

        {/* ==============================
            DATA FORMATURA
        ============================== */}

        <div>
          <label className="block text-sm font-medium mb-1">
            Data da formatura
          </label>

          <select
            value={formatura_id}
            onChange={(e) =>
              setFormatura(
                e.target.value
              )
            }
            className="
              w-full
              px-3
              py-2
              border
              rounded-lg
              bg-white
            "
          >
            <option value="">
              Data da formatura
            </option>

            {formaturas.map(
              (formatura) => (
                <option
                  key={formatura.id}
                  value={formatura.id}
                >
                  {
                    formatura.data_formatura
                  }
                </option>
              )
            )}
          </select>
        </div>

        {/* ==============================
            LOCAL
        ============================== */}

        <div>
          <label className="block text-sm font-medium mb-1">
            Local
          </label>

          <select
            value={local_id}
            onChange={(e) =>
              setLocal(
                e.target.value
              )
            }
            className="
              w-full
              px-3
              py-2
              border
              rounded-lg
              bg-white
            "
          >
            <option value="">
              Selecione o local
            </option>

            {locaisList.map(
              (local) => (
                <option
                  key={local.id}
                  value={local.id}
                >
                  {local.polo}
                </option>
              )
            )}
          </select>
        </div>

        {/* ==============================
            SALA
        ============================== */}

        <div>
          <label className="block text-sm font-medium mb-1">
            Sala
          </label>

          <select
            value={sala_id}
            onChange={(e) =>
              setSala(
                e.target.value
              )
            }
            className="
              w-full
              px-3
              py-2
              border
              rounded-lg
              bg-white
            "
          >
            <option value="">
              Selecione a sala
            </option>

            {salasFiltradas.map(
              (sala) => (
                <option
                  key={sala.id}
                  value={sala.id}
                >
                  {sala.numero_sala}
                  {" - "}
                  {sala.tipo_uso}
                </option>
              )
            )}
          </select>
        </div>

        {/* ==============================
            DETENTORA / CURSO
        ============================== */}

        <div>
          <label className="block text-sm font-medium mb-1">
            Curso da Ata
          </label>

          <select
            value={detentoras_id}
            onChange={async (e) => {
              const novoId =
                e.target.value;

              setDetentoras_id(
                novoId
              );

              if (!novoId) {
                setSaldoDetentora(null);
                return;
              }

              await carregarSaldoDetentora(
                novoId
              );
            }}
            className="
              w-full
              px-3
              py-2
              border
              rounded-lg
              bg-white
            "
          >
            <option value="">
              Curso da Ata
            </option>

            {Array.from(
              new Map(
                detentoras.map(
                  (detentora) => {
                    const nomeCurso =
                      detentora.curso
                        ?.nome_curso
                        ?.trim()
                        .toUpperCase() ||
                      "SEM CURSO";

                    const numeroAta =
                      detentora.ata
                        ?.numero_ata
                        ?.trim()
                        .toUpperCase() ||
                      "SEM ATA";

                    const chave =
                      `${nomeCurso}__${numeroAta}`;

                    return [
                      chave,
                      detentora,
                    ];
                  }
                )
              ).values()
            )
              .sort((a, b) =>
                (
                  a.curso
                    ?.nome_curso ??
                  ""
                ).localeCompare(
                  b.curso
                    ?.nome_curso ??
                  "",
                  "pt-BR",
                  {
                    sensitivity:
                      "base",
                  }
                )
              )
              .map(
                (detentora) => (
                  <option
                    key={detentora.id}
                    value={detentora.id}
                  >
                    {(
                      detentora.curso
                        ?.nome_curso ??
                      "SEM CURSO"
                    ).toUpperCase()}
                    {" - ATA "}
                    {(
                      detentora.ata
                        ?.numero_ata ??
                      "SEM ATA"
                    ).toUpperCase()}
                  </option>
                )
              )}
          </select>
        </div>

        {/* ==============================
            TEMA
        ============================== */}

        <div>
          <label className="block text-sm font-medium mb-1">
            Tema do curso
          </label>

          <input
            value={tema}
            onChange={(e) =>
              setTema(
                e.target.value
              )
            }
            placeholder="Tema do curso"
            className="
              w-full
              px-3
              py-2
              border
              rounded-lg
            "
          />
        </div>

        {/* ==============================
            LOADING SALDO
        ============================== */}

        {loadingSaldo && (
          <div
            className="
              col-span-2
              text-sm
              text-gray-500
            "
          >
            Consultando saldo...
          </div>
        )}

        {/* ==============================
            SALDO
        ============================== */}

        {saldoDetentora && (
          <div
            className="
              col-span-2
              rounded-xl
              border
              border-blue-400
              bg-white
              shadow
              overflow-hidden
            "
          >
            <button
              type="button"
              onClick={() =>
                setMostrarSaldo(
                  !mostrarSaldo
                )
              }
              className="
                w-full
                flex
                justify-between
                items-center
                px-5
                py-4
                bg-blue-50
              "
            >
              <div
                className="
                  flex
                  items-center
                  gap-3
                "
              >
                <span
                  className="
                    text-lg
                    font-bold
                    text-blue-700
                  "
                >
                  Saldo
                </span>

                <span
                  className={`
                    px-3
                    py-1
                    rounded-full
                    text-white
                    font-bold
                    ${
                      saldoDetentora.saldo <= 0
                        ? "bg-red-600"
                        : saldoDetentora.saldo <= 5
                        ? "bg-yellow-500"
                        : "bg-green-600"
                    }
                  `}
                >
                  {saldoDetentora.saldo}
                  {" turma(s)"}
                </span>
              </div>

              <span>
                {mostrarSaldo
                  ? "▲"
                  : "▼"}
              </span>
            </button>

            {mostrarSaldo && (
              <div
                className="
                  p-5
                  grid
                  grid-cols-3
                  gap-5
                "
              >
                <div>
                  <p className="text-gray-500 text-sm">
                    Empresa
                  </p>

                  <strong>
                    {
                      saldoDetentora.empresa
                    }
                  </strong>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Contratado
                  </p>

                  <strong
                    className="
                      text-2xl
                      text-blue-600
                    "
                  >
                    {
                      saldoDetentora.contratado
                    }
                  </strong>
                </div>

                <div>
                  <p className="text-gray-500 text-sm">
                    Utilizadas
                  </p>

                  <strong
                    className="
                      text-2xl
                      text-orange-600
                    "
                  >
                    {
                      saldoDetentora.utilizadas
                    }
                  </strong>
                </div>
              </div>
            )}
          </div>
        )}

        {/* ==============================
            DATAS E HORÁRIOS
        ============================== */}

        <div
          className="
            col-span-2
            grid
            grid-cols-5
            gap-4
          "
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Data inicial
            </label>

            <input
              type="date"
              value={data_inicio}
              onChange={(e) =>
                setDataInicio(
                  e.target.value
                )
              }
              className="
                w-full
                px-3
                py-2
                border
                rounded-lg
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Data final
            </label>

            <input
              type="date"
              value={data_fim}
              onChange={(e) =>
                setDataFim(
                  e.target.value
                )
              }
              className="
                w-full
                px-3
                py-2
                border
                rounded-lg
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Período
            </label>

            <select
              value={periodo}
              onChange={(e) =>
                handlePeriodo(
                  e.target.value
                )
              }
              className="
                w-full
                px-3
                py-2
                border
                rounded-lg
                bg-white
              "
            >
              <option value="">
                Período
              </option>

              <option value="manha">
                Manhã
              </option>

              <option value="tarde">
                Tarde
              </option>

              <option value="noite">
                Noite
              </option>
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Hora início
            </label>

            <input
              type="time"
              value={hora_inicio}
              onChange={(e) =>
                setHorario(
                  e.target.value
                )
              }
              className="
                w-full
                px-3
                py-2
                border
                rounded-lg
              "
            />
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Hora fim
            </label>

            <input
              type="time"
              value={hora_fim}
              onChange={(e) =>
                setHorarioFim(
                  e.target.value
                )
              }
              className="
                w-full
                px-3
                py-2
                border
                rounded-lg
              "
            />
          </div>
        </div>

        {/* ==============================
            PROFESSOR + OBSERVAÇÃO
        ============================== */}

        <div
          className="
            col-span-2
            grid
            grid-cols-1
            md:grid-cols-2
            gap-4
          "
        >
          <div>
            <label className="block text-sm font-medium mb-1">
              Professor
            </label>

            <select
              value={professor_id}
              onChange={(e) =>
                setProfessor(
                  e.target.value
                )
              }
              className="
                w-full
                px-3
                py-2
                border
                rounded-lg
                bg-white
              "
            >
              <option value="">
                Selecione o professor
              </option>

              {professores.map(
                (professor) => (
                  <option
                    key={professor.id}
                    value={professor.id}
                  >
                    {
                      professor.nome_professor
                    }
                  </option>
                )
              )}
            </select>
          </div>

          <div>
            <label className="block text-sm font-medium mb-1">
              Especificação / Observações
            </label>

            <textarea
              rows={1}
              value={especificacao}
              onChange={(e) =>
                setObservacao(
                  e.target.value
                )
              }
              placeholder="Especificação / Observações"
              className="
                w-full
                px-3
                py-2
                border
                rounded-lg
                resize-none
              "
            />
          </div>
        </div>

        {/* ==============================
            PUBLICAR / RASCUNHO
        ============================== */}

        <div
          className="
            col-span-2
            flex
            gap-6
            items-center
          "
        >
          <label
            className="
              flex
              items-center
              gap-2
              cursor-pointer
            "
          >
            <input
              type="checkbox"
              checked={publicar}
              onChange={(e) =>
                setPublicar(
                  e.target.checked
                )
              }
              className="w-4 h-4"
            />

            <span className="text-sm">
              Publicar
            </span>
          </label>

          <label
            className="
              flex
              items-center
              gap-2
              cursor-pointer
            "
          >
            <input
              type="checkbox"
              checked={draft}
              onChange={(e) =>
                setDraft(
                  e.target.checked
                )
              }
              className="w-4 h-4"
            />

            <span className="text-sm">
              Rascunho
            </span>
          </label>
        </div>

        {/* ==============================
            LINK + IMAGEM
        ============================== */}

        <div
          className="
            col-span-2
            flex
            flex-col
            md:flex-row
            gap-6
          "
        >

          {/* LINK */}

          <div className="flex-1">
            <label
              htmlFor="link_inscricao"
              className="
                block
                text-sm
                font-medium
                mb-1
              "
            >
              Link de inscrição
            </label>

            <input
              id="link_inscricao"
              type="url"
              value={link_inscricao}
              onChange={(e) =>
                setLink_inscricao(
                  e.target.value
                )
              }
              placeholder="https://..."
              className="
                w-full
                px-3
                py-2
                border
                rounded-lg
              "
            />
          </div>

          {/* IMAGEM */}

          <div className="flex-1">
            <label
              htmlFor="imagem_url"
              className="
                block
                text-sm
                font-medium
                mb-1
              "
            >
              URL da imagem do curso
            </label>

            <input
              id="imagem_url"
              type="url"
              value={imagemUrl}
              onChange={(e) => {
                setImagemUrl(
                  e.target.value
                );

                setImagemValida(
                  true
                );
              }}
              placeholder="https://exemplo.com/imagem.jpg"
              className="
                w-full
                px-3
                py-2
                border
                rounded-lg
              "
            />

            <p
              className="
                mt-1
                text-xs
                text-gray-500
              "
            >
              Informe a URL de uma imagem pública.
            </p>

            {imagemUrl.trim() !== "" &&
              !imagemValida && (
                <div
                  className="
                    mt-3
                    p-3
                    rounded-lg
                    border
                    border-red-300
                    bg-red-50
                    text-red-600
                    text-sm
                  "
                >
                  Não foi possível carregar essa imagem.
                </div>
              )}
          </div>
        </div>

        {/* ==============================
            BOTÕES
        ============================== */}

        <div
          className="
            col-span-2
            flex
            justify-end
            gap-3
            mt-2
          "
        >
          <button
            type="button"
            onClick={() =>
              router.push(
                "/cronograma"
              )
            }
            disabled={salvando}
            className="
              px-6
              py-3
              rounded-lg
              border
              border-gray-300
              bg-white
              text-gray-700
              font-semibold
              hover:bg-gray-50
            "
          >
            Cancelar
          </button>

          <button
            type="submit"
            disabled={
              salvando ||
              loadingSaldo
            }
            className={`
              px-6
              py-3
              rounded-lg
              text-white
              font-semibold
              ${
                salvando ||
                loadingSaldo
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            {salvando
              ? "Atualizando..."
              : "Atualizar Cronograma"}
          </button>
        </div>

      </form>
    </div>
  );
}
