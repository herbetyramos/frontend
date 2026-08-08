 "use client";
import { useEffect, useState } from "react";
import { api } from "@/services/api";

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

  link_inscricao?: string;
}


interface Props {
  dados: CronogramaType;
  fechar: () => void;
  atualizarLista: () => void;
}

// Tipos
type LocalType = { id: string; polo: string };
type SalaType = { id: string; numero_sala: string };
type ProfessorType = { id: string; nome_professor: string };
type FormaturaType = { id: string; data_formatura: string };
type BlocoType = { id: string; bloco_Curso: string };


type DetentoraType = {
  id: string;
  ata_id: string;
  cursos_id: string;
  
  curso: {
    id: string;
    nome_curso: string;
  };

  ata:{
    id: string;
    numero_ata: string; 
  }
};




export default function EditarCronogramaModal({
  dados,
  fechar,
  atualizarLista,
}: Props) { 
  const [locaisList, setLocaisList] = useState<LocalType[]>([]);
  const [blocoCurso, setBlocos] = useState<BlocoType[]>([]);
  const [salas, setSalas] = useState<SalaType[]>([]);
  const [professores, setProfessores] = useState<ProfessorType[]>([]);
  const [detentoras, setDetentoras] = useState<DetentoraType[]>([]);
  const [formaturas, setFormaturas] = useState<FormaturaType[]>([]);

  // Formulário
const [detentoras_id, setDetentoras_id] = useState(dados.detentoras_id || "");
const [local_id, setLocal] = useState(dados.local_id || "");
const [bloco_id, setBloco] = useState(dados.bloco_id || "");
const [tema, setTema] = useState(dados.tema || "");
const [data_inicio, setDataInicio] = useState(dados.data_inicio || "");
const [data_fim, setDataFim] = useState(dados.data_fim || "");
const [hora_inicio, setHorario] = useState(dados.hora_inicio || "");
const [hora_fim, setHorarioFim] = useState(dados.hora_fim || "");
const [sala_id, setSala] = useState(dados.sala_id || "");
const [professor_id, setProfessor] = useState(dados.professor_id || "");
const [quantidade_aluno, setQtdeAlunos] = useState(dados.quantidade_aluno || "");
const [formatura_id, setFormatura] = useState(dados.formatura_id || "");
const [especificacao, setObservacao] = useState(dados.especificacao || "");
const [publicar, setPublicar] = useState(dados.publicar || false);
const [draft, setDraft] = useState(dados.draft || false);
const [is_status, setStatus] = useState(dados.is_status || "");
const [link_inscricao, setLink_inscricao] = useState(dados.link_inscricao || "");
const [periodo, setPeriodo] = useState("");  

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

  // Carregar dados
 useEffect(() => {
  async function loadData() {
    const [
      locaisRes,
      blocoRes,
      salasRes,
      profRes,
      forRes,
      detRes
    ] = await Promise.all([
      api.get("/local"),
      api.get("/bloco"),
      api.get("/sala"),
      api.get("/professor"),
      api.get("/formatura"),
      api.get("/detentora")
    ]);

    setLocaisList(locaisRes.data);
    setBlocos(blocoRes.data);
    setSalas(salasRes.data);
    setProfessores(profRes.data);
    setFormaturas(forRes.data);
    setDetentoras(detRes.data);
  }

  loadData();
}, []);

  // Enviar formulário
  async function handleUpdate(
  e: React.FormEvent
) {
  e.preventDefault();

  try {
    await api.put(
      `/cronograma/${dados.id}`,
      {
        bloco_id,
        detentoras_id,
        professor_id,
        local_id,
        sala_id,
        formatura_id,
        data_inicio,
        data_fim,
        hora_inicio,
        hora_fim,
        tema,
        is_status,
        especificacao,
        publicar,
        draft,
        quantidade_aluno,
        link_inscricao,
      }
    );

    alert("Atualizado com sucesso");

    atualizarLista();

    fechar();

  } catch (error) {
    console.log(error);
    
    alert("Erro ao atualizar");
  }
}




 return (
  <div className="p-0">
    <div className="w-full max-w-5xl bg-white shadow-xl rounded-2xl p-6">


      <form onSubmit={handleUpdate} className="grid grid-cols-2 gap-3">

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
          
          <input
            value={is_status}
            onChange={(e) => setStatus(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg"
            placeholder="Status"
          />
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
            {salas.map((t) => (
              <option key={t.id} value={t.id}>
                {t.numero_sala}
              </option>
            ))}
          </select>
        </div>

        {/* DETENTORA */}
        <div>
          
          <select
            value={detentoras_id}
            onChange={(e) => setDetentoras_id(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-white"
          >
            <option value="">Selecione o curso</option>
            {detentoras.map((d) => (
              <option key={d.id} value={d.id}>
                {d.curso?.nome_curso} — ATA {d.ata?.numero_ata?? "sem ata"}
              </option>
            ))}
          </select>
        </div>

        {/* PROFESSOR */}
        <div>
          
          <select
            value={professor_id}
            onChange={(e) => setProfessor(e.target.value)}
            className="w-full px-3 py-2 border rounded-lg bg-white"
          >
            <option value="">Selecione o professor</option>
            {professores.map((p) => (
              <option key={p.id} value={p.id}>
                {p.nome_professor}
              </option>
            ))}
          </select>
        </div>

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
            className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition"
          >
            Editar Cronograma
          </button>
        </div>

      </form>
    </div>
  </div>
);
}