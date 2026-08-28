"use client";

import React, { useEffect, useState } from "react";
import { api } from "@/services/api";
import { toast } from "react-toastify";
import axios from "axios";

// ==============================
// TIPOS
// ==============================

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

interface LocalType {
  id: string;
  polo: string;
}

interface SalaType {
  id: string;
  numero_sala: string;
  tipo_uso?: string;
  local_id?: string;
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
// FUNÇÕES AUXILIARES
// ==============================

function formatarDataParaInput(data: string): string {
  if (!data) {
    return "";
  }

  // Já está em YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(data)) {
    return data.substring(0, 10);
  }

  // Está em DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    const [dia, mes, ano] = data.split("/");
    return `${ano}-${mes}-${dia}`;
  }

  return data;
}

// ==============================
// FORMATAR DATA PARA BACKEND
// ==============================

function formatarData(data: string): string {
  if (!data) {
    return "";
  }

  const partes = data.split("-");

  if (partes.length !== 3) {
    return data;
  }

  const [ano, mes, dia] = partes;

  return `${dia}/${mes}/${ano}`;
}

// ==============================
// FORMATAR DATA PARA EXIBIÇÃO
// ==============================

function formatarDataParaExibicao(data: string): string {
  if (!data) {
    return "";
  }

  // DD/MM/YYYY
  if (/^\d{2}\/\d{2}\/\d{4}$/.test(data)) {
    return data;
  }

  // YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}/.test(data)) {
    const [ano, mes, dia] = data.substring(0, 10).split("-");
    return `${dia}/${mes}/${ano}`;
  }

  return data;
}

// ==============================
// FORMATAR HORA
// ==============================

function formatarHora(hora?: string): string {
  if (!hora) {
    return "";
  }

  return hora.substring(0, 5);
}

// ==============================
// DETECTAR PERÍODO
// ==============================

function detectarPeriodo(inicio?: string, fim?: string): string {
  const horaInicio = formatarHora(inicio);
  const horaFim = formatarHora(fim);

  if (horaInicio === "08:00" && horaFim === "12:00") {
    return "manha";
  }

  if (horaInicio === "13:00" && horaFim === "17:00") {
    return "tarde";
  }

  if (horaInicio === "18:00" && horaFim === "22:00") {
    return "noite";
  }

  return "";
}

// ==============================
// COMPONENTE
// ==============================

