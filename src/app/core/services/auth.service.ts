import { Injectable, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';
import { User, AuthState } from '../../shared/models';

interface LoginResponse {
  usuario: {
    id: number;
    nome: string;
    email: string;
    perfil: 'operador' | 'inspetor' | 'gestor';
  };
  accessToken: string;
  refreshToken: string;
}

interface RefreshResponse {
  accessToken: string;
  refreshToken: string;
}

@Injectable({ providedIn: 'root' })
export class AuthService {
  private router = inject(Router);
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  private _state = signal<AuthState>({
    user: null,
    token: null,
    refreshToken: null,
    isAuthenticated: false,
  });

  readonly user = computed(() => this._state().user);
  readonly token = computed(() => this._state().token);
  readonly refreshToken = computed(() => this._state().refreshToken);
  readonly isAuth = computed(() => this._state().isAuthenticated);
  readonly perfil = computed(() => this._state().user?.perfil ?? null);

  constructor() {
    this._restoreSession();
  }

  async login(email: string, senha: string): Promise<{ success: boolean; message?: string }> {
    try {
      const response = await firstValueFrom(
        this.http.post<LoginResponse>(`${this.apiUrl}/auth/login`, {
          email,
          senha,
        })
      );

      const user: User = {
        id: String(response.usuario.id),
        nome: response.usuario.nome,
        email: response.usuario.email,
        perfil: response.usuario.perfil,
      };

      this._state.set({
        user,
        token: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: true,
      });

      sessionStorage.setItem('bt_token', response.accessToken);
      sessionStorage.setItem('bt_refresh', response.refreshToken);
      sessionStorage.setItem('bt_user', JSON.stringify(user));

      return { success: true };
    } catch (error: any) {
      return {
        success: false,
        message: error?.error?.message ?? 'E-mail ou senha inválidos.',
      };
    }
  }

  async logout(callApi = true): Promise<void> {
    try {
      if (callApi && this.token()) {
        await firstValueFrom(this.http.post(`${this.apiUrl}/auth/logout`, {}));
      }
    } catch {
    } finally {
      this._state.set({
        user: null,
        token: null,
        refreshToken: null,
        isAuthenticated: false,
      });
      sessionStorage.clear();
      this.router.navigate(['/login']);
    }
  }

  async tryRefresh(): Promise<boolean> {
    const refreshToken = this._state().refreshToken;

    if (!refreshToken) {
      return false;
    }

    try {
      const response = await firstValueFrom(
        this.http.post<RefreshResponse>(`${this.apiUrl}/auth/refresh`, {
          refreshToken,
        })
      );

      const currentUser = this._state().user;

      this._state.set({
        user: currentUser,
        token: response.accessToken,
        refreshToken: response.refreshToken,
        isAuthenticated: !!currentUser,
      });

      sessionStorage.setItem('bt_token', response.accessToken);
      sessionStorage.setItem('bt_refresh', response.refreshToken);

      return true;
    } catch {
      return false;
    }
  }

  private _restoreSession(): void {
    const token = sessionStorage.getItem('bt_token');
    const refreshToken = sessionStorage.getItem('bt_refresh');
    const userJson = sessionStorage.getItem('bt_user');

    if (token && userJson) {
      try {
        const user: User = JSON.parse(userJson);
        this._state.set({
          user,
          token,
          refreshToken,
          isAuthenticated: true,
        });
      } catch {
        sessionStorage.clear();
      }
    }
  }
}