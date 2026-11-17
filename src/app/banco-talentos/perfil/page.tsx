
"use client";

import { FormEvent, useEffect, useState } from "react";
import { destroyCookie } from "nookies";
import { useRouter } from "next/navigation";
import { bancoTalentosApi } from "@/services/bancoTalentosApi";

type Formacao = {
  id: string;
  cronograma: {
    tema: string;
    data_inicio: string;
    data_fim: string;
    detentoras: {
      curso: {
        nome_curso: string;
        segmento: { name: string };
      };
    } | null;
  } | null;
};

type Perfil = {
  objetivoProfissional?: string | null;
  resumo?: string | null;
  cidade?: string | null;
  bairro?: string | null;
  disponibilidade?: string | null;
  telefoneContato?: string | null;
  ativo?: boolean;
};

type Aluno = {
  id: string;
  nome: string;
  email: string | null;
  celular: string;
  matriculas: Formacao[];
  perfilProfissional: Perfil | null;
};

type StatusCandidatura =
  | "EM_ANALISE"
  | "CONTATADO"
  | "SELECIONADO"
  | "RECUSADO";

type EmpresaOportunidade = {
  razaoSocial: string;
  nomeFantasia: string | null;
  cidade?: string | null;
};

type Oportunidade = {
  id: string;
  titulo: string;
  descricao: string;
  requisitos: string | null;
  atividades: string | null;
  cidade: string | null;
  modalidade: string | null;
  tipoContratacao: string | null;
  jornada: string | null;
  salario: number | string | null;
  beneficios: string | null;
  prazoCandidatura: string | null;
  status: string;
  createdAt: string;
  empresa: EmpresaOportunidade;
  candidaturas: {
    id: string;
    status: StatusCandidatura;
    createdAt: string;
  }[];
};

type MinhaCandidatura = {
  id: string;
  oportunidadeId: string;
  alunoId: string;
  status: StatusCandidatura;
  createdAt: string;
  oportunidade: {
    id: string;
    titulo: string;
    descricao: string;
    cidade: string | null;
    modalidade: string | null;
    tipoContratacao: string | null;
    status: string;
    empresa: {
      razaoSocial: string;
      nomeFantasia: string | null;
    };
  };
};

type Aba = "perfil" | "oportunidades" | "candidaturas";

const statusLabels: Record<StatusCandidatura, string> = {
  EM_ANALISE: "Em análise",
  CONTATADO: "Contatado",
  SELECIONADO: "Selecionado",
  RECUSADO: "Não selecionado",
};

function formatarData(data: string | null | undefined): string {
  if (!data) return "Não informado";

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return "Não informado";
  }

  return dataFormatada.toLocaleDateString("pt-BR");
}

