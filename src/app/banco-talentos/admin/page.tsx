"use client";

import { FormEvent, useEffect, useState } from "react";
import { api } from "@/services/api";

type Aluno = {
  id: string;
  nome: string;
  CPF: string;
  email: string | null;
  celular: string;
  acessoAtivado: boolean;
  perfilProfissional: { ativo: boolean } | null;
};
type Empresa = {
  id: string;
  razaoSocial: string;
  nomeFantasia: string | null;
  cnpj: string;
  representante: string;
  email: string;
  telefone: string;
  cidade: string | null;
  status: "PENDENTE" | "APROVADA" | "REPROVADA" | "SUSPENSA";
};

const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 outline-none focus:ring-2 focus:ring-fuchsia-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";
const labelClass = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

export default function BancoTalentosAdminPage() {
  const [aba, setAba] = useState<"alunos" | "empresas">("alunos");
  const [alunos, setAlunos] = useState<Aluno[]>([]);
  const [empresas, setEmpresas] = useState<Empresa[]>([]);
  const [codigoGerado, setCodigoGerado] = useState<{ nome: string; codigo: string; validadeHoras: number } | null>(null);
  const [mensagem, setMensagem] = useState("");
  const [carregando, setCarregando] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [form, setForm] = useState({ razaoSocial: "", nomeFantasia: "", cnpj: "", representante: "", email: "", telefone: "", cidade: "", descricao: "" });

  async function carregar() {
    setCarregando(true);
    try {
      const [alunosResponse, empresasResponse] = await Promise.all([
        api.get<Aluno[]>("/banco-talentos/admin/alunos-elegiveis"),
        api.get<Empresa[]>("/banco-talentos/admin/empresas"),
      ]);
      setAlunos(alunosResponse.data);
      setEmpresas(empresasResponse.data);
    } catch {
      setMensagem("Não foi possível carregar os dados. Verifique seu acesso administrativo.");
    } finally {
      setCarregando(false);
    }
  }

  useEffect(() => { void carregar(); }, []);

  async function gerarCodigo(aluno: Aluno) {
    setCodigoGerado(null);
    setMensagem("");
    try {
      const response = await api.post(`/banco-talentos/admin/alunos/${aluno.id}/codigo-ativacao`);
      setCodigoGerado({ nome: response.data.aluno, codigo: response.data.codigo, validadeHoras: response.data.validadeHoras });
      await carregar();
    } catch (error: unknown) {
      setMensagem("Não foi possível gerar o código de ativação.");
    }
  }

  async function cadastrarEmpresa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvando(true);
    setMensagem("");
    try {
      await api.post("/banco-talentos/admin/empresas", form);
      setForm({ razaoSocial: "", nomeFantasia: "", cnpj: "", representante: "", email: "", telefone: "", cidade: "", descricao: "" });
      setMensagem("Empresa empregadora cadastrada como pendente de aprovação.");
      await carregar();
    } catch {
      setMensagem("Não foi possível cadastrar a empresa. Confira os dados e o CNPJ.");
    } finally {
      setSalvando(false);
    }
  }

  async function alterarStatus(empresa: Empresa, status: Empresa["status"]) {
    const motivoStatus = status === "REPROVADA" || status === "SUSPENSA"
      ? window.prompt("Informe o motivo (opcional):") || ""
      : "";
    try {
      await api.patch(`/banco-talentos/admin/empresas/${empresa.id}/status`, { status, motivoStatus });
      await carregar();
    } catch {
      setMensagem("Não foi possível atualizar o status da empresa.");
    }
  }

  return <div className="mx-auto max-w-6xl space-y-5 py-4">
    <div><p className="text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-300">GESTÃO ADMINISTRATIVA</p><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Banco de Talentos</h1><p className="text-sm text-gray-600 dark:text-gray-400">Gerencie a elegibilidade dos alunos e as empresas empregadoras parceiras.</p></div>
    <div className="flex gap-2 border-b border-gray-200 dark:border-gray-700">
      <button type="button" onClick={() => setAba("alunos")} className={`border-b-2 px-4 py-3 text-sm font-semibold ${aba === "alunos" ? "border-fuchsia-600 text-fuchsia-700 dark:text-fuchsia-300" : "border-transparent text-gray-600 dark:text-gray-300"}`}>Alunos elegíveis ({alunos.length})</button>
      <button type="button" onClick={() => setAba("empresas")} className={`border-b-2 px-4 py-3 text-sm font-semibold ${aba === "empresas" ? "border-fuchsia-600 text-fuchsia-700 dark:text-fuchsia-300" : "border-transparent text-gray-600 dark:text-gray-300"}`}>Empresas empregadoras ({empresas.length})</button>
    </div>
    {mensagem && <p role="status" className="rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-900 dark:bg-blue-950/30 dark:text-blue-200">{mensagem}</p>}
    {codigoGerado && <div className="rounded-xl border border-emerald-300 bg-emerald-50 p-4 dark:border-emerald-800 dark:bg-emerald-950/30"><p className="text-sm font-semibold text-emerald-900 dark:text-emerald-200">Código para {codigoGerado.nome}</p><div className="my-2 flex flex-wrap items-center gap-3"><span className="font-mono text-2xl font-bold tracking-[0.25em] text-emerald-950 dark:text-emerald-100">{codigoGerado.codigo}</span><button type="button" onClick={() => navigator.clipboard.writeText(codigoGerado.codigo)} className="rounded-lg border border-emerald-400 px-3 py-1.5 text-sm font-semibold text-emerald-900 dark:text-emerald-200">Copiar código</button></div><p className="text-xs text-emerald-800 dark:text-emerald-300">Válido por {codigoGerado.validadeHoras} horas. O código só aparece nesta tela agora; entregue diretamente ao aluno.</p></div>}

    {carregando ? <p className="py-8 text-center text-gray-600 dark:text-gray-300">Carregando...</p> : aba === "alunos" ? <section className="overflow-hidden rounded-xl border border-gray-200 bg-white dark:border-gray-700 dark:bg-gray-900"><div className="overflow-x-auto"><table className="w-full min-w-760px text-left text-sm"><thead className="bg-gray-100 text-gray-700 dark:bg-gray-800 dark:text-gray-200"><tr><th className="p-3">Aluno</th><th className="p-3">CPF</th><th className="p-3">Contato</th><th className="p-3">Acesso</th><th className="p-3">Perfil</th><th className="p-3">Ação</th></tr></thead><tbody>{alunos.map((aluno) => <tr key={aluno.id} className="border-t border-gray-200 dark:border-gray-700"><td className="p-3 font-medium text-gray-900 dark:text-gray-100">{aluno.nome}</td><td className="p-3 text-gray-700 dark:text-gray-300">{aluno.CPF}</td><td className="p-3 text-gray-700 dark:text-gray-300">{aluno.email || aluno.celular}</td><td className="p-3">{aluno.acessoAtivado ? <span className="text-emerald-700 dark:text-emerald-300">Ativado</span> : <span className="text-amber-700 dark:text-amber-300">Não ativado</span>}</td><td className="p-3">{aluno.perfilProfissional?.ativo ? "Publicado" : "Não publicado"}</td><td className="p-3"><button type="button" disabled={aluno.acessoAtivado} onClick={() => void gerarCodigo(aluno)} className="rounded-lg bg-fuchsia-700 px-3 py-2 text-xs font-semibold text-white hover:bg-fuchsia-800 disabled:cursor-not-allowed disabled:opacity-50">{aluno.acessoAtivado ? "Acesso ativado" : "Gerar código"}</button></td></tr>)}</tbody></table></div></section> : <div className="grid gap-5 lg:grid-cols-[minmax(0,1fr)_minmax(320px,0.9fr)]">
      <section className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"><h2 className="mb-4 text-lg font-bold text-gray-900 dark:text-white">Cadastrar empresa empregadora</h2><form onSubmit={cadastrarEmpresa} className="space-y-3">{([ ["razaoSocial", "Razão social"], ["nomeFantasia", "Nome fantasia"], ["cnpj", "CNPJ (somente números)"], ["representante", "Representante"], ["email", "E-mail"], ["telefone", "Telefone"], ["cidade", "Cidade"] ] as const).map(([key, label]) => <div key={key}><label className={labelClass} htmlFor={key}>{label}</label><input id={key} className={inputClass} required={key !== "nomeFantasia" && key !== "cidade"} value={form[key]} onChange={(e) => setForm((old) => ({ ...old, [key]: e.target.value }))} /></div>)}<div><label className={labelClass} htmlFor="descricao">Descrição</label><textarea id="descricao" className={inputClass} value={form.descricao} onChange={(e) => setForm((old) => ({ ...old, descricao: e.target.value }))} /></div><button disabled={salvando} className="w-full rounded-lg bg-fuchsia-700 px-4 py-3 font-semibold text-white disabled:opacity-60">{salvando ? "Salvando..." : "Cadastrar empresa"}</button></form></section>
      <section className="space-y-3"><h2 className="text-lg font-bold text-gray-900 dark:text-white">Empresas cadastradas</h2>{empresas.map((empresa) => <article key={empresa.id} className="rounded-xl border border-gray-200 bg-white p-4 dark:border-gray-700 dark:bg-gray-900"><div className="flex flex-wrap items-start justify-between gap-2"><div><h3 className="font-semibold text-gray-900 dark:text-white">{empresa.nomeFantasia || empresa.razaoSocial}</h3><p className="text-xs text-gray-500 dark:text-gray-400">{empresa.cnpj} · {empresa.cidade || "Cidade não informada"}</p><p className="mt-1 text-sm text-gray-600 dark:text-gray-300">{empresa.representante} · {empresa.email}</p></div><span className="rounded-full bg-gray-100 px-2 py-1 text-xs font-semibold text-gray-700 dark:bg-gray-800 dark:text-gray-200">{empresa.status}</span></div><div className="mt-3 flex flex-wrap gap-2"><button type="button" onClick={() => void alterarStatus(empresa, "APROVADA")} className="rounded-md bg-emerald-700 px-3 py-1.5 text-xs font-semibold text-white">Aprovar</button><button type="button" onClick={() => void alterarStatus(empresa, "REPROVADA")} className="rounded-md bg-red-700 px-3 py-1.5 text-xs font-semibold text-white">Reprovar</button><button type="button" onClick={() => void alterarStatus(empresa, "SUSPENSA")} className="rounded-md bg-amber-700 px-3 py-1.5 text-xs font-semibold text-white">Suspender</button></div></article>)}{empresas.length === 0 && <p className="text-sm text-gray-500 dark:text-gray-400">Nenhuma empresa cadastrada.</p>}</section>
    </div>}
  </div>;
}
