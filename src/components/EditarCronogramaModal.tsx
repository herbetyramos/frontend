"use client";

import React, { ChangeEvent, FormEvent, useEffect, useRef, useState } from "react";
import Image from "next/image";
import { api } from "@/services/api";
import { toast } from "react-toastify";
import axios from "axios";

interface CronogramaType {
  id: string;
  tema: string;
  data_inicio: string;
  data_fim: string;
  hora_inicio: string;
  hora_fim: string;
  bloco_id?: string;
  local_id?: string;
  sala_id?: string;
  professor_id?: string | null;
  formatura_id?: string | null;
  detentoras_id?: string;
  quantidade_aluno?: number | string;
  especificacao?: string | null;
  publicar?: boolean;
  draft?: boolean;
  is_status?: string;
  periodo?: string;
  link_inscricao?: string | null;
  imagem_url?: string | null;
}

interface Props {
  dados: CronogramaType;
  fechar: () => void;
  atualizarLista: () => void;
}

interface LocalType { id: string; polo: string }
interface SalaType { id: string; numero_sala: string; tipo_uso?: string; local_id?: string }
interface ProfessorType { id: string; nome_professor: string }
interface FormaturaType { id: string; data_formatura: string }
interface BlocoType { id: string; bloco_Curso: string }
interface DetentoraType {
  id: string;
  ata_id: string;
  cursos_id: string;
  curso: { id: string; nome_curso: string };
  ata: { id: string; numero_ata: string };
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

const fieldClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 shadow-sm outline-none transition placeholder:text-gray-400 focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100 dark:placeholder:text-gray-400 dark:focus:border-blue-400 dark:focus:ring-blue-400/30";
const labelClass = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-200";
const secondaryTextClass = "text-sm text-gray-500 dark:text-gray-400";

function formatarDataParaInput(data: string): string {
  if (!data) return "";
  if (/^\d{4}-\d{2}-\d{2}/.test(data)) return data.substring(0, 10);
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    const [dia, mes, ano] = data.split("/");
    return `${ano}-${mes}-${dia}`;
  }
  return data;
}

function formatarData(data: string): string {
  if (!data) return "";
  const partes = data.split("-");
  if (partes.length !== 3) return data;
  const [ano, mes, dia] = partes;
  return `${dia}/${mes}/${ano}`;
}

function formatarDataParaExibicao(data: string): string {
  if (!data) return "";
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) return data;
  if (/^\d{4}-\d{2}-\d{2}/.test(data)) {
    const [ano, mes, dia] = data.substring(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
  }
  return data;
}

function formatarHora(hora?: string | null): string {
  return hora ? hora.substring(0, 5) : "";
}

function detectarPeriodo(inicio?: string, fim?: string): string {
  const horaInicio = formatarHora(inicio);
  const horaFim = formatarHora(fim);
  if (horaInicio === "08:00" && horaFim === "12:00") return "manha";
  if (horaInicio === "13:00" && horaFim === "17:00") return "tarde";
  if (horaInicio === "18:00" && horaFim === "22:00") return "noite";
  return "";
}

function normalizarStatus(status?: string): string {
  const valor = status?.trim().toLowerCase();
  if (valor === "cancelado") return "cancelado";
  if (valor === "suspenso") return "suspenso";
  return "ativo";
}

