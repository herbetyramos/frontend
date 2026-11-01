"use client";

import React, { useEffect, useMemo, useState } from "react";
import { useParams, useRouter } from "next/navigation";
import axios from "axios";
import { toast } from "react-toastify";
import { api } from "@/services/api";

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
  curso?: {
    id: string;
    nome_curso: string;
  } | null;
  ata?: {
    id: string;
    numero_ata: string;
  } | null;
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

type CronogramaData = {
  bloco_id?: string | null;
  detentoras_id?: string | null;
  detentora_id?: string | null;
  professor_id?: string | null;
  local_id?: string | null;
  sala_id?: string | null;
  formatura_id?: string | null;
  tema?: string | null;
  data_inicio?: string | null;
  data_fim?: string | null;
  hora_inicio?: string | null;
  hora_fim?: string | null;
  quantidade_aluno?: string | number | null;
  especificacao?: string | null;
  is_status?: string | null;
  publicar?: boolean | null;
  draft?: boolean | null;
  link_inscricao?: string | null;
  imagem_url?: string | null;
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 placeholder:text-gray-400 focus:outline-none focus:ring-2 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-500";
const labelClass =
  "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

function formatarDataInput(data?: string | null): string {
  if (!data) return "";
  const valor = data.trim();

  if (/^\d{4}-\d{2}-\d{2}$/.test(valor)) return valor;
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(valor)) {
    const [dia, mes, ano] = valor.split("/");
    return `${ano}-${mes}-${dia}`;
  }
  if (valor.includes("T")) return valor.substring(0, 10);

  const dataValida = new Date(valor);
  if (!Number.isNaN(dataValida.getTime())) {
    const ano = dataValida.getFullYear();
    const mes = String(dataValida.getMonth() + 1).padStart(2, "0");
    const dia = String(dataValida.getDate()).padStart(2, "0");
    return `${ano}-${mes}-${dia}`;
  }
  return "";
}

function formatarData(data: string): string {
  if (!data) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return data;

  const partes = data.split("-");
  if (partes.length !== 3) return data;

  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}

function obterMensagemErro(error: unknown): string {
  if (axios.isAxiosError<{ message?: string }>(error)) {
    return error.response?.data?.message || "Erro ao atualizar cronograma.";
  }
  return "Erro ao atualizar cronograma.";
}

