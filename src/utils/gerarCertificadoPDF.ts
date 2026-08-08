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


function formatarData(data: string) {
  if (!data) return "";

  return new Date(data).toLocaleDateString("pt-BR");
}


export async function gerarCertificados(idCronograma: string) {
  try {

    const { data } = await api.get<CertificadoData[]>(
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


    const moldura = await carregarImagem(
      "/imagens/moldura.png"
    );


    data.forEach((item: CertificadoData, index: number) => {

      if (index > 0) {
        pdf.addPage();
      }


      const largura =
        pdf.internal.pageSize.getWidth();

      const altura =
        pdf.internal.pageSize.getHeight();



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



      const textoAntes =
        "concluiu com aproveitamento o curso de ";


      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);


      const larguraAntes =
        pdf.getTextWidth(textoAntes);



      const nomeCurso =
        item.cronograma.tema;


      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(15);


      const larguraCurso =
        pdf.getTextWidth(nomeCurso);



      const larguraTotal =
        larguraAntes + larguraCurso;


      const inicioX =
        (largura - larguraTotal) / 2;



      pdf.setFont("helvetica", "normal");
      pdf.setFontSize(12);


      pdf.text(
        textoAntes,
        inicioX,
        114
      );



      pdf.setFont("helvetica", "bold");
      pdf.setFontSize(15);


      pdf.text(
        nomeCurso,
        inicioX + larguraAntes,
        114
      );



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



      const numero =
        String(index + 1).padStart(4, "0");


      pdf.setFontSize(10);


      pdf.text(
        `Certificado nº ${numero}/${new Date().getFullYear()}`,
        largura - 15,
        altura - 10,
        {
          align: "right",
        }
      );

    });



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