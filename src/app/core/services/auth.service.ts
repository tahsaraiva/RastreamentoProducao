import { Injectable, signal, computed } from '@angular/core';
import { Router } from '@angular/router';
import { User, AuthState } from '../../shared/models';

const MOCK_CREDENTIALS = [
  { email: 'admin@rastreamento.com',    senha: '123456', userId: 'u1' },
  { email: 'gestor@rastreamento.com',   senha: '123456', userId: 'u2' },
  { email: 'operador@rastreamento.com', senha: '123456', userId: 'u3' },
];

const MOCK_USERS: User[] = [
  { id: 'u1', nome: 'Carlos Mendonça', email: 'admin@rastreamento.com',    perfil: 'admin' },
  { id: 'u2', nome: 'Ana Lima',        email: 'gestor@rastreamento.com',   perfil: 'gestor' },
  { id: 'u3', nome: 'Roberto Silva',   email: 'operador@rastreamento.com', perfil: 'operador' },
];

@Injectable({ providedIn: 'root' })
export class AuthService {
  private _state = signal<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
  });

  readonly user   = computed(() => this._state().user);
  readonly token  = computed(() => this._state().token);
  readonly isAuth = computed(() => this._state().isAuthenticated);
  readonly perfil = computed(() => this._state().user?.perfil ?? null);

  constructor(private router: Router) {
    this._restoreSession();
  }

  login(email: string, senha: string): Promise<{ success: boolean; message?: string }> {
    return new Promise(resolve => {
      setTimeout(() => {
        const cred = MOCK_CREDENTIALS.find(c => c.email === email && c.senha === senha);
        if (!cred) {
          resolve({ success: false, message: 'E-mail ou senha inválidos.' });
          return;
        }
        const user = MOCK_USERS.find(u => u.id === cred.userId)!;
        const token = `mock-jwt-${btoa(email)}-${Date.now()}`;
        this._state.set({ user, token, isAuthenticated: true });
        sessionStorage.setItem('bt_token', token);
        sessionStorage.setItem('bt_user', JSON.stringify(user));
        resolve({ success: true });
      }, 600);
    });
  }

  logout(): void {
    this._state.set({ user: null, token: null, isAuthenticated: false });
    sessionStorage.clear();
    this.router.navigate(['/login']);
  }

  private _restoreSession(): void {
    const token = sessionStorage.getItem('bt_token');
    const userJson = sessionStorage.getItem('bt_user');
    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this._state.set({ user, token, isAuthenticated: true });
      } catch {
        sessionStorage.clear();
      }
    }
  }
}
