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

  // ============================================================
  // FILTRO
  // ============================================================

  const listaFiltrada = filtroBloco
    ? cronogramaFull.filter(
        (item) =>
          item.bloco_curso?.bloco_Curso === filtroBloco
      )
    : cronogramaFull;

  // ============================================================
  // AGRUPAMENTO
  // BLOCO -> POLO -> SALA
  // ============================================================

  listaFiltrada.forEach((item) => {
    const bloco =
      item.bloco_curso?.bloco_Curso || "Sem Bloco";

    const polo =
      item.localAula?.polo || "Sem Polo";

    const sala = item.salaAula
      ? `${item.salaAula.numero_sala} (${item.salaAula.tipo_uso})`
      : "Sem Sala";

    if (!agrupadoPorBloco[bloco]) {
      agrupadoPorBloco[bloco] = {};
    }

    if (!agrupadoPorBloco[bloco][polo]) {
      agrupadoPorBloco[bloco][polo] = {};
    }

    if (!agrupadoPorBloco[bloco][polo][sala]) {
      agrupadoPorBloco[bloco][polo][sala] = [];
    }

    agrupadoPorBloco[bloco][polo][sala].push(item);
  });

  // ============================================================
  // RELATÓRIO
  // ============================================================

  Object.keys(agrupadoPorBloco).forEach((bloco) => {
    // ----------------------------------------------------------
    // TÍTULO DO BLOCO
    // ----------------------------------------------------------

    doc.setFontSize(14);
    doc.setTextColor(0, 0, 150);

    doc.text(
      `Cursos da Secretaria da Mulher e da Família - ${bloco}`,
      14,
      posY
    );

    posY += 2;

    // ----------------------------------------------------------
    // POLOS DA SECRETARIA E DE TODOS OS CRAS
    // ----------------------------------------------------------

    Object.keys(agrupadoPorBloco[bloco]).forEach(
      (polo) => {
        const salasDoPolo =
          agrupadoPorBloco[bloco][polo];

        // --------------------------------------------------------
        // LINHA DO POLO
        // --------------------------------------------------------

        doc.setFontSize(12);
        doc.setTextColor(0, 100, 0);

        posY += 8;

        // Polo
        doc.text(
          `Polo: ${polo}`,
          14,
          posY
        );

        // --------------------------------------------------------
        // RÓTULO PERÍODO
        // Centralizado sobre as duas colunas de datas
        // --------------------------------------------------------

        doc.setFontSize(10);
        doc.setTextColor(0, 0, 0);

        doc.text(
          "Período",
          113,
          posY,
          {
            align: "center",
          }
        );

        // --------------------------------------------------------
        // RÓTULO HORÁRIO
        // Centralizado sobre as duas colunas de horários
        // --------------------------------------------------------

        doc.text(
          "Horário",
          158,
          posY,
          {
            align: "center",
          }
        );

        posY += 3;

        // --------------------------------------------------------
        // SALAS
        // --------------------------------------------------------

        Object.keys(salasDoPolo).forEach(
          (sala) => {
            const registros =
              salasDoPolo[sala];

            // ----------------------------------------------------
            // DADOS DA TABELA
            //
            // Não existem mais os rótulos:
            // Data início
            // Data fim
            // Hora início
            // Hora fim
            // ----------------------------------------------------

            const rows = registros.map(
              (item) => [
                item.codigo,
                item.tema,
                item.data_inicio,
                item.data_fim,
                item.hora_inicio,
                item.hora_fim,
              ]
            );

            // ----------------------------------------------------
            // TABELA
            // ----------------------------------------------------

            autoTable(doc, {
              startY: posY,

              // Sem head.
              // A tabela terá somente os dados.
              body: rows,

              theme: "grid",

              styles: {
                fontSize: 10,
                overflow: "linebreak",
                textColor: [0, 0, 0],
              },

              columnStyles: {
                // Código
                0: {
                  cellWidth: 18,
                },

                // Tema / Sala
                1: {
                  cellWidth: 80,
                },

                // Data início
                2: {
                  cellWidth: 22,
                },

                // Data fim
                3: {
                  cellWidth: 22,
                },

                // Hora início
                4: {
                  cellWidth: 15,
                },

                // Hora fim
                5: {
                  cellWidth: 15,
                },
              },

              tableWidth: "wrap",
            });

            // ----------------------------------------------------
            // POSIÇÃO APÓS A TABELA
            // ----------------------------------------------------

            posY =
              (
                doc as unknown as {
                  lastAutoTable: {
                    finalY: number;
                  };
                }
              ).lastAutoTable.finalY + 1;
          }
        );
      }
    );

    // Espaçamento entre blocos
    posY += 5;
  });

  // ============================================================
  // ABRIR PDF
  // ============================================================

  const blob = doc.output("blob");

  window.open(
    URL.createObjectURL(blob),
    "_blank"
  );
}