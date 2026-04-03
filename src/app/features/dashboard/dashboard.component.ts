import { Component, inject, OnInit, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MockDataService } from '../../core/services/mock-data.service';
import { DashboardMetrics, Lote, STATUS_LABELS, STATUS_CSS } from '../../shared/models';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-slide-up">
      <!-- Header -->
      <div class="page-header flex items-start justify-between">
        <div>
          <h1 class="page-title">Dashboard</h1>
          <p class="page-subtitle">Visão geral da produção em tempo real</p>
        </div>
        <div class="text-right">
          <p class="text-xs text-slate-500">Última atualização</p>
          <p class="text-sm text-slate-300 font-mono">{{ now | date:'dd/MM/yyyy HH:mm' }}</p>
        </div>
      </div>

      <!-- Metric cards -->
      <div class="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-4 gap-4 mb-8">

        <!-- Lotes hoje -->
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Lotes Hoje</p>
            <div class="w-8 h-8 rounded-lg bg-brand-600/15 flex items-center justify-center">
              <svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M20 7l-8-4-8 4m16 0l-8 4m8-4v10l-8 4m0-10L4 7m8 4v10M4 7v10l8 4" />
              </svg>
            </div>
          </div>
          <div>
            <p class="text-3xl font-display font-bold text-slate-50">{{ metrics()?.lotesHoje }}</p>
            <p class="text-xs text-slate-500 mt-1">lotes abertos hoje</p>
          </div>
        </div>

        <!-- Unidades hoje -->
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Unidades Hoje</p>
            <div class="w-8 h-8 rounded-lg bg-emerald-500/15 flex items-center justify-center">
              <svg class="w-4 h-4 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M7 12l3-3 3 3 4-4M8 21l4-4 4 4M3 4h18M4 4h16v12a1 1 0 01-1 1H5a1 1 0 01-1-1V4z" />
              </svg>
            </div>
          </div>
          <div>
            <p class="text-3xl font-display font-bold text-slate-50">
              {{ metrics()?.unidadesHoje | number:'1.0-0' }}
            </p>
            <p class="text-xs text-slate-500 mt-1">unidades produzidas</p>
          </div>
        </div>

        <!-- Taxa de aprovação -->
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Taxa Aprovação/Mês</p>
            <div class="w-8 h-8 rounded-lg flex items-center justify-center"
                 [class]="taxaClass()">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p class="text-3xl font-display font-bold text-slate-50">{{ metrics()?.taxaAprovacaoMes }}%</p>
            <p class="text-xs text-slate-500 mt-1">lotes aprovados no mês</p>
          </div>
          <!-- Mini progress bar -->
          <div class="w-full bg-slate-800 rounded-full h-1.5 mt-1">
            <div class="h-1.5 rounded-full transition-all duration-700"
                 [style.width.%]="metrics()?.taxaAprovacaoMes"
                 [class]="taxaBarClass()"></div>
          </div>
        </div>

        <!-- Aguardando inspeção -->
        <div class="stat-card">
          <div class="flex items-center justify-between">
            <p class="text-xs font-medium text-slate-400 uppercase tracking-wider">Aguard. Inspeção</p>
            <div class="w-8 h-8 rounded-lg bg-yellow-500/15 flex items-center justify-center">
              <svg class="w-4 h-4 text-yellow-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
              </svg>
            </div>
          </div>
          <div>
            <p class="text-3xl font-display font-bold text-slate-50">
              {{ metrics()?.lotesAguardandoInspecao }}
            </p>
            <p class="text-xs text-slate-500 mt-1">lotes pendentes</p>
          </div>
          @if ((metrics()?.lotesAguardandoInspecao ?? 0) > 0) {
            <a routerLink="/app/lotes" class="text-xs text-yellow-400 hover:text-yellow-300 transition-colors flex items-center gap-1 mt-1">
              Ver lotes pendentes
              <svg class="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
              </svg>
            </a>
          }
        </div>
      </div>

      <!-- Recent lots table -->
      <div class="card">
        <div class="flex items-center justify-between mb-5">
          <h2 class="section-title mb-0">Últimos 10 lotes registrados</h2>
          <a routerLink="/app/lotes" class="text-sm text-brand-400 hover:text-brand-300 transition-colors flex items-center gap-1">
            Ver todos
            <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M9 5l7 7-7 7" />
            </svg>
          </a>
        </div>

        <div class="table-container">
          <table class="table-base">
            <thead>
              <tr>
                <th>Nº do Lote</th>
                <th>Produto</th>
                <th>Operador</th>
                <th>Qtd. Produzida</th>
                <th>Data</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              @for (lote of recentLotes(); track lote.id) {
                <tr>
                  <td>
                    <span class="font-mono text-xs text-brand-400">{{ lote.numero }}</span>
                  </td>
                  <td>
                    <div>
                      <p class="text-slate-200 font-medium text-xs">{{ lote.produto?.nome }}</p>
                      <p class="text-slate-500 text-xs">{{ lote.produto?.codigo }}</p>
                    </div>
                  </td>
                  <td class="text-slate-300 text-sm">{{ lote.operador }}</td>
                  <td>
                    <span class="font-mono text-sm">{{ lote.qtdProduzida | number:'1.0-0' }}</span>
                    <span class="text-slate-500 text-xs ml-1">{{ lote.produto?.unidade }}</span>
                  </td>
                  <td class="text-slate-400 text-sm">{{ lote.dataProd | date:'dd/MM/yyyy' }}</td>
                  <td>
                    <span [class]="getStatusCss(lote.status)">
                      {{ getStatusLabel(lote.status) }}
                    </span>
                  </td>
                  <td>
                    <a [routerLink]="['/app/lotes', lote.id]"
                       class="text-slate-500 hover:text-brand-400 transition-colors text-xs">
                      Ver →
                    </a>
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
export class DashboardComponent implements OnInit {
  private data = inject(MockDataService);

  metrics = signal<DashboardMetrics | null>(null);
  recentLotes = signal<Lote[]>([]);
  now = new Date();

  ngOnInit() {
    this.metrics.set(this.data.getDashboardMetrics());
    const lotes = this.data.getLotesComProduto();
    this.recentLotes.set([...lotes].sort((a, b) => b.createdAt.getTime() - a.createdAt.getTime()).slice(0, 10));
  }

  getStatusLabel(s: string) { return STATUS_LABELS[s as keyof typeof STATUS_LABELS] ?? s; }
  getStatusCss(s: string) { return STATUS_CSS[s as keyof typeof STATUS_CSS] ?? 'badge'; }

  taxaClass() {
    const t = this.metrics()?.taxaAprovacaoMes ?? 0;
    if (t >= 90) return 'bg-emerald-500/15 text-emerald-400';
    if (t >= 70) return 'bg-yellow-500/15 text-yellow-400';
    return 'bg-red-500/15 text-red-400';
  }

  taxaBarClass() {
    const t = this.metrics()?.taxaAprovacaoMes ?? 0;
    if (t >= 90) return 'bg-emerald-500';
    if (t >= 70) return 'bg-yellow-500';
    return 'bg-red-500';
  }
}
