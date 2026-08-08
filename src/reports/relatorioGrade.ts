import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { CronogramaType } from "@/app/matricula/types";

interface CronogramaGroup {
  [bloco: string]: {
    [polo: string]: {
      [sala: string]: CronogramaType[];
    };
  };
}

export function relatorioGrade(
  cronogramaFull: CronogramaType[],
  filtroBloco: string
) {
  const doc = new jsPDF();

  let posY = 6;

  const agrupadoPorBloco: CronogramaGroup = {};

  const listaFiltrada = filtroBloco
    ? cronogramaFull.filter(
        (item) =>
          item.bloco_curso?.bloco_Curso === filtroBloco
      )
    : cronogramaFull;

  listaFiltrada.forEach((item) => {
    const bloco =
      item.bloco_curso?.bloco_Curso || "Sem Bloco";

    const polo =
      item.localAula?.polo || "Sem Polo";

    const sala = item.salaAula
      ? `${item.salaAula.numero_sala} (${item.salaAula.tipo_uso})`
      : "Sem Sala";

    if (!agrupadoPorBloco[bloco])
      agrupadoPorBloco[bloco] = {};

    if (!agrupadoPorBloco[bloco][polo])
      agrupadoPorBloco[bloco][polo] = {};

    if (!agrupadoPorBloco[bloco][polo][sala])
      agrupadoPorBloco[bloco][polo][sala] = [];

    agrupadoPorBloco[bloco][polo][sala].push(item);
  });

  Object.keys(agrupadoPorBloco).forEach((bloco) => {

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 150);

    doc.text(
      `Cursos da Secretaria da Mulher e da Família - ${bloco}`,
      14,
      posY
    );

    posY += 2;

    Object.keys(agrupadoPorBloco[bloco]).forEach(
      (polo) => {

        doc.setFontSize(12);
        doc.setTextColor(0, 100, 0);

        posY += 8;

        doc.text(polo, 14, posY);

        posY += 2;

        Object.keys(
          agrupadoPorBloco[bloco][polo]
        ).forEach((sala) => {

          const registros =
            agrupadoPorBloco[bloco][polo][sala];

          const rows = registros.map((item) => [
            item.codigo,
            item.tema,
            item.data_inicio,
            item.data_fim,
            item.hora_inicio,
            item.hora_fim,
          ]);

          autoTable(doc, {
            startY: posY,

            head: [[
              { content: "Código" },
              { content: `Sala ${sala}` },
              {
                content: "Período",
                colSpan: 2,
                styles: {
                  halign: "center",
                },
              },
              {
                content: "Horário",
                colSpan: 2,
                styles: {
                  halign: "center",
                },
              },
            ]],

            body: rows,

            theme: "grid",

            headStyles: {
              fillColor: [200, 0, 0],
              textColor: "#fff",
            },

            styles: {
              fontSize: 10,
              overflow: "linebreak",
            },

            columnStyles: {
              0: {
                cellWidth: 18,
              },
              1: {
                cellWidth: 80,
              },
              2: {
                cellWidth: 22,
              },
              3: {
                cellWidth: 22,
              },
              4: {
                cellWidth: 15,
              },
              5: {
                cellWidth: 15,
              },
            },

            tableWidth: "wrap",
          });

          posY =
            (
              doc as unknown as {
                lastAutoTable: {
                  finalY: number;
                };
              }
            ).lastAutoTable.finalY + 1;
        });
      }
    );

    posY += 5;
  });

  const blob = doc.output("blob");

  window.open(
    URL.createObjectURL(blob),
    "_blank"
  );
}