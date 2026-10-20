
"use client";

import {
  FormEvent,
  useCallback,
  useEffect,
  useState,
} from "react";

import { setupAPIClient } from "../../services/api";
import { toast } from "react-toastify";
import axios from "axios";

interface ProfessorType {
  id: string;
  nome_professor: string;
  telefone: string;
  Endereco: string;
  bairro: string;
  Numero: string;
  contato: string;
  CPF: string;
  especialidade: string;
  foto: string | null;
}

const inputClassName =
  "w-full rounded-lg border border-gray-300 bg-white px-3 py-2 text-gray-900 dark:border-gray-600 dark:bg-gray-800 dark:text-white";

export default function Professor() {
  const [nome_professor, setNome] = useState("");
  const [telefone, setTelefone] = useState("");
  const [endereco, setEndereco] = useState("");
  const [bairro, setBairro] = useState("");
  const [numero, setNumero] = useState("");
  const [cpf, setCpf] = useState("");
  const [especialidade, setEspecialidade] = useState("");
  const [contato, setContato] = useState("");
  const [foto, setFoto] = useState<File | null>(null);

  const [professores, setProfessores] = useState<ProfessorType[]>([]);
  const [pesquisa, setPesquisa] = useState("");
  const [professorSelecionado, setProfessorSelecionado] =
    useState<string | null>(null);
  const [fotoAtual, setFotoAtual] = useState<string | null>(null);

  const [carregando, setCarregando] = useState(false);
  const [salvando, setSalvando] = useState(false);

  const modoEdicao = professorSelecionado !== null;

  const tratarErro = (error: unknown, mensagem: string) => {
    if (axios.isAxiosError(error)) {
      toast.error(
        error.response?.data?.error ??
          error.response?.data?.message ??
          mensagem
      );
      return;
    }

    toast.error(mensagem);
  };

  const carregarProfessores = useCallback(async () => {
    setCarregando(true);

    try {
      const apiClient = setupAPIClient();

      const response = await apiClient.get<ProfessorType[]>(
        "/professor"
      );

      setProfessores(response.data);
    } catch (error: unknown) {
      tratarErro(error, "Erro ao carregar os professores.");
    } finally {
      setCarregando(false);
    }
  }, []);

  useEffect(() => {
    void carregarProfessores();
  }, [carregarProfessores]);

  function limparFormulario() {
    setNome("");
    setTelefone("");
    setEndereco("");
    setBairro("");
    setNumero("");
    setCpf("");
    setEspecialidade("");
    setContato("");
    setFoto(null);
    setFotoAtual(null);
    setProfessorSelecionado(null);
  }

  function criarFormulario() {
    const data = new FormData();

    data.append("nome_professor", nome_professor.trim());
    data.append("telefone", telefone.trim());
    data.append("Endereco", endereco.trim());
    data.append("bairro", bairro.trim());
    data.append("Numero", numero.trim());
    data.append("contato", contato.trim());
    data.append("CPF", cpf.trim());
    data.append("especialidade", especialidade.trim());

    if (foto) {
      data.append("file", foto);
    }

    return data;
  }

  async function handleRegister(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (
      !nome_professor.trim() ||
      !endereco.trim() ||
      !bairro.trim() ||
      !numero.trim() ||
      !telefone.trim() ||
      !cpf.trim() ||
      !especialidade.trim() ||
      !contato.trim()
    ) {
      toast.error("Preencha todos os campos.");
      return;
    }

    setSalvando(true);

    try {
      const apiClient = setupAPIClient();
      const data = criarFormulario();

      if (modoEdicao && professorSelecionado) {
        await apiClient.put(
          `/professor/${professorSelecionado}`,
          data
        );

        toast.success("Professor atualizado com sucesso!");
      } else {
        await apiClient.post("/professor", data);

        toast.success("Professor cadastrado com sucesso!");
      }

      limparFormulario();
      await carregarProfessores();
    } catch (error: unknown) {
      tratarErro(
        error,
        modoEdicao
          ? "Erro ao atualizar o professor."
          : "Erro ao cadastrar o professor."
      );
    } finally {
      setSalvando(false);
    }
  }

  async function selecionarProfessor(id: string) {
    try {
      const apiClient = setupAPIClient();

      const response = await apiClient.get<ProfessorType>(
        `/professor/${id}`
      );

      const professor = response.data;

      setProfessorSelecionado(professor.id);
      setNome(professor.nome_professor ?? "");
      setTelefone(professor.telefone ?? "");
      setEndereco(professor.Endereco ?? "");
      setBairro(professor.bairro ?? "");
      setNumero(professor.Numero ?? "");
      setCpf(professor.CPF ?? "");
      setEspecialidade(professor.especialidade ?? "");
      setContato(professor.contato ?? "");
      setFoto(null);
      setFotoAtual(professor.foto ?? null);

      window.scrollTo({
        top: 0,
        behavior: "smooth",
      });
    } catch (error: unknown) {
      tratarErro(error, "Erro ao consultar os dados do professor.");
    }
  }

  async function excluirProfessor(professor: ProfessorType) {
    const confirmar = window.confirm(
      `Deseja realmente excluir o cadastro de ${professor.nome_professor}?`
    );

    if (!confirmar) {
      return;
    }

    try {
      const apiClient = setupAPIClient();

      await apiClient.delete(`/professor/${professor.id}`);

      toast.success("Professor excluído com sucesso!");

      if (professorSelecionado === professor.id) {
        limparFormulario();
      }

      await carregarProfessores();
    } catch (error: unknown) {
      tratarErro(
        error,
        "Não foi possível excluir o professor."
      );
    }
  }

  const professoresFiltrados = professores.filter((professor) =>
    professor.nome_professor
      .toLocaleLowerCase("pt-BR")
      .includes(pesquisa.trim().toLocaleLowerCase("pt-BR"))
  );

  return (
    <div className="mx-auto max-w-4xl space-y-8 p-4 text-gray-900 dark:text-gray-100 sm:p-6">
      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
        <h1 className="mb-6 text-center text-2xl font-bold">
          {modoEdicao
            ? "Editar Professor"
            : "Cadastro de Professor"}
        </h1>

        {modoEdicao && (
          <div className="mb-5 rounded-lg border border-blue-200 bg-blue-50 p-3 text-sm text-blue-800 dark:border-blue-800 dark:bg-blue-950 dark:text-blue-200">
            Editando o cadastro de <strong>{nome_professor}</strong>.
          </div>
        )}

        <form onSubmit={handleRegister} className="space-y-4">
          <div>
            <label className="mb-1 block text-sm font-medium">
              Nome do professor
            </label>
            <input
              value={nome_professor}
              onChange={(event) => setNome(event.target.value)}
              placeholder="Nome do professor"
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Endereço
            </label>
            <input
              value={endereco}
              onChange={(event) => setEndereco(event.target.value)}
              placeholder="Endereço"
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Número
            </label>
            <input
              value={numero}
              onChange={(event) => setNumero(event.target.value)}
              placeholder="Número"
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Bairro
            </label>
            <input
              value={bairro}
              onChange={(event) => setBairro(event.target.value)}
              placeholder="Bairro"
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Telefone
            </label>
            <input
              value={telefone}
              onChange={(event) => setTelefone(event.target.value)}
              placeholder="Telefone"
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              CPF
            </label>
            <input
              value={cpf}
              onChange={(event) => setCpf(event.target.value)}
              placeholder="CPF"
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Especialidade
            </label>
            <input
              value={especialidade}
              onChange={(event) =>
                setEspecialidade(event.target.value)
              }
              placeholder="Especialidade"
              className={inputClassName}
              required
            />
          </div>

          <div>
            <label className="mb-1 block text-sm font-medium">
              Contato
            </label>
            <input
              value={contato}
              onChange={(event) => setContato(event.target.value)}
              placeholder="Contato"
              className={inputClassName}
              required
            />
          </div>

          {modoEdicao && fotoAtual && (
            <p className="text-sm text-gray-600 dark:text-gray-300">
              Este professor já possui uma foto cadastrada. Selecione
              outra abaixo somente se desejar substituí-la.
            </p>
          )}

          <div>
            <label className="mb-1 block text-sm font-medium">
              Foto do professor {modoEdicao ? "(opcional)" : ""}
            </label>
            <input
              type="file"
              accept="image/*"
              onChange={(event) =>
                setFoto(event.target.files?.[0] ?? null)
              }
              className={inputClassName}
            />
          </div>

          <div className="flex flex-col gap-3 sm:flex-row">
            <button
              type="submit"
              disabled={salvando}
              className="w-full rounded-lg bg-blue-600 px-4 py-2 font-medium text-white hover:bg-blue-700 disabled:cursor-not-allowed disabled:opacity-60"
            >
              {salvando
                ? "Salvando..."
                : modoEdicao
                  ? "Salvar alterações"
                  : "Cadastrar professor"}
            </button>

            {modoEdicao && (
              <button
                type="button"
                onClick={limparFormulario}
                disabled={salvando}
                className="w-full rounded-lg bg-gray-500 px-4 py-2 font-medium text-white hover:bg-gray-600 disabled:opacity-60"
              >
                Cancelar edição
              </button>
            )}
          </div>
        </form>
      </section>

      <section className="rounded-xl border border-gray-200 bg-white p-5 shadow-sm dark:border-gray-700 dark:bg-gray-900 sm:p-6">
        <h2 className="mb-4 text-xl font-bold">
          Localizar e gerenciar professores
        </h2>

        <input
          value={pesquisa}
          onChange={(event) => setPesquisa(event.target.value)}
          placeholder="Pesquisar pelo nome do professor..."
          className={inputClassName}
        />

        <div className="mt-4 flex items-center justify-between gap-3">
          <p className="text-sm text-gray-600 dark:text-gray-300">
            {professoresFiltrados.length} professor(es) encontrado(s)
          </p>

          <button
            type="button"
            onClick={() => void carregarProfessores()}
            disabled={carregando}
            className="rounded-lg border border-gray-300 px-3 py-2 text-sm hover:bg-gray-100 disabled:opacity-60 dark:border-gray-600 dark:hover:bg-gray-800"
          >
            {carregando ? "Atualizando..." : "Atualizar lista"}
          </button>
        </div>

        {carregando ? (
          <p className="py-6 text-center text-gray-600 dark:text-gray-300">
            Carregando professores...
          </p>
        ) : professoresFiltrados.length === 0 ? (
          <p className="py-6 text-center text-gray-600 dark:text-gray-300">
            Nenhum professor encontrado.
          </p>
        ) : (
          <ul className="mt-4 divide-y divide-gray-200 dark:divide-gray-700">
            {professoresFiltrados.map((professor) => (
              <li
                key={professor.id}
                className="flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between"
              >
                <div className="min-w-0">
                  <p className="wrap-break-words font-semibold">
                    {professor.nome_professor}
                  </p>
                  <p className="text-sm text-gray-600 dark:text-gray-300">
                    ID: {professor.id}
                  </p>
                </div>

                <div className="flex shrink-0 gap-2">
                  <button
                    type="button"
                    onClick={() =>
                      void selecionarProfessor(professor.id)
                    }
                    className="rounded-lg bg-amber-500 px-3 py-2 text-sm font-medium text-white hover:bg-amber-600"
                  >
                    Editar
                  </button>

                  <button
                    type="button"
                    onClick={() =>
                      void excluirProfessor(professor)
                    }
                    className="rounded-lg bg-red-600 px-3 py-2 text-sm font-medium text-white hover:bg-red-700"
                  >
                    Excluir
                  </button>
                </div>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
