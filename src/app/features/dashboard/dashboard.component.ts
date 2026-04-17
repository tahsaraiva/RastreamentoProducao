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
  diaSelecionado = signal<string | null>(null);
  lotesDoDia = signal<LoteView[]>([]);

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

  private getUltimos7Dias(): { label: string; dateStr: string }[] {
    const dias = [];
    for (let i = 6; i >= 0; i--) {
      const d = new Date();
      d.setDate(d.getDate() - i);
      const dd = String(d.getDate()).padStart(2, '0');
      const mm = String(d.getMonth() + 1).padStart(2, '0');
      const diaSemana = ['Dom', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb'][d.getDay()];
      dias.push({
        label: `${diaSemana} ${dd}/${mm}`,
        dateStr: d.toDateString(),
      });
    }
    return dias;
  }

  private getLotesPorDia(): number[] {
    const lotes = this.lotesRecentes();
    return this.getUltimos7Dias().map(dia =>
      lotes.filter(l => l.dataProd.toDateString() === dia.dateStr).length
    );
  }

  private getUltimos6Meses(): string[] {
    const meses = ['Jan', 'Fev', 'Mar', 'Abr', 'Mai', 'Jun', 'Jul', 'Ago', 'Set', 'Out', 'Nov', 'Dez'];
    const labels: string[] = [];
    for (let i = 5; i >= 0; i--) {
      const d = new Date();
      d.setMonth(d.getMonth() - i);
      labels.push(`${meses[d.getMonth()]}/${String(d.getFullYear()).slice(2)}`);
    }
    return labels;
  }

  selecionarDia(label: string, dateStr: string) {
    if (this.diaSelecionado() === label) {
      this.diaSelecionado.set(null);
      this.lotesDoDia.set([]);
      return;
    }
    this.diaSelecionado.set(label);
    const lotesFiltrados = this.lotesRecentes().filter(
      l => l.dataProd.toDateString() === dateStr
    );
    this.lotesDoDia.set(lotesFiltrados);
  }

  limparDiaSelecionado() {
    this.diaSelecionado.set(null);
    this.lotesDoDia.set([]);
  }

  initCharts() {
    const gridColor   = '#334155';
    const tickColor   = '#94A3B8';
    const legendColor = '#CBD5E1';
    const dias7 = this.getUltimos7Dias();

    const barChartInstance = new Chart(this.barChartRef.nativeElement, {
  type: 'bar',
  data: {
    labels: dias7.map(d => d.label),
    datasets: [{
      label: 'Lotes produzidos',
      data: this.getLotesPorDia(),
      backgroundColor: dias7.map(() => 'rgba(0,180,216,0.7)'),
      borderColor: '#00B4D8',
      borderWidth: 1,
      borderRadius: 8,
    }],
  },
  options: {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: { labels: { color: legendColor } },
      tooltip: {
        callbacks: {
          footer: () => ['Clique para ver os lotes'],
        }
      }
    },
    scales: {
      y: {
        grid: { color: gridColor },
        ticks: { color: tickColor, stepSize: 1 },
        beginAtZero: true,
      },
      x: { ticks: { color: tickColor } },
    },
  },
});

// Adiciona o click separado para evitar erro de tipagem
this.barChartRef.nativeElement.addEventListener('click', (event: MouseEvent) => {
  const points = barChartInstance.getElementsAtEventForMode(
    event,
    'nearest',
    { intersect: true },
    false
  );

  if (points.length > 0) {
    const index = points[0].index;
    const dia = dias7[index];
    this.selecionarDia(dia.label, dia.dateStr);

    const dataset = barChartInstance.data.datasets[0] as any;
    dataset.backgroundColor = dias7.map((_, i) =>
      i === index ? 'rgba(0,180,216,1)' : 'rgba(0,180,216,0.4)'
    );
    barChartInstance.update();
  }
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
        labels: this.getUltimos6Meses(),
        datasets: [{
          label: 'Taxa de Aprovação (%)',
          data: [88, 91, 92, 93, 94, Math.round(this.metrics().taxaAprovacao)],
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
