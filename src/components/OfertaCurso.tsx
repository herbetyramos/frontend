"use client";

import { useEffect, useState } from "react";
import axios from "axios";

// Tipagem simples do que sua API retorna
type Oferta = {
  id: string;
  tema: string;
};

export default function OfertaCursoPage() {
  // Tipagem correta evita o erro "never"
  const [ofertas, setOfertas] = useState<Oferta[]>([]);

  const carregar = async () => {
    const resposta = await axios.get<Oferta[]>(
      "http://localhost:3000/ofertacursos"
    );
    setOfertas(resposta.data);
  };

  useEffect(() => {
    carregar();
  }, []);

  return (
    <div>
      <h1>Ofertas de Cursos</h1>

      {ofertas.map((o) => (
        <div key={o.id}>{o.tema}</div>
      ))}
    </div>
  );
}