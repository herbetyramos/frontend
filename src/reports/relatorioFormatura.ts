import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CronogramaType } from "@/types/Cronograma"; // ajuste o caminho conforme seu projeto



function getPeriodo(hora: string) {
  const h = parseInt(hora.split(":")[0]);

  if (h < 12) return "MANHÃ";
  if (h < 18) return "TARDE";
  return "NOITE";
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

   doc.text(
    "RELATÓRIO DE CURSOS DA FORMATURA",
    14,
    15
  );

  if (filtroDataFormatura) {
    doc.setFontSize(11);

    doc.text(
      `Data da Formatura: ${filtroDataFormatura}`,
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
            item.formatura?.data_formatura === filtroDataFormatura;

          return blocoOK && formaturaOK;
        });

        
  const rows = lista.map((item, index) => [
  index + 1,
  item.codigo,
  item.tema,
  item.data_inicio,
  getPeriodo(item.hora_inicio),
  item.localAula?.polo || "",
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
    },

    headStyles: {
      fillColor: [0, 70, 140],
      textColor: 255,
      fontStyle: "bold",
    },

    columnStyles: {
      0: { cellWidth: 15 }, // Nº
      1: { cellWidth: 15 }, // código
      2: { cellWidth: 100 }, // tema
      3: { cellWidth: 20 }, // data
      4: { cellWidth: 18 }, // período
      5: { cellWidth: 55 }, // local
      6: { cellWidth: 55 }, // professor
    },
  });
const finalY =
  (doc as any).lastAutoTable.finalY;

doc.setFontSize(12);

doc.text(
  `Total de Cursos: ${lista.length}`,
  14,
  finalY + 10
);
  

  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  window.open(pdfUrl, "_blank");
}


