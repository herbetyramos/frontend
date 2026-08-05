"use client";

interface Props {
  confirmacaoCurso: boolean;

  setConfirmacaoCurso: (
    valor: boolean
  ) => void;

  confirmacaoFormatura: boolean;
  setConfirmacaoFormatura: (
    valor: boolean
  ) => void;

  aprovado: boolean;
  setAprovado: (
    valor: boolean
  ) => void;

  justificativa: string;

  setJustificativa: (
    valor: string
  ) => void;

}


export default function ConfirmacaoMatricula({

  confirmacaoCurso,

  setConfirmacaoCurso,

  confirmacaoFormatura,

  setConfirmacaoFormatura,

  aprovado,

  setAprovado,

  justificativa,

  setJustificativa


}: Props) {



  return (


   <div className="grid grid-cols-3 md:grid-cols-2 xl:grid-cols-2 gap-2">

      
      <div className="grid grid-cols-1 md:grid-cols-3 gap-1">

    <div  className="border-0 rounded-lg p-4">
  

        <label className="flex items-center gap-2">      
          <input
            type="checkbox"
            checked={confirmacaoCurso}
            onChange={(e)=>
              setConfirmacaoCurso(
                e.target.checked
              )
            }
          />
          Curso confirmado
        </label>
        </div>
        <div className="border-0 rounded-lg p-4">
              <label className="flex items-center gap-2">
              <input
                    type="checkbox"
                    checked={aprovado}
                    onChange={(e)=>
                    setAprovado(
                    e.target.checked
                    )
                    }
              />
                  Aprovado no curso
                </label>
            </div>    

            <div className="border-0 rounded-lg p-4">
                  <label className="flex items-center gap-2">
                     <input

                        type="checkbox"
                        checked={confirmacaoFormatura}
                        onChange={(e)=>
                        setConfirmacaoFormatura(
                        e.target.checked
                        )
                        }
            />
          Presença na formatura
          </label>        
        </div>
        
        </div>         

        <div>
                <textarea
                value={justificativa}
                onChange={(e)=>
                setJustificativa(
                e.target.value
              )

            }



            rows={1}


            placeholder="Digite uma observação..."


            className="
              w-full
              border
              rounded-lg
              p-3
            "



          />


        </div>



      </div>



    


  );

}