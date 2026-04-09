import { Injectable, inject } from '@angular/core';
import { HttpClient, HttpParams } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface RastreabilidadePorLoteApiResponse {
  tipoConsulta: 'lote';
  lote: {
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
    produto: {
      id: number;
      codigo: string;
      nome: string;
      linha?: string;
    };
    operador: {
      id: number;
      nome: string;
      email: string;
      perfil?: string;
    };
    insumos: Array<{
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
  };
}

export interface RastreabilidadePorInsumoApiResponse {
  tipoConsulta: 'insumo';
  termoBuscado: string;
  totalLotesAfetados: number;
  lotesAfetados: Array<{
    id: number;
    numeroLote: string;
    dataProducao: string;
    status: string;
    linha: string;
    quantidadeProd: number;
    produto: {
      id: number;
      codigo: string;
      nome: string;
    };
    operador: {
      id: number;
      nome: string;
    };
    insumosCorrespondentes: Array<{
      id: number;
      nomeInsumo: string;
      codigoInsumo?: string | null;
      loteInsumo?: string | null;
      quantidade: number;
      unidade: string;
    }>;
  }>;
}

export type RastreabilidadeApiResponse =
  | RastreabilidadePorLoteApiResponse
  | RastreabilidadePorInsumoApiResponse;

@Injectable({ providedIn: 'root' })
export class RastreabilidadeApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  async buscarPorLote(numeroLote: string): Promise<RastreabilidadePorLoteApiResponse> {
    const params = new HttpParams().set('lote', numeroLote);

    return await firstValueFrom(
      this.http.get<RastreabilidadePorLoteApiResponse>(
        `${this.apiUrl}/rastreabilidade`,
        { params }
      )
    );
  }

  async buscarPorInsumo(termo: string): Promise<RastreabilidadePorInsumoApiResponse> {
    const params = new HttpParams().set('insumo', termo);

    return await firstValueFrom(
      this.http.get<RastreabilidadePorInsumoApiResponse>(
        `${this.apiUrl}/rastreabilidade`,
        { params }
      )
    );
  }
}