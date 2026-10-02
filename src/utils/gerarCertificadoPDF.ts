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
 * ==========================================================
 */

function formatarDataPorExtenso(data: string): string {
  if (!data) {
    return "";
  }

  // Trata datas no formato YYYY-MM-DD ou ISO
  const dataISO = /^(\d{4})-(\d{2})-(\d{2})/.exec(data);

  if (dataISO) {
    const ano = Number(dataISO[1]);
    const mes = Number(dataISO[2]);
    const dia = Number(dataISO[3]);

    const dataLocal = new Date(ano, mes - 1, dia);

    if (!Number.isNaN(dataLocal.getTime())) {
      return dataLocal.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }

  // Trata datas no formato DD/MM/YYYY
  const dataBR = /^(\d{2})\/(\d{2})\/(\d{4})$/.exec(data);

  if (dataBR) {
    const dia = Number(dataBR[1]);
    const mes = Number(dataBR[2]);
    const ano = Number(dataBR[3]);

    const dataLocal = new Date(ano, mes - 1, dia);

    if (!Number.isNaN(dataLocal.getTime())) {
      return dataLocal.toLocaleDateString("pt-BR", {
        day: "numeric",
        month: "long",
        year: "numeric",
      });
    }
  }

  // Última tentativa para outros formatos
  const dataObj = new Date(data);

  if (!Number.isNaN(dataObj.getTime())) {
    return dataObj.toLocaleDateString("pt-BR", {
      day: "numeric",
      month: "long",
      year: "numeric",
    });
  }

  return "";
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
      alert(
        "Nenhum aluno aprovado encontrado."
      );
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
        77,
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

      const nomeCurso =
        item.cronograma.tema
          .toUpperCase()
          .trim();

      const dataPorExtenso =
        formatarDataPorExtenso(
          item.cronograma.data_fim
        );

      /*
       * =====================================================
       * TEXTOS
       * =====================================================
       */

      const textoAntes =
        "concluiu o curso de";

      const textoDepois =
        `em ${dataPorExtenso}, com carga horária de 40 horas.`;

      

      /*
       * =====================================================
       * CONFIGURAÇÕES
       * =====================================================
       */

      const tamanhoTexto = 17;

      /*
       * Curso um pouco menor e em negrito.
       */

      const tamanhoCurso = 15;

      const posicaoX = 50;
      const posicaoY = 115;

      const margemDireita = 50;

      const larguraDisponivel =
        largura -
        posicaoX -
        margemDireita;

      /*
       * =====================================================
       * MONTA A FRASE EM PARTES
       *
       * 1 - textoAntes
       * 2 - nomeCurso
       * 3 - textoDepois
       *
       * Isso permite deixar somente o curso em negrito.
       * =====================================================
       */

      interface ParteTexto {
        texto: string;
        negrito: boolean;
      }

      const partes: ParteTexto[] = [
        {
          texto: `${textoAntes} `,
          negrito: false,
        },
        {
          texto: nomeCurso,
          negrito: true,
        },
        {
          texto: textoDepois,
          negrito: false,
        },
      ];

      /*
       * =====================================================
       * QUEBRA AUTOMÁTICA
       *
       * Cada palavra é colocada na linha atual.
       * Quando ultrapassar a margem, passa para a
       * próxima linha.
       * =====================================================
       */

      interface Palavra {
        texto: string;
        negrito: boolean;
        largura: number;
      }

      const palavras: Palavra[] = [];

      partes.forEach((parte) => {
        const palavrasParte =
          parte.texto.split(" ");

        palavrasParte.forEach(
          (palavra, palavraIndex) => {
            if (
              palavra.trim() === ""
            ) {
              return;
            }

            pdf.setFont(
              "helvetica",
              parte.negrito
                ? "bold"
                : "normal"
            );

            pdf.setFontSize(
              parte.negrito
                ? tamanhoCurso
                : tamanhoTexto
            );

            const textoPalavra =
              palavraIndex ===
                palavrasParte.length - 1 &&
              parte ===
                partes[partes.length - 1]
                ? palavra
                : `${palavra} `;

            const larguraPalavra =
              pdf.getTextWidth(
                textoPalavra
              );

            palavras.push({
              texto: textoPalavra,
              negrito:
                parte.negrito,
              largura:
                larguraPalavra,
            });
          }
        );
      });

      /*
       * =====================================================
       * CRIA AS LINHAS
       * =====================================================
       */

      interface Linha {
        palavras: Palavra[];
        largura: number;
      }

      const linhas: Linha[] = [];

      let linhaAtual: Palavra[] = [];
      let larguraLinhaAtual = 0;

      palavras.forEach((palavra) => {
        /*
         * Se a palavra sozinha for maior que a margem,
         * ela será colocada mesmo assim.
         */

        const ultrapassa =
          larguraLinhaAtual +
            palavra.largura >
          larguraDisponivel;

        if (
          ultrapassa &&
          linhaAtual.length > 0
        ) {
          linhas.push({
            palavras: linhaAtual,
            largura: larguraLinhaAtual,
          });

          linhaAtual = [];
          larguraLinhaAtual = 0;
        }

        linhaAtual.push(palavra);

        larguraLinhaAtual +=
          palavra.largura;
      });

      if (linhaAtual.length > 0) {
        linhas.push({
          palavras: linhaAtual,
          largura: larguraLinhaAtual,
        });
      }

      /*
       * =====================================================
       * DESENHA AS LINHAS
       *
       * Alinhamento à esquerda.
       * =====================================================
       */

      const alturaLinha = 7;

      linhas.forEach(
        (linha, linhaIndex) => {
          let x = posicaoX;

          const y =
            posicaoY +
            linhaIndex *
              alturaLinha;

          linha.palavras.forEach(
            (palavra) => {
              pdf.setFont(
                "helvetica",
                palavra.negrito
                  ? "bold"
                  : "normal"
              );

              pdf.setFontSize(
                palavra.negrito
                  ? tamanhoCurso
                  : tamanhoTexto
              );

              pdf.text(
                palavra.texto,
                x,
                y
              );

              x += palavra.largura;
            }
          );
        }
      );

      /*
       * =====================================================
       * CARGA HORÁRIA
       *
       * Sempre fica na linha abaixo da frase.
       * =====================================================
       */

      

     

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
        altura - 12,
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

