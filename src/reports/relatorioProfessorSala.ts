
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
  const h = parseInt(hora.split(":")[0]);

  if (h < 12) return "MANHÃ";
  if (h < 18) return "TARDE";

  return "NOITE";
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
  console.log("Entrou no relatório");

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
  doc.setFont("helvetica", "bold");

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
  // ======================================================

  let lista: CronogramaType[];

  if (cronogramaFiltrado) {
    lista = [...cronogramaFiltrado];
  } else {
    lista = cronogramaFull.filter((item) => {
      const atendeBloco =
        !filtroBloco ||
        item.bloco_curso?.bloco_Curso === filtroBloco;

      const atendeFormatura =
        !filtroDataFormatura ||
        item.formatura?.data_formatura === filtroDataFormatura;

      return atendeBloco && atendeFormatura;
    });
  }

  // ======================================================
  // FILTROS
  // ======================================================

  lista = lista.filter((item) => {
    const atendeBloco =
      !filtroBloco ||
      item.bloco_curso?.bloco_Curso === filtroBloco;

    const atendeFormatura =
      !filtroDataFormatura ||
      item.formatura?.data_formatura === filtroDataFormatura;

    return atendeBloco && atendeFormatura;
  });

  // ======================================================
  // ORDENAÇÃO
  // BLOCO → POLO → SALA → PROFESSOR
  // ======================================================

  lista.sort((a, b) => {
    const blocoA =
      a.bloco_curso?.bloco_Curso ?? "";

    const blocoB =
      b.bloco_curso?.bloco_Curso ?? "";

    if (blocoA !== blocoB) {
      return blocoA.localeCompare(blocoB);
    }

    const poloA =
      a.localAula?.polo ?? "";

    const poloB =
      b.localAula?.polo ?? "";

    if (poloA !== poloB) {
      return poloA.localeCompare(poloB);
    }

    const salaA =
      a.salaAula?.numero_sala ?? "";

    const salaB =
      b.salaAula?.numero_sala ?? "";

    if (salaA !== salaB) {
      return salaA.localeCompare(salaB);
    }

    return (
      a.professor?.nome_professor ?? ""
    ).localeCompare(
      b.professor?.nome_professor ?? ""
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
      Record<string, CronogramaType[]>
    >
  > = {};

  lista.forEach((item) => {
    const bloco =
      item.bloco_curso?.bloco_Curso ??
      "SEM BLOCO";

    const polo =
      item.localAula?.polo ??
      "SEM POLO";

    const sala =
      item.salaAula?.numero_sala ??
      "SEM SALA";

    if (!grupos[bloco]) {
      grupos[bloco] = {};
    }

    if (!grupos[bloco][polo]) {
      grupos[bloco][polo] = {};
    }

    if (!grupos[bloco][polo][sala]) {
      grupos[bloco][polo][sala] = [];
    }

    grupos[bloco][polo][sala].push(item);
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
      if (posY > 170) {
        doc.addPage();
        posY = 20;
      }

      // ==================================================
      // TÍTULO BLOCO
      // ==================================================

      doc.setFontSize(13);
      doc.setFont("helvetica", "bold");

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

      // Pequeno espaço após o bloco
      posY += 4;

      // ==================================================
      // POLOS
      // ==================================================

      Object.keys(grupos[bloco])
        .sort()
        .forEach((polo) => {
          if (posY > 170) {
            doc.addPage();
            posY = 20;
          }

          // ==============================================
          // POLO
          // ==============================================

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

          // =================================================
          // IMPORTANTE:
          // NÃO aumentar posY aqui.
          //
          // A tabela começa exatamente na mesma posição
          // vertical imediatamente abaixo do texto do Polo.
          // =================================================

          posY += 1;

          // ==============================================
          // SALAS
          // ==============================================

          Object.keys(grupos[bloco][polo])
            .sort()
            .forEach((sala) => {
              if (posY > 170) {
                doc.addPage();
                posY = 20;
              }

              // ==========================================
              // LINHAS
              // ==========================================

              const rows =
                grupos[bloco][polo][sala]
                  .map((item, index) => [
                    index + 1,

                    item.codigo,

                    item.tema
                      ?.toUpperCase() ?? "",

                    item.data_inicio,

                    item.data_fim,

                    // ====================================
                    // SOMENTE PERÍODO
                    // ====================================

                    getPeriodo(
                      item.hora_inicio
                    ),

                    item.professor
                      ?.nome_professor
                      ?.toUpperCase() ?? "",

                    item.professor
                      ?.telefone ?? "",
                  ]);

              // ==========================================
              // TABELA
              // ==========================================

              autoTable(doc, {
                startY: posY,

                pageBreak: "avoid",

                // ========================================
                // CABEÇALHO
                //
                // NÃO EXISTE "HORÁRIO" AQUI
                // ========================================

                head: [[
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
                ]],

                body: rows,

                theme: "grid",

                styles: {
                  fontSize: 8.5,
                  cellPadding: 2,
                  valign: "middle",
                },

                headStyles: {
                  fillColor: [
                    200,
                    0,
                    0,
                  ],

                  textColor: 255,

                  fontStyle: "bold",

                  halign: "center",
                },

                // ========================================
                // LARGURA DAS COLUNAS
                // ========================================

                columnStyles: {
                  // Nº
                  0: {
                    cellWidth: 9,
                    halign: "center",
                  },

                  // Código
                  1: {
                    cellWidth: 15,
                    halign: "center",
                  },

                  // Tema / Sala
                  2: {
                    cellWidth: 90,
                  },

                  // Data início
                  3: {
                    cellWidth: 21,
                    halign: "center",
                  },

                  // Data fim
                  4: {
                    cellWidth: 21,
                    halign: "center",
                  },

                  // Período
                  5: {
                    cellWidth: 22,
                    halign: "center",
                  },

                  // Professor
                  6: {
                    cellWidth: 55,
                  },

                  // Contato
                  7: {
                    cellWidth: 29,
                    halign: "center",
                  },
                },
              });

              // ==========================================
              // POSIÇÃO APÓS TABELA
              // ==========================================

              const finalY =
                doc.lastAutoTable?.finalY ??
                posY;

              totalGeral +=
                grupos[bloco][polo][sala].length;

              // ==========================================
              // ESPAÇO ENTRE SALAS
              // ==========================================

              posY = finalY + 2;
            });

          // ==============================================
          // ESPAÇO ENTRE POLOS
          // ==============================================

          posY += 1;
        });

      // ==================================================
      // ESPAÇO ENTRE BLOCOS
      // ==================================================

      posY += 3;
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

