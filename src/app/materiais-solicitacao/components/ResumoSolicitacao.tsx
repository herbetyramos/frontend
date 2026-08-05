interface Material {
  id: string;
  nome_material: string;
  propriedade: string;
  qtde: number | null;
}

interface Props {
  materiais: Material[];
  quantidades: Record<string, number>;
}

export default function ResumoSolicitacao({
  materiais,
  quantidades,
}: Props) {

  const lista = materiais.filter(
    (item) => (quantidades[item.id] || 0) > 0
  );

  return (
    <div className="border rounded-lg p-4 bg-gray-50">
      <h2 className="font-bold text-lg mb-3">
        Resumo da Solicitação
      </h2>

      {lista.length === 0 ? (
        <p>Nenhum material selecionado</p>
      ) : (
        lista.map((item) => (
          <div
            key={item.id}
            className="flex justify-between border-b py-2"
          >
            <span>{item.nome_material}</span>

            <span>Qtd: {quantidades[item.id]}</span>
          </div>
        ))
      )}
    </div>
  );
}