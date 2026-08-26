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

// ============================================================
// CONFIGURAÇÃO DAS COLUNAS
// ============================================================

const COLUMN_WIDTHS = {
  codigo: 18,
  tema: 80,
  dataInicio: 22,
  dataFim: 22,
  horaInicio: 15,
  horaFim: 15,
};

// Posição inicial da tabela
const TABLE_START_X = 14;

// ============================================================
// POSIÇÃO CENTRAL DOS RÓTULOS
// ============================================================

// Centro das duas colunas de datas
const PERIODO_X =
  TABLE_START_X +
  COLUMN_WIDTHS.codigo +
  COLUMN_WIDTHS.tema +
  (COLUMN_WIDTHS.dataInicio +
    COLUMN_WIDTHS.dataFim) /
    2;

// Centro das duas colunas de horários
const HORARIO_X =
  TABLE_START_X +
  COLUMN_WIDTHS.codigo +
  COLUMN_WIDTHS.tema +
  COLUMN_WIDTHS.dataInicio +
  COLUMN_WIDTHS.dataFim +
  (COLUMN_WIDTHS.horaInicio +
    COLUMN_WIDTHS.horaFim) /
    2;

// ============================================================
// COR DA SALA
// Mantém a mesma lógica utilizada no frontend
// ============================================================

const corSala = (
  sala: string
): [number, number, number] => {
  const texto = sala.toUpperCase();

  if (
    texto.includes("BELEZA") ||
    texto.includes("BELEZA COM LAVATÓRIO") ||
    texto.includes("BELEZA COM MACA")
  ) {
    return [168, 85, 247]; // Lilás #A855F7
  }

  if (
    texto.includes("INFORMÁTICA") ||
    texto.includes("INFORMATICA")
  ) {
    return [145, 145, 0]; // Amarelo aproximado
  }

  if (
    texto.includes("GASTRONOMIA") ||
    texto.includes("COZINHA")
  ) {
    return [37, 99, 235]; // Azul #2563EB
  }

  if (texto.includes("ADMINISTRATIVO")) {
    return [180, 30, 30]; // Vermelho
  }

  if (texto.includes("SERVIÇOS")) {
    return [22, 163, 74]; // Verde #16A34A
  }

  if (texto.includes("COSTURA")) {
    return [250, 204, 21]; // Amarelo #FACC15
  }

  if (texto.includes("SABER")) {
    return [180, 30, 30]; // Vermelho
  }

  if (texto.includes("MULTIUSO")) {
    return [180, 30, 30]; // Vermelho
  }

  if (texto.includes("MODA")) {
    return [250, 204, 21]; // Amarelo #FACC15
  }

  if (texto.includes("CASA ROSA")) {
    return [236, 140, 160]; // Rosa
  }

  return [0, 0, 0]; // Preto
};

// ============================================================
// COR DE CONTRASTE
// ============================================================

const corTextoContraste = (
  cor: [number, number, number]
): [number, number, number] => {
  const luminosidade =
    cor[0] * 0.299 +
    cor[1] * 0.587 +
    cor[2] * 0.114;

  if (luminosidade > 160) {
    return [0, 0, 0];
  }

  return [255, 255, 255];
};