function formatarSalario(salario: number | string | null): string {
  if (salario === null || salario === "") {
    return "A combinar";
  }

  const valor = Number(salario);

  if (!Number.isFinite(valor)) {
    return "A combinar";
  }

  return valor.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function nomeEmpresa(empresa: EmpresaOportunidade): string {
  return empresa.nomeFantasia || empresa.razaoSocial;
}

function corStatus(status: StatusCandidatura): string {
  switch (status) {
    case "EM_ANALISE":
      return "bg-yellow-100 text-yellow-800 dark:bg-yellow-900/40 dark:text-yellow-300";
    case "CONTATADO":
      return "bg-blue-100 text-blue-800 dark:bg-blue-900/40 dark:text-blue-300";
    case "SELECIONADO":
      return "bg-green-100 text-green-800 dark:bg-green-900/40 dark:text-green-300";
    case "RECUSADO":
      return "bg-red-100 text-red-800 dark:bg-red-900/40 dark:text-red-300";
    default:
      return "bg-gray-100 text-gray-800 dark:bg-gray-800 dark:text-gray-300";
  }
}

export default function BancoTalentosPerfilPage() {
  const router = useRouter();

  const [aluno, setAluno] = useState<Aluno | null>(null);

  const [objetivoProfissional, setObjetivoProfissional] = useState("");
  const [resumo, setResumo] = useState("");
  const [cidade, setCidade] = useState("");
  const [bairro, setBairro] = useState("");
  const [disponibilidade, setDisponibilidade] = useState("");
  const [telefoneContato, setTelefoneContato] = useState("");
  const [consentir, setConsentir] = useState(false);

  const [aba, setAba] = useState<Aba>("perfil");

  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [candidaturas, setCandidaturas] = useState<MinhaCandidatura[]>([]);

  const [oportunidadeSelecionada, setOportunidadeSelecionada] =
    useState<Oportunidade | null>(null);

  const [loading, setLoading] = useState(true);
  const [loadingOportunidades, setLoadingOportunidades] = useState(false);
  const [loadingCandidaturas, setLoadingCandidaturas] = useState(false);

  const [salvando, setSalvando] = useState(false);
  const [candidatando, setCandidatando] = useState<string | null>(null);

  const [mensagem, setMensagem] = useState("");
  const [mensagemOportunidades, setMensagemOportunidades] = useState("");
  const [mensagemCandidaturas, setMensagemCandidaturas] = useState("");

  useEffect(() => {
    async function carregarPerfil() {
      try {
        const { data } = await bancoTalentosApi.get<Aluno>(
          "/banco-talentos/aluno/me"
        );

        setAluno(data);

        const perfil = data.perfilProfissional;

        setObjetivoProfissional(perfil?.objetivoProfissional || "");
        setResumo(perfil?.resumo || "");
        setCidade(perfil?.cidade || "");
        setBairro(perfil?.bairro || "");
        setDisponibilidade(perfil?.disponibilidade || "");
        setTelefoneContato(perfil?.telefoneContato || "");
        setConsentir(Boolean(perfil?.ativo));
      } catch {
        router.replace("/banco-talentos/acesso");
      } finally {
        setLoading(false);
      }
    }

    carregarPerfil();
  }, [router]);

  async function carregarOportunidades() {
    setLoadingOportunidades(true);
    setMensagemOportunidades("");

    try {
      const { data } = await bancoTalentosApi.get<Oportunidade[]>(
        "/banco-talentos/aluno/oportunidades"
      );

      setOportunidades(data);
    } catch {
      setMensagemOportunidades(
        "Não foi possível carregar as oportunidades. Tente novamente."
      );
    } finally {
      setLoadingOportunidades(false);
    }
  }

  async function carregarCandidaturas() {
    setLoadingCandidaturas(true);
    setMensagemCandidaturas("");

    try {
      const { data } = await bancoTalentosApi.get<MinhaCandidatura[]>(
        "/banco-talentos/aluno/candidaturas"
      );

      setCandidaturas(data);
    } catch {
      setMensagemCandidaturas(
        "Não foi possível carregar suas candidaturas. Tente novamente."
      );
    } finally {
      setLoadingCandidaturas(false);
    }
  }

  useEffect(() => {
    if (aluno) {
      carregarOportunidades();
      carregarCandidaturas();
    }
  }, [aluno]);

  function sair() {
    destroyCookie(undefined, "@nextauth.aluno.token", { path: "/" });
    router.replace("/banco-talentos/acesso");
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setSalvando(true);
    setMensagem("");

    try {
      await bancoTalentosApi.put("/banco-talentos/aluno/perfil", {
        objetivoProfissional,
        resumo,
        cidade,
        bairro,
        disponibilidade,
        telefoneContato,
        consentir,
      });

      setMensagem("Perfil atualizado com sucesso.");
    } catch {
      setMensagem("Não foi possível salvar o perfil. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  async function candidatar(id: string) {
    const confirmar = window.confirm(
      "Deseja realmente se candidatar a esta oportunidade?"
    );

    if (!confirmar) return;

    setCandidatando(id);
    setMensagemOportunidades("");

    try {
      await bancoTalentosApi.post(
        `/banco-talentos/aluno/oportunidades/${id}/candidatar`
      );

      setMensagemOportunidades(
        "Candidatura realizada com sucesso!"
      );

      await Promise.all([
        carregarOportunidades(),
        carregarCandidaturas(),
      ]);

      setOportunidadeSelecionada(null);
      setAba("candidaturas");
    } catch (error: unknown) {
      let mensagemErro =
        "Não foi possível realizar sua candidatura. Tente novamente.";

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const response = error.response;

        if (
          typeof response === "object" &&
          response !== null &&
          "data" in response
        ) {
          const responseData = response.data;

          if (
            typeof responseData === "object" &&
            responseData !== null &&
            "error" in responseData &&
            typeof responseData.error === "string"
          ) {
            mensagemErro = responseData.error;
          }
        }
      }

      setMensagemOportunidades(mensagemErro);
    } finally {
      setCandidatando(null);
    }
  }

  const inputClass =
    "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-fuchsia-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

  const labelClass =
    "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

  const botaoAba = (nome: Aba, texto: string) => (
    <button
      type="button"
      onClick={() => {
        setAba(nome);
        setOportunidadeSelecionada(null);
      }}
      className={`rounded-lg px-4 py-2.5 text-sm font-semibold transition ${
        aba === nome
          ? "bg-fuchsia-700 text-white"
          : "bg-gray-100 text-gray-700 hover:bg-gray-200 dark:bg-gray-800 dark:text-gray-300 dark:hover:bg-gray-700"
      }`}
    >
      {texto}
    </button>
  );

  if (loading) {
    return (
      <div className="mx-auto max-w-4xl py-12 text-center text-gray-600 dark:text-gray-300">
        Carregando seu perfil...
      </div>
    );
  }

  if (!aluno) return null;

  return (
    <div className="mx-auto max-w-5xl space-y-6 py-4">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <p className="text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-300">
            BANCO DE TALENTOS
          </p>

          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
            Olá, {aluno.nome}
          </h1>

          <p className="text-sm text-gray-600 dark:text-gray-400">
            Acompanhe oportunidades de emprego e mantenha seu perfil atualizado.
          </p>
        </div>

        <button
          type="button"
          onClick={sair}
          className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800"
        >
          Sair
        </button>
      </div>

      <nav className="flex flex-wrap gap-2">
        {botaoAba("perfil", "Meu perfil")}
        {botaoAba("oportunidades", "Oportunidades")}
        {botaoAba(
          "candidaturas",
          `Minhas candidaturas (${candidaturas.length})`
        )}
      </nav>

      {/* ================================================= */}
      {/* PERFIL PROFISSIONAL */}
      {/* ================================================= */}

      {aba === "perfil" && (
        <div className="space-y-5">
          <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
            <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">
              Formações com aprovação registrada
            </h2>

            <div className="space-y-2">
              {aluno.matriculas.length > 0 ? (
                aluno.matriculas.map((matricula) => (
                  <div
                    key={matricula.id}
                    className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                  >
                    <p className="font-semibold text-gray-900 dark:text-gray-100">
                      {matricula.cronograma?.detentoras?.curso.nome_curso ||
                        matricula.cronograma?.tema ||
                        "Curso"}
                    </p>

                    <p className="text-sm text-gray-600 dark:text-gray-400">
                      {matricula.cronograma?.detentoras?.curso.segmento.name ||
                        "Segmento não informado"}
                    </p>

                    <p className="text-xs text-gray-500 dark:text-gray-400">
                      Conclusão prevista:{" "}
                      {matricula.cronograma?.data_fim || "Não informada"}
                    </p>
                  </div>
                ))
              ) : (
                <p className="text-sm text-gray-500 dark:text-gray-400">
                  Nenhuma formação encontrada.
                </p>
              )}
            </div>
          </section>

          <form
            onSubmit={salvar}
            className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
          >
            <div>
              <h2 className="text-lg font-bold text-gray-900 dark:text-white">
                Meu perfil profissional
              </h2>

              <p className="text-sm text-gray-600 dark:text-gray-400">
                Você poderá atualizar estas informações quando precisar.
              </p>
            </div>

            <div>
              <label className={labelClass} htmlFor="objetivo">
                Objetivo profissional
              </label>

              <input
                id="objetivo"
                className={inputClass}
                value={objetivoProfissional}
                onChange={(e) => setObjetivoProfissional(e.target.value)}
                maxLength={180}
                placeholder="Ex.: Atuar na área de gastronomia"
              />
            </div>

            <div>
              <label className={labelClass} htmlFor="resumo">
                Apresentação profissional
              </label>

              <textarea
                id="resumo"
                className={`${inputClass} min-h-28`}
                value={resumo}
                onChange={(e) => setResumo(e.target.value)}
                maxLength={2000}
                placeholder="Conte um pouco sobre suas experiências, conhecimentos e interesses."
              />
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="cidade">
                  Cidade
                </label>

                <input
                  id="cidade"
                  className={inputClass}
                  value={cidade}
                  onChange={(e) => setCidade(e.target.value)}
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="bairro">
                  Bairro
                </label>

                <input
                  id="bairro"
                  className={inputClass}
                  value={bairro}
                  onChange={(e) => setBairro(e.target.value)}
                />
              </div>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div>
                <label className={labelClass} htmlFor="disponibilidade">
                  Disponibilidade
                </label>

                <select
                  id="disponibilidade"
                  className={inputClass}
                  value={disponibilidade}
                  onChange={(e) => setDisponibilidade(e.target.value)}
                >
                  <option value="">Selecione</option>
                  <option value="IMEDIATA">Imediata</option>
                  <option value="MANHA">Manhã</option>
                  <option value="TARDE">Tarde</option>
                  <option value="NOITE">Noite</option>
                  <option value="INTEGRAL">Integral</option>
                </select>
              </div>

              <div>
                <label className={labelClass} htmlFor="telefone">
                  Telefone para contato
                </label>

                <input
                  id="telefone"
                  className={inputClass}
                  value={telefoneContato}
                  onChange={(e) => setTelefoneContato(e.target.value)}
                  placeholder="(11) 99999-9999"
                />
              </div>
            </div>

            <label className="flex items-start gap-3 rounded-lg border border-fuchsia-200 bg-fuchsia-50 p-3 text-sm text-fuchsia-950 dark:border-fuchsia-900 dark:bg-fuchsia-950/30 dark:text-fuchsia-100">
              <input
                type="checkbox"
                checked={consentir}
                onChange={(e) => setConsentir(e.target.checked)}
                className="mt-1 h-4 w-4 accent-fuchsia-700"
              />

              <span>
                Autorizo a Secretaria a disponibilizar meu perfil profissional
                às empresas empregadoras aprovadas no Banco de Talentos,
                conforme as finalidades do programa. Posso desativar esta
                autorização posteriormente.
              </span>
            </label>

            {mensagem && (
              <p
                role="status"
                className="text-sm text-gray-700 dark:text-gray-300"
              >
                {mensagem}
              </p>
            )}

            <button
              type="submit"
              disabled={salvando}
              className="rounded-lg bg-fuchsia-700 px-6 py-3 font-semibold text-white hover:bg-fuchsia-800 disabled:opacity-60"
            >
              {salvando ? "Salvando..." : "Salvar perfil"}
            </button>
          </form>
        </div>
      )}

      {/* ================================================= */}
      {/* OPORTUNIDADES */}
      {/* ================================================= */}

      {aba === "oportunidades" && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Oportunidades de emprego
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Consulte as vagas disponíveis e candidate-se às que combinam
              com seu perfil.
            </p>
          </div>

          {mensagemOportunidades && (
            <p
              role="status"
              className="rounded-lg bg-fuchsia-50 p-3 text-sm text-fuchsia-800 dark:bg-fuchsia-950/30 dark:text-fuchsia-200"
            >
              {mensagemOportunidades}
            </p>
          )}

          {loadingOportunidades ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              Carregando oportunidades...
            </p>
          ) : oportunidadeSelecionada ? (
            <div className="space-y-4 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
              <button
                type="button"
                onClick={() => setOportunidadeSelecionada(null)}
                className="text-sm font-semibold text-fuchsia-700 hover:underline dark:text-fuchsia-300"
              >
                ← Voltar para oportunidades
              </button>

              <div>
                <h3 className="text-xl font-bold text-gray-900 dark:text-white">
                  {oportunidadeSelecionada.titulo}
                </h3>

                <p className="mt-1 font-medium text-fuchsia-700 dark:text-fuchsia-300">
                  {nomeEmpresa(oportunidadeSelecionada.empresa)}
                </p>
              </div>

              <div className="grid gap-3 sm:grid-cols-2">
                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Salário
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatarSalario(oportunidadeSelecionada.salario)}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Modalidade
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {oportunidadeSelecionada.modalidade || "Não informada"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Tipo de contratação
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {oportunidadeSelecionada.tipoContratacao || "Não informado"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Cidade
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {oportunidadeSelecionada.cidade ||
                      oportunidadeSelecionada.empresa.cidade ||
                      "Não informada"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Jornada
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {oportunidadeSelecionada.jornada || "Não informada"}
                  </p>
                </div>

                <div className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800">
                  <p className="text-xs text-gray-500 dark:text-gray-400">
                    Prazo para candidatura
                  </p>
                  <p className="font-semibold text-gray-900 dark:text-white">
                    {formatarData(oportunidadeSelecionada.prazoCandidatura)}
                  </p>
                </div>
              </div>

              <div>
                <h4 className="mb-1 font-bold text-gray-900 dark:text-white">
                  Descrição da oportunidade
                </h4>

                <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                  {oportunidadeSelecionada.descricao}
                </p>
              </div>

              {oportunidadeSelecionada.atividades && (
                <div>
                  <h4 className="mb-1 font-bold text-gray-900 dark:text-white">
                    Atividades
                  </h4>

                  <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {oportunidadeSelecionada.atividades}
                  </p>
                </div>
              )}

              {oportunidadeSelecionada.requisitos && (
                <div>
                  <h4 className="mb-1 font-bold text-gray-900 dark:text-white">
                    Requisitos
                  </h4>

                  <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {oportunidadeSelecionada.requisitos}
                  </p>
                </div>
              )}

              {oportunidadeSelecionada.beneficios && (
                <div>
                  <h4 className="mb-1 font-bold text-gray-900 dark:text-white">
                    Benefícios
                  </h4>

                  <p className="whitespace-pre-wrap text-sm text-gray-700 dark:text-gray-300">
                    {oportunidadeSelecionada.beneficios}
                  </p>
                </div>
              )}

              {oportunidadeSelecionada.candidaturas.length > 0 ? (
                <div className="rounded-lg bg-blue-50 p-4 text-sm font-semibold text-blue-800 dark:bg-blue-950/30 dark:text-blue-300">
                  Você já se candidatou a esta oportunidade.
                  <p className="mt-1 font-normal">
                    Status:{" "}
                    {statusLabels[
                      oportunidadeSelecionada.candidaturas[0].status
                    ]}
                  </p>
                </div>
              ) : (
                <button
                  type="button"
                  disabled={candidatando === oportunidadeSelecionada.id}
                  onClick={() => candidatar(oportunidadeSelecionada.id)}
                  className="w-full rounded-lg bg-fuchsia-700 px-5 py-3 font-semibold text-white hover:bg-fuchsia-800 disabled:opacity-60 sm:w-auto"
                >
                  {candidatando === oportunidadeSelecionada.id
                    ? "Enviando candidatura..."
                    : "Candidatar-me a esta vaga"}
                </button>
              )}
            </div>
          ) : oportunidades.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                Nenhuma oportunidade disponível no momento.
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Novas vagas aparecerão aqui quando forem publicadas.
              </p>
            </div>
          ) : (
            <div className="grid gap-4 md:grid-cols-2">
              {oportunidades.map((oportunidade) => {
                const candidatura = oportunidade.candidaturas[0];

                return (
                  <article
                    key={oportunidade.id}
                    className="flex flex-col rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
                  >
                    <div className="flex-1 space-y-3">
                      <div>
                        <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                          {oportunidade.titulo}
                        </h3>

                        <p className="text-sm font-medium text-fuchsia-700 dark:text-fuchsia-300">
                          {nomeEmpresa(oportunidade.empresa)}
                        </p>
                      </div>

                      <p className="line-clamp-3 whitespace-pre-wrap text-sm text-gray-600 dark:text-gray-400">
                        {oportunidade.descricao}
                      </p>

                      <div className="space-y-1 text-sm text-gray-600 dark:text-gray-400">
                        <p>
                          <strong className="text-gray-800 dark:text-gray-200">
                            Local:
                          </strong>{" "}
                          {oportunidade.cidade ||
                            oportunidade.empresa.cidade ||
                            "Não informado"}
                        </p>

                        <p>
                          <strong className="text-gray-800 dark:text-gray-200">
                            Modalidade:
                          </strong>{" "}
                          {oportunidade.modalidade || "Não informada"}
                        </p>

                        <p>
                          <strong className="text-gray-800 dark:text-gray-200">
                            Salário:
                          </strong>{" "}
                          {formatarSalario(oportunidade.salario)}
                        </p>

                        <p>
                          <strong className="text-gray-800 dark:text-gray-200">
                            Prazo:
                          </strong>{" "}
                          {formatarData(oportunidade.prazoCandidatura)}
                        </p>
                      </div>

                      {candidatura && (
                        <span
                          className={`inline-flex rounded-full px-3 py-1 text-xs font-semibold ${corStatus(
                            candidatura.status
                          )}`}
                        >
                          {statusLabels[candidatura.status]}
                        </span>
                      )}
                    </div>

                    <button
                      type="button"
                      onClick={() => setOportunidadeSelecionada(oportunidade)}
                      className="mt-4 w-full rounded-lg border border-fuchsia-700 px-4 py-2.5 text-sm font-semibold text-fuchsia-700 hover:bg-fuchsia-50 dark:border-fuchsia-400 dark:text-fuchsia-300 dark:hover:bg-fuchsia-950/30"
                    >
                      Ver detalhes
                    </button>
                  </article>
                );
              })}
            </div>
          )}
        </section>
      )}

      {/* ================================================= */}
      {/* MINHAS CANDIDATURAS */}
      {/* ================================================= */}

      {aba === "candidaturas" && (
        <section className="space-y-4">
          <div>
            <h2 className="text-xl font-bold text-gray-900 dark:text-white">
              Minhas candidaturas
            </h2>

            <p className="text-sm text-gray-600 dark:text-gray-400">
              Acompanhe o andamento das suas candidaturas às oportunidades.
            </p>
          </div>

          {loadingCandidaturas ? (
            <p className="py-8 text-center text-gray-500 dark:text-gray-400">
              Carregando suas candidaturas...
            </p>
          ) : mensagemCandidaturas ? (
            <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700 dark:bg-red-950/30 dark:text-red-300">
              {mensagemCandidaturas}
              <button
                type="button"
                onClick={carregarCandidaturas}
                className="ml-2 font-semibold underline"
              >
                Tentar novamente
              </button>
            </div>
          ) : candidaturas.length === 0 ? (
            <div className="rounded-xl border border-gray-200 bg-white p-8 text-center dark:border-gray-700 dark:bg-gray-900">
              <p className="font-semibold text-gray-800 dark:text-gray-200">
                Você ainda não realizou nenhuma candidatura.
              </p>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Consulte as oportunidades disponíveis e candidate-se.
              </p>

              <button
                type="button"
                onClick={() => setAba("oportunidades")}
                className="mt-4 rounded-lg bg-fuchsia-700 px-5 py-2.5 text-sm font-semibold text-white hover:bg-fuchsia-800"
              >
                Ver oportunidades
              </button>
            </div>
          ) : (
            <div className="space-y-3">
              {candidaturas.map((candidatura) => (
                <article
                  key={candidatura.id}
                  className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900"
                >
                  <div className="flex flex-wrap items-start justify-between gap-3">
                    <div>
                      <h3 className="font-bold text-gray-900 dark:text-white">
                        {candidatura.oportunidade.titulo}
                      </h3>

                      <p className="mt-1 text-sm font-medium text-fuchsia-700 dark:text-fuchsia-300">
                        {nomeEmpresa(candidatura.oportunidade.empresa)}
                      </p>
                    </div>

                    <span
                      className={`rounded-full px-3 py-1 text-xs font-semibold ${corStatus(
                        candidatura.status
                      )}`}
                    >
                      {statusLabels[candidatura.status]}
                    </span>
                  </div>

                  <div className="mt-3 grid gap-2 text-sm text-gray-600 dark:text-gray-400 sm:grid-cols-2">
                    <p>
                      <strong className="text-gray-800 dark:text-gray-200">
                        Cidade:
                      </strong>{" "}
                      {candidatura.oportunidade.cidade || "Não informada"}
                    </p>

                    <p>
                      <strong className="text-gray-800 dark:text-gray-200">
                        Modalidade:
                      </strong>{" "}
                      {candidatura.oportunidade.modalidade || "Não informada"}
                    </p>

                    <p>
                      <strong className="text-gray-800 dark:text-gray-200">
                        Tipo de contratação:
                      </strong>{" "}
                      {candidatura.oportunidade.tipoContratacao ||
                        "Não informado"}
                    </p>

                    <p>
                      <strong className="text-gray-800 dark:text-gray-200">
                        Data da candidatura:
                      </strong>{" "}
                      {formatarData(candidatura.createdAt)}
                    </p>
                  </div>
                </article>
              ))}
            </div>
          )}
        </section>
      )}
    </div>
  );
}
