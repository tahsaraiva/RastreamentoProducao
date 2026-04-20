import { Component, OnInit, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { LoteApiService } from '../../core/services/lote-api.service';
import {
  CreateInspecaoApiPayload,
  InspecaoApiService,
} from '../../core/services/inspecao-api.service';

interface LoteInspecaoView {
  id: string;
  numero: string;
  produtoNome: string;
  status: string;
  dataProd: Date;
  linha: string;
  qtdProduzida: number;
}

type ResultadoInspecao = 'aprovado' | 'aprovado_restricao' | 'reprovado';

@Component({
  selector: 'app-inspecao',
  standalone: true,
  imports: [CommonModule, FormsModule, RouterLink],
  templateUrl: './inspecao.component.html',
})
export class InspecaoComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private router = inject(Router);
  private loteApi = inject(LoteApiService);
  private inspecaoApi = inject(InspecaoApiService);

  loteId = '';
  loading = signal(true);
  saving = signal(false);
  error = signal<string | null>(null);
  success = signal<string | null>(null);

  lote = signal<LoteInspecaoView | null>(null);

  resultadoSelecionado = signal<ResultadoInspecao | null>(null);

  form = {
    resultado: 'aprovado' as ResultadoInspecao,
    quantidadeRepr: 0,
    descricaoDesvio: '',
    observacoes: '',
  };

  resultados: { value: ResultadoInspecao; label: string; icon: string; style: string; styleSelected: string }[] = [
    {
      value: 'aprovado',
      label: 'Aprovado',
      icon: '✅',
      style: 'border:1px solid #334155; background:transparent;',
      styleSelected: 'border:1px solid #2E7D32; background:rgba(46,125,50,0.15);',
    },
    {
      value: 'aprovado_restricao',
      label: 'Aprovado com Restrição',
      icon: '⚠️',
      style: 'border:1px solid #334155; background:transparent;',
      styleSelected: 'border:1px solid #F57C00; background:rgba(245,124,0,0.15);',
    },
    {
      value: 'reprovado',
      label: 'Reprovado',
      icon: '❌',
      style: 'border:1px solid #334155; background:transparent;',
      styleSelected: 'border:1px solid #C62828; background:rgba(198,40,40,0.15);',
    },
  ];

  async ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (!id) {
      this.error.set('ID do lote não informado.');
      this.loading.set(false);
      return;
    }
    this.loteId = id;
    await this.loadLote();
  }

  async loadLote() {
    try {
      this.loading.set(true);
      this.error.set(null);
      const response = await this.loteApi.getById(this.loteId);
      this.lote.set({
        id: String(response.id),
        numero: response.numeroLote,
        produtoNome: response.produto?.nome ?? '—',
        status: response.status,
        dataProd: new Date(response.dataProducao),
        linha: response.linha,
        qtdProduzida: response.quantidadeProd,
      });
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível carregar os dados do lote.'
      );
    } finally {
      this.loading.set(false);
    }
  }

  get canInspect() {
    return this.lote()?.status === 'aguardando_inspecao';
  }

  get precisaDesvio() {
    return this.form.resultado !== 'aprovado';
  }

  selecionarResultado(valor: ResultadoInspecao) {
    if (!this.canInspect || this.saving()) return;
    this.form.resultado = valor;
    this.resultadoSelecionado.set(valor);
    if (valor === 'aprovado') {
      this.form.descricaoDesvio = '';
      this.form.quantidadeRepr = 0;
    }
  }

  getCardStyle(valor: ResultadoInspecao): string {
    const r = this.resultados.find(r => r.value === valor);
    if (!r) return '';
    return this.form.resultado === valor ? r.styleSelected : r.style;
  }

  async salvarInspecao() {
    if (!this.canInspect) {
      this.error.set('Somente lotes aguardando inspeção podem ser inspecionados.');
      return;
    }

    if (this.precisaDesvio && !this.form.descricaoDesvio.trim()) {
      this.error.set('A descrição do desvio é obrigatória para resultados não aprovados.');
      return;
    }

    try {
      this.saving.set(true);
      this.error.set(null);
      this.success.set(null);

      const payload: CreateInspecaoApiPayload = {
        resultado: this.form.resultado,
        quantidadeRepr: Number(this.form.quantidadeRepr || 0),
        descricaoDesvio: this.precisaDesvio ? this.form.descricaoDesvio.trim() : null,
      };

      await this.inspecaoApi.create(this.loteId, payload);
      this.success.set('Inspeção registrada com sucesso.');
      setTimeout(() => {
        this.router.navigate(['/app/lotes', this.loteId]);
      }, 800);
    } catch (error: any) {
      this.error.set(
        error?.error?.message ?? 'Não foi possível registrar a inspeção.'
      );
    } finally {
      this.saving.set(false);
    }
  }
}
