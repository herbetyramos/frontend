"use client";

import { FormEvent, useEffect, useState } from "react";
import { destroyCookie } from "nookies";
import { useRouter } from "next/navigation";
import { bancoTalentosApi } from "@/services/bancoTalentosApi";

type Formacao = { id: string; cronograma: { tema: string; data_inicio: string; data_fim: string; detentoras: { curso: { nome_curso: string; segmento: { name: string } } } | null } | null };
type Perfil = { objetivoProfissional?: string | null; resumo?: string | null; cidade?: string | null; bairro?: string | null; disponibilidade?: string | null; telefoneContato?: string | null; ativo?: boolean };
type Aluno = { id: string; nome: string; email: string | null; celular: string; matriculas: Formacao[]; perfilProfissional: Perfil | null };

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
  const [loading, setLoading] = useState(true);
  const [salvando, setSalvando] = useState(false);
  const [mensagem, setMensagem] = useState("");

  useEffect(() => {
    bancoTalentosApi.get<Aluno>("/banco-talentos/aluno/me").then(({ data }) => {
      setAluno(data);
      const perfil = data.perfilProfissional;
      setObjetivoProfissional(perfil?.objetivoProfissional || "");
      setResumo(perfil?.resumo || "");
      setCidade(perfil?.cidade || "");
      setBairro(perfil?.bairro || "");
      setDisponibilidade(perfil?.disponibilidade || "");
      setTelefoneContato(perfil?.telefoneContato || "");
      setConsentir(Boolean(perfil?.ativo));
    }).catch(() => router.replace("/banco-talentos/acesso")).finally(() => setLoading(false));
  }, [router]);

  function sair() {
    destroyCookie(undefined, "@nextauth.aluno.token", { path: "/" });
    router.replace("/banco-talentos/acesso");
  }

  async function salvar(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setSalvando(true);
    setMensagem("");
    try {
      await bancoTalentosApi.put("/banco-talentos/aluno/perfil", { objetivoProfissional, resumo, cidade, bairro, disponibilidade, telefoneContato, consentir });
      setMensagem("Perfil atualizado com sucesso.");
    } catch {
      setMensagem("Não foi possível salvar o perfil. Tente novamente.");
    } finally {
      setSalvando(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-3 py-2.5 text-gray-900 outline-none focus:ring-2 focus:ring-fuchsia-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";
  const labelClass = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";
  if (loading) return <div className="mx-auto max-w-4xl py-12 text-center text-gray-600 dark:text-gray-300">Carregando seu perfil...</div>;
  if (!aluno) return null;

  return <div className="mx-auto max-w-4xl space-y-6 py-4">
    <div className="flex flex-wrap items-center justify-between gap-3">
      <div><p className="text-sm font-semibold text-fuchsia-700 dark:text-fuchsia-300">BANCO DE TALENTOS</p><h1 className="text-2xl font-bold text-gray-900 dark:text-white">Olá, {aluno.nome}</h1><p className="text-sm text-gray-600 dark:text-gray-400">Complete seu perfil profissional para participar das oportunidades.</p></div>
      <button type="button" onClick={sair} className="rounded-lg border border-gray-300 px-4 py-2 text-sm font-semibold text-gray-700 hover:bg-gray-100 dark:border-gray-600 dark:text-gray-200 dark:hover:bg-gray-800">Sair</button>
    </div>

    <section className="rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <h2 className="mb-3 text-lg font-bold text-gray-900 dark:text-white">Formações com aprovação registrada</h2>
      <div className="space-y-2">
        {aluno.matriculas.map((matricula) => <div key={matricula.id} className="rounded-lg bg-gray-50 p-3 dark:bg-gray-800"><p className="font-semibold text-gray-900 dark:text-gray-100">{matricula.cronograma?.detentoras?.curso.nome_curso || matricula.cronograma?.tema || "Curso"}</p><p className="text-sm text-gray-600 dark:text-gray-400">{matricula.cronograma?.detentoras?.curso.segmento.name || "Segmento não informado"}</p><p className="text-xs text-gray-500 dark:text-gray-400">Conclusão prevista: {matricula.cronograma?.data_fim || "Não informada"}</p></div>)}
      </div>
    </section>

    <form onSubmit={salvar} className="space-y-5 rounded-xl border border-gray-200 bg-white p-5 dark:border-gray-700 dark:bg-gray-900">
      <div><h2 className="text-lg font-bold text-gray-900 dark:text-white">Meu perfil profissional</h2><p className="text-sm text-gray-600 dark:text-gray-400">Você poderá atualizar estas informações quando precisar.</p></div>
      <div><label className={labelClass} htmlFor="objetivo">Objetivo profissional</label><input id="objetivo" className={inputClass} value={objetivoProfissional} onChange={(e) => setObjetivoProfissional(e.target.value)} maxLength={180} placeholder="Ex.: Atuar na área de gastronomia" /></div>
      <div><label className={labelClass} htmlFor="resumo">Apresentação profissional</label><textarea id="resumo" className={`${inputClass} min-h-28`} value={resumo} onChange={(e) => setResumo(e.target.value)} maxLength={2000} placeholder="Conte um pouco sobre suas experiências, conhecimentos e interesses." /></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass} htmlFor="cidade">Cidade</label><input id="cidade" className={inputClass} value={cidade} onChange={(e) => setCidade(e.target.value)} /></div><div><label className={labelClass} htmlFor="bairro">Bairro</label><input id="bairro" className={inputClass} value={bairro} onChange={(e) => setBairro(e.target.value)} /></div></div>
      <div className="grid gap-4 sm:grid-cols-2"><div><label className={labelClass} htmlFor="disponibilidade">Disponibilidade</label><select id="disponibilidade" className={inputClass} value={disponibilidade} onChange={(e) => setDisponibilidade(e.target.value)}><option value="">Selecione</option><option value="IMEDIATA">Imediata</option><option value="MANHA">Manhã</option><option value="TARDE">Tarde</option><option value="NOITE">Noite</option><option value="INTEGRAL">Integral</option></select></div><div><label className={labelClass} htmlFor="telefone">Telefone para contato</label><input id="telefone" className={inputClass} value={telefoneContato} onChange={(e) => setTelefoneContato(e.target.value)} placeholder="(11) 99999-9999" /></div></div>
      <label className="flex items-start gap-3 rounded-lg border border-fuchsia-200 bg-fuchsia-50 p-3 text-sm text-fuchsia-950 dark:border-fuchsia-900 dark:bg-fuchsia-950/30 dark:text-fuchsia-100"><input type="checkbox" checked={consentir} onChange={(e) => setConsentir(e.target.checked)} className="mt-1 h-4 w-4 accent-fuchsia-700" /><span>Autorizo a Secretaria a disponibilizar meu perfil profissional às empresas empregadoras aprovadas no Banco de Talentos, conforme as finalidades do programa. Posso desativar esta autorização posteriormente.</span></label>
      {mensagem && <p role="status" className="text-sm text-gray-700 dark:text-gray-300">{mensagem}</p>}
      <button type="submit" disabled={salvando} className="rounded-lg bg-fuchsia-700 px-6 py-3 font-semibold text-white hover:bg-fuchsia-800 disabled:opacity-60">{salvando ? "Salvando..." : "Salvar perfil"}</button>
    </form>
  </div>;
}
