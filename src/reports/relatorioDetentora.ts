
import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";
import { CronogramaType } from "@/app/matricula/types";

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

interface CronogramaRelatorio {
  codigo: number;
  tema: string;
  data_inicio: string;
  data_fim: string;
  hora_inicio: string;
  hora_fim: string;
  numero_ata: string;
  professor: string;
}

interface RelatorioDetentora {
  [empresa: string]: {
    [polo: string]: CronogramaRelatorio[];
  };
}

/**
 * Converte texto para MAIÚSCULAS.
 */
function maiuscula(
  valor: string | null | undefined
): string {
  return String(valor ?? "-").toLocaleUpperCase("pt-BR");
}

/**
 * Formata data para o padrão brasileiro.
 */
function formatarData(
  data: string
): string {
  if (!data) {
    return "-";
  }

  // Data no formato YYYY-MM-DD
  if (/^\d{4}-\d{2}-\d{2}$/.test(data)) {
    const [ano, mes, dia] =
      data.split("-");

    return `${dia}/${mes}/${ano}`;
  }

  return data;
}

export function gerarRelatorioDetentora(
  cronogramaFull: CronogramaType[],
  filtroBloco: string,
  filtroPolo: string,
  filtroDataFormatura: string,
  filtroEmpresa: string
) {
  /*
   * ========================================
   * FILTROS
   * ========================================
   */

  let lista = [...cronogramaFull];

  // FILTRO BLOCO
  if (filtroBloco) {
    lista = lista.filter(
      (item) =>
        item.bloco_curso?.bloco_Curso ===
        filtroBloco
    );
  }

  // FILTRO EMPRESA
  if (filtroEmpresa) {
    lista = lista.filter(
      (item) =>
        item.detentoras?.ata?.empresa
          ?.nome_empresa === filtroEmpresa
    );
  }

  // FILTRO POLO
  if (filtroPolo) {
    lista = lista.filter(
      (item) =>
        item.localAula?.polo ===
        filtroPolo
    );
  }

  // FILTRO DATA FORMATURA
  if (filtroDataFormatura) {
    lista = lista.filter(
      (item) =>
        item.formatura?.data_formatura ===
        filtroDataFormatura
    );
  }

  /*
   * ========================================
   * AGRUPAMENTO
   *
   * DETENTORA
   *   └── POLO
   *        └── CURSOS
   * ========================================
   */

  const dados: RelatorioDetentora = {};

  lista.forEach((item) => {
    const empresa =
      item.detentoras?.ata?.empresa
        ?.nome_empresa ??
      "SEM DETENTORA";

    const polo =
      item.localAula?.polo ??
      "SEM POLO";

    if (!dados[empresa]) {
      dados[empresa] = {};
    }

    if (!dados[empresa][polo]) {
      dados[empresa][polo] = [];
    }

    dados[empresa][polo].push({
      codigo: item.codigo,

      tema: maiuscula(
        item.tema
      ),

      data_inicio:
        formatarData(
          item.data_inicio
        ),

      data_fim:
        formatarData(
          item.data_fim
        ),

      hora_inicio:
        item.hora_inicio ?? "-",

      hora_fim:
        item.hora_fim ?? "-",

      numero_ata:
        item.detentoras?.ata
          ?.numero_ata ?? "-",

      professor:
        maiuscula(
          item.professor
            ?.nome_professor ??
            "NÃO INFORMADO"
        ),
    });
  });

  /*
   * ========================================
   * CRIAÇÃO DO PDF
   * ========================================
   */

  const doc =
    new jsPDF(
      "portrait",
      "mm",
      "a4"
    ) as JsPDFWithAutoTable;

  let posY = 15;

  /*
   * ========================================
   * TÍTULO
   * ========================================
   */

  doc.setFontSize(16);

  doc.setFont(
    "helvetica",
    "bold"
  );

  doc.text(
    "RELATÓRIO POR EMPRESA - SECRETARIA DA MULHER",
    14,
    posY
  );

  posY += 12;

  /*
   * ========================================
   * EMPRESAS / DETENTORAS
   * ========================================
   */

  Object.keys(dados)
    .sort((a, b) =>
      a.localeCompare(
        b,
        "pt-BR"
      )
    )
    .forEach((empresa) => {
      /*
       * Verifica espaço disponível
       */
      if (posY > 245) {
        doc.addPage();
        posY = 15;
      }

      const polos =
        Object.keys(
          dados[empresa]
        ).sort((a, b) =>
          a.localeCompare(
            b,
            "pt-BR"
          )
        );

      const primeiroPolo =
        polos[0];

      const numeroAta =
        primeiroPolo
          ? dados[empresa]
              [primeiroPolo]
              [0]
              ?.numero_ata ?? "-"
          : "-";

      /*
       * ========================================
       * DETENTORA
       * ========================================
       */

      doc.setFontSize(13);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        `DETENTORA: ${maiuscula(
          empresa
        )}`,
        14,
        posY
      );

      posY += 6;

      /*
       * ========================================
       * ATA
       * ========================================
       */

      doc.setFontSize(11);

      doc.setFont(
        "helvetica",
        "bold"
      );

      doc.text(
        `ATA Nº ${numeroAta}`,
        14,
        posY
      );

      posY += 8;

      /*
       * ========================================
       * POLOS
       * ========================================
       */

      polos.forEach((polo) => {
        /*
         * Verifica espaço disponível
         */
        if (posY > 245) {
          doc.addPage();
          posY = 15;
        }

        /*
         * ========================================
         * POLO
         * ========================================
         */

        doc.setFontSize(11);

        doc.setFont(
          "helvetica",
          "bold"
        );

        doc.text(
          `POLO: ${maiuscula(
            polo
          )}`,
          14,
          posY
        );

        posY += 4;

        /*
         * ========================================
         * CORPO DA TABELA
         * ========================================
         */

        const body =
          dados[empresa][polo]
            .map((curso) => [
              String(
                curso.codigo
              ),

              curso.tema,

              curso.data_inicio,

              curso.data_fim,

              `${curso.hora_inicio} - ${curso.hora_fim}`,

              curso.professor,
            ]);

        /*
         * ========================================
         * TABELA
         * ========================================
         */

        autoTable(doc, {
          startY: posY,

          head: [[
            "Código",
            "Tema",
            "Data Início",
            "Data Fim",
            "Horário",
            "Professor",
          ]],

          body,

          theme: "grid",

          styles: {
            fontSize: 8.5,

            cellPadding: 2,

            valign: "middle",

            lineWidth: 0.2,
          },

          headStyles: {
            fillColor: [
              180,
              0,
              0,
            ],

            textColor: 255,

            fontStyle: "bold",

            halign: "center",

            valign: "middle",
          },

          bodyStyles: {
            textColor: 20,
          },

          alternateRowStyles: {
            fillColor: [
              245,
              245,
              245,
            ],
          },

          columnStyles: {
            0: {
              cellWidth: 16,

              halign: "center",
            },

            1: {
              cellWidth: 48,
            },

            2: {
              cellWidth: 22,

              halign: "center",
            },

            3: {
              cellWidth: 22,

              halign: "center",
            },

            4: {
              cellWidth: 27,

              halign: "center",
            },

            5: {
              cellWidth: 52,
            },
          },

          margin: {
            left: 14,

            right: 14,

            bottom: 20,
          },

          didParseCell: (data) => {
            /*
             * Garante MAIÚSCULAS
             * no Tema e Professor.
             */

            if (
              data.section ===
                "body" &&
              (
                data.column.index ===
                  1 ||
                data.column.index ===
                  5
              )
            ) {
              data.cell.text =
                data.cell.text.map(
                  (texto) =>
                    texto.toLocaleUpperCase(
                      "pt-BR"
                    )
                );
            }
          },
        });

        /*
         * Atualiza posição
         * depois da tabela
         */

        posY =
          doc.lastAutoTable
            ?.finalY ??
          posY;

        posY += 8;
      });

      /*
       * Espaço entre empresas
       */

      posY += 5;
    });

  /*
   * ========================================
   * TOTAL DE CURSOS
   * ========================================
   *
   * O total considera somente os registros
   * que passaram pelos filtros.
   */

  const totalCursos =
    lista.length;

  /*
   * ========================================
   * PAGINAÇÃO
   * ========================================
   */

  const paginas =
    doc.getNumberOfPages();

  for (
    let i = 1;
    i <= paginas;
    i++
  ) {
    doc.setPage(i);

    /*
     * Fonte do rodapé
     */

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.setFontSize(8);

    /*
     * Linha superior do rodapé
     */

    doc.setDrawColor(
      180,
      180,
      180
    );

    doc.line(
      14,
      280,
      196,
      280
    );

    /*
     * ========================================
     * TOTAL
     * ========================================
     */

    doc.setFont(
      "helvetica",
      "bold"
    );

    doc.text(
      `TOTAL DE CURSOS: ${totalCursos}`,
      14,
      286
    );

    /*
     * ========================================
     * DATA DE EMISSÃO
     * ========================================
     */

    doc.setFont(
      "helvetica",
      "normal"
    );

    doc.text(
      `Emitido em ${new Date().toLocaleDateString(
        "pt-BR"
      )}`,
      85,
      286
    );

    /*
     * ========================================
     * PÁGINA
     * ========================================
     */

    doc.text(
      `Página ${i} de ${paginas}`,
      165,
      286
    );
  }

  /*
   * ========================================
   * ABRIR PDF
   * ========================================
   */

  const blob =
    doc.output("blob");

  window.open(
    URL.createObjectURL(
      blob
    ),
    "_blank"
  );
}

