import jsPDF from "jspdf";
import { api } from "@/services/api";

interface CertificadoData {
  aluno: {
    nome: string;
  };

  cronograma: {
    tema: string;
    data_fim: string;
  };
}

function carregarImagem(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.src = url;

    img.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject(new Error("Erro ao criar canvas"));
        return;
      }

      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = () => {
      reject(new Error("Erro ao carregar imagem"));
    };
  });
}

/*
 * ==========================================================
 * DATA POR EXTENSO
 *
 * Exemplo:
 * 30 de setembro de 2026
 * ==========================================================
 */

function formatarDataPorExtenso(data: string): string {
  if (!data) return "";

  const dataObj = new Date(data);

  return dataObj.toLocaleDateString("pt-BR", {
    day: "numeric",
    month: "long",
    year: "numeric",
  });
}

export async function gerarCertificados(
  idCronograma: string
) {
  try {
    const { data } =
      await api.get<CertificadoData[]>(
        `/certificado/cronograma/${idCronograma}`
      );

    if (!data.length) {
      alert("Nenhum aluno aprovado encontrado.");
      return;
    }

    const pdf = new jsPDF({
      orientation: "landscape",
      unit: "mm",
      format: "a4",
    });

    const moldura =
      await carregarImagem(
        "/imagens/moldura.png"
      );

    data.forEach((item, index) => {
      if (index > 0) {
        pdf.addPage();
      }

      const largura =
        pdf.internal.pageSize.getWidth();

      const altura =
        pdf.internal.pageSize.getHeight();

      /*
       * =====================================================
       * MOLDURA
       * =====================================================
       */

      pdf.addImage(
        moldura,
        "PNG",
        0,
        0,
        largura,
        altura
      );

      /*
       * =====================================================
       * TEXTO INICIAL
       * =====================================================
       */

      pdf.setTextColor(0, 0, 0);

      pdf.setFont(
        "times",
        "normal"
      );

      pdf.setFontSize(20);

      pdf.text(
        "A Prefeitura de Santana de Parnaíba, por meio da Secretaria",
        largura / 2,
        70,
        {
          align: "center",
        }
      );

      pdf.text(
        "da Mulher e da Família, certifica que o(a) Sr.(a)",
        largura / 2,
        79,
        {
          align: "center",
        }
      );

      /*
       * =====================================================
       * NOME DO ALUNO
       * =====================================================
       */

      pdf.setFont(
        "times",
        "bold"
      );

      pdf.setFontSize(23);

      const nomeAluno =
        item.aluno.nome.toUpperCase();

      pdf.text(
        nomeAluno,
        largura / 2,
        102,
        {
          align: "center",
        }
      );

      /*
       * =====================================================
       * DADOS DO CURSO
       * =====================================================
       */

      const textoAntes =
        "concluiu o curso de";

      const nomeCurso =
        `${item.cronograma.tema.toUpperCase()},`;

      const dataPorExtenso =
        formatarDataPorExtenso(
          item.cronograma.data_fim
        );

      const textoDepois =
        `em ${dataPorExtenso},`;

      const textoHoras =
        "com carga horária de 40 horas.";

      /*
       * =====================================================
       * CONFIGURAÇÕES
       * =====================================================
       */

      const tamanhoTexto = 17;
      const tamanhoCurso = 15;

      /*
       * Largura máxima da primeira linha.
       */

      const larguraMaxima = 255;

      /*
       * =====================================================
       * POSIÇÃO DAS DUAS LINHAS
       *
       * As duas começam exatamente no mesmo X.
       * =====================================================
       */

      const posicaoX = 60;
      const posicaoY = 115;

      /*
       * =====================================================
       * CALCULAR LARGURAS
       * =====================================================
       */

      /*
       * Texto antes do curso
       */

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(
        tamanhoTexto
      );

      const larguraAntes =
        pdf.getTextWidth(
          `${textoAntes} `
        );

      /*
       * Nome do curso
       */

      pdf.setFont(
        "helvetica",
        "bold"
      );

      pdf.setFontSize(
        tamanhoCurso
      );

      const larguraCurso =
        pdf.getTextWidth(
          nomeCurso
        );

      /*
       * Data
       */

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(
        tamanhoTexto
      );

      const larguraDepois =
        pdf.getTextWidth(
          ` ${textoDepois}`
        );

      /*
       * Largura total da primeira linha
       */

      const larguraTotal =
        larguraAntes +
        larguraCurso +
        larguraDepois;

      /*
       * =====================================================
       * PRIMEIRA LINHA
       *
       * concluiu o curso de CURSO em DATA
       * =====================================================
       */

      if (
        larguraTotal <=
        larguraMaxima
      ) {
        /*
         * -----------------------------------------------
         * TEXTO INICIAL
         * -----------------------------------------------
         */

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          tamanhoTexto
        );

        pdf.text(
          `${textoAntes} `,
          posicaoX,
          posicaoY
        );

        /*
         * -----------------------------------------------
         * CURSO
         * -----------------------------------------------
         */

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          tamanhoCurso
        );

        pdf.text(
          nomeCurso,
          posicaoX +
            larguraAntes,
          posicaoY
        );

        /*
         * -----------------------------------------------
         * DATA
         * -----------------------------------------------
         */

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          tamanhoTexto
        );

        pdf.text(
          ` ${textoDepois}`,
          posicaoX +
            larguraAntes +
            larguraCurso,
          posicaoY
        );
      }

      /*
       * =====================================================
       * CURSO MUITO GRANDE
       *
       * Reduz o tamanho da fonte para tentar manter
       * toda a frase na mesma linha.
       * =====================================================
       */

      else {
        let tamanhoCursoAjustado =
          tamanhoCurso;

        let tamanhoTextoAjustado =
          tamanhoTexto;

        let larguraAtual =
          larguraTotal;

        /*
         * Reduz gradualmente a fonte.
         */

        while (
          larguraAtual >
            larguraMaxima &&
          tamanhoCursoAjustado >
            9
        ) {
          tamanhoCursoAjustado -= 0.5;

          tamanhoTextoAjustado =
            Math.max(
              13,
              tamanhoTextoAjustado -
                0.25
            );

          /*
           * Nova largura do texto inicial
           */

          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.setFontSize(
            tamanhoTextoAjustado
          );

          const novaLarguraAntes =
            pdf.getTextWidth(
              `${textoAntes} `
            );

          /*
           * Nova largura do curso
           */

          pdf.setFont(
            "helvetica",
            "bold"
          );

          pdf.setFontSize(
            tamanhoCursoAjustado
          );

          const novaLarguraCurso =
            pdf.getTextWidth(
              nomeCurso
            );

          /*
           * Nova largura da data
           */

          pdf.setFont(
            "helvetica",
            "normal"
          );

          pdf.setFontSize(
            tamanhoTextoAjustado
          );

          const novaLarguraDepois =
            pdf.getTextWidth(
              ` ${textoDepois}`
            );

          larguraAtual =
            novaLarguraAntes +
            novaLarguraCurso +
            novaLarguraDepois;
        }

        /*
         * -----------------------------------------------
         * TEXTO INICIAL
         * -----------------------------------------------
         */

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          tamanhoTextoAjustado
        );

        const larguraAntesAjustada =
          pdf.getTextWidth(
            `${textoAntes} `
          );

        pdf.text(
          `${textoAntes} `,
          posicaoX,
          posicaoY
        );

        /*
         * -----------------------------------------------
         * CURSO
         * -----------------------------------------------
         */

        pdf.setFont(
          "helvetica",
          "bold"
        );

        pdf.setFontSize(
          tamanhoCursoAjustado
        );

        const larguraCursoAjustada =
          pdf.getTextWidth(
            nomeCurso
          );

        pdf.text(
          nomeCurso,
          posicaoX +
            larguraAntesAjustada,
          posicaoY
        );

        /*
         * -----------------------------------------------
         * DATA
         * -----------------------------------------------
         */

        pdf.setFont(
          "helvetica",
          "normal"
        );

        pdf.setFontSize(
          tamanhoTextoAjustado
        );

        pdf.text(
          ` ${textoDepois}`,
          posicaoX +
            larguraAntesAjustada +
            larguraCursoAjustada,
          posicaoY
        );
      }

      /*
       * =====================================================
       * SEGUNDA LINHA
       *
       * com carga horária de 40 horas.
       *
       * Alinhada exatamente com a primeira linha.
       * =====================================================
       */

      pdf.setFont(
        "helvetica",
        "normal"
      );

      pdf.setFontSize(18);

      pdf.text(
        textoHoras,
        posicaoX,
        posicaoY + 6
      );

      /*
       * =====================================================
       * NÚMERO DO CERTIFICADO
       * =====================================================
       */

      const numero =
        String(index + 1).padStart(
          4,
          "0"
        );

      pdf.setFont(
        "times",
        "normal"
      );

      pdf.setFontSize(9);

      pdf.text(
        `Certificado nº ${numero}/${new Date().getFullYear()}`,
        largura - 17,
        altura - 3,
        {
          align: "right",
        }
      );
    });

    /*
     * =====================================================
     * ABRIR PDF
     * =====================================================
     */

    const url =
      pdf.output("bloburl");

    window.open(
      url,
      "_blank"
    );
  } catch (err: unknown) {
    console.error(err);

    alert(
      "Erro ao gerar certificados."
    );
  }
}

