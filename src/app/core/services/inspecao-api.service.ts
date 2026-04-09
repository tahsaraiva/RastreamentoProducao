import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface CreateInspecaoApiPayload {
  resultado: 'aprovado' | 'aprovado_restricao' | 'reprovado';
  quantidadeRepr?: number;
  descricaoDesvio?: string | null;
}

export interface InspecaoApiResponse {
  id: number;
  resultado: 'aprovado' | 'aprovado_restricao' | 'reprovado';
  quantidadeRepr: number;
  descricaoDesvio?: string | null;
  inspecionadoEm: string;
}

@Injectable({ providedIn: 'root' })
export class InspecaoApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  async create(loteId: string, payload: CreateInspecaoApiPayload): Promise<InspecaoApiResponse> {
    return await firstValueFrom(
      this.http.post<InspecaoApiResponse>(`${this.apiUrl}/lotes/${loteId}/inspecao`, payload)
    );
  }
}