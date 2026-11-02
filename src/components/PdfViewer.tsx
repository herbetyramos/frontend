
"use client";

import { useEffect, useState } from "react";
import { Document, Page, pdfjs } from "react-pdf";
import { X, ChevronLeft, ChevronRight, ZoomIn, ZoomOut } from "lucide-react";

import "react-pdf/dist/Page/AnnotationLayer.css";
import "react-pdf/dist/Page/TextLayer.css";

pdfjs.GlobalWorkerOptions.workerSrc = new URL(
  "pdfjs-dist/build/pdf.worker.min.mjs",
  import.meta.url
).toString();

interface PdfViewerProps {
  url: string;
  titulo: string;
  onClose: () => void;
}

export default function PdfViewer({
  url,
  titulo,
  onClose,
}: PdfViewerProps) {
  const [totalPaginas, setTotalPaginas] = useState(0);
  const [pagina, setPagina] = useState(1);
  const [zoom, setZoom] = useState(1);
  const [largura, setLargura] = useState(800);
  const [erro, setErro] = useState(false);

  useEffect(() => {
    const atualizarLargura = () => {
      setLargura(Math.min(window.innerWidth - 32, 900));
    };

    atualizarLargura();
    window.addEventListener("resize", atualizarLargura);

    return () => {
      window.removeEventListener("resize", atualizarLargura);
    };
  }, []);

  const anterior = () => {
    setPagina((atual) => Math.max(1, atual - 1));
  };

  const proxima = () => {
    setPagina((atual) => Math.min(totalPaginas, atual + 1));
  };

  return (
    <div className="fixed inset-0 z-100 flex flex-col bg-gray-100 dark:bg-gray-950">
      <header className="flex shrink-0 items-center justify-between gap-2 border-b border-gray-200 bg-white px-3 py-3 dark:border-gray-800 dark:bg-gray-900">
        <div className="min-w-0 flex-1">
          <h2 className="truncate text-sm font-bold text-gray-900 dark:text-gray-100">
            {titulo}
          </h2>
          <p className="text-xs text-gray-500 dark:text-gray-400">
            Visualizador de lista de presença
          </p>
        </div>

        <button
          type="button"
          onClick={onClose}
          aria-label="Fechar PDF"
          className="rounded-lg p-2 text-gray-600 hover:bg-gray-100 dark:text-gray-300 dark:hover:bg-gray-800"
        >
          <X size={22} />
        </button>
      </header>

      <div className="flex shrink-0 items-center justify-center gap-3 border-b border-gray-200 bg-white px-2 py-2 dark:border-gray-800 dark:bg-gray-900">
        <button
          type="button"
          onClick={anterior}
          disabled={pagina <= 1}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-200 dark:hover:bg-gray-800"
          aria-label="Página anterior"
        >
          <ChevronLeft size={21} />
        </button>

        <span className="min-w-90px text-center text-sm text-gray-700 dark:text-gray-200">
          {totalPaginas ? `${pagina} / ${totalPaginas}` : "Carregando"}
        </span>

        <button
          type="button"
          onClick={proxima}
          disabled={!totalPaginas || pagina >= totalPaginas}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-200 dark:hover:bg-gray-800"
          aria-label="Próxima página"
        >
          <ChevronRight size={21} />
        </button>

        <div className="mx-1 h-6 w-px bg-gray-300 dark:bg-gray-700" />

        <button
          type="button"
          onClick={() => setZoom((atual) => Math.max(0.6, atual - 0.1))}
          disabled={zoom <= 0.6}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-200 dark:hover:bg-gray-800"
          aria-label="Diminuir zoom"
        >
          <ZoomOut size={19} />
        </button>

        <span className="min-w-45px text-center text-xs text-gray-600 dark:text-gray-300">
          {Math.round(zoom * 100)}%
        </span>

        <button
          type="button"
          onClick={() => setZoom((atual) => Math.min(2, atual + 0.1))}
          disabled={zoom >= 2}
          className="rounded-lg p-2 text-gray-700 hover:bg-gray-100 disabled:opacity-30 dark:text-gray-200 dark:hover:bg-gray-800"
          aria-label="Aumentar zoom"
        >
          <ZoomIn size={19} />
        </button>
      </div>

      <main className="flex-1 overflow-auto p-3">
        <div className="mx-auto flex w-full justify-center">
          {erro ? (
            <div className="mt-10 max-w-sm rounded-xl bg-white p-6 text-center shadow dark:bg-gray-900">
              <p className="font-semibold text-red-600 dark:text-red-400">
                Não foi possível carregar o PDF.
              </p>
              <p className="mt-2 text-sm text-gray-600 dark:text-gray-400">
                Verifique sua conexão e tente novamente.
              </p>
            </div>
          ) : (
            <Document
              file={url}
              onLoadSuccess={({ numPages }) => {
                setTotalPaginas(numPages);
                setPagina(1);
                setErro(false);
              }}
              onLoadError={(error) => {
                console.error("Erro ao carregar PDF:", error);
                setErro(true);
              }}
              loading={
                <p className="mt-10 text-sm text-gray-600 dark:text-gray-300">
                  Carregando documento...
                </p>
              }
              error={null}
              className="max-w-full"
            >
              <Page
                pageNumber={pagina}
                width={largura}
                scale={zoom}
                renderTextLayer
                renderAnnotationLayer
                className="overflow-hidden rounded shadow-lg"
              />
            </Document>
          )}
        </div>
      </main>
    </div>
  );
}
