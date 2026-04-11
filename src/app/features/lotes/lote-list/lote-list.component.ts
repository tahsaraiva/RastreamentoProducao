import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { ProdutoApiService, ProdutoApi } from '../../../core/services/produto-api.service';
import { LoteApiService, LoteApi } from '../../../core/services/lote-api.service';

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
  aprovado_com_restricao: 'Aprovado c/ restrição',
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
  template: `
    <section class="space-y-6">
      <div class="flex items-center justify-between">
        <div>
          <h1 class="text-2xl font-bold text-white">Lotes de Produção</h1>
          <p class="text-sm text-slate-400">
            {{ filtered().length }} lote(s) encontrado(s)
          </p>
        </div>

        <a
          routerLink="/app/lotes/novo"
          class="rounded-xl bg-cyan-500 px-4 py-2 text-sm font-semibold text-slate-950 hover:bg-cyan-400"
        >
          Abrir novo lote
        </a>
      </div>

      @if (loading()) {
        <div class="rounded-2xl border border-slate-800 bg-slate-900 p-6 text-slate-300">
          Carregando lotes...
        </div>
      }

      @if (error()) {
        <div class="rounded-2xl border border-red-900 bg-red-950/40 p-4 text-red-300">
          {{ error() }}
        </div>
      }

      <div class="grid gap-4 rounded-2xl border border-slate-800 bg-slate-900 p-5 md:grid-cols-4">
        <div>
          <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Buscar por número
          </label>
          <input
            [(ngModel)]="searchTerm"
            (ngModelChange)="applyFilters()"
            type="text"
            placeholder="Ex: LOT-2026-00001"
            class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
          />
        </div>

        <div>
          <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Produto
          </label>
          <select
            [(ngModel)]="filterProduto"
            (ngModelChange)="applyFilters()"
            class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="">Todos os produtos</option>
            @for (p of produtos(); track p.id) {
              <option [value]="p.id">{{ p.nome }}</option>
            }
          </select>
        </div>

        <div>
          <label class="mb-2 block text-xs font-medium uppercase tracking-wide text-slate-500">
            Status
          </label>
          <select
            [(ngModel)]="filterStatus"
            (ngModelChange)="applyFilters()"
            class="w-full rounded-xl border border-slate-700 bg-slate-950 px-3 py-2 text-sm text-white outline-none"
          >
            <option value="">Todos os status</option>
            @for (s of statusOptions; track s.value) {
              <option [value]="s.value">{{ s.label }}</option>
            }
          </select>
        </div>

        <div class="flex items-end">
          <button
            type="button"
            (click)="clearFilters()"
            class="w-full rounded-xl border border-slate-700 px-3 py-2 text-sm font-medium text-slate-200 hover:bg-slate-800"
          >
            Limpar filtros
          </button>
        </div>
      </div>

      <div class="rounded-2xl border border-slate-800 bg-slate-900 p-5">
        @if (filtered().length === 0) {
          <div class="rounded-xl border border-slate-800 bg-slate-950 p-6 text-center text-slate-400">
            Nenhum lote encontrado com os filtros selecionados.
          </div>
        } @else {
          <div class="overflow-x-auto">
            <table class="min-w-full divide-y divide-slate-800">
              <thead>
                <tr class="text-left text-xs uppercase tracking-wide text-slate-500">
                  <th class="py-3 pr-4">Nº do Lote</th>
                  <th class="py-3 pr-4">Produto</th>
                  <th class="py-3 pr-4">Turno / Operador</th>
                  <th class="py-3 pr-4">Qtd. Produzida</th>
                  <th class="py-3 pr-4">Data Produção</th>
                  <th class="py-3 pr-4">Status</th>
                  <th class="py-3 pr-4">Ações</th>
                </tr>
              </thead>

              <tbody class="divide-y divide-slate-800 text-sm text-slate-300">
                @for (lote of filtered(); track lote.id) {
                  <tr>
                    <td class="py-4 pr-4 font-medium text-white">
                      {{ lote.numero }}
                    </td>

                    <td class="py-4 pr-4">
                      <div class="font-medium text-white">{{ lote.produto?.nome }}</div>
                      <div class="text-xs text-slate-500">{{ lote.produto?.codigo }}</div>
                    </td>

                    <td class="py-4 pr-4">
                      <div>{{ lote.operador }}</div>
                      <div class="text-xs text-slate-500">{{ turnoLabel(lote.turno) }}</div>
                    </td>

                    <td class="py-4 pr-4">
                      {{ lote.qtdProduzida | number:'1.0-0' }} {{ lote.produto?.unidade }}
                    </td>

                    <td class="py-4 pr-4">
                      {{ lote.dataProd | date:'dd/MM/yyyy' }}
                    </td>

                    <td class="py-4 pr-4">
                      <span
                        class="rounded-full px-2 py-1 text-xs font-medium"
                        [ngClass]="getStatusCss(lote.status)"
                      >
                        {{ getStatusLabel(lote.status) }}
                      </span>
                    </td>

                    <td class="py-4 pr-4">
                      <div class="flex gap-2">
                        @if (lote.status === 'em_producao') {
                          <a
                            [routerLink]="['/app/lotes', lote.id, 'insumos']"
                            class="text-xs font-medium text-cyan-400 hover:text-cyan-300"
                          >
                            Insumos
                          </a>
                        }

                        @if (lote.status === 'aguardando_inspecao') {
                          <a
                            [routerLink]="['/app/lotes', lote.id, 'inspecao']"
                            class="text-xs font-medium text-amber-400 hover:text-amber-300"
                          >
                            Inspecionar
                          </a>
                        }

                        <a
                          [routerLink]="['/app/lotes', lote.id]"
                          class="text-xs font-medium text-white hover:text-cyan-300"
                        >
                          Detalhes
                        </a>
                      </div>
                    </td>
                  </tr>
                }
              </tbody>
            </table>
          </div>
        }
      </div>
    </section>
  `,
})
export class LoteListComponent implements OnInit {
  private produtoApi = inject(ProdutoApiService);
  private loteApi = inject(LoteApiService);

  produtos = signal<ProdutoFiltroView[]>([]);
  allLotes = signal<LoteView[]>([]);
  filtered = signal<LoteView[]>([]);
  loading = signal(true);
  error = signal<string | null>(null);

  searchTerm = '';
  filterProduto = '';
  filterStatus = '';

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
