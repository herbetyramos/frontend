import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";


interface JsPDFWithAutoTable extends jsPDF {

  lastAutoTable?: {
    finalY: number;
  };

}



interface MaterialSolicitado {

  nome_material: string;

  qtde: number;

  propriedade: "PERMANENTE" | "NAO_PERMANENTE";

}



interface SolicitacaoRelatorio {

  cronograma: {

    tema: string;

    data_inicio: string;

    data_fim: string;

    professor?: {

      nome: string;

    };

    localAula?: {

      nome: string;

    };

    salaAula?: {

      nome: string;

    };

    detentoras?: {

      empresa?: {

        nome: string;

      };

    };

  };


  materiais: MaterialSolicitado[];


  materiaisExtras?: {

    nome_material: string;

    qtde: number;

  }[];


  observacao?: string;

}



export function gerarRelatorioSolicitacao(
  dados: SolicitacaoRelatorio
) {


  const pdf = new jsPDF({

    orientation: "portrait",

    unit: "mm",

    format: "a4"

  }) as JsPDFWithAutoTable;



  const largura =
    pdf.internal.pageSize.getWidth();



  pdf.setFont(
    "helvetica",
    "bold"
  );


  pdf.setFontSize(16);


  pdf.text(
    "SOLICITAÇÃO DE MATERIAIS",
    largura / 2,
    18,
    {
      align: "center",
    }
  );



  pdf.setFontSize(10);



  let y = 30;



  pdf.setFont("helvetica", "bold");

  pdf.text(
    "Curso:",
    14,
    y
  );


  pdf.setFont(
    "helvetica",
    "normal"
  );


  pdf.text(
    dados.cronograma.tema || "-",
    40,
    y
  );



  y += 6;



  pdf.setFont(
    "helvetica",
    "bold"
  );


  pdf.text(
    "Professor:",
    14,
    y
  );


  pdf.setFont(
    "helvetica",
    "normal"
  );


  pdf.text(
    dados.cronograma.professor?.nome ?? "-",
    40,
    y
  );



  y += 6;



  pdf.setFont(
    "helvetica",
    "bold"
  );


  pdf.text(
    "Período:",
    14,
    y
  );


  pdf.setFont(
    "helvetica",
    "normal"
  );


  pdf.text(
    `${dados.cronograma.data_inicio} até ${dados.cronograma.data_fim}`,
    40,
    y
  );



  y += 6;



  pdf.setFont(
    "helvetica",
    "bold"
  );


  pdf.text(
    "Local:",
    14,
    y
  );


  pdf.setFont(
    "helvetica",
    "normal"
  );


  pdf.text(

    `${dados.cronograma.localAula?.nome ?? "-"} / ${dados.cronograma.salaAula?.nome ?? "-"}`,

    40,

    y

  );



  y += 6;



  pdf.setFont(
    "helvetica",
    "bold"
  );


  pdf.text(
    "Empresa:",
    14,
    y
  );


  pdf.setFont(
    "helvetica",
    "normal"
  );


  pdf.text(
    dados.cronograma.detentoras?.empresa?.nome ?? "-",
    40,
    y
  );



  y += 10;



  autoTable(pdf, {

    startY: y,


    head: [
      [
        "Qtd",
        "Material",
        "Tipo"
      ]
    ],


    body:

      dados.materiais.map(item => [

        item.qtde,

        item.nome_material,

        item.propriedade === "PERMANENTE"
          ? "Permanente"
          : "Não Permanente"

      ]),


    styles: {

      fontSize: 9

    },


    headStyles: {

      fillColor: [
        30,
        64,
        175
      ]

    }

  });



  y =
    pdf.lastAutoTable?.finalY ??
    y;


  y += 10;





  if (
    dados.materiaisExtras &&
    dados.materiaisExtras.length > 0
  ) {


    pdf.setFontSize(12);


    pdf.setFont(
      "helvetica",
      "bold"
    );


    pdf.text(
      "MATERIAIS EXTRAS",
      14,
      y
    );


    y += 4;



    autoTable(pdf, {


      startY: y,


      head: [
        [
          "Qtd",
          "Material"
        ]
      ],


      body:

        dados.materiaisExtras.map(item => [

          item.qtde,

          item.nome_material

        ]),


      styles: {

        fontSize: 9

      },


      headStyles: {

        fillColor: [
          22,
          163,
          74
        ]

      }


    });



    y =
      pdf.lastAutoTable?.finalY ??
      y;


    y += 10;


  }





  if(dados.observacao){


    pdf.setFont(
      "helvetica",
      "bold"
    );


    pdf.text(
      "Observação:",
      14,
      y
    );



    y += 6;



    pdf.setFont(
      "helvetica",
      "normal"
    );



    const linhas =
      pdf.splitTextToSize(
        dados.observacao,
        180
      );



    pdf.text(
      linhas,
      14,
      y
    );


    y +=
      linhas.length * 5 + 10;


  }




  pdf.line(
    20,
    255,
    90,
    255
  );


  pdf.line(
    120,
    255,
    190,
    255
  );



  pdf.setFontSize(9);



  pdf.text(
    "Professor",
    55,
    260,
    {
      align:"center"
    }
  );



  pdf.text(
    "Almoxarifado",
    155,
    260,
    {
      align:"center"
    }
  );



  pdf.save(
    "SolicitacaoMateriais.pdf"
  );


}