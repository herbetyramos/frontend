import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface Cronograma {
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
    [polo: string]: Cronograma[];
  };
}

export function gerarRelatorioDetentora(
  cronogramaFull: any[],
  filtroBloco: string,
  filtroPolo: string,
  filtroDataFormatura: string,
  filtroEmpresa: string
) {
  let lista = [...cronogramaFull];

  if (filtroBloco) {
    lista = lista.filter(
      item => item.bloco_curso?.bloco_Curso === filtroBloco
    );
  }

  if (filtroEmpresa) {
    lista = lista.filter(
      item =>
        item.detentoras?.ata?.empresa?.nome_empresa === filtroEmpresa
    );
  }

  if (filtroPolo) {
    lista = lista.filter(
      item => item.localAula?.polo === filtroPolo
    );
  }

  if (filtroDataFormatura) {
    lista = lista.filter(
      item =>
        item.formatura?.data_formatura === filtroDataFormatura
    );
  }

  const dados: RelatorioDetentora = {};

  lista.forEach(item => {
    const empresa =
      item.detentoras?.ata?.empresa?.nome_empresa ??
      "SEM DETENTORA";

    const polo =
      item.localAula?.polo ??
      "SEM POLO";

    if (!dados[empresa]) dados[empresa] = {};

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
      numero_ata: item.detentoras?.ata?.numero_ata ?? "-",
    });
  });

  const doc = new jsPDF("portrait", "mm", "a4");

  let posY = 15;

  doc.setFontSize(16);
  doc.setTextColor(0, 0, 150);
  doc.text("Relatório por Empres - Secretaria de Mulher " , 14, posY) ;
  

  posY += 10;

  Object.keys(dados).forEach((empresa) => {

    if (posY > 180) {
      doc.addPage();
      posY = 15;
    }

   const numeroAta =
  dados[empresa][Object.keys(dados[empresa])[0]][0]?.numero_ata ?? "-";

      doc.setFontSize(14);
      doc.setTextColor(180, 0, 0);

      doc.text(
        `ATA Nº: ${numeroAta} - ${empresa}`,
        14,
        posY
      );

      posY += 8;

    

    Object.keys(dados[empresa]).forEach((polo) => {

      doc.setFontSize(12);
      doc.setTextColor(0, 120, 0);
      doc.text(`POLO: ${polo}`, 18, posY);

      posY += 3;

      const body = dados[empresa][polo].map((curso) => [
        curso.codigo,
        curso.tema,
        curso.data_inicio,
        curso.data_fim,
        curso.hora_inicio,
        curso.hora_fim,
      ]);

      autoTable(doc, {
        startY: posY,

        head: [[
          "Código",
          "Curso",
          "Data Inicial",
          "Data Final",
          "Hora Inicial",
          "Hora Final",
        ]],

        body,

        theme: "grid",

        headStyles: {
          fillColor: [180, 0, 0],
          textColor: [255, 255, 255],
          halign: "center",
        },

        styles: {
          fontSize: 9,
          cellPadding: 2,
          overflow: "linebreak",
        },

        columnStyles: {
          0: { cellWidth: 15 },
          1: { cellWidth: 75 },
          2: { cellWidth: 22 },
          3: { cellWidth: 22 },
          4: { cellWidth: 22 },
          5: { cellWidth: 22 },
        },
      });

      posY = (doc as any).lastAutoTable.finalY + 8;

      if (posY > 180) {
        doc.addPage();
        posY = 15;
      }
    });

    posY += 6;
  });

  const paginas = doc.getNumberOfPages();

  for (let i = 1; i <= paginas; i++) {
    doc.setPage(i);

    doc.setFontSize(9);
    doc.setTextColor(120);

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

  window.open(
    URL.createObjectURL(doc.output("blob")),
    "_blank"
  );
}