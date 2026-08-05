export interface CursoType {

  id: string;

  nome_curso: string;

}


export interface ProfessorType {

  id: string;

  nome: string;

}


export interface SalaType {

  id: string;

  nome: string;

}


export interface LocalType {

  id: string;

  nome: string;

}


export interface FormaturaType {

  id: string;

  data_formatura: string;

}


export interface DetentoraType {

  id: string;

  cursos_id: string;

  curso?: CursoType;

}


export interface CronogramaType {

  id: string;

  codigo: number;

  tema: string;

  data_inicio: string;

  data_fim: string;

  hora_inicio: string;

  hora_fim: string;


  professor?: ProfessorType | null;


  salaAula?: SalaType;


  localAula?: LocalType;


  formatura?: FormaturaType;


  detentoras?: DetentoraType | null;

}



export interface MatriculaType {

  id: string;

  id_cronograma: string;

  id_aluno: string;

  confirmacao_curso: boolean;

  confirmacao_formatura: boolean;

  aprovado: boolean;

  justificativa?: string | null;


  aluno: AlunoType;

}



export interface AlunoType {

  id?: string;

  CPF: string;

  nome: string;

  celular?: string;

  email?: string;

  Telefone_recado?: string;
  
  telefone_recado?: string;

}



export interface MatriculaType {

  id: string;

  aluno: AlunoType;

}

export interface MaterialType {

  id: string;

  nome_material: string;

  qtde: number | null;

  propriedade: string;

}



export interface DadosCronogramaType {

  cronograma: CronogramaType;

  materiais: MaterialType[];

  matriculas: MatriculaType[];

}