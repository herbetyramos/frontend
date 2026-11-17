
"use client";

import { FormEvent, useState } from "react";
import Link from "next/link";
import { bancoTalentosEmpresaApi } from "@/services/bancoTalentosEmpresaApi";

interface CadastroEmpresa {
  razaoSocial: string;
  nomeFantasia: string;
  cnpj: string;
  representante: string;
  email: string;
  telefone: string;
  cidade: string;
  descricao: string;
  senha: string;
  confirmarSenha: string;
}

export default function CadastroEmpresaPage() {
  const [form, setForm] = useState<CadastroEmpresa>({
    razaoSocial: "",
    nomeFantasia: "",
    cnpj: "",
    representante: "",
    email: "",
    telefone: "",
    cidade: "",
    descricao: "",
    senha: "",
    confirmarSenha: "",
  });

  const [carregando, setCarregando] = useState(false);
  const [erro, setErro] = useState("");
  const [sucesso, setSucesso] = useState("");

  function atualizarCampo(
    campo: keyof CadastroEmpresa,
    valor: string
  ) {
    setForm((anterior) => ({
      ...anterior,
      [campo]: valor,
    }));
  }

  async function cadastrarEmpresa(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    setErro("");
    setSucesso("");

    const cnpj = form.cnpj.replace(/\D/g, "");

    if (cnpj.length !== 14) {
      setErro("Informe um CNPJ com 14 dígitos.");
      return;
    }

    if (form.senha.length < 8) {
      setErro("A senha deve ter pelo menos 8 caracteres.");
      return;
    }

    if (form.senha !== form.confirmarSenha) {
      setErro("As senhas não coincidem.");
      return;
    }

    setCarregando(true);

    try {
      const resposta = await bancoTalentosEmpresaApi.post(
        "/banco-talentos/empresas/cadastro",
        {
          razaoSocial: form.razaoSocial,
          nomeFantasia: form.nomeFantasia,
          cnpj,
          representante: form.representante,
          email: form.email,
          telefone: form.telefone,
          cidade: form.cidade,
          descricao: form.descricao,
          senha: form.senha,
        }
      );

      setSucesso(
        resposta.data.mensagem ||
          "Cadastro realizado. Aguarde a aprovação da Secretaria."
      );

      setForm({
        razaoSocial: "",
        nomeFantasia: "",
        cnpj: "",
        representante: "",
        email: "",
        telefone: "",
        cidade: "",
        descricao: "",
        senha: "",
        confirmarSenha: "",
      });
    } catch (error: unknown) {
      let mensagem = "Não foi possível realizar o cadastro.";

      if (
        typeof error === "object" &&
        error !== null &&
        "response" in error
      ) {
        const resposta = (
          error as {
            response?: {
              data?: {
                error?: string;
              };
            };
          }
        ).response;

        mensagem = resposta?.data?.error || mensagem;
      }

      setErro(mensagem);
    } finally {
      setCarregando(false);
    }
  }

  const estiloCampo =
    "w-full rounded-lg border border-gray-300 bg-white px-4 py-3 text-gray-900 outline-none focus:border-blue-600 dark:border-gray-700 dark:bg-gray-800 dark:text-white";

  const estiloLabel =
    "mb-1 block text-sm font-medium text-gray-700 dark:text-gray-300";

  return (
    <main className="min-h-screen bg-gray-100 px-4 py-10 dark:bg-gray-950">
      <div className="mx-auto max-w-3xl">
        <div className="mb-8 text-center">
          <h1 className="text-3xl font-bold text-gray-900 dark:text-white">
            Banco de Talentos
          </h1>

          <p className="mt-2 text-gray-600 dark:text-gray-400">
            Cadastro de empresa empregadora
          </p>
        </div>

        <div className="rounded-xl border border-gray-200 bg-white p-6 shadow-sm dark:border-gray-800 dark:bg-gray-900 md:p-8">
          <h2 className="mb-2 text-xl font-semibold text-gray-900 dark:text-white">
            Dados da empresa
          </h2>

          <p className="mb-6 text-sm text-gray-600 dark:text-gray-400">
            Preencha os dados para solicitar acesso ao Banco de Talentos
            do GestãoM.
          </p>

          {sucesso ? (
            <div className="rounded-lg border border-green-300 bg-green-50 p-5 dark:border-green-800 dark:bg-green-950">
              <h3 className="font-semibold text-green-800 dark:text-green-300">
                Cadastro realizado!
              </h3>

              <p className="mt-2 text-sm text-green-700 dark:text-green-400">
                {sucesso}
              </p>

              <p className="mt-3 text-sm text-green-700 dark:text-green-400">
                Após a aprovação, você poderá entrar no painel empresarial
                utilizando seu e-mail e senha.
              </p>

              <Link
                href="/banco-talentos/empresa/acesso"
                className="mt-5 inline-block rounded-lg bg-blue-700 px-5 py-3 text-sm font-semibold text-white hover:bg-blue-800"
              >
                Ir para acesso empresarial
              </Link>
            </div>
          ) : (
            <form onSubmit={cadastrarEmpresa} className="space-y-5">
              <div>
                <label className={estiloLabel}>
                  Razão social *
                </label>
                <input
                  className={estiloCampo}
                  value={form.razaoSocial}
                  onChange={(e) =>
                    atualizarCampo("razaoSocial", e.target.value)
                  }
                  required
                  maxLength={200}
                />
              </div>

              <div>
                <label className={estiloLabel}>
                  Nome fantasia
                </label>
                <input
                  className={estiloCampo}
                  value={form.nomeFantasia}
                  onChange={(e) =>
                    atualizarCampo("nomeFantasia", e.target.value)
                  }
                  maxLength={200}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={estiloLabel}>
                    CNPJ *
                  </label>
                  <input
                    className={estiloCampo}
                    value={form.cnpj}
                    onChange={(e) =>
                      atualizarCampo(
                        "cnpj",
                        e.target.value.replace(/\D/g, "").slice(0, 14)
                      )
                    }
                    inputMode="numeric"
                    placeholder="Somente números"
                    required
                    maxLength={14}
                  />
                </div>

                <div>
                  <label className={estiloLabel}>
                    Telefone *
                  </label>
                  <input
                    className={estiloCampo}
                    value={form.telefone}
                    onChange={(e) =>
                      atualizarCampo("telefone", e.target.value)
                    }
                    required
                    maxLength={30}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>

              <div>
                <label className={estiloLabel}>
                  Nome do representante *
                </label>
                <input
                  className={estiloCampo}
                  value={form.representante}
                  onChange={(e) =>
                    atualizarCampo("representante", e.target.value)
                  }
                  required
                  maxLength={150}
                />
              </div>

              <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                <div>
                  <label className={estiloLabel}>
                    E-mail de acesso *
                  </label>
                  <input
                    type="email"
                    className={estiloCampo}
                    value={form.email}
                    onChange={(e) =>
                      atualizarCampo("email", e.target.value)
                    }
                    required
                    maxLength={200}
                  />
                </div>

                <div>
                  <label className={estiloLabel}>
                    Cidade
                  </label>
                  <input
                    className={estiloCampo}
                    value={form.cidade}
                    onChange={(e) =>
                      atualizarCampo("cidade", e.target.value)
                    }
                    maxLength={120}
                  />
                </div>
              </div>

              <div>
                <label className={estiloLabel}>
                  Descrição da empresa
                </label>
                <textarea
                  className={estiloCampo}
                  value={form.descricao}
                  onChange={(e) =>
                    atualizarCampo("descricao", e.target.value)
                  }
                  rows={3}
                  maxLength={1000}
                  placeholder="Conte um pouco sobre a empresa e suas atividades."
                />
              </div>

              <div className="border-t border-gray-200 pt-5 dark:border-gray-800">
                <h3 className="mb-4 font-semibold text-gray-900 dark:text-white">
                  Criar senha de acesso
                </h3>

                <div className="grid grid-cols-1 gap-5 md:grid-cols-2">
                  <div>
                    <label className={estiloLabel}>
                      Senha *
                    </label>
                    <input
                      type="password"
                      className={estiloCampo}
                      value={form.senha}
                      onChange={(e) =>
                        atualizarCampo("senha", e.target.value)
                      }
                      required
                      minLength={8}
                      maxLength={72}
                      autoComplete="new-password"
                    />
                  </div>

                  <div>
                    <label className={estiloLabel}>
                      Confirmar senha *
                    </label>
                    <input
                      type="password"
                      className={estiloCampo}
                      value={form.confirmarSenha}
                      onChange={(e) =>
                        atualizarCampo("confirmarSenha", e.target.value)
                      }
                      required
                      minLength={8}
                      maxLength={72}
                      autoComplete="new-password"
                    />
                  </div>
                </div>

                <p className="mt-2 text-xs text-gray-500 dark:text-gray-400">
                  A senha deve ter pelo menos 8 caracteres.
                </p>
              </div>

              {erro && (
                <div className="rounded-lg border border-red-300 bg-red-50 p-3 text-sm text-red-700 dark:border-red-800 dark:bg-red-950 dark:text-red-300">
                  {erro}
                </div>
              )}

              <button
                type="submit"
                disabled={carregando}
                className="w-full rounded-lg bg-blue-700 px-5 py-3 font-semibold text-white transition hover:bg-blue-800 disabled:cursor-not-allowed disabled:opacity-60"
              >
                {carregando ? "Enviando cadastro..." : "Cadastrar empresa"}
              </button>

              <p className="text-center text-sm text-gray-600 dark:text-gray-400">
                Já possui cadastro?{" "}
                <Link
                  href="/banco-talentos/empresa/acesso"
                  className="font-semibold text-blue-700 hover:underline dark:text-blue-400"
                >
                  Acessar painel empresarial
                </Link>
              </p>
            </form>
          )}
        </div>
      </div>
    </main>
  );
}
