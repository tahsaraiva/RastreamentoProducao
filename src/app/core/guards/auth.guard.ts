import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.isAuth()) return true;
  return router.createUrlTree(['/login']);
};

export const noAuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuth()) return true;
  return router.createUrlTree(['/app']);
};

export const gestorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuth()) return router.createUrlTree(['/login']);
  if (auth.perfil() === 'gestor') return true;
  return router.createUrlTree(['/app']);
};

export const inspetorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuth()) return router.createUrlTree(['/login']);
  const perfil = auth.perfil();
  if (perfil === 'inspetor' || perfil === 'gestor') return true;
  return router.createUrlTree(['/app']);
};

export const operadorGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuth()) return router.createUrlTree(['/login']);
  const perfil = auth.perfil();
  if (perfil === 'operador' || perfil === 'gestor') return true;
  return router.createUrlTree(['/app']);
};

// Permite operador, inspetor e gestor
export const lotesGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.isAuth()) return router.createUrlTree(['/login']);
  const perfil = auth.perfil();
  if (perfil === 'operador' || perfil === 'inspetor' || perfil === 'gestor') return true;
  return router.createUrlTree(['/login']);
};
