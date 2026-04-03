// ─── Enums ──────────────────────────────────────────────────────────────────

export type StatusLote =
  | 'em_producao'
  | 'aguardando_inspecao'
  | 'aprovado'
  | 'aprovado_com_restricao'
  | 'reprovado';

export type ResultadoInspecao =
  | 'aprovado'
  | 'aprovado_com_restricao'
  | 'reprovado';

export type Turno = 'manha' | 'tarde' | 'noite';

// ─── Entities ────────────────────────────────────────────────────────────────

export interface Produto {
  id: string;
  codigo: string;
  nome: string;
  descricao?: string;
  unidade: string;
  createdAt: Date;
}

export interface Lote {
  id: string;
  numero: string;         // gerado automaticamente: BTx-YYYYMMDD-NNNN
  produtoId: string;
  produto?: Produto;
  dataProd: Date;
  turno: Turno;
  operador: string;
  qtdProduzida: number;
  qtdReprovada?: number;
  status: StatusLote;
  observacoes?: string;
  insumos?: InsumoLote[];
  inspecao?: InspecaoLote;
  createdAt: Date;
  updatedAt: Date;
}

export interface InsumoLote {
  id: string;
  loteId: string;
  nomeInsumo: string;
  codigoInsumo: string;
  loteInsumo: string;     // número do lote do insumo (externo)
  quantidade: number;
  unidade: string;
  fornecedor?: string;
  createdAt: Date;
}

export interface InspecaoLote {
  id: string;
  loteId: string;
  inspetor: string;
  dataInspecao: Date;
  resultado: ResultadoInspecao;
  qtdReprovada?: number;
  desvio?: string;
  observacoes?: string;
  createdAt: Date;
}

// ─── Auth ─────────────────────────────────────────────────────────────────────

export interface User {
  id: string;
  nome: string;
  email: string;
  perfil: 'admin' | 'operador' | 'inspetor' | 'gestor';
  avatar?: string;
}

export interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
}

// ─── DTOs / Forms ────────────────────────────────────────────────────────────

export interface LoteForm {
  produtoId: string;
  dataProd: string;
  turno: Turno;
  operador: string;
  qtdProduzida: number;
  observacoes?: string;
}

export interface InsumoForm {
  nomeInsumo: string;
  codigoInsumo: string;
  loteInsumo: string;
  quantidade: number;
  unidade: string;
  fornecedor?: string;
}

export interface InspecaoForm {
  inspetor: string;
  resultado: ResultadoInspecao;
  qtdReprovada?: number;
  desvio?: string;
  observacoes?: string;
}

// ─── Dashboard ───────────────────────────────────────────────────────────────

export interface DashboardMetrics {
  lotesHoje: number;
  unidadesHoje: number;
  taxaAprovacaoMes: number;
  lotesAguardandoInspecao: number;
}

// ─── Rastreabilidade ─────────────────────────────────────────────────────────

export interface ResultadoRastreabilidade {
  tipo: 'lote' | 'insumo';
  lote?: Lote;
  insumos?: InsumoLote[];
  lotesAfetados?: Lote[];
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

export const STATUS_LABELS: Record<StatusLote, string> = {
  em_producao: 'Em produção',
  aguardando_inspecao: 'Aguardando inspeção',
  aprovado: 'Aprovado',
  aprovado_com_restricao: 'Aprovado c/ restrição',
  reprovado: 'Reprovado',
};

export const STATUS_CSS: Record<StatusLote, string> = {
  em_producao: 'badge-em-producao',
  aguardando_inspecao: 'badge-aguardando-inspecao',
  aprovado: 'badge-aprovado',
  aprovado_com_restricao: 'badge-aprovado-com-restricao',
  reprovado: 'badge-reprovado',
};

export const TURNO_LABELS: Record<Turno, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
};

export const RESULTADO_LABELS: Record<ResultadoInspecao, string> = {
  aprovado: 'Aprovado',
  aprovado_com_restricao: 'Aprovado com restrição',
  reprovado: 'Reprovado',
};
