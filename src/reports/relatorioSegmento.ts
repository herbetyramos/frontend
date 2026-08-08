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

function capitalize(texto: string) {
  return texto
    .toLowerCase()
    .replace(/\b\w/g, (letra) => letra.toUpperCase());
}


export function visualizarRelatorioSegmento(
  cronogramaFull: CronogramaType[],
  filtroBloco: string,
  filtroDataFormatura: string
) {

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });


  let posY = 15;


  // ==========================
  // CABEÇALHO
  // ==========================

  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");

  doc.text(
    "CURSOS DA SECRETARIA DA MULHER E DA FAMÍLIA",
    105,
    posY,
    {
      align: "center",
    }
  );


  posY += 8;


  doc.setFontSize(10);
  doc.setFont("helvetica", "normal");


  if (filtroDataFormatura) {

    doc.text(
      `Formatura: ${filtroDataFormatura}`,
      14,
      posY
    );

    posY += 6;
  }


  if (filtroBloco) {

    doc.text(
      `Bloco: ${filtroBloco}`,
      14,
      posY
    );

    posY += 6;
  }


  doc.setDrawColor(180);

  doc.line(
    14,
    posY,
    195,
    posY
  );


  posY += 6;



  // ==========================
  // FILTRO
  // ==========================

  const lista = cronogramaFull.filter((item) => {

    const atendeFormatura =
      !filtroDataFormatura ||
      item.formatura?.data_formatura === filtroDataFormatura;


    const atendeBloco =
      !filtroBloco ||
      item.bloco_curso?.bloco_Curso === filtroBloco;


    return atendeFormatura && atendeBloco;

  });



  // ==========================
  // AGRUPAMENTO
  // ==========================

  const grupos: Record<string, CronogramaType[]> = {};


  lista.forEach((item) => {

    const segmento =
      item.detentoras?.curso?.segmento?.name ??
      "Sem Segmento";


    if (!grupos[segmento]) {
      grupos[segmento] = [];
    }


    grupos[segmento].push(item);

  });



  let totalGeral = 0;



  Object.keys(grupos)
    .sort()
    .forEach((segmento) => {


      totalGeral += grupos[segmento].length;



      if (posY > 250) {

        doc.addPage();

        posY = 20;

      }



      doc.setFontSize(14);

      doc.setFont(
        "helvetica",
        "bold"
      );


      doc.text(
        capitalize(segmento),
        14,
        posY
      );


      posY += 2;



      const rows = grupos[segmento].map(
        (item, index) => [

          index + 1,

          item.codigo,

          (item.tema ?? "").toUpperCase(),

          item.data_inicio,

          (
            item.professor?.nome_professor ??
            ""
          ).toUpperCase(),

        ]
      );



      autoTable(doc, {

        startY: posY,


        head: [[
          "Nº",
          "Código",
          "Tema",
          "Data Início",
          "Professor",
        ]],


        body: rows,


        theme: "grid",


        styles: {
          fontSize: 9,
        },


        headStyles: {
          fillColor: [200, 0, 0],
        },


        columnStyles: {

          0: {
            cellWidth: 12,
          },

          1: {
            cellWidth: 15,
          },

          2: {
            cellWidth: 80,
          },

          3: {
            cellWidth: 25,
          },

          4: {
            cellWidth: 58,
          },

        },

      });



      const finalY =
        doc.lastAutoTable?.finalY ?? posY;



      doc.setFontSize(11);

      doc.setFont(
        "helvetica",
        "bold"
      );


      doc.text(
        `SUBTOTAL: ${grupos[segmento].length}`,
        14,
        finalY + 6
      );


      posY = finalY + 14;


    });




  // ==========================
  // TOTAL GERAL
  // ==========================

  if (posY > 270) {

    doc.addPage();

    posY = 20;

  }



  doc.setDrawColor(0);


  doc.line(
    14,
    posY,
    195,
    posY
  );


  posY += 8;


  doc.setFontSize(13);

  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.text(
    `TOTAL GERAL DE CURSOS: ${totalGeral}`,
    14,
    posY
  );



  // ==========================
  // ABRIR PDF
  // ==========================

  const blob =
    doc.output("blob");


  window.open(
    URL.createObjectURL(blob),
    "_blank"
  );

}