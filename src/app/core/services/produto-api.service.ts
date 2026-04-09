import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface ProdutoApi {
  id: number;
  codigo: string;
  nome: string;
  descricao?: string | null;
  linha: string;
  ativo: boolean;
}

export interface CreateProdutoApiPayload {
  codigo: string;
  nome: string;
  descricao?: string | null;
  linha: string;
}

export interface UpdateProdutoApiPayload {
  codigo?: string;
  nome?: string;
  descricao?: string | null;
  linha?: string;
  ativo?: boolean;
}

@Injectable({ providedIn: 'root' })
export class ProdutoApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  async list(): Promise<ProdutoApi[]> {
    return await firstValueFrom(
      this.http.get<ProdutoApi[]>(`${this.apiUrl}/produtos`)
    );
  }

  async create(payload: CreateProdutoApiPayload): Promise<ProdutoApi> {
    return await firstValueFrom(
      this.http.post<ProdutoApi>(`${this.apiUrl}/produtos`, payload)
    );
  }

  async update(id: string, payload: UpdateProdutoApiPayload): Promise<ProdutoApi> {
    return await firstValueFrom(
      this.http.patch<ProdutoApi>(`${this.apiUrl}/produtos/${id}`, payload)
    );
  }

  async inativar(id: string): Promise<ProdutoApi> {
    return await firstValueFrom(
      this.http.delete<ProdutoApi>(`${this.apiUrl}/produtos/${id}`)
    );
  }

  async reativar(id: string): Promise<ProdutoApi> {
    return await this.update(id, { ativo: true });
  }
}