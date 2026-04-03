import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { InsumoLote, Lote } from '../../shared/models';

@Component({
  selector: 'app-insumos',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="animate-slide-up max-w-4xl">
      <a [routerLink]="['/app/lotes', id]" class="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-4 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para o lote
      </a>

      <div class="page-header">
        <h1 class="page-title">Insumos do Lote</h1>
        <p class="page-subtitle font-mono text-brand-400 mt-1">{{ lote()?.numero }}</p>
      </div>

      @if (lote()?.status !== 'em_producao') {
        <div class="bg-yellow-500/10 border border-yellow-500/25 rounded-xl p-4 mb-6 flex items-center gap-3">
          <svg class="w-5 h-5 text-yellow-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
          </svg>
          <p class="text-sm text-yellow-300">
            Este lote não está em produção. Os insumos não podem ser alterados.
          </p>
        </div>
      }

      <div class="grid grid-cols-1 lg:grid-cols-5 gap-6">

        <!-- Insumos list -->
        <div class="lg:col-span-3">
          <div class="card">
            <h2 class="section-title">
              Insumos vinculados
              <span class="text-slate-500 font-normal text-sm">({{ insumos().length }})</span>
            </h2>

            @if (insumos().length === 0) {
              <div class="text-center py-10 text-slate-500">
                <svg class="w-10 h-10 mx-auto mb-3 opacity-30" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                    d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                </svg>
                <p class="text-sm">Nenhum insumo vinculado ainda.</p>
                <p class="text-xs mt-1">Adicione os insumos utilizados neste lote.</p>
              </div>
            } @else {
              <div class="space-y-2">
                @for (ins of insumos(); track ins.id) {
                  <div class="flex items-start gap-4 p-3 bg-slate-800/50 rounded-lg border border-slate-800 group">
                    <div class="w-8 h-8 rounded-lg bg-slate-700 flex items-center justify-center flex-shrink-0 text-slate-400 text-xs font-mono font-bold mt-0.5">
                      {{ $index + 1 }}
                    </div>
                    <div class="flex-1 min-w-0">
                      <p class="text-sm font-semibold text-slate-200">{{ ins.nomeInsumo }}</p>
                      <p class="text-xs text-slate-500">Cód: {{ ins.codigoInsumo }}</p>
                      <div class="flex items-center gap-3 mt-1.5">
                        <span class="text-xs bg-slate-700 text-slate-300 px-2 py-0.5 rounded font-mono">
                          Lote: {{ ins.loteInsumo }}
                        </span>
                        <span class="text-xs text-slate-400 font-mono font-medium">
                          {{ ins.quantidade }} {{ ins.unidade }}
                        </span>
                      </div>
                      @if (ins.fornecedor) {
                        <p class="text-xs text-slate-600 mt-1">{{ ins.fornecedor }}</p>
                      }
                    </div>
                    @if (lote()?.status === 'em_producao') {
                      <button (click)="removerInsumo(ins.id)"
                        class="opacity-0 group-hover:opacity-100 transition-opacity text-slate-600
                               hover:text-red-400 p-1 rounded hover:bg-red-400/10">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M19 7l-.867 12.142A2 2 0 0116.138 21H7.862a2 2 0 01-1.995-1.858L5 7m5 4v6m4-6v6m1-10V4a1 1 0 00-1-1h-4a1 1 0 00-1 1v3M4 7h16" />
                        </svg>
                      </button>
                    }
                  </div>
                }
              </div>
            }
          </div>
        </div>

        <!-- Add insumo form -->
        @if (lote()?.status === 'em_producao') {
          <div class="lg:col-span-2">
            <div class="card sticky top-4">
              <h2 class="section-title">Adicionar insumo</h2>
              <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">

                <div>
                  <label class="form-label">Nome do insumo <span class="text-red-400">*</span></label>
                  <input type="text" formControlName="nomeInsumo" class="input-field"
                         placeholder="Ex: Ibuprofeno PA" />
                  @if (f['nomeInsumo'].invalid && f['nomeInsumo'].touched) {
                    <p class="form-error">Campo obrigatório.</p>
                  }
                </div>

                <div>
                  <label class="form-label">Código do insumo <span class="text-red-400">*</span></label>
                  <input type="text" formControlName="codigoInsumo" class="input-field"
                         placeholder="Ex: INS-IBU-01" />
                  @if (f['codigoInsumo'].invalid && f['codigoInsumo'].touched) {
                    <p class="form-error">Campo obrigatório.</p>
                  }
                </div>

                <div>
                  <label class="form-label">Lote do insumo <span class="text-red-400">*</span></label>
                  <input type="text" formControlName="loteInsumo" class="input-field font-mono"
                         placeholder="Ex: FRN-2024-1103" />
                  @if (f['loteInsumo'].invalid && f['loteInsumo'].touched) {
                    <p class="form-error">Campo obrigatório.</p>
                  }
                </div>

                <div class="grid grid-cols-2 gap-3">
                  <div>
                    <label class="form-label">Quantidade <span class="text-red-400">*</span></label>
                    <input type="number" formControlName="quantidade" class="input-field"
                           placeholder="0" min="0.001" step="0.001" />
                    @if (f['quantidade'].invalid && f['quantidade'].touched) {
                      <p class="form-error">Quantidade inválida.</p>
                    }
                  </div>
                  <div>
                    <label class="form-label">Unidade <span class="text-red-400">*</span></label>
                    <select formControlName="unidade" class="input-field">
                      <option value="">—</option>
                      @for (u of unidades; track u) {
                        <option [value]="u">{{ u }}</option>
                      }
                    </select>
                  </div>
                </div>

                <div>
                  <label class="form-label">Fornecedor</label>
                  <input type="text" formControlName="fornecedor" class="input-field"
                         placeholder="Nome do fornecedor (opcional)" />
                </div>

                <button type="submit" class="btn-primary w-full justify-center" [disabled]="form.invalid">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 4v16m8-8H4" />
                  </svg>
                  Vincular insumo
                </button>
              </form>
            </div>
          </div>
        }
      </div>
    </div>
  `,
})
export class InsumosComponent implements OnInit {
  @Input() id!: string;

  private data = inject(MockDataService);
  private fb = inject(FormBuilder);

  lote = signal<Lote | null>(null);
  insumos = signal<InsumoLote[]>([]);

  unidades = ['kg', 'g', 'mg', 'L', 'mL', 'unid.', 'cápsula', 'comprimido', 'frasco', 'bisnaga'];

  form = this.fb.group({
    nomeInsumo:   ['', Validators.required],
    codigoInsumo: ['', Validators.required],
    loteInsumo:   ['', Validators.required],
    quantidade:   [null as number | null, [Validators.required, Validators.min(0.001)]],
    unidade:      ['', Validators.required],
    fornecedor:   [''],
  });

  get f() { return this.form.controls; }

  ngOnInit() {
    const l = this.data.getLoteCompleto(this.id);
    this.lote.set(l ?? null);
    this.insumos.set([...this.data.insumos.filter(i => i.loteId === this.id)]);
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.value;
    const novo: InsumoLote = {
      id: `ins${Date.now()}`,
      loteId: this.id,
      nomeInsumo:   v.nomeInsumo!,
      codigoInsumo: v.codigoInsumo!,
      loteInsumo:   v.loteInsumo!,
      quantidade:   v.quantidade!,
      unidade:      v.unidade!,
      fornecedor:   v.fornecedor ?? undefined,
      createdAt:    new Date(),
    };
    this.data.insumos.push(novo);
    this.insumos.update(list => [...list, novo]);
    this.form.reset();
  }

  removerInsumo(id: string) {
    const idx = this.data.insumos.findIndex(i => i.id === id);
    if (idx >= 0) this.data.insumos.splice(idx, 1);
    this.insumos.update(list => list.filter(i => i.id !== id));
  }
}
