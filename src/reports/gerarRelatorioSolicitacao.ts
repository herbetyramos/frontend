import jsPDF from "jspdf";
import autoTable from "jspdf-autotable";

interface SolicitacaoMaterial {
    quantidade: number;
    observacao?: string | null;
    status: string;

    material: {
        nome_material: string;
        propriedade: "PERMANENTE" | "NAO_PERMANENTE";
    };
}

interface DadosRelatorio {

    cronograma: {

        codigo: number;

        tema: string;

        data_inicio: string;

        data_fim: string;

        hora_inicio: string;

        hora_fim: string;

        professor?: {
            nome_professor: string;
        } | null;

        localAula?: {
            polo: string;
        } | null;

        salaAula?: {
            numero_sala: string;
        } | null;

        detentoras?: {

            curso?: {
                nome_curso: string;
            } | null;

            ata?: {

                numero_ata: string;

                empresa?: {
                    nome_empresa: string;
                } | null;

            } | null;

        } | null;

    };

    materiais: SolicitacaoMaterial[];

    observacao?: string;

}

export function gerarRelatorioSolicitacao(
    dados: DadosRelatorio
) {

    const pdf = new jsPDF({
        orientation: "portrait",
        unit: "mm",
        format: "a4",
    });

    const largura = pdf.internal.pageSize.getWidth();

    pdf.setFont("helvetica", "bold");
    pdf.setFontSize(17);

    pdf.text(
        "SOLICITAÇÃO DE MATERIAIS",
        largura / 2,
        15,
        { align: "center" }
    );

    pdf.setFontSize(10);

    let y = 28;

    //--------------------------------------------------
    // DADOS DO CURSO
    //--------------------------------------------------

    pdf.setFont("helvetica", "bold");
    pdf.text("Curso:", 14, y);

    pdf.setFont("helvetica", "normal");
    pdf.text(
        dados.cronograma.detentoras?.curso?.nome_curso ?? "-",
        40,
        y
    );

    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Tema:", 14, y);

    pdf.setFont("helvetica", "normal");
    pdf.text(
        dados.cronograma.tema,
        40,
        y
    );

    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Professor:", 14, y);

    pdf.setFont("helvetica", "normal");
    pdf.text(
        dados.cronograma.professor?.nome_professor ?? "-",
        40,
        y
    );

    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Local:", 14, y);

    pdf.setFont("helvetica", "normal");
    pdf.text(
        `${dados.cronograma.localAula?.polo ?? "-"} / Sala ${
            dados.cronograma.salaAula?.numero_sala ?? "-"
        }`,
        40,
        y
    );

    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Período:", 14, y);

    pdf.setFont("helvetica", "normal");
    pdf.text(
        `${dados.cronograma.data_inicio} até ${dados.cronograma.data_fim}`,
        40,
        y
    );

    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Horário:", 14, y);

    pdf.setFont("helvetica", "normal");
    pdf.text(
        `${dados.cronograma.hora_inicio} às ${dados.cronograma.hora_fim}`,
        40,
        y
    );

    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Empresa:", 14, y);

    pdf.setFont("helvetica", "normal");
    pdf.text(
        dados.cronograma.detentoras?.ata?.empresa?.nome_empresa ?? "-",
        40,
        y
    );

    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Ata:", 14, y);

    pdf.setFont("helvetica", "normal");
    pdf.text(
        dados.cronograma.detentoras?.ata?.numero_ata ?? "-",
        40,
        y
    );

    y += 6;

    pdf.setFont("helvetica", "bold");
    pdf.text("Status:", 14, y);

    pdf.setFont("helvetica", "normal");
    pdf.text(
        dados.materiais[0]?.status ?? "PENDENTE",
        40,
        y
    );

    //--------------------------------------------------
    // TABELA
    //--------------------------------------------------

    autoTable(pdf, {

        startY: y + 8,

        head: [[
            "Qtd",
            "Material",
            "Tipo"
        ]],

        body: dados.materiais.map(item => [

            item.quantidade,

            item.material.nome_material,

            item.material.propriedade === "PERMANENTE"
                ? "Permanente"
                : "Não Permanente"

        ]),

        theme: "grid",

        styles: {

            fontSize: 9,

            cellPadding: 2,

            halign: "left",

            valign: "middle",

        },

        headStyles: {

            fillColor: [30, 64, 175],

            textColor: 255,

            fontStyle: "bold",

        },

        columnStyles: {

            0: {
                halign: "center",
                cellWidth: 18
            },

            1: {
                cellWidth: 110
            },

            2: {
                halign: "center",
                cellWidth: 45
            }

        }

    });

    y = (pdf as any).lastAutoTable.finalY + 10;

    //--------------------------------------------------
    // OBSERVAÇÃO
    //--------------------------------------------------

    if (dados.observacao) {

        pdf.setFont("helvetica", "bold");

        pdf.text(
            "Observação:",
            14,
            y
        );

        y += 6;

        pdf.setFont("helvetica", "normal");

        const linhas = pdf.splitTextToSize(
            dados.observacao,
            180
        );

        pdf.text(
            linhas,
            14,
            y
        );

        y += linhas.length * 5 + 8;

    }

    //--------------------------------------------------
    // ASSINATURAS
    //--------------------------------------------------

    if (y < 230) {

        y = 240;

    }

    pdf.line(20, y, 90, y);

    pdf.line(120, y, 190, y);

    pdf.setFontSize(9);

    pdf.text(
        "Professor",
        55,
        y + 5,
        {
            align: "center"
        }
    );

    pdf.text(
        "Almoxarifado",
        155,
        y + 5,
        {
            align: "center"
        }
    );

    //--------------------------------------------------
    // RODAPÉ
    //--------------------------------------------------

    pdf.setFontSize(8);

    pdf.text(
        `Emitido em ${new Date().toLocaleDateString("pt-BR")}`,
        14,
        287
    );

    const blobUrl = pdf.output("bloburl");

window.open(blobUrl, "_blank");

}