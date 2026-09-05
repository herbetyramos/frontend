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

const TABLE_START_X = 14;

// Largura total da tabela
const TABLE_WIDTH =
  COLUMN_WIDTHS.codigo +
  COLUMN_WIDTHS.tema +
  COLUMN_WIDTHS.dataInicio +
  COLUMN_WIDTHS.dataFim +
  COLUMN_WIDTHS.horaInicio +
  COLUMN_WIDTHS.horaFim;

// ============================================================
// POSIÇÃO CENTRAL DOS RÓTULOS
// ============================================================

// Centro das colunas DATA INÍCIO + DATA FIM
const PERIODO_X =
  TABLE_START_X +
  COLUMN_WIDTHS.codigo +
  COLUMN_WIDTHS.tema +
  (COLUMN_WIDTHS.dataInicio +
    COLUMN_WIDTHS.dataFim) /
    2;

// Centro das colunas HORA INÍCIO + HORA FIM
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
    return [168, 85, 247];
  }

  if (
    texto.includes("INFORMÁTICA") ||
    texto.includes("INFORMATICA")
  ) {
    return [145, 145, 0];
  }

  if (
    texto.includes("GASTRONOMIA") ||
    texto.includes("COZINHA")
  ) {
    return [37, 99, 235];
  }

  if (texto.includes("ADMINISTRATIVO")) {
    return [180, 30, 30];
  }

  if (texto.includes("SERVIÇOS")) {
    return [22, 163, 74];
  }

  if (texto.includes("COSTURA")) {
    return [250, 204, 21];
  }

  if (texto.includes("SABER")) {
    return [180, 30, 30];
  }

  if (texto.includes("MULTIUSO")) {
    return [180, 30, 30];
  }

  if (texto.includes("MODA")) {
    return [250, 204, 21];
  }

  if (texto.includes("CASA ROSA")) {
    return [236, 140, 160];
  }

  return [0, 0, 0];
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
// CONVERTER TEXTO PARA MAIÚSCULO
// ============================================================

const maiusculo = (
  valor: unknown
): string => {
  if (
    valor === null ||
    valor === undefined
  ) {
    return "";
  }

  return String(valor).toLocaleUpperCase(
    "pt-BR"
  );
};

// ============================================================
// RELATÓRIO
// ============================================================

