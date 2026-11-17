
"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";
import { useRouter } from "next/navigation";
import { destroyCookie } from "nookies";
import { isAxiosError } from "axios";
import { bancoTalentosEmpresaApi } from "@/services/bancoTalentosEmpresaApi";

interface DadosEmpresa {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
  representante: string;
  email: string;
  telefone: string;
  cidade: string | null;
  descricao: string | null;
  status: string;
}

interface DadosSessao {
  id: string;
  nome: string;
  email: string;
  empresa: DadosEmpresa;
}

interface Oportunidade {
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
  status: "RASCUNHO" | "PUBLICADA" | "ENCERRADA";
  createdAt: string;
  _count: {
    candidaturas: number;
  };
}

interface FormularioOportunidade {
  titulo: string;
  descricao: string;
  requisitos: string;
  atividades: string;
  cidade: string;
  modalidade: string;
  tipoContratacao: string;
  jornada: string;
  salario: string;
  beneficios: string;
  prazoCandidatura: string;
}

interface PerfilProfissional {
  objetivoProfissional: string | null;
  resumo: string | null;
  cidade: string | null;
  bairro: string | null;
  disponibilidade: string | null;
  telefoneContato: string | null;
  curriculoUrl: string | null;
}

interface MatriculaCandidato {
  id: string;
  cronograma: {
    tema: string;
    data_fim: string;
  } | null;
}

interface Candidato {
  id: string;
  oportunidadeId: string;
  alunoId: string;
  status: "EM_ANALISE" | "CONTATADO" | "SELECIONADO" | "RECUSADO";
  createdAt: string;
  aluno: {
    id: string;
    nome: string;
    email: string | null;
    celular: string;
    matriculas: MatriculaCandidato[];
    perfilProfissional: PerfilProfissional | null;
  };
}

const formularioInicial: FormularioOportunidade = {
  titulo: "",
  descricao: "",
  requisitos: "",
  atividades: "",
  cidade: "",
  modalidade: "",
  tipoContratacao: "",
  jornada: "",
  salario: "",
  beneficios: "",
  prazoCandidatura: "",
};

const inputClass =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:border-fuchsia-500 focus:ring-2 focus:ring-fuchsia-500/20 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";

const labelClass =
  "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

const cardClass =
  "rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-800 dark:bg-gray-900";

function mensagemErro(error: unknown, padrao: string): string {
  if (isAxiosError(error)) {
    return error.response?.data?.error || padrao;
  }

  return padrao;
}

function formatarData(data: string): string {
  if (!data) return "Não informada";

  const dataSimples = data.match(/^(\d{4})-(\d{2})-(\d{2})$/);

  if (dataSimples) {
    return `${dataSimples[3]}/${dataSimples[2]}/${dataSimples[1]}`;
  }

  const dataFormatada = new Date(data);

  if (Number.isNaN(dataFormatada.getTime())) {
    return data;
  }

  return dataFormatada.toLocaleDateString("pt-BR");
}

function formatarSalario(valor: number | string | null): string {
  if (valor === null || valor === "") return "A combinar";

  const numero = Number(valor);

  if (!Number.isFinite(numero)) return "A combinar";

  return numero.toLocaleString("pt-BR", {
    style: "currency",
    currency: "BRL",
  });
}

function dataParaInput(valor: string | null): string {
  if (!valor) return "";

  const data = new Date(valor);

  if (Number.isNaN(data.getTime())) return "";

  const ano = data.getFullYear();
  const mes = String(data.getMonth() + 1).padStart(2, "0");
  const dia = String(data.getDate()).padStart(2, "0");

  return `${ano}-${mes}-${dia}`;
}

function statusOportunidade(status: Oportunidade["status"]): string {
  const nomes: Record<Oportunidade["status"], string> = {
    RASCUNHO: "Rascunho",
    PUBLICADA: "Publicada",
    ENCERRADA: "Encerrada",
  };

  return nomes[status];
}

function statusCandidato(status: Candidato["status"]): string {
  const nomes: Record<Candidato["status"], string> = {
    EM_ANALISE: "Em análise",
    CONTATADO: "Contatado",
    SELECIONADO: "Selecionado",
    RECUSADO: "Não selecionado",
  };

  return nomes[status];
}

