"use client";

import { useMemo, useState } from "react";

import HeaderSolicitacao from "./HeaderSolicitacao";
import GrupoMateriais from "./GrupoMateriais";
import MaterialExtra from "./MaterialExtra";
import ResumoSolicitacao from "./ResumoSolicitacao";
import FooterSolicitacao from "./FooterSolicitacao";

interface Material {
  id: string;
  nome_material: string;
  propriedade: string;
  qtde: number | null;
}

export default function MaterialPage() {
  const [curso] = useState<string>("Nenhum curso selecionado");

  // Materiais (por enquanto vazios)
  const [materiaisPermanentes] = useState<Material[]>([]);
  const [materiaisNaoPermanentes] = useState<Material[]>([]);

  // Quantidade escolhida para cada material
  const [quantidades, setQuantidades] = useState<Record<string, number>>({});

  // Observação
  const [observacao, setObservacao] = useState("");

  function alterarQuantidade(id: string, valor: number) {
    setQuantidades((old) => ({
      ...old,
      [id]: valor,
    }));
  }

  const todosMateriais = useMemo<Material[]>(
    () => [...materiaisPermanentes, ...materiaisNaoPermanentes],
    [materiaisPermanentes, materiaisNaoPermanentes]
  );

  async function enviar() {
    const solicitacao = {
      curso,
      observacao,
      materiais: todosMateriais
        .filter((material) => (quantidades[material.id] ?? 0) > 0)
        .map((material) => ({
          id_material: material.id,
          quantidade: quantidades[material.id],
        })),
    };

    console.log(solicitacao);

    // await api.post("/solicitacao-material", solicitacao);
  }

  return (
    <div className="max-w-7xl mx-auto p-6 space-y-6">
      <HeaderSolicitacao curso={curso} />

      <GrupoMateriais
        titulo="Materiais Permanentes"
        materiais={materiaisPermanentes}
        quantidades={quantidades}
        alterarQuantidade={alterarQuantidade}
      />

      <GrupoMateriais
        titulo="Materiais Não Permanentes"
        materiais={materiaisNaoPermanentes}
        quantidades={quantidades}
        alterarQuantidade={alterarQuantidade}
      />

      <MaterialExtra
        valor={observacao}
        alterar={setObservacao}
      />

      <ResumoSolicitacao
        materiais={todosMateriais}
        quantidades={quantidades}
      />

      <FooterSolicitacao enviar={enviar} />
    </div>
  );
}