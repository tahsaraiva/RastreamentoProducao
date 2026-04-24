import { Routes } from '@angular/router';
import {
  authGuard,
  noAuthGuard,
  gestorGuard,
  inspetorGuard,
  operadorGuard,
  lotesGuard,
} from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [noAuthGuard],
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent),
  },
  {
    path: 'app',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./shared/components/layout/layout.component').then(m => m.LayoutComponent),
    children: [

      // Redirecionamento por perfil
      {
        path: '',
        loadComponent: () =>
          import('./shared/components/redirect/redirect.component').then(m => m.RedirectComponent),
      },

      // Gestor apenas
      {
        path: 'dashboard',
        canActivate: [gestorGuard],
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent),
      },
      {
        path: 'rastreabilidade',
        canActivate: [gestorGuard],
        loadComponent: () =>
          import('./features/rastreabilidade/rastreabilidade.component').then(m => m.RastreabilidadeComponent),
      },

      // Configurações - apenas gestor
      {
        path: 'configuracoes/usuarios',
        canActivate: [gestorGuard],
        loadComponent: () =>
          import('./features/usuarios/usuarios.component').then(m => m.UsuariosComponent),
      },

      // Listagem de lotes - todos os perfis
      {
        path: 'lotes',
        canActivate: [lotesGuard],
        loadComponent: () =>
          import('./features/lotes/lote-list/lote-list.component').then(m => m.LoteListComponent),
      },

      // Novo lote - operador e gestor
      {
        path: 'lotes/novo',
        canActivate: [lotesGuard],
        loadComponent: () =>
          import('./features/lotes/lote-form/lote-form.component').then(m => m.LoteFormComponent),
      },

      // Insumos - operador e gestor
      {
        path: 'lotes/:id/insumos',
        canActivate: [lotesGuard],
        loadComponent: () =>
          import('./features/insumos/insumos.component').then(m => m.InsumosComponent),
      },

      // Inspeção - inspetor e gestor
      {
        path: 'lotes/:id/inspecao',
        canActivate: [lotesGuard],
        loadComponent: () =>
          import('./features/inspecao/inspecao.component').then(m => m.InspecaoComponent),
      },

      // Detalhe do lote
      {
        path: 'lotes/:id',
        canActivate: [lotesGuard],
        loadComponent: () =>
          import('./features/lotes/lote-detail/lote-detail.component').then(m => m.LoteDetailComponent),
      },

      // Produtos - operador e gestor
      {
        path: 'produtos',
        canActivate: [lotesGuard],
        loadComponent: () =>
          import('./features/produtos/produtos.component').then(m => m.ProdutosComponent),
      },
    ],
  },
  { path: '', redirectTo: '/login', pathMatch: 'full' },
  { path: '**', redirectTo: '/login' },
];
