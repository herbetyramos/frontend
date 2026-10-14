import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

import { CronogramaType } from "@/app/matricula/types";

interface JsPDFWithAutoTable extends jsPDF {
  lastAutoTable?: {
    finalY: number;
  };
}

function getPeriodo(hora?: string | null): string {
  if (!hora) return "";

  const horaNumero = parseInt(hora.split(":")[0], 10);

  if (Number.isNaN(horaNumero)) return "";

  if (horaNumero < 12) return "MANHÃ";
  if (horaNumero < 18) return "TARDE";

  return "NOITE";
}

function formatarData(data?: string | null): string {
  if (!data) return "";

  const valor = String(data).trim();
  if (!valor) return "";

  const formatoBR = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/);

  if (formatoBR) {
    return `${formatoBR[1]}/${formatoBR[2]}/${formatoBR[3]}`;
  }

  const formatoISO = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (formatoISO) {
    return `${formatoISO[3]}/${formatoISO[2]}/${formatoISO[1]}`;
  }

  const dataConvertida = new Date(valor);

  if (Number.isNaN(dataConvertida.getTime())) {
    return "";
  }

  return dataConvertida.toLocaleDateString("pt-BR");
}

/**
 * Normaliza datas para comparação, aceitando:
 * YYYY-MM-DD, ISO com horário e DD/MM/YYYY.
 */
function normalizarData(data?: string | null): string {
  if (!data) return "";

  const valor = String(data).trim();
  if (!valor) return "";

  const formatoISO = valor.match(/^(\d{4})-(\d{2})-(\d{2})/);

  if (formatoISO) {
    return `${formatoISO[1]}-${formatoISO[2]}-${formatoISO[3]}`;
  }

  const formatoBR = valor.match(/^(\d{2})\/(\d{2})\/(\d{4})/);

  if (formatoBR) {
    return `${formatoBR[3]}-${formatoBR[2]}-${formatoBR[1]}`;
  }

  return "";
}

