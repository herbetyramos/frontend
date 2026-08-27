"use client";
import { useEffect, useState, useCallback } from "react";
import { api } from "@/services/api";
import EditarCronogramaModal from "@/components/EditarCronogramaModal";
import Image from "next/image";
import React from "react";
import { visualizarRelatorioProfessorSala } from "@/reports/relatorioProfessorSala";
import { relatorioFormatura } from "@/reports/relatorioFormatura";
import { visualizarRelatorioProfessores } from "@/reports/relatorioProfessores";
import { visualizarRelatorioSegmento } from "@/reports/relatorioSegmento";
import { relatorioGrade } from "@/reports/relatorioGrade";
import Link from "next/link";
import { gerarRelatorioDetentora } from "@/reports/relatorioDetentora";
import { Send } from "lucide-react";
import { toast } from "react-toastify";

import { gerarRelatorioSolicitacao } from "@/reports/gerarRelatorioSolicitacao";
import { gerarCertificados } from "@/utils/gerarCertificadoPDF";



import {
  Pencil,
  Trash2,
  Search,
  ChevronDown,
  ChevronUp,
  FileText,
} from "lucide-react";


type CronogramaType = {
  id: string;
  codigo: number;
  tema: string;
  descricao?: string;   
  data_inicio: string;
  data_fim: string;
  hora_inicio: string;
  hora_fim: string;
  especificacao: string;
  bloco_curso: { bloco_Curso: string } | null;
  localAula: { polo: string; Telefone:string } | null;
  salaAula: { numero_sala: string; tipo_uso: string } | null;
  quantidadeAlunos: number;
  formatura?: {
    id: string;
    data_formatura: string;
    local: string;
  } | null;
  professor: {
       nome_professor: string;
       telefone?: string;
       especialidade?: string;
       foto?: string | null;
    } | null;

 detentoras?:{
      ata_id: string;
    cursos_id: string;
    
    curso: {
      id: string;
      nome_curso: string;

      segmento?: {
        id: string;
        name: string;
      } | null;

    }| null;

   ata: {
  id: string;
  numero_ata: string;

  empresa: {
    nome_empresa: string;
  } | null;

} | null;   
 }  

saldoDetentora?: {
  contratado: number;
  utilizadas: number;
  saldo: number;
};

};

type AgrupamentoType = {
  [polo: string]: {
    [sala: string]: CronogramaType[];
  };
};

