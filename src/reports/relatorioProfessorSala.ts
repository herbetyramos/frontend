
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
  filtroDataFormatura: string
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

  doc.setFontSize(13);

  // ======================================================
  // FILTROS
  // ======================================================

  const lista = cronogramaFull.filter((item) => {
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
  // PERCORRE BLOCOS
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

      posY += 4;

      // ==================================================
      // PERCORRE POLOS
      // ==================================================

      Object.keys(grupos[bloco])
        .sort()
        .forEach((polo) => {
          if (posY > 170) {
            doc.addPage();
            posY = 20;
          }

          // ==============================================
          // TÍTULO POLO
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

          posY += 5;

          // ==============================================
          // PERCORRE SALAS
          // ==============================================

          Object.keys(grupos[bloco][polo])
            .sort()
            .forEach((sala) => {
              if (posY > 170) {
                doc.addPage();
                posY = 20;
              }

              const rows =
                grupos[bloco][polo][sala]
                  .map((item, index) => [
                    index + 1,

                    item.codigo,

                    item.tema
                      ?.toUpperCase() ?? "",

                    item.data_inicio,

                    item.data_fim,

                    getPeriodo(
                      item.hora_inicio
                    ),

                    `${item.hora_inicio} às ${item.hora_fim}`,

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

                  "Horário",

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

                columnStyles: {
                  0: {
                    cellWidth: 9,
                    halign: "center",
                  },

                  1: {
                    cellWidth: 15,
                    halign: "center",
                  },

                  2: {
                    cellWidth: 82,
                  },

                  3: {
                    cellWidth: 21,
                    halign: "center",
                  },

                  4: {
                    cellWidth: 21,
                    halign: "center",
                  },

                  5: {
                    cellWidth: 20,
                    halign: "center",
                  },

                  6: {
                    cellWidth: 28,
                    halign: "center",
                  },

                  7: {
                    cellWidth: 51,
                  },

                  8: {
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

              posY =
                finalY + 4;
            });

          // Pequeno espaço entre salas
          posY += 2;
        });

      // Espaço entre blocos
      posY += 4;
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
  // ABRIR PDF EM NOVA GUIA
  // ======================================================

  const pdfUrl =
    doc.output("bloburl");

  window.open(
    pdfUrl,
    "_blank"
  );
}
