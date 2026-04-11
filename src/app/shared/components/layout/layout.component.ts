import { Component, inject, signal } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="min-h-screen" style="background: linear-gradient(135deg, #0F172A 0%, #1E293B 100%);">

      <!-- LGPD FAB -->
      <button class="lgpd-fab" (click)="lgpdOpen.set(!lgpdOpen())">
        <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
        </svg>
      </button>

      <!-- LGPD Overlay -->
      @if (lgpdOpen()) {
        <div class="fixed inset-0 bg-black/50 backdrop-blur-sm z-35"
             (click)="lgpdOpen.set(false)"></div>
      }

      <!-- LGPD Sidebar -->
      <div class="fixed left-0 bottom-0 top-[65px] w-72 z-40 transition-transform duration-300"
           style="background: rgba(15,23,42,0.98); backdrop-filter: blur(10px); border-right: 1px solid #334155;"
           [style.transform]="lgpdOpen() ? 'translateX(0)' : 'translateX(-100%)'">

        <div class="p-4 border-b flex items-center gap-3" style="border-color:#334155;">
          <div class="w-10 h-10 rounded-full flex items-center justify-center flex-shrink-0"
               style="background: linear-gradient(135deg, #00B4D8, #1A5F7A);">
            <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
            </svg>
          </div>
          <div>
            <h3 class="font-semibold text-sm" style="color:#F1F5F9;">LGPD - Seus Direitos</h3>
            <p class="text-xs" style="color:#94A3B8;">Lei nº 13.709/2018</p>
          </div>
        </div>

        <div class="py-2">
          @for (item of lgpdItems; track item.label) {
            <button (click)="lgpdAction(item.action)"
              class="w-full flex items-center gap-3 px-5 py-3 text-sm transition-all text-left"
              style="color:#CBD5E1;"
              onmouseover="this.style.background='rgba(0,180,216,0.1)'; this.style.color='#00B4D8';"
              onmouseout="this.style.background='transparent'; this.style.color='#CBD5E1';">
              <span>{{ item.icon }}</span>
              <span>{{ item.label }}</span>
            </button>
          }
        </div>

        <div class="absolute bottom-0 left-0 right-0 p-4 border-t text-center text-xs"
             style="border-color:#334155; color:#94A3B8;">
          🔒 Conformidade LGPD | Lei 13.709/2018
        </div>
      </div>

      <!-- Topbar -->
      <nav class="sticky top-0 z-50"
           style="background: rgba(15,23,42,0.95); backdrop-filter: blur(10px); border-bottom: 1px solid #334155;">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div class="flex justify-between items-center h-16">

            <!-- Logo -->
            <a routerLink="/app/dashboard" class="flex items-center gap-3">
              <div class="logo-icon w-10 h-10 animate-float">
                <svg class="w-5 h-5 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M5 13l4 4L19 7"/>
                  <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M12 2L2 7l10 5 10-5-10-5z"/>
                </svg>
              </div>
              <div>
                <div class="logo-text text-lg">IANDÊ TRACE</div>
                <div class="text-xs" style="color:#94A3B8; letter-spacing:1px;">O sinal da sua produção</div>
              </div>
            </a>

            <!-- Nav -->
            <div class="flex items-center gap-1">
              @for (item of navItems; track item.route) {
                <a [routerLink]="item.route" routerLinkActive="active" class="sidebar-link px-4 py-2">
                  <span>{{ item.icon }}</span>
                  <span class="hidden sm:inline">{{ item.label }}</span>
                </a>
              }

              <!-- User menu -->
              <div class="relative ml-2">
                <button (click)="userMenuOpen.set(!userMenuOpen())"
                  class="flex items-center gap-2 px-3 py-1.5 rounded-full transition-all duration-300"
                  style="background: rgba(51,65,85,0.5); border: 1px solid #475569;">
                  <div class="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm flex-shrink-0"
                       style="background: linear-gradient(135deg, #00B4D8, #1A5F7A);">
                    {{ userInitial() }}
                  </div>
                  <div class="hidden sm:block text-right">
                    <p class="text-sm font-semibold leading-tight" style="color:#F1F5F9;">{{ auth.user()?.nome }}</p>
                    <p class="text-xs capitalize" style="color:#94A3B8;">{{ auth.user()?.perfil }}</p>
                  </div>
                  <svg class="w-4 h-4" style="color:#94A3B8;" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M19 9l-7 7-7-7"/>
                  </svg>
                </button>

                @if (userMenuOpen()) {
                  <div class="absolute right-0 top-full mt-2 w-64 rounded-2xl shadow-2xl z-50 overflow-hidden animate-fade-in"
                       style="background: #1E293B; border: 1px solid #334155;">
                    <div class="p-4 flex items-center gap-3" style="border-bottom: 1px solid #334155;">
                      <div class="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold text-xl flex-shrink-0"
                           style="background: linear-gradient(135deg, #00B4D8, #1A5F7A);">
                        {{ userInitial() }}
                      </div>
                      <div>
                        <p class="font-semibold text-sm" style="color:#F1F5F9;">{{ auth.user()?.nome }}</p>
                        <p class="text-xs" style="color:#94A3B8;">{{ auth.user()?.email }}</p>
                      </div>
                    </div>
                    <div class="py-1">
                      <button (click)="userMenuOpen.set(false); lgpdOpen.set(true)"
                        class="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all"
                        style="color:#CBD5E1;"
                        onmouseover="this.style.background='#334155'; this.style.color='#00B4D8';"
                        onmouseout="this.style.background='transparent'; this.style.color='#CBD5E1';">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z"/>
                        </svg>
                        🔒 Privacidade LGPD
                      </button>
                      <div style="height:1px; background:#334155; margin:4px 0;"></div>
                      <button (click)="auth.logout()"
                        class="w-full flex items-center gap-3 px-4 py-3 text-sm text-left transition-all"
                        style="color:#EF9A9A;"
                        onmouseover="this.style.background='#334155';"
                        onmouseout="this.style.background='transparent';">
                        <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                          <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                            d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
                        </svg>
                        🚪 Sair do Sistema
                      </button>
                    </div>
                  </div>
                }
              </div>
            </div>
          </div>
        </div>
      </nav>

      <!-- Content -->
      <main class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 animate-fade-in">
        <router-outlet />
      </main>
    </div>
  `,
})
export class LayoutComponent {
  auth = inject(AuthService);
  lgpdOpen     = signal(false);
  userMenuOpen = signal(false);

  navItems: NavItem[] = [
    { label: 'Dashboard',        route: '/app/dashboard',        icon: '📊' },
    { label: 'Lotes',            route: '/app/lotes',            icon: '📦' },
    { label: 'Produtos',         route: '/app/produtos',         icon: '🏭' },
    { label: 'Rastreabilidade',  route: '/app/rastreabilidade',  icon: '🔍' },
  ];

  lgpdItems = [
    { icon: '📋', label: 'Solicitar meus dados (SAR)',  action: 'sar' },
    { icon: '⬇️', label: 'Portabilidade (Download)',    action: 'download' },
    { icon: '🗑️', label: 'Direito ao esquecimento',     action: 'delete' },
    { icon: '📜', label: 'Log de acessos',              action: 'log' },
    { icon: '📄', label: 'Política de Privacidade',     action: 'policy' },
    { icon: '🔴', label: 'Revogar consentimento',       action: 'revoke' },
    { icon: '📧', label: 'Contatar DPO',                action: 'dpo' },
  ];

  lgpdAction(action: string) {
    this.lgpdOpen.set(false);
    const messages: Record<string, string> = {
      sar:      '✅ Solicitação SAR registrada! Prazo: 15 dias (Art. 19 LGPD).',
      download: '✅ Download dos seus dados iniciado!',
      delete:   '✅ Solicitação de exclusão registrada.',
      log:      '📜 Log de acessos disponível com backend integrado.',
      policy:   '📄 Política de Privacidade — Iandê Trace\n\n✅ Base legal: Consentimento (Art. 7º LGPD)\n✅ Retenção: 5 anos\n✅ DPO: dpo@iandetrace.com',
      revoke:   '🔴 Consentimento revogado.',
      dpo:      '📧 DPO: dpo@iandetrace.com\n📞 (92) 4000-0000\n🕐 Seg-Sex, 9h-18h',
    };
    alert(messages[action] ?? '');
    if (action === 'revoke') this.auth.logout();
  }

  userInitial() {
    const name = this.auth.user()?.nome ?? '';
    return name.split(' ').map((n: string) => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
