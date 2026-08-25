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
// COR DA SALA
// Mantém a mesma lógica utilizada no frontend
// ============================================================

const corSala = (sala: string): [number, number, number] => {
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
    // POLOS
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

        doc.text(
          `Polo: ${polo}`,
          14,
          posY
        );

        // --------------------------------------------------------
        // PERÍODO
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
        // HORÁRIO
        // --------------------------------------------------------

        doc.text(
          "Horário",
          158,
          posY,
          {
            align: "center",
          }
        );

        posY += 5;

        // --------------------------------------------------------
        // SALAS
        // Ordenação numérica
        // --------------------------------------------------------

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

            // ----------------------------------------------------
            // IDENTIFICAÇÃO DA SALA
            // ----------------------------------------------------

            const cor = corSala(sala);

            doc.setFontSize(10);
            doc.setFont("helvetica", "bold");

            doc.setTextColor(
              cor[0],
              cor[1],
              cor[2]
            );

            doc.text(
              `Sala ${sala}`,
              14,
              posY
            );

            posY += 4;

            // ----------------------------------------------------
            // DADOS
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
            // Somente dados, sem cabeçalho
            // ----------------------------------------------------

            autoTable(doc, {
              startY: posY,

              body: rows,

              theme: "grid",

              styles: {
                fontSize: 10,
                overflow: "linebreak",
                textColor: [0, 0, 0],
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
              ).lastAutoTable.finalY + 3;
          });
      }
    );

    // ----------------------------------------------------------
    // ESPAÇO ENTRE BLOCOS
    // ----------------------------------------------------------

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