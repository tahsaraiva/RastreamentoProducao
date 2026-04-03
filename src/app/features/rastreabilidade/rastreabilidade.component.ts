import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, ActivatedRoute } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { Lote, InsumoLote, STATUS_LABELS, STATUS_CSS, RESULTADO_LABELS } from '../../shared/models';


type SearchMode = 'lote' | 'insumo';

interface RastreioLote {
  lote: Lote;
  insumos: InsumoLote[];
}

interface RastreioInsumo {
  codigoOuLote: string;
  insumosEncontrados: InsumoLote[];
  lotesAfetados: Array<{ lote: Lote; insumo: InsumoLote }>;
}

@Component({
  selector: 'app-rastreabilidade',
  standalone: true,
  imports: [CommonModule, RouterLink, FormsModule],
  template: `
    <div class="animate-slide-up">
      <!-- Header -->
      <div class="page-header">
        <h1 class="page-title">Consulta de Rastreabilidade</h1>
        <p class="page-subtitle">Rastreie insumos por lote ou identifique lotes afetados por um insumo</p>
      </div>

      <!-- Search box -->
      <div class="card mb-8">
        <div class="flex flex-col sm:flex-row gap-4">
          <div class="flex-1 relative">
            <svg class="absolute left-4 top-1/2 -translate-y-1/2 w-5 h-5 text-slate-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            <input [(ngModel)]="searchQuery"
                   (keyup.enter)="buscar()"
                   type="text"
                   placeholder="Digite o número do lote ou código do insumo..."
                   class="input-field pl-12 text-base py-3 font-mono" />
          </div>
          <button (click)="buscar()" class="btn-primary px-8 py-3 text-base whitespace-nowrap">
            <svg class="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
            </svg>
            Rastrear
          </button>
        </div>

        <!-- Hint chips -->
        <div class="flex flex-wrap gap-2 mt-4">
          <p class="text-xs text-slate-500 self-center">Exemplos rápidos:</p>
          @for (hint of hints; track hint.query) {
            <button (click)="searchQuery = hint.query; buscar()"
              class="text-xs px-3 py-1 rounded-full border border-slate-700 text-slate-400
                     hover:border-brand-500 hover:text-brand-400 transition-all font-mono">
              {{ hint.query }}
            </button>
          }
        </div>
      </div>

      <!-- Results -->
      @if (hasSearched() && !resultLote() && !resultInsumo()) {
        <div class="card text-center py-16 text-slate-500">
          <svg class="w-12 h-12 mx-auto mb-4 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
              d="M9.172 16.172a4 4 0 015.656 0M9 10h.01M15 10h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          <p class="text-lg font-medium text-slate-400 mb-1">Nenhum resultado encontrado</p>
          <p class="text-sm">Verifique o número do lote ou código do insumo e tente novamente.</p>
        </div>
      }

      <!-- Result: Lote -->
      @if (resultLote()) {
        <div class="animate-slide-up space-y-6">
          <!-- Result header -->
          <div class="flex items-center gap-3 mb-2">
            <div class="px-3 py-1 rounded-full text-xs font-medium bg-brand-600/15 text-brand-400 border border-brand-600/25">
              🔍 Rastreio de Lote
            </div>
            <p class="text-slate-400 text-sm">Resultado para <span class="font-mono text-slate-200">{{ searchQuery }}</span></p>
          </div>

          <!-- Lote card -->
          <div class="card border-brand-600/20 bg-brand-600/5">
            <div class="flex items-start justify-between flex-wrap gap-4 mb-5">
              <div>
                <div class="flex items-center gap-3 mb-1">
                  <h2 class="font-display text-xl font-bold text-slate-50 font-mono">
                    {{ resultLote()!.lote.numero }}
                  </h2>
                  <span [class]="getStatusCss(resultLote()!.lote.status)">
                    {{ getStatusLabel(resultLote()!.lote.status) }}
                  </span>
                </div>
                <p class="text-slate-400">{{ resultLote()!.lote.produto?.nome }}</p>
              </div>
              <a [routerLink]="['/app/lotes', resultLote()!.lote.id]" class="btn-secondary text-sm">
                Ver lote completo →
              </a>
            </div>

            <div class="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
              <div>
                <p class="text-xs text-slate-500 uppercase tracking-wider mb-1">Operador</p>
                <p class="text-slate-200">{{ resultLote()!.lote.operador }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 uppercase tracking-wider mb-1">Data Produção</p>
                <p class="text-slate-200">{{ resultLote()!.lote.dataProd | date:'dd/MM/yyyy' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 uppercase tracking-wider mb-1">Qtd. Produzida</p>
                <p class="font-mono text-slate-200">{{ resultLote()!.lote.qtdProduzida | number:'1.0-0' }}</p>
              </div>
              <div>
                <p class="text-xs text-slate-500 uppercase tracking-wider mb-1">Produto (cód.)</p>
                <p class="font-mono text-slate-200">{{ resultLote()!.lote.produto?.codigo }}</p>
              </div>
            </div>
          </div>

          <!-- Insumos do lote -->
          <div class="card">
            <h3 class="section-title flex items-center gap-2">
              <span>Insumos utilizados neste lote</span>
              <span class="text-slate-500 text-sm font-normal">({{ resultLote()!.insumos.length }})</span>
            </h3>

            @if (resultLote()!.insumos.length === 0) {
              <p class="text-slate-500 text-sm text-center py-6">Nenhum insumo vinculado a este lote.</p>
            } @else {
              <div class="table-container">
                <table class="table-base">
                  <thead>
                    <tr>
                      <th>Insumo</th>
                      <th>Código</th>
                      <th>Lote do Insumo</th>
                      <th>Quantidade</th>
                      <th>Fornecedor</th>
                    </tr>
                  </thead>
                  <tbody>
                    @for (ins of resultLote()!.insumos; track ins.id) {
                      <tr>
                        <td class="font-medium text-slate-200">{{ ins.nomeInsumo }}</td>
                        <td class="font-mono text-xs text-slate-400">{{ ins.codigoInsumo }}</td>
                        <td>
                          <button (click)="searchQuery = ins.loteInsumo; buscar()"
                            class="font-mono text-xs text-brand-400 hover:text-brand-300 transition-colors
                                   bg-brand-600/10 px-2 py-1 rounded hover:bg-brand-600/20">
                            {{ ins.loteInsumo }} →
                          </button>
                        </td>
                        <td class="font-mono text-sm">{{ ins.quantidade }} {{ ins.unidade }}</td>
                        <td class="text-slate-400 text-sm">{{ ins.fornecedor ?? '—' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>

          <!-- Inspeção -->
          @if (resultLote()!.lote.inspecao) {
            <div class="card">
              <h3 class="section-title">Resultado da Inspeção</h3>
              <div class="flex items-start gap-4">
                <span [class]="resultadoCss(resultLote()!.lote.inspecao!.resultado)">
                  {{ resultadoLabel(resultLote()!.lote.inspecao!.resultado) }}
                </span>
                <div class="text-sm text-slate-400">
                  <p>Inspetor: {{ resultLote()!.lote.inspecao!.inspetor }}</p>
                  <p>Data: {{ resultLote()!.lote.inspecao!.dataInspecao | date:'dd/MM/yyyy HH:mm' }}</p>
                  @if (resultLote()!.lote.inspecao!.desvio) {
                    <p class="mt-2 text-slate-300 italic">"{{ resultLote()!.lote.inspecao!.desvio }}"</p>
                  }
                </div>
              </div>
            </div>
          }
        </div>
      }

      <!-- Result: Insumo (consulta reversa) -->
      @if (resultInsumo()) {
        <div class="animate-slide-up space-y-6">
          <!-- Alert de recall -->
          <div class="bg-orange-500/10 border border-orange-500/30 rounded-xl p-5 flex items-start gap-4">
            <div class="w-10 h-10 rounded-full bg-orange-500/20 flex items-center justify-center flex-shrink-0">
              <svg class="w-5 h-5 text-orange-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
              </svg>
            </div>
            <div>
              <p class="font-semibold text-orange-300 mb-1">Consulta reversa — Impacto de Insumo/Lote</p>
              <p class="text-sm text-orange-200/70">
                Foram identificados <strong class="text-orange-300">{{ resultInsumo()!.lotesAfetados.length }} lote(s)</strong> de produção
                que utilizaram o insumo/lote <span class="font-mono">{{ searchQuery }}</span>.
              </p>
            </div>
          </div>

          <!-- Result header -->
          <div class="flex items-center gap-3">
            <div class="px-3 py-1 rounded-full text-xs font-medium bg-orange-500/15 text-orange-400 border border-orange-500/25">
              🔗 Rastreio Reverso de Insumo
            </div>
          </div>

          <!-- Insumos encontrados -->
          <div class="card">
            <h3 class="section-title">Registros de uso encontrados</h3>
            <div class="space-y-2">
              @for (ins of resultInsumo()!.insumosEncontrados; track ins.id) {
                <div class="flex items-center gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-800">
                  <div class="flex-1">
                    <p class="text-sm font-medium text-slate-200">{{ ins.nomeInsumo }}</p>
                    <p class="text-xs text-slate-500">Cód: {{ ins.codigoInsumo }} · Lote insumo: <span class="font-mono">{{ ins.loteInsumo }}</span></p>
                  </div>
                  <div class="text-right">
                    <p class="text-sm font-mono text-slate-200">{{ ins.quantidade }} {{ ins.unidade }}</p>
                    @if (ins.fornecedor) {
                      <p class="text-xs text-slate-500">{{ ins.fornecedor }}</p>
                    }
                  </div>
                </div>
              }
            </div>
          </div>

          <!-- Lotes afetados -->
          <div class="card">
            <h3 class="section-title flex items-center gap-2">
              Lotes de produção afetados
              <span class="badge-reprovado text-xs">{{ resultInsumo()!.lotesAfetados.length }} lote(s)</span>
            </h3>

            <div class="table-container">
              <table class="table-base">
                <thead>
                  <tr>
                    <th>Nº do Lote</th>
                    <th>Produto</th>
                    <th>Data Produção</th>
                    <th>Qtd. Produzida</th>
                    <th>Status</th>
                    <th></th>
                  </tr>
                </thead>
                <tbody>
                  @for (item of resultInsumo()!.lotesAfetados; track item.lote.id) {
                    <tr>
                      <td>
                        <span class="font-mono text-xs text-brand-400 font-medium">{{ item.lote.numero }}</span>
                      </td>
                      <td>
                        <p class="text-xs font-medium text-slate-200">{{ item.lote.produto?.nome }}</p>
                        <p class="text-xs text-slate-500">{{ item.lote.produto?.codigo }}</p>
                      </td>
                      <td class="text-sm text-slate-400">{{ item.lote.dataProd | date:'dd/MM/yyyy' }}</td>
                      <td class="font-mono text-sm">{{ item.lote.qtdProduzida | number:'1.0-0' }}</td>
                      <td>
                        <span [class]="getStatusCss(item.lote.status)">
                          {{ getStatusLabel(item.lote.status) }}
                        </span>
                      </td>
                      <td>
                        <a [routerLink]="['/app/lotes', item.lote.id]"
                           class="text-xs text-brand-400 hover:text-brand-300 transition-colors">
                          Ver lote →
                        </a>
                      </td>
                    </tr>
                  }
                </tbody>
              </table>
            </div>
          </div>
        </div>
      }
    </div>
  `,
})
export class RastreabilidadeComponent implements OnInit {
  private data = inject(MockDataService);
  private route = inject(ActivatedRoute);

