import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Lote, STATUS_LABELS, STATUS_CSS, TURNO_LABELS, RESULTADO_LABELS } from '../../../shared/models';

@Component({
  selector: 'app-lote-detail',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="animate-slide-up max-w-4xl">
      <a routerLink="/app/lotes" class="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-4 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para lotes
      </a>

      @if (!lote()) {
        <div class="card text-center py-16 text-slate-500">Lote não encontrado.</div>
      } @else {
        <!-- Header -->
        <div class="flex items-start justify-between flex-wrap gap-4 mb-6">
          <div>
            <div class="flex items-center gap-3 mb-1">
              <h1 class="font-display text-2xl font-bold text-slate-50 font-mono">{{ lote()!.numero }}</h1>
              <span [class]="getStatusCss(lote()!.status)">{{ getStatusLabel(lote()!.status) }}</span>
            </div>
            <p class="text-slate-400 text-sm">{{ lote()!.produto?.nome }}</p>
          </div>

          <!-- Actions -->
          <div class="flex items-center gap-2 flex-wrap">
            @if (lote()!.status === 'em_producao') {
              <a [routerLink]="['/app/lotes', lote()!.id, 'insumos']" class="btn-secondary">
                🔗 Gerenciar insumos
              </a>
              <button (click)="encerrarLote()" class="btn-primary">
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                Encerrar lote
              </button>
            }
            @if (lote()!.status === 'aguardando_inspecao') {
              <a [routerLink]="['/app/lotes', lote()!.id, 'inspecao']" class="btn-primary">
                🔬 Registrar inspeção
              </a>
            }
          </div>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">

          <!-- Left: main data -->
          <div class="lg:col-span-2 space-y-6">

            <!-- Lote data -->
            <div class="card">
              <h2 class="section-title">Dados do lote</h2>
              <dl class="grid grid-cols-2 gap-x-6 gap-y-4">
                <div>
                  <dt class="text-xs text-slate-500 uppercase tracking-wider mb-1">Produto</dt>
                  <dd class="text-sm text-slate-200 font-medium">{{ lote()!.produto?.nome }}</dd>
                  <dd class="text-xs text-slate-500">{{ lote()!.produto?.codigo }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-slate-500 uppercase tracking-wider mb-1">Data de Produção</dt>
                  <dd class="text-sm text-slate-200">{{ lote()!.dataProd | date:'dd/MM/yyyy' }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-slate-500 uppercase tracking-wider mb-1">Turno</dt>
                  <dd class="text-sm text-slate-200">{{ turnoLabel(lote()!.turno) }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-slate-500 uppercase tracking-wider mb-1">Operador</dt>
                  <dd class="text-sm text-slate-200">{{ lote()!.operador }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-slate-500 uppercase tracking-wider mb-1">Qtd. Produzida</dt>
                  <dd class="text-sm text-slate-200 font-mono font-medium">
                    {{ lote()!.qtdProduzida | number:'1.0-0' }}
                    <span class="text-slate-500 font-sans font-normal">{{ lote()!.produto?.unidade }}</span>
                  </dd>
                </div>
                @if (lote()!.qtdReprovada) {
                  <div>
                    <dt class="text-xs text-slate-500 uppercase tracking-wider mb-1">Qtd. Reprovada</dt>
                    <dd class="text-sm text-red-400 font-mono font-medium">
                      {{ lote()!.qtdReprovada | number:'1.0-0' }}
                    </dd>
                  </div>
                }
                <div>
                  <dt class="text-xs text-slate-500 uppercase tracking-wider mb-1">Abertura</dt>
                  <dd class="text-sm text-slate-200">{{ lote()!.createdAt | date:'dd/MM/yyyy HH:mm' }}</dd>
                </div>
                <div>
                  <dt class="text-xs text-slate-500 uppercase tracking-wider mb-1">Última atualização</dt>
                  <dd class="text-sm text-slate-200">{{ lote()!.updatedAt | date:'dd/MM/yyyy HH:mm' }}</dd>
                </div>
              </dl>
              @if (lote()!.observacoes) {
                <div class="mt-4 pt-4 border-t border-slate-800">
                  <dt class="text-xs text-slate-500 uppercase tracking-wider mb-1">Observações</dt>
                  <dd class="text-sm text-slate-300">{{ lote()!.observacoes }}</dd>
                </div>
              }
            </div>

            <!-- Insumos -->
            <div class="card">
              <div class="flex items-center justify-between mb-4">
                <h2 class="section-title mb-0">
                  Insumos vinculados
                  <span class="text-slate-500 font-normal text-sm">({{ lote()!.insumos?.length ?? 0 }})</span>
                </h2>
                @if (lote()!.status === 'em_producao') {
                  <a [routerLink]="['/app/lotes', lote()!.id, 'insumos']" class="btn-secondary text-xs px-3 py-1.5">
                    + Adicionar
                  </a>
                }
              </div>

              @if (!lote()!.insumos || lote()!.insumos!.length === 0) {
                <div class="text-center py-8 text-slate-500 text-sm">
                  Nenhum insumo vinculado a este lote.
                </div>
              } @else {
                <div class="space-y-2">
                  @for (ins of lote()!.insumos; track ins.id) {
                    <div class="flex items-center gap-4 px-4 py-3 bg-slate-800/50 rounded-lg border border-slate-800">
                      <div class="flex-1 min-w-0">
                        <p class="text-sm font-medium text-slate-200">{{ ins.nomeInsumo }}</p>
                        <p class="text-xs text-slate-500">
                          {{ ins.codigoInsumo }} · Lote: <span class="font-mono text-slate-400">{{ ins.loteInsumo }}</span>
                        </p>
                      </div>
                      <div class="text-right flex-shrink-0">
                        <p class="text-sm font-mono text-slate-200">{{ ins.quantidade }} {{ ins.unidade }}</p>
                        @if (ins.fornecedor) {
                          <p class="text-xs text-slate-500">{{ ins.fornecedor }}</p>
                        }
                      </div>
                    </div>
                  }
                </div>
              }
            </div>
          </div>

          <!-- Right: inspeção + rastreabilidade -->
          <div class="space-y-6">

            <!-- Inspeção -->
            <div class="card">
              <h2 class="section-title">Inspeção de Qualidade</h2>

              @if (!lote()!.inspecao) {
                <div class="text-center py-6">
                  @if (lote()!.status === 'aguardando_inspecao') {
                    <div class="badge-aguardando-inspecao mb-3 mx-auto w-fit">Pendente</div>
                    <p class="text-sm text-slate-500 mb-4">Este lote está aguardando inspeção.</p>
                    <a [routerLink]="['/app/lotes', lote()!.id, 'inspecao']" class="btn-primary w-full justify-center">
                      Registrar inspeção
                    </a>
                  } @else {
                    <p class="text-sm text-slate-500">Inspeção não realizada ainda.</p>
                  }
                </div>
              } @else {
                <dl class="space-y-3">
                  <div>
                    <dt class="text-xs text-slate-500 uppercase tracking-wider mb-1">Resultado</dt>
                    <dd>
                      <span [class]="resultadoCss(lote()!.inspecao!.resultado)">
                        {{ resultadoLabel(lote()!.inspecao!.resultado) }}
                      </span>
                    </dd>
                  </div>
                  <div>
                    <dt class="text-xs text-slate-500 uppercase tracking-wider mb-1">Inspetor</dt>
                    <dd class="text-sm text-slate-300">{{ lote()!.inspecao!.inspetor }}</dd>
                  </div>
                  <div>
                    <dt class="text-xs text-slate-500 uppercase tracking-wider mb-1">Data</dt>
                    <dd class="text-sm text-slate-300">{{ lote()!.inspecao!.dataInspecao | date:'dd/MM/yyyy HH:mm' }}</dd>
                  </div>
                  @if (lote()!.inspecao!.qtdReprovada) {
                    <div>
                      <dt class="text-xs text-slate-500 uppercase tracking-wider mb-1">Qtd. Reprovada</dt>
                      <dd class="text-sm text-red-400 font-mono">{{ lote()!.inspecao!.qtdReprovada }}</dd>
                    </div>
                  }
                  @if (lote()!.inspecao!.desvio) {
                    <div>
                      <dt class="text-xs text-slate-500 uppercase tracking-wider mb-1">Desvio</dt>
                      <dd class="text-sm text-slate-300 leading-relaxed">{{ lote()!.inspecao!.desvio }}</dd>
                    </div>
                  }
                </dl>
              }
            </div>

            <!-- Rastreabilidade shortcut -->
            <div class="card bg-brand-600/5 border-brand-600/20">
              <h2 class="section-title">Rastreabilidade</h2>
              <p class="text-xs text-slate-400 mb-4">
                Consulte a árvore completa de insumos ou veja todos os lotes que usaram os mesmos insumos.
              </p>
              <a routerLink="/app/rastreabilidade"
                 [queryParams]="{ q: lote()!.numero }"
                 class="btn-primary w-full justify-center text-sm">
                🔍 Rastrear este lote
              </a>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class LoteDetailComponent implements OnInit {
  @Input() id!: string;

  private data = inject(MockDataService);
  private router = inject(Router);

  lote = signal<Lote | null>(null);

  ngOnInit() {
    const l = this.data.getLoteCompleto(this.id);
    this.lote.set(l ?? null);
  }

  encerrarLote() {
    const l = this.lote();
    if (!l) return;
    const idx = this.data.lotes.findIndex(x => x.id === l.id);
    if (idx >= 0) {
      this.data.lotes[idx] = { ...this.data.lotes[idx], status: 'aguardando_inspecao', updatedAt: new Date() };
    }
    this.lote.set({ ...l, status: 'aguardando_inspecao', updatedAt: new Date() });
  }

  getStatusLabel(s: string) { return STATUS_LABELS[s as keyof typeof STATUS_LABELS] ?? s; }
  getStatusCss(s: string) { return STATUS_CSS[s as keyof typeof STATUS_CSS] ?? 'badge'; }
  turnoLabel(t: string) { return TURNO_LABELS[t as keyof typeof TURNO_LABELS] ?? t; }
  resultadoLabel(r: string) { return RESULTADO_LABELS[r as keyof typeof RESULTADO_LABELS] ?? r; }
  resultadoCss(r: string) {
    const map: Record<string, string> = {
      aprovado: 'badge-aprovado',
      aprovado_com_restricao: 'badge-aprovado-com-restricao',
      reprovado: 'badge-reprovado',
    };
    return map[r] ?? 'badge';
  }
}
