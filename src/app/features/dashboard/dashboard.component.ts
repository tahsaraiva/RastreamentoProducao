import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardApiService } from '../../core/services/dashboard-api.service';

interface DashboardMetricsView {
  lotesHoje: number;
  unidadesHoje: number;
  taxaAprovacao: number;
  aguardandoInspecao: number;
}

interface LoteView {
  id: string;
  numero: string;
  dataProd: Date;
  status: string;
  operador: string;
  produto: {
    id: string;
    nome: string;
    codigo: string;
  };
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  templateUrl: './dashboard.component.html',
})
export class DashboardComponent implements OnInit {
  private dashboardApi = inject(DashboardApiService);

  loading = signal(true);
  error = signal<string | null>(null);

  metrics = signal<DashboardMetricsView>({
    lotesHoje: 0,
    unidadesHoje: 0,
    taxaAprovacao: 0,
    aguardandoInspecao: 0,
  });

  lotesRecentes = signal<LoteView[]>([]);

  async ngOnInit(): Promise<void> {
    try {
      this.loading.set(true);
      this.error.set(null);

      const response = await this.dashboardApi.getDashboard();

      this.metrics.set({
        lotesHoje: response.indicadores.lotesProduzidosHoje,
        unidadesHoje: response.indicadores.unidadesProduzidasHoje,
        taxaAprovacao: response.indicadores.taxaAprovacaoMes,
        aguardandoInspecao: response.indicadores.lotesAguardandoInspecao,
      });

      this.lotesRecentes.set(
        response.ultimosLotes.map((lote) => ({
          id: String(lote.id),
          numero: lote.numeroLote,
          dataProd: new Date(lote.dataProducao),
          status: lote.status,
          operador: lote.operador.nome,
          produto: {
            id: String(lote.produto.id),
            nome: lote.produto.nome,
            codigo: lote.produto.codigo,
          },
        }))
      );
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível carregar o dashboard.'
      );
    } finally {
      this.loading.set(false);
    }
  }
}