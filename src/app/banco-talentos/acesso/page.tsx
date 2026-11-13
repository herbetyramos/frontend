"use client";

import { FormEvent, useState } from "react";
import { setCookie } from "nookies";
import { useRouter } from "next/navigation";
import { bancoTalentosApi } from "@/services/bancoTalentosApi";

export default function BancoTalentosAcessoPage() {
  const router = useRouter();
  const [modo, setModo] = useState<"login" | "ativar">("login");
  const [cpf, setCpf] = useState("");
  const [codigo, setCodigo] = useState("");
  const [senha, setSenha] = useState("");
  const [confirmarSenha, setConfirmarSenha] = useState("");
  const [erro, setErro] = useState("");
  const [loading, setLoading] = useState(false);

  function formatarCpf(valor: string) {
    const numeros = valor.replace(/\D/g, "").slice(0, 11);
    return numeros.replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  }

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setErro("");
    if (modo === "ativar" && senha !== confirmarSenha) {
      setErro("As senhas informadas não são iguais.");
      return;
    }
    setLoading(true);
    try {
      const endpoint = modo === "ativar"
        ? "/banco-talentos/aluno/ativar"
        : "/banco-talentos/aluno/login";
      const payload = modo === "ativar"
        ? { cpf, codigo, senha }
        : { cpf, senha };
      const response = await bancoTalentosApi.post(endpoint, payload);
      setCookie(undefined, "@nextauth.aluno.token", response.data.token, {
        maxAge: 60 * 60 * 12,
        path: "/",
        sameSite: "lax",
        secure: process.env.NODE_ENV === "production",
      });
      router.push("/banco-talentos/perfil");
      router.refresh();
    } catch (error: unknown) {
      if (typeof error === "object" && error !== null && "response" in error) {
        const response = (error as { response?: { data?: { error?: string } } }).response;
        setErro(response?.data?.error || "Não foi possível acessar. Verifique os dados e tente novamente.");
      } else {
        setErro("Não foi possível acessar. Tente novamente.");
      }
    } finally {
      setLoading(false);
    }
  }

  const inputClass = "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:ring-2 focus:ring-fuchsia-500 dark:border-gray-600 dark:bg-gray-800 dark:text-gray-100";
  const labelClass = "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <div className="mx-auto flex min-h-[calc(100vh-6rem)] max-w-lg items-center justify-center py-8">
      <div className="w-full rounded-2xl border border-gray-200 bg-white p-6 shadow-xl dark:border-gray-700 dark:bg-gray-900 sm:p-8">
        <div className="mb-6 text-center">
          <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-full bg-fuchsia-100 text-2xl dark:bg-fuchsia-900/40">💼</div>
          <h1 className="text-2xl font-bold text-gray-900 dark:text-white">Banco de Talentos</h1>
          <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">Oportunidades profissionais para alunos concluintes dos cursos da Secretaria.</p>
        </div>

        <div className="mb-6 grid grid-cols-2 rounded-lg bg-gray-100 p-1 dark:bg-gray-800">
          <button type="button" onClick={() => { setModo("login"); setErro(""); }} className={`rounded-md px-3 py-2 text-sm font-semibold ${modo === "login" ? "bg-white text-fuchsia-700 shadow dark:bg-gray-700 dark:text-fuchsia-300" : "text-gray-600 dark:text-gray-300"}`}>Já tenho acesso</button>
          <button type="button" onClick={() => { setModo("ativar"); setErro(""); }} className={`rounded-md px-3 py-2 text-sm font-semibold ${modo === "ativar" ? "bg-white text-fuchsia-700 shadow dark:bg-gray-700 dark:text-fuchsia-300" : "text-gray-600 dark:text-gray-300"}`}>Primeiro acesso</button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className={labelClass} htmlFor="cpf">CPF cadastrado no GestãoM</label>
            <input id="cpf" className={inputClass} value={cpf} onChange={(event) => setCpf(formatarCpf(event.target.value))} placeholder="000.000.000-00" inputMode="numeric" autoComplete="username" required />
          </div>
          {modo === "ativar" && <div>
            <label className={labelClass} htmlFor="codigo">Código individual de ativação</label>
            <input id="codigo" className={inputClass} value={codigo} onChange={(event) => setCodigo(event.target.value.toUpperCase().replace(/[^A-F0-9]/g, "").slice(0, 8))} placeholder="Ex.: A1B2C3D4" autoComplete="one-time-code" required />
            <p className="mt-1 text-xs text-gray-500 dark:text-gray-400">Solicite o código à Secretaria. Ele possui validade limitada e só pode ser utilizado uma vez.</p>
          </div>}
          <div>
            <label className={labelClass} htmlFor="senha">Senha</label>
            <input id="senha" type="password" className={inputClass} value={senha} onChange={(event) => setSenha(event.target.value)} minLength={8} autoComplete={modo === "ativar" ? "new-password" : "current-password"} required placeholder="Mínimo de 8 caracteres" />
          </div>
          {modo === "ativar" && <div>
            <label className={labelClass} htmlFor="confirmarSenha">Confirme a senha</label>
            <input id="confirmarSenha" type="password" className={inputClass} value={confirmarSenha} onChange={(event) => setConfirmarSenha(event.target.value)} minLength={8} autoComplete="new-password" required />
          </div>}
          {erro && <p role="alert" className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-sm text-red-700 dark:border-red-800 dark:bg-red-950/40 dark:text-red-300">{erro}</p>}
          <button type="submit" disabled={loading} className="w-full rounded-lg bg-fuchsia-700 px-4 py-3 font-semibold text-white transition hover:bg-fuchsia-800 disabled:cursor-not-allowed disabled:opacity-60">{loading ? "Aguarde..." : modo === "ativar" ? "Ativar meu acesso" : "Entrar no Banco de Talentos"}</button>
        </form>
        <p className="mt-5 text-center text-xs text-gray-500 dark:text-gray-400">O acesso é independente da conta administrativa do GestãoM.</p>
      </div>
    </div>
  );
}
