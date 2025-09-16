export interface CtUser {
  id?: number
  nome: string
  username: string
  senha?: string
  created_at?: string
}

export interface CtPeso {
  id?: number
  user_id?: number
  peso: number
  data: string
  created_at?: string
}

export interface CtRefeicao {
  id?: number
  user_id?: number
  nome: string
  descricao?: string
  calorias?: number
  tipo: 'cafe_da_manha' | 'almoco' | 'lanche' | 'jantar' | 'outro'
  data: string
  horario: string
  imagem_url?: string
  created_at?: string
}