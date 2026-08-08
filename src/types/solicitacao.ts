
export interface SolicitacaoMaterial {
 
    id: string;
    quantidade: number;
    observacao?: string;
    status: string;

    curso: {
        id: string;
        nome_curso: string;
    };

    material: {
        id: string;
        nome_material: string;
        propriedade: string;
        qtde?: number;
    };
}