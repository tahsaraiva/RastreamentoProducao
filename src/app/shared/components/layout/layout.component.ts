import { Component, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

interface NavItem {
  label: string;
  route: string;
  icon: string;
  badge?: number;
}

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, RouterLink, RouterLinkActive, CommonModule],
  template: `
    <div class="flex h-screen overflow-hidden bg-slate-950">
      <aside class="w-[260px] flex-shrink-0 flex flex-col bg-slate-900 border-r border-slate-800">
        <div class="flex items-center gap-3 px-5 py-5 border-b border-slate-800">
          <div class="w-8 h-8 rounded-lg bg-brand-600 flex items-center justify-center flex-shrink-0">
            <svg class="w-4 h-4 text-white" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                d="M9 17V7m0 10a2 2 0 01-2 2H5a2 2 0 01-2-2V7a2 2 0 012-2h2a2 2 0 012 2m0 10a2 2 0 002 2h2a2 2 0 002-2M9 7a2 2 0 012-2h2a2 2 0 012 2m0 10V7m0 10a2 2 0 002 2h2a2 2 0 002-2V7a2 2 0 00-2-2h-2a2 2 0 00-2 2" />
            </svg>
          </div>
          <div>
            <p class="font-display font-bold text-slate-50 text-sm leading-tight">Rastreamento de Produção por Lote</p>
            <p class="text-xs text-slate-500">Rastreamento Industrial</p>
          </div>
        </div>
        <nav class="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
          <p class="text-xs text-slate-600 font-medium uppercase tracking-wider px-3 mb-2">Produção</p>
          @for (item of navItems; track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active" class="sidebar-link">
              <span class="text-base" [innerHTML]="item.icon"></span>
              <span class="flex-1">{{ item.label }}</span>
              @if (item.badge) {
                <span class="bg-brand-600 text-white text-xs rounded-full px-1.5 py-0.5 font-medium">
                  {{ item.badge }}
                </span>
              }
            </a>
          }
          <div class="my-3 border-t border-slate-800"></div>
          <p class="text-xs text-slate-600 font-medium uppercase tracking-wider px-3 mb-2">Qualidade</p>
          @for (item of qualityItems; track item.route) {
            <a [routerLink]="item.route" routerLinkActive="active" class="sidebar-link">
              <span class="text-base" [innerHTML]="item.icon"></span>
              <span>{{ item.label }}</span>
            </a>
          }
        </nav>
        <div class="border-t border-slate-800 p-4">
          <div class="flex items-center gap-3">
            <div class="w-8 h-8 rounded-full bg-brand-600/20 border border-brand-600/30
                        flex items-center justify-center text-brand-400 text-sm font-semibold flex-shrink-0">
              {{ userInitial() }}
            </div>
            <div class="flex-1 min-w-0">
              <p class="text-sm font-medium text-slate-200 truncate">{{ auth.user()?.nome }}</p>
              <p class="text-xs text-slate-500 truncate capitalize">{{ auth.user()?.perfil }}</p>
            </div>
            <button (click)="auth.logout()" title="Sair"
              class="text-slate-500 hover:text-red-400 transition-colors p-1 rounded">
              <svg class="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2"
                  d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1" />
              </svg>
            </button>
          </div>
        </div>
      </aside>
      <main class="flex-1 overflow-y-auto">
        <div class="p-8 animate-fade-in">
          <router-outlet />
        </div>
      </main>
    </div>
  `,
})
export class LayoutComponent {
  auth = inject(AuthService);

  navItems: NavItem[] = [
    { label: 'Dashboard',          route: '/app/dashboard', icon: '📊' },
    { label: 'Lotes de Produção',  route: '/app/lotes',     icon: '📦', badge: 2 },
  ];

  qualityItems: NavItem[] = [
    { label: 'Rastreabilidade', route: '/app/rastreabilidade', icon: '🔍' },
  ];

  userInitial() {
    const name = this.auth.user()?.nome ?? '';
    return name.split(' ').map(n => n[0]).slice(0, 2).join('').toUpperCase();
  }
}
