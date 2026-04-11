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
    <div class="min-h-screen flex items-center justify-center px-4"
         style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);">

      <div class="w-full max-w-md animate-slide-up">
        <div class="glass-card rounded-2xl shadow-2xl p-8">

          <!-- Logo -->
          <div class="text-center mb-8">
            <div class="logo-icon w-16 h-16 mx-auto mb-4 animate-float">
              <svg class="w-8 h-8 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2L2 7l10 5 10-5-10-5z"/>
              </svg>
            </div>
            <h1 class="logo-text text-2xl">IANDÊ TRACE</h1>
            <p class="text-sm mt-1" style="color:#CBD5E1;">O sinal da sua produção — Indústria 5.0</p>
            <div class="mt-3 px-3 py-2 rounded-lg text-xs" style="background:rgba(46,125,50,0.1); color:#94A3B8;">
              🌿 Tecnologia amazônica &nbsp;|&nbsp; 🔒 Conformidade LGPD
            </div>
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

            <div>
              <label class="form-label">E-mail</label>
              <input type="email" formControlName="email" class="input-field" placeholder="seu@email.com" />
              @if (f['email'].invalid && f['email'].touched) {
                <p class="form-error">
                  @if (f['email'].errors?.['required']) { E-mail é obrigatório. }
                  @else { Informe um e-mail válido. }
                </p>
              }
            </div>

            <div>
              <label class="form-label">Senha</label>
              <div class="relative">
                <input [type]="showPass() ? 'text' : 'password'"
                       formControlName="senha" class="input-field pr-11"
                       placeholder="••••••••" />
                <button type="button" (click)="showPass.set(!showPass())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 transition-colors"
                  style="color:#94A3B8;">
                  <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                      d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                  </svg>
                </button>
              </div>
              @if (f['senha'].invalid && f['senha'].touched) {
                <p class="form-error">Mínimo de 6 caracteres.</p>
              }
            </div>

            <!-- LGPD consent -->
            <div class="rounded-lg p-3" style="background: rgba(51,65,85,0.3);">
              <label class="flex items-start gap-3 cursor-pointer">
                <input type="checkbox" formControlName="consent"
                       class="mt-1 w-4 h-4 rounded" style="accent-color: #00B4D8;" />
                <span class="text-xs" style="color:#CBD5E1;">
                  Concordo com a
                  <span class="cursor-pointer" style="color:#00B4D8;">Política de Privacidade</span>
                  e autorizo o tratamento dos meus dados conforme LGPD.
                </span>
              </label>
            </div>

            @if (errorMsg()) {
              <div class="rounded-lg px-4 py-3 flex items-center gap-2 text-sm animate-fade-in"
                   style="background:rgba(198,40,40,0.1); border:1px solid rgba(198,40,40,0.3); color:#EF9A9A;">
                ⚠️ {{ errorMsg() }}
              </div>
            }

            <button type="submit" class="btn-primary w-full justify-center py-3 text-base"
                    [disabled]="loading() || form.invalid">
              @if (loading()) {
                <svg class="w-4 h-4 animate-spin" fill="none" viewBox="0 0 24 24">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"></path>
                </svg>
                Autenticando...
              } @else {
                Entrar no Sistema
              }
            </button>
          </form>

          <!-- Demo credentials -->
          <div class="mt-6 p-4 rounded-xl" style="background: rgba(15,23,42,0.6); border: 1px solid #334155;">
            <p class="text-xs font-medium mb-3" style="color:#94A3B8;">Credenciais de demonstração:</p>
            <div class="space-y-2">
              @for (cred of demoCreds; track cred.email) {
                <button type="button" (click)="fillCred(cred.email)"
                  class="w-full text-left flex items-center justify-between py-1.5 px-2 rounded-lg transition-all"
                  style="color:#64748b;"
                  onmouseover="this.style.background='rgba(0,180,216,0.08)'"
                  onmouseout="this.style.background='transparent'">
                  <span class="font-mono text-xs" style="color:#94A3B8;">{{ cred.email }}</span>
                  <div class="flex items-center gap-3">
                    <span class="font-mono text-xs" style="color:#64748b;">{{ cred.senha }}</span>
                    <span class="text-xs px-2 py-0.5 rounded-full"
                          style="background:rgba(0,180,216,0.1); color:#00B4D8;">{{ cred.role }}</span>
                  </div>
                </button>
              }
            </div>
          </div>

          <div class="mt-6 text-center text-xs" style="color:#94A3B8;">
            <p>🌿 Iandê Trace — Rastreabilidade com identidade amazônica</p>
            <p class="mt-1">🔒 Conformidade LGPD — Lei 13.709/2018</p>
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  loading  = signal(false);
  errorMsg = signal('');
  showPass = signal(false);

  demoCreds: { email: string; role: string; senha: string }[] = [
    { email: 'gestor@lotepim.com',   role: 'Gestor',   senha: '123456' },
    { email: 'inspetor@lotepim.com', role: 'Inspetor', senha: '123456' },
    { email: 'operador@lotepim.com', role: 'Operador', senha: '123456' },
  ];

  form = this.fb.group({
    email:   ['', [Validators.required, Validators.email]],
    senha:   ['', [Validators.required, Validators.minLength(6)]],
    consent: [false, Validators.requiredTrue],
  });

  get f() { return this.form.controls; }

  fillCred(email: string) {
    this.form.patchValue({ email, senha: '123456', consent: true });
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
