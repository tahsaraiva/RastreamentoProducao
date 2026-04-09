import { Component, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  template: `
    <div class="min-h-screen bg-slate-950 flex">

      <!-- Left panel - branding -->
      <div class="hidden lg:flex lg:w-1/2 bg-gradient-to-br from-slate-900 via-brand-950 to-slate-950
                  flex-col items-center justify-center p-12 relative overflow-hidden border-r border-slate-800">

        <!-- Background decoration -->
        <div class="absolute inset-0 overflow-hidden pointer-events-none">
          <div class="absolute -top-40 -left-40 w-96 h-96 bg-brand-600/10 rounded-full blur-3xl"></div>
          <div class="absolute -bottom-40 -right-40 w-96 h-96 bg-brand-500/5 rounded-full blur-3xl"></div>
          <!-- Grid lines -->
          <div class="absolute inset-0 opacity-5"
               style="background-image: linear-gradient(#4f63f8 1px, transparent 1px), linear-gradient(90deg, #4f63f8 1px, transparent 1px);
                      background-size: 40px 40px;"></div>
        </div>

        <div class="relative z-10 text-center max-w-sm">
          <!-- Logo -->
          <div class="w-20 h-20 rounded-2xl bg-brand-600/20 border border-brand-500/30
                      flex items-center justify-center mx-auto mb-8 backdrop-blur">
            <svg class="w-10 h-10 text-brand-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="1.5"
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>

          <h1 class="font-display text-4xl font-bold text-slate-50 mb-3">Rastreamento</h1>
          <p class="text-slate-400 text-lg mb-10">Rastreamento de Produção por Lote</p>

          <!-- Features list -->
          <div class="space-y-4 text-left">
            @for (feat of features; track feat.label) {
              <div class="flex items-start gap-3">
                <div class="w-8 h-8 rounded-lg bg-brand-600/15 border border-brand-600/25
                            flex items-center justify-center flex-shrink-0 mt-0.5">
                  <span class="text-sm">{{ feat.icon }}</span>
                </div>
                <div>
                  <p class="text-sm font-medium text-slate-200">{{ feat.label }}</p>
                  <p class="text-xs text-slate-500">{{ feat.desc }}</p>
                </div>
              </div>
            }
          </div>
        </div>
      </div>

      <!-- Right panel - form -->
      <div class="flex-1 flex flex-col items-center justify-center p-8">
        <div class="w-full max-w-md animate-slide-up">

          <!-- Mobile logo -->
          <div class="flex items-center gap-3 mb-10 lg:hidden">
            <div class="w-10 h-10 rounded-xl bg-brand-600 flex items-center justify-center">
              <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7" />
              </svg>
            </div>
            <span class="font-display text-xl font-bold text-slate-50">Rastreamento</span>
          </div>

          <div class="mb-8">
            <h2 class="text-2xl font-display font-bold text-slate-50">Entrar na plataforma</h2>
            <p class="text-slate-400 mt-1 text-sm">Acesse o sistema com suas credenciais</p>
          </div>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

            <!-- Email -->
            <div>
              <label class="form-label">E-mail</label>
              <input type="email" formControlName="email" class="input-field"
                     placeholder="seu@email.com" autocomplete="email" />
              @if (f['email'].invalid && f['email'].touched) {
                <p class="form-error">
                  @if (f['email'].errors?.['required']) { E-mail é obrigatório. }
                  @else if (f['email'].errors?.['email']) { Informe um e-mail válido. }
                </p>
              }
            </div>

            <!-- Senha -->
            <div>
              <label class="form-label">Senha</label>
              <div class="relative">
                <input [type]="showPassword() ? 'text' : 'password'"
                       formControlName="senha" class="input-field pr-11"
                       placeholder="••••••••" autocomplete="current-password" />
                <button type="button" (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-slate-500 hover:text-slate-300 transition-colors">
                  @if (showPassword()) {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  } @else {
                    <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                        d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  }
                </button>
              </div>
              @if (f['senha'].invalid && f['senha'].touched) {
                <p class="form-error">
                  @if (f['senha'].errors?.['required']) { Senha é obrigatória. }
                  @else if (f['senha'].errors?.['minlength']) { Mínimo de 6 caracteres. }
                </p>
              }
            </div>

            <!-- Error message -->
            @if (errorMsg()) {
              <div class="bg-red-500/10 border border-red-500/25 rounded-lg px-4 py-3 flex items-center gap-2">
                <svg class="w-4 h-4 text-red-400 flex-shrink-0" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                    d="M12 8v4m0 4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                </svg>
                <p class="text-sm text-red-400">{{ errorMsg() }}</p>
              </div>
            }

            <!-- Submit -->
            <button type="submit" class="btn-primary w-full justify-center py-3 text-base"
                    [disabled]="loading() || form.invalid">
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Autenticando...
              } @else {
                Entrar
              }
            </button>
          </form>

          <!-- Demo hint -->
          <div class="mt-8 p-4 bg-slate-900 border border-slate-800 rounded-xl">
            <p class="text-xs font-medium text-slate-400 mb-2">Credenciais de demonstração:</p>
            <div class="space-y-1">
              @for (cred of demoCreds; track cred.email) {
                <button (click)="fillCred(cred.email, '123456')"
                  class="w-full text-left flex items-center gap-2 text-xs text-slate-500
                         hover:text-slate-300 transition-colors py-0.5 group">
                  <span class="w-1.5 h-1.5 rounded-full bg-slate-700 group-hover:bg-brand-500 transition-colors"></span>
                  <span class="font-mono">{{ cred.email }}</span>
                  <span class="mx-1 text-slate-700">·</span>
                  <span class="font-mono text-slate-600">{{ cred.senha }}</span>
                  <span class="ml-auto text-slate-700 group-hover:text-slate-500">{{ cred.role }}</span>
                </button>
              }
            </div>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  loading = signal(false);
  errorMsg = signal('');
  showPassword = signal(false);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    senha: ['', [Validators.required, Validators.minLength(6)]],
  });

  get f() { return this.form.controls; }

  features = [
    { icon: '📦', label: 'Rastreamento por lote', desc: 'Número gerado automaticamente por produção' },
    { icon: '🔗', label: 'Vínculo de insumos', desc: 'Rastreabilidade de primeiro nível' },
    { icon: '🔍', label: 'Consulta reversa', desc: 'Identifique lotes afetados em segundos' },
    { icon: '✅', label: 'Controle de qualidade', desc: 'Inspeção integrada ao fluxo produtivo' },
  ];

 demoCreds = [
  { email: 'gestor@lotepim.com', role: 'Gestor', senha: '123456' },
  { email: 'inspetor@lotepim.com', role: 'Inspetor', senha: '123456' },
  { email: 'operador@lotepim.com', role: 'Operador', senha: '123456' },
];

  fillCred(email: string, senha: string) {
    this.form.setValue({ email, senha });
  }

  async onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.loading.set(true);
    this.errorMsg.set('');
    const { email, senha } = this.form.value;
    const result = await this.auth.login(email!, senha!);
    this.loading.set(false);
    if (result.success) {
      this.router.navigate(['/app/dashboard']);
    } else {
      this.errorMsg.set(result.message ?? 'Erro ao autenticar.');
    }
  }
}
