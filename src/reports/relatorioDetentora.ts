import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CronogramaType } from "@/app/matricula/types";

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

interface CronogramaRelatorio {
  codigo: number;
  tema: string;
  data_inicio: string;
  data_fim: string;
  hora_inicio: string;
  hora_fim: string;
  numero_ata: string;
}

interface RelatorioDetentora {
  [empresa: string]: {
    [polo: string]: CronogramaRelatorio[];
  };
}


export function gerarRelatorioDetentora(
  cronogramaFull: CronogramaType[],
  filtroBloco: string,
  filtroPolo: string,
  filtroDataFormatura: string,
  filtroEmpresa: string
) {

  let lista = [...cronogramaFull];


  if (filtroBloco) {
    lista = lista.filter(
      (item) =>
        item.bloco_curso?.bloco_Curso === filtroBloco
    );
  }


  if (filtroEmpresa) {
    lista = lista.filter(
      (item) =>
        item.detentoras?.ata?.empresa?.nome_empresa === filtroEmpresa
    );
  }


  if (filtroPolo) {
    lista = lista.filter(
      (item) =>
        item.localAula?.polo === filtroPolo
    );
  }


  if (filtroDataFormatura) {
    lista = lista.filter(
      (item) =>
        item.formatura?.data_formatura === filtroDataFormatura
    );
  }



  const dados: RelatorioDetentora = {};



  lista.forEach((item) => {

    const empresa =
      item.detentoras?.ata?.empresa?.nome_empresa ??
      "SEM DETENTORA";


    const polo =
      item.localAula?.polo ??
      "SEM POLO";



    if (!dados[empresa]) {
      dados[empresa] = {};
    }


    if (!dados[empresa][polo]) {
      dados[empresa][polo] = [];
    }



    dados[empresa][polo].push({

      codigo: item.codigo,

      tema: item.tema,

      data_inicio: item.data_inicio,

      data_fim: item.data_fim,

      hora_inicio: item.hora_inicio,

      hora_fim: item.hora_fim,

      numero_ata:
        item.detentoras?.ata?.numero_ata ?? "-"

    });


  });



  const doc =
    new jsPDF(
      "portrait",
      "mm",
      "a4"
    ) as JsPDFWithAutoTable;



  let posY = 15;



  doc.setFontSize(16);
  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    "RELATÓRIO POR EMPRESA - SECRETARIA DA MULHER",
    14,
    posY
  );

  posY += 12;




  Object.keys(dados)
    .sort()
    .forEach((empresa) => {


      if (posY > 180) {

        doc.addPage();

        posY = 15;

      }



      const primeiroPolo =
        Object.keys(dados[empresa])[0];


      const numeroAta =
        dados[empresa]
          [primeiroPolo]
          [0]
          ?.numero_ata ?? "-";



      doc.setFontSize(14);

      doc.setFont(
        "helvetica",
        "bold"
      );


      doc.text(
        `ATA Nº ${numeroAta} - ${empresa}`,
        14,
        posY
      );


      posY += 8;



      Object.keys(dados[empresa])
        .sort()
        .forEach((polo) => {


          if (posY > 180) {

            doc.addPage();

            posY = 15;

          }



          doc.setFontSize(12);

          doc.text(
            `POLO: ${polo}`,
            18,
            posY
          );


          posY += 4;



          const body =
            dados[empresa][polo]
              .map((curso) => [

                curso.codigo,

                curso.tema,

                curso.data_inicio,

                curso.data_fim,

                curso.hora_inicio,

                curso.hora_fim

              ]);



          autoTable(doc, {

            startY: posY,


            head: [[

              "Código",

              "Curso",

              "Data Inicial",

              "Data Final",

              "Hora Inicial",

              "Hora Final"

            ]],


            body,


            theme: "grid",


            styles: {

              fontSize: 9,

              cellPadding: 2

            },


            headStyles: {

              fillColor: [
                180,
                0,
                0
              ],

              textColor: 255

            },


            columnStyles: {

              0: {
                cellWidth: 15
              },

              1: {
                cellWidth: 75
              },

              2: {
                cellWidth: 22
              },

              3: {
                cellWidth: 22
              },

              4: {
                cellWidth: 22
              },

              5: {
                cellWidth: 22
              }

            }

          });



          posY =
            doc.lastAutoTable?.finalY ?? posY;


          posY += 8;



        });



      posY += 8;


    });




  const paginas =
    doc.getNumberOfPages();



  for (
    let i = 1;
    i <= paginas;
    i++
  ) {

    doc.setPage(i);


    doc.setFontSize(9);


    doc.text(
      `Página ${i} de ${paginas}`,
      170,
      285
    );


    doc.text(
      `Emitido em ${new Date().toLocaleDateString("pt-BR")}`,
      14,
      285
    );

  }




  const blob =
    doc.output("blob");


  window.open(
    URL.createObjectURL(blob),
    "_blank"
  );

}