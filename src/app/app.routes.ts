import { Routes } from '@angular/router';
import { authGuard, noAuthGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () => import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'lotes',
        loadComponent: () => import('./features/lotes/lote-list/lote-list.component').then(m => m.LoteListComponent),
      },
      {
        path: 'lotes/novo',
        loadComponent: () => import('./features/lotes/lote-form/lote-form.component').then(m => m.LoteFormComponent),
      },
      {
        path: 'lotes/:id',
        loadComponent: () => import('./features/lotes/lote-detail/lote-detail.component').then(m => m.LoteDetailComponent),
      },
      {
        path: 'lotes/:id/insumos',
        loadComponent: () => import('./features/insumos/insumos.component').then(m => m.InsumosComponent),
      },
      {
        path: 'lotes/:id/inspecao',
        loadComponent: () => import('./features/inspecao/inspecao.component').then(m => m.InspecaoComponent),
      },
      {
        path: 'rastreabilidade',
        loadComponent: () => import('./features/rastreabilidade/rastreabilidade.component').then(m => m.RastreabilidadeComponent),
      },
      {
        path: 'produtos',
        loadComponent: () =>
          import('./features/produtos/produtos.component').then(m => m.ProdutosComponent),
      },
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
    ],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