export default function EditarCronogramaModal({ dados, fechar, atualizarLista }: Props) {
  const [locaisList, setLocaisList] = useState<LocalType[]>([]);
  const [blocoCurso, setBlocos] = useState<BlocoType[]>([]);
  const [salas, setSalas] = useState<SalaType[]>([]);
  const [professores, setProfessores] = useState<ProfessorType[]>([]);
  const [detentoras, setDetentoras] = useState<DetentoraType[]>([]);
  const [formaturas, setFormaturas] = useState<FormaturaType[]>([]);

  const [detentoras_id, setDetentoras_id] = useState(dados.detentoras_id || "");
  const [local_id, setLocal] = useState(dados.local_id || "");
  const [bloco_id, setBloco] = useState(dados.bloco_id || "");
  const [tema, setTema] = useState(dados.tema || "");
  const [data_inicio, setDataInicio] = useState(formatarDataParaInput(dados.data_inicio));
  const [data_fim, setDataFim] = useState(formatarDataParaInput(dados.data_fim));
  const [hora_inicio, setHorario] = useState(formatarHora(dados.hora_inicio));
  const [hora_fim, setHorarioFim] = useState(formatarHora(dados.hora_fim));
  const [sala_id, setSala] = useState(dados.sala_id || "");
  const [professor_id, setProfessor] = useState(dados.professor_id || "");
  const [quantidade_aluno, setQtdeAlunos] = useState<number | string>(dados.quantidade_aluno ?? "");
  const [formatura_id, setFormatura] = useState(dados.formatura_id || "");
  const [especificacao, setObservacao] = useState(dados.especificacao || "");
  const [publicar, setPublicar] = useState(dados.publicar ?? false);
  const [draft, setDraft] = useState(dados.draft ?? false);
  const [is_status, setStatus] = useState(normalizarStatus(dados.is_status));
  const [periodo, setPeriodo] = useState(dados.periodo || detectarPeriodo(dados.hora_inicio, dados.hora_fim));
  const [link_inscricao, setLink_inscricao] = useState(dados.link_inscricao || "");

  const [imagemUrl, setImagemUrl] = useState(dados.imagem_url || "");
  const [imagemOriginal] = useState(dados.imagem_url || "");
  const [imagemValida, setImagemValida] = useState(true);
  const [imagemAlterada, setImagemAlterada] = useState(false);
  const [uploadingImagem, setUploadingImagem] = useState(false);
  const inputImagemRef = useRef<HTMLInputElement>(null);

  const [saldoDetentora, setSaldoDetentora] = useState<SaldoDetentora | null>(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [mostrarSaldo, setMostrarSaldo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  async function carregarSaldoDetentora(id: string): Promise<void> {
    if (!id) {
      setSaldoDetentora(null);
      return;
    }
    try {
      setLoadingSaldo(true);
      const response = await api.get<SaldoDetentora>("/detentora/saldo", { params: { id } });
      setSaldoDetentora(response.data);
    } catch (error: unknown) {
      console.error("Erro ao buscar saldo da detentora:", error);
      setSaldoDetentora(null);
    } finally {
      setLoadingSaldo(false);
    }
  }

  useEffect(() => {
    let ativo = true;
    async function loadData(): Promise<void> {
      try {
        const [locaisRes, blocoRes, salasRes, profRes, forRes, detRes] = await Promise.all([
          api.get<LocalType[]>("/local"),
          api.get<BlocoType[]>("/bloco"),
          api.get<SalaType[]>("/sala"),
          api.get<ProfessorType[]>("/professor"),
          api.get<FormaturaType[]>("/formatura"),
          api.get<DetentoraType[]>("/detentora"),
        ]);
        if (!ativo) return;
        setLocaisList(locaisRes.data);
        setBlocos(blocoRes.data);
        setSalas(salasRes.data);
        setProfessores(profRes.data);
        setFormaturas(forRes.data);
        setDetentoras(detRes.data);
        if (dados.detentoras_id) await carregarSaldoDetentora(dados.detentoras_id);
      } catch (error: unknown) {
        console.error("Erro ao carregar dados:", error);
        if (ativo) toast.error("Erro ao carregar informações.");
      }
    }
    void loadData();
    return () => { ativo = false; };
  }, [dados.detentoras_id]);

  const salasFiltradas = salas.filter((sala) => !sala.local_id || sala.local_id === local_id);
  const detentorasUnicas = Array.from(
    new Map(detentoras.map((detentora) => {
      const nomeCurso = detentora.curso?.nome_curso?.trim().toUpperCase() || "SEM CURSO";
      const numeroAta = detentora.ata?.numero_ata?.trim().toUpperCase() || "SEM ATA";
      return [`${nomeCurso}__${numeroAta}`, detentora] as const;
    })).values()
  ).sort((a, b) => (a.curso?.nome_curso || "").localeCompare(b.curso?.nome_curso || "", "pt-BR", { sensitivity: "base" }));

  async function handleDetentoraChange(id: string): Promise<void> {
    setDetentoras_id(id);
    setMostrarSaldo(false);
    if (!id) {
      setSaldoDetentora(null);
      return;
    }
    await carregarSaldoDetentora(id);
  }

  function handlePeriodo(value: string): void {
    setPeriodo(value);
    if (value === "manha") { setHorario("08:00"); setHorarioFim("12:00"); }
    else if (value === "tarde") { setHorario("13:00"); setHorarioFim("17:00"); }
    else if (value === "noite") { setHorario("18:00"); setHorarioFim("22:00"); }
    else if (value === "") { setHorario(""); setHorarioFim(""); }
  }

  function abrirSeletorImagem(): void {
    if (!uploadingImagem && !salvando) inputImagemRef.current?.click();
  }

  async function handleAlterarImagem(e: ChangeEvent<HTMLInputElement>): Promise<void> {
    const arquivo = e.target.files?.[0];
    e.target.value = "";
    if (!arquivo) return;

    if (!arquivo.type.startsWith("image/")) {
      toast.error("Selecione um arquivo de imagem válido.");
      return;
    }
    if (arquivo.size > 10 * 1024 * 1024) {
      toast.error("A imagem deve ter no máximo 10 MB.");
      return;
    }

    try {
      setUploadingImagem(true);
      const formData = new FormData();
      formData.append("imagem", arquivo);
      const response = await api.post("/upload/cronograma", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      const dadosUpload: unknown = response.data;
      if (!dadosUpload || typeof dadosUpload !== "object") {
        toast.error("O backend não retornou o caminho da imagem.");
        return;
      }
      const resposta = dadosUpload as Record<string, unknown>;
      const novaImagem = [resposta.imagem_url, resposta.url, resposta.path, resposta.file]
        .find((valor): valor is string => typeof valor === "string" && valor.trim() !== "");
      if (!novaImagem) {
        console.error("Resposta do upload sem URL:", response.data);
        toast.error("A imagem foi enviada, mas o backend não retornou o caminho da imagem.");
        return;
      }
      setImagemUrl(novaImagem);
      setImagemAlterada(true);
      setImagemValida(true);
      toast.success("Foto alterada com sucesso!");
    } catch (error: unknown) {
      console.error("Erro ao enviar imagem:", error);
      if (axios.isAxiosError<{ message?: string; error?: string }>(error)) {
        if (error.response?.status === 413) toast.error("A imagem é muito grande para o servidor.");
        else toast.error(error.response?.data?.message || error.response?.data?.error || "Erro ao enviar a nova foto.");
      } else {
        toast.error("Erro ao enviar a nova foto.");
      }
    } finally {
      setUploadingImagem(false);
    }
  }

  function restaurarImagemOriginal(): void {
    setImagemUrl(imagemOriginal);
    setImagemAlterada(false);
    setImagemValida(true);
  }

  async function handleUpdate(e: FormEvent<HTMLFormElement>): Promise<void> {
    e.preventDefault();

    if (!detentoras_id) { toast.error("Selecione o curso da ATA."); return; }
    if (!local_id) { toast.error("Selecione o local."); return; }
    if (!sala_id) { toast.error("Selecione a sala."); return; }
    if (!formatura_id) { toast.error("Selecione a data da formatura."); return; }
    if (!data_inicio || !data_fim) { toast.error("Informe a data de início e a data de fim."); return; }
    if (data_fim < data_inicio) { toast.error("A data fim não pode ser anterior à data de início."); return; }
    if (!hora_inicio || !hora_fim) { toast.error("Informe o horário de início e fim."); return; }
    if (hora_fim <= hora_inicio) { toast.error("O horário fim deve ser posterior ao horário de início."); return; }
    if (!tema.trim()) { toast.error("Informe o tema do curso."); return; }
    if (!is_status) { toast.error("Selecione o status do cronograma."); return; }
    if (link_inscricao.trim()) {
      try { new URL(link_inscricao.trim()); }
      catch { toast.error("Informe um link de inscrição válido, incluindo https://."); return; }
    }
    if (uploadingImagem) { toast.error("Aguarde o término do envio da foto."); return; }

    if (saldoDetentora && saldoDetentora.saldo <= 0 && detentoras_id !== dados.detentoras_id) {
      toast.error("Esta detentora não possui saldo disponível.");
      return;
    }

    const payload: Record<string, unknown> = {
      bloco_id: bloco_id || null,
      detentoras_id: detentoras_id || null,
      professor_id: professor_id || null,
      local_id: local_id || null,
      sala_id: sala_id || null,
      formatura_id: formatura_id || null,
      data_inicio: formatarData(data_inicio),
      data_fim: formatarData(data_fim),
      hora_inicio,
      hora_fim,
      tema: tema.trim(),
      is_status,
      especificacao: especificacao.trim(),
      publicar,
      draft,
      quantidade_aluno: quantidade_aluno === "" ? null : quantidade_aluno,
      link_inscricao: link_inscricao.trim() || null,
    };

    // Preserva o caminho da imagem existente se a foto não foi alterada.
    if (imagemAlterada) payload.imagem_url = imagemUrl.trim() || null;

    try {
      setSalvando(true);
      await api.put(`/cronograma/${dados.id}`, payload);
      toast.success("Cronograma atualizado com sucesso!");
      atualizarLista();
      fechar();
    } catch (error: unknown) {
      console.error("Erro ao atualizar cronograma:", error);
      if (axios.isAxiosError<{ message?: string; error?: string }>(error)) {
        toast.error(error.response?.data?.message || error.response?.data?.error || "Erro ao atualizar cronograma.");
      } else {
        toast.error("Erro ao atualizar cronograma.");
      }
    } finally {
      setSalvando(false);
    }
  }

  const semSaldoParaNovaDetentora = Boolean(
    saldoDetentora && saldoDetentora.saldo <= 0 && detentoras_id !== dados.detentoras_id
  );
  const formularioBloqueado = salvando || uploadingImagem;

  return (
    <div className="w-full rounded-xl bg-white p-4 text-gray-900 shadow-xl dark:bg-gray-900 dark:text-gray-100 sm:p-6">
      <form onSubmit={handleUpdate} className="grid grid-cols-1 gap-4 sm:grid-cols-2">
        <div>
          <label htmlFor="bloco_id" className={labelClass}>Bloco</label>
          <select id="bloco_id" value={bloco_id} onChange={(e) => setBloco(e.target.value)} className={fieldClass} disabled={formularioBloqueado}>
            <option value="">Selecione o bloco</option>
            {blocoCurso.map((bloco) => <option key={bloco.id} value={bloco.id}>{bloco.bloco_Curso}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="formatura_id" className={labelClass}>Data da formatura</label>
          <select id="formatura_id" value={formatura_id} onChange={(e) => setFormatura(e.target.value)} className={fieldClass} disabled={formularioBloqueado}>
            <option value="">Selecione a data da formatura</option>
            {formaturas.map((formatura) => <option key={formatura.id} value={formatura.id}>{formatarDataParaExibicao(formatura.data_formatura)}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="local_id" className={labelClass}>Local</label>
          <select id="local_id" value={local_id} onChange={(e) => { setLocal(e.target.value); setSala(""); }} className={fieldClass} disabled={formularioBloqueado}>
            <option value="">Selecione o local</option>
            {locaisList.map((local) => <option key={local.id} value={local.id}>{local.polo}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="sala_id" className={labelClass}>Sala</label>
          <select id="sala_id" value={sala_id} onChange={(e) => setSala(e.target.value)} disabled={!local_id || formularioBloqueado} className={`${fieldClass} disabled:cursor-not-allowed disabled:opacity-60`}>
            <option value="">{!local_id ? "Selecione primeiro o local" : "Selecione a sala"}</option>
            {salasFiltradas.map((sala) => <option key={sala.id} value={sala.id}>{sala.numero_sala}{sala.tipo_uso ? ` - ${sala.tipo_uso}` : ""}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="detentoras_id" className={labelClass}>Curso da ATA</label>
          <select id="detentoras_id" value={detentoras_id} onChange={(e) => void handleDetentoraChange(e.target.value)} className={fieldClass} disabled={formularioBloqueado}>
            <option value="">Selecione o curso da ATA</option>
            {detentorasUnicas.map((detentora) => <option key={detentora.id} value={detentora.id}>{(detentora.curso?.nome_curso || "SEM CURSO").toUpperCase()}{" - ATA "}{(detentora.ata?.numero_ata || "SEM ATA").toUpperCase()}</option>)}
          </select>
        </div>

        <div>
          <label htmlFor="professor_id" className={labelClass}>Professor</label>
          <select id="professor_id" value={professor_id} onChange={(e) => setProfessor(e.target.value)} className={fieldClass} disabled={formularioBloqueado}>
            <option value="">Selecione o professor</option>
            {professores.map((professor) => <option key={professor.id} value={professor.id}>{professor.nome_professor}</option>)}
          </select>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="tema" className={labelClass}>Tema do curso</label>
          <input id="tema" value={tema} onChange={(e) => setTema(e.target.value)} placeholder="Tema do curso" className={fieldClass} disabled={formularioBloqueado} />
        </div>

        {loadingSaldo && <p className={`sm:col-span-2 ${secondaryTextClass}`}>Consultando saldo...</p>}

        {saldoDetentora && (
          <section className="sm:col-span-2 overflow-hidden rounded-xl border border-blue-300 bg-white shadow-sm dark:border-blue-800 dark:bg-gray-800">
            <button type="button" onClick={() => setMostrarSaldo((valor) => !valor)} className="flex w-full items-center justify-between gap-3 bg-blue-50 px-4 py-3 text-left hover:bg-blue-100 dark:bg-blue-950/50 dark:hover:bg-blue-900/50">
              <span className="flex flex-wrap items-center gap-3">
                <span className="font-bold text-blue-800 dark:text-blue-200">Saldo</span>
                <span className={`rounded-full px-3 py-1 text-sm font-bold text-white ${saldoDetentora.saldo <= 0 ? "bg-red-600" : saldoDetentora.saldo <= 5 ? "bg-yellow-600" : "bg-green-600"}`}>{saldoDetentora.saldo} turma(s)</span>
              </span>
              <span aria-hidden="true">{mostrarSaldo ? "▲" : "▼"}</span>
            </button>
            {mostrarSaldo && (
              <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-3">
                <div><p className={secondaryTextClass}>Empresa</p><strong>{saldoDetentora.empresa}</strong></div>
                <div><p className={secondaryTextClass}>Contratado</p><strong className="text-2xl text-blue-600 dark:text-blue-400">{saldoDetentora.contratado}</strong></div>
                <div><p className={secondaryTextClass}>Utilizadas</p><strong className="text-2xl text-orange-600 dark:text-orange-400">{saldoDetentora.utilizadas}</strong></div>
              </div>
            )}
          </section>
        )}

        {semSaldoParaNovaDetentora && (
          <div className="sm:col-span-2 rounded-lg border border-red-300 bg-red-50 p-4 text-red-800 dark:border-red-900 dark:bg-red-950/40 dark:text-red-200">
            <h2 className="font-bold">Atenção</h2>
            <p className="text-sm">Esta detentora não possui saldo disponível para novos cronogramas.</p>
          </div>
        )}

        <div className="grid grid-cols-1 gap-4 sm:col-span-2 sm:grid-cols-2 lg:grid-cols-5">
          <div><label htmlFor="data_inicio" className={labelClass}>Data início</label><input id="data_inicio" type="date" value={data_inicio} onChange={(e) => setDataInicio(e.target.value)} className={fieldClass} disabled={formularioBloqueado} /></div>
          <div><label htmlFor="data_fim" className={labelClass}>Data fim</label><input id="data_fim" type="date" value={data_fim} min={data_inicio || undefined} onChange={(e) => setDataFim(e.target.value)} className={fieldClass} disabled={formularioBloqueado} /></div>
          <div>
            <label htmlFor="periodo" className={labelClass}>Período</label>
            <select id="periodo" value={periodo} onChange={(e) => handlePeriodo(e.target.value)} className={fieldClass} disabled={formularioBloqueado}>
              <option value="">Selecione o período</option><option value="manha">Manhã</option><option value="tarde">Tarde</option><option value="noite">Noite</option>
            </select>
          </div>
          <div><label htmlFor="hora_inicio" className={labelClass}>Hora início</label><input id="hora_inicio" type="time" value={hora_inicio} onChange={(e) => setHorario(e.target.value)} className={fieldClass} disabled={formularioBloqueado} /></div>
          <div><label htmlFor="hora_fim" className={labelClass}>Hora fim</label><input id="hora_fim" type="time" value={hora_fim} onChange={(e) => setHorarioFim(e.target.value)} className={fieldClass} disabled={formularioBloqueado} /></div>
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="quantidade_aluno" className={labelClass}>Quantidade de alunos</label>
          <input id="quantidade_aluno" type="number" min="0" value={quantidade_aluno} onChange={(e) => setQtdeAlunos(e.target.value)} className={fieldClass} placeholder="Quantidade de alunos" disabled={formularioBloqueado} />
        </div>

        <div className="sm:col-span-2">
          <label htmlFor="especificacao" className={labelClass}>Especificação / Observações</label>
          <textarea id="especificacao" rows={3} value={especificacao} onChange={(e) => setObservacao(e.target.value)} placeholder="Especificação / Observações" className={`${fieldClass} resize-y`} disabled={formularioBloqueado} />
        </div>

        <div className="flex flex-col gap-5 sm:col-span-2">
          <div>
            <label htmlFor="link_inscricao" className={labelClass}>Link de inscrição</label>
            <input id="link_inscricao" type="url" value={link_inscricao} onChange={(e) => setLink_inscricao(e.target.value)} placeholder="https://..." className={fieldClass} disabled={formularioBloqueado} />
          </div>

          <section className="rounded-xl border border-gray-200 bg-gray-50 p-4 dark:border-gray-700 dark:bg-gray-800">
            <div className="flex flex-col gap-5 md:flex-row">
              <div className="w-full md:max-w-xs">
                <p className={labelClass}>Foto atual</p>
                {imagemUrl ? (
                  <div>
                    <div className="relative aspect-ratio[5/3] w-full overflow-hidden rounded-lg border border-gray-200 bg-gray-100 dark:border-gray-700 dark:bg-gray-900">
                      <Image src={imagemUrl} alt="Imagem do curso" fill sizes="(max-width: 768px) 100vw, 320px" className="object-contain" unoptimized onError={() => setImagemValida(false)} onLoad={() => setImagemValida(true)} />
                    </div>
                    {!imagemValida && <p className="mt-2 rounded-lg border border-red-200 bg-red-50 p-2 text-xs text-red-700 dark:border-red-900 dark:bg-red-950/40 dark:text-red-300">Não foi possível carregar a imagem. Verifique o caminho retornado pelo servidor.</p>}
                  </div>
                ) : (
                  <div className="flex aspect-ratio[5/3] items-center justify-center rounded-lg border border-dashed border-gray-300 bg-white text-sm text-gray-500 dark:border-gray-600 dark:bg-gray-900 dark:text-gray-400">Nenhuma foto cadastrada</div>
                )}
              </div>

              <div className="min-w-0 flex-1">
                <p className={labelClass}>Foto do curso</p>
                <input ref={inputImagemRef} type="file" accept="image/*" onChange={(e) => void handleAlterarImagem(e)} className="hidden" />
                <div className="flex flex-wrap items-center gap-3">
                  <button type="button" onClick={abrirSeletorImagem} disabled={formularioBloqueado} className="rounded-lg bg-blue-600 px-5 py-3 font-semibold text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-50">
                    {uploadingImagem ? "Enviando foto..." : "Alterar foto"}
                  </button>
                  {imagemAlterada && <button type="button" onClick={restaurarImagemOriginal} disabled={formularioBloqueado} className="rounded-lg border border-gray-300 px-4 py-3 font-semibold text-gray-700 hover:bg-gray-100 disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-700">Desfazer</button>}
                </div>
                <p className={`mt-3 ${secondaryTextClass}`}>Clique em <strong>Alterar foto</strong> para selecionar uma nova imagem do computador.</p>
                <p className={`mt-1 text-xs ${secondaryTextClass}`}>Formatos recomendados: JPG, JPEG, PNG ou WEBP. Tamanho máximo: 10 MB.</p>
                {imagemAlterada && <div className="mt-3 rounded-lg border border-green-300 bg-green-50 p-3 text-sm text-green-800 dark:border-green-900 dark:bg-green-950/40 dark:text-green-200">Nova foto enviada. Clique em <strong>Salvar alterações</strong> para confirmar.</div>}
              </div>
            </div>
          </section>
        </div>

        <div className="sm:col-span-2 sm:max-w-sm">
          <label htmlFor="status_cronograma" className={labelClass}>Status</label>
          <select id="status_cronograma" value={is_status} onChange={(e) => setStatus(e.target.value)} className={fieldClass} disabled={formularioBloqueado}>
            <option value="">Selecione o status</option><option value="ativo">Ativo</option><option value="cancelado">Cancelado</option><option value="suspenso">Suspenso</option>
          </select>
        </div>

        <div className="flex flex-col gap-4 border-t border-gray-200 pt-4 dark:border-gray-700 sm:col-span-2 md:flex-row md:items-center md:justify-between">
          <div className="flex flex-wrap items-center gap-x-6 gap-y-3">
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={draft} onChange={(e) => setDraft(e.target.checked)} disabled={formularioBloqueado} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800" />
              Rascunho (Draft)
            </label>
            <label className="flex cursor-pointer items-center gap-2 text-sm text-gray-700 dark:text-gray-200">
              <input type="checkbox" checked={publicar} onChange={(e) => setPublicar(e.target.checked)} disabled={formularioBloqueado} className="h-4 w-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500 dark:border-gray-600 dark:bg-gray-800" />
              Publicar
            </label>
          </div>

          <div className="flex flex-col-reverse gap-3 sm:flex-row sm:justify-end">
            <button type="button" onClick={fechar} disabled={formularioBloqueado} className="rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">Cancelar</button>
            <button type="submit" disabled={formularioBloqueado || loadingSaldo || !detentoras_id || !is_status || semSaldoParaNovaDetentora} className={`whitespace-nowrap rounded-lg px-6 py-3 font-semibold text-white ${formularioBloqueado || loadingSaldo || !detentoras_id || !is_status || semSaldoParaNovaDetentora ? "cursor-not-allowed bg-gray-400 dark:bg-gray-700" : "bg-blue-600 hover:bg-blue-700"}`}>
              {salvando ? "Salvando..." : uploadingImagem ? "Enviando foto..." : loadingSaldo ? "Consultando saldo..." : "Salvar alterações"}
            </button>
          </div>
        </div>
      </form>
    </div>
  );
}
