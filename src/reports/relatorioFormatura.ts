import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { CronogramaType } from "@/app/matricula/types";

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

function getPeriodo(hora?: string | null): string {
  if (!hora) return "";

  const h = parseInt(hora.split(":")[0], 10);

  if (h < 12) return "MANHÃ";
  if (h < 18) return "TARDE";
  return "NOITE";
}

function formatarData(data?: string | null): string {
  if (!data) return "";

  const valor = String(data).trim();

  if (!valor) return "";

  // Formato brasileiro: DD/MM/YYYY
  const formatoBR = valor.match(
    /^(\d{2})\/(\d{2})\/(\d{4})/
  );

  if (formatoBR) {
    return `${formatoBR[1]}/${formatoBR[2]}/${formatoBR[3]}`;
  }

  // Formato ISO: YYYY-MM-DD
  const formatoISO = valor.match(
    /^(\d{4})-(\d{2})-(\d{2})/
  );

  if (formatoISO) {
    return `${formatoISO[3]}/${formatoISO[2]}/${formatoISO[1]}`;
  }

  // Última tentativa para outros formatos válidos
  const date = new Date(valor);

  if (isNaN(date.getTime())) {
    return "";
  }

  return date.toLocaleDateString("pt-BR");
}

export function relatorioFormatura(
  cronogramaFull: CronogramaType[],
  filtroDataFormatura: string,
  filtroBloco: string
) {
  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  doc.setFontSize(14);

  doc.text(
    "RELATÓRIO DE CURSOS DA FORMATURA",
    14,
    15
  );

  if (filtroDataFormatura) {
    doc.setFontSize(11);

    doc.text(
      `Data da Formatura: ${formatarData(filtroDataFormatura)}`,
      14,
      22
    );
  }

  // Filtra os cursos, excluindo os rascunhos
  const lista = cronogramaFull.filter((item) => {
    const itemComDraft = item as CronogramaType & {
      draft?: boolean;
    };

    // Não incluir registros marcados como rascunho
    if (itemComDraft.draft === true) {
      return false;
    }

    const blocoOK =
      !filtroBloco ||
      item.bloco_curso?.bloco_Curso === filtroBloco;

    const dataFormatura =
      item.formatura?.data_formatura?.substring(0, 10);

    const formaturaOK =
      !filtroDataFormatura ||
      dataFormatura === filtroDataFormatura;

    return blocoOK && formaturaOK;
  });

  // Linhas da tabela
  const rows = lista.map((item, index) => [
    index + 1,

    // Tema em maiúsculo
    (item.tema || "").toUpperCase(),

    formatarData(item.data_fim),

    getPeriodo(item.hora_inicio),

    // Local em maiúsculo
    (item.localAula?.polo || "").toUpperCase(),

    // Professor em maiúsculo
    (item.professor?.nome_professor || "").toUpperCase(),
  ]);

  autoTable(doc, {
    startY: 28,

    head: [[
      "Nº",
      "Tema",
      "Término",
      "Período",
      "Local",
      "Professor",
    ]],

    body: rows,

    theme: "grid",

    styles: {
      fontSize: 9,
      cellPadding: 2,
      overflow: "linebreak",
      valign: "middle",
    },

    headStyles: {
      fillColor: [0, 70, 140],
      textColor: 255,
      fontStyle: "bold",
    },

    columnStyles: {
      0: {
        cellWidth: 12,
      },

      1: {
        cellWidth: 105,
      },

      2: {
        cellWidth: 25,
      },

      3: {
        cellWidth: 22,
      },

      4: {
        cellWidth: 55,
      },

      5: {
        cellWidth: 55,
      },
    },
  });

  // Posição final da tabela
  const finalY =
    (doc as JsPDFWithAutoTable).lastAutoTable?.finalY ?? 0;

  // Quantidade de cursos por local
  const quantidadePorLocal: Record<string, number> = {};

  lista.forEach((item) => {
    const local = (
      item.localAula?.polo || "SEM LOCAL"
    ).toUpperCase();

    quantidadePorLocal[local] =
      (quantidadePorLocal[local] || 0) + 1;
  });

  // Ordena os locais alfabeticamente
  const locais = Object.entries(quantidadePorLocal).sort(
    ([a], [b]) => a.localeCompare(b)
  );

  // Rodapé
  let rodapeY = finalY + 10;

  // Se faltar espaço, cria nova página
  if (rodapeY > 180) {
    doc.addPage();
    rodapeY = 15;
  }

  doc.setFontSize(10);
  doc.setFont("helvetica", "bold");

  doc.text(
    "QUANTIDADE DE CURSOS POR LOCAL:",
    14,
    rodapeY
  );

  rodapeY += 6;

  doc.setFont("helvetica", "normal");

  locais.forEach(([local, quantidade]) => {
    doc.text(
      `${local}: ${quantidade} curso${quantidade !== 1 ? "s" : ""}`,
      14,
      rodapeY
    );

    rodapeY += 5;
  });

  // Total geral, sem os rascunhos
  rodapeY += 3;

  doc.setFont("helvetica", "bold");

  doc.text(
    `TOTAL DE CURSOS: ${lista.length}`,
    14,
    rodapeY
  );

  // Abrir PDF
  const pdfBlob = doc.output("blob");

  const pdfUrl = URL.createObjectURL(pdfBlob);

  window.open(pdfUrl, "_blank");
}
