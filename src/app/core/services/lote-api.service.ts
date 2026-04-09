import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface LoteApi {
  id: number;
  numeroLote: string;
  dataProducao: string;
  turno: 'manha' | 'tarde' | 'noite';
  linha: string;
  quantidadeProd: number;
  quantidadeRepr: number;
  status: string;
  observacoes?: string | null;
  abertoEm?: string;
  encerradoEm?: string | null;
  produto?: {
    id: number;
    codigo: string;
    nome: string;
    linha?: string;
  };
  operador?: {
    id: number;
    nome: string;
    email: string;
  };
  insumos?: Array<{
    id: number;
    nomeInsumo: string;
    codigoInsumo?: string | null;
    loteInsumo?: string | null;
    quantidade: number;
    unidade: string;
  }>;
  inspecao?: {
    id: number;
    resultado: string;
    quantidadeRepr: number;
    descricaoDesvio?: string | null;
    inspecionadoEm: string;
    inspetor?: {
      id: number;
      nome: string;
      email: string;
    } | null;
  } | null;
}

export interface CreateLoteApiPayload {
  produtoId: number;
  dataProducao: string;
  turno: 'manha' | 'tarde' | 'noite';
  operadorId: number;
  linha: string;
  quantidadeProd: number;
  observacoes?: string | null;
}

@Injectable({ providedIn: 'root' })
export class LoteApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  async list(filters?: {
    numeroLote?: string;
    produtoId?: string;
    status?: string;
    dataInicio?: string;
    dataFim?: string;
  }): Promise<LoteApi[]> {
    let params = new HttpParams();

    if (filters?.numeroLote) {
      params = params.set('numeroLote', filters.numeroLote);
    }

    if (filters?.produtoId) {
      params = params.set('produtoId', filters.produtoId);
    }

    if (filters?.status) {
      params = params.set('status', filters.status);
    }

    if (filters?.dataInicio) {
      params = params.set('dataInicio', filters.dataInicio);
    }

    if (filters?.dataFim) {
      params = params.set('dataFim', filters.dataFim);
    }

    return await firstValueFrom(
      this.http.get<LoteApi[]>(`${this.apiUrl}/lotes`, { params })
    );
  }

  async getById(id: string): Promise<LoteApi> {
    return await firstValueFrom(
      this.http.get<LoteApi>(`${this.apiUrl}/lotes/${id}`)
    );
  }

  async updateStatus(id: string, status: string): Promise<LoteApi> {
    return await firstValueFrom(
      this.http.patch<LoteApi>(`${this.apiUrl}/lotes/${id}/status`, { status })
    );
  }
  async create(payload: CreateLoteApiPayload): Promise<LoteApi> {
    return await firstValueFrom(
      this.http.post<LoteApi>(`${this.apiUrl}/lotes`, payload)
    );
  }
}