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



  const rows = lista.map((item, index) => [

    index + 1,

    item.codigo,

    item.tema || "",

    formatarData(item.data_inicio),

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

const finalY =
  (doc as JsPDFWithAutoTable).lastAutoTable?.finalY ?? 0;

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