import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { CronogramaType } from "@/app/matricula/types";

// ======================================================
// TIPAGEM
// ======================================================

interface CronogramaGroup {
  [bloco: string]: {
    [polo: string]: {
      [sala: string]: CronogramaType[];
    };
  };
}

// ======================================================
// CONFIGURAÇÕES
// ======================================================

const COLUMN_WIDTHS = {
  codigo: 18,
  tema: 80,
  dataInicio: 22,
  dataFim: 22,
  horaInicio: 15,
  horaFim: 15,
};

const TABLE_START_X = 14;

const TABLE_WIDTH =
  COLUMN_WIDTHS.codigo +
  COLUMN_WIDTHS.tema +
  COLUMN_WIDTHS.dataInicio +
  COLUMN_WIDTHS.dataFim +
  COLUMN_WIDTHS.horaInicio +
  COLUMN_WIDTHS.horaFim;

// ======================================================
// POSIÇÕES DE PERÍODO E HORÁRIO
// ======================================================

const PERIODO_X =
  TABLE_START_X +
  COLUMN_WIDTHS.codigo +
  COLUMN_WIDTHS.tema +
  (COLUMN_WIDTHS.dataInicio +
    COLUMN_WIDTHS.dataFim) /
    2;

const HORARIO_X =
  TABLE_START_X +
  COLUMN_WIDTHS.codigo +
  COLUMN_WIDTHS.tema +
  COLUMN_WIDTHS.dataInicio +
  COLUMN_WIDTHS.dataFim +
  (COLUMN_WIDTHS.horaInicio +
    COLUMN_WIDTHS.horaFim) /
    2;

// ======================================================
// CORES DAS SALAS
// ======================================================

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

// ======================================================
// COR DO TEXTO DE ACORDO COM A COR DA SALA
// ======================================================

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

// ======================================================
// CONVERTER TEXTO PARA MAIÚSCULO
// ======================================================

const maiusculo = (
  valor: unknown
): string => {
  if (
    valor === null ||
    valor === undefined
  ) {
    return "";
  }

  return String(valor).toLocaleUpperCase("pt-BR");
};

// ======================================================
// RELATÓRIO
// ======================================================