  searchQuery = '';
  hasSearched = signal(false);
  resultLote = signal<RastreioLote | null>(null);
  resultInsumo = signal<RastreioInsumo | null>(null);

  hints = [
    { query: 'BT1-20240415-0001' },
    { query: 'BT1-20240502-0003' },
    { query: 'INS-IBU-01' },
    { query: 'FRN-2024-1103' },
    { query: 'INS-VTC-01' },
  ];

  ngOnInit() {
    this.route.queryParams.subscribe(params => {
      if (params['q']) {
        this.searchQuery = params['q'];
        this.buscar();
      }
    });
  }

  buscar() {
    if (!this.searchQuery.trim()) return;

    this.resultLote.set(null);
    this.resultInsumo.set(null);
    this.hasSearched.set(true);

    const q = this.searchQuery.trim().toUpperCase();

    // 1. Tenta encontrar lote pelo número
    const lotesComProd = this.data.getLotesComProduto();
    const loteEncontrado = lotesComProd.find(l => l.numero.toUpperCase() === q);

    if (loteEncontrado) {
      const completo = this.data.getLoteCompleto(loteEncontrado.id)!;
      this.resultLote.set({
        lote: completo,
        insumos: this.data.insumos.filter(i => i.loteId === loteEncontrado.id),
      });
      return;
    }

    // 2. Busca reversa por código de insumo ou lote de insumo
    const insumosEncontrados = this.data.insumos.filter(i =>
      i.codigoInsumo.toUpperCase().includes(q) ||
      i.loteInsumo.toUpperCase().includes(q) ||
      i.nomeInsumo.toUpperCase().includes(q)
    );

    if (insumosEncontrados.length > 0) {
      const loteIds = [...new Set(insumosEncontrados.map(i => i.loteId))];
      const lotesAfetados = loteIds
        .map(loteId => {
          const lote = lotesComProd.find(l => l.id === loteId);
          const insumo = insumosEncontrados.find(i => i.loteId === loteId)!;
          return lote ? { lote, insumo } : null;
        })
        .filter(Boolean) as Array<{ lote: Lote; insumo: InsumoLote }>;

      this.resultInsumo.set({
        codigoOuLote: q,
        insumosEncontrados,
        lotesAfetados,
      });
    }
  }

  getStatusLabel(s: string) { return STATUS_LABELS[s as keyof typeof STATUS_LABELS] ?? s; }
  getStatusCss(s: string) { return STATUS_CSS[s as keyof typeof STATUS_CSS] ?? 'badge'; }
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
