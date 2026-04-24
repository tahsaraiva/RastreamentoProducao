import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { firstValueFrom } from 'rxjs';
import { environment } from '../../../environments/environment';

export interface DashboardApiResponse {
  indicadores: {
    lotesProduzidosHoje: number;
    unidadesProduzidasHoje: number;
    taxaAprovacaoMes: number;
    lotesAguardandoInspecao: number;
    totalLotes: number;
    emProducao: number;
    aprovados: number;
    aprovadosRestricao: number;
    reprovados: number;
    taxaPorStatusMes: {
      aprovado: number;
      aprovado_restricao: number;
      reprovado: number;
      aguardando_inspecao: number;
      em_producao: number;
    };
  };
  ultimosLotes: Array<{
    id: number;
    numeroLote: string;
    dataProducao: string;
    status: string;
    produto: { id: number; nome: string; codigo: string };
    operador: { id: number; nome: string; email: string };
  }>;
}

@Injectable({ providedIn: 'root' })
export class DashboardApiService {
  private http = inject(HttpClient);
  private apiUrl = environment.apiUrl;

  async getDashboard(): Promise<DashboardApiResponse> {
    return await firstValueFrom(
      this.http.get<DashboardApiResponse>(`${this.apiUrl}/dashboard`)
    );
  }
}
