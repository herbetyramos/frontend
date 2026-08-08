
"use client";

import { Suspense } from "react";
import PlanejamentoPage from "../components/PlanejamentoPage";

export default function Page() {
  return (
    <Suspense
      fallback={
        <div className="flex min-h-screen items-center justify-center">
          <p className="text-gray-500">
            Carregando planejamento...
          </p>
        </div>
      }
    >
      <PlanejamentoPage />
    </Suspense>
  );
}