export default function PainelEmpresaPage() {
  const router = useRouter();

  const [sessao, setSessao] = useState<DadosSessao | null>(null);
  const [oportunidades, setOportunidades] = useState<Oportunidade[]>([]);
  const [candidatos, setCandidatos] = useState<Candidato[]>([]);

  const [carregando, setCarregando] = useState(true);
  const [carregandoOportunidades, setCarregandoOportunidades] = useState(false);
  const [carregandoCandidatos, setCarregandoCandidatos] = useState(false);

  const [erro, setErro] = useState("");
  const [mensagem, setMensagem] = useState("");

  const [dadosEmpresaAberto, setDadosEmpresaAberto] = useState(false);

  const [informacoesCandidatosAbertas, setInformacoesCandidatosAbertas] =
    useState<Record<string, boolean>>({});

  const [modalAberto, setModalAberto] = useState(false);
  const [salvando, setSalvando] = useState(false);
  const [editandoId, setEditandoId] = useState<string | null>(null);
  const [formulario, setFormulario] =
    useState<FormularioOportunidade>(formularioInicial);

  const [oportunidadeSelecionada, setOportunidadeSelecionada] =
    useState<Oportunidade | null>(null);

  const [aba, setAba] = useState<"oportunidades" | "candidatos">(
    "oportunidades"
  );

  const sair = useCallback(() => {
    destroyCookie(undefined, "@nextauth.empresa.token", {
      path: "/",
    });

    router.replace("/banco-talentos/empresa/acesso");
  }, [router]);

  const carregarOportunidades = useCallback(async () => {
    setCarregandoOportunidades(true);

    try {
      const resposta = await bancoTalentosEmpresaApi.get<Oportunidade[]>(
        "/banco-talentos/empresas/oportunidades"
      );

      setOportunidades(resposta.data);
    } catch (error: unknown) {
      const status = isAxiosError(error)
        ? error.response?.status
        : undefined;

      if (status === 401 || status === 403) {
        sair();
        return;
      }

      setErro(
        mensagemErro(error, "Não foi possível carregar as oportunidades.")
      );
    } finally {
      setCarregandoOportunidades(false);
    }
  }, [sair]);

  const carregarSessao = useCallback(async () => {
    setCarregando(true);
    setErro("");

    try {
      const resposta = await bancoTalentosEmpresaApi.get<DadosSessao>(
        "/banco-talentos/empresas/me"
      );

      setSessao(resposta.data);

      const oportunidadesResposta =
        await bancoTalentosEmpresaApi.get<Oportunidade[]>(
          "/banco-talentos/empresas/oportunidades"
        );

      setOportunidades(oportunidadesResposta.data);
    } catch (error: unknown) {
      const status = isAxiosError(error)
        ? error.response?.status
        : undefined;

      if (status === 401 || status === 403) {
        sair();
        return;
      }

      setErro(mensagemErro(error, "Não foi possível carregar o painel."));
    } finally {
      setCarregando(false);
    }
  }, [sair]);

  useEffect(() => {
    void carregarSessao();
  }, [carregarSessao]);

  function abrirNovaOportunidade() {
    setEditandoId(null);
    setFormulario(formularioInicial);
    setMensagem("");
    setModalAberto(true);
  }

  function abrirEdicao(oportunidade: Oportunidade) {
    setEditandoId(oportunidade.id);

    setFormulario({
      titulo: oportunidade.titulo,
      descricao: oportunidade.descricao,
      requisitos: oportunidade.requisitos || "",
      atividades: oportunidade.atividades || "",
      cidade: oportunidade.cidade || "",
      modalidade: oportunidade.modalidade || "",
      tipoContratacao: oportunidade.tipoContratacao || "",
      jornada: oportunidade.jornada || "",
      salario:
        oportunidade.salario === null
          ? ""
          : String(oportunidade.salario),
      beneficios: oportunidade.beneficios || "",
      prazoCandidatura: dataParaInput(oportunidade.prazoCandidatura),
    });

    setMensagem("");
    setModalAberto(true);
  }

  function atualizarCampo(
    campo: keyof FormularioOportunidade,
    valor: string
  ) {
    setFormulario((atual) => ({
      ...atual,
      [campo]: valor,
    }));
  }

  async function salvarOportunidade(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvando(true);
    setMensagem("");

    const dados = {
      ...formulario,
      salario: formulario.salario
        ? Number(formulario.salario)
        : null,
      prazoCandidatura: formulario.prazoCandidatura
        ? `${formulario.prazoCandidatura}T23:59:59`
        : null,
    };

    try {
      if (editandoId) {
        await bancoTalentosEmpresaApi.patch(
          `/banco-talentos/empresas/oportunidades/${editandoId}`,
          dados
        );

        setMensagem("Oportunidade atualizada com sucesso.");
      } else {
        await bancoTalentosEmpresaApi.post(
          "/banco-talentos/empresas/oportunidades",
          dados
        );

        setMensagem("Oportunidade cadastrada com sucesso.");
      }

      setModalAberto(false);
      setFormulario(formularioInicial);
      setEditandoId(null);

      await carregarOportunidades();
    } catch (error: unknown) {
      setMensagem(
        mensagemErro(error, "Não foi possível salvar a oportunidade.")
      );
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus(
    oportunidade: Oportunidade,
    status: "RASCUNHO" | "PUBLICADA" | "ENCERRADA"
  ) {
    const confirmacoes: Record<string, string> = {
      PUBLICADA: "Deseja publicar esta oportunidade para os alunos?",
      RASCUNHO: "Deseja retirar esta oportunidade da publicação?",
      ENCERRADA:
        "Deseja encerrar esta oportunidade? Esta ação não poderá ser desfeita.",
    };

    if (!window.confirm(confirmacoes[status])) return;

    setMensagem("");

    try {
      await bancoTalentosEmpresaApi.patch(
        `/banco-talentos/empresas/oportunidades/${oportunidade.id}/status`,
        { status }
      );

      setMensagem("Status da oportunidade atualizado com sucesso.");
      await carregarOportunidades();
    } catch (error: unknown) {
      setMensagem(
        mensagemErro(error, "Não foi possível alterar o status.")
      );
    }
  }

  async function visualizarCandidatos(oportunidade: Oportunidade) {
    setOportunidadeSelecionada(oportunidade);
    setAba("candidatos");
    setCarregandoCandidatos(true);
    setMensagem("");

    setInformacoesCandidatosAbertas({});

    try {
      const resposta = await bancoTalentosEmpresaApi.get<Candidato[]>(
        `/banco-talentos/empresas/oportunidades/${oportunidade.id}/candidatos`
      );

      setCandidatos(resposta.data);
    } catch (error: unknown) {
      setMensagem(
        mensagemErro(error, "Não foi possível carregar os candidatos.")
      );
      setCandidatos([]);
    } finally {
      setCarregandoCandidatos(false);
    }
  }

  async function atualizarStatusCandidato(
    candidato: Candidato,
    status: Candidato["status"]
  ) {
    try {
      await bancoTalentosEmpresaApi.patch(
        `/banco-talentos/empresas/candidaturas/${candidato.id}/status`,
        { status }
      );

      setCandidatos((atuais) =>
        atuais.map((item) =>
          item.id === candidato.id
            ? { ...item, status }
            : item
        )
      );

      setMensagem("Status do candidato atualizado com sucesso.");
    } catch (error: unknown) {
      setMensagem(
        mensagemErro(error, "Não foi possível atualizar o candidato.")
      );
    }
  }

  function alternarInformacoesCandidato(candidatoId: string) {
    setInformacoesCandidatosAbertas((atuais) => ({
      ...atuais,
      [candidatoId]: !atuais[candidatoId],
    }));
  }

  function abrirConversaWhatsApp(candidato: Candidato) {
    let telefone = candidato.aluno.celular.replace(/\D/g, "");

    telefone = telefone.replace(/^0+/, "");

    if (!telefone.startsWith("55")) {
      telefone = `55${telefone}`;
    }

    if (telefone.length !== 12 && telefone.length !== 13) {
      setMensagem(
        `O celular cadastrado para ${candidato.aluno.nome} parece estar incompleto. Verifique o número antes de entrar em contato.`
      );
      return;
    }

    const nomeEmpresa =
      sessao?.empresa.nomeFantasia ||
      sessao?.empresa.razaoSocial ||
      "nossa empresa";

    const nomeVaga = oportunidadeSelecionada?.titulo || "oportunidade";

    const texto = `Olá, ${candidato.aluno.nome}! Sou da ${nomeEmpresa}. Recebemos sua candidatura para a vaga de ${nomeVaga}, gostaríamos de conversar com você sobre essa oportunidade. Podemos conversar?`;

    const url = `https://wa.me/${telefone}?text=${encodeURIComponent(texto)}`;

    window.open(url, "_blank", "noopener,noreferrer");
  }

  const empresa = sessao?.empresa;

  const totalPublicadas = oportunidades.filter(
    (item) => item.status === "PUBLICADA"
  ).length;

  const totalCandidatos = oportunidades.reduce(
    (total, item) => total + item._count.candidaturas,
    0
  );

  if (carregando) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 dark:bg-gray-950">
        <p className="text-gray-600 dark:text-gray-400">
          Carregando painel empresarial...
        </p>
      </main>
    );
  }

  if (erro && !sessao) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-gray-100 px-4 dark:bg-gray-950">
        <div className="w-full max-w-md rounded-xl border border-gray-200 bg-white p-6 text-center shadow-sm dark:border-gray-800 dark:bg-gray-900">
          <h1 className="text-xl font-semibold text-gray-900 dark:text-white">
            Não foi possível carregar o painel
          </h1>

          <p className="mt-3 text-sm text-red-600 dark:text-red-400">
            {erro}
          </p>

          <button
            type="button"
            onClick={() => void carregarSessao()}
            className="mt-5 rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white hover:bg-blue-800"
          >
            Tentar novamente
          </button>

          <button
            type="button"
            onClick={sair}
            className="ml-2 rounded-lg border border-gray-300 px-5 py-3 font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Sair
          </button>
        </div>
      </main>
    );
  }

  if (!sessao || !empresa) return null;

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-8 dark:bg-gray-950">
      <div className="mx-auto max-w-6xl">
        <header className="mb-8 flex flex-col justify-between gap-4 sm:flex-row sm:items-center">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 dark:text-white">
              Gerenciamento de Vagas de Emprego
            </h1>

            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
              Painel da empresa empregadora
            </p>
          </div>

          <button
            type="button"
            onClick={sair}
            className="rounded-lg border border-gray-300 px-5 py-2.5 text-sm font-semibold text-gray-700 hover:bg-gray-200 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
          >
            Sair
          </button>
        </header>

        <section className={`${cardClass} mb-6`}>
          <p className="text-sm text-gray-500 dark:text-gray-400">
            Bem-vindo(a),
          </p>

          <h2 className="mt-1 text-xl font-bold text-gray-900 dark:text-white">
            {sessao.nome}
          </h2>

          <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
            {sessao.email}
          </p>
        </section>

        <section className={`${cardClass} mb-6`}>
          <div className="flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-lg font-semibold text-gray-900 dark:text-white">
                Dados cadastrais da empresa
              </h2>

              <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                Consulte as informações do cadastro da empresa.
              </p>
            </div>

            <button
              type="button"
              onClick={() =>
                setDadosEmpresaAberto((atual) => !atual)
              }
              aria-expanded={dadosEmpresaAberto}
              className="inline-flex items-center justify-center gap-2 rounded-lg border border-fuchsia-300 px-4 py-2.5 text-sm font-semibold text-fuchsia-700 hover:bg-fuchsia-50 dark:border-fuchsia-800 dark:text-fuchsia-300 dark:hover:bg-fuchsia-950"
            >
              {dadosEmpresaAberto
                ? "Ocultar dados"
                : "Ver dados cadastrais"}

              <span aria-hidden="true">
                {dadosEmpresaAberto ? "▲" : "▼"}
              </span>
            </button>
          </div>

          {dadosEmpresaAberto && (
            <div className="mt-5 border-t border-gray-200 pt-5 dark:border-gray-700">
              <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
                {[
                  ["Razão social", empresa.razaoSocial],
                  ["Nome fantasia", empresa.nomeFantasia || "Não informado"],
                  ["CNPJ", empresa.cnpj],
                  ["Representante", empresa.representante],
                  ["E-mail", empresa.email],
                  ["Telefone", empresa.telefone],
                  ["Cidade", empresa.cidade || "Não informada"],
                  ["Situação cadastral", empresa.status],
                ].map(([label, valor]) => (
                  <div
                    key={label}
                    className="rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60"
                  >
                    <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                      {label}
                    </span>

                    <p className="wrap-break-word text-sm font-medium text-gray-900 dark:text-white">
                      {valor}
                    </p>
                  </div>
                ))}
              </div>

              {empresa.descricao && (
                <div className="mt-4 rounded-lg border border-gray-200 bg-gray-50 p-4 dark:border-gray-800 dark:bg-gray-800/60">
                  <span className="mb-1 block text-xs font-medium uppercase tracking-wide text-gray-500 dark:text-gray-400">
                    Descrição da empresa
                  </span>

                  <p className="whitespace-pre-wrap wrap-break-word text-sm text-gray-900 dark:text-white">
                    {empresa.descricao}
                  </p>
                </div>
              )}
            </div>
          )}
        </section>

        <section className="mb-6 grid grid-cols-1 gap-4 sm:grid-cols-3">
          <div className={cardClass}>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total de vagas
            </p>
            <p className="mt-2 text-3xl font-bold text-gray-900 dark:text-white">
              {oportunidades.length}
            </p>
          </div>

          <div className={cardClass}>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Vagas publicadas
            </p>
            <p className="mt-2 text-3xl font-bold text-green-600 dark:text-green-400">
              {totalPublicadas}
            </p>
          </div>

          <div className={cardClass}>
            <p className="text-sm text-gray-500 dark:text-gray-400">
              Total de candidaturas
            </p>
            <p className="mt-2 text-3xl font-bold text-fuchsia-700 dark:text-fuchsia-300">
              {totalCandidatos}
            </p>
          </div>
        </section>

        {mensagem && (
          <div
            role="status"
            className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/40 dark:text-blue-200"
          >
            {mensagem}
          </div>
        )}

        <section className={cardClass}>
          <div className="mb-5 flex flex-col justify-between gap-3 sm:flex-row sm:items-center">
            <div>
              <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                Área de oportunidades
              </h2>

              <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                Gerencie suas vagas e acompanhe os candidatos.
              </p>
            </div>

            <button
              type="button"
              onClick={abrirNovaOportunidade}
              className="rounded-lg bg-fuchsia-700 px-5 py-3 text-sm font-semibold text-white hover:bg-fuchsia-800"
            >
              + Nova vaga
            </button>
          </div>

          <div className="mb-5 flex flex-wrap gap-2 border-b border-gray-200 pb-3 dark:border-gray-700">
            <button
              type="button"
              onClick={() => {
                setAba("oportunidades");
                setOportunidadeSelecionada(null);
              }}
              className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                aba === "oportunidades"
                  ? "bg-fuchsia-700 text-white"
                  : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
              }`}
            >
              Vagas de oportunidades
            </button>

            {oportunidadeSelecionada && (
              <button
                type="button"
                onClick={() => setAba("candidatos")}
                className={`rounded-lg px-4 py-2 text-sm font-semibold ${
                  aba === "candidatos"
                    ? "bg-fuchsia-700 text-white"
                    : "bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-300"
                }`}
              >
                Candidatos
              </button>
            )}

            <button
              type="button"
              onClick={() => void carregarOportunidades()}
              className="ml-auto rounded-lg border border-gray-300 px-3 py-2 text-sm text-gray-700 hover:bg-gray-100 dark:border-gray-700 dark:text-gray-300 dark:hover:bg-gray-800"
            >
              Atualizar
            </button>
          </div>

          {aba === "oportunidades" && (
            <>
              {carregandoOportunidades ? (
                <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                  Carregando oportunidades...
                </p>
              ) : oportunidades.length === 0 ? (
                <div className="rounded-lg bg-gray-50 p-8 text-center dark:bg-gray-800/50">
                  <p className="font-medium text-gray-800 dark:text-gray-200">
                    Nenhuma oportunidade cadastrada.
                  </p>
                  <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                    Clique em Nova oportunidade para cadastrar sua primeira vaga.
                  </p>
                </div>
              ) : (
                <div className="space-y-4">
                  {oportunidades.map((oportunidade) => (
                    <article
                      key={oportunidade.id}
                      className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                    >
                      <div className="flex flex-col justify-between gap-3 sm:flex-row">
                        <div className="min-w-0">
                          <div className="flex flex-wrap items-center gap-2">
                            <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                              {oportunidade.titulo}
                            </h3>

                            <span
                              className={`rounded-full px-3 py-1 text-xs font-semibold ${
                                oportunidade.status === "PUBLICADA"
                                  ? "bg-green-100 text-green-800 dark:bg-green-950 dark:text-green-300"
                                  : oportunidade.status === "ENCERRADA"
                                    ? "bg-red-100 text-red-800 dark:bg-red-950 dark:text-red-300"
                                    : "bg-yellow-100 text-yellow-800 dark:bg-yellow-950 dark:text-yellow-300"
                              }`}
                            >
                              {statusOportunidade(oportunidade.status)}
                            </span>
                          </div>

                          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                            {oportunidade.cidade || "Cidade não informada"}
                            {" • "}
                            {oportunidade.modalidade || "Modalidade não informada"}
                            {" • "}
                            {oportunidade.tipoContratacao || "Tipo não informado"}
                          </p>

                          <p className="mt-2 text-sm text-gray-700 dark:text-gray-300">
                            {formatarSalario(oportunidade.salario)}
                          </p>

                          <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                            Cadastrada em {formatarData(oportunidade.createdAt)}
                            {" • "}
                            {oportunidade._count.candidaturas} candidatura(s)
                          </p>

                          {oportunidade.prazoCandidatura && (
                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Prazo: {formatarData(oportunidade.prazoCandidatura)}
                            </p>
                          )}
                        </div>

                        <div className="flex flex-wrap items-start gap-2">
                          <button
                            type="button"
                            onClick={() => void visualizarCandidatos(oportunidade)}
                            className="rounded-lg border border-blue-300 px-3 py-2 text-xs font-semibold text-blue-700 hover:bg-blue-50 dark:border-blue-800 dark:text-blue-300 dark:hover:bg-blue-950"
                          >
                            Candidatos ({oportunidade._count.candidaturas})
                          </button>

                          {oportunidade.status !== "ENCERRADA" && (
                            <button
                              type="button"
                              onClick={() => abrirEdicao(oportunidade)}
                              className="rounded-lg border border-gray-300 px-3 py-2 text-xs font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                            >
                              Editar
                            </button>
                          )}
                        </div>
                      </div>

                      {oportunidade.status !== "ENCERRADA" && (
                        <div className="mt-4 flex flex-wrap gap-2 border-t border-gray-200 pt-3 dark:border-gray-700">
                          {oportunidade.status === "RASCUNHO" ? (
                            <button
                              type="button"
                              onClick={() =>
                                void alterarStatus(oportunidade, "PUBLICADA")
                              }
                              className="rounded-lg bg-green-700 px-4 py-2 text-xs font-semibold text-white hover:bg-green-800"
                            >
                              Publicar oportunidade
                            </button>
                          ) : (
                            <button
                              type="button"
                              onClick={() =>
                                void alterarStatus(oportunidade, "RASCUNHO")
                              }
                              className="rounded-lg border border-yellow-400 px-4 py-2 text-xs font-semibold text-yellow-700 hover:bg-yellow-50 dark:border-yellow-700 dark:text-yellow-300 dark:hover:bg-yellow-950"
                            >
                              Retirar publicação
                            </button>
                          )}

                          <button
                            type="button"
                            onClick={() =>
                              void alterarStatus(oportunidade, "ENCERRADA")
                            }
                            className="rounded-lg border border-red-300 px-4 py-2 text-xs font-semibold text-red-700 hover:bg-red-50 dark:border-red-900 dark:text-red-300 dark:hover:bg-red-950"
                          >
                            Encerrar oportunidade
                          </button>
                        </div>
                      )}
                    </article>
                  ))}
                </div>
              )}
            </>
          )}

          {aba === "candidatos" && oportunidadeSelecionada && (
            <div>
              <div className="mb-5">
                <h3 className="text-lg font-bold text-gray-900 dark:text-white">
                  Candidatos: {oportunidadeSelecionada.titulo}
                </h3>

                <button
                  type="button"
                  onClick={() => setAba("oportunidades")}
                  className="mt-2 text-sm font-medium text-fuchsia-700 hover:underline dark:text-fuchsia-300"
                >
                  Voltar às oportunidades
                </button>
              </div>

              {carregandoCandidatos ? (
                <p className="py-8 text-center text-gray-500 dark:text-gray-400">
                  Carregando candidatos...
                </p>
              ) : candidatos.length === 0 ? (
                <p className="rounded-lg bg-gray-50 p-6 text-center text-sm text-gray-600 dark:bg-gray-800 dark:text-gray-300">
                  Esta oportunidade ainda não recebeu candidaturas.
                </p>
              ) : (
                <div className="space-y-4">
                  {candidatos.map((candidato) => {
                    const perfil = candidato.aluno.perfilProfissional;

                    const cursosRealizados = candidato.aluno.matriculas
                      .filter((matricula) => matricula.cronograma !== null)
                      .map((matricula) => ({
                        id: matricula.id,
                        tema: matricula.cronograma!.tema,
                        dataConclusao: matricula.cronograma!.data_fim,
                      }));

                    const informacoesAbertas =
                      Boolean(informacoesCandidatosAbertas[candidato.id]);

                    return (
                      <article
                        key={candidato.id}
                        className="rounded-xl border border-gray-200 p-4 dark:border-gray-700"
                      >
                        <div className="flex flex-col justify-between gap-4 sm:flex-row">
                          <div className="min-w-0">
                            <h4 className="text-lg font-bold text-gray-900 dark:text-white">
                              {candidato.aluno.nome}
                            </h4>

                            <p className="mt-1 text-sm text-gray-600 dark:text-gray-400">
                              E-mail: {candidato.aluno.email || "Não informado"}
                            </p>

                            <p className="text-sm text-gray-600 dark:text-gray-400">
                              Celular: {candidato.aluno.celular || "Não informado"}
                            </p>

                            <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                              Candidatura em {formatarData(candidato.createdAt)}
                            </p>

                            {/* Botões lado a lado */}
                            <div className="mt-3 flex flex-wrap items-center gap-2">
                              <button
                                type="button"
                                onClick={() => abrirConversaWhatsApp(candidato)}
                                disabled={!candidato.aluno.celular}
                                className="inline-flex items-center gap-2 rounded-lg bg-green-600 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-green-700 disabled:cursor-not-allowed disabled:opacity-50"
                              >
                                <svg
                                  xmlns="http://www.w3.org/2000/svg"
                                  viewBox="0 0 24 24"
                                  fill="currentColor"
                                  className="h-5 w-5"
                                  aria-hidden="true"
                                >
                                  <path d="M20.52 3.48A11.82 11.82 0 0 0 12.08 0C5.52 0 .18 5.34.18 11.9c0 2.1.55 4.15 1.6 5.96L.08 24l6.3-1.65a11.9 11.9 0 0 0 5.7 1.45h.01c6.56 0 11.9-5.34 11.9-11.9 0-3.18-1.24-6.17-3.47-8.42ZM12.09 21.8h-.01a9.9 9.9 0 0 1-5.04-1.38l-.36-.21-3.74.98 1-3.65-.24-.37a9.85 9.85 0 0 1-1.52-5.27c0-5.46 4.45-9.9 9.92-9.9a9.82 9.82 0 0 1 7 2.9 9.84 9.84 0 0 1 2.9 7c0 5.46-4.45 9.9-9.91 9.9Zm5.44-7.42c-.3-.15-1.76-.87-2.03-.97-.27-.1-.47-.15-.67.15-.2.3-.77.97-.94 1.17-.17.2-.35.22-.65.07-.3-.15-1.26-.47-2.4-1.5-.89-.79-1.49-1.77-1.67-2.07-.17-.3-.02-.46.13-.61.13-.13.3-.35.45-.52.15-.17.2-.3.3-.5.1-.2.05-.37-.02-.52-.07-.15-.67-1.62-.92-2.22-.24-.58-.49-.5-.67-.51h-.57c-.2 0-.52.07-.79.37-.27.3-1.04 1.02-1.04 2.49s1.07 2.89 1.22 3.09c.15.2 2.1 3.2 5.08 4.48.71.31 1.26.49 1.69.63.71.23 1.36.2 1.87.12.57-.08 1.76-.72 2.01-1.42.25-.7.25-1.3.17-1.42-.07-.13-.27-.2-.57-.35Z" />
                                </svg>
                                Conversar pelo WhatsApp
                              </button>

                              <button
                                type="button"
                                onClick={() =>
                                  alternarInformacoesCandidato(candidato.id)
                                }
                                aria-expanded={informacoesAbertas}
                                aria-controls={`informacoes-${candidato.id}`}
                                className="inline-flex items-center gap-2 rounded-lg border border-fuchsia-300 px-4 py-2.5 text-sm font-semibold text-fuchsia-700 transition hover:bg-fuchsia-50 dark:border-fuchsia-800 dark:text-fuchsia-300 dark:hover:bg-fuchsia-950"
                              >
                                {informacoesAbertas
                                  ? "Ocultar informações"
                                  : "Mais informações do aluno"}

                                <span aria-hidden="true">
                                  {informacoesAbertas ? "▲" : "▼"}
                                </span>
                              </button>
                            </div>
                          </div>

                          <div className="sm:min-w-52">
                            <label
                              className={labelClass}
                              htmlFor={`status-${candidato.id}`}
                            >
                              Situação da candidatura
                            </label>

                            <select
                              id={`status-${candidato.id}`}
                              className={inputClass}
                              value={candidato.status}
                              onChange={(event) =>
                                void atualizarStatusCandidato(
                                  candidato,
                                  event.target.value as Candidato["status"]
                                )
                              }
                            >
                              <option value="EM_ANALISE">Em análise</option>
                              <option value="CONTATADO">Contatado</option>
                              <option value="SELECIONADO">Selecionado</option>
                              <option value="RECUSADO">Não selecionado</option>
                            </select>

                            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                              Atual: {statusCandidato(candidato.status)}
                            </p>
                          </div>
                        </div>

                        {informacoesAbertas && (
                          <div
                            id={`informacoes-${candidato.id}`}
                            className="mt-5 space-y-5 border-t border-gray-200 pt-5 dark:border-gray-700"
                          >
                            <section>
                              <h5 className="mb-3 text-sm font-bold text-gray-900 dark:text-white">
                                Cursos realizados na Secretaria da Mulher
                              </h5>

                              {cursosRealizados.length > 0 ? (
                                <div className="space-y-2">
                                  {cursosRealizados.map((curso) => (
                                    <div
                                      key={curso.id}
                                      className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"
                                    >
                                      <p className="text-sm font-semibold text-gray-800 dark:text-gray-200">
                                        {curso.tema}
                                      </p>

                                      <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">
                                        Conclusão: {formatarData(curso.dataConclusao)}
                                      </p>
                                    </div>
                                  ))}
                                </div>
                              ) : (
                                <p className="text-sm text-gray-500 dark:text-gray-400">
                                  Nenhum curso aprovado encontrado.
                                </p>
                              )}
                            </section>

                            {perfil ? (
                              <section className="space-y-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                                <h5 className="text-sm font-bold text-gray-900 dark:text-white">
                                  Perfil profissional
                                </h5>

                                {perfil.objetivoProfissional && (
                                  <div className="rounded-lg border border-fuchsia-200 bg-fuchsia-50 p-3 dark:border-fuchsia-900 dark:bg-fuchsia-950/30">
                                    <p className="mb-1 text-sm font-bold text-fuchsia-700 dark:text-fuchsia-300">
                                      Objetivo profissional
                                    </p>
                                    <p className="text-sm text-gray-800 dark:text-gray-200">
                                      {perfil.objetivoProfissional}
                                    </p>
                                  </div>
                                )}

                                {perfil.resumo && (
                                  <div className="rounded-lg border border-blue-200 bg-blue-50 p-3 dark:border-blue-900 dark:bg-blue-950/30">
                                    <p className="mb-1 text-sm font-bold text-blue-700 dark:text-blue-300">
                                      Apresentação profissional
                                    </p>
                                    <p className="whitespace-pre-wrap text-sm text-gray-800 dark:text-gray-200">
                                      {perfil.resumo}
                                    </p>
                                  </div>
                                )}

                                {(perfil.cidade || perfil.bairro) && (
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Localização: {[perfil.bairro, perfil.cidade]
                                      .filter(Boolean)
                                      .join(" - ")}
                                  </p>
                                )}

                                {perfil.disponibilidade && (
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Disponibilidade: {perfil.disponibilidade}
                                  </p>
                                )}

                                {perfil.telefoneContato && (
                                  <p className="text-sm text-gray-700 dark:text-gray-300">
                                    Telefone para contato: {perfil.telefoneContato}
                                  </p>
                                )}

                                {perfil.curriculoUrl && (
                                  <a
                                    href={
                                      perfil.curriculoUrl.startsWith("http")
                                        ? perfil.curriculoUrl
                                        : `${process.env.NEXT_PUBLIC_API_URL || ""}${perfil.curriculoUrl}`
                                    }
                                    target="_blank"
                                    rel="noopener noreferrer"
                                    className="inline-flex rounded-lg bg-fuchsia-700 px-4 py-2 text-sm font-semibold text-white hover:bg-fuchsia-800"
                                  >
                                    Visualizar currículo
                                  </a>
                                )}
                              </section>
                            ) : (
                              <p className="text-sm text-gray-500 dark:text-gray-400">
                                O aluno ainda não preencheu o perfil profissional.
                              </p>
                            )}
                          </div>
                        )}
                      </article>
                    );
                  })}
                </div>
              )}
            </div>
          )}
        </section>

        <footer className="mt-8 text-center text-xs text-gray-500 dark:text-gray-500">
          GestãoM — Gerenciamento
        </footer>
      </div>

      {modalAberto && (
        <div
          className="fixed inset-0 z-50 flex items-center justify-center overflow-hidden bg-black/60 p-3 sm:p-6"
          onMouseDown={(event) => {
            if (event.target === event.currentTarget && !salvando) {
              setModalAberto(false);
            }
          }}
        >
          <div className="flex max-h-[calc(100dvh-24px)] w-full max-w-3xl flex-col overflow-hidden rounded-xl border border-gray-200 bg-white shadow-xl dark:border-gray-700 dark:bg-gray-900 sm:max-h-[calc(100dvh-48px)]">
            <div className="flex items-center justify-between border-b border-gray-200 p-5 dark:border-gray-700">
              <div>
                <h2 className="text-xl font-bold text-gray-900 dark:text-white">
                  {editandoId ? "Editar oportunidade" : "Nova vaga"}
                </h2>

                <p className="mt-1 text-sm text-gray-500 dark:text-gray-400">
                  Preencha as informações da vaga.
                </p>
              </div>

              <button
                type="button"
                disabled={salvando}
                onClick={() => setModalAberto(false)}
                className="rounded-lg px-3 py-2 text-gray-500 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
              >
                Fechar
              </button>
            </div>

            <form
              onSubmit={salvarOportunidade}
              className="min-h-0 flex-1 space-y-4 overflow-y-auto p-5"
            >
              <div>
                <label className={labelClass} htmlFor="titulo">
                  Título da oportunidade *
                </label>
                <input
                  id="titulo"
                  required
                  maxLength={180}
                  className={inputClass}
                  value={formulario.titulo}
                  onChange={(event) =>
                    atualizarCampo("titulo", event.target.value)
                  }
                  placeholder="Ex.: Auxiliar Administrativo"
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="descricao">
                  Descrição da oportunidade *
                </label>
                <textarea
                  id="descricao"
                  required
                  maxLength={5000}
                  rows={4}
                  className={inputClass}
                  value={formulario.descricao}
                  onChange={(event) =>
                    atualizarCampo("descricao", event.target.value)
                  }
                  placeholder="Descreva a oportunidade e o perfil procurado."
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="requisitos">
                  Requisitos
                </label>
                <textarea
                  id="requisitos"
                  rows={3}
                  className={inputClass}
                  value={formulario.requisitos}
                  onChange={(event) =>
                    atualizarCampo("requisitos", event.target.value)
                  }
                />
              </div>

              <div>
                <label className={labelClass} htmlFor="atividades">
                  Atividades
                </label>
                <textarea
                  id="atividades"
                  rows={3}
                  className={inputClass}
                  value={formulario.atividades}
                  onChange={(event) =>
                    atualizarCampo("atividades", event.target.value)
                  }
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
                    value={formulario.cidade}
                    onChange={(event) =>
                      atualizarCampo("cidade", event.target.value)
                    }
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="modalidade">
                    Modalidade
                  </label>
                  <select
                    id="modalidade"
                    className={inputClass}
                    value={formulario.modalidade}
                    onChange={(event) =>
                      atualizarCampo("modalidade", event.target.value)
                    }
                  >
                    <option value="">Selecione</option>
                    <option value="Presencial">Presencial</option>
                    <option value="Híbrido">Híbrido</option>
                    <option value="Remoto">Remoto</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass} htmlFor="contratacao">
                    Tipo de contratação
                  </label>
                  <select
                    id="contratacao"
                    className={inputClass}
                    value={formulario.tipoContratacao}
                    onChange={(event) =>
                      atualizarCampo("tipoContratacao", event.target.value)
                    }
                  >
                    <option value="">Selecione</option>
                    <option value="CLT">CLT</option>
                    <option value="PJ">PJ</option>
                    <option value="Temporário">Temporário</option>
                    <option value="Estágio">Estágio</option>
                    <option value="Aprendiz">Jovem aprendiz</option>
                    <option value="Autônomo">Autônomo</option>
                    <option value="Outro">Outro</option>
                  </select>
                </div>

                <div>
                  <label className={labelClass} htmlFor="jornada">
                    Jornada de trabalho
                  </label>
                  <input
                    id="jornada"
                    className={inputClass}
                    value={formulario.jornada}
                    onChange={(event) =>
                      atualizarCampo("jornada", event.target.value)
                    }
                    placeholder="Ex.: Segunda a sexta, 8h às 17h"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="salario">
                    Salário (R$)
                  </label>
                  <input
                    id="salario"
                    type="number"
                    min="0"
                    step="0.01"
                    className={inputClass}
                    value={formulario.salario}
                    onChange={(event) =>
                      atualizarCampo("salario", event.target.value)
                    }
                    placeholder="Ex.: 2000"
                  />
                </div>

                <div>
                  <label className={labelClass} htmlFor="prazo">
                    Prazo para candidatura
                  </label>
                  <input
                    id="prazo"
                    type="date"
                    min={new Date().toLocaleDateString("en-CA")}
                    className={inputClass}
                    value={formulario.prazoCandidatura}
                    onChange={(event) =>
                      atualizarCampo("prazoCandidatura", event.target.value)
                    }
                  />
                </div>
              </div>

              <div>
                <label className={labelClass} htmlFor="beneficios">
                  Benefícios
                </label>
                <textarea
                  id="beneficios"
                  rows={2}
                  className={inputClass}
                  value={formulario.beneficios}
                  onChange={(event) =>
                    atualizarCampo("beneficios", event.target.value)
                  }
                  placeholder="Ex.: Vale-transporte, vale-refeição."
                />
              </div>

              <div className="flex flex-wrap justify-end gap-3 border-t border-gray-200 pt-4 dark:border-gray-700">
                <button
                  type="button"
                  disabled={salvando}
                  onClick={() => setModalAberto(false)}
                  className="rounded-lg border border-gray-300 px-5 py-3 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-300 dark:hover:bg-gray-800"
                >
                  Cancelar
                </button>

                <button
                  type="submit"
                  disabled={salvando}
                  className="rounded-lg bg-fuchsia-700 px-6 py-3 text-sm font-semibold text-white hover:bg-fuchsia-800 disabled:opacity-60"
                >
                  {salvando
                    ? "Salvando..."
                    : editandoId
                      ? "Salvar alterações"
                      : "Cadastrar oportunidade"}
                </button>
              </div>
            </form>
          </div>
        </div>
      )}
    </main>
  );
}
