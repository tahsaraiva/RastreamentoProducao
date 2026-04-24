import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProdutoApiService, ProdutoApi } from '../../../core/services/produto-api.service';
import { LoteApiService, LoteApi } from '../../../core/services/lote-api.service';
import { AuthService } from '../../../core/services/auth.service';

interface ProdutoFiltroView {
  id: string;
  codigo: string;
  nome: string;
  unidade: string;
}

interface LoteView {
  id: string;
  numero: string;
  produtoId: string;
  dataProd: Date;
  turno: 'manha' | 'tarde' | 'noite';
  operador: string;
  qtdProduzida: number;
  status: string;
  produto?: {
    id: string;
    nome: string;
    codigo: string;
    unidade: string;
  };
}

const STATUS_LABELS_LOCAL: Record<string, string> = {
  em_producao: 'Em produção',
  aguardando_inspecao: 'Aguardando inspeção',
  aprovado: 'Aprovado',
  aprovado_restricao: 'Aprovado c/ restrição',
  reprovado: 'Reprovado',
};

const STATUS_CSS_LOCAL: Record<string, string> = {
  em_producao: 'badge-em-producao',
  aguardando_inspecao: 'badge-aguardando-inspecao',
  aprovado: 'badge-aprovado',
  aprovado_restricao: 'badge-aprovado-com-restricao',
  aprovado_com_restricao: 'badge-aprovado-com-restricao',
  reprovado: 'badge-reprovado',
};

const TURNO_LABELS_LOCAL: Record<string, string> = {
  manha: 'Manhã',
  tarde: 'Tarde',
  noite: 'Noite',
};

@Component({
  selector: 'app-lote-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  templateUrl: './lote-list.component.html',
})
export class LoteListComponent implements OnInit {
  private produtoApi = inject(ProdutoApiService);
  private loteApi = inject(LoteApiService);
  private auth = inject(AuthService);

  produtos = signal<ProdutoFiltroView[]>([]);
  allLotes = signal<LoteView[]>([]);
  filtered = signal<LoteView[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  searchTerm = '';
  filterProduto = '';
  filterStatus = '';

  get isInspetor(): boolean {
    return this.auth.perfil() === 'inspetor';
  }

  statusOptions = Object.entries(STATUS_LABELS_LOCAL).map(([value, label]) => ({
    value,
    label,
  }));

  async ngOnInit() {
    try {
      this.loading.set(true);
      this.error.set(null);

      const [produtosApi, lotesApi] = await Promise.all([
        this.produtoApi.list(),
        this.loteApi.list(),
      ]);

      this.produtos.set(
        produtosApi
          .filter((p) => p.ativo)
          .map((p) => ({
            id: String(p.id),
            codigo: p.codigo,
            nome: p.nome,
            unidade: 'unid.',
          }))
      );

      const lotes = lotesApi
        .map((lote) => this.mapLote(lote))
        .sort((a, b) => b.id.localeCompare(a.id));

      this.allLotes.set(lotes);
      this.filtered.set(lotes);
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível carregar os lotes.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  private mapLote(lote: LoteApi): LoteView {
    return {
      id: String(lote.id),
      numero: lote.numeroLote,
      produtoId: String(lote.produto?.id ?? ''),
      dataProd: new Date(lote.dataProducao),
      turno: lote.turno,
      operador: lote.operador?.nome ?? '—',
      qtdProduzida: lote.quantidadeProd,
      status: lote.status,
      produto: lote.produto
        ? {
            id: String(lote.produto.id),
            nome: lote.produto.nome,
            codigo: lote.produto.codigo,
            unidade: 'unid.',
          }
        : undefined,
    };
  }

  applyFilters() {
    let result = this.allLotes();

    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      result = result.filter((l) => l.numero.toLowerCase().includes(q));
    }

    if (this.filterProduto) {
      result = result.filter((l) => l.produtoId === this.filterProduto);
    }

    if (this.filterStatus) {
      result = result.filter((l) => l.status === this.filterStatus);
    }

    this.filtered.set(result);
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterProduto = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  getStatusLabel(status: string) {
    return STATUS_LABELS_LOCAL[status] ?? status;
  }

  getStatusCss(status: string) {
    return STATUS_CSS_LOCAL[status] ?? 'badge';
  }

  turnoLabel(turno: string) {
    return TURNO_LABELS_LOCAL[turno] ?? turno;
  }
}
