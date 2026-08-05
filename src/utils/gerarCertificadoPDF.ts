import jsPDF from "jspdf";
import { api } from "@/services/api";

async function carregarImagem(url: string): Promise<string> {
  return new Promise((resolve, reject) => {
    const img = new Image();

    img.src = url;

    img.onload = () => {
      const canvas = document.createElement("canvas");

      canvas.width = img.width;
      canvas.height = img.height;

      const ctx = canvas.getContext("2d");

      if (!ctx) {
        reject("Erro ao criar canvas");
        return;
      }

      ctx.drawImage(img, 0, 0);

      resolve(canvas.toDataURL("image/png"));
    };

    img.onerror = reject;
  });
}

function formatarData(data: string) {
  const d = new Date(data);

  return d.toLocaleDateString("pt-BR");
}

export async function gerarCertificados(idCronograma: string) {
  try {
    const { data } = await api.get(
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

    
    const moldura = await carregarImagem("/imagens/moldura.png");

    data.forEach((item: any, index: number) => {
  if (index > 0) {
    pdf.addPage();
  }

  const largura = pdf.internal.pageSize.getWidth();
  const altura = pdf.internal.pageSize.getHeight();

  
pdf.addImage(
  moldura,
  "PNG",
  0,
  0,
  largura,
  altura
);

  
  pdf.setFont("times", "normal");
  pdf.setFontSize(16);

  pdf.text(
    "Certificamos que",
    largura / 2,
    70,
    {
      align: "center",
    }
  );


  pdf.setFont("times", "bold");
  pdf.setFontSize(24);

  pdf.text(
    item.aluno.nome.toUpperCase(),
    largura / 2,
    105,
    {
      align: "center",
    }
  );

  
  // Texto antes do curso
pdf.setFont("helvetica", "normal");
pdf.setFontSize(12);

const textoAntes = "concluiu com aproveitamento o curso de ";

const larguraAntes = pdf.getTextWidth(textoAntes);

// Nome do curso
pdf.setFont("helvetica", "bold");
pdf.setFontSize(16);

const nomeCurso = item.cronograma.tema;

const larguraCurso = pdf.getTextWidth(nomeCurso);

// Centralizar tudo
const larguraTotal = larguraAntes + larguraCurso;
const inicioX = (largura - larguraTotal) / 2;

// Desenha texto normal
pdf.setFont("helvetica", "normal");
pdf.setFontSize(12);
pdf.text(textoAntes, inicioX, 114);


// Desenha curso em negrito maior
pdf.setFont("helvetica", "bold");
pdf.setFontSize(15);
pdf.text(nomeCurso, inicioX + larguraAntes, 114);

 

  // ==========================
  // CARGA HORÁRIA
  // ==========================
  pdf.setFont("times", "normal");
  pdf.setFontSize(16);

 
  pdf.text(
    `Data de encerramento: ${formatarData(
      item.cronograma.data_fim
    )}`,
    largura / 2,
    125,
    {
      align: "center",
    }
  );

  // ==========================
  // NUMERAÇÃO
  // ==========================
  const numero = String(index + 1).padStart(4, "0");

  pdf.setFontSize(10);

  pdf.text(
    `Certificado nº ${numero}/${new Date().getFullYear()}`,
    largura - 15,
    altura - 10,
    {
      align: "right",
    }
  );

  

  pdf.text(
    "",
    215,
    182,
    {
      align: "center",
    }
  );
});

    const url = pdf.output("bloburl");
    window.open(url, "_blank");
  } catch (err) {
    console.error(err);
    alert("Erro ao gerar certificados.");
  }
}