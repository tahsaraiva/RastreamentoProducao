import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface UsuarioApi {
  id: number;
  nome: string;
  email: string;
  perfil: 'operador' | 'inspetor' | 'gestor';
}

export interface CreateUsuarioDTO {
  nome: string;
  email: string;
  senha: string;
  perfil: 'operador' | 'inspetor' | 'gestor';
}

@Injectable({ providedIn: 'root' })
export class UsuarioApiService {
  private http = inject(HttpClient);
  private base = `${environment.apiUrl}/usuarios`;

  list(): Promise<UsuarioApi[]> {
    return firstValueFrom(this.http.get<UsuarioApi[]>(this.base));
  }

  create(dto: CreateUsuarioDTO): Promise<UsuarioApi> {
    return firstValueFrom(this.http.post<UsuarioApi>(this.base, dto));
  }

  update(id: number, dto: Partial<CreateUsuarioDTO>): Promise<UsuarioApi> {
    return firstValueFrom(this.http.put<UsuarioApi>(`${this.base}/${id}`, dto));
  }

  remove(id: number): Promise<void> {
    return firstValueFrom(this.http.delete<void>(`${this.base}/${id}`));
  }
}