export function relatorioFormaturaEmpresa(
  cronogramaFull: CronogramaType[],
  filtroDataFormatura: string,
  filtroBloco: string,
  filtroEmpresa: string
): void {
  /*
   * ========================================
   * VALIDAR EMPRESA SELECIONADA
   * ========================================
   */

  if (!filtroEmpresa.trim()) {
    window.alert(
      "Selecione uma empresa no filtro antes de gerar o relatório."
    );
    return;
  }

  /*
   * ========================================
   * FILTROS
   * ========================================
   */

  const dataFormaturaFiltro = normalizarData(filtroDataFormatura);

  const empresaFiltro = filtroEmpresa.trim().toLocaleLowerCase("pt-BR");

  const lista = cronogramaFull.filter((item) => {
    const blocoOK =
      !filtroBloco ||
      item.bloco_curso?.bloco_Curso === filtroBloco;

    const dataFormaturaItem = normalizarData(
      item.formatura?.data_formatura
    );

    const formaturaOK =
      !dataFormaturaFiltro ||
      dataFormaturaItem === dataFormaturaFiltro;

    const nomeEmpresa =
      item.detentoras?.ata?.empresa?.nome_empresa?.trim() ?? "";

    const empresaOK =
      nomeEmpresa.toLocaleLowerCase("pt-BR") === empresaFiltro;

    return blocoOK && formaturaOK && empresaOK;
  });

  /*
   * ========================================
   * VALIDAR RESULTADOS
   * ========================================
   */

  if (lista.length === 0) {
    window.alert(
      "Nenhum curso encontrado para a empresa e os filtros selecionados."
    );
    return;
  }

  /*
   * ========================================
   * CRIAÇÃO DO PDF
   * ========================================
   */

  const doc = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  }) as JsPDFWithAutoTable;

  /*
   * ========================================
   * CABEÇALHO
   * ========================================
   */

  doc.setFont("helvetica", "bold");
  doc.setFontSize(14);

  doc.text(
    "RELATÓRIO DE CURSOS DA FORMATURA POR EMPRESA",
    14,
    15
  );

  doc.setFont("helvetica", "normal");
  doc.setFontSize(10);

  let cabecalhoY = 22;

  if (filtroDataFormatura) {
    doc.text(
      `Data da Formatura: ${formatarData(filtroDataFormatura)}`,
      14,
      cabecalhoY
    );

    cabecalhoY += 6;
  }

  if (filtroBloco) {
    doc.text(`Bloco: ${filtroBloco}`, 14, cabecalhoY);
    cabecalhoY += 6;
  }

  /*
   * ========================================
   * EMPRESA SELECIONADA
   * ========================================
   */

  const empresaSelecionada =
    lista[0]?.detentoras?.ata?.empresa?.nome_empresa?.trim() ??
    filtroEmpresa.trim();

  /*
   * ========================================
   * ORDENAÇÃO DOS CURSOS
   * Primeiro por local e depois por tema.
   * ========================================
   */

  const cursos = [...lista].sort((a, b) => {
    const poloA = a.localAula?.polo ?? "";
    const poloB = b.localAula?.polo ?? "";

    const comparacaoPolo = poloA.localeCompare(poloB, "pt-BR");

    if (comparacaoPolo !== 0) {
      return comparacaoPolo;
    }

    return (a.tema ?? "").localeCompare(b.tema ?? "", "pt-BR");
  });

  let tabelaY = cabecalhoY + 3;

  /*
   * ========================================
   * TÍTULO DA EMPRESA
   * ========================================
   */

  if (tabelaY > 180) {
    doc.addPage();
    tabelaY = 15;
  }

  doc.setFont("helvetica", "bold");
  doc.setFontSize(10);
  doc.setTextColor(0, 70, 140);

  doc.text(
    `EMPRESA: ${empresaSelecionada.toLocaleUpperCase("pt-BR")}`,
    14,
    tabelaY
  );

  // Restaurar a cor padrão do texto.
  doc.setTextColor(0, 0, 0);

  tabelaY += 3;

  /*
   * ========================================
   * TABELA DE CURSOS
   * ========================================
   */

  const rows = cursos.map((item, index) => [
    String(index + 1),
    String(item.codigo ?? ""),
    (item.tema || "").toLocaleUpperCase("pt-BR"),
    formatarData(item.data_inicio),
    getPeriodo(item.hora_inicio),
    (item.localAula?.polo || "").toLocaleUpperCase("pt-BR"),
    (item.professor?.nome_professor || "").toLocaleUpperCase("pt-BR"),
  ]);

  autoTable(doc, {
    startY: tabelaY,

    head: [
      [
        "Nº",
        "Código",
        "Tema",
        "Data Início",
        "Período",
        "Local",
        "Professor",
      ],
    ],

    body: rows,
    theme: "grid",

    styles: {
      font: "helvetica",
      fontSize: 8,
      cellPadding: 2,
      overflow: "linebreak",
      valign: "middle",
    },

    headStyles: {
      fillColor: [0, 70, 140],
      textColor: 255,
      fontStyle: "bold",
      halign: "center",
    },

    columnStyles: {
      0: { cellWidth: 10, halign: "center" },
      1: { cellWidth: 15, halign: "center" },
      2: { cellWidth: 85 },
      3: { cellWidth: 25, halign: "center" },
      4: { cellWidth: 22, halign: "center" },
      5: { cellWidth: 45 },
      6: { cellWidth: 67 },
    },

    margin: {
      left: 14,
      right: 14,
      bottom: 15,
    },

    showHead: "everyPage",
  });

  /*
   * ========================================
   * RODAPÉ
   * ========================================
   */

  const paginas = doc.getNumberOfPages();

  for (let pagina = 1; pagina <= paginas; pagina += 1) {
    doc.setPage(pagina);

    doc.setFont("helvetica", "normal");
    doc.setFontSize(8);
    doc.setDrawColor(180, 180, 180);

    doc.line(14, 200, 283, 200);

    doc.text(
      `Emitido em ${new Date().toLocaleDateString("pt-BR")}`,
      14,
      205
    );

    doc.text(
      `Página ${pagina} de ${paginas}`,
      283,
      205,
      { align: "right" }
    );
  }

  /*
   * ========================================
   * ABRIR PDF
   * ========================================
   */

  const pdfBlob = doc.output("blob");
  const pdfUrl = URL.createObjectURL(pdfBlob);

  window.open(pdfUrl, "_blank");
}
