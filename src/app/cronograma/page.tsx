
"use client";

import React, {
  useEffect,
  useState,
} from "react";

import { api } from "@/services/api";
import { toast } from "react-toastify";

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

  curso: {
    id: string;
    nome_curso: string;
  };

  ata: {
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
// COMPONENTE
// ==============================

export default function Cronograma() {
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

  const [is_status, setStatus] =
    useState("ativo");

  const [periodo, setPeriodo] =
    useState("");

  const [link_inscricao, setLink_inscricao] =
    useState("");

  // ==============================
  // NOVO CAMPO: IMAGEM
  // ==============================

  const [imagemUrl, setImagemUrl] =
    useState("");

  const [imagemValida, setImagemValida] =
    useState(true);

  const [mostrarSaldo, setMostrarSaldo] =
    useState(false);

  // ==============================
  // SALDO DETENTORA
  // ==============================

  const [saldoDetentora, setSaldoDetentora] =
    useState<SaldoDetentora | null>(null);

  const [loadingSaldo, setLoadingSaldo] =
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
  // BUSCAR SALDO DETENTORA
  // ==============================

  async function carregarSaldoDetentora(id: string) {
  if (!id) {
    setSaldoDetentora(null);
    return;
  }

  try {
    setLoadingSaldo(true);

    console.log("ID DA DETENTORA SELECIONADA:", id);

    const response =
      await api.get<SaldoDetentora>(
        "/detentora/saldo",
        {
          params: {
            id,
          },
        }
      );

    console.log(
      "SALDO RETORNADO:",
      response.data
    );

    setSaldoDetentora(response.data);
  } catch (error: unknown) {
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
  // CARREGAR DADOS
  // ==============================

  useEffect(() => {
    async function loadData() {
      try {
        const [
          locaisRes,
          blocoRes,
          salasRes,
          profRes,
          formRes,
          detRes,
        ] = await Promise.all([
          api.get<LocalType[]>("/local"),
          api.get<BlocoType[]>("/bloco"),
          api.get<SalaType[]>("/sala"),
          api.get<ProfessorType[]>("/professor"),
          api.get<FormaturaType[]>("/formatura"),
          api.get<DetentoraType[]>(
            "/detentora"
          ),
        ]);

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
      } catch (error: unknown) {
        console.error(
          "Erro ao carregar dados:",
          error
        );

        toast.error(
          "Erro ao carregar informações."
        );
      }
    }

    loadData();
  }, []);

  // ==============================
  // FORMATAR DATA
  // ==============================

  function formatarData(
    data: string
  ): string {
    if (!data) {
      return "";
    }

    const partes =
      data.split("-");

    if (partes.length !== 3) {
      return data;
    }

    const [
      ano,
      mes,
      dia,
    ] = partes;

    return `${dia}/${mes}/${ano}`;
  }

  // ==============================
  // SALVAR CRONOGRAMA
  // ==============================

  async function handleSubmit(
    e: React.FormEvent
  ) {
    e.preventDefault();

    // ==============================
    // VALIDAÇÃO SALDO
    // ==============================

    if (
      saldoDetentora &&
      saldoDetentora.saldo <= 0
    ) {
      toast.error(
        "Esta detentora não possui saldo disponível."
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

      local_id,

      sala_id,

      formatura_id,

      data_inicio:
        formatarData(
          data_inicio
        ),

      data_fim:
        formatarData(
          data_fim
        ),

      hora_inicio,

      hora_fim,

      tema,

      is_status,

      especificacao,

      publicar,

      draft,

      

      link_inscricao:
        link_inscricao.trim() !== ""
          ? link_inscricao.trim()
          : null,

      // ==============================
      // IMAGEM
      // ==============================

      imagem_url:
        imagemUrl.trim() !== ""
          ? imagemUrl.trim()
          : null,
    };

    console.log(
      "================================="
    );

    console.log(
      "PAYLOAD CRONOGRAMA:"
    );

    console.log(
      payload
    );

    console.log(
      "IMAGEM URL:",
      payload.imagem_url
    );

    console.log(
      "================================="
    );

    // ==============================
    // POST
    // ==============================

    try {
      const response =
        await api.post(
          "/cronograma",
          payload
        );

      console.log(
        "Cronograma criado:",
        response.data
      );

      toast.success(
        "Cronograma criado com sucesso!"
      );

      await carregarSaldoDetentora(
        detentoras_id
      );

      limparFormulario();
    } catch (
      error: unknown
    ) {
      console.error(
        "Erro ao salvar cronograma:",
        error
      );

      toast.error(
        "Erro ao salvar cronograma."
      );
    }
  }

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
  // LIMPAR FORMULÁRIO
  // ==============================

  function limparFormulario() {
    setBloco("");

    setDetentoras_id("");

    setProfessor("");

    setLocal("");

    setSala("");

    setFormatura("");

    setTema("");

    setDataInicio("");

    setDataFim("");

    setHorario("");

    setHorarioFim("");    

    setObservacao("");

    setStatus("ativo");

    setPeriodo("");

    setLink_inscricao("");

    setImagemUrl("");

    setImagemValida(true);

    setPublicar(false);

    setDraft(false);

    setSaldoDetentora(
      null
    );

    setMostrarSaldo(
      false
    );
  }

  // ==============================
  // RENDER
  // ==============================

  return (
    <div
      className="
        max-w-6xl
        mx-auto
        p-6
      "
    >
      <h2
        className="
          text-2xl
          font-semibold
          text-center
          mb-6
        "
      >
        Criar Cronograma
      </h2>

      <form
        onSubmit={
          handleSubmit
        }
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
          <select
            value={bloco_id}
            onChange={(e) =>
              setBloco(
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
              Selecione o bloco
            </option>

            {blocoCurso.map(
              (bloco) => (
                <option
                  key={bloco.id}
                  value={bloco.id}
                >
                  {
                    bloco.bloco_Curso
                  }
                </option>
              )
            )}
          </select>
        </div>

        {/* ==============================
            STATUS
        ============================== */}
            
          

          <select
            value={
              formatura_id
            }
            onChange={(e) =>
              setFormatura(
                e.target.value
              )
            }
            className="
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
              (
                formatura
              ) => (
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
        

        <div>
          <select
            value={is_status}
            onChange={(e) =>
              setStatus(
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
              Selecione o status
            </option>

            

            <option value="cancelado">
              Cancelado
            </option>

            <option value="prorrogado">
              Prorrogado
            </option>
          </select>
        </div>

        {/* ==============================
            LOCAL
        ============================== */}

        <div>
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
                  {
                    sala.numero_sala
                  }
                </option>
              )
            )}
          </select>
        </div>

     {/* ==============================
    DETENTORA / CURSO
============================== */}

<div>
  <select
    value={detentoras_id}
    onChange={async (e) => {
      const id = e.target.value;

      setDetentoras_id(id);

      if (!id) {
        setSaldoDetentora(null);
        return;
      }

      await carregarSaldoDetentora(id);
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
        detentoras.map((detentora) => {
          const nomeCurso =
            detentora.curso?.nome_curso
              ?.trim()
              .toUpperCase() || "SEM CURSO";

          const numeroAta =
            detentora.ata?.numero_ata
              ?.trim()
              .toUpperCase() || "SEM ATA";

          const chave =
            `${nomeCurso}__${numeroAta}`;

          return [
            chave,
            detentora,
          ];
        })
      ).values()
    )
      .sort((a, b) =>
        (
          a.curso?.nome_curso ?? ""
        ).localeCompare(
          b.curso?.nome_curso ?? "",
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
            detentora.curso?.nome_curso ??
            "SEM CURSO"
          ).toUpperCase()}
          {" - ATA "}
          {(
            detentora.ata?.numero_ata ??
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
            value={
              professor_id
            }
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
              (
                professor
              ) => (
                <option
                  key={
                    professor.id
                  }
                  value={
                    professor.id
                  }
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
                  {
                    saldoDetentora.saldo
                  }

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
                  <p
                    className="
                      text-gray-500
                      text-sm
                    "
                  >
                    Empresa
                  </p>

                  <strong>
                    {
                      saldoDetentora.empresa
                    }
                  </strong>
                </div>

                <div>
                  <p
                    className="
                      text-gray-500
                      text-sm
                    "
                  >
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
                  <p
                    className="
                      text-gray-500
                      text-sm
                    "
                  >
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
          saldoDetentora.saldo <=
            0 && (
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

              <p
                className="
                  text-red-600
                "
              >
                Esta detentora não
                possui saldo
                disponível para
                criar novos
                cronogramas.
              </p>
            </div>
          )}

        {/* ==============================
            TEMA
        ============================== */}

        
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
          <input
            type="date"
            value={
              data_inicio
            }
            onChange={(e) =>
              setDataInicio(
                e.target.value
              )
            }
            className="
              px-3
              py-2
              border
              rounded-lg
            "
          />

          <input
            type="date"
            value={
              data_fim
            }
            onChange={(e) =>
              setDataFim(
                e.target.value
              )
            }
            className="
              px-3
              py-2
              border
              rounded-lg
            "
          />

          <select
            value={periodo}
            onChange={(e) =>
              handlePeriodo(
                e.target.value
              )
            }
            className="
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

          <input
            type="time"
            value={
              hora_inicio
            }
            onChange={(e) =>
              setHorario(
                e.target.value
              )
            }
            className="
              px-3
              py-2
              border
              rounded-lg
            "
          />

          <input
            type="time"
            value={
              hora_fim
            }
            onChange={(e) =>
              setHorarioFim(
                e.target.value
              )
            }
            className="
              px-3
              py-2
              border
              rounded-lg
            "
          />
        </div>

        {/* ==============================
            QUANTIDADE / FORMATURA
        ============================== */}

  

        {/* ==============================
            OBSERVAÇÃO
        ============================== */}

        <textarea
          rows={1}
          value={
            especificacao
          }
          onChange={(e) =>
            setObservacao(
              e.target.value
            )
          }
          placeholder="Especificação / Observações"
          className="
            col-span-2
            px-3
            py-2
            border
            rounded-lg
          "
        />
{/* ==============================
    LINK + IMAGEM + PREVIEW
============================== */}

<div
  className="
    col-span-2
    grid
    grid-cols-1
    md:grid-cols-3
    gap-6
  "
>
  {/* ==============================
      LINK INSCRIÇÃO
  ============================== */}

  <div>
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
        setLink_inscricao(e.target.value)
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

  {/* ==============================
      URL DA IMAGEM
  ============================== */}

  <div>
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
        setImagemUrl(e.target.value);
        setImagemValida(true);
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

    {/* ERRO DA IMAGEM */}

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
          Verifique se a URL está correta.
        </div>
      )}
  </div>

  {/* ==============================
      PREVIEW DA IMAGEM
  ============================== */}

  <div>
    <p
      className="
        text-sm
        font-medium
        mb-2
      "
    >
      Pré-visualização:
    </p>

    {imagemUrl.trim() !== "" && (
      <div
        className="
          w-full
          h-48
          overflow-hidden
          rounded-lg
          border
          bg-gray-100
        "
      >
        {React.createElement(
          "img",
          {
            src: imagemUrl,
            alt:
              "Pré-visualização da imagem do curso",

            className:
              "w-full h-full object-cover",

            onLoad: () => {
              setImagemValida(true);
            },

            onError: () => {
              setImagemValida(false);
            },
          }
        )}
      </div>
    )}
  </div>
</div>
        {/* ==============================
            CHECKBOX
        ============================== */}

        <div
          className="
            col-span-2
            flex
            gap-6
          "
        >
          <label>
            <input
              type="checkbox"
              checked={
                draft
              }
              onChange={(e) =>
                setDraft(
                  e.target.checked
                )
              }
            />

            {" "}Rascunho
          </label>

          <label>
            <input
              type="checkbox"
              checked={
                publicar
              }
              onChange={(e) =>
                setPublicar(
                  e.target.checked
                )
              }
            />

            {" "}Publicar
          </label>
        </div>

        {/* ==============================
            BOTÃO
        ============================== */}

        <div
          className="
            col-span-2
            flex
            justify-end
          "
        >
          <button
            type="submit"
            disabled={
              loadingSaldo ||
              !detentoras_id ||
              (
                saldoDetentora !==
                  null &&
                saldoDetentora.saldo <=
                  0
              )
            }
            className={`
              px-6
              py-3
              rounded-lg
              text-white
              font-semibold

              ${
                loadingSaldo ||
                (
                  saldoDetentora &&
                  saldoDetentora.saldo <=
                    0
                )
                  ? "bg-gray-400"
                  : "bg-blue-600 hover:bg-blue-700"
              }
            `}
          >
            {loadingSaldo
              ? "Consultando saldo..."
              : "Salvar Cronograma"}
          </button>
        </div>
      </form>
    </div>
  );
}
