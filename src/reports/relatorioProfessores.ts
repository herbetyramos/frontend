import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CronogramaType } from "@/app/matricula/types";

declare module "jspdf" {
  interface jsPDF {
    lastAutoTable?: {
      finalY: number;
    };
  }
}

export function visualizarRelatorioProfessores(
  cronogramaFull: CronogramaType[],
  filtroBloco: string,
  filtroDataFormatura: string
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // Filtrar
  const lista = cronogramaFull.filter((item) => {

    if (filtroBloco) {
      return item.bloco_curso?.bloco_Curso === filtroBloco;
    }

    if (filtroDataFormatura) {
      return item.formatura?.data_formatura === filtroDataFormatura;
    }

    return true;

  });

  // Remover professores repetidos
  const professores = Array.from(
    new Map(
      lista
        .filter((item) => item.professor)
        .map((item) => [
          item.professor!.id,
          item.professor!,
        ])
    ).values()
  );

  // Ordenar
  professores.sort((a, b) =>
    a.nome_professor.localeCompare(b.nome_professor)
  );

  // Cabeçalho
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");

  doc.text(
    "SECRETARIA DA MULHER E DA FAMÍLIA",
    105,
    15,
    { align: "center" }
  );

  doc.setFontSize(13);

  doc.text(
    "RELAÇÃO DE PROFESSORES",
    105,
    22,
    { align: "center" }
  );

  let posY = 30;

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  if (filtroDataFormatura) {
    doc.text(`Formatura: ${filtroDataFormatura}`, 14, posY);
    posY += 6;
  }

  if (filtroBloco) {
    doc.text(`Bloco: ${filtroBloco}`, 14, posY);
    posY += 6;
  }

  const rows = professores.map((prof, index) => [
    index + 1,
    prof.nome_professor.toUpperCase(),
    prof.telefone ?? "",
  ]);

  autoTable(doc, {

    startY: posY,

    head: [[
      "Nº",
      "Professor",
      "Telefone",
    ]],

    body: rows,

    theme: "grid",

    styles: {
      fontSize: 10,
    },

    headStyles: {
      fillColor: [200, 0, 0],
    },

    columnStyles: {
      0: { cellWidth: 15 },
      1: { cellWidth: 110 },
      2: { cellWidth: 55 },
    },

  });

  const finalY =
  doc.lastAutoTable?.finalY ?? posY;

  doc.setFont("helvetica", "bold");
  doc.setFontSize(11);

  doc.text(
    `TOTAL DE PROFESSORES: ${professores.length}`,
    14,
    finalY + 8
  );

  const blob = doc.output("blob");

  window.open(
    URL.createObjectURL(blob),
    "_blank"
  );
}