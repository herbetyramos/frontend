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
  const h = parseInt(hora?.split(":")[0] ?? "0");

  if (h < 12) return "MANHÃ";
  if (h < 18) return "TARDE";

  return "NOITE";
}

// ======================================================
// ORDEM DOS PERÍODOS
// MANHÃ → TARDE → NOITE
// ======================================================

function ordemPeriodo(periodo: string) {
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
// ORDENAÇÃO DOS CURSOS
//
// 1º PERÍODO
// 2º HORÁRIO
// 3º PROFESSOR
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
      professorB
    );
  });
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

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  let posY = 30;

  // ======================================================
  // CABEÇALHO
  // ======================================================

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
    148,
    15,
    {
      align: "center",
    }
  );

  // ======================================================
  // LISTA
  //
  // Se cronogramaFiltrado foi enviado pelo
  // ListCronograma, usamos EXATAMENTE essa lista.
  //
  // Assim o relatório respeita:
  // - Bloco
  // - Polo
  // - Formatura
  // - Empresa
  // - Busca
  // - demais filtros da tela
  // ======================================================

  let lista: CronogramaType[];

  if (cronogramaFiltrado) {
    lista = [
      ...cronogramaFiltrado,
    ];
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

  // ======================================================
  // ORDENAÇÃO GERAL
  // BLOCO → POLO → SALA
  // ======================================================

  lista.sort((a, b) => {
    // ==============================================
    // BLOCO
    // ==============================================

    const blocoA =
      a.bloco_curso
        ?.bloco_Curso ?? "";

    const blocoB =
      b.bloco_curso
        ?.bloco_Curso ?? "";

    if (blocoA !== blocoB) {
      return blocoA.localeCompare(
        blocoB
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
        poloB
      );
    }

    // ==============================================
    // SALA
    // ==============================================

    const salaA =
      a.salaAula
        ?.numero_sala ?? "";

    const salaB =
      b.salaAula
        ?.numero_sala ?? "";

    if (salaA !== salaB) {
      return salaA.localeCompare(
        salaB
      );
    }

    // ==============================================
    // PERÍODO
    //
    // Também ordena aqui para garantir a
    // sequência antes do agrupamento.
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

  // ======================================================
  // AGRUPAMENTO
  // BLOCO → POLO → SALA
  // ======================================================

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

    if (!grupos[bloco]) {
      grupos[bloco] = {};
    }

    if (!grupos[bloco][polo]) {
      grupos[bloco][polo] = {};
    }

    if (
      !grupos[bloco][polo][sala]
    ) {
      grupos[bloco][polo][sala] = [];
    }

    grupos[bloco][polo][sala].push(
      item
    );
  });

  // ======================================================
  // TOTAL GERAL
  // ======================================================

  let totalGeral = 0;

  // ======================================================
  // BLOCOS
  // ======================================================

  Object.keys(grupos)
    .sort()
    .forEach((bloco) => {
      // ==============================================
      // QUEBRA DE PÁGINA
      // ==============================================

      if (posY > 170) {
        doc.addPage();
        posY = 20;
      }

      // ==============================================
      // TÍTULO DO BLOCO
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
        14,
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
        .forEach((polo) => {
          // ==========================================
          // QUEBRA DE PÁGINA
          // ==========================================

          if (posY > 170) {
            doc.addPage();
            posY = 20;
          }

          // ==========================================
          // POLO
          // ==========================================

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
            14,
            posY
          );

          // ==========================================
          // ESPAÇO MÍNIMO ENTRE POLO E TABELA
          // ==========================================

          posY += 2;

          // ==========================================
          // SALAS
          // ==========================================

          Object.keys(
            grupos[bloco][polo]
          )
            .sort()
            .forEach((sala) => {
              // ========================================
              // QUEBRA DE PÁGINA
              // ========================================

              if (posY > 170) {
                doc.addPage();
                posY = 20;
              }

              // ========================================
              // CURSOS DA SALA
              //
              // MANHÃ
              // TARDE
              // NOITE
              //
              // E dentro de cada período:
              // horário crescente.
              // ========================================

              const cursos =
                ordenarCursos(
                  grupos[bloco][polo][sala]
                );

              // ========================================
              // LINHAS
              // ========================================

              const rows =
                cursos.map(
                  (item, index) => [
                    index + 1,

                    item.codigo,

                    item.tema
                      ?.toUpperCase() ??
                      "",

                    item.data_inicio,

                    item.data_fim,

                    // ==================================
                    // PERÍODO
                    // ==================================

                    getPeriodo(
                      item.hora_inicio
                    ),

                    // ==================================
                    // PROFESSOR
                    // ==================================

                    item.professor
                      ?.nome_professor
                      ?.toUpperCase() ??
                      "",

                    // ==================================
                    // TELEFONE
                    // ==================================

                    item.professor
                      ?.telefone ??
                      "",
                  ]
                );

              // ========================================
              // TABELA
              // ========================================

              autoTable(doc, {
                startY: posY,

                pageBreak: "avoid",

                // ======================================
                // CABEÇALHO
                // ======================================

                head: [
                  [
                    "Nº",

                    "Código",

                    {
                      content:
                        `Tema do Curso - Sala ${sala}`,
                    },

                    "Data Início",

                    "Data Fim",

                    "Período",

                    "Professor",

                    "Contato",
                  ],
                ],

                body: rows,

                theme: "grid",

                // ======================================
                // ESTILOS
                // ======================================

                styles: {
                  fontSize: 8.5,

                  cellPadding: 2,

                  valign:
                    "middle",
                },

                // ======================================
                // CABEÇALHO
                // ======================================

                headStyles: {
                  fillColor: [
                    200,
                    0,
                    0,
                  ],

                  textColor: 255,

                  fontStyle:
                    "bold",

                  halign:
                    "center",
                },

                // ======================================
                // LARGURA DAS COLUNAS
                // ======================================

                columnStyles: {
                  // Nº
                  0: {
                    cellWidth: 9,

                    halign:
                      "center",
                  },

                  // Código
                  1: {
                    cellWidth: 15,

                    halign:
                      "center",
                  },

                  // Tema / Sala
                  2: {
                    cellWidth: 90,
                  },

                  // Data início
                  3: {
                    cellWidth: 21,

                    halign:
                      "center",
                  },

                  // Data fim
                  4: {
                    cellWidth: 21,

                    halign:
                      "center",
                  },

                  // Período
                  5: {
                    cellWidth: 22,

                    halign:
                      "center",
                  },

                  // Professor
                  6: {
                    cellWidth: 55,
                  },

                  // Contato
                  7: {
                    cellWidth: 29,

                    halign:
                      "center",
                  },
                },
              });

              // ========================================
              // POSIÇÃO APÓS A TABELA
              // ========================================

              const finalY =
                doc.lastAutoTable
                  ?.finalY ??
                posY;

              // ========================================
              // TOTAL GERAL
              // ========================================

              totalGeral +=
                cursos.length;

              // ========================================
              // ESPAÇO ENTRE SALAS
              // ========================================

              posY =
                finalY + 2;
            });

          // ============================================
          // ESPAÇO ENTRE POLOS
          // ============================================

          posY += 1;
        });

      // ==================================================
      // ESPAÇO ENTRE BLOCOS
      // ==================================================

      posY += 5;
    });

  // ======================================================
  // TOTAL GERAL
  // ======================================================

  if (posY > 170) {
    doc.addPage();
    posY = 20;
  }

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
    14,
    posY + 10
  );

  // ======================================================
  // ABRIR PDF
  // ======================================================

  const pdfUrl =
    doc.output("bloburl");

  window.open(
    pdfUrl,
    "_blank"
  );
}