import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { CronogramaType } from "@/app/matricula/types";

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

function getPeriodo(hora?: string) {
  if (!hora) return "";

  const h = parseInt(hora.split(":")[0]);

  if (h < 12) return "MANHÃ";
  if (h < 18) return "TARDE";
  return "NOITE";
}

function formatarData(data?: string | null) {
  if (!data) return "";

  const valor = String(data).trim();

  if (!valor) return "";

  // Já está no formato brasileiro: DD/MM/YYYY
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

  const lista = cronogramaFull.filter((item) => {
    const blocoOK =
      !filtroBloco ||
      item.bloco_curso?.bloco_Curso === filtroBloco;

    const formaturaOK =
      !filtroDataFormatura ||
      item.formatura?.data_formatura?.substring(0, 10) ===
        filtroDataFormatura;

    return blocoOK && formaturaOK;
  });

  // ============================================================
  // LINHAS DA TABELA
  // ============================================================

  const rows = lista.map((item, index) => [
    index + 1,
    item.codigo,

    // TEMA EM MAIÚSCULO
    (item.tema || "").toUpperCase(),

    formatarData(item.data_inicio),

    getPeriodo(item.hora_inicio),

    // LOCAL EM MAIÚSCULO
    (item.localAula?.polo || "").toUpperCase(),

    item.professor?.nome_professor || "",
  ]);

  autoTable(doc, {
    startY: 28,

    head: [[
      "Nº",
      "Código",
      "Tema",
      "Data Início",
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
        cellWidth: 15,
      },

      2: {
        cellWidth: 95,
      },

      3: {
        cellWidth: 25,
      },

      4: {
        cellWidth: 22,
      },

      5: {
        cellWidth: 55,
      },

      6: {
        cellWidth: 55,
      },
    },
  });

  // ============================================================
  // POSIÇÃO FINAL DA TABELA
  // ============================================================

  const finalY =
    (doc as JsPDFWithAutoTable).lastAutoTable?.finalY ?? 0;

  // ============================================================
  // QUANTIDADE DE CURSOS POR LOCAL
  // ============================================================

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

  // ============================================================
  // RODAPÉ
  // ============================================================

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
      `${local}: ${quantidade} curso${
        quantidade !== 1 ? "s" : ""
      }`,
      14,
      rodapeY
    );

    rodapeY += 5;
  });

  // ============================================================
  // TOTAL GERAL
  // ============================================================

  rodapeY += 3;

  doc.setFont("helvetica", "bold");

  doc.text(
    `TOTAL DE CURSOS: ${lista.length}`,
    14,
    rodapeY
  );

  // ============================================================
  // ABRIR PDF
  // ============================================================

  const pdfBlob = doc.output("blob");

  const pdfUrl = URL.createObjectURL(pdfBlob);

  window.open(pdfUrl, "_blank");
}