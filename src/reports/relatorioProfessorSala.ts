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

function ordemPeriodo(
  periodo: string
): number {
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
// ======================================================

const corSala = (
  sala: string
): [number, number, number] => {
  const texto =
    sala.toUpperCase();

  if (
    texto.includes("BELEZA") ||
    texto.includes(
      "BELEZA COM LAVATÓRIO"
    ) ||
    texto.includes(
      "BELEZA COM MACA"
    )
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

  if (
    texto.includes(
      "ADMINISTRATIVO"
    )
  ) {
    return [180, 30, 30];
  }

  if (
    texto.includes("SERVIÇOS")
  ) {
    return [22, 163, 74];
  }

  if (
    texto.includes("COSTURA")
  ) {
    return [250, 204, 21];
  }

  if (
    texto.includes("SABER")
  ) {
    return [180, 30, 30];
  }

  if (
    texto.includes("MULTIUSO")
  ) {
    return [180, 30, 30];
  }

  if (
    texto.includes("MODA")
  ) {
    return [250, 204, 21];
  }

  if (
    texto.includes("CASA ROSA")
  ) {
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

  return String(
    valor
  ).toLocaleUpperCase(
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
// Dentro do período:
// HORÁRIO → PROFESSOR
// ======================================================

function ordenarCursos(
  cursos: CronogramaType[]
): CronogramaType[] {
  return [...cursos].sort(
    (a, b) => {
      // ==============================================
      // PERÍODO
      // ==============================================

      const periodoA =
        getPeriodo(
          a.hora_inicio
        );

      const periodoB =
        getPeriodo(
          b.hora_inicio
        );

      const ordemA =
        ordemPeriodo(
          periodoA
        );

      const ordemB =
        ordemPeriodo(
          periodoB
        );

      if (
        ordemA !==
        ordemB
      ) {
        return (
          ordemA -
          ordemB
        );
      }

      // ==============================================
      // HORÁRIO
      // ==============================================

      const horarioA =
        a.hora_inicio ?? "";

      const horarioB =
        b.hora_inicio ?? "";

      if (
        horarioA !==
        horarioB
      ) {
        return horarioA.localeCompare(
          horarioB
        );
      }

      // ==============================================
      // PROFESSOR
      // ==============================================

      const professorA =
        a.professor
          ?.nome_professor ??
        "";

      const professorB =
        b.professor
          ?.nome_professor ??
        "";

      return professorA.localeCompare(
        professorB
      );
    }
  );
}

// ======================================================
// RELATÓRIO
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
  // CONFIGURAÇÕES
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
  // Se cronogramaFiltrado existir,
  // utiliza exatamente os registros filtrados
  // pelo ListCronograma.
  // ====================================================

  let lista: CronogramaType[];

  if (
    cronogramaFiltrado
  ) {
    lista = [
      ...cronogramaFiltrado,
    ];
  } else {
    lista =
      cronogramaFull.filter(
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
  // BLOCO → POLO → SALA
  // ====================================================

  lista.sort(
    (a, b) => {
      // ==============================================
      // BLOCO
      // ==============================================

      const blocoA =
        a.bloco_curso
          ?.bloco_Curso ??
        "";

      const blocoB =
        b.bloco_curso
          ?.bloco_Curso ??
        "";

      if (
        blocoA !==
        blocoB
      ) {
        return blocoA.localeCompare(
          blocoB
        );
      }

      // ==============================================
      // POLO
      // ==============================================

      const poloA =
        a.localAula?.polo ??
        "";

      const poloB =
        b.localAula?.polo ??
        "";

      if (
        poloA !==
        poloB
      ) {
        return poloA.localeCompare(
          poloB
        );
      }

      // ==============================================
      // SALA
      // ==============================================

      const salaA =
        a.salaAula
          ?.numero_sala ??
        "";

      const salaB =
        b.salaAula
          ?.numero_sala ??
        "";

      if (
        salaA !==
        salaB
      ) {
        return salaA.localeCompare(
          salaB
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

      if (
        periodoA !==
        periodoB
      ) {
        return (
          periodoA -
          periodoB
        );
      }

      // ==============================================
      // HORÁRIO
      // ==============================================

      return (
        a.hora_inicio ?? ""
      ).localeCompare(
        b.hora_inicio ?? ""
      );
    }
  );

  // ====================================================
  // AGRUPAMENTO
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

  lista.forEach(
    (item) => {
      const bloco =
        item.bloco_curso
          ?.bloco_Curso ??
        "SEM BLOCO";

      const polo =
        item.localAula?.polo ??
        "SEM POLO";

      const sala =
        item.salaAula
          ?.numero_sala ??
        "SEM SALA";

      if (
        !grupos[bloco]
      ) {
        grupos[bloco] = {};
      }

      if (
        !grupos[bloco][polo]
      ) {
        grupos[bloco][polo] =
          {};
      }

      if (
        !grupos[bloco][polo][sala]
      ) {
        grupos[bloco][polo][sala] =
          [];
      }

      grupos[bloco][polo][sala].push(
        item
      );
    }
  );

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

      posY =
        MARGIN_TOP;
    }
  };

  // ====================================================
  // PERCORRER BLOCOS
  // ====================================================

  Object.keys(grupos)
    .sort()
    .forEach(
      (bloco) => {
        // ==============================================
        // ESPAÇO / PÁGINA
        // ==============================================

        adicionarPaginaSeNecessario(
          15
        );

        // ==============================================
        // GRADE
        // ==============================================

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

        // ==============================================
        // ESPAÇO ENTRE GRADE E POLO
        // ==============================================

        posY += 5;

        // ==============================================
        // POLOS
        // ==============================================

        Object.keys(
          grupos[bloco]
        )
          .sort()
          .forEach(
            (polo) => {
              // ========================================
              // VERIFICAR PÁGINA
              // ========================================

              adicionarPaginaSeNecessario(
                15
              );

              // ========================================
              // POLO
              // ========================================

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
                `Polo: ${polo}`,
                MARGIN_LEFT,
                posY
              );

              // ========================================
              // PEQUENO ESPAÇO ENTRE POLO E TABELA
              // ========================================

              posY += 2;

              // ========================================
              // SALAS
              // ========================================

              Object.keys(
                grupos[
                  bloco
                ][
                  polo
                ]
              )
                .sort(
                  (
                    a,
                    b
                  ) => {
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

                    return (
                      numeroA -
                      numeroB
                    );
                  }
                )
                .forEach(
                  (sala) => {
                    // ==================================
                    // VERIFICAR PÁGINA
                    // ==================================

                    adicionarPaginaSeNecessario(
                      15
                    );

                    // ==================================
                    // REGISTROS
                    // ==================================

                    const registros =
                      grupos[
                        bloco
                      ][
                        polo
                      ][
                        sala
                      ];

                    // ==================================
                    // COR DA SALA
                    // ==================================

                    const cor =
                      corSala(
                        sala
                      );

                    const corTexto =
                      corTextoContraste(
                        cor
                      );

                    // ==================================
                    // ORDENAR REGISTROS
                    //
                    // MANHÃ
                    // TARDE
                    // NOITE
                    // ==================================

                    const registrosOrdenados =
                      ordenarCursos(
                        registros
                      );

                    // ==================================
                    // LINHAS
                    // ==================================

                    const rows =
                      registrosOrdenados.map(
                        (
                          item,
                          index
                        ) => [
                          index + 1,

                          item.codigo,

                          maiusculo(
                            item.tema
                          ),

                          item.data_inicio,

                          item.data_fim,

                          getPeriodo(
                            item.hora_inicio
                          ),

                          maiusculo(
                            item
                              .professor
                              ?.nome_professor
                          ),

                          item
                            .professor
                            ?.telefone ??
                            "",
                        ]
                      );

                    // ==================================
                    // TABELA
                    // ==================================

                    autoTable(
                      doc,
                      {
                        startY:
                          posY,

                        // ==================================
                        // CABEÇALHO DA SALA
                        //
                        // MESMO PADRÃO DO RELATÓRIO GRADE
                        // ==================================

                        head: [
                          [
                            {
                              content:
                                `Sala ${sala}`,
                              colSpan:
                                8,
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

                        // ==================================
                        // CABEÇALHO DAS COLUNAS
                        // ==================================

                        body: rows,

                        theme:
                          "grid",

                        // ==================================
                        // ESTILOS DO CABEÇALHO
                        // ==================================

                        headStyles: {
                          fillColor:
                            cor,

                          textColor:
                            corTexto,

                          fontStyle:
                            "bold",

                          halign:
                            "center",

                          valign:
                            "middle",

                          lineColor:
                            cor,

                          lineWidth:
                            0.5,
                        },

                        // ==================================
                        // ESTILOS DA TABELA
                        // ==================================

                        styles: {
                          fontSize:
                            8.5,

                          overflow:
                            "linebreak",

                          textColor: [
                            0,
                            0,
                            0,
                          ],

                          cellPadding:
                            2,

                          valign:
                            "middle",

                          lineColor: [
                            180,
                            180,
                            180,
                          ],

                          lineWidth:
                            0.2,
                        },

                        // ==================================
                        // LARGURA DAS COLUNAS
                        // ==================================

                        columnStyles: {
                          // Nº
                          0: {
                            cellWidth:
                              9,

                            halign:
                              "center",
                          },

                          // Código
                          1: {
                            cellWidth:
                              15,

                            halign:
                              "center",
                          },

                          // Tema
                          2: {
                            cellWidth:
                              90,
                          },

                          // Data início
                          3: {
                            cellWidth:
                              21,

                            halign:
                              "center",
                          },

                          // Data fim
                          4: {
                            cellWidth:
                              21,

                            halign:
                              "center",
                          },

                          // Período
                          5: {
                            cellWidth:
                              22,

                            halign:
                              "center",

                            fontStyle:
                              "bold",
                          },

                          // Professor
                          6: {
                            cellWidth:
                              55,
                          },

                          // Contato
                          7: {
                            cellWidth:
                              29,

                            halign:
                              "center",
                          },
                        },

                        // ==================================
                        // EVITAR CORTE DE LINHAS
                        // ==================================

                        rowPageBreak:
                          "avoid",

                        // ==================================
                        // MARGENS
                        // ==================================

                        margin: {
                          left:
                            MARGIN_LEFT,

                          right:
                            MARGIN_RIGHT,

                          bottom:
                            MARGIN_BOTTOM,
                        },
                      }
                    );

                    // ==================================
                    // FINAL DA TABELA
                    // ==================================

                    const finalY =
                      doc
                        .lastAutoTable
                        ?.finalY ??
                      posY;

                    // ==================================
                    // TOTAL
                    // ==================================

                    totalGeral +=
                      registrosOrdenados.length;

                    // ==================================
                    // ESPAÇO ENTRE SALAS
                    // ==================================

                    posY =
                      finalY + 2;
                  }
                );

              // ========================================
              // ESPAÇO ENTRE POLOS
              // ========================================

              posY += 1;
            }
          );

        // ==============================================
        // ESPAÇO ENTRE BLOCOS
        // ==============================================

        posY += 5;
      }
    );

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
  // ABRIR PDF
  // ====================================================

  const pdfUrl =
    doc.output(
      "bloburl"
    );

  window.open(
    pdfUrl,
    "_blank"
  );
}