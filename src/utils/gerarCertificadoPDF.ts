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

export interface CronogramaCertificado {
  idCronograma: string;
  segmentoId: string;
  segmentoNome: string;
}

interface CertificadoComSegmento {
  certificado: CertificadoData;
  segmentoId: string;
  segmentoNome: string;
  ordemOriginal: number;
}

interface CertificadoNumerado extends CertificadoComSegmento {
  numero: number;
}

interface PalavraCertificado {
  texto: string;
  negrito: boolean;
  largura: number;
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

    img.onerror = () => reject(new Error("Erro ao carregar imagem"));
  });
}

function formatarDataPorExtenso(data: string): string {
  if (!data) return "";

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

function desenharCertificado(
  pdf: jsPDF,
  item: CertificadoData,
  moldura: string,
  numeroCertificado: number
): void {
  const largura = pdf.internal.pageSize.getWidth();
  const altura = pdf.internal.pageSize.getHeight();

  pdf.addImage(moldura, "PNG", 0, 0, largura, altura);

  pdf.setTextColor(0, 0, 0);
  pdf.setFont("times", "normal");
  pdf.setFontSize(20);

  pdf.text(
    "A Prefeitura de Santana de Parnaíba, por meio da Secretaria",
    largura / 2,
    70,
    { align: "center" }
  );

  pdf.text(
    "da Mulher e da Família, certifica que o(a) Sr.(a)",
    largura / 2,
    79,
    { align: "center" }
  );

  pdf.setFont("times", "bold");
  pdf.setFontSize(23);
  pdf.text(item.aluno.nome.toUpperCase(), largura / 2, 102, {
    align: "center",
  });

  const nomeCurso = item.cronograma.tema.toUpperCase().trim();
  const dataPorExtenso = formatarDataPorExtenso(item.cronograma.data_fim);
  const textoAntes = "concluiu o curso de";
  const textoDepois = ` em ${dataPorExtenso}, com carga horária de 40 horas.`;
  const tamanhoTexto = 17;
  const tamanhoCurso = 15;
  const posicaoX = 50;
  const posicaoY = 115;
  const larguraDisponivel = largura - posicaoX - 50;

  const partes: { texto: string; negrito: boolean }[] = [
    { texto: `${textoAntes} `, negrito: false },
    { texto: nomeCurso, negrito: true },
    { texto: textoDepois, negrito: false },
  ];

  const palavras: PalavraCertificado[] = [];

  partes.forEach((parte, parteIndex) => {
    const palavrasParte = parte.texto.split(" ");

    palavrasParte.forEach((palavra, palavraIndex) => {
      if (!palavra.trim()) return;

      pdf.setFont("helvetica", parte.negrito ? "bold" : "normal");
      pdf.setFontSize(parte.negrito ? tamanhoCurso : tamanhoTexto);

      const textoPalavra =
        parteIndex === partes.length - 1 &&
        palavraIndex === palavrasParte.length - 1
          ? palavra
          : `${palavra} `;

      palavras.push({
        texto: textoPalavra,
        negrito: parte.negrito,
        largura: pdf.getTextWidth(textoPalavra),
      });
    });
  });

  const linhas: { palavras: PalavraCertificado[]; largura: number }[] = [];
  let linhaAtual: PalavraCertificado[] = [];
  let larguraLinhaAtual = 0;

  palavras.forEach((palavra) => {
    const ultrapassa = larguraLinhaAtual + palavra.largura > larguraDisponivel;

    if (ultrapassa && linhaAtual.length > 0) {
      linhas.push({ palavras: linhaAtual, largura: larguraLinhaAtual });
      linhaAtual = [];
      larguraLinhaAtual = 0;
    }

    linhaAtual.push(palavra);
    larguraLinhaAtual += palavra.largura;
  });

  if (linhaAtual.length > 0) {
    linhas.push({ palavras: linhaAtual, largura: larguraLinhaAtual });
  }

  const alturaLinha = 7;
  linhas.forEach((linha, linhaIndex) => {
    let x = posicaoX;
    const y = posicaoY + linhaIndex * alturaLinha;

    linha.palavras.forEach((palavra) => {
      pdf.setFont("helvetica", palavra.negrito ? "bold" : "normal");
      pdf.setFontSize(palavra.negrito ? tamanhoCurso : tamanhoTexto);
      pdf.text(palavra.texto, x, y);
      x += palavra.largura;
    });
  });

  const numero = String(numeroCertificado).padStart(3, "0");
  pdf.setFont("times", "normal");
  pdf.setFontSize(12);
  pdf.text(`${numero}`, largura - 267, altura - 204, {
    align: "right",
  });
}

function ordenarCertificados(
  certificados: CertificadoComSegmento[]
): CertificadoComSegmento[] {
  return [...certificados].sort((a, b) => {
    const comparacaoSegmento = a.segmentoNome.localeCompare(
      b.segmentoNome,
      "pt-BR",
      { sensitivity: "base" }
    );

    if (comparacaoSegmento !== 0) return comparacaoSegmento;

    const comparacaoNome = a.certificado.aluno.nome.localeCompare(
      b.certificado.aluno.nome,
      "pt-BR",
      { sensitivity: "base" }
    );

    if (comparacaoNome !== 0) return comparacaoNome;
    return a.ordemOriginal - b.ordemOriginal;
  });
}

function numerarCertificados(
  certificados: CertificadoComSegmento[]
): CertificadoNumerado[] {
  let segmentoAtual = "";
  let numeroNoSegmento = 0;

  return ordenarCertificados(certificados).map((item) => {
    if (item.segmentoId !== segmentoAtual) {
      segmentoAtual = item.segmentoId;
      numeroNoSegmento = 0;
    }

    numeroNoSegmento += 1;
    return { ...item, numero: numeroNoSegmento };
  });
}

async function obterCertificadosPorSegmento(
  cronogramas: CronogramaCertificado[]
): Promise<CertificadoComSegmento[]> {
  const cronogramasUnicos = Array.from(
    new Map(cronogramas.map((item) => [item.idCronograma, item])).values()
  );

  if (cronogramasUnicos.length === 0) return [];

  const respostas = await Promise.all(
    cronogramasUnicos.map(async (cronograma) => {
      const { data } = await api.get<CertificadoData[]>(
        `/certificado/cronograma/${cronograma.idCronograma}`
      );
      return { cronograma, certificados: data };
    })
  );

  const certificados: CertificadoComSegmento[] = [];
  let ordemOriginal = 0;

  respostas.forEach(({ cronograma, certificados: lista }) => {
    lista.forEach((certificado) => {
      certificados.push({
        certificado,
        segmentoId: cronograma.segmentoId,
        segmentoNome: cronograma.segmentoNome,
        ordemOriginal,
      });
      ordemOriginal += 1;
    });
  });

  return certificados;
}

async function abrirPDF(certificados: CertificadoNumerado[]): Promise<void> {
  if (certificados.length === 0) {
    alert("Nenhum aluno aprovado encontrado.");
    return;
  }

  const pdf = new jsPDF({
    orientation: "landscape",
    unit: "mm",
    format: "a4",
  });

  const moldura = await carregarImagem("/imagens/moldura.png");

  certificados.forEach((item, index) => {
    if (index > 0) pdf.addPage();
    desenharCertificado(pdf, item.certificado, moldura, item.numero);
  });

  const url = pdf.output("bloburl");
  window.open(url, "_blank");
}

function desenharCabecalhoRelatorio(pdf: jsPDF): number {
  const largura = pdf.internal.pageSize.getWidth();
  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(11);
  pdf.text("RELATÓRIO DA EQUIPE - CONFERÊNCIA DE CERTIFICADOS", largura / 2, 14, {
    align: "center",
  });
  pdf.setFont("helvetica", "normal");
  pdf.setFontSize(8);
  pdf.text("CURSOS DA SECRETARIA DA MULHER E DA FAMÍLIA", largura / 2, 20, {
    align: "center",
  });
  return 27;
}

function desenharCabecalhoTabela(pdf: jsPDF, y: number): number {
  const x = 10;
  const alturas = 8;
  const larguras = [66, 27, 72, 15];
  const titulos = ["Nome do aluno", "Nº do certificado", "Tema do curso", "OK"];
  let atualX = x;

  pdf.setFont("helvetica", "bold");
  pdf.setFontSize(9);
  pdf.setFillColor(225, 225, 225);

  titulos.forEach((titulo, index) => {
    pdf.rect(atualX, y, larguras[index], alturas, "FD");
    pdf.text(titulo, atualX + 2, y + 5.5);
    atualX += larguras[index];
  });

  return y + alturas;
}

async function abrirRelatorioEquipe(
  certificados: CertificadoNumerado[]
): Promise<void> {
  if (certificados.length === 0) {
    alert("Nenhum aluno aprovado encontrado para o relatório.");
    return;
  }

  const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
  const larguraColunas = [66, 27, 72, 15];
  const xInicial = 10;
  const alturaPagina = pdf.internal.pageSize.getHeight();
  let y = desenharCabecalhoRelatorio(pdf);
  y = desenharCabecalhoTabela(pdf, y);
  let segmentoAtual = "";

  const iniciarNovaPagina = () => {
    pdf.addPage();
    let novoY = desenharCabecalhoRelatorio(pdf);
    return desenharCabecalhoTabela(pdf, novoY);
  };

  certificados.forEach((item) => {
    if (item.segmentoId !== segmentoAtual) {
      segmentoAtual = item.segmentoId;
      const tituloSegmento = `SEGMENTO: ${item.segmentoNome.toLocaleUpperCase("pt-BR")}`;
      if (y + 12 > alturaPagina - 12) y = iniciarNovaPagina();
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(tituloSegmento, xInicial, y + 7);
      y += 11;
    }

    const nome = pdf.splitTextToSize(item.certificado.aluno.nome.toLocaleUpperCase("pt-BR"), 62);
    const tema = pdf.splitTextToSize(item.certificado.cronograma.tema.toLocaleUpperCase("pt-BR"), 68);
    const linhas = Math.max(nome.length, tema.length, 1);
    const alturaLinha = Math.max(8, linhas * 4.5 + 3);

    if (y + alturaLinha > alturaPagina - 12) {
      y = iniciarNovaPagina();
      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(10);
      pdf.text(`SEGMENTO: ${item.segmentoNome.toLocaleUpperCase("pt-BR")}`, xInicial, y + 7);
      y += 11;
    }

    const valores = [nome, [String(item.numero).padStart(3, "0")], tema, [""]];
    let x = xInicial;
    valores.forEach((valor, index) => {
      pdf.rect(x, y, larguraColunas[index], alturaLinha);
      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(7.5);
      const linhasTexto = Array.isArray(valor) ? valor : [valor];
      if (index === 1) {
        pdf.text(linhasTexto[0], x + larguraColunas[index] / 2, y + 5.5, { align: "center" });
      } else if (index === 3) {
        // A coluna permanece vazia para conferência manual da equipe.
      } else {
        pdf.text(linhasTexto, x + 2, y + 5.5, { lineHeightFactor: 1.15 });
      }
      x += larguraColunas[index];
    });
    y += alturaLinha;
  });

  const url = pdf.output("bloburl");
  window.open(url, "_blank");
}

export async function gerarCertificados(idCronograma: string): Promise<void> {
  try {
    const { data } = await api.get<CertificadoData[]>(
      `/certificado/cronograma/${idCronograma}`
    );

    const certificados: CertificadoComSegmento[] = data.map(
      (certificado, index) => ({
        certificado,
        segmentoId: "curso-individual",
        segmentoNome: "Curso individual",
        ordemOriginal: index,
      })
    );

    await abrirPDF(numerarCertificados(certificados));
  } catch (err: unknown) {
    console.error(err);
    alert("Erro ao gerar certificados.");
  }
}

export async function gerarCertificadosPorSegmento(
  cronogramas: CronogramaCertificado[]
): Promise<void> {
  try {
    if (cronogramas.length === 0) {
      alert("Nenhum curso encontrado para gerar certificados.");
      return;
    }

    const certificados = await obterCertificadosPorSegmento(cronogramas);
    await abrirPDF(numerarCertificados(certificados));
  } catch (err: unknown) {
    console.error(err);
    alert("Erro ao gerar certificados para impressão.");
  }
}

export async function gerarRelatorioEquipePorSegmento(
  cronogramas: CronogramaCertificado[]
): Promise<void> {
  try {
    if (cronogramas.length === 0) {
      alert("Nenhum curso encontrado para gerar o relatório da equipe.");
      return;
    }

    const certificados = await obterCertificadosPorSegmento(cronogramas);
    await abrirRelatorioEquipe(numerarCertificados(certificados));
  } catch (err: unknown) {
    console.error(err);
    alert("Erro ao gerar o relatório da equipe.");
  }
}
