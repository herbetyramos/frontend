
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

// ======================================================
// PERÍODO
// ======================================================

function getPeriodo(hora: string) {
  const h = parseInt(
    hora?.split(":")[0] ?? "0",
    10
  );

  if (h < 12) return "MANHÃ";
  if (h < 18) return "TARDE";

  return "NOITE";
}

// ======================================================
// ORDEM DOS PERÍODOS
// MANHÃ → TARDE → NOITE
// ======================================================

function ordemPeriodo(periodo: string): number {
  switch (periodo) {
    case "MANHÃ":
      return 1;

    case "TARDE":
      return 2;

    case "NOITE":
      return 3;

    default:
      return 99;
  }
}

// ======================================================
// CORES DAS SALAS
// MESMAS CORES DO RELATÓRIO GRADE
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
// MAIÚSCULO
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

  return String(valor).toLocaleUpperCase(
    "pt-BR"
  );
};

// ======================================================
// ORDENAR CURSOS
//
// MANHÃ
// TARDE
// NOITE
//
// DENTRO DO PERÍODO:
// HORÁRIO → PROFESSOR
// ======================================================

function ordenarCursos(
  cursos: CronogramaType[]
): CronogramaType[] {
  return [...cursos].sort((a, b) => {
    // ==============================================
    // PERÍODO
    // ==============================================

    const periodoA = getPeriodo(
      a.hora_inicio
    );

    const periodoB = getPeriodo(
      b.hora_inicio
    );

    const ordemA =
      ordemPeriodo(periodoA);

    const ordemB =
      ordemPeriodo(periodoB);

    if (ordemA !== ordemB) {
      return ordemA - ordemB;
    }

    // ==============================================
    // HORÁRIO
    // ==============================================

    const horarioA =
      a.hora_inicio ?? "";

    const horarioB =
      b.hora_inicio ?? "";

    if (horarioA !== horarioB) {
      return horarioA.localeCompare(
        horarioB
      );
    }

    // ==============================================
    // PROFESSOR
    // ==============================================

    const professorA =
      a.professor?.nome_professor ?? "";

    const professorB =
      b.professor?.nome_professor ?? "";

    return professorA.localeCompare(
      professorB,
      "pt-BR"
    );
  });
}

// ======================================================
// RELATÓRIO
//
// BLOCO → POLO → SALA
// ======================================================

