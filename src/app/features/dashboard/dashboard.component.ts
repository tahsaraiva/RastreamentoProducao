import { Component, OnInit, AfterViewInit, inject, signal, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardApiService } from '../../core/services/dashboard-api.service';
import { Chart, registerables } from 'chart.js';

Chart.register(...registerables);

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
export class DashboardComponent implements OnInit, AfterViewInit {
  private dashboardApi = inject(DashboardApiService);

  @ViewChild('barChart')      barChartRef!:      ElementRef<HTMLCanvasElement>;
  @ViewChild('doughnutChart') doughnutChartRef!: ElementRef<HTMLCanvasElement>;
  @ViewChild('lineChart')     lineChartRef!:     ElementRef<HTMLCanvasElement>;

  now = new Date();
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

  ngAfterViewInit() {
    setTimeout(() => this.initCharts(), 300);
  }

  initCharts() {
    const gridColor   = '#334155';
    const tickColor   = '#94A3B8';
    const legendColor = '#CBD5E1';

    new Chart(this.barChartRef.nativeElement, {
      type: 'bar',
      data: {
        labels: ['Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'],
        datasets: [{
          label: 'Unidades Produzidas',
          data: [1250, 1480, 1620, 1890, 2100, 1950, 1430],
          backgroundColor: 'rgba(0,180,216,0.7)',
          borderColor: '#00B4D8',
          borderWidth: 1,
          borderRadius: 8,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: legendColor } } },
        scales: {
          y: { grid: { color: gridColor }, ticks: { color: tickColor } },
          x: { ticks: { color: tickColor } },
        },
      },
    });

    const statusCounts = this.lotesRecentes().reduce((acc, l) => {
      acc[l.status] = (acc[l.status] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    new Chart(this.doughnutChartRef.nativeElement, {
      type: 'doughnut',
      data: {
        labels: ['Aprovados', 'Aguardando', 'Em Produção', 'Restrição', 'Reprovados'],
        datasets: [{
          data: [
            statusCounts['aprovado'] || 0,
            statusCounts['aguardando_inspecao'] || 0,
            statusCounts['em_producao'] || 0,
            statusCounts['aprovado_com_restricao'] || statusCounts['aprovado_restricao'] || 0,
            statusCounts['reprovado'] || 0,
          ],
          backgroundColor: ['#2E7D32', '#F9A825', '#00B4D8', '#FB8C00', '#C62828'],
          borderWidth: 0,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { position: 'bottom', labels: { color: legendColor } } },
      },
    });

    new Chart(this.lineChartRef.nativeElement, {
      type: 'line',
      data: {
        labels: ['Out/25', 'Nov/25', 'Dez/25', 'Jan/26', 'Fev/26', 'Mar/26'],
        datasets: [{
          label: 'Taxa de Aprovação (%)',
          data: [88, 91, 92, 93, 94, 94.5],
          borderColor: '#00B4D8',
          backgroundColor: 'rgba(0,180,216,0.1)',
          fill: true,
          tension: 0.4,
          pointBackgroundColor: '#00B4D8',
          pointBorderColor: '#1A5F7A',
          pointRadius: 5,
        }],
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: { legend: { labels: { color: legendColor } } },
        scales: {
          y: {
            min: 80, max: 100,
            grid: { color: gridColor },
            ticks: { color: tickColor, callback: (v) => v + '%' },
          },
          x: { ticks: { color: tickColor } },
        },
      },
    });
  }

  getStatusLabel(s: string): string {
    const map: Record<string, string> = {
      em_producao: 'Em produção',
      aguardando_inspecao: 'Aguardando inspeção',
      aprovado: 'Aprovado',
      aprovado_com_restricao: 'Aprovado c/ restrição',
      aprovado_restricao: 'Aprovado c/ restrição',
      reprovado: 'Reprovado',
    };
    return map[s] ?? s;
  }

  getStatusCss(s: string): string {
    const map: Record<string, string> = {
      em_producao: 'badge-em-producao',
      aguardando_inspecao: 'badge-aguardando-inspecao',
      aprovado: 'badge-aprovado',
      aprovado_com_restricao: 'badge-aprovado-com-restricao',
      aprovado_restricao: 'badge-aprovado-com-restricao',
      reprovado: 'badge-reprovado',
    };
    return map[s] ?? 'badge';
  }
}