// ============================================================
// RELATÓRIO
// ============================================================

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
          item.bloco_curso?.bloco_Curso ===
          filtroBloco
      )
    : cronogramaFull;

  // ============================================================
  // AGRUPAMENTO
  // BLOCO -> POLO -> SALA
  // ============================================================

  listaFiltrada.forEach((item) => {
    const bloco =
      item.bloco_curso?.bloco_Curso ||
      "Sem Bloco";

    const polo =
      item.localAula?.polo ||
      "Sem Polo";

    const sala = item.salaAula
      ? `${item.salaAula.numero_sala} (${item.salaAula.tipo_uso})`
      : "Sem Sala";

    if (!agrupadoPorBloco[bloco]) {
      agrupadoPorBloco[bloco] = {};
    }

    if (!agrupadoPorBloco[bloco][polo]) {
      agrupadoPorBloco[bloco][polo] = {};
    }

    if (
      !agrupadoPorBloco[bloco][polo][sala]
    ) {
      agrupadoPorBloco[bloco][polo][sala] =
        [];
    }

    agrupadoPorBloco[bloco][polo][sala].push(
      item
    );
  });

  // ============================================================
  // PERCORRER BLOCOS
  // ============================================================

  Object.keys(agrupadoPorBloco).forEach(
    (bloco) => {
      // --------------------------------------------------------
      // TÍTULO DO BLOCO
      // --------------------------------------------------------

      doc.setFontSize(14);
      doc.setFont("helvetica", "bold");
      doc.setTextColor(0, 0, 150);

      doc.text(
        `Cursos da Secretaria da Mulher e da Família - ${bloco}`,
        14,
        posY
      );

      posY += 2;

      // --------------------------------------------------------
      // POLOS
      // --------------------------------------------------------

      Object.keys(
        agrupadoPorBloco[bloco]
      ).forEach((polo) => {
        const salasDoPolo =
          agrupadoPorBloco[bloco][polo];

        // ------------------------------------------------------
        // LINHA DO POLO
        // ------------------------------------------------------

        doc.setFontSize(12);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 100, 0);

        posY += 8;

        doc.text(
          `Polo: ${polo}`,
          TABLE_START_X,
          posY
        );

        // ------------------------------------------------------
        // PERÍODO
        // Centralizado sobre DATA INÍCIO + DATA FIM
        // ------------------------------------------------------

        doc.setFontSize(10);
        doc.setFont("helvetica", "bold");
        doc.setTextColor(0, 0, 0);

        doc.text(
          "Período",
          PERIODO_X,
          posY,
          {
            align: "center",
          }
        );

        // ------------------------------------------------------
        // HORÁRIO
        // Centralizado sobre HORA INÍCIO + HORA FIM
        // ------------------------------------------------------

        doc.text(
          "Horário",
          HORARIO_X,
          posY,
          {
            align: "center",
          }
        );

        posY += 5;

        // ------------------------------------------------------
        // SALAS
        // Ordenação numérica
        // ------------------------------------------------------

        Object.keys(salasDoPolo)
          .sort((a, b) => {
            const numeroA = parseInt(
              a.match(/\d+/)?.[0] || "0",
              10
            );

            const numeroB = parseInt(
              b.match(/\d+/)?.[0] || "0",
              10
            );

            return numeroA - numeroB;
          })
          .forEach((sala) => {
            const registros =
              salasDoPolo[sala];

            // --------------------------------------------------
            // COR DA SALA
            // --------------------------------------------------

            const cor = corSala(sala);

            const corTexto =
              corTextoContraste(cor);

            // --------------------------------------------------
            // DADOS
            // --------------------------------------------------

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

            // --------------------------------------------------
            // TABELA
            //
            // A primeira linha é a sala.
            // colSpan: 6 = uma única célula ocupando
            // toda a largura da tabela.
            // --------------------------------------------------

            autoTable(doc, {
              startY: posY,

              head: [
                [
                  {
                    content: `Sala ${sala}`,
                    colSpan: 6,

                    styles: {
                      fillColor: cor,
                      textColor: corTexto,
                      halign: "left",
                      valign: "middle",
                      fontStyle: "bold",
                      fontSize: 10,
                      cellPadding: 3,
                    },
                  },
                ],
              ],

              body: rows,

              theme: "grid",

              headStyles: {
                fillColor: cor,
                textColor: corTexto,
                fontStyle: "bold",
              },

              styles: {
                fontSize: 10,
                overflow: "linebreak",
                textColor: [0, 0, 0],
                cellPadding: 2,
              },

              columnStyles: {
                // Código
                0: {
                  cellWidth:
                    COLUMN_WIDTHS.codigo,
                },

                // Tema
                1: {
                  cellWidth:
                    COLUMN_WIDTHS.tema,
                },

                // Data início
                2: {
                  cellWidth:
                    COLUMN_WIDTHS.dataInicio,
                },

                // Data fim
                3: {
                  cellWidth:
                    COLUMN_WIDTHS.dataFim,
                },

                // Hora início
                4: {
                  cellWidth:
                    COLUMN_WIDTHS.horaInicio,
                },

                // Hora fim
                5: {
                  cellWidth:
                    COLUMN_WIDTHS.horaFim,
                },
              },

              tableWidth: "wrap",
            });

            // --------------------------------------------------
            // POSIÇÃO APÓS A TABELA
            // --------------------------------------------------

            posY =
              (
                doc as unknown as {
                  lastAutoTable: {
                    finalY: number;
                  };
                }
              ).lastAutoTable.finalY + 3;
          });
      });

      // --------------------------------------------------------
      // ESPAÇO ENTRE BLOCOS
      // --------------------------------------------------------

      posY += 5;
    }
  );

  // ============================================================
  // ABRIR PDF
  // ============================================================

  const blob = doc.output("blob");

  window.open(
    URL.createObjectURL(blob),
    "_blank"
  );
}