export function visualizarRelatorioProfessorSala(
  cronogramaFull: CronogramaType[],
  filtroBloco: string,
  filtroDataFormatura: string,
  cronogramaFiltrado?: CronogramaType[]
) {
  console.log(
    "Entrou no relatório de Professores/Sala"
  );

  // ====================================================
  // DOCUMENTO
  // ====================================================

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  // ====================================================
  // CONFIGURAÇÕES DA PÁGINA
  // ====================================================

  const PAGE_HEIGHT =
    doc.internal.pageSize.getHeight();

  const PAGE_WIDTH =
    doc.internal.pageSize.getWidth();

  const MARGIN_LEFT = 14;
  const MARGIN_RIGHT = 14;
  const MARGIN_TOP = 20;
  const MARGIN_BOTTOM = 15;

  let posY = 30;

  // ====================================================
  // LARGURAS DAS COLUNAS
  //
  // SEM:
  // Nº
  // Código
  //
  // Ficam:
  // Tema
  // Data Início
  // Data Fim
  // Período
  // Professor
  // Contato
  //
  // O rótulo TEMA NÃO SERÁ EXIBIDO.
  // ====================================================

  const COLUMN_WIDTHS = {
    tema: 96,
    dataInicio: 23,
    dataFim: 23,
    periodo: 24,
    professor: 70,
    contato: 31,
  };



  // ====================================================
  // CABEÇALHO
  // ====================================================

  doc.setFontSize(16);

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
    "SECRETARIA DA MULHER E DA FAMÍLIA",
    PAGE_WIDTH / 2,
    15,
    {
      align: "center",
    }
  );

  // ====================================================
  // LISTA
  //
  // Quando cronogramaFiltrado for enviado,
  // utiliza EXATAMENTE os filtros da tela.
  // ====================================================

  let lista: CronogramaType[];

  if (cronogramaFiltrado) {
    lista = [...cronogramaFiltrado];
  } else {
    lista = cronogramaFull.filter(
      (item) => {
        const atendeBloco =
          !filtroBloco ||
          item.bloco_curso
            ?.bloco_Curso ===
            filtroBloco;

        const atendeFormatura =
          !filtroDataFormatura ||
          item.formatura
            ?.data_formatura ===
            filtroDataFormatura;

        return (
          atendeBloco &&
          atendeFormatura
        );
      }
    );
  }

  // ====================================================
  // ORDENAÇÃO GERAL
  //
  // BLOCO → POLO → SALA → PERÍODO → HORÁRIO
  // ====================================================

  lista.sort((a, b) => {
    // ==============================================
    // BLOCO
    // ==============================================

    const blocoA =
      a.bloco_curso?.bloco_Curso ?? "";

    const blocoB =
      b.bloco_curso?.bloco_Curso ?? "";

    if (blocoA !== blocoB) {
      return blocoA.localeCompare(
        blocoB,
        "pt-BR"
      );
    }

    // ==============================================
    // POLO
    // ==============================================

    const poloA =
      a.localAula?.polo ?? "";

    const poloB =
      b.localAula?.polo ?? "";

    if (poloA !== poloB) {
      return poloA.localeCompare(
        poloB,
        "pt-BR"
      );
    }

    // ==============================================
    // SALA
    //
    // PRIMEIRO PELO NÚMERO
    // ==============================================

    const numeroSalaA =
      a.salaAula?.numero_sala ?? "";

    const numeroSalaB =
      b.salaAula?.numero_sala ?? "";

    const numeroA = parseInt(
      String(numeroSalaA).match(
        /\d+/
      )?.[0] ?? "0",
      10
    );

    const numeroB = parseInt(
      String(numeroSalaB).match(
        /\d+/
      )?.[0] ?? "0",
      10
    );

    if (numeroA !== numeroB) {
      return numeroA - numeroB;
    }

    // ==============================================
    // TIPO DA SALA
    // ==============================================

    const tipoSalaA =
      a.salaAula?.tipo_uso ?? "";

    const tipoSalaB =
      b.salaAula?.tipo_uso ?? "";

    if (tipoSalaA !== tipoSalaB) {
      return tipoSalaA.localeCompare(
        tipoSalaB,
        "pt-BR"
      );
    }

    // ==============================================
    // PERÍODO
    // ==============================================

    const periodoA =
      ordemPeriodo(
        getPeriodo(
          a.hora_inicio
        )
      );

    const periodoB =
      ordemPeriodo(
        getPeriodo(
          b.hora_inicio
        )
      );

    if (periodoA !== periodoB) {
      return periodoA - periodoB;
    }

    // ==============================================
    // HORÁRIO
    // ==============================================

    return (
      a.hora_inicio ?? ""
    ).localeCompare(
      b.hora_inicio ?? ""
    );
  });

  // ====================================================
  // AGRUPAMENTO
  //
  // BLOCO → POLO → SALA
  // ====================================================

  const grupos: Record<
    string,
    Record<
      string,
      Record<
        string,
        CronogramaType[]
      >
    >
  > = {};

  lista.forEach((item) => {
    // ==============================================
    // BLOCO
    // ==============================================

    const bloco =
      item.bloco_curso
        ?.bloco_Curso ??
      "SEM BLOCO";

    // ==============================================
    // POLO
    // ==============================================

    const polo =
      item.localAula?.polo ??
      "SEM POLO";

    // ==============================================
    // SALA
    //
    // INCLUIR O TIPO DA SALA PARA
    // IDENTIFICAR A COR CORRETA.
    // ==============================================

    const sala = item.salaAula
      ? `${item.salaAula.numero_sala} (${item.salaAula.tipo_uso})`
      : "SEM SALA";

    if (!grupos[bloco]) {
      grupos[bloco] = {};
    }

    if (!grupos[bloco][polo]) {
      grupos[bloco][polo] = {};
    }

    if (!grupos[bloco][polo][sala]) {
      grupos[bloco][polo][sala] = [];
    }

    grupos[bloco][polo][sala].push(
      item
    );
  });

  // ====================================================
  // TOTAL GERAL
  // ====================================================

  let totalGeral = 0;

  // ====================================================
  // FUNÇÃO PARA QUEBRA DE PÁGINA
  // ====================================================

  const adicionarPaginaSeNecessario = (
    alturaNecessaria: number
  ) => {
    if (
      posY +
        alturaNecessaria >
      PAGE_HEIGHT -
        MARGIN_BOTTOM
    ) {
      doc.addPage();

      posY = MARGIN_TOP;
    }
  };

  // ====================================================
  // NUMERAÇÃO DAS PÁGINAS
  // ====================================================

  const adicionarNumeracaoPaginas =
    () => {
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
  // FUNÇÃO PARA DESENHAR OS RÓTULOS DO POLO
  //
  // OS RÓTULOS APARECEM UMA ÚNICA VEZ.
  //
  // NÃO APARECEM NOVAMENTE EM CADA SALA.
  //
  // SEM:
  // Nº
  // Código
  // Tema
  // ====================================================

  const desenharRotulosPolo = () => {
    const y = posY;

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.setFontSize(7.5);

    doc.setTextColor(
      0,
      0,
      0
    );

    // ----------------------------------------------
    // POSIÇÕES DAS COLUNAS
    // ----------------------------------------------

    

    const xDataInicio =
      MARGIN_LEFT +
      COLUMN_WIDTHS.tema +
      COLUMN_WIDTHS.dataInicio / 2;

    const xDataFim =
      MARGIN_LEFT +
      COLUMN_WIDTHS.tema +
      COLUMN_WIDTHS.dataInicio +
      COLUMN_WIDTHS.dataFim / 2;

    const xPeriodo =
      MARGIN_LEFT +
      COLUMN_WIDTHS.tema +
      COLUMN_WIDTHS.dataInicio +
      COLUMN_WIDTHS.dataFim +
      COLUMN_WIDTHS.periodo / 2;

    const xProfessor =
      MARGIN_LEFT +
      COLUMN_WIDTHS.tema +
      COLUMN_WIDTHS.dataInicio +
      COLUMN_WIDTHS.dataFim +
      COLUMN_WIDTHS.periodo +
      COLUMN_WIDTHS.professor / 2;

    const xContato =
      MARGIN_LEFT +
      COLUMN_WIDTHS.tema +
      COLUMN_WIDTHS.dataInicio +
      COLUMN_WIDTHS.dataFim +
      COLUMN_WIDTHS.periodo +
      COLUMN_WIDTHS.professor +
      COLUMN_WIDTHS.contato / 2;

    // ----------------------------------------------
    // RÓTULOS
    //
    // NÃO DESENHAR "TEMA".
    // ----------------------------------------------

    doc.text(
      "Data Início",
      xDataInicio,
      y,
      {
        align: "center",
      }
    );

    doc.text(
      "Data Fim",
      xDataFim,
      y,
      {
        align: "center",
      }
    );

    doc.text(
      "Período",
      xPeriodo,
      y,
      {
        align: "center",
      }
    );

    doc.text(
      "Professor",
      xProfessor,
      y,
      {
        align: "center",
      }
    );

    doc.text(
      "Contato",
      xContato,
      y,
      {
        align: "center",
      }
    );
  };

  // ====================================================
  // PERCORRER BLOCOS
  // ====================================================

  Object.keys(grupos)
    .sort((a, b) =>
      a.localeCompare(
        b,
        "pt-BR"
      )
    )
    .forEach((bloco) => {
      // ==================================================
      // CABEÇALHO DO BLOCO
      // ==================================================

      adicionarPaginaSeNecessario(
        15
      );

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
        MARGIN_LEFT,
        posY
      );

      // ==================================================
      // ESPAÇO ENTRE GRADE E POLO
      // ==================================================

      posY += 5;

      // ==================================================
      // PERCORRER POLOS
      // ==================================================

      Object.keys(
        grupos[bloco]
      )
        .sort((a, b) =>
          a.localeCompare(
            b,
            "pt-BR"
          )
        )
        .forEach((polo) => {
          const salasDoPolo =
            grupos[bloco][polo];

          // ==============================================
          // VERIFICAR PÁGINA
          // ==============================================

          adicionarPaginaSeNecessario(
            15
          );

          // ==============================================
          // LINHA DO POLO + RÓTULOS
          // ==============================================

          doc.setFontSize(11);

          doc.setFont(
            "helvetica",
            "bold"
          );

          doc.setTextColor(
            0,
            100,
            0
          );

          doc.text(
            `Polo: ${polo}`,
            MARGIN_LEFT,
            posY
          );

          // ----------------------------------------------
          // RÓTULOS
          // ----------------------------------------------

          desenharRotulosPolo();

          // ==============================================
          // PEQUENO ESPAÇO APÓS POLO/RÓTULOS
          // ==============================================

          posY += 3;

          // ==============================================
          // ORDENAR SALAS
          // ==============================================

          Object.keys(
            salasDoPolo
          )
            .sort((a, b) => {
              const numeroA =
                parseInt(
                  a.match(
                    /\d+/
                  )?.[0] ??
                    "0",
                  10
                );

              const numeroB =
                parseInt(
                  b.match(
                    /\d+/
                  )?.[0] ??
                    "0",
                  10
                );

              if (
                numeroA !==
                numeroB
              ) {
                return (
                  numeroA -
                  numeroB
                );
              }

              return a.localeCompare(
                b,
                "pt-BR"
              );
            })
            .forEach((sala) => {
              // ==========================================
              // VERIFICAR PÁGINA
              // ==========================================

              adicionarPaginaSeNecessario(
                15
              );

              // ==========================================
              // REGISTROS
              // ==========================================

              const registros =
                salasDoPolo[
                  sala
                ];

              // ==========================================
              // COR DA SALA
              // ==========================================

              const cor =
                corSala(sala);

              const corTexto =
                corTextoContraste(
                  cor
                );

              // ==========================================
              // ORDENAR REGISTROS
              // ==========================================

              const registrosOrdenados =
                ordenarCursos(
                  registros
                );

              // ==========================================
              // LINHAS
              //
              // SEM:
              // Nº
              // Código
              //
              // TEMA CONTINUA SENDO MOSTRADO,
              // MAS SEM RÓTULO.
              // ==========================================

              const rows =
                registrosOrdenados.map(
                  (item) => [
                    maiusculo(
                      item.tema
                    ),

                    item.data_inicio,

                    item.data_fim,

                    getPeriodo(
                      item.hora_inicio
                    ),

                    maiusculo(
                      item.professor
                        ?.nome_professor
                    ),

                    item.professor
                      ?.telefone ??
                      "",
                  ]
                );

              // ==========================================
              // TABELA DA SALA
              //
              // SOMENTE A FAIXA COLORIDA DA SALA.
              //
              // OS RÓTULOS FICAM NA LINHA DO POLO.
              // ==========================================

              autoTable(doc, {
                startY: posY,

                // ========================================
                // CABEÇALHO SOMENTE DA SALA
                // ========================================

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

                        cellPadding: {
                          top: 1,
                          bottom: 1,
                          left: 2,
                          right: 2,
                        },

                        minCellHeight:
                          5,

                        lineColor:
                          cor,

                        lineWidth:
                          0.5,
                      },
                    },
                  ],
                ],

                // ========================================
                // DADOS
                // ========================================

                body: rows,

                // ========================================
                // TEMA GRID
                // ========================================

                theme: "grid",

                // ========================================
                // ESTILO DO CABEÇALHO DA SALA
                // ========================================

                headStyles: {
                  fillColor:
                    cor,

                  textColor:
                    corTexto,

                  fontStyle:
                    "bold",

                  fontSize: 8,

                  halign:
                    "left",

                  valign:
                    "middle",

                  lineColor:
                    cor,

                  lineWidth:
                    0.5,

                  cellPadding: 2,
                },

                // ========================================
                // ESTILO DO CORPO
                // ========================================

                styles: {
                  fontSize: 8.5,

                  overflow:
                    "linebreak",

                  textColor: [
                    0,
                    0,
                    0,
                  ],

                  cellPadding: 2,

                  valign:
                    "middle",

                  lineColor: [
                    180,
                    180,
                    180,
                  ],

                  lineWidth: 0.2,
                },

                // ========================================
                // LARGURA DAS COLUNAS
                // ========================================

                columnStyles: {
                  // Tema
                  //
                  // SEM RÓTULO.
                  0: {
                    cellWidth:
                      COLUMN_WIDTHS.tema,

                    halign:
                      "left",
                  },

                  // Data início
                  1: {
                    cellWidth:
                      COLUMN_WIDTHS.dataInicio,

                    halign:
                      "center",
                  },

                  // Data fim
                  2: {
                    cellWidth:
                      COLUMN_WIDTHS.dataFim,

                    halign:
                      "center",
                  },

                  // Período
                  3: {
                    cellWidth:
                      COLUMN_WIDTHS.periodo,

                    halign:
                      "center",

                    fontStyle:
                      "bold",
                  },

                  // Professor
                  4: {
                    cellWidth:
                      COLUMN_WIDTHS.professor,

                    halign:
                      "left",
                  },

                  // Contato
                  5: {
                    cellWidth:
                      COLUMN_WIDTHS.contato,

                    halign:
                      "center",
                  },
                },

                // ========================================
                // REPETIR SOMENTE O CABEÇALHO DA SALA
                // SE A TABELA PASSAR DE PÁGINA.
                // ========================================

                showHead:
                  "everyPage",

                // ========================================
                // EVITAR CORTE DE LINHAS
                // ========================================

                rowPageBreak:
                  "avoid",

                // ========================================
                // MARGENS
                // ========================================

                margin: {
                  left:
                    MARGIN_LEFT,

                  right:
                    MARGIN_RIGHT,

                  bottom:
                    MARGIN_BOTTOM,
                },
              });

              // ==========================================
              // FINAL DA TABELA
              // ==========================================

              const finalY =
                doc
                  .lastAutoTable
                  ?.finalY ??
                posY;

              // ==========================================
              // TOTAL GERAL
              // ==========================================

              totalGeral +=
                registrosOrdenados.length;

              // ==========================================
              // ESPAÇO ENTRE SALAS
              // ==========================================

              posY =
                finalY + 2;
            });

          // ==============================================
          // TOTAL DE CURSOS DO POLO
          // ==============================================

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

          // ==============================================
          // GARANTIR ESPAÇO PARA TOTAL
          // ==============================================

          adicionarPaginaSeNecessario(
            10
          );

          // ==============================================
          // ESPAÇO ANTES DO TOTAL
          // ==============================================

          posY += 2;

          // ==============================================
          // TOTAL DO POLO À DIREITA
          // ==============================================

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
            `Qtde. no Pólo: ${totalCursosPolo}`,
            PAGE_WIDTH -
              MARGIN_RIGHT,
            posY,
            {
              align: "right",
            }
          );

          // ==============================================
          // ESPAÇO APÓS O TOTAL
          // ==============================================

          posY += 7;
        });

      // ==================================================
      // ESPAÇO ENTRE BLOCOS
      // ==================================================

      posY += 3;
    });

  // ====================================================
  // TOTAL GERAL
  // ====================================================

  adicionarPaginaSeNecessario(
    12
  );

  doc.setFontSize(12);

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
    `TOTAL GERAL DE TURMAS: ${totalGeral}`,
    PAGE_WIDTH -
      MARGIN_RIGHT,
    posY + 5,
    {
      align: "right",
    }
  );

  // ====================================================
  // NUMERAÇÃO DAS PÁGINAS
  // ====================================================

  adicionarNumeracaoPaginas();

  // ====================================================
  // ABRIR PDF
  // ====================================================

  const pdfUrl =
    doc.output("bloburl");

  window.open(
    pdfUrl,
    "_blank"
  );
}

