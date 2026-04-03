import { Component, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { MockDataService } from '../../../core/services/mock-data.service';
import { Lote, LoteForm, TURNO_LABELS } from '../../../shared/models';

@Component({
  selector: 'app-lote-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
  template: `
    <div class="animate-slide-up max-w-2xl">
      <!-- Header -->
      <div class="page-header">
        <a routerLink="/app/lotes" class="text-sm text-slate-500 hover:text-slate-300 flex items-center gap-1 mb-3 transition-colors">
          <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M15 19l-7-7 7-7" />
          </svg>
          Voltar para lotes
        </a>
        <h1 class="page-title">Abrir Novo Lote</h1>
        <p class="page-subtitle">O número do lote será gerado automaticamente ao salvar</p>
      </div>

      <!-- Número automático preview -->
      <div class="bg-brand-600/10 border border-brand-600/25 rounded-xl p-4 mb-6 flex items-center gap-3">
        <div class="w-8 h-8 rounded-lg bg-brand-600/20 flex items-center justify-center flex-shrink-0">
          <svg class="w-4 h-4 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
              d="M7 20l4-16m2 16l4-16M6 9h14M4 15h14" />
          </svg>
        </div>
        <div>
          <p class="text-xs text-brand-300 font-medium">Número do lote (gerado automaticamente)</p>
          <p class="font-mono font-bold text-brand-400 text-lg">{{ previewNumero() }}</p>
        </div>
      </div>

      <!-- Form card -->
      <div class="card">
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

          <!-- Produto -->
          <div>
            <label class="form-label">Produto <span class="text-red-400">*</span></label>
            <select formControlName="produtoId" class="input-field" (change)="onProdutoChange()">
              <option value="">Selecione o produto</option>
              @for (p of data.produtos; track p.id) {
                <option [value]="p.id">{{ p.nome }} ({{ p.codigo }})</option>
              }
            </select>
            @if (f['produtoId'].invalid && f['produtoId'].touched) {
              <p class="form-error">Selecione um produto.</p>
            }
          </div>

          <!-- Data + Turno -->
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Data de Produção <span class="text-red-400">*</span></label>
              <input type="date" formControlName="dataProd" class="input-field" />
              @if (f['dataProd'].invalid && f['dataProd'].touched) {
                <p class="form-error">Data é obrigatória.</p>
              }
            </div>
            <div>
              <label class="form-label">Turno <span class="text-red-400">*</span></label>
              <select formControlName="turno" class="input-field">
                <option value="">Selecione</option>
                @for (t of turnos; track t.value) {
                  <option [value]="t.value">{{ t.label }}</option>
                }
              </select>
              @if (f['turno'].invalid && f['turno'].touched) {
                <p class="form-error">Selecione o turno.</p>
              }
            </div>
          </div>

          <!-- Operador -->
          <div>
            <label class="form-label">Operador Responsável <span class="text-red-400">*</span></label>
            <input type="text" formControlName="operador" class="input-field"
                   placeholder="Nome do operador" />
            @if (f['operador'].invalid && f['operador'].touched) {
              <p class="form-error">Informe o operador responsável.</p>
            }
          </div>

          <!-- Quantidade -->
          <div>
            <label class="form-label">Quantidade Produzida <span class="text-red-400">*</span></label>
            <div class="relative">
              <input type="number" formControlName="qtdProduzida" class="input-field pr-20"
                     placeholder="0" min="1" />
              <span class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 text-sm">
                {{ unidadeProduto() }}
              </span>
            </div>
            @if (f['qtdProduzida'].invalid && f['qtdProduzida'].touched) {
              <p class="form-error">
                @if (f['qtdProduzida'].errors?.['required']) { Quantidade é obrigatória. }
                @else if (f['qtdProduzida'].errors?.['min']) { Quantidade deve ser maior que zero. }
              </p>
            }
          </div>

          <!-- Observações -->
          <div>
            <label class="form-label">Observações</label>
            <textarea formControlName="observacoes" class="input-field resize-none" rows="3"
                      placeholder="Informações adicionais sobre este lote (opcional)"></textarea>
          </div>

          <!-- Actions -->
          <div class="flex items-center justify-end gap-3 pt-2">
            <a routerLink="/app/lotes" class="btn-secondary">Cancelar</a>
            <button type="submit" class="btn-primary" [disabled]="loading() || form.invalid">
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Salvando...
              } @else {
                <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7" />
                </svg>
                Abrir lote
              }
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
})
export class LoteFormComponent {
  data = inject(MockDataService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  loading = signal(false);

  form = this.fb.group({
    produtoId:    ['', Validators.required],
    dataProd:     [new Date().toISOString().split('T')[0], Validators.required],
    turno:        ['', Validators.required],
    operador:     ['', Validators.required],
    qtdProduzida: [null as number | null, [Validators.required, Validators.min(1)]],
    observacoes:  [''],
  });

  get f() { return this.form.controls; }

  turnos = Object.entries(TURNO_LABELS).map(([value, label]) => ({ value, label }));

  previewNumero() {
    const pid = this.form.value.produtoId;
    if (!pid) return 'BTX-YYYYMMDD-NNNN';
    return this.data.gerarNumeroLote(pid);
  }

  unidadeProduto() {
    const pid = this.form.value.produtoId;
    return this.data.produtos.find(p => p.id === pid)?.unidade ?? 'unid.';
  }

  onProdutoChange() { /* triggers signal update */ }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);

    setTimeout(() => {
      const v = this.form.value;
      const numero = this.data.gerarNumeroLote(v.produtoId!);
      const novoLote: Lote = {
        id: `l${Date.now()}`,
        numero,
        produtoId: v.produtoId!,
        dataProd: new Date(v.dataProd!),
        turno: v.turno as any,
        operador: v.operador!,
        qtdProduzida: v.qtdProduzida!,
        observacoes: v.observacoes ?? undefined,
        status: 'em_producao',
        createdAt: new Date(),
        updatedAt: new Date(),
      };
      this.data.lotes.unshift(novoLote);
      this.loading.set(false);
      this.router.navigate(['/app/lotes', novoLote.id]);
    }, 600);
  }
}
