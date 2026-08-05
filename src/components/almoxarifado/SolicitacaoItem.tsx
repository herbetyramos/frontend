interface Props{
    solicitacao: SolicitacaoMaterial;
    onEntregar:(id:string)=>void;
}

export function SolicitacaoItem({solicitacao,onEntregar}:Props){

    return(

        <tr>

            <td>{solicitacao.curso.nome_curso}</td>

            <td>{solicitacao.material.nome_material}</td>

            <td>{solicitacao.quantidade}</td>

            <td>{solicitacao.material.propriedade}</td>

            <td>{solicitacao.status}</td>

            <td>

                {solicitacao.status==="PENDENTE" &&(

                    <button
                        onClick={()=>onEntregar(solicitacao.id)}
                    >
                        Entregar
                    </button>

                )}

            </td>

        </tr>

    )

}