export default function Cronograma() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const id = params?.id;

  const [locaisList, setLocaisList] = useState<LocalType[]>([]);
  const [blocoCurso, setBlocos] = useState<BlocoType[]>([]);
  const [salas, setSalas] = useState<SalaType[]>([]);
  const [professores, setProfessores] = useState<ProfessorType[]>([]);
  const [detentoras, setDetentoras] = useState<DetentoraType[]>([]);
  const [formaturas, setFormaturas] = useState<FormaturaType[]>([]);

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
  const [imagemUrl, setImagemUrl] = useState("");
  const [imagemValida, setImagemValida] = useState(true);

  const [saldoDetentora, setSaldoDetentora] =
    useState<SaldoDetentora | null>(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [mostrarSaldo, setMostrarSaldo] = useState(false);
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);

  function handlePeriodo(value: string) {
    setPeriodo(value);
    if (value === "manha") {
      setHorario("08:00");
      setHorarioFim("12:00");
    } else if (value === "tarde") {
      setHorario("13:00");
      setHorarioFim("17:00");
    } else if (value === "noite") {
      setHorario("18:00");
      setHorarioFim("22:00");
    }
  }

  async function carregarSaldoDetentora(idDetentora: string) {
    if (!idDetentora) {
      setSaldoDetentora(null);
      return;
    }

    try {
      setLoadingSaldo(true);
      const response = await api.get<SaldoDetentora>("/detentora/saldo", {
        params: { id: idDetentora },
      });
      setSaldoDetentora(response.data);
    } catch (error: unknown) {
      console.error("Erro ao buscar saldo:", error);
      setSaldoDetentora(null);
      toast.error("Não foi possível consultar o saldo da detentora.");
    } finally {
      setLoadingSaldo(false);
    }
  }

  useEffect(() => {
    if (!id) return;

    let ativo = true;

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
          api.get<ProfessorType[]>("/professor"),
          api.get<FormaturaType[]>("/formatura"),
          api.get<DetentoraType[]>("/detentora"),
          api.get<CronogramaData>(`/cronograma/${id}`),
        ]);

        if (!ativo) return;

        setLocaisList(locaisRes.data);
        setBlocos(blocoRes.data);
        setSalas(salasRes.data);
        setProfessores(profRes.data);
        setFormaturas(formRes.data);
        setDetentoras(detRes.data);

        const cronograma = cronogramaRes.data;

        setBloco(cronograma.bloco_id ?? "");
        const detentoraId =
          cronograma.detentoras_id ?? cronograma.detentora_id ?? "";
        setDetentoras_id(detentoraId);
        setProfessor(cronograma.professor_id ?? "");
        setLocal(cronograma.local_id ?? "");
        setSala(cronograma.sala_id ?? "");
        setFormatura(cronograma.formatura_id ?? "");
        setTema(cronograma.tema ?? "");
        setDataInicio(formatarDataInput(cronograma.data_inicio));
        setDataFim(formatarDataInput(cronograma.data_fim));
        setHorario(cronograma.hora_inicio?.slice(0, 5) ?? "");
        setHorarioFim(cronograma.hora_fim?.slice(0, 5) ?? "");
        setQtdeAlunos(
          cronograma.quantidade_aluno != null
            ? String(cronograma.quantidade_aluno)
            : "",
        );
        setObservacao(cronograma.especificacao ?? "");
        setStatus(cronograma.is_status ?? "");
        setPublicar(Boolean(cronograma.publicar));
        setDraft(Boolean(cronograma.draft));
        setLink_inscricao(cronograma.link_inscricao ?? "");
        setImagemUrl(cronograma.imagem_url ?? "");

        const horaInicio = cronograma.hora_inicio?.slice(0, 5);
        if (horaInicio === "08:00") setPeriodo("manha");
        else if (horaInicio === "13:00") setPeriodo("tarde");
        else if (horaInicio === "18:00") setPeriodo("noite");
        else setPeriodo("");

        if (detentoraId) {
          try {
            const saldoRes = await api.get<SaldoDetentora>(
              "/detentora/saldo",
              { params: { id: detentoraId } },
            );
            if (ativo) setSaldoDetentora(saldoRes.data);
          } catch (error: unknown) {
            console.error("Erro ao carregar saldo:", error);
          }
        }
      } catch (error: unknown) {
        console.error("Erro ao carregar cronograma:", error);
        if (ativo) toast.error("Erro ao carregar o cronograma.");
      } finally {
        if (ativo) setLoading(false);
      }
    }

    void loadData();
    return () => {
      ativo = false;
    };
  }, [id]);

  const salasFiltradas = useMemo(
    () => salas.filter((sala) => sala.local_id === local_id),
    [salas, local_id],
  );

  const detentorasOrdenadas = useMemo(() => {
    const unicas = new Map<string, DetentoraType>();

    detentoras.forEach((detentora) => {
      const nomeCurso =
        detentora.curso?.nome_curso?.trim().toUpperCase() || "SEM CURSO";
      const numeroAta =
        detentora.ata?.numero_ata?.trim().toUpperCase() || "SEM ATA";
      const chave = `${nomeCurso}__${numeroAta}`;
      if (!unicas.has(chave)) unicas.set(chave, detentora);
    });

    return Array.from(unicas.values()).sort((a, b) =>
      (a.curso?.nome_curso || "").localeCompare(
        b.curso?.nome_curso || "",
        "pt-BR",
        { sensitivity: "base" },
      ),
    );
  }, [detentoras]);

  async function handleSubmit(e: React.FormEvent<HTMLFormElement>) {
    e.preventDefault();

    if (!id) {
      toast.error("ID do cronograma não encontrado.");
      return;
    }
    if (!detentoras_id) {
      toast.error("Selecione o curso da ATA.");
      return;
    }
    if (saldoDetentora && saldoDetentora.saldo <= 0) {
      toast.error("Esta detentora não possui saldo disponível.");
      return;
    }
    if (data_inicio && data_fim && data_fim < data_inicio) {
      toast.error("A data final não pode ser anterior à data inicial.");
      return;
    }

    const payload = {
      bloco_id: bloco_id || null,
      detentoras_id: detentoras_id || null,
      professor_id: professor_id || null,
      local_id: local_id || null,
      sala_id: sala_id || null,
      formatura_id: formatura_id || null,
      data_inicio: formatarData(data_inicio),
      data_fim: formatarData(data_fim),
      hora_inicio: hora_inicio || null,
      hora_fim: hora_fim || null,
      tema: tema.trim(),
      is_status: is_status.trim(),
      especificacao: especificacao.trim(),
      publicar,
      draft,
      quantidade_aluno: quantidade_aluno.trim()
        ? Number(quantidade_aluno)
        : null,
      link_inscricao: link_inscricao.trim() || null,
      imagem_url: imagemUrl.trim() || null,
    };

    try {
      setSalvando(true);
      await api.put(`/cronograma/${id}`, payload);
      toast.success("Cronograma atualizado com sucesso!");
      router.push("/cronograma");
    } catch (error: unknown) {
      console.error("Erro ao atualizar cronograma:", error);
      if (axios.isAxiosError(error)) {
        console.error("STATUS:", error.response?.status);
        console.error("RESPOSTA:", error.response?.data);
      }
      toast.error(obterMensagemErro(error));
    } finally {
      setSalvando(false);
    }
  }

  if (loading) {
    return (
      <div className="flex min-h-screen items-center justify-center bg-gray-100 p-6 dark:bg-gray-950">
        <div className="text-gray-600 dark:text-gray-300">
          Carregando cronograma...
        </div>
      </div>
    );
  }

  return (
    <main className="min-h-screen bg-gray-100 p-4 text-gray-900 dark:bg-gray-950 dark:text-gray-100 sm:p-6">
      <div className="mx-auto w-full max-w-6xl rounded-2xl bg-white p-5 shadow-xl dark:bg-gray-900 sm:p-6">
        <h1 className="mb-6 text-center text-2xl font-semibold text-gray-900 dark:text-gray-100">
          Editar Cronograma
        </h1>

        <form onSubmit={handleSubmit} className="grid grid-cols-1 gap-5 md:grid-cols-2">
          <div>
            <label htmlFor="bloco_id" className={labelClass}>Bloco</label>
            <select id="bloco_id" value={bloco_id} onChange={(e) => setBloco(e.target.value)} className={inputClass}>
              <option value="">Selecione o bloco</option>
              {blocoCurso.map((bloco) => (
                <option key={bloco.id} value={bloco.id}>{bloco.bloco_Curso}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="is_status" className={labelClass}>Status</label>
            <select id="is_status" value={is_status} onChange={(e) => setStatus(e.target.value)} className={inputClass}>
              <option value="">Selecione o status</option>
              <option value="ativo">Ativo</option>
              <option value="cancelado">Cancelado</option>
              <option value="suspenso">Suspenso</option>
            </select>
          </div>

          <div>
            <label htmlFor="local_id" className={labelClass}>Local</label>
            <select id="local_id" value={local_id} onChange={(e) => { setLocal(e.target.value); setSala(""); }} className={inputClass}>
              <option value="">Selecione o local</option>
              {locaisList.map((local) => (
                <option key={local.id} value={local.id}>{local.polo}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="sala_id" className={labelClass}>Sala</label>
            <select id="sala_id" value={sala_id} onChange={(e) => setSala(e.target.value)} className={inputClass}>
              <option value="">Selecione a sala</option>
              {salasFiltradas.map((sala) => (
                <option key={sala.id} value={sala.id}>
                  {sala.numero_sala}{sala.tipo_uso ? ` - ${sala.tipo_uso}` : ""}
                </option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="detentoras_id" className={labelClass}>Detentora / Curso da ATA</label>
            <select
              id="detentoras_id"
              value={detentoras_id}
              onChange={async (e) => {
                const selecionado = e.target.value;
                setDetentoras_id(selecionado);
                await carregarSaldoDetentora(selecionado);
              }}
              className={inputClass}
              required
            >
              <option value="">Selecione o curso da ATA</option>
              {detentorasOrdenadas.map((detentora) => (
                <option key={detentora.id} value={detentora.id}>
                  {(detentora.curso?.nome_curso || "SEM CURSO").toUpperCase()}
                  {" - ATA "}
                  {(detentora.ata?.numero_ata || "SEM ATA").toUpperCase()}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="professor_id" className={labelClass}>Professor</label>
            <select id="professor_id" value={professor_id} onChange={(e) => setProfessor(e.target.value)} className={inputClass}>
              <option value="">Selecione o professor</option>
              {professores.map((professor) => (
                <option key={professor.id} value={professor.id}>{professor.nome_professor}</option>
              ))}
            </select>
          </div>

          <div>
            <label htmlFor="quantidade_aluno" className={labelClass}>Quantidade de alunos</label>
            <input id="quantidade_aluno" type="number" min="0" value={quantidade_aluno} onChange={(e) => setQtdeAlunos(e.target.value)} className={inputClass} placeholder="Quantidade" />
          </div>

          <div className="md:col-span-2">
            <label htmlFor="tema" className={labelClass}>Tema do curso</label>
            <input
              id="tema"
              type="text"
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              className={inputClass}
              placeholder="Tema do curso"
              required
            />
          </div>

          {loadingSaldo && (
            <p className="md:col-span-2 text-sm text-gray-500 dark:text-gray-400">Consultando saldo...</p>
          )}

          {saldoDetentora && (
            <section className="md:col-span-2 overflow-hidden rounded-xl border border-blue-300 bg-white shadow dark:border-gray-700 dark:bg-gray-800">
              <button type="button" onClick={() => setMostrarSaldo((atual) => !atual)} className="flex w-full items-center justify-between bg-blue-50 px-5 py-4 text-left dark:bg-blue-950/40">
                <span className="text-lg font-bold text-blue-700 dark:text-blue-300">Saldo da detentora</span>
                <span className={`rounded-full px-3 py-1 font-bold text-white ${saldoDetentora.saldo <= 0 ? "bg-red-600" : saldoDetentora.saldo <= 5 ? "bg-yellow-500 text-gray-900" : "bg-green-600"}`}>
                  {saldoDetentora.saldo} turma(s)
                </span>
              </button>
              {mostrarSaldo && (
                <div className="grid grid-cols-1 gap-5 p-5 sm:grid-cols-3">
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Empresa</p>
                    <strong>{saldoDetentora.empresa}</strong>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Contratado</p>
                    <strong className="text-2xl text-blue-600 dark:text-blue-300">{saldoDetentora.contratado}</strong>
                  </div>
                  <div>
                    <p className="text-sm text-gray-500 dark:text-gray-400">Utilizadas</p>
                    <strong className="text-2xl text-orange-600 dark:text-orange-400">{saldoDetentora.utilizadas}</strong>
                  </div>
                </div>
              )}
            </section>
          )}

          {saldoDetentora && saldoDetentora.saldo <= 0 && (
            <div className="md:col-span-2 rounded-lg border border-red-300 bg-red-100 p-4 text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">
              <h2 className="font-bold">Atenção</h2>
              <p>Esta detentora não possui saldo disponível para novos cronogramas.</p>
            </div>
          )}

          <div>
            <label htmlFor="data_inicio" className={labelClass}>Data de início</label>
            <input id="data_inicio" type="date" value={data_inicio} onChange={(e) => setDataInicio(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="data_fim" className={labelClass}>Data de fim</label>
            <input id="data_fim" type="date" value={data_fim} onChange={(e) => setDataFim(e.target.value)} min={data_inicio || undefined} className={inputClass} />
          </div>

          <div>
            <label htmlFor="periodo" className={labelClass}>Período</label>
            <select id="periodo" value={periodo} onChange={(e) => handlePeriodo(e.target.value)} className={inputClass}>
              <option value="">Selecione o período</option>
              <option value="manha">Manhã</option>
              <option value="tarde">Tarde</option>
              <option value="noite">Noite</option>
            </select>
          </div>

          <div>
            <label htmlFor="hora_inicio" className={labelClass}>Hora de início</label>
            <input id="hora_inicio" type="time" value={hora_inicio} onChange={(e) => setHorario(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="hora_fim" className={labelClass}>Hora de fim</label>
            <input id="hora_fim" type="time" value={hora_fim} onChange={(e) => setHorarioFim(e.target.value)} className={inputClass} />
          </div>

          <div>
            <label htmlFor="formatura_id" className={labelClass}>Data da formatura</label>
            <select id="formatura_id" value={formatura_id} onChange={(e) => setFormatura(e.target.value)} className={inputClass}>
              <option value="">Selecione a formatura</option>
              {formaturas.map((formatura) => (
                <option key={formatura.id} value={formatura.id}>{formatura.data_formatura}</option>
              ))}
            </select>
          </div>

          <div className="md:col-span-2">
            <label htmlFor="especificacao" className={labelClass}>Especificação / Observações</label>
            <textarea id="especificacao" rows={3} value={especificacao} onChange={(e) => setObservacao(e.target.value)} className={`${inputClass} resize-y`} placeholder="Especificação / Observações" />
          </div>

          <div>
            <label htmlFor="link_inscricao" className={labelClass}>Link de inscrição</label>
            <input id="link_inscricao" type="url" value={link_inscricao} onChange={(e) => setLink_inscricao(e.target.value)} className={inputClass} placeholder="https://..." />
          </div>

          <div>
            <label htmlFor="imagemUrl" className={labelClass}>URL da imagem do curso</label>
            <input
              id="imagemUrl"
              type="url"
              value={imagemUrl}
              onChange={(e) => { setImagemUrl(e.target.value); setImagemValida(true); }}
              onBlur={() => {
                if (!imagemUrl.trim()) {
                  setImagemValida(true);
                  return;
                }
                try {
                  const url = new URL(imagemUrl);
                  setImagemValida(url.protocol === "http:" || url.protocol === "https:");
                } catch {
                  setImagemValida(false);
                }
              }}
              className={inputClass}
              placeholder="https://exemplo.com/imagem.jpg"
            />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Informe a URL pública de uma imagem.</p>
            {!imagemValida && (
              <p className="mt-2 rounded-lg border border-red-300 bg-red-50 p-2 text-sm text-red-600 dark:border-red-800 dark:bg-red-950/30 dark:text-red-300">
                Informe uma URL válida começando com http:// ou https://.
              </p>
            )}
          </div>

          <div className="md:col-span-2 flex flex-col gap-4 border-t border-gray-200 pt-5 dark:border-gray-700 sm:flex-row sm:items-center sm:justify-between">
            <div className="flex flex-wrap items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800" />
                Rascunho (Draft)
              </label>
              <label className="flex items-center gap-2 text-sm">
                <input type="checkbox" checked={publicar} onChange={(e) => setPublicar(e.target.checked)} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800" />
                Publicar
              </label>
            </div>

            <div className="flex flex-col gap-3 sm:flex-row">
              <button type="button" onClick={() => router.push("/cronograma")} className="rounded-lg border border-gray-300 px-6 py-3 font-semibold text-gray-700 transition hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">
                Cancelar
              </button>
              <button
                type="submit"
                disabled={salvando || loadingSaldo || !imagemValida || Boolean(saldoDetentora && saldoDetentora.saldo <= 0)}
                className={`rounded-lg px-6 py-3 font-semibold text-white transition ${salvando || loadingSaldo || !imagemValida || Boolean(saldoDetentora && saldoDetentora.saldo <= 0) ? "cursor-not-allowed bg-gray-400" : "bg-blue-600 hover:bg-blue-700"}`}
              >
                {salvando ? "Salvando..." : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </main>
  );
}