export default function ListCronograma() {
  
  const [agrupado, setAgrupado] = useState<AgrupamentoType>({});
  const [cronogramaFull, setCronogramaFull] = useState<CronogramaType[]>([]);
  const [blocos, setBlocos] = useState<string[]>([]);
  const [filtroBloco, setFiltroBloco] = useState<string>("");
  const [busca, setBusca] = useState<string>("");
  const [datasFormatura, setDatasFormatura] = useState<string[]>([]);
  const [filtroDataFormatura, setFiltroDataFormatura] = useState("");  
  const [modalEditar, setModalEditar] = useState(false);
  const [cursoExpandido, setCursoExpandido] = useState<string | null>(null);
  const [cronogramaEditando, setCronogramaEditando] =
  useState<CronogramaType | null>(null);

  const [polos, setPolos] = useState<string[]>([]);
  const [filtroPolo, setFiltroPolo] = useState("");

  const [empresas, setEmpresas] = useState<string[]>([]);
  const [filtroEmpresa, setFiltroEmpresa] = useState("");

   
const toggleExpandir = (id: string) => {
  setCursoExpandido(
    cursoExpandido === id ? null : id
  );
};




  const loadCronograma = useCallback(async () => {
  try {
    const res = await api.get<CronogramaType[]>("/listcronograma");

    setCronogramaFull(res.data);

    const blocosUnicos = Array.from(
      new Set(
        res.data
          .map((c) => c.bloco_curso?.bloco_Curso)
          .filter((bloco): bloco is string => !!bloco)
      )
    );

    setBlocos(blocosUnicos);

    const datasUnicas = Array.from(
      new Set(
        res.data
          .map((c) => c.formatura?.data_formatura)
          .filter((data): data is string => !!data)
      )
    ).sort();

    setDatasFormatura(datasUnicas);
    const polosUnicos = Array.from(
        new Set(
          res.data
            .map((c) => c.localAula?.polo)
            .filter((polo): polo is string => !!polo)
        )
      ).sort();

      setPolos(polosUnicos);

      const empresasUnicas = Array.from(
        new Set(
          res.data
            .map((c) => c.detentoras?.ata?.empresa?.nome_empresa)
            .filter((empresa): empresa is string => !!empresa)
              )
            ).sort();

      setEmpresas(empresasUnicas);


    agrupar(res.data);
  } catch (err) {
    console.error("Erro ao carregar cronograma:", err);
  }

  
}, []);

useEffect(() => {
  loadCronograma();
}, [loadCronograma]);



const aplicarFiltro = useCallback(() => {
  let filtrado = [...cronogramaFull];

  // filtro por data de formatura
  if (filtroDataFormatura) {
    filtrado = filtrado.filter(
      (item) =>
        item.formatura?.data_formatura?.trim() ===
        filtroDataFormatura.trim()
    );
  }
// filtrar por empresa
if (filtroEmpresa) {
  filtrado = filtrado.filter(
    (item) =>
      item.detentoras?.ata?.empresa?.nome_empresa === filtroEmpresa
  );
}


  // filtro por bloco
  if (filtroBloco) {
    filtrado = filtrado.filter(
      (item) => item.bloco_curso?.bloco_Curso === filtroBloco
    );
  }

  // filtro por tema
  if (busca.trim()) {
  const texto = busca.toLowerCase();

  filtrado = filtrado.filter((item) => {
    const tema = item.tema?.toLowerCase() ?? "";

    const empresa =
      item.detentoras?.ata?.empresa?.nome_empresa?.toLowerCase() ?? "";

    return (
      tema.includes(texto) ||
      empresa.includes(texto)
    );
  });
}

  if (filtroPolo) {
  filtrado = filtrado.filter(
    (item) => item.localAula?.polo === filtroPolo
  );
}
  


  agrupar(filtrado);
}, [
  cronogramaFull,
  filtroPolo,
  filtroBloco,
  filtroDataFormatura,
  filtroEmpresa,
  busca,
]);

useEffect(() => {
  aplicarFiltro();
}, [aplicarFiltro]);

  const editar = (id: string) => {
  const cronograma = cronogramaFull.find((c) => c.id === id);

  if (!cronograma) return;

  setCronogramaEditando(cronograma);
  setModalEditar(true);
};

const excluir = async (id: string) => {
  if (!confirm("Deseja realmente excluir este cronograma?")) return;

  try {
    await api.delete(`/listcronograma/${id}`);
    await loadCronograma();
  } catch (error) {
    console.error(error);
    alert("Erro ao excluir o cronograma.");
  }
};

const enviarPlanejamento = async (id: string) => {

  const link = `${window.location.origin}/planejamento?id=${id}`;

  await navigator.clipboard.writeText(link);

  toast.success("Link copiado para a área de transferência!");

};


const visualizarSolicitacao = async (id: string) => {

  try {

    const response = await api.get("/solicitacao-material", {
      params: {
        id
      }
    });

    gerarRelatorioSolicitacao(response.data);

  } catch (error) {

    console.error(error);

    toast.error("Nenhuma solicitação de materiais encontrada.");

  }

};

  function agrupar(lista: CronogramaType[]) {
    const porPolo: AgrupamentoType = {};

    lista.forEach((item) => {
      const polo = item.localAula?.polo || "Sem Polo";
      const sala = item.salaAula? `${item.salaAula.numero_sala} (${item.salaAula.tipo_uso})`
  : "Sem Sala";

      if (!porPolo[polo]) porPolo[polo] = {};
      if (!porPolo[polo][sala]) porPolo[polo][sala] = [];

      porPolo[polo][sala].push(item);
    });

    setAgrupado(porPolo);
  }

      const corSala = (sala: string) => {
        const texto = sala.toUpperCase();

      
        if (
              texto.includes("BELEZA") ||
              texto.includes("BELEZA COM LAVATÓRIO") ||
              texto.includes("BELEZA COM MACA")
            ) {
              return "#A855F7"; // Lilás
            }

        if (texto.includes("INFORMÁTICA") || 
            texto.includes("INFORMATICA")) {
          return "oklch(39.6% 0.141 25.723)"; // Amarelo
        }

        if (texto.includes("GASTRONOMIA")||texto.includes("COZINHA")) {
          return "#2563EB"; // Azul
        }

        if (texto.includes("ADMINISTRATIVO")) {
          return "oklch(44.4% 0.177 26.899)"; // Vermelho
        }

        if (texto.includes("SERVIÇOS")) {
          return "#16A34A"; // Verde
        }

        if (texto.includes("COSTURA")) {
          return "#FACC15"; 
        }

        if (texto.includes("SABER")) {
          return "oklch(44.4% 0.177 26.899)"; 
        }

        if (texto.includes("MULTIUSO")) {
          return "oklch(44.4% 0.177 26.899)"; 
        }

        if (texto.includes("MODA")){
          return "#FACC15"; 
        }

         if (texto.includes("CASA ROSA")){
          return "oklch(71.2% 0.194 13.428)"; 
        }



        return "#000000"; // Preto
      };


      const obterPeriodo = (hora: string) => {
        const horaInicio = parseInt(hora.split(":")[0], 10);

        if (horaInicio < 12) return "Manhã";
        if (horaInicio < 18) return "Tarde";
        return "Noite";
      };

      const totalGeralCursos = Object.values(agrupado).reduce(
  (totalPolos, salas) =>
    totalPolos +
    Object.values(salas).reduce(
      (totalSalas, lista) => totalSalas + lista.length,
      0
    ),
  0
);




  return (
    <>
    <div className="px-2 pt-0 pb-1">
      <div className="col-span-7 justify-between py-2 grid grid-cols-10 gap-8">
        <div>
            <h1 className="text-lg py-0 font-semibold mb-0 flex items-center gap-2">
        
          <span className="text-2xl font-bold text-red-800">
           {totalGeralCursos} Cursos
         </span>
        
        
      </h1>
      </div>
        

      {/* FILTROS */}
      <div className="flex gap-2 mb-2 items-center flex-wra">
        {/* BLOCO */}
      <div>
      <select
        value={filtroPolo}
        onChange={(e) => setFiltroPolo(e.target.value)}
        className="border px-2 py-1 text-sm rounded-md"
      >
        <option value="">Local</option>

        {polos.map((polo) => (
          <option key={polo} value={polo}>
            {polo}
          </option>
        ))}
      </select>
    </div>



        <div>
          
          <select
            value={filtroBloco}
            onChange={(e) => setFiltroBloco(e.target.value)}
            className="border px-2 py-1 text-sm rounded-md"
          >
            <option value="">Grade</option>
            {blocos.map((bloco) => (
              <option key={bloco} value={bloco}>
                {bloco}
              </option>
            ))}
          </select>
        </div>

            <div>
              <select
                value={filtroEmpresa}
                onChange={(e) => setFiltroEmpresa(e.target.value)}
                className="border px-2 py-1 text-sm rounded-md"
              >
                <option value="">Empresa</option>

                {empresas.map((empresa) => (
                  <option key={empresa} value={empresa}>
                    {empresa}
                  </option>
                ))}
              </select>
            </div>


              <div>
                <select
                  value={filtroDataFormatura}
                  onChange={(e) =>
                    setFiltroDataFormatura(e.target.value)
                  }
                  className="border px-2 py-1 text-sm rounded-md"
                >
                  <option value="">
                    Formatura
                  </option>

                  {datasFormatura.map((data) => (
                    <option key={data} value={data}>
                      {data}
                    </option>
                  ))}
                </select>
              </div>


        {/* BUSCA POR TEMA */}
        
          
          <div className="flex items-center border px-1 py-0 rounded-md shadow-sm">
            <Search size={18} className="text-gray-600 mr-2" />
            <input
              type="text"
              placeholder="Digite o tema..."
              value={busca}
              onChange={(e) => setBusca(e.target.value)}
              className="outline-none"
            />
          </div>

            <div className="flex items-center gap-3">

  {/* MENU RELATÓRIOS DE GRADES  k*/}
  <div className="relative group">
    <button className="flex items-center gap-2 px-4 py-1 bg-red-600 text-white rounded-md hover:bg-red-700">
      <FileText size={16} />
      Cronograma
      <ChevronDown size={16} />
    </button>

    
  <div className="
      absolute
      left-0
      top-full
      hidden
      group-hover:block
      bg-white
      border
      rounded-b-md
      shadow-lg
      w-56
      z-50
  ">
      <button
        onClick={() => relatorioGrade(cronogramaFull, filtroBloco)}
        className="w-full text-left px-4 py-2 hover:bg-gray-100"
      >
        Grade
      </button>

      <button
        onClick={() =>
          gerarRelatorioDetentora(
            cronogramaFull,
            filtroBloco,
            filtroPolo,
            filtroDataFormatura,
            filtroEmpresa,
            
          )
        }
        className="w-full text-left px-4 py-2 hover:bg-gray-100"
      >
        Empresa
      </button>

      <button
        onClick={() =>
          visualizarRelatorioProfessorSala(
            cronogramaFull,
            filtroBloco,
            filtroDataFormatura
          )
        }
        className="w-full text-left px-4 py-2 hover:bg-gray-100"
      >
        Professores
      </button>

      <Link
                href={
                  filtroEmpresa
                    ? `/detentora/saldo-relatorio?empresa=${encodeURIComponent(
                        filtroEmpresa
                      )}`
                    : "/detentora/saldo-relatorio"
                }
                target="_blank"
                rel="noopener noreferrer"
                className="
                  flex
                  items-center
                  gap-2
                  px-4
                  py-1
                  bg-blue-600
                  text-white
                  rounded-md
                  hover:bg-blue-700
                "
              >
                <FileText size={16} />
                Saldo
          </Link>

    </div>
  </div>

  {/* MENU RELATÓRIOS DE FORMATURA */}
  <div className="relative group">
    <button className="flex items-center gap-2 px-4 py-1 bg-green-600 text-white rounded-md hover:bg-green-700">
      <FileText size={16} />
      Formatura
      <ChevronDown size={16} />
    </button>

   

  
  <div className="
      absolute
      left-0
      top-full
      hidden
      group-hover:block
      bg-white
      border
      rounded-2xl
      shadow-lg
      w-56
      z-50
  ">
      <button
        onClick={() =>
          relatorioFormatura(
            cronogramaFull,
            filtroDataFormatura,
            filtroBloco
          )
        }
        className="w-full text-left px-4 py-2 hover:bg-gray-100"
      >
        Formatura
      </button>

      <button
          onClick={() =>
            visualizarRelatorioSegmento(
              cronogramaFull,
              filtroBloco,
              filtroDataFormatura
            )
          }
          className="w-full text-left px-4 py-2 hover:bg-gray-100"
        >
          Segmento
      </button>

      <button
        onClick={() =>
          visualizarRelatorioProfessores(
            cronogramaFull,
            filtroBloco,
            filtroDataFormatura
          )
        }
        className="w-full text-left px-4 py-2 hover:bg-gray-100"
      >
        Professores
      </button>





    </div>

  </div>

</div>
       
        </div>
        </div>
      

      
      
        
 {/* AGRUPAMENTO */}

{Object.keys(agrupado).map((polo) => {
  const totalCursosPolo = Object.values(agrupado[polo]).reduce(
    (total, lista) => total + lista.length,
    0
  );

  

  return (
    
       <div key={polo} className="mb-5">
              <div className="flex items-center gap-3">
              
                <h2 className="text-xl font-bold text-blue-700">
                  {polo}
                </h2>
              
                <span className="px-3 py-1 rounded-full bg-blue-100 text-sm font-bold text-blue-700">
                   {totalCursosPolo} Cursos
                </span>
            

        <div />
      </div>

      

      {Object.keys(agrupado[polo]).map((sala) => (
        <div
          key={sala}
          style={{
            border: `4px solid ${corSala(sala)}`,
            borderRadius: "12px",
            padding: "1px",
            marginBottom: "2px",
          }}
        >
        

              {/* TABELA */}
              <table className="w-full table-fixed bg-white shadow text-sm border-amber-200">
                <thead>
                  
                  <tr className="bg-gray-200 text-left">
                      <th className="w-10 border p-2">Código</th>

                      <th className="w-50 border p-2">
                        <h3>
                          <span style={{ color: "#000" }}>Sala: </span>
                          <span style={{ color: corSala(sala) }}>{sala}</span>
                        </h3>
                      </th>

                      <th className="w-15 border p-2">Início</th>
                      <th className="w-15 border p-2">Fim</th>
                      <th className="w-15 border p-2">Período</th>
                      <th className="w-15 border p-2">Hora Início</th>
                      <th className="w-15 border p-2">Hora Fim</th>
                      <th className="w-40 border p-2 text-center">Professor</th>
                      <th className= "w-10 border p-2 text-center">Alunos</th>
                      <th className="w-10 border p-2 text-center">Saldo</th>
                      <th className="w-25 border p-2 text-center">Ações</th>
                    </tr>
                </thead>

                <tbody>
  {agrupado[polo][sala].map((item) => (
    <React.Fragment key={item.id}>
      <tr>
        <td className="border p-2">
          {item.codigo}
        </td>

        <td className="border p-2 truncate">
           {item.tema}
        </td>

        <td className="border p-2">
          {item.data_inicio}
        </td>

        <td className="border p-2">
          {item.data_fim}
        </td>

        <td className="border px-2 py-1">
       {obterPeriodo(item.hora_inicio)}
        </td>

        <td className="border p-2">
          {item.hora_inicio}
        </td>

        <td className="border p-2">
          {item.hora_fim}
        </td>

        <td className="border p-2">
  {item.professor?.nome_professor}
</td>

        <td className="border p-2 text-center">
          {item.quantidadeAlunos}
        </td>
 <td className="border p-2 text-center">

  {(() => {
    const saldo = item.saldoDetentora?.saldo ?? 0;

    return (
      <span
        className={`px-2 py-1 rounded-full text-white text-xs font-bold ${
          saldo <= 0
            ? "bg-red-600"
            : saldo <= 5
            ? "bg-yellow-500"
            : "bg-green-600"
        }`}
      >
        {saldo}
      </span>
    );

  })()}



</td>



        

        <td className="border p-2 text-center">
          <div className="flex justify-center items-center gap-3">

            
            <button
                className="text-blue-600 hover:text-blue-800"
                onClick={() => editar(item.id)}
                title="Editar Curso"
                  >
               <Pencil size={18} />
            </button>

            <button
                className="text-orange-600 hover:text-orange-800"
                title="Visualizar Solicitação de Materiais"
                onClick={() => visualizarSolicitacao(item.id)}
            >
                <FileText size={18} />
            </button>



            <button
              className="text-red-600 hover:text-red-800"
              onClick={() => excluir(item.id)}
              title="Excluir"
            >
              <Trash2 size={18} />
            </button>

            <button
              className="text-green-600 hover:text-green-800"
              onClick={() => toggleExpandir(item.id)}
              title="Mais informações"
            >
              {cursoExpandido === item.id ? (
                <ChevronUp size={18} />
              ) : (
                <ChevronDown size={18} />
              )}
            </button>
          </div>
        </td>
      </tr>

      {cursoExpandido === item.id && (
        <tr>
          <td
            colSpan={8}
            className="border bg-blue-50 px-2 py-1 text-sm"
          >
            <div className="space-y-2">
              <h3 className="font-bold text-blue-700 text-lg">
                Mais Informações
              </h3>

              <div className="grid grid-cols-4 gap-4">

                <div>
                  <strong>Curso da Ata:</strong> {item.detentoras?.curso?.nome_curso}
                </div>

                <div>
                  <strong>Telefone do local:</strong>{" "}
                  {item.localAula?.Telefone}
                </div>                             

                
                <div>
                  <strong>Detentora da ATA:</strong> {item.detentoras?.ata?.empresa?.nome_empresa}
                </div>               

                <div>
                  <strong>Observação:</strong>{" "}
                  {item.especificacao}
                </div>

              
           

                <div>
                  <strong>Númedo da Ata:</strong> {item.detentoras?.ata?.numero_ata}
                </div> 
                <div className="grid grid-cols-2 gap-3 mt-2 mb-3">

                  <div className="bg-blue-100 border border-blue-300 rounded-lg px-3 py-2">
                    <div className="text-xs font-semibold text-blue-700">
                      SALDO CONTRATADO
                    </div>
                    <div className="text-lg font-bold text-blue-900">
                      {item.saldoDetentora?.contratado ?? 0}
                    </div>
                  </div>

                  <div className="bg-orange-100 border border-orange-300 rounded-lg px-3 py-2">
                    <div className="text-xs font-semibold text-orange-700">
                      SALDO UTILIZADO
                    </div>
                    <div className="text-lg font-bold text-orange-900">
                      {item.saldoDetentora?.utilizadas ?? 0}
                    </div>
                  </div>

                </div>

          
                

              <Link
              href={`/material?id_curso=${item.detentoras?.curso?.id}`}
              target="_blank"
              rel="noopener noreferrer"
              className="w-40 h-8 bg-blue-600 hover:bg-blue-700 text-white px-3 py-1 rounded-lg text-sm"
            >
              Materiais deste curso
            </Link>  

              <Link
                href={
                  `/chat/atendimento?` +
                  `cronograma=${item.id}` +
                  `&bloco=${encodeURIComponent(filtroBloco)}` +
                  `&polo=${encodeURIComponent(filtroPolo)}` +
                  `&empresa=${encodeURIComponent(filtroEmpresa)}` +
                  `&data=${encodeURIComponent(filtroDataFormatura)}`
                }
                target="_blank"
                className="w-40 h-8 bg-green-600 hover:bg-green-700 text-white px-3 py-1 rounded-lg"
              >
                Chat
              </Link>

            <Link
              href={`/matricula?id=${item.id}`}
              className="
                bg-green-600
                hover:bg-green-700
                text-white
                px-3
                py-1
                rounded-lg
                text-sm
                w-40
              "
              target="_blank"
               rel="noopener noreferrer"
               title="Alunos do Curso"
            >
              Alunos deste curso
            </Link>
                
                  <button

              onClick={()=>gerarCertificados(item.id)}

              className="
              bg-green-600
              hover:bg-green-700
              text-white
              px-3
              py-1
              w-40
              rounded-lg
              text-sm
              "

              >

              📜 Certificados

              </button>  
                      
                               
              </div>                           
              
            </div>
          </td>
          <td
          colSpan={3}
            className="border bg-blue-50 px-2 py-1 text-sm"
          
          >
            <h2 className="font-bold text-blue-700 text-lg">
                Professor
              </h2>         
          


            <div className="grid grid-cols-2 gap-0">
                       {/* FOTO */}
         {item.professor?.foto && (
           <Image
         src={`http://192.168.15.84:3000/files/professor/${item.professor.foto}`}
         alt={item.professor.nome_professor || "Professor"}
         width={120}
         height={120}
        className="rounded-lg object-cover border"
         />
         
        )}

          <div>
              

              <div className="font-semibold">
                {item.professor?.especialidade}
              </div>

              <div className="font-semibold">
               Contato: {item.professor?.telefone}
              </div>
              <button
                    onClick={() => enviarPlanejamento(item.id)}
                    className="text-green-600 hover:text-green-800"
                    title="Solicitar Planejamento do Curso"
                  >
                    <Send size={18} />
                  </button>
         </div>
         
            </div>
           
          </td>
        </tr>
      )}
    </React.Fragment>
  ))}
</tbody>
              </table>
           </div>
          ))}
        </div>
      );
    }
    )}

      <div className="mt-8 border-t-2 pt-4 flex justify-center">
        <span className="text-2xl font-bold text-red-600">
          Total Geral de Cursos: {totalGeralCursos}
        </span>
      </div>



    </div>
    {modalEditar && cronogramaEditando && (
      <div className="fixed inset-0 bg-black/50 flex justify-center items-center z-50">

        <div className="bg-white rounded-xl shadow-xl w-[95%] max-w-6xl max-h-[90vh] overflow-y-auto">

          <div className="flex justify-between items-center p-4 border-b">

            <h2 className="font-bold text-xl">
              Editar Cronograma
            </h2>

            <button
              onClick={() => setModalEditar(false)}
              className="text-red-600 text-xl"
            >
            X
            </button>

          </div>

          <EditarCronogramaModal
            dados={cronogramaEditando}
            fechar={() => setModalEditar(false)}
            atualizarLista={loadCronograma}
          />

        </div>

      </div>
    
  )}
  </>
);
}