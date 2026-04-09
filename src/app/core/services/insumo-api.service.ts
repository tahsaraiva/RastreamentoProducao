import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface InsumoApi {
  id: number;
  nomeInsumo: string;
  codigoInsumo?: string | null;
  loteInsumo?: string | null;
  quantidade: number;
  unidade: string;
}

export interface CreateInsumoApiPayload {
  nomeInsumo: string;
  codigoInsumo?: string | null;
  loteInsumo?: string | null;
  quantidade: number;
  unidade: string;
}

@Injectable({ providedIn: 'root' })
export class InsumoApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  async listByLote(loteId: string): Promise<InsumoApi[]> {
    return await firstValueFrom(
      this.http.get<InsumoApi[]>(`${this.apiUrl}/lotes/${loteId}/insumos`)
    );
  }

  async create(loteId: string, payload: CreateInsumoApiPayload): Promise<InsumoApi> {
    return await firstValueFrom(
      this.http.post<InsumoApi>(`${this.apiUrl}/lotes/${loteId}/insumos`, payload)
    );
  }

  async remove(loteId: string, insumoId: string): Promise<{ message: string }> {
    return await firstValueFrom(
      this.http.delete<{ message: string }>(
        `${this.apiUrl}/lotes/${loteId}/insumos/${insumoId}`
      )
    );
  }
}