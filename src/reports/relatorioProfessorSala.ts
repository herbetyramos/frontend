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


function getPeriodo(hora: string) {
  const h = parseInt(hora.split(":")[0]);

  if (h < 12) return "MANHÃ";
  if (h < 18) return "TARDE";

  return "NOITE";
}


export function visualizarRelatorioProfessorSala(
  cronogramaFull: CronogramaType[],
  filtroBloco: string,
  filtroDataFormatura: string
) {

  console.log("Entrou no relatório");


  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });


  let posY = 30;


  // CABEÇALHO
  doc.setFontSize(16);
  doc.setFont("helvetica", "bold");

  doc.text(
    "SECRETARIA DA MULHER E DA FAMÍLIA",
    148,
    15,
    {
      align: "center",
    }
  );


  doc.setFontSize(13);

 

  // FILTROS
  const lista = cronogramaFull.filter((item) => {


    const atendeBloco =
      !filtroBloco ||
      item.bloco_curso?.bloco_Curso === filtroBloco;


    const atendeFormatura =
      !filtroDataFormatura ||
      item.formatura?.data_formatura === filtroDataFormatura;


    return atendeBloco && atendeFormatura;

  });



  // ORDENAÇÃO

  lista.sort((a, b) => {


    const salaA =
      a.salaAula?.numero_sala ?? "";

    const salaB =
      b.salaAula?.numero_sala ?? "";


    if (salaA !== salaB) {

      return salaA.localeCompare(salaB);

    }



    const blocoA =
      a.bloco_curso?.bloco_Curso ?? "";


    const blocoB =
      b.bloco_curso?.bloco_Curso ?? "";


    if (blocoA !== blocoB) {

      return blocoA.localeCompare(blocoB);

    }



    return (
      a.professor?.nome_professor ?? ""
    ).localeCompare(
      b.professor?.nome_professor ?? ""
    );


  });



  // AGRUPAMENTO BLOCO / SALA

  const grupos:
    Record<string, Record<string, CronogramaType[]>>
    = {};



  lista.forEach((item) => {


    const bloco =
      item.bloco_curso?.bloco_Curso ??
      "SEM BLOCO";


    const sala =
      item.salaAula?.numero_sala ??
      "SEM SALA";



    if (!grupos[bloco]) {

      grupos[bloco] = {};

    }



    if (!grupos[bloco][sala]) {

      grupos[bloco][sala] = [];

    }



    grupos[bloco][sala].push(item);


  });



  let totalGeral = 0;



  // PERCORRE BLOCOS

  Object.keys(grupos)
    .sort()
    .forEach((bloco) => {



      if (posY > 170) {

        doc.addPage();

        posY = 20;

      }



      // TITULO BLOCO

      doc.setFontSize(13);

      doc.setFont(
        "helvetica",
        "bold"
      );


      doc.setTextColor(
        180,
        0,
        0
      );


      doc.text(
        `Grade: ${bloco}`,
        14,
        posY
      );


      posY += 2;



      // SALAS

      Object.keys(grupos[bloco])
        .sort()
        .forEach((sala) => {



          if (posY > 170) {

            doc.addPage();

            posY = 20;

          }



          doc.setFontSize(11);

          doc.setFont(
            "helvetica",
            "bold"
          );


          doc.setTextColor(
            0,
            0,
            0
          );
         
          posY += 4;

          const rows =
            grupos[bloco][sala]
              .map((item, index) => [

                index + 1,

                item.codigo,

                item.tema
                  ?.toUpperCase() ?? "",

                item.data_inicio,

                item.data_fim,

                getPeriodo(
                  item.hora_inicio
                ),

                `${item.hora_inicio} às ${item.hora_fim}`,

                item.professor
                  ?.nome_professor
                  ?.toUpperCase() ?? ""

              ]);




          autoTable(doc, {


            startY: posY,


            pageBreak: "avoid",



            head: [[

              "Nº",

              "Código",

              { content: `Tema do Curso - Sala ${sala}` },

              "Data Início",

              "Data Fim",

              "Período",

              "Horário",

              "Professor",

            ]],



            body: rows,



            theme: "grid",



            styles: {

              fontSize: 9,

              cellPadding: 2,

            },



            headStyles: {

              fillColor: [
                200,
                0,
                0
              ],

              textColor: 255,

            },



            columnStyles: {


              0: {
                cellWidth: 10
              },


              1: {
                cellWidth: 15
              },


              2: {
                cellWidth: 95
              },


              3: {
                cellWidth: 22
              },


              4: {
                cellWidth: 22
              },


              5: {
                cellWidth: 20
              },


              6: {
                cellWidth: 28
              },


              7: {
                cellWidth: 60
              },


            },


          });




          const finalY =
  doc.lastAutoTable?.finalY ?? posY;



          doc.setFontSize(10);

          doc.setFont(
            "helvetica",
            "bold"
          );



         

          totalGeral +=
            grupos[bloco][sala].length;



          posY =
            finalY + 5;



        });



      posY += 5;



    });




  // TOTAL GERAL

  if (posY > 170) {

    doc.addPage();

    posY = 20;

  }



  doc.setFontSize(12);

  doc.setFont(
    "helvetica",
    "bold"
  );


  doc.text(

    `TOTAL GERAL DE TURMAS: ${totalGeral}`,

    14,

    posY + 10

  );



  // ABRIR PDF NOVA GUIA

  const pdfUrl =
    doc.output("bloburl");


  window.open(
    pdfUrl,
    "_blank"
  );


}