export default function EditarCronogramaModal({
  dados,
  fechar,
  atualizarLista,
}: Props) {
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
  const [quantidade_aluno, setQtdeAlunos] = useState(dados.quantidade_aluno ?? "");
  const [formatura_id, setFormatura] = useState(dados.formatura_id || "");
  const [especificacao, setObservacao] = useState(dados.especificacao || "");
  const [publicar, setPublicar] = useState(dados.publicar || false);
  const [draft, setDraft] = useState(dados.draft || false);
  const [is_status, setStatus] = useState(dados.is_status || "");
  const [periodo, setPeriodo] = useState(
    dados.periodo || detectarPeriodo(dados.hora_inicio, dados.hora_fim)
  );
  const [link_inscricao, setLink_inscricao] = useState(dados.link_inscricao || "");
  const [imagemUrl, setImagemUrl] = useState(dados.imagem_url || "");
  const [imagemValida, setImagemValida] = useState(true);

  // ==============================
  // SALDO
  // ==============================

  const [saldoDetentora, setSaldoDetentora] = useState<SaldoDetentora | null>(null);
  const [loadingSaldo, setLoadingSaldo] = useState(false);
  const [mostrarSaldo, setMostrarSaldo] = useState(false);
  const [salvando, setSalvando] = useState(false);

  // ==============================
  // BUSCAR SALDO
  // ==============================

  async function carregarSaldoDetentora(id: string) {
    if (!id) {
      setSaldoDetentora(null);
      return;
    }

    try {
      setLoadingSaldo(true);

      const response = await api.get<SaldoDetentora>("/detentora/saldo", {
        params: { id },
      });

      setSaldoDetentora(response.data);
    } catch (error) {
      console.error("Erro ao buscar saldo da detentora:", error);
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
        const [locaisRes, blocoRes, salasRes, profRes, forRes, detRes] =
          await Promise.all([
            api.get<LocalType[]>("/local"),
            api.get<BlocoType[]>("/bloco"),
            api.get<SalaType[]>("/sala"),
            api.get<ProfessorType[]>("/professor"),
            api.get<FormaturaType[]>("/formatura"),
            api.get<DetentoraType[]>("/detentora"),
          ]);

        setLocaisList(locaisRes.data);
        setBlocos(blocoRes.data);
        setSalas(salasRes.data);
        setProfessores(profRes.data);
        setFormaturas(forRes.data);
        setDetentoras(detRes.data);

        // Carrega o saldo da detentora atual
        if (dados.detentoras_id) {
          await carregarSaldoDetentora(dados.detentoras_id);
        }
      } catch (error) {
        console.error("Erro ao carregar dados:", error);
        toast.error("Erro ao carregar informações.");
      }
    }

    loadData();
    
  }, [dados.detentoras_id]);

  // ==============================
  // SALAS FILTRADAS PELO LOCAL
  // ==============================

  const salasFiltradas = salas.filter(
    (sala) => !sala.local_id || sala.local_id === local_id
  );

  // ==============================
  // DETENTORAS SEM DUPLICIDADE
  // ==============================

  const detentorasUnicas = Array.from(
    new Map(
      detentoras.map((detentora) => {
        const nomeCurso =
          detentora.curso?.nome_curso?.trim().toUpperCase() || "SEM CURSO";
        const numeroAta =
          detentora.ata?.numero_ata?.trim().toUpperCase() || "SEM ATA";
        const chave = `${nomeCurso}__${numeroAta}`;

        return [chave, detentora];
      })
    ).values()
  ).sort((a, b) =>
    (a.curso?.nome_curso || "").localeCompare(b.curso?.nome_curso || "", "pt-BR", {
      sensitivity: "base",
    })
  );

  // ==============================
  // ALTERAR DETENTORA
  // ==============================

  async function handleDetentoraChange(id: string) {
    setDetentoras_id(id);

    if (!id) {
      setSaldoDetentora(null);
      return;
    }

    await carregarSaldoDetentora(id);
  }

  // ==============================
  // ALTERAR PERÍODO
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
  // SALVAR ALTERAÇÕES
  // ==============================

  async function handleUpdate(e: React.FormEvent) {
    e.preventDefault();

    if (!detentoras_id) {
      toast.error("Selecione o curso da ATA.");
      return;
    }

    // Só bloqueia saldo zerado/negativo
    // quando estiver trocando para outra detentora.
    if (
      saldoDetentora &&
      saldoDetentora.saldo <= 0 &&
      detentoras_id !== dados.detentoras_id
    ) {
      toast.error("Esta detentora não possui saldo disponível.");
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
      hora_inicio,
      hora_fim,
      tema: tema.trim(),
      is_status: is_status || "ativo",
      especificacao: especificacao.trim(),
      publicar,
      draft,
      quantidade_aluno: quantidade_aluno === "" ? null : quantidade_aluno,
      link_inscricao:
        link_inscricao.trim() !== "" ? link_inscricao.trim() : null,
      imagem_url: imagemUrl.trim() !== "" ? imagemUrl.trim() : null,
    };

    console.log("=================================");
    console.log("ATUALIZANDO CRONOGRAMA");
    console.log("ID:", dados.id);
    console.log("PAYLOAD:", payload);
    console.log("=================================");

    try {
      setSalvando(true);

      await api.put(`/cronograma/${dados.id}`, payload);

      toast.success("Cronograma atualizado com sucesso!");

      atualizarLista();
      fechar();
    } catch (error: unknown) {
      console.error("Erro ao atualizar cronograma:", error);

      if (axios.isAxiosError(error)) {
        console.error("STATUS:", error.response?.status);
        console.error("RESPOSTA DO BACKEND:", error.response?.data);

        toast.error(
          error.response?.data?.message || "Erro ao atualizar cronograma."
        );
      } else {
        toast.error("Erro ao atualizar cronograma.");
      }
    } finally {
      setSalvando(false);
    }
  }

  // ==============================
  // RENDER
  // ==============================

  return (
    <div className="p-0">
      <div className="w-full bg-white rounded-xl p-6">
        <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-4">
          {/* ==============================
              BLOCO
          ============================== */}

          <div>
            <select
              value={bloco_id}
              onChange={(e) => setBloco(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Selecione o bloco</option>

              {blocoCurso.map((bloco) => (
                <option key={bloco.id} value={bloco.id}>
                  {bloco.bloco_Curso}
                </option>
              ))}
            </select>
          </div>

          {/* ==============================
              DATA FORMATURA
          ============================== */}

          <div>
            <select
              value={formatura_id}
              onChange={(e) => setFormatura(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Data da formatura</option>

              {formaturas.map((formatura) => (
                <option key={formatura.id} value={formatura.id}>
                  {formatarDataParaExibicao(formatura.data_formatura)}
                </option>
              ))}
            </select>
          </div>

          {/* ==============================
              LOCAL
          ============================== */}

          <div>
            <select
              value={local_id}
              onChange={(e) => {
                setLocal(e.target.value);
                // Limpa a sala quando mudar o local.
                setSala("");
              }}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Selecione o local</option>

              {locaisList.map((local) => (
                <option key={local.id} value={local.id}>
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
              onChange={(e) => setSala(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Selecione a sala</option>

              {salasFiltradas.map((sala) => (
                <option key={sala.id} value={sala.id}>
                  {sala.numero_sala}
                  {sala.tipo_uso ? ` - ${sala.tipo_uso}` : ""}
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
              onChange={(e) => handleDetentoraChange(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Curso da Ata</option>

              {detentorasUnicas.map((detentora) => (
                <option key={detentora.id} value={detentora.id}>
                  {(detentora.curso?.nome_curso || "SEM CURSO").toUpperCase()}
                  {" - ATA "}
                  {(detentora.ata?.numero_ata || "SEM ATA").toUpperCase()}
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
              onChange={(e) => setProfessor(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Selecione o professor</option>

              {professores.map((professor) => (
                <option key={professor.id} value={professor.id}>
                  {professor.nome_professor}
                </option>
              ))}
            </select>
          </div>

          {/* ==============================
              TEMA
          ============================== */}

          <div className="col-span-2">
            <input
              value={tema}
              onChange={(e) => setTema(e.target.value)}
              placeholder="Tema do curso"
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>

          {/* ==============================
              SALDO - LOADING
          ============================== */}

          {loadingSaldo && (
            <div className="col-span-2 text-sm text-gray-500">
              Consultando saldo...
            </div>
          )}

          {/* ==============================
              SALDO
          ============================== */}

          {saldoDetentora && (
            <div className="col-span-2 rounded-xl border border-blue-400 bg-white shadow overflow-hidden">
              <button
                type="button"
                onClick={() => setMostrarSaldo(!mostrarSaldo)}
                className="w-full flex justify-between items-center px-5 py-4 bg-blue-50"
              >
                <div className="flex items-center gap-3">
                  <span className="text-lg font-bold text-blue-700">Saldo</span>

                  <span
                    className={`px-3 py-1 rounded-full text-white font-bold ${
                      saldoDetentora.saldo <= 0
                        ? "bg-red-600"
                        : saldoDetentora.saldo <= 5
                        ? "bg-yellow-500"
                        : "bg-green-600"
                    }`}
                  >
                    {saldoDetentora.saldo}
                    {" turma(s)"}
                  </span>
                </div>

                <span>{mostrarSaldo ? "▲" : "▼"}</span>
              </button>

              {mostrarSaldo && (
                <div className="p-5 grid grid-cols-3 gap-5">
                  <div>
                    <p className="text-gray-500 text-sm">Empresa</p>
                    <strong>{saldoDetentora.empresa}</strong>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm">Contratado</p>
                    <strong className="text-2xl text-blue-600">
                      {saldoDetentora.contratado}
                    </strong>
                  </div>

                  <div>
                    <p className="text-gray-500 text-sm">Utilizadas</p>
                    <strong className="text-2xl text-orange-600">
                      {saldoDetentora.utilizadas}
                    </strong>
                  </div>
                </div>
              )}
            </div>
          )}

          {/* ==============================
              ALERTA DE SALDO
          ============================== */}

          {saldoDetentora && saldoDetentora.saldo <= 0 && (
            <div className="col-span-2 bg-red-100 border border-red-300 rounded-lg p-4">
              <h2 className="text-red-700 font-bold">Atenção</h2>

              <p className="text-red-600">
                Esta detentora não possui saldo disponível para criar novos
                cronogramas.
              </p>
            </div>
          )}

          {/* ==============================
              DATAS E HORÁRIOS
          ============================== */}

          <div className="col-span-2 grid grid-cols-5 gap-4">
            {/* DATA INÍCIO */}

            <div>
              <label className="block text-sm font-medium mb-1">
                Data Início
              </label>

              <input
                type="date"
                value={data_inicio}
                onChange={(e) => setDataInicio(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* DATA FIM */}

            <div>
              <label className="block text-sm font-medium mb-1">Data Fim</label>

              <input
                type="date"
                value={data_fim}
                onChange={(e) => setDataFim(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* PERÍODO */}

            <div>
              <label className="block text-sm font-medium mb-1">Período</label>

              <select
                value={periodo}
                onChange={(e) => handlePeriodo(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >
                <option value="">Período</option>
                <option value="manha">Manhã</option>
                <option value="tarde">Tarde</option>
                <option value="noite">Noite</option>
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
                onChange={(e) => setHorario(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* HORA FIM */}

            <div>
              <label className="block text-sm font-medium mb-1">Hora Fim</label>

              <input
                type="time"
                value={hora_fim}
                onChange={(e) => setHorarioFim(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>
          </div>

          {/* ==============================
              QUANTIDADE DE ALUNOS
          ============================== */}

          <div className="col-span-2">
            <input
              type="number"
              min="0"
              value={quantidade_aluno}
              onChange={(e) => setQtdeAlunos(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Quantidade de alunos"
            />
          </div>

          {/* ==============================
              OBSERVAÇÃO
          ============================== */}

          <div className="col-span-2">
            <textarea
              rows={2}
              value={especificacao}
              onChange={(e) => setObservacao(e.target.value)}
              placeholder="Especificação / Observações"
              className="w-full px-3 py-2 border rounded-lg resize-none"
            />
          </div>

          {/* ==============================
              LINK + IMAGEM
          ============================== */}

          <div className="col-span-2 flex flex-col md:flex-row gap-6">
            {/* LINK */}

            <div className="flex-1">
              <label htmlFor="link_inscricao" className="block text-sm font-medium mb-1">
                Link de inscrição
              </label>

              <input
                id="link_inscricao"
                type="url"
                value={link_inscricao}
                onChange={(e) => setLink_inscricao(e.target.value)}
                placeholder="https://..."
                className="w-full px-3 py-2 border rounded-lg"
              />
            </div>

            {/* IMAGEM */}

            <div className="flex-1">
              <label htmlFor="imagem_url" className="block text-sm font-medium mb-1">
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
                className="w-full px-3 py-2 border rounded-lg"
              />

              <p className="mt-1 text-xs text-gray-500">
                Informe a URL de uma imagem pública.
              </p>

              {imagemUrl.trim() !== "" && !imagemValida && (
                <div className="mt-3 p-3 rounded-lg border border-red-300 bg-red-50 text-red-600 text-sm">
                  Não foi possível carregar essa imagem. Verifique se a URL
                  está correta.
                </div>
              )}
            </div>
          </div>

          {/* ==============================
              STATUS
          ============================== */}

          <div className="col-span-2 md:w-1/2">
            <label className="block text-sm font-medium mb-1">Status</label>

            <input
              value={is_status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Status"
            />
          </div>

          {/* ==============================
              DRAFT / PUBLICAR + BOTÕES
          ============================== */}

          <div className="col-span-2 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pt-2">
            {/* CHECKBOXES */}

            <div className="flex items-center gap-6">
              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={draft}
                  onChange={(e) => setDraft(e.target.checked)}
                />
                Rascunho (Draft)
              </label>

              <label className="flex items-center gap-2 text-sm">
                <input
                  type="checkbox"
                  checked={publicar}
                  onChange={(e) => setPublicar(e.target.checked)}
                />
                Publicar
              </label>
            </div>

            {/* BOTÕES */}

            <div className="flex items-center gap-3">
              <button
                type="button"
                onClick={fechar}
                disabled={salvando}
                className="px-5 py-3 rounded-lg border border-gray-300 text-gray-700 font-semibold hover:bg-gray-100 disabled:opacity-50"
              >
                Cancelar
              </button>

              <button
                type="submit"
                disabled={
                  salvando ||
                  loadingSaldo ||
                  !detentoras_id ||
                  (saldoDetentora !== null &&
                    saldoDetentora.saldo <= 0 &&
                    detentoras_id !== dados.detentoras_id)
                }
                className={`px-6 py-3 rounded-lg text-white font-semibold whitespace-nowrap ${
                  salvando ||
                  loadingSaldo ||
                  (saldoDetentora &&
                    saldoDetentora.saldo <= 0 &&
                    detentoras_id !== dados.detentoras_id)
                    ? "bg-gray-400 cursor-not-allowed"
                    : "bg-blue-600 hover:bg-blue-700"
                }`}
              >
                {salvando
                  ? "Salvando..."
                  : loadingSaldo
                  ? "Consultando saldo..."
                  : "Salvar Alterações"}
              </button>
            </div>
          </div>
        </form>
      </div>
    </div>
  );
}
