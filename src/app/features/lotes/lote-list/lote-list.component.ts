import { Component, inject, OnInit, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Lote, StatusLote, STATUS_LABELS, STATUS_CSS, TURNO_LABELS } from '../../../shared/models';

@Component({
  selector: 'app-lote-list',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="animate-slide-up">
      <!-- Header -->
      <div class="page-header flex items-start justify-between flex-wrap gap-4">
        <div>
          <h1 class="page-title">Lotes de Produção</h1>
          <p class="page-subtitle">{{ filtered().length }} lote(s) encontrado(s)</p>
        </div>
        <a routerLink="/app/lotes/novo" class="btn-primary">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
          </svg>
          Abrir novo lote
        </a>
      </div>

      <!-- Filters -->
      <div class="card mb-6">
        <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          <!-- Search -->
          <div class="lg:col-span-1">
            <label class="form-label">Buscar por número</label>
            <div class="relative">
              <svg class="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
              </svg>
              <input [(ngModel)]="searchTerm" (ngModelChange)="applyFilters()"
                     type="text" placeholder="BT1-..." class="input-field pl-9" />
            </div>
          </div>

          <!-- Produto filter -->
          <div>
            <label class="form-label">Produto</label>
            <select [(ngModel)]="filterProduto" (ngModelChange)="applyFilters()" class="input-field">
              <option value="">Todos os produtos</option>
              @for (p of data.produtos; track p.id) {
                <option [value]="p.id">{{ p.nome }}</option>
              }
            </select>
          </div>

          <!-- Status filter -->
          <div>
            <label class="form-label">Status</label>
            <select [(ngModel)]="filterStatus" (ngModelChange)="applyFilters()" class="input-field">
              <option value="">Todos os status</option>
              @for (s of statusOptions; track s.value) {
                <option [value]="s.value">{{ s.label }}</option>
              }
            </select>
          </div>

          <!-- Clear -->
          <div class="flex items-end">
            <button (click)="clearFilters()" class="btn-secondary w-full justify-center">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M6 18L18 6M6 6l12 12" />
              </svg>
              Limpar filtros
            </button>
          </div>
        </div>
      </div>

      <!-- Table -->
      <div class="card p-0">
        <div class="table-container">
          <table class="table-base">
            <thead>
              <tr>
                <th>Nº do Lote</th>
                <th>Produto</th>
                <th>Turno / Operador</th>
                <th>Qtd. Produzida</th>
                <th>Data Produção</th>
                <th>Status</th>
                <th class="text-right pr-5">Ações</th>
              </tr>
            </thead>
            <tbody>
              @if (filtered().length === 0) {
                <tr>
                  <td colspan="7" class="text-center py-12 text-slate-500">
                    <svg class="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                        d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4" />
                    </svg>
                    Nenhum lote encontrado com os filtros selecionados.
                  </td>
                </tr>
              }
              @for (lote of filtered(); track lote.id) {
                <tr>
                  <td>
                    <span class="font-mono text-xs font-medium text-brand-400">{{ lote.numero }}</span>
                  </td>
                  <td>
                    <p class="text-slate-200 text-xs font-medium">{{ lote.produto?.nome }}</p>
                    <p class="text-slate-500 text-xs">{{ lote.produto?.codigo }}</p>
                  </td>
                  <td>
                    <p class="text-sm text-slate-300">{{ lote.operador }}</p>
                    <p class="text-xs text-slate-500">{{ turnoLabel(lote.turno) }}</p>
                  </td>
                  <td>
                    <span class="font-mono text-sm text-slate-200">{{ lote.qtdProduzida | number:'1.0-0' }}</span>
                    <span class="text-xs text-slate-500 ml-1">{{ lote.produto?.unidade }}</span>
                  </td>
                  <td class="text-sm text-slate-400">{{ lote.dataProd | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <span [class]="getStatusCss(lote.status)">
                      <span class="w-1.5 h-1.5 rounded-full inline-block"
                            [class]="dotClass(lote.status)"></span>
                      {{ getStatusLabel(lote.status) }}
                    </span>
                  </td>
                  <td class="text-right">
                    <div class="flex items-center justify-end gap-2">
                      @if (lote.status === 'em_producao') {
                        <a [routerLink]="['/app/lotes', lote.id, 'insumos']"
                           class="text-xs text-slate-400 hover:text-blue-400 transition-colors px-2 py-1 rounded
                                  hover:bg-blue-400/10">
                          Insumos
                        </a>
                      }
                      @if (lote.status === 'aguardando_inspecao') {
                        <a [routerLink]="['/app/lotes', lote.id, 'inspecao']"
                           class="text-xs text-slate-400 hover:text-yellow-400 transition-colors px-2 py-1 rounded
                                  hover:bg-yellow-400/10">
                          Inspecionar
                        </a>
                      }
                      <a [routerLink]="['/app/lotes', lote.id]"
                         class="btn-secondary px-3 py-1.5 text-xs">
                        Detalhes
                      </a>
                    </div>
                  </td>
                </tr>
              }
            </tbody>
          </table>
        </div>
      </div>
    </div>
  `,
})
export class LoteListComponent implements OnInit {
  data = inject(MockDataService);

  allLotes = signal<Lote[]>([]);
  filtered = signal<Lote[]>([]);

  searchTerm = '';
  filterProduto = '';
  filterStatus = '';

  statusOptions = Object.entries(STATUS_LABELS).map(([value, label]) => ({ value, label }));

  ngOnInit() {
    const lotes = this.data.getLotesComProduto()
      .sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime());
    this.allLotes.set(lotes);
    this.filtered.set(lotes);
  }

  applyFilters() {
    let result = this.allLotes();
    if (this.searchTerm.trim()) {
      const q = this.searchTerm.toLowerCase();
      result = result.filter(l => l.numero.toLowerCase().includes(q));
    }
    if (this.filterProduto) {
      result = result.filter(l => l.produtoId === this.filterProduto);
    }
    if (this.filterStatus) {
      result = result.filter(l => l.status === this.filterStatus);
    }
    this.filtered.set(result);
  }

  clearFilters() {
    this.searchTerm = '';
    this.filterProduto = '';
    this.filterStatus = '';
    this.applyFilters();
  }

  getStatusLabel(s: string) { return STATUS_LABELS[s as StatusLote] ?? s; }
  getStatusCss(s: string) { return STATUS_CSS[s as StatusLote] ?? 'badge'; }
  turnoLabel(t: string) { return TURNO_LABELS[t as keyof typeof TURNO_LABELS] ?? t; }

  dotClass(s: StatusLote) {
    const map: Record<StatusLote, string> = {
      em_producao: 'bg-blue-400',
      aguardando_inspecao: 'bg-yellow-400',
      aprovado: 'bg-emerald-400',
      aprovado_com_restricao: 'bg-orange-400',
      reprovado: 'bg-red-400',
    };
    return map[s] ?? 'bg-slate-400';
  }
}
