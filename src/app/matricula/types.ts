export interface CursoType {
  id: string;
  nome_curso: string;

  segmento?: {
    id: string;
    name: string;
  } | null;
}


export interface ProfessorType {
  id?: string;

  nome_professor: string;

  telefone?: string;

  Endereco?: string;

  bairro?: string;

  Numero?: string;

  contato?: string;

  CPF?: string;

  especialidade?: string;

  foto?: string | null;
}


export interface SalaType {
  id?: string;

  numero_sala: string;

  tipo_uso?: string;
}


export interface LocalType {
  id?: string;

  polo: string;

  Telefone?: string;

  Telefone2?: string;
}


export interface FormaturaType {
  id?: string;

  data_formatura: string;

  local?: string;
}


export interface DetentoraType {

  id?: string;

  ata_id?: string | null;

  cursos_id: string;

  quantidade_turma?: number | null;


  curso?: CursoType | null;


  ata?: {

    id: string;

    numero_ata: string;


    empresa?: {

      id?: string;

      nome_empresa: string;

    } | null;


  } | null;

}



export interface BlocoCursoType {

  id?: string;

  bloco_Curso: string;

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


  salaAula?: SalaType | null;


  localAula?: LocalType | null;


  formatura?: FormaturaType | null;


  detentoras?: DetentoraType | null;


  bloco_curso?: BlocoCursoType | null;

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


  id_cronograma?: string;


  id_aluno?: string;


  confirmacao_curso?: boolean;


  confirmacao_formatura?: boolean;


  aprovado?: boolean;


  justificativa?: string | null;


  aluno?: AlunoType | null;

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
