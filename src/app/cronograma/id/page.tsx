
"use client";

import React, { useEffect, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import { api } from "@/services/api";
import { toast } from "react-toastify";
import axios from "axios";

// ==============================
// TIPOS
// ==============================

type LocalType = {
  id: string;
  polo: string;
};

type SalaType = {
  id: string;
  numero_sala: string;
  tipo_uso?: string;
  local_id: string;
};

type ProfessorType = {
  id: string;
  nome_professor: string;
};

type FormaturaType = {
  id: string;
  data_formatura: string;
};

type BlocoType = {
  id: string;
  bloco_Curso: string;
};

type DetentoraType = {
  id: string;
  ata_id: string;
  cursos_id: string;

  curso: {
    id: string;
    nome_curso: string;
  };

  ata: {
    id: string;
    numero_ata: string;
  };
};

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
// COMPONENTE
// ==============================

export default function Cronograma() {
  const params = useParams();
  const router = useRouter();

  const id = params?.id as string;

  // ==============================
  // LISTAS
  // ==============================

  const [locaisList, setLocaisList] = useState<LocalType[]>([]);
  const [blocoCurso, setBlocos] = useState<BlocoType[]>([]);
  const [salas, setSalas] = useState<SalaType[]>([]);
  const [professores, setProfessores] = useState<ProfessorType[]>([]);
  const [detentoras, setDetentoras] = useState<DetentoraType[]>([]);
  const [formaturas, setFormaturas] = useState<FormaturaType[]>([]);

  // ==============================
  // FORMULÁRIO
  // ==============================

  const [detentoras_id, setDetentoras_id] = useState("");
  const [local_id, setLocal] = useState("");
  const [bloco_id, setBloco] = useState("");
  const [tema, setTema] = useState("");
  const [data_inicio, setDataInicio] = useState("");
  const [data_fim, setDataFim] = useState("");
  const [hora_inicio, setHorario] = useState("");
  const [hora_fim, setHorarioFim] = useState("");
  const [sala_id, setSala] = useState("");
  const [professor_id, setProfessor] = useState("");
  const [quantidade_aluno, setQtdeAlunos] = useState("");
  const [formatura_id, setFormatura] = useState("");
  const [especificacao, setObservacao] = useState("");
  const [publicar, setPublicar] = useState(false);
  const [draft, setDraft] = useState(false);
  const [is_status, setStatus] = useState("");
  const [periodo, setPeriodo] = useState("");
  const [link_inscricao, setLink_inscricao] = useState("");

  // ==============================
  // IMAGEM
  // ==============================

  const [imagemUrl, setImagemUrl] = useState("");
  const [imagemValida, setImagemValida] = useState(true);

  // ==============================
  // SALDO
  // ==============================

  const [saldoDetentora, setSaldoDetentora] =
    useState<SaldoDetentora | null>(null);

  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [mostrarSaldo, setMostrarSaldo] = useState(false);

  // ==============================
  // LOADING
  // ==============================

  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

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
  // FORMATAR DATA PARA INPUT DATE
  // Aceita:
  // yyyy-MM-dd
  // dd/MM/yyyy
  // ISO
  // ==============================

  function formatarDataInput(data: string): string {
    if (!data) return "";

    // Já está no formato correto
    if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
      return data;
    }

    // dd/MM/yyyy
    if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
      const [dia, mes, ano] = data.split("/");
      return `${ano}-${mes}-${dia}`;
    }

    // ISO
    if (data.includes("T")) {
      return data.substring(0, 10);
    }

    return data;
  }

  // ==============================
  // FORMATAR DATA PARA API
  // yyyy-MM-dd -> dd/MM/yyyy
  // ==============================

  function formatarData(data: string): string {
    if (!data) return "";

    const partes = data.split("-");

    if (partes.length !== 3) {
      return data;
    }

    const [ano, mes, dia] = partes;

    return `${dia}/${mes}/${ano}`;
  }

  // ==============================
  // BUSCAR SALDO
  // ==============================

  async function carregarSaldoDetentora(idDetentora: string) {
    if (!idDetentora) {
      setSaldoDetentora(null);
      return;
    }

    try {
      setLoadingSaldo(true);

      const response = await api.get<SaldoDetentora>(
        "/detentora/saldo",
        {
          params: {
            id: idDetentora,
          },
        }
      );

      setSaldoDetentora(response.data);
    } catch (error) {
      console.error("Erro ao buscar saldo:", error);
      setSaldoDetentora(null);
    } finally {
      setLoadingSaldo(false);
    }
  }

  // ==============================
  // CARREGAR LISTAS + CRONOGRAMA
  // ==============================

  useEffect(() => {
    if (!id) return;

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
          api.get("/local"),
          api.get("/bloco"),
          api.get("/sala"),
          api.get("/professor"),
          api.get("/formatura"),
          api.get("/detentora"),

          // BUSCA O CRONOGRAMA
          api.get(`/cronograma/${id}`),
        ]);

        setLocaisList(locaisRes.data);
        setBlocos(blocoRes.data);
        setSalas(salasRes.data);
        setProfessores(profRes.data);
        setFormaturas(formRes.data);
        setDetentoras(detRes.data);

        const cronograma = cronogramaRes.data;

        console.log("CRONOGRAMA PARA EDITAR:", cronograma);

        // ==============================
        // PREENCHER FORMULÁRIO
        // ==============================

        setBloco(cronograma.bloco_id ?? "");

        setDetentoras_id(
          cronograma.detentoras_id ??
          cronograma.detentora_id ??
          ""
        );

        setProfessor(cronograma.professor_id ?? "");

        setLocal(cronograma.local_id ?? "");

        setSala(cronograma.sala_id ?? "");

        setFormatura(cronograma.formatura_id ?? "");

        setTema(cronograma.tema ?? "");

        setDataInicio(
          formatarDataInput(cronograma.data_inicio)
        );

        setDataFim(
          formatarDataInput(cronograma.data_fim)
        );

        setHorario(cronograma.hora_inicio ?? "");

        setHorarioFim(cronograma.hora_fim ?? "");

        setQtdeAlunos(
          cronograma.quantidade_aluno != null
            ? String(cronograma.quantidade_aluno)
            : ""
        );

        setObservacao(
          cronograma.especificacao ?? ""
        );

        setStatus(
          cronograma.is_status ?? ""
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
        // IDENTIFICAR PERÍODO
        // ==============================

        const horaInicio = cronograma.hora_inicio;

        if (horaInicio === "08:00") {
          setPeriodo("manha");
        } else if (horaInicio === "13:00") {
          setPeriodo("tarde");
        } else if (horaInicio === "18:00") {
          setPeriodo("noite");
        }

        // ==============================
        // CARREGAR SALDO
        // ==============================

        const idSaldo =
          cronograma.detentoras_id ??
          cronograma.detentora_id;

        if (idSaldo) {
          await carregarSaldoDetentora(idSaldo);
        }
      } catch (error) {
        console.error(
          "Erro ao carregar cronograma:",
          error
        );

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

  const salasFiltradas = salas.filter(
    (sala) =>
      sala.local_id === local_id
  );

  // ==============================
  // SALVAR ALTERAÇÕES
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
        "Selecione o curso da ATA."
      );

      return;
    }

    if (
      saldoDetentora &&
      saldoDetentora.saldo <= 0
    ) {
      toast.error(
        "Esta detentora não possui saldo disponível."
      );

      return;
    }

    const payload = {
      bloco_id: bloco_id || null,

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

      tema,

      is_status,

      especificacao:
        especificacao.trim(),

      publicar,

      draft,

      quantidade_aluno:
        quantidade_aluno || null,

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
      "================================="
    );

    try {
      setSalvando(true);

      // ==============================
      // PUT
      // ==============================

      await api.put(
        `/cronograma/${id}`,
        payload
      );

      toast.success(
        "Cronograma atualizado com sucesso!"
      );

      // Voltar para a lista
      setTimeout(() => {
        router.push("/cronograma");
      }, 700);
    } catch (error: unknown) {
      console.error(
        "Erro ao atualizar cronograma:",
        error
      );

      if (axios.isAxiosError(error)) {
        console.error(
          "STATUS:",
          error.response?.status
        );

        console.error(
          "RESPOSTA:",
          error.response?.data
        );

        toast.error(
          error.response?.data?.message ||
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
      <div className="min-h-screen flex items-center justify-center bg-gray-100">
        <div className="text-gray-600">
          Carregando cronograma...
        </div>
      </div>
    );
  }

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">

      <div className="w-full max-w-6xl bg-white shadow-xl rounded-2xl p-6">

        <h2 className="text-2xl font-semibold text-center mb-6">
          Editar Cronograma
        </h2>

        <form
          onSubmit={handleSubmit}
          className="grid grid-cols-2 gap-4"
        >

          {/* ==============================
              BLOCO
          ============================== */}

          <div>
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

              {blocoCurso.map((bloco) => (
                <option
                  key={bloco.id}
                  value={bloco.id}
                >
                  {bloco.bloco_Curso}
                </option>
              ))}
            </select>
          </div>

          {/* ==============================
              STATUS
          ============================== */}

          <div>
            <input
              value={is_status}
              onChange={(e) =>
                setStatus(e.target.value)
              }
              className="
                w-full
                px-3
                py-2
                border
                rounded-lg
              "
              placeholder="Status"
            />
          </div>

          {/* ==============================
              LOCAL
          ============================== */}

          <div>
            <select
              value={local_id}
              onChange={(e) => {
                setLocal(e.target.value);

                // Ao mudar o local,
                // limpa a sala
                setSala("");
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
                Selecione o local
              </option>

              {locaisList.map((local) => (
                <option
                  key={local.id}
                  value={local.id}
                >
                  {local.polo}
                </option>
              ))}
            </select>
          </div>

          {/* ==============================
              SALA
          ============================== */}

          <div>
            <select
              value={sala_id}
              onChange={(e) =>
                setSala(e.target.value)
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

              {salasFiltradas.map((sala) => (
                <option
                  key={sala.id}
                  value={sala.id}
                >
                  {sala.numero_sala}

                  {sala.tipo_uso
                    ? ` - ${sala.tipo_uso}`
                    : ""}
                </option>
              ))}
            </select>
          </div>

          {/* ==============================
              DETENTORA / CURSO
          ============================== */}

          <div>
            <select
              value={detentoras_id}
              onChange={async (e) => {
                const idSelecionado =
                  e.target.value;

                setDetentoras_id(
                  idSelecionado
                );

                await carregarSaldoDetentora(
                  idSelecionado
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
                    a.curso?.nome_curso ||
                    ""
                  ).localeCompare(
                    b.curso?.nome_curso ||
                      "",
                    "pt-BR",
                    {
                      sensitivity: "base",
                    }
                  )
                )
                .map((detentora) => (
                  <option
                    key={detentora.id}
                    value={detentora.id}
                  >
                    {(
                      detentora.curso
                        ?.nome_curso ||
                      "SEM CURSO"
                    ).toUpperCase()}

                    {" - ATA "}

                    {(
                      detentora.ata
                        ?.numero_ata ||
                      "SEM ATA"
                    ).toUpperCase()}
                  </option>
                ))}
            </select>
          </div>

          {/* ==============================
              PROFESSOR
          ============================== */}

          <div>
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

          {/* ==============================
              TEMA
          ============================== */}

          <div className="col-span-2">

            <input
              value={tema}
              onChange={(e) =>
                setTema(e.target.value)
              }
              className="
                w-full
                px-3
                py-2
                border
                rounded-lg
              "
              placeholder="Tema do curso"
            />

          </div>

          {/* ==============================
              SALDO
          ============================== */}

          {loadingSaldo && (
            <div className="col-span-2 text-sm text-gray-500">
              Consultando saldo...
            </div>
          )}

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
                        saldoDetentora.saldo <=
                        0
                          ? "bg-red-600"
                          : saldoDetentora.saldo <=
                            5
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
              ALERTA SALDO
          ============================== */}

          {saldoDetentora &&
            saldoDetentora.saldo <= 0 && (
              <div
                className="
                  col-span-2
                  bg-red-100
                  border
                  border-red-300
                  rounded-lg
                  p-4
                "
              >

                <h2
                  className="
                    text-red-700
                    font-bold
                  "
                >
                  Atenção
                </h2>

                <p className="text-red-600">
                  Esta detentora não possui
                  saldo disponível para criar
                  novos cronogramas.
                </p>

              </div>
            )}

          {/* ==============================
              DATAS / PERÍODO / HORÁRIOS
          ============================== */}

          <div
            className="
              col-span-2
              grid
              grid-cols-5
              gap-4
            "
          >

            {/* DATA INÍCIO */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Data Início
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

            {/* DATA FIM */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Data Fim
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

            {/* PERÍODO */}

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
                  Selecione o período
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

            {/* HORA INÍCIO */}

            <div>

              <label className="block text-sm font-medium mb-1">
                Hora Início
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

            {/* HORA FIM */}

            <div>

              <label className="block text-sm font-medium mb-1">
                Hora Fim
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
              QUANTIDADE / FORMATURA
          ============================== */}

          <div
            className="
              col-span-2
              grid
              grid-cols-2
              gap-6
            "
          >

            <div>

              <input
                value={quantidade_aluno}
                onChange={(e) =>
                  setQtdeAlunos(
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
                placeholder="Quantidade"
              />

            </div>

            <div>

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
                      key={
                        formatura.id
                      }
                      value={
                        formatura.id
                      }
                    >
                      {
                        formatura.data_formatura
                      }
                    </option>
                  )
                )}

              </select>

            </div>

          </div>

          {/* ==============================
              ESPECIFICAÇÃO
          ============================== */}

          <div className="col-span-2">

            <textarea
              rows={2}
              value={especificacao}
              onChange={(e) =>
                setObservacao(
                  e.target.value
                )
              }
              className="
                w-full
                px-3
                py-2
                border
                rounded-lg
                resize-none
              "
              placeholder="Especificação / Observações"
            />

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
                type="url"
                value={link_inscricao}
                onChange={(e) =>
                  setLink_inscricao(
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
                placeholder="https://..."
              />

            </div>

            {/* IMAGEM */}

            <div className="flex-1">

              <label
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
                type="url"
                value={imagemUrl}
                onChange={(e) => {
                  setImagemUrl(
                    e.target.value
                  );

                  setImagemValida(true);
                }}
                className="
                  w-full
                  px-3
                  py-2
                  border
                  rounded-lg
                "
                placeholder="https://exemplo.com/imagem.jpg"
              />

              <p
                className="
                  mt-1
                  text-xs
                  text-gray-500
                "
              >
                Informe a URL de uma
                imagem pública.
              </p>

              {imagemUrl.trim() !== "" &&
                !imagemValida && (
                  <div
                    className="
                      mt-2
                      p-2
                      rounded-lg
                      border
                      border-red-300
                      bg-red-50
                      text-red-600
                      text-sm
                    "
                  >
                    Não foi possível
                    carregar essa imagem.
                  </div>
                )}

            </div>

          </div>

          {/* ==============================
              DRAFT / PUBLICAR / BOTÃO
          ============================== */}

          <div
            className="
              col-span-2
              flex
              items-center
              justify-between
              mt-2
            "
          >

            {/* ESQUERDA */}

            <div
              className="
                flex
                items-center
                gap-6
              "
            >

              <label
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
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
                />

                Rascunho (Draft)

              </label>

              <label
                className="
                  flex
                  items-center
                  gap-2
                  text-sm
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
                />

                Publicar

              </label>

            </div>

            {/* DIREITA */}

            <button
              type="submit"
              disabled={
                salvando ||
                loadingSaldo
              }
              className={`
                px-6
                py-3
                text-white
                rounded-lg
                font-semibold
                transition

                ${
                  salvando ||
                  loadingSaldo
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }
              `}
            >

              {salvando
                ? "Salvando..."
                : "Salvar Alterações"}

            </button>

          </div>

        </form>

      </div>

    </div>
  );
}
