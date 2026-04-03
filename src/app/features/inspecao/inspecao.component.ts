import { Component, inject, OnInit, signal, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { MockDataService } from '../../core/services/mock-data.service';
import { Lote, InspecaoLote, ResultadoInspecao, RESULTADO_LABELS, STATUS_LABELS } from '../../shared/models';


@Component({
  selector: 'app-inspecao',
  standalone: true,
  imports: [CommonModule, RouterLink, ReactiveFormsModule],
  template: `
    <div class="animate-slide-up max-w-2xl">
      <a [routerLink]="['/app/lotes', id]" class="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-4 transition-colors">
        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
        </svg>
        Voltar para o lote
      </a>

      <div class="page-header">
        <h1 class="page-title">Registro de Inspeção</h1>
        <p class="page-subtitle">Inspeção de qualidade do lote <span class="font-mono text-brand-400">{{ lote()?.numero }}</span></p>
      </div>

      @if (!lote()) {
        <div class="card text-center py-12 text-slate-500">Lote não encontrado.</div>
      } @else if (lote()!.inspecao || saved()) {
        <!-- Already inspected -->
        <div class="card text-center py-12">
          <div class="w-16 h-16 rounded-full bg-emerald-500/15 flex items-center justify-center mx-auto mb-4">
            <svg class="w-8 h-8 text-emerald-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <p class="text-lg font-semibold text-slate-200 mb-2">Inspeção registrada</p>
          <p class="text-slate-400 text-sm mb-6">O resultado desta inspeção já foi salvo.</p>
          <a [routerLink]="['/app/lotes', id]" class="btn-primary mx-auto">Ver detalhes do lote</a>
        </div>
      } @else {
        <!-- Lote summary -->
        <div class="card mb-6 bg-slate-800/50">
          <div class="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p class="text-xs text-slate-500 uppercase tracking-wider mb-1">Produto</p>
              <p class="text-slate-200 font-medium">{{ lote()!.produto?.nome }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 uppercase tracking-wider mb-1">Operador</p>
              <p class="text-slate-200">{{ lote()!.operador }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 uppercase tracking-wider mb-1">Qtd. Produzida</p>
              <p class="text-slate-200 font-mono">{{ lote()!.qtdProduzida | number:'1.0-0' }} {{ lote()!.produto?.unidade }}</p>
            </div>
            <div>
              <p class="text-xs text-slate-500 uppercase tracking-wider mb-1">Data Produção</p>
              <p class="text-slate-200">{{ lote()!.dataProd | date:'dd/MM/yyyy' }}</p>
            </div>
          </div>
        </div>

        <!-- Form -->
        <div class="card">
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

            <div>
              <label class="form-label">Inspetor Responsável <span class="text-red-400">*</span></label>
              <input type="text" formControlName="inspetor" class="input-field"
                     placeholder="Nome do inspetor" />
              @if (f['inspetor'].invalid && f['inspetor'].touched) {
                <p class="form-error">Nome do inspetor é obrigatório.</p>
              }
            </div>

            <!-- Resultado -->
            <div>
              <label class="form-label">Resultado da Inspeção <span class="text-red-400">*</span></label>
              <div class="grid grid-cols-3 gap-3 mt-2">
                @for (r of resultados; track r.value) {
                  <label class="relative cursor-pointer">
                    <input type="radio" formControlName="resultado" [value]="r.value" class="sr-only peer" />
                    <div class="p-3 rounded-lg border-2 text-center transition-all duration-200 peer-checked:border-current"
                         [class]="r.css">
                      <p class="text-sm font-medium">{{ r.label }}</p>
                    </div>
                  </label>
                }
              </div>
              @if (f['resultado'].invalid && f['resultado'].touched) {
                <p class="form-error">Selecione o resultado.</p>
              }
            </div>

            <!-- Qtd reprovada - condicional -->
            @if (form.value.resultado && form.value.resultado !== 'aprovado') {
              <div class="animate-fade-in">
                <label class="form-label">
                  Quantidade Reprovada
                  @if (form.value.resultado === 'reprovado') { <span class="text-red-400">*</span> }
                </label>
                <div class="relative">
                  <input type="number" formControlName="qtdReprovada" class="input-field pr-20"
                         placeholder="0" min="0" />
                  <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                    {{ lote()!.produto?.unidade }}
                  </span>
                </div>
              </div>

              <div class="animate-fade-in">
                <label class="form-label">
                  Descrição do Desvio <span class="text-red-400">*</span>
                </label>
                <textarea formControlName="desvio" class="input-field resize-none" rows="4"
                          placeholder="Descreva o desvio de qualidade encontrado, como foi identificado e quais ações foram tomadas...">
                </textarea>
                @if (f['desvio'].invalid && f['desvio'].touched) {
                  <p class="form-error">A descrição do desvio é obrigatória.</p>
                }
              </div>
            }

            <div>
              <label class="form-label">Observações</label>
              <textarea formControlName="observacoes" class="input-field resize-none" rows="3"
                        placeholder="Observações adicionais (opcional)"></textarea>
            </div>

            <!-- Alert resultado -->
            @if (form.value.resultado === 'reprovado') {
              <div class="bg-red-500/10 border border-red-500/25 rounded-xl p-4 flex items-start gap-3">
                <svg class="w-5 h-5 text-red-400 flex-shrink-0 mt-0.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z" />
                </svg>
                <p class="text-sm text-red-300">
                  O status do lote será atualizado para <strong>Reprovado</strong> e o lote ficará bloqueado para distribuição.
                </p>
              </div>
            }

            <div class="flex gap-3 pt-2">
              <a [routerLink]="['/app/lotes', id]" class="btn-secondary flex-1 justify-center">Cancelar</a>
              <button type="submit" class="btn-primary flex-1 justify-center" [disabled]="loading() || form.invalid">
                @if (loading()) {
                  <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                    <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                    <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                  </svg>
                  Salvando...
                } @else {
                  Salvar inspeção
                }
              </button>
            </div>
          </form>
        </div>
      }
    </div>
  `,
})
export class InspecaoComponent implements OnInit {
  @Input() id!: string;

  private data = inject(MockDataService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  lote = signal<Lote | null>(null);
  loading = signal(false);
  saved = signal(false);

  resultados = [
    { value: 'aprovado',              label: 'Aprovado',          css: 'border-slate-700 text-slate-400 hover:border-emerald-500 peer-checked:bg-emerald-500/10 peer-checked:text-emerald-400' },
    { value: 'aprovado_com_restricao', label: 'Aprovado c/ Restrição', css: 'border-slate-700 text-slate-400 hover:border-orange-500 peer-checked:bg-orange-500/10 peer-checked:text-orange-400' },
    { value: 'reprovado',             label: 'Reprovado',         css: 'border-slate-700 text-slate-400 hover:border-red-500 peer-checked:bg-red-500/10 peer-checked:text-red-400' },
  ];

  form = this.fb.group({
    inspetor:     ['', Validators.required],
    resultado:    ['', Validators.required],
    qtdReprovada: [null as number | null],
    desvio:       [''],
    observacoes:  [''],
  });

  get f() { return this.form.controls; }

  ngOnInit() {
    const l = this.data.getLoteCompleto(this.id);
    this.lote.set(l ?? null);

    // When resultado changes, manage conditional validators
    this.form.get('resultado')!.valueChanges.subscribe(val => {
      const desvioCtrl = this.form.get('desvio')!;
      if (val && val !== 'aprovado') {
        desvioCtrl.setValidators(Validators.required);
      } else {
        desvioCtrl.clearValidators();
        desvioCtrl.setValue('');
      }
      desvioCtrl.updateValueAndValidity();
    });
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    setTimeout(() => {
      const v = this.form.value;
      const resultado = v.resultado as ResultadoInspecao;

      // Persist inspection
      const inspecao: InspecaoLote = {
        id: `insp${Date.now()}`,
        loteId: this.id,
        inspetor: v.inspetor!,
        dataInspecao: new Date(),
        resultado,
        qtdReprovada: v.qtdReprovada ?? undefined,
        desvio: v.desvio ?? undefined,
        observacoes: v.observacoes ?? undefined,
        createdAt: new Date(),
      };
      this.data.inspecoes.push(inspecao);

      // Update lote status
      const statusMap: Record<ResultadoInspecao, any> = {
        aprovado: 'aprovado',
        aprovado_com_restricao: 'aprovado_com_restricao',
        reprovado: 'reprovado',
      };
      const idx = this.data.lotes.findIndex(l => l.id === this.id);
      if (idx >= 0) {
        this.data.lotes[idx] = {
          ...this.data.lotes[idx],
          status: statusMap[resultado],
          qtdReprovada: v.qtdReprovada ?? undefined,
          updatedAt: new Date(),
        };
      }

      this.loading.set(false);
      this.saved.set(true);
    }, 700);
  }
}
