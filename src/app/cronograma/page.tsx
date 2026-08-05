 "use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

// Tipos
type LocalType = { id: string; polo: string };
type SalaType = { id: string; numero_sala: string; local_id: string; };
type ProfessorType = { id: string; nome_professor: string };
type FormaturaType = { id: string; data_formatura: string };
type BlocoType = { id: string; bloco_Curso: string };
import { toast } from "react-toastify";


type DetentoraType = {
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
};

type SaldoDetentora = {
  id: string;
  empresa: string;
  ata: string;
  curso: string;
  contratado: number;
  utilizadas: number;
  saldo: number;
};

export default function Cronograma() {
  const [locaisList, setLocaisList] = useState<LocalType[]>([]);
  const [blocoCurso, setBlocos] = useState<BlocoType[]>([]);
  const [salas, setSalas] = useState<SalaType[]>([]);
  const [professores, setProfessores] = useState<ProfessorType[]>([]);
  const [detentoras, setDetentoras] = useState<DetentoraType[]>([]);
  const [formaturas, setFormaturas] = useState<FormaturaType[]>([]);

  // Formulário
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
  const [is_status, setStatus] = useState("ativo");
  const [periodo, setPeriodo] = useState("");
  const [link_inscricao, setLink_inscricao,] = useState("");
  const [mostrarSaldo, setMostrarSaldo] = useState(false);

  // ==============================
// SALDO DA DETENTORA
// ==============================

const [saldoDetentora, setSaldoDetentora] =
  useState<SaldoDetentora | null>(null);

const [loadingSaldo, setLoadingSaldo] =
  useState(false);
  
//
  const handlePeriodo = (value: string) => {
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
};


// =======================================
// BUSCAR SALDO DA DETENTORA
// =======================================

async function carregarSaldoDetentora(id: string) {

  if (!id) {

    setPublicar(false);
    setDraft(false);
    setSaldoDetentora(null);
    return;

  }

  try {

    setLoadingSaldo(true);

    const response = await api.get("/detentora/saldo", {

      params: {
        id
      }

    });

    setSaldoDetentora(response.data);

  } catch (err) {

    console.error(err);

    setSaldoDetentora(null);

  } finally {

    setLoadingSaldo(false);

  }

}

  // Carregar dados
  useEffect(() => {
    async function loadData() {
      try {
        const [locaisRes, blocoRes, salasRes, profRes, forRes, detRes] =
          await Promise.all([
            api.get("/local"),
            api.get("/bloco"),
            api.get("/sala"),
            api.get("/professor"),
            api.get("/formatura"),
            api.get("/detentora"),
          ]);

        setLocaisList(locaisRes.data);
        setBlocos(blocoRes.data);
        setSalas(salasRes.data);
        setProfessores(profRes.data);
        setFormaturas(forRes.data);
        setDetentoras(detRes.data);

      } catch (error) {
        console.error("Erro ao carregar dados:", error);
      }
    }

    loadData();
  }, []);

 

          // Enviar formulário
async function handleSubmit(e: React.FormEvent) {
  e.preventDefault();

  if (saldoDetentora && saldoDetentora.saldo <= 0) {
    toast.error("Esta detentora não possui saldo disponível.");
    return;
  }

  const payload = {
    bloco_id,
    detentoras_id,
    professor_id: professor_id || null,
    local_id,
    sala_id,
    formatura_id,
    data_inicio: formatarData(data_inicio),
    data_fim: formatarData(data_fim),
    hora_inicio,
    hora_fim,
    tema,
    is_status,
    especificacao,
    publicar,
    draft,
    quantidade_aluno,
    link_inscricao,
  };

  try {

    await api.post("/cronograma", payload);

    toast.success("Cronograma criado com sucesso!");

    // Atualiza o saldo após criar o cronograma
    if (detentoras_id) {
      await carregarSaldoDetentora(detentoras_id);
    }

    limparFormulario();

  } catch (error: any) {

    console.error(error);

    toast.error(
      error?.response?.data?.error ||
      "Erro ao salvar cronograma."
    );

  }
}

function formatarData(data: string): string {
  if (!data) return "";

  const [ano, mes, dia] = data.split("-");

  return `${dia}/${mes}/${ano}`;
}

const salasFiltradas = salas.filter(
  (sala) => sala.local_id === local_id
);

const limparFormulario = () => {

  setBloco("");
  setDetentoras_id("");
  setProfessor("");
  setLocal("");
  setSala("");
  setFormatura("");
  setTema("");
  setDataInicio("");
  setDataFim("");
  setHorario("");
  setHorarioFim("");
  setQtdeAlunos("");
  setObservacao("");
  setStatus("ativo");
  setPeriodo("");
  setLink_inscricao("");

  setPublicar(false);
  setDraft(false);

  // Limpa o card do saldo
  setSaldoDetentora(null);
  setMostrarSaldo(false);

};



 return (
  <div className="min-h-screen flex items-center justify-center bg-gray-100 p-6">
    <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl p-6">

      <h2 className="text-2xl font-semibold text-center mb-6">
        Criar Cronograma
      </h2>

      <form onSubmit={handleSubmit} className="grid grid-cols-2 gap-3">

        {/* BLOCO */}
        <div>
          
          <select
            value={bloco_id}
            onChange={(e) => setBloco(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-white"
          >
            <option value="">Selecione o bloco</option>
            {blocoCurso.map((c) => (
              <option key={c.id} value={c.id}>
                {c.bloco_Curso}
              </option>
            ))}
          </select>
        </div>

        {/* STATUS */}
        
          
          <div>
            <select
              value={is_status}
              onChange={(e) => setStatus(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Selecione o status</option>
              <option value="ativo">Ativo</option>
              <option value="cancelado">Cancelado</option>
              <option value="prorrogado">Prorrogado</option>
            </select>
          </div>

        {/* LOCAL */}
        <div>
         
          <select
            value={local_id}
            onChange={(e) => setLocal(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-white"
          >
            <option value="">Selecione o local</option>
            {locaisList.map((l) => (
              <option key={l.id} value={l.id}>
                {l.polo}
              </option>
            ))}
          </select>
        </div>

        {/* SALA */}
        <div>
          
          <select
              value={sala_id}
              onChange={(e) => setSala(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Selecione a sala</option>

              {salasFiltradas.map((s) => (
                <option key={s.id} value={s.id}>
                  {s.numero_sala}
                </option>
              ))}
            </select>
        </div>

        {/* DETENTORA */}
        
          
          <select
              value={detentoras_id}
              onChange={async (e) => {

                const id = e.target.value;

                setDetentoras_id(id);

                if (id) {
                  await carregarSaldoDetentora(id);
                } else {
                  setSaldoDetentora(null);
                }

              }}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
            <option value="">Selecione o curso</option>
            {detentoras.map((d) => (
              <option key={d.id} value={d.id}>
                {d.curso?.nome_curso} — ATA {d.ata?.numero_ata?? "sem ata"}
              </option>
            ))}
          </select>
          
          {/* PROFESSOR */}
            <div>

              <select
                value={professor_id}
                onChange={(e) => setProfessor(e.target.value)}
                className="w-full px-3 py-2 border rounded-lg bg-white"
              >

            <option value="">
              Selecione o professor
            </option>

            {professores.map((p) => (

              <option
                key={p.id}
                value={p.id}
              >
                {p.nome_professor}
              </option>

            ))}

          </select>

        </div>
          
           
             {loadingSaldo && (

              <div className="mt-2 text-sm text-gray-500">

                Consultando saldo...

              </div>

            )}
        
        {saldoDetentora && (

<div className="col-span-2 mt-3">

  <div className="rounded-xl border border-blue-500 bg-white shadow-sm overflow-hidden">

    {/* Cabeçalho */}

    <button
      type="button"
      onClick={() => setMostrarSaldo(!mostrarSaldo)}
      className="w-full flex items-center justify-between bg-blue-50 hover:bg-blue-100 px-5 py-4 transition"
    >

      <div className="flex items-center gap-3">

        <h3 className="text-lg font-semibold text-blue-700">
          Saldo
        </h3>

        <span
          className={`px-3 py-1 rounded-full text-white text-sm font-bold ${
            saldoDetentora.saldo <= 0
              ? "bg-red-600"
              : saldoDetentora.saldo <= 5
              ? "bg-yellow-500"
              : "bg-green-600"
          }`}
        >
          {saldoDetentora.saldo} turma(s)
        </span>

      </div>

      <span className="text-blue-700 text-xl">
        {mostrarSaldo ? "▲" : "▼"}
      </span>

    </button>

    {/* Conteúdo */}

    {mostrarSaldo && (

      <div className="p-5">

        <div className="grid grid-cols-3 gap-6">

          <div>
            <span className="text-gray-500 text-sm">
              Empresa
            </span>

            <div className="font-semibold text-lg">
              {saldoDetentora.empresa}
            </div>
          </div>

          

          

          <div>
            <span className="text-gray-500 text-sm">
              Turmas Contratadas
            </span>

            <div className="text-2xl font-bold text-blue-600">
              {saldoDetentora.contratado}
            </div>
          </div>

          <div>
            <span className="text-gray-500 text-sm">
              Utilizadas
            </span>

            <div className="text-2xl font-bold text-orange-600">
              {saldoDetentora.utilizadas}
            </div>
          </div>

          

        </div>

        {/* Barra de utilização */}

        <div className="mt-8">

          <div className="flex justify-between mb-2">

            <span className="font-semibold text-blue-700">
              Utilização do contrato
            </span>

            <span className="font-bold text-blue-700">
              {saldoDetentora.utilizadas} / {saldoDetentora.contratado}
            </span>

          </div>

          <div className="w-full h-4 bg-gray-200 rounded-full overflow-hidden">

              <div
                      className={`h-full transition-all duration-500 ${
                        saldoDetentora.saldo <= 0
                          ? "bg-red-600"
                          : saldoDetentora.saldo <= 5
                          ? "bg-yellow-500"
                          : "bg-green-600"
                      }`}
                      style={{
                          width: `${
                            saldoDetentora.contratado > 0
                              ? Math.min(
                                  (saldoDetentora.utilizadas * 100) /
                                  saldoDetentora.contratado,
                                  100
                                )
                              : 0
                          }%`
                        }}
                    />

              </div>

        </div>

      </div>

    )}

  </div>
</div>
        )}




{saldoDetentora &&
 saldoDetentora.saldo <= 0 && (

<div className="col-span-2">

  <div className="bg-red-100 border border-red-300 rounded-lg p-4">

    <h2 className="text-red-700 font-bold">

      Atenção

    </h2>

    <p className="text-red-600">

      Esta detentora não possui mais saldo disponível para criação de novos cronogramas.

    </p>

  </div>

</div>

)}

       

        {/* TEMA */}
        <div className="col-span-2">
          
          <input
            value={tema}
            onChange={(e) => setTema(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Tema"
          />
        </div>

        {/* DATAS E HORÁRIOS */}
        <div className="col-span-2 grid grid-cols-5 gap-6">

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
            <label className="block text-sm font-medium mb-1">
              Data Fim
            </label>
            <input
              type="date"
              value={data_fim}
              onChange={(e) => setDataFim(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
          <div>

            <label className="block text-sm font-medium mb-1">
              Período
            </label>
              <select              
                  value={periodo}
                  onChange={(e) => handlePeriodo(e.target.value)}
                  className="w-full px-3 py-2 border rounded-lg bg-white"
                >
                  <option value="">Selecione o período</option>
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
            <label className="block text-sm font-medium mb-1">
              Hora Fim
            </label>
            <input
              type="time"
              value={hora_fim}
              onChange={(e) => setHorarioFim(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
            />
          </div>
        </div>

        {/* QUANTIDADE E FORMATURA */}
        <div className="col-span-2 grid grid-cols-2 gap-6">

          <div>
           
            <input
              value={quantidade_aluno}
              onChange={(e) => setQtdeAlunos(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg"
              placeholder="Quantidade"
            />
          </div>

          <div>
            
            <select
              value={formatura_id}
              onChange={(e) => setFormatura(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white"
            >
              <option value="">Data da formatura</option>
              
              {formaturas.map((f) => (
                <option key={f.id} value={f.id}>
                  {f.data_formatura}
                </option>
              ))}
            </select>
          </div>

        </div>

        {/* ESPECIFICAÇÃO */}
        <div className="col-span-2">
         
          <textarea
            rows={3}
            value={especificacao}
            onChange={(e) => setObservacao(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Especificação / Observações"
          />
        </div>

         {/* link de inscrição */}
        <div className="col-span-2">
          
          <input
            value={link_inscricao}
            onChange={(e) => setLink_inscricao(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Link de Inscrição"
          />
        </div>

        <div className="col-span-2 flex items-center px-15 justify-between">
  
          {/* ESQUERDA → Draft e Publicar */}
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

          {/* DIREITA → Botão */}
          <button
  type="submit"
            disabled={
          loadingSaldo ||
          !detentoras_id ||
          (saldoDetentora !== null && saldoDetentora.saldo <=0)
          }
  className={`px-5 py-3 rounded-lg text-white font-semibold transition

    ${
      loadingSaldo
        ? "bg-gray-400 cursor-not-allowed"
        : saldoDetentora && saldoDetentora.saldo <= 0
        ? "bg-red-400 cursor-not-allowed"
        : "bg-blue-600 hover:bg-blue-700"
    }
  `}
>

  {loadingSaldo
    ? "Consultando saldo..."
    : saldoDetentora
    ? `Salvar Cronograma (Saldo: ${saldoDetentora.saldo})`
    : "Salvar Cronograma"}

</button>
        </div>

      </form>
    </div>
  </div>
);
}