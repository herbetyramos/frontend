export type PropriedadeMaterial =
  | "PERMANENTE"
  | "NAO_PERMANENTE";


export interface Curso {
  id:string;
  nome:string;
}


export interface Material {

  id:string;

  id_curso:string;

  nome_material:string;

  qtde?:number;

  propriedade:PropriedadeMaterial;

  curso?:Curso;

}