export function relatorioGrade(
  cronogramaFull: CronogramaType[],
  filtroBloco: string
) {
  // ==========================================================
  // CRIAÇÃO DO PDF
  // ==========================================================

  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // ==========================================================
  // DIMENSÕES DA PÁGINA
  // ==========================================================

  const pageHeight =
    doc.internal.pageSize.getHeight();

  const pageWidth =
    doc.internal.pageSize.getWidth();

  // ==========================================================
  // MARGENS
  // ==========================================================

  const MARGIN_TOP = 10;
  const MARGIN_BOTTOM = 12;

  let posY = MARGIN_TOP;

  // ==========================================================
  // AGRUPAMENTO
  // BLOCO -> POLO -> SALA
  // ==========================================================

  const agrupadoPorBloco: CronogramaGroup =
    {};

  // ==========================================================
  // FILTRO
  // ==========================================================

  const listaFiltrada = filtroBloco
    ? cronogramaFull.filter(
        (item) =>
          item.bloco_curso?.bloco_Curso ===
          filtroBloco
      )
    : cronogramaFull;

  // ==========================================================
  // AGRUPAR
  // ==========================================================

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

  // ==========================================================
  // FUNÇÃO PARA OBTER FINAL Y
  // ==========================================================

  const obterFinalY = (): number => {
    return (
      doc as unknown as {
        lastAutoTable: {
          finalY: number;
        };
      }
    ).lastAutoTable.finalY;
  };

  // ==========================================================
  // FUNÇÃO PARA VERIFICAR ESPAÇO
  // ==========================================================

  const adicionarPaginaSeNecessario = (
    alturaNecessaria: number
  ) => {
    if (
      posY + alturaNecessaria >
      pageHeight - MARGIN_BOTTOM
    ) {
      doc.addPage();

      posY = MARGIN_TOP;
    }
  };

  // ==========================================================
  // PERCORRER BLOCOS
  // ==========================================================

  Object.keys(agrupadoPorBloco).forEach(
    (bloco, indiceBloco) => {
      // ========================================================
      // TÍTULO DO BLOCO
      // ========================================================

      adicionarPaginaSeNecessario(20);

      doc.setFontSize(14);
      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.setTextColor(
        0,
        0,
        150
      );

      doc.text(
        `Cursos da Secretaria da Mulher e da Família - ${maiusculo(
          bloco
        )}`,
        TABLE_START_X,
        posY
      );

      posY += 5;

      // ========================================================
      // POLOS / LOCAIS
      // ========================================================

      Object.keys(
        agrupadoPorBloco[bloco]
      ).forEach((polo) => {
        const salasDoPolo =
          agrupadoPorBloco[bloco][polo];

        // ======================================================
        // TOTAL DE CURSOS DO POLO
        // ======================================================

        const totalCursosPolo =
          Object.values(
            salasDoPolo
          ).reduce(
            (total, registros) =>
              total + registros.length,
            0
          );

        // ======================================================
        // ESPAÇO PARA O CABEÇALHO DO POLO
        // ======================================================

        adicionarPaginaSeNecessario(25);

        // ======================================================
        // LINHA DO POLO
        // ======================================================

        doc.setFontSize(12);
        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setTextColor(
          0,
          100,
          0
        );

        posY += 4;

        // ======================================================
        // NOME DO POLO
        // ======================================================

        doc.text(
          `Polo: ${polo}`,
          TABLE_START_X,
          posY
        );

        // ======================================================
        // TOTAL DE CURSOS
        // ======================================================

        doc.setFontSize(10);
        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.setTextColor(
          0,
          0,
          0
        );

        doc.text(
          `Total de cursos: ${totalCursosPolo}`,
          TABLE_START_X + 55,
          posY
        );

        // ======================================================
        // PERÍODO
        // ======================================================

        doc.text(
          "Período",
          PERIODO_X,
          posY,
          {
            align: "center",
          }
        );

        // ======================================================
        // HORÁRIO
        // ======================================================

        doc.text(
          "Horário",
          HORARIO_X,
          posY,
          {
            align: "center",
          }
        );

        posY += 3;

        // ======================================================
        // SALAS
        // ======================================================

        Object.keys(salasDoPolo)
          .sort((a, b) => {
            const numeroA = parseInt(
              a.match(/\d+/)?.[0] ||
                "0",
              10
            );

            const numeroB = parseInt(
              b.match(/\d+/)?.[0] ||
                "0",
              10
            );

            return (
              numeroA - numeroB
            );
          })
          .forEach((sala) => {
            const registros =
              salasDoPolo[sala];

            // ==================================================
            // COR DA SALA
            // ==================================================

            const cor =
              corSala(sala);

            const corTexto =
              corTextoContraste(
                cor
              );

            // ==================================================
            // TOTAL DE CURSOS DA SALA
            // ==================================================

            const totalCursosSala =
              registros.length;

            // ==================================================
            // GARANTIR ESPAÇO ANTES DA TABELA
            // ==================================================

            adicionarPaginaSeNecessario(
              20
            );

            // ==================================================
            // DADOS DA TABELA
            //
            // TEMA EM MAIÚSCULO
            // ==================================================

            const rows =
              registros.map(
                (item) => [
                  item.codigo ??
                    "",

                  maiusculo(
                    item.tema
                  ),

                  item.data_inicio ??
                    "",

                  item.data_fim ??
                    "",

                  item.hora_inicio ??
                    "",

                  item.hora_fim ??
                    "",
                ]
              );

            // ==================================================
            // POSIÇÃO INICIAL DA TABELA
            // ==================================================

            const tableStartY =
              posY;

            // ==================================================
            // TABELA
            // ==================================================

            autoTable(doc, {
              startY:
                tableStartY,

              margin: {
                left:
                  TABLE_START_X,
                right: 14,
                top:
                  MARGIN_TOP,
                bottom:
                  MARGIN_BOTTOM,
              },

              // =================================================
              // CABEÇALHO DA SALA
              // =================================================

              head: [
                [
                  {
                    content: `Sala ${sala}  —  ${totalCursosSala} ${
                      totalCursosSala ===
                      1
                        ? "CURSO"
                        : "CURSOS"
                    }`,
                    colSpan: 6,
                  },
                ],
              ],

              // =================================================
              // CORPO
              // =================================================

              body: rows,

              // =================================================
              // TEMA DO RELATÓRIO
              // =================================================

              theme: "grid",

              // =================================================
              // CABEÇALHO
              // =================================================

              headStyles: {
                fillColor:
                  cor,

                textColor:
                  corTexto,

                fontStyle:
                  "bold",

                fontSize: 9,

                halign:
                  "left",

                valign:
                  "middle",

                lineColor:
                  cor,

                lineWidth:
                  0.5,

                cellPadding: {
                  top: 1.2,
                  bottom: 1.2,
                  left: 2,
                  right: 2,
                },
              },

              // =================================================
              // ESTILOS GERAIS
              // =================================================

              styles: {
                font:
                  "helvetica",

                fontSize: 9,

                overflow:
                  "linebreak",

                textColor: [
                  0,
                  0,
                  0,
                ],

                cellPadding: {
                  top: 1.5,
                  bottom: 1.5,
                  left: 2,
                  right: 2,
                },

                lineColor: [
                  180,
                  180,
                  180,
                ],

                lineWidth:
                  0.2,

                valign:
                  "middle",
              },

              // =================================================
              // COLUNAS
              // =================================================

              columnStyles: {
                0: {
                  cellWidth:
                    COLUMN_WIDTHS.codigo,

                  halign:
                    "center",
                },

                1: {
                  cellWidth:
                    COLUMN_WIDTHS.tema,

                  halign:
                    "left",
                },

                2: {
                  cellWidth:
                    COLUMN_WIDTHS.dataInicio,

                  halign:
                    "center",
                },

                3: {
                  cellWidth:
                    COLUMN_WIDTHS.dataFim,

                  halign:
                    "center",
                },

                4: {
                  cellWidth:
                    COLUMN_WIDTHS.horaInicio,

                  halign:
                    "center",
                },

                5: {
                  cellWidth:
                    COLUMN_WIDTHS.horaFim,

                  halign:
                    "center",
                },
              },

              // =================================================
              // LARGURA DA TABELA
              // =================================================

              tableWidth:
                TABLE_WIDTH,

              // =================================================
              // REPETIR CABEÇALHO SE A TABELA CONTINUAR
              // =================================================

              showHead:
                "everyPage",

              // =================================================
              // CONTROLE DA QUEBRA DE PÁGINA
              // =================================================

              pageBreak:
                "auto",

              // =================================================
              // EVITAR LINHAS PROBLEMÁTICAS
              // =================================================

              rowPageBreak:
                "avoid",

              // =================================================
              // DESENHO DA PÁGINA
              // =================================================

              didDrawPage:
                () => {
                  // Não desenhar borda externa manualmente.
                  //
                  // O autoTable já utiliza grid.
                  //
                  // Isso evita que uma borda seja desenhada
                  // incorretamente entre páginas.
                },
            });

            // ==================================================
            // ATUALIZAR POSIÇÃO
            // ==================================================

            posY =
              obterFinalY() +
              4;

            // ==================================================
            // SE CHEGOU AO FINAL DA PÁGINA
            // ==================================================

            if (
              posY >
              pageHeight -
                MARGIN_BOTTOM
            ) {
              doc.addPage();

              posY =
                MARGIN_TOP;
            }
          });

        // ======================================================
        // ESPAÇO ENTRE POLOS
        // ======================================================

        posY += 5;
      });

      // ========================================================
      // ESPAÇO ENTRE BLOCOS
      // ========================================================

      if (
        indiceBloco <
        Object.keys(
          agrupadoPorBloco
        ).length -
          1
      ) {
        posY += 6;
      }
    }
  );

  // ============================================================
  // RODAPÉ COM NÚMERO DAS PÁGINAS
  // ============================================================

  const totalPaginas =
    doc.getNumberOfPages();

  for (
    let pagina = 1;
    pagina <= totalPaginas;
    pagina++
  ) {
    doc.setPage(pagina);

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    doc.setTextColor(
      100,
      100,
      100
    );

    doc.text(
      `Página ${pagina} de ${totalPaginas}`,
      pageWidth - 14,
      pageHeight - 5,
      {
        align: "right",
      }
    );
  }

  // ============================================================
  // ABRIR PDF
  // ============================================================

  const blob =
    doc.output("blob");

  const url =
    URL.createObjectURL(
      blob
    );

  window.open(
    url,
    "_blank"
  );

  // ============================================================
  // LIBERAR URL
  // ============================================================

  setTimeout(() => {
    URL.revokeObjectURL(
      url
    );
  }, 10000);
}