export function relatorioGrade(
  cronogramaFull: CronogramaType[],
  filtroBloco: string
) {
  const doc = new jsPDF({
    orientation: "portrait",
    unit: "mm",
    format: "a4",
  });

  // ====================================================
  // CONFIGURAÇÕES DA PÁGINA
  // ====================================================

  const PAGE_HEIGHT =
    doc.internal.pageSize.getHeight();

  const MARGIN_TOP = 10;
  const MARGIN_BOTTOM = 15;

  let posY = 6;

  // ====================================================
  // AGRUPAMENTO
  // ====================================================

  const agrupadoPorBloco: CronogramaGroup =
    {};

  const listaFiltrada = filtroBloco
    ? cronogramaFull.filter(
        (item) =>
          item.bloco_curso?.bloco_Curso ===
          filtroBloco
      )
    : cronogramaFull;

  // ====================================================
  // TOTAL GERAL
  // ====================================================

  const totalGeralCursos =
    listaFiltrada.length;

  // ====================================================
  // AGRUPAR BLOCO / POLO / SALA
  // ====================================================

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

  // ====================================================
  // FUNÇÃO PARA VERIFICAR ESPAÇO NA PÁGINA
  // ====================================================

  const adicionarPaginaSeNecessario = (
    alturaNecessaria: number
  ) => {
    if (
      posY + alturaNecessaria >
      PAGE_HEIGHT - MARGIN_BOTTOM
    ) {
      doc.addPage();

      posY = MARGIN_TOP;
    }
  };

  // ====================================================
  // RODAPÉ COM NÚMERO DA PÁGINA
  // ====================================================

  const adicionarNumeracaoPaginas = () => {
    const totalPaginas =
      doc.getNumberOfPages();

    for (
      let pagina = 1;
      pagina <= totalPaginas;
      pagina++
    ) {
      doc.setPage(pagina);

      const larguraPagina =
        doc.internal.pageSize.getWidth();

      const alturaPagina =
        doc.internal.pageSize.getHeight();

      doc.setFontSize(8);
      doc.setFont(
        "helvetica",
        "normal"
      );

      doc.setTextColor(
        100,
        100,
        100
      );

      doc.text(
        `Página ${pagina} de ${totalPaginas}`,
        larguraPagina - 14,
        alturaPagina - 7,
        {
          align: "right",
        }
      );
    }
  };

  // ====================================================
  // PERCORRER OS BLOCOS
  // ====================================================

  Object.keys(
    agrupadoPorBloco
  ).forEach((bloco) => {
    // ==================================================
    // CABEÇALHO DO BLOCO
    // ==================================================

    adicionarPaginaSeNecessario(15);

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
      `Cursos da Secretaria da Mulher e da Família - ${bloco}`,
      TABLE_START_X,
      posY
    );

    posY += 2;

    // ==================================================
    // PERCORRER OS POLOS
    // ==================================================

    Object.keys(
      agrupadoPorBloco[bloco]
    ).forEach((polo) => {
      const salasDoPolo =
        agrupadoPorBloco[bloco][polo];

      // =================================================
      // CABEÇALHO DO POLO
      // =================================================

      adicionarPaginaSeNecessario(15);

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

      posY += 8;

      doc.text(
        `Polo: ${polo}`,
        TABLE_START_X,
        posY
      );

      // =================================================
      // PERÍODO
      // =================================================

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
        "Período",
        PERIODO_X,
        posY,
        {
          align: "center",
        }
      );

      // =================================================
      // HORÁRIO
      // =================================================

      doc.text(
        "Horário",
        HORARIO_X,
        posY,
        {
          align: "center",
        }
      );

      posY += 2;

      // =================================================
      // ORDENAR SALAS
      // =================================================

      Object.keys(salasDoPolo)
        .sort((a, b) => {
          const numeroA =
            parseInt(
              a.match(/\d+/)?.[0] ||
                "0",
              10
            );

          const numeroB =
            parseInt(
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

          // ============================================
          // COR DA SALA
          // ============================================

          const cor =
            corSala(sala);

          const corTexto =
            corTextoContraste(cor);

          // ============================================
          // LINHAS DA TABELA
          // ============================================

          const rows =
            registros.map(
              (item) => [
                item.codigo,
                maiusculo(
                  item.tema
                ),
                item.data_inicio,
                item.data_fim,
                item.hora_inicio,
                item.hora_fim,
              ]
            );

          // ============================================
          // ESPAÇO ANTES DA TABELA
          // ============================================

          adicionarPaginaSeNecessario(
            15
          );

          // ============================================
          // TABELA
          // ============================================

          autoTable(doc, {
            startY: posY,

            head: [
              [
                {
                  content: `Sala ${sala}`,
                  colSpan: 6,
                  styles: {
                    fillColor:
                      cor,
                    textColor:
                      corTexto,
                    halign:
                      "left",
                    valign:
                      "middle",
                    fontStyle:
                      "bold",
                    fontSize: 9,

                    cellPadding:
                      {
                        top: 1,
                        bottom: 1,
                        left: 2,
                        right: 2,
                      },

                    minCellHeight: 5,
                  },
                },
              ],
            ],

            body: rows,

            theme: "grid",

            headStyles: {
              fillColor:
                cor,

              textColor:
                corTexto,

              fontStyle:
                "bold",

              lineColor:
                cor,

              lineWidth: 0.5,
            },

            styles: {
              fontSize: 10,

              overflow:
                "linebreak",

              textColor: [
                0,
                0,
                0,
              ],

              cellPadding: 2,

              lineColor: [
                180,
                180,
                180,
              ],

              lineWidth: 0.2,
            },

            columnStyles: {
              0: {
                cellWidth:
                  COLUMN_WIDTHS.codigo,
              },

              1: {
                cellWidth:
                  COLUMN_WIDTHS.tema,
              },

              2: {
                cellWidth:
                  COLUMN_WIDTHS.dataInicio,
              },

              3: {
                cellWidth:
                  COLUMN_WIDTHS.dataFim,
              },

              4: {
                cellWidth:
                  COLUMN_WIDTHS.horaInicio,
              },

              5: {
                cellWidth:
                  COLUMN_WIDTHS.horaFim,
              },
            },

            tableWidth:
              "wrap",

            // ==========================================
            // REPETIR CABEÇALHO DA SALA
            // CASO A TABELA CONTINUE NA PRÓXIMA PÁGINA
            // ==========================================

            showHead:
              "everyPage",

            // ==========================================
            // EVITAR QUE UMA LINHA SEJA CORTADA
            // ==========================================

            rowPageBreak:
              "avoid",

            // ==========================================
            // MARGENS
            // ==========================================

            margin: {
              left:
                TABLE_START_X,
              right: 14,
              bottom:
                MARGIN_BOTTOM,
            },
          });

          // ============================================
          // OBTER FINAL DA TABELA
          // ============================================

          const finalY =
            (
              doc as unknown as {
                lastAutoTable: {
                  finalY: number;
                };
              }
            ).lastAutoTable
              .finalY;

          // ============================================
          // ATUALIZAR POSIÇÃO
          // ============================================

          posY =
            finalY + 3;
        });

      // =================================================
      // TOTAL DE CURSOS DO POLO
      // =================================================

      const totalCursosPolo =
        Object.values(
          salasDoPolo
        ).reduce(
          (
            total,
            registros
          ) =>
            total +
            registros.length,
          0
        );

      // =================================================
      // GARANTIR ESPAÇO PARA O TOTAL
      // =================================================

      adicionarPaginaSeNecessario(
        10
      );

      // =================================================
      // TOTAL DO POLO À DIREITA
      // =================================================

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
        `TOTAL DE CURSOS: ${totalCursosPolo}`,
        TABLE_START_X +
          TABLE_WIDTH,
        posY,
        {
          align: "right",
        }
      );

      posY += 7;
    });

    // ==================================================
    // ESPAÇO ENTRE BLOCOS
    // ==================================================

    posY += 5;
  });

  // ======================================================
  // TOTAL GERAL DE CURSOS
  // ======================================================

  adicionarPaginaSeNecessario(
    12
  );

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

  doc.text(
    `TOTAL GERAL DE CURSOS: ${totalGeralCursos}`,
    TABLE_START_X +
      TABLE_WIDTH,
    posY,
    {
      align: "right",
    }
  );

  // ======================================================
  // NUMERAÇÃO DAS PÁGINAS
  // ======================================================

  adicionarNumeracaoPaginas();

  // ======================================================
  // ABRIR PDF
  // ======================================================

  const blob =
    doc.output("blob");

  window.open(
    URL.createObjectURL(blob),
    "_blank"
  );
}