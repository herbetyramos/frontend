"use client";

import { useEffect, useState } from "react";
import { api } from "@/services/api";

interface Props {
  value: string;
  onChange: (idCurso: string) => void;
}

type Detentora = {
  id: string;
  cursos_id: string;

  curso: {
    id: string;
    nome_curso: string;
  };

  ata: {
    id: string;
    numero_ata: string;
  } | null;
};

export default function DetentoraSelect({
  value,
  onChange,
}: Props) {
  const [detentoras, setDetentoras] = useState<Detentora[]>([]);

  useEffect(() => {
    async function load() {
      try {
        const response = await api.get("/detentora");
        setDetentoras(response.data);
      } catch (err) {
        console.error("Erro ao carregar detentoras", err);
      }
    }

    load();
  }, []);

  return (
    <select
      value={value}
      onChange={(e) => onChange(e.target.value)}
      className="w-full border rounded px-3 py-2"
    >
      <option value="">
        Selecione o curso
      </option>

      {detentoras.map((d) => (
        <option
          key={d.id}
          value={d.curso.id}
        >
          {d.curso.nome_curso} — ATA {d.ata?.numero_ata ?? "Sem ATA"}
        </option>
      ))}
    </select>